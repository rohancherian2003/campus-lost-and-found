package com.campus.lostfound.model;

import io.vertx.core.json.JsonObject;

/**
 * Lost item entity stored in the lost_items MongoDB collection.
 */
public class LostItem {

    private String id;
    private String itemId;
    private String name;
    private String description;
    private String category;
    private String location;
    private String collectFrom;
    private String dateFound;
    private String status; // "Not Returned" | "Returned"
    private String image;
    private Reporter reporter;
    private ReturnedTo returnedTo;
    private String reportedAt;
    private String lastUpdated;
    private boolean isDeleted;
    private String deletedAt;
    private String createdBy;
    private String updatedBy;

    public LostItem() {}

    public LostItem(JsonObject json) {
        this.id = json.getString("_id");
        this.itemId = json.getString("itemId");
        this.name = json.getString("name");
        this.description = json.getString("description");
        this.category = json.getString("category");
        this.location = json.getString("location");
        this.collectFrom = json.getString("collectFrom");
        this.dateFound = json.getString("dateFound");
        this.status = json.getString("status", "Not Returned");
        this.image = json.getString("image");
        this.reportedAt = json.getString("reportedAt");
        this.lastUpdated = json.getString("lastUpdated");
        this.isDeleted = json.getBoolean("isDeleted", false);
        this.deletedAt = json.getString("deletedAt");
        this.createdBy = json.getString("createdBy");
        this.updatedBy = json.getString("updatedBy");
        if (json.getJsonObject("reporter") != null) {
            this.reporter = new Reporter(json.getJsonObject("reporter"));
        }
        if (json.getJsonObject("returnedTo") != null) {
            this.returnedTo = new ReturnedTo(json.getJsonObject("returnedTo"));
        }
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();
        if (id != null) json.put("_id", id);
        if (itemId != null) json.put("itemId", itemId);
        json.put("name", name);
        if (description != null) json.put("description", description);
        if (category != null) json.put("category", category);
        if (location != null) json.put("location", location);
        if (collectFrom != null) json.put("collectFrom", collectFrom);
        if (dateFound != null) json.put("dateFound", dateFound);
        json.put("status", status != null ? status : "Not Returned");
        if (image != null) json.put("image", image);
        if (reporter != null) json.put("reporter", reporter.toJson());
        if (returnedTo != null) json.put("returnedTo", returnedTo.toJson());
        if (reportedAt != null) json.put("reportedAt", reportedAt);
        if (lastUpdated != null) json.put("lastUpdated", lastUpdated);
        json.put("isDeleted", isDeleted);
        if (deletedAt != null) json.put("deletedAt", deletedAt);
        if (createdBy != null) json.put("createdBy", createdBy);
        if (updatedBy != null) json.put("updatedBy", updatedBy);
        return json;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCollectFrom() { return collectFrom; }
    public void setCollectFrom(String collectFrom) { this.collectFrom = collectFrom; }
    public String getDateFound() { return dateFound; }
    public void setDateFound(String dateFound) { this.dateFound = dateFound; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Reporter getReporter() { return reporter; }
    public void setReporter(Reporter reporter) { this.reporter = reporter; }
    public ReturnedTo getReturnedTo() { return returnedTo; }
    public void setReturnedTo(ReturnedTo returnedTo) { this.returnedTo = returnedTo; }
    public String getReportedAt() { return reportedAt; }
    public void setReportedAt(String reportedAt) { this.reportedAt = reportedAt; }
    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public String getDeletedAt() { return deletedAt; }
    public void setDeletedAt(String deletedAt) { this.deletedAt = deletedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
