package com.campus.lostfound.model;

import io.vertx.core.json.JsonObject;

/**
 * Disposed item entity for history tracking.
 */
public class DisposedItem {

    private String id;
    private String originalItemId;
    private String name;
    private String type; // "Lost" | "Found"
    private String reportedDate;
    private String location;
    private Reporter reporter;
    private String disposalLocation;
    private String donatedTo;
    private String disposedDate;
    private String notes;
    private String disposedBy;
    private String createdAt;

    public DisposedItem() {}

    public DisposedItem(JsonObject json) {
        this.id = json.getString("_id");
        this.originalItemId = json.getString("originalItemId");
        this.name = json.getString("name");
        this.type = json.getString("type");
        this.reportedDate = json.getString("reportedDate");
        this.location = json.getString("location");
        this.disposalLocation = json.getString("disposalLocation");
        this.donatedTo = json.getString("donatedTo");
        this.disposedDate = json.getString("disposedDate");
        this.notes = json.getString("notes");
        this.disposedBy = json.getString("disposedBy");
        this.createdAt = json.getString("createdAt");
        if (json.getJsonObject("reporter") != null) {
            this.reporter = new Reporter(json.getJsonObject("reporter"));
        }
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();
        if (id != null) json.put("_id", id);
        if (originalItemId != null) json.put("originalItemId", originalItemId);
        json.put("name", name);
        json.put("type", type);
        if (reportedDate != null) json.put("reportedDate", reportedDate);
        if (location != null) json.put("location", location);
        if (reporter != null) json.put("reporter", reporter.toJson());
        if (disposalLocation != null) json.put("disposalLocation", disposalLocation);
        if (donatedTo != null) json.put("donatedTo", donatedTo);
        if (disposedDate != null) json.put("disposedDate", disposedDate);
        if (notes != null) json.put("notes", notes);
        if (disposedBy != null) json.put("disposedBy", disposedBy);
        if (createdAt != null) json.put("createdAt", createdAt);
        return json;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOriginalItemId() { return originalItemId; }
    public void setOriginalItemId(String originalItemId) { this.originalItemId = originalItemId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getReportedDate() { return reportedDate; }
    public void setReportedDate(String reportedDate) { this.reportedDate = reportedDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Reporter getReporter() { return reporter; }
    public void setReporter(Reporter reporter) { this.reporter = reporter; }
    public String getDisposalLocation() { return disposalLocation; }
    public void setDisposalLocation(String disposalLocation) { this.disposalLocation = disposalLocation; }
    public String getDonatedTo() { return donatedTo; }
    public void setDonatedTo(String donatedTo) { this.donatedTo = donatedTo; }
    public String getDisposedDate() { return disposedDate; }
    public void setDisposedDate(String disposedDate) { this.disposedDate = disposedDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getDisposedBy() { return disposedBy; }
    public void setDisposedBy(String disposedBy) { this.disposedBy = disposedBy; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
