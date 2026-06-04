package com.campus.lostfound.service;

import com.campus.lostfound.dto.request.CreateItemRequest;
import com.campus.lostfound.dto.request.DisposeItemRequest;
import com.campus.lostfound.dto.request.UpdateItemStatusRequest;
import com.campus.lostfound.dto.response.PagedResponse;
import com.campus.lostfound.model.*;
import com.campus.lostfound.util.DateUtils;
import com.campus.lostfound.util.IdGenerator;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Service layer encapsulating all business logic for items, categories,
 * history, and statistics. Uses reactive MongoDB operations with BSON native Dates.
 */
public class ItemService {

    private static final Logger logger = LoggerFactory.getLogger(ItemService.class);
    private static final String LOST_ITEMS = "lost_items";
    private static final String FOUND_ITEMS = "found_items";
    private static final String CATEGORIES = "categories";
    private static final String DISPOSED_ITEMS = "disposed_items";
    private static final String AUDIT_LOGS = "audit_logs";

    private final MongoClient mongoClient;

    public ItemService(MongoClient mongoClient) {
        this.mongoClient = mongoClient;
    }

    // --- Helper methods for Date standardization ---

    private JsonObject toBsonDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        return new JsonObject().put("$date", dateStr);
    }

    private void convertBsonDatesToStrings(JsonObject doc) {
        if (doc == null) return;
        
        flattenDateField(doc, "dateFound");
        flattenDateField(doc, "reportedAt");
        flattenDateField(doc, "foundAt");
        flattenDateField(doc, "lastUpdated");
        flattenDateField(doc, "deletedAt");
        flattenDateField(doc, "disposedDate");
        flattenDateField(doc, "reportedDate");
        flattenDateField(doc, "createdAt");
        
        JsonObject returnedTo = doc.getJsonObject("returnedTo");
        if (returnedTo != null) {
            flattenDateField(returnedTo, "claimedDate");
            flattenDateField(returnedTo, "returnedDate");
        }
    }

    private void flattenDateField(JsonObject doc, String key) {
        Object val = doc.getValue(key);
        if (val == null) return;
        if (val instanceof java.time.Instant) {
            doc.put(key, val.toString());
        } else if (val instanceof java.util.Date date) {
            doc.put(key, date.toInstant().toString());
        } else if (val instanceof JsonObject json && json.containsKey("$date")) {
            doc.put(key, json.getString("$date"));
        }
    }

    // ─── Lost Items ────────────────────────────────────────────────────

    public Future<PagedResponse> getLostItems(int page, int pageSize, String search,
                                               String location, String countdownFilter,
                                               String sort, String direction) {
        JsonObject query = buildItemQuery(search, location, countdownFilter);
        query.put("isDeleted", false);

        String sortField = resolveSortField(sort, "reportedAt");
        int sortDir = "asc".equalsIgnoreCase(direction) ? 1 : -1;

        return mongoClient.count(LOST_ITEMS, query).compose(total -> {
            FindOptions options = new FindOptions()
                    .setSkip((page - 1) * pageSize)
                    .setLimit(pageSize)
                    .setSort(new JsonObject().put(sortField, sortDir));
            return mongoClient.findWithOptions(LOST_ITEMS, query, options)
                    .map(docs -> {
                        docs.forEach(this::convertBsonDatesToStrings);
                        return new PagedResponse(docs, page, pageSize, total);
                    });
        });
    }

    public Future<JsonObject> getLostItemById(String id) {
        return mongoClient.findOne(LOST_ITEMS,
                new JsonObject().put("_id", id).put("isDeleted", false), null)
                .map(doc -> {
                    if (doc == null) throw new com.campus.lostfound.exception.NotFoundException("Lost item not found");
                    convertBsonDatesToStrings(doc);
                    return doc;
                });
    }

    public Future<JsonObject> createLostItem(CreateItemRequest req) {
        return IdGenerator.nextId(mongoClient, "LOST").compose(itemId -> {
            String now = DateUtils.formatNow();
            Reporter reporter = buildReporter(req);
            LostItem item = new LostItem();
            item.setItemId(itemId);
            item.setName(req.getName());
            item.setDescription(req.getDescription());
            item.setCategory(req.getCategory());
            item.setLocation(req.getLocation());
            item.setCollectFrom(req.getCollectFrom());
            item.setDateFound(req.getDate());
            item.setStatus("Not Returned");
            item.setImage(req.getImage());
            item.setReporter(reporter);
            item.setReportedAt(now);
            item.setLastUpdated(now);
            item.setDeleted(false);

            JsonObject doc = item.toJson();
            doc.remove("_id");
            
            // Map string dates to BSON Date types
            doc.put("dateFound", toBsonDate(item.getDateFound()));
            doc.put("reportedAt", toBsonDate(item.getReportedAt()));
            doc.put("lastUpdated", toBsonDate(item.getLastUpdated()));

            return mongoClient.insert(LOST_ITEMS, doc)
                    .map(insertedId -> {
                        doc.put("_id", insertedId);
                        convertBsonDatesToStrings(doc);
                        return doc;
                    });
        });
    }

    public Future<JsonObject> updateLostItem(String id, UpdateItemStatusRequest req) {
        String now = DateUtils.formatNow();
        JsonObject update = new JsonObject();
        update.put("status", req.getStatus());
        update.put("lastUpdated", toBsonDate(now));

        if ("Returned".equals(req.getStatus())) {
            JsonObject returnedTo = new JsonObject()
                    .put("studentName", req.getStudentName())
                    .put("rollNo", req.getRollNo())
                    .put("claimedDate", toBsonDate(now));
            update.put("returnedTo", returnedTo);
        }

        return mongoClient.findOneAndUpdate(LOST_ITEMS,
                new JsonObject().put("_id", id).put("isDeleted", false),
                new JsonObject().put("$set", update))
                .map(doc -> {
                    if (doc == null) throw new com.campus.lostfound.exception.NotFoundException("Lost item not found");
                    doc.mergeIn(update);
                    convertBsonDatesToStrings(doc);
                    return doc;
                });
    }

    public Future<Void> deleteLostItem(String id) {
        String now = DateUtils.formatNow();
        JsonObject update = new JsonObject()
                .put("$set", new JsonObject()
                        .put("isDeleted", true)
                        .put("deletedAt", toBsonDate(now)));

        return mongoClient.updateCollection(LOST_ITEMS,
                new JsonObject().put("_id", id),
                update).map(v -> null);
    }

    // ─── Found Items ───────────────────────────────────────────────────

    public Future<PagedResponse> getFoundItems(int page, int pageSize, String search,
                                                String location, String countdownFilter,
                                                String category, String sort, String direction) {
        JsonObject query = buildItemQuery(search, location, countdownFilter);
        query.put("isDeleted", false);
        if (category != null && !category.isBlank()) {
            query.put("category", category);
        }

        String sortField = resolveSortField(sort, "foundAt");
        int sortDir = "asc".equalsIgnoreCase(direction) ? 1 : -1;

        return mongoClient.count(FOUND_ITEMS, query).compose(total -> {
            FindOptions options = new FindOptions()
                    .setSkip((page - 1) * pageSize)
                    .setLimit(pageSize)
                    .setSort(new JsonObject().put(sortField, sortDir));
            return mongoClient.findWithOptions(FOUND_ITEMS, query, options)
                    .map(docs -> {
                        docs.forEach(this::convertBsonDatesToStrings);
                        return new PagedResponse(docs, page, pageSize, total);
                    });
        });
    }

    public Future<JsonObject> getFoundItemById(String id) {
        return mongoClient.findOne(FOUND_ITEMS,
                new JsonObject().put("_id", id).put("isDeleted", false), null)
                .map(doc -> {
                    if (doc == null) throw new com.campus.lostfound.exception.NotFoundException("Found item not found");
                    convertBsonDatesToStrings(doc);
                    return doc;
                });
    }

    public Future<JsonObject> createFoundItem(CreateItemRequest req) {
        return IdGenerator.nextId(mongoClient, "FOUND").compose(itemId -> {
            String now = DateUtils.formatNow();
            FoundItem item = new FoundItem();
            item.setItemId(itemId);
            item.setName(req.getName());
            item.setDescription(req.getDescription());
            item.setCategory(req.getCategory());
            item.setLocation(req.getLocation());
            item.setCollectFrom(req.getCollectFrom());
            item.setDateFound(req.getDate());
            item.setStatus("Not Returned");
            item.setImage(req.getImage());
            item.setFoundAt(now);
            item.setLastUpdated(now);
            item.setDeleted(false);

            JsonObject doc = item.toJson();
            doc.remove("_id");
            
            // Map string dates to BSON Date types
            doc.put("dateFound", toBsonDate(item.getDateFound()));
            doc.put("foundAt", toBsonDate(item.getFoundAt()));
            doc.put("lastUpdated", toBsonDate(item.getLastUpdated()));

            return mongoClient.insert(FOUND_ITEMS, doc)
                    .map(insertedId -> {
                        doc.put("_id", insertedId);
                        convertBsonDatesToStrings(doc);
                        return doc;
                    });
        });
    }

    public Future<JsonObject> updateFoundItem(String id, UpdateItemStatusRequest req) {
        String now = DateUtils.formatNow();
        JsonObject update = new JsonObject();
        update.put("status", req.getStatus());
        update.put("lastUpdated", toBsonDate(now));

        if ("Returned".equals(req.getStatus())) {
            JsonObject returnedTo = new JsonObject()
                    .put("studentName", req.getStudentName())
                    .put("rollNo", req.getRollNo())
                    .put("phone", req.getPhone())
                    .put("email", req.getEmail())
                    .put("returnedDate", toBsonDate(req.getReturnedDate()))
                    .put("returnedTime", req.getReturnedTime())
                    .put("remarks", req.getRemarks());
            update.put("returnedTo", returnedTo);
        }

        return mongoClient.findOneAndUpdate(FOUND_ITEMS,
                new JsonObject().put("_id", id).put("isDeleted", false),
                new JsonObject().put("$set", update))
                .map(doc -> {
                    if (doc == null) throw new com.campus.lostfound.exception.NotFoundException("Found item not found");
                    doc.mergeIn(update);
                    convertBsonDatesToStrings(doc);
                    return doc;
                });
    }

    public Future<Void> deleteFoundItem(String id) {
        String now = DateUtils.formatNow();
        JsonObject update = new JsonObject()
                .put("$set", new JsonObject()
                        .put("isDeleted", true)
                        .put("deletedAt", toBsonDate(now)));

        return mongoClient.updateCollection(FOUND_ITEMS,
                new JsonObject().put("_id", id),
                update).map(v -> null);
    }

    // ─── Expired Items ─────────────────────────────────────────────────

    /**
     * Paginated + searchable expired items (found items unclaimed 60+ days).
     * Replaces the previous unbounded list — critical for scalability.
     */
    public Future<PagedResponse> getExpiredItems(int page, int pageSize, String search) {
        JsonObject query = buildExpiredQuery(search);
        return mongoClient.count(FOUND_ITEMS, query).compose(total -> {
            FindOptions options = new FindOptions()
                    .setSkip((page - 1) * pageSize)
                    .setLimit(pageSize)
                    .setSort(new JsonObject().put("dateFound", 1)); // oldest first (most urgent)
            return mongoClient.findWithOptions(FOUND_ITEMS, query, options)
                    .map(docs -> {
                        docs.forEach(doc -> {
                            convertBsonDatesToStrings(doc);
                            String dateFound = doc.getString("dateFound");
                            if (dateFound != null) {
                                doc.put("daysElapsed", DateUtils.daysElapsed(dateFound));
                            }
                        });
                        return new PagedResponse(docs, page, pageSize, total);
                    });
        });
    }

    /**
     * Builds the query for expired items with optional server-side search.
     */
    private JsonObject buildExpiredQuery(String search) {
        java.time.Instant sixtyDaysAgo = java.time.Instant.now().minus(60, java.time.temporal.ChronoUnit.DAYS);
        JsonObject query = new JsonObject()
                .put("status", "Not Returned")
                .put("isDeleted", false)
                .put("dateFound", new JsonObject().put("$lte", new JsonObject().put("$date", sixtyDaysAgo.toString())));
        if (search != null && !search.isBlank()) {
            String escaped = escapeRegex(search);
            JsonObject regex = new JsonObject().put("$regex", escaped).put("$options", "i");
            query.put("$or", new JsonArray()
                    .add(new JsonObject().put("name", regex))
                    .add(new JsonObject().put("location", regex)));
        }
        return query;
    }

    public Future<JsonObject> disposeItem(String id, String type, DisposeItemRequest req) {
        String collection = "Found".equals(type) ? FOUND_ITEMS : LOST_ITEMS;
        String now = DateUtils.formatNow();

        return mongoClient.findOne(collection,
                new JsonObject().put("_id", id).put("isDeleted", false), null)
                .compose(doc -> {
                    if (doc == null) {
                        return Future.failedFuture(new com.campus.lostfound.exception.NotFoundException("Item not found"));
                    }

                    convertBsonDatesToStrings(doc);

                    // Create disposed record
                    DisposedItem disposed = new DisposedItem();
                    disposed.setOriginalItemId(id);
                    disposed.setName(doc.getString("name"));
                    disposed.setType(type);
                    disposed.setReportedDate(doc.getString("dateFound"));
                    disposed.setLocation(doc.getString("location"));
                    disposed.setDisposalLocation(req.getDisposalLocation());
                    disposed.setDonatedTo(req.getDonatedTo());
                    disposed.setDisposedDate(now);
                    disposed.setNotes(req.getNotes());
                    disposed.setCreatedAt(now);

                    if (doc.getJsonObject("reporter") != null) {
                        disposed.setReporter(new Reporter(doc.getJsonObject("reporter")));
                    }

                    JsonObject disposedDoc = disposed.toJson();
                    disposedDoc.remove("_id");
                    
                    disposedDoc.put("reportedDate", toBsonDate(disposed.getReportedDate()));
                    disposedDoc.put("disposedDate", toBsonDate(disposed.getDisposedDate()));
                    disposedDoc.put("createdAt", toBsonDate(disposed.getCreatedAt()));

                    return mongoClient.insert(DISPOSED_ITEMS, disposedDoc)
                            .compose(insertedId -> {
                                disposedDoc.put("_id", insertedId);
                                
                                JsonObject deleteUpdate = new JsonObject()
                                        .put("$set", new JsonObject()
                                                .put("isDeleted", true)
                                                .put("deletedAt", toBsonDate(now)));
                                return mongoClient.updateCollection(collection,
                                        new JsonObject().put("_id", id), deleteUpdate);
                            })
                            .map(v -> {
                                convertBsonDatesToStrings(disposedDoc);
                                return disposedDoc;
                            });
                });
    }

    // ─── Categories ────────────────────────────────────────────────────

    public Future<List<JsonObject>> getCategories() {
        return mongoClient.find(CATEGORIES,
                new JsonObject().put("isActive", true));
    }

    public Future<JsonObject> createCategory(JsonObject categoryDoc) {
        // Sanitize input: only accept whitelisted fields to prevent mass assignment
        JsonObject sanitized = new JsonObject()
                .put("name", categoryDoc.getString("name"))
                .put("icon", categoryDoc.getString("icon", "📦"))
                .put("isActive", true)
                .put("createdAt", toBsonDate(DateUtils.nowIso()))
                .put("updatedAt", toBsonDate(DateUtils.nowIso()));
        return mongoClient.insert(CATEGORIES, sanitized)
                .map(id -> {
                    sanitized.put("_id", id);
                    convertBsonDatesToStrings(sanitized);
                    return sanitized;
                });
    }

    // ─── History ───────────────────────────────────────────────────────

    private Future<List<JsonObject>> runAggregation(String collection, JsonArray pipeline) {
        Promise<List<JsonObject>> promise = Promise.promise();
        List<JsonObject> results = new ArrayList<>();
        mongoClient.aggregate(collection, pipeline)
                .handler(results::add)
                .endHandler(v -> promise.complete(results))
                .exceptionHandler(promise::fail);
        return promise.future();
    }

    public Future<PagedResponse> getReturnedItems(int page, int pageSize, String search, String type, String dateTo) {
        JsonArray pipeline = new JsonArray();

        boolean includeLost = type == null || type.isBlank() || "Lost".equalsIgnoreCase(type);
        boolean includeFound = type == null || type.isBlank() || "Found".equalsIgnoreCase(type);

        String mainCollection = includeLost ? LOST_ITEMS : FOUND_ITEMS;

        JsonObject matchStage = new JsonObject().put("status", "Returned").put("isDeleted", false);
        pipeline.add(new JsonObject().put("$match", matchStage));
        pipeline.add(new JsonObject().put("$addFields", new JsonObject().put("type", includeLost ? "Lost" : "Found")));

        if (includeLost && includeFound) {
            JsonObject unionPipeline = new JsonObject()
                    .put("coll", FOUND_ITEMS)
                    .put("pipeline", new JsonArray()
                            .add(new JsonObject().put("$match", new JsonObject().put("status", "Returned").put("isDeleted", false)))
                            .add(new JsonObject().put("$addFields", new JsonObject().put("type", "Found"))));
            pipeline.add(new JsonObject().put("$unionWith", unionPipeline));
        }

        if (search != null && !search.isBlank()) {
            String escaped = escapeRegex(search);
            JsonObject regex = new JsonObject().put("$regex", escaped).put("$options", "i");
            JsonArray or = new JsonArray()
                    .add(new JsonObject().put("name", regex))
                    .add(new JsonObject().put("location", regex))
                    .add(new JsonObject().put("reporter.name", regex))
                    .add(new JsonObject().put("returnedTo.studentName", regex))
                    .add(new JsonObject().put("returnedTo.rollNo", regex));
            pipeline.add(new JsonObject().put("$match", new JsonObject().put("$or", or)));
        }

        if (dateTo != null && !dateTo.isBlank()) {
            pipeline.add(new JsonObject().put("$match", new JsonObject()
                    .put("dateFound", new JsonObject().put("$lte", toBsonDate(DateUtils.parseDate(dateTo).toString())))));
        }

        JsonObject facet = new JsonObject()
                .put("metadata", new JsonArray().add(new JsonObject().put("$count", "total")))
                .put("data", new JsonArray()
                        .add(new JsonObject().put("$sort", new JsonObject().put("lastUpdated", -1)))
                        .add(new JsonObject().put("$skip", (page - 1) * pageSize))
                        .add(new JsonObject().put("$limit", pageSize)));
        pipeline.add(new JsonObject().put("$facet", facet));

        return runAggregation(mainCollection, pipeline).map(results -> {
            if (results.isEmpty()) {
                return new PagedResponse(new ArrayList<>(), page, pageSize, 0);
            }
            JsonObject resultDoc = results.get(0);
            JsonArray metadata = resultDoc.getJsonArray("metadata");
            long total = 0;
            if (metadata != null && !metadata.isEmpty()) {
                total = metadata.getJsonObject(0).getLong("total", 0L);
            }
            JsonArray data = resultDoc.getJsonArray("data");
            List<JsonObject> items = new ArrayList<>();
            if (data != null) {
                for (int i = 0; i < data.size(); i++) {
                    JsonObject doc = data.getJsonObject(i);
                    convertBsonDatesToStrings(doc);
                    items.add(doc);
                }
            }
            return new PagedResponse(items, page, pageSize, total);
        });
    }

    public Future<PagedResponse> getDisposedItems(int page, int pageSize, String search, String type, String dateTo) {
        JsonArray pipeline = new JsonArray();

        JsonObject matchStage = new JsonObject();
        if (type != null && !type.isBlank()) {
            matchStage.put("type", type);
        }
        pipeline.add(new JsonObject().put("$match", matchStage));

        if (search != null && !search.isBlank()) {
            String escaped = escapeRegex(search);
            JsonObject regex = new JsonObject().put("$regex", escaped).put("$options", "i");
            JsonArray or = new JsonArray()
                    .add(new JsonObject().put("name", regex))
                    .add(new JsonObject().put("location", regex))
                    .add(new JsonObject().put("donatedTo", regex))
                    .add(new JsonObject().put("disposalLocation", regex));
            pipeline.add(new JsonObject().put("$match", new JsonObject().put("$or", or)));
        }

        if (dateTo != null && !dateTo.isBlank()) {
            pipeline.add(new JsonObject().put("$match", new JsonObject()
                    .put("reportedDate", new JsonObject().put("$lte", toBsonDate(DateUtils.parseDate(dateTo).toString())))));
        }

        JsonObject facet = new JsonObject()
                .put("metadata", new JsonArray().add(new JsonObject().put("$count", "total")))
                .put("data", new JsonArray()
                        .add(new JsonObject().put("$sort", new JsonObject().put("disposedDate", -1)))
                        .add(new JsonObject().put("$skip", (page - 1) * pageSize))
                        .add(new JsonObject().put("$limit", pageSize)));
        pipeline.add(new JsonObject().put("$facet", facet));

        return runAggregation(DISPOSED_ITEMS, pipeline).map(results -> {
            if (results.isEmpty()) {
                return new PagedResponse(new ArrayList<>(), page, pageSize, 0);
            }
            JsonObject resultDoc = results.get(0);
            JsonArray metadata = resultDoc.getJsonArray("metadata");
            long total = 0;
            if (metadata != null && !metadata.isEmpty()) {
                total = metadata.getJsonObject(0).getLong("total", 0L);
            }
            JsonArray data = resultDoc.getJsonArray("data");
            List<JsonObject> items = new ArrayList<>();
            if (data != null) {
                for (int i = 0; i < data.size(); i++) {
                    JsonObject doc = data.getJsonObject(i);
                    convertBsonDatesToStrings(doc);
                    items.add(doc);
                }
            }
            return new PagedResponse(items, page, pageSize, total);
        });
    }

    public Future<PagedResponse> getLostNotFoundItems(int page, int pageSize, String search, String dateTo) {
        JsonArray pipeline = new JsonArray();
        java.time.Instant sixtyDaysAgo = java.time.Instant.now().minus(60, java.time.temporal.ChronoUnit.DAYS);

        JsonObject matchStage = new JsonObject()
                .put("status", "Not Returned")
                .put("isDeleted", false)
                .put("dateFound", new JsonObject().put("$lte", toBsonDate(sixtyDaysAgo.toString())));
        pipeline.add(new JsonObject().put("$match", matchStage));

        if (search != null && !search.isBlank()) {
            String escaped = escapeRegex(search);
            JsonObject regex = new JsonObject().put("$regex", escaped).put("$options", "i");
            JsonArray or = new JsonArray()
                    .add(new JsonObject().put("name", regex))
                    .add(new JsonObject().put("location", regex))
                    .add(new JsonObject().put("reporter.name", regex));
            pipeline.add(new JsonObject().put("$match", new JsonObject().put("$or", or)));
        }

        if (dateTo != null && !dateTo.isBlank()) {
            pipeline.add(new JsonObject().put("$match", new JsonObject()
                    .put("dateFound", new JsonObject().put("$lte", toBsonDate(DateUtils.parseDate(dateTo).toString())))));
        }

        JsonObject facet = new JsonObject()
                .put("metadata", new JsonArray().add(new JsonObject().put("$count", "total")))
                .put("data", new JsonArray()
                        .add(new JsonObject().put("$sort", new JsonObject().put("dateFound", -1)))
                        .add(new JsonObject().put("$skip", (page - 1) * pageSize))
                        .add(new JsonObject().put("$limit", pageSize)));
        pipeline.add(new JsonObject().put("$facet", facet));

        return runAggregation(LOST_ITEMS, pipeline).map(results -> {
            if (results.isEmpty()) {
                return new PagedResponse(new ArrayList<>(), page, pageSize, 0);
            }
            JsonObject resultDoc = results.get(0);
            JsonArray metadata = resultDoc.getJsonArray("metadata");
            long total = 0;
            if (metadata != null && !metadata.isEmpty()) {
                total = metadata.getJsonObject(0).getLong("total", 0L);
            }
            JsonArray data = resultDoc.getJsonArray("data");
            List<JsonObject> items = new ArrayList<>();
            if (data != null) {
                for (int i = 0; i < data.size(); i++) {
                    JsonObject doc = data.getJsonObject(i);
                    convertBsonDatesToStrings(doc);
                    String dateFound = doc.getString("dateFound");
                    if (dateFound != null) {
                        doc.put("daysElapsed", DateUtils.daysElapsed(dateFound));
                    }
                    items.add(doc);
                }
            }
            return new PagedResponse(items, page, pageSize, total);
        });
    }

    public Future<JsonObject> getHistoryStats() {
        Future<Long> returnedLost = mongoClient.count(LOST_ITEMS,
                new JsonObject().put("status", "Returned").put("isDeleted", false));
        Future<Long> returnedFound = mongoClient.count(FOUND_ITEMS,
                new JsonObject().put("status", "Returned").put("isDeleted", false));

        Future<Long> disposedTotal = mongoClient.count(DISPOSED_ITEMS, new JsonObject());

        java.time.Instant sixtyDaysAgo = java.time.Instant.now().minus(60, java.time.temporal.ChronoUnit.DAYS);
        JsonObject lostNotFoundQuery = new JsonObject()
                .put("status", "Not Returned")
                .put("isDeleted", false)
                .put("dateFound", new JsonObject().put("$lte", toBsonDate(sixtyDaysAgo.toString())));
        Future<Long> lostNotFoundTotal = mongoClient.count(LOST_ITEMS, lostNotFoundQuery);

        return Future.all(returnedLost, returnedFound, disposedTotal, lostNotFoundTotal)
                .map(cf -> {
                    long retLost = cf.resultAt(0);
                    long retFound = cf.resultAt(1);
                    long returned = retLost + retFound;
                    long disposed = cf.resultAt(2);
                    long lostNotFound = cf.resultAt(3);

                    return new JsonObject()
                            .put("returned", returned)
                            .put("lostNotFound", lostNotFound)
                            .put("disposed", disposed)
                            .put("foundReturned", retFound);
                });
    }

    // ─── Statistics ────────────────────────────────────────────────────

    public Future<JsonObject> getOverviewStats() {
        Future<Long> lostCount = mongoClient.count(LOST_ITEMS,
                new JsonObject().put("isDeleted", false));
        Future<Long> foundCount = mongoClient.count(FOUND_ITEMS,
                new JsonObject().put("isDeleted", false));
        Future<Long> returnedLost = mongoClient.count(LOST_ITEMS,
                new JsonObject().put("status", "Returned").put("isDeleted", false));
        Future<Long> returnedFound = mongoClient.count(FOUND_ITEMS,
                new JsonObject().put("status", "Returned").put("isDeleted", false));

        return Future.all(lostCount, foundCount, returnedLost, returnedFound)
                .map(cf -> {
                    long lost = cf.resultAt(0);
                    long found = cf.resultAt(1);
                    long retLost = cf.resultAt(2);
                    long retFound = cf.resultAt(3);
                    long total = lost + found;
                    long returned = retLost + retFound;
                    return new JsonObject()
                            .put("total", total)
                            .put("lost", lost)
                            .put("found", found)
                            .put("returned", returned)
                            .put("lostPercentage", total > 0 ? Math.round((double) lost / total * 100) : 0)
                            .put("foundPercentage", total > 0 ? Math.round((double) found / total * 100) : 0)
                            .put("returnRate", total > 0 ? Math.round((double) returned / total * 100) : 0);
                });
    }

    public Future<JsonObject> getCountdownStats() {
        java.time.Instant now = java.time.Instant.now();
        java.time.Instant thirtyDaysAgo = now.minus(30, java.time.temporal.ChronoUnit.DAYS);
        java.time.Instant fiftyDaysAgo = now.minus(50, java.time.temporal.ChronoUnit.DAYS);
        java.time.Instant sixtyDaysAgo = now.minus(60, java.time.temporal.ChronoUnit.DAYS);

        JsonArray lostPipeline = buildCountdownPipeline(thirtyDaysAgo, fiftyDaysAgo, sixtyDaysAgo);
        JsonArray foundPipeline = buildCountdownPipeline(thirtyDaysAgo, fiftyDaysAgo, sixtyDaysAgo);

        Future<List<JsonObject>> lostCounts = runAggregation(LOST_ITEMS, lostPipeline);
        Future<List<JsonObject>> foundCounts = runAggregation(FOUND_ITEMS, foundPipeline);

        return Future.all(lostCounts, foundCounts).map(cf -> {
            List<JsonObject> lostList = cf.resultAt(0);
            List<JsonObject> foundList = cf.resultAt(1);

            long active = 0;
            long expiring = 0;
            long last10 = 0;
            long expired = 0;

            for (JsonObject doc : lostList) {
                String bucket = doc.getString("_id");
                long count = doc.getLong("count", 0L);
                if ("active".equals(bucket)) active += count;
                else if ("expiring".equals(bucket)) expiring += count;
                else if ("last10".equals(bucket)) last10 += count;
                else if ("expired".equals(bucket)) expired += count;
            }

            for (JsonObject doc : foundList) {
                String bucket = doc.getString("_id");
                long count = doc.getLong("count", 0L);
                if ("active".equals(bucket)) active += count;
                else if ("expiring".equals(bucket)) expiring += count;
                else if ("last10".equals(bucket)) last10 += count;
                else if ("expired".equals(bucket)) expired += count;
            }

            long totalUnclaimed = active + expiring + last10 + expired;

            return new JsonObject()
                    .put("totalUnclaimed", totalUnclaimed)
                    .put("active", active)
                    .put("expiring", expiring)
                    .put("last10", last10)
                    .put("expired", expired);
        });
    }

    private JsonArray buildCountdownPipeline(java.time.Instant thirty, java.time.Instant fifty, java.time.Instant sixty) {
        JsonObject match = new JsonObject().put("$match", new JsonObject()
                .put("status", "Not Returned")
                .put("isDeleted", false));

        JsonObject condActive = new JsonObject().put("$gt", new JsonArray().add("$dateFound").add(toBsonDate(thirty.toString())));
        JsonObject condExpiring = new JsonObject().put("$gt", new JsonArray().add("$dateFound").add(toBsonDate(fifty.toString())));
        JsonObject condLast10 = new JsonObject().put("$gt", new JsonArray().add("$dateFound").add(toBsonDate(sixty.toString())));

        JsonObject project = new JsonObject().put("$project", new JsonObject()
                .put("bucket", new JsonObject().put("$cond", new JsonArray()
                        .add(condActive).add("active")
                        .add(new JsonObject().put("$cond", new JsonArray()
                                .add(condExpiring).add("expiring")
                                .add(new JsonObject().put("$cond", new JsonArray()
                                        .add(condLast10).add("last10")
                                        .add("expired"))))))));

        JsonObject group = new JsonObject().put("$group", new JsonObject()
                .put("_id", "$bucket")
                .put("count", new JsonObject().put("$sum", 1)));

        return new JsonArray().add(match).add(project).add(group);
    }

    // ─── Public Browse (combined) ──────────────────────────────────────

    public Future<PagedResponse> getPublicItems(String type, int page, int pageSize,
                                                 String search, String location,
                                                 String category, String countdownFilter) {
        if ("lost".equalsIgnoreCase(type)) {
            return getLostItems(page, pageSize, search, location, countdownFilter, null, null);
        } else {
            return getFoundItems(page, pageSize, search, location, countdownFilter, category, null, null);
        }
    }

    // ─── Audit Log ─────────────────────────────────────────────────────

    public Future<Void> logAudit(String action, String entityType, String entityId,
                                  String userId, JsonObject previousState, JsonObject newState) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setUserId(userId);
        log.setPreviousState(previousState);
        log.setNewState(newState);
        log.setCreatedAt(DateUtils.nowIso());

        JsonObject doc = log.toJson();
        doc.remove("_id");
        
        doc.put("createdAt", toBsonDate(log.getCreatedAt()));
        
        return mongoClient.insert(AUDIT_LOGS, doc).map(v -> null);
    }

    // ─── Helpers ───────────────────────────────────────────────────────

    /**
     * Resolves a client-supplied sort field name to a safe MongoDB field name.
     * Prevents injection of arbitrary field names into sort clauses.
     */
    private String resolveSortField(String sort, String defaultField) {
        if (sort == null || sort.isBlank()) return defaultField;
        return switch (sort) {
            case "name"        -> "name";
            case "dateFound"   -> "dateFound";
            case "foundAt"     -> "foundAt";
            case "reportedAt"  -> "reportedAt";
            case "lastUpdated" -> "lastUpdated";
            case "location"    -> "location";
            case "category"    -> "category";
            case "disposedDate"-> "disposedDate";
            case "returnedDate"-> "returnedTo.returnedDate";
            default            -> defaultField;
        };
    }

    private String escapeRegex(String input) {
        if (input == null) {
            return null;
        }
        return input.replaceAll("([\\\\^\\$\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|\\/])", "\\\\$1");
    }

    private JsonObject buildItemQuery(String search, String location, String countdownFilter) {
        JsonObject query = new JsonObject();
        query.put("status", "Not Returned");

        if (search != null && !search.isBlank()) {
            JsonArray or = new JsonArray();
            JsonObject regex = new JsonObject().put("$regex", escapeRegex(search)).put("$options", "i");
            or.add(new JsonObject().put("name", regex));
            or.add(new JsonObject().put("description", regex));
            or.add(new JsonObject().put("location", regex));
            query.put("$or", or);
        }

        if (location != null && !location.isBlank()) {
            query.put("location", new JsonObject()
                    .put("$regex", escapeRegex(location))
                    .put("$options", "i"));
        }

        java.time.Instant now = java.time.Instant.now();
        java.time.Instant thirtyDaysAgo = now.minus(30, java.time.temporal.ChronoUnit.DAYS);
        java.time.Instant fiftyDaysAgo = now.minus(50, java.time.temporal.ChronoUnit.DAYS);
        java.time.Instant sixtyDaysAgo = now.minus(60, java.time.temporal.ChronoUnit.DAYS);

        JsonObject dateQuery = new JsonObject();
        if (countdownFilter != null && !countdownFilter.isBlank()) {
            switch (countdownFilter) {
                case "active" -> dateQuery.put("$gt", new JsonObject().put("$date", thirtyDaysAgo.toString()));
                case "expiring" -> {
                    dateQuery.put("$gt", new JsonObject().put("$date", fiftyDaysAgo.toString()));
                    dateQuery.put("$lte", new JsonObject().put("$date", thirtyDaysAgo.toString()));
                }
                case "last10" -> {
                    dateQuery.put("$gt", new JsonObject().put("$date", sixtyDaysAgo.toString()));
                    dateQuery.put("$lte", new JsonObject().put("$date", fiftyDaysAgo.toString()));
                }
                case "expired" -> dateQuery.put("$lte", new JsonObject().put("$date", sixtyDaysAgo.toString()));
            }
        } else {
            dateQuery.put("$gt", new JsonObject().put("$date", sixtyDaysAgo.toString()));
        }

        if (!dateQuery.isEmpty()) {
            query.put("dateFound", dateQuery);
        }

        return query;
    }

    private Reporter buildReporter(CreateItemRequest req) {
        Reporter reporter = new Reporter();
        if ("staff".equals(req.getContactType())) {
            reporter.setType("STAFF");
            reporter.setName(req.getStaffName());
            reporter.setEmployeeId(req.getEmployeeId());
            reporter.setDepartment(req.getDepartment());
            reporter.setPhone(req.getStaffPhone());
            reporter.setEmail(req.getStaffEmail());
        } else {
            reporter.setType("STUDENT");
            reporter.setName(req.getStudentName());
            reporter.setRollNo(req.getRollNo());
            reporter.setPhone(req.getPhone());
            reporter.setEmail(req.getEmail());
        }
        return reporter;
    }
}
