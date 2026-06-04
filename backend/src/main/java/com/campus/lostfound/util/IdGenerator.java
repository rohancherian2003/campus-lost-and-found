package com.campus.lostfound.util;

import io.vertx.core.Future;
import io.vertx.ext.mongo.MongoClient;

/**
 * Auto-incrementing ID generator for human-readable item IDs.
 * Uses a MongoDB counters collection to ensure atomicity.
 */
public final class IdGenerator {

    private static final String COUNTERS_COLLECTION = "counters";

    private IdGenerator() {}

    /**
     * Generate the next sequential ID for a given prefix.
     * E.g., prefix="LOST" → "LOST-001", "LOST-002", ...
     * prefix="FOUND" → "FOUND-001", "FOUND-002", ...
     */
    public static Future<String> nextId(MongoClient mongoClient, String prefix) {
        io.vertx.core.json.JsonObject query = new io.vertx.core.json.JsonObject()
                .put("_id", prefix);
        io.vertx.core.json.JsonObject update = new io.vertx.core.json.JsonObject()
                .put("$inc", new io.vertx.core.json.JsonObject().put("seq", 1));
        io.vertx.ext.mongo.FindOptions findOptions = new io.vertx.ext.mongo.FindOptions();

        return mongoClient.findOneAndUpdateWithOptions(
                COUNTERS_COLLECTION,
                query,
                update,
                findOptions,
                new io.vertx.ext.mongo.UpdateOptions().setUpsert(true)
        ).map(result -> {
            int seq = 1;
            if (result != null && result.getInteger("seq") != null) {
                seq = result.getInteger("seq") + 1;
            }
            return prefix + "-" + String.format("%03d", seq);
        }).recover(err -> {
            // If findOneAndUpdate fails (first insert), try reading the current value
            return mongoClient.findOne(COUNTERS_COLLECTION, query, null)
                    .map(doc -> {
                        int seq = doc != null ? doc.getInteger("seq", 1) : 1;
                        return prefix + "-" + String.format("%03d", seq);
                    });
        });
    }
}
