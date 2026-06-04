package com.campus.lostfound.model;

import io.vertx.core.json.JsonObject;

/**
 * Notification entity for admin alerts.
 */
public class Notification {

    private String id;
    private String type;
    private String title;
    private String message;
    private String relatedItemId;
    private boolean isRead;
    private String userId;
    private String createdAt;

    public Notification() {}

    public Notification(JsonObject json) {
        this.id = json.getString("_id");
        this.type = json.getString("type");
        this.title = json.getString("title");
        this.message = json.getString("message");
        this.relatedItemId = json.getString("relatedItemId");
        this.isRead = json.getBoolean("isRead", false);
        this.userId = json.getString("userId");
        this.createdAt = json.getString("createdAt");
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();
        if (id != null) json.put("_id", id);
        json.put("type", type);
        json.put("title", title);
        json.put("message", message);
        if (relatedItemId != null) json.put("relatedItemId", relatedItemId);
        json.put("isRead", isRead);
        if (userId != null) json.put("userId", userId);
        if (createdAt != null) json.put("createdAt", createdAt);
        return json;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getRelatedItemId() { return relatedItemId; }
    public void setRelatedItemId(String relatedItemId) { this.relatedItemId = relatedItemId; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
