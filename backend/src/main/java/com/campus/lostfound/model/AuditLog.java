package com.campus.lostfound.model;

import io.vertx.core.json.JsonObject;

/**
 * Audit log entity for tracking all data mutations.
 */
public class AuditLog {

    private String id;
    private String action;
    private String entityType;
    private String entityId;
    private String userId;
    private JsonObject previousState;
    private JsonObject newState;
    private String ipAddress;
    private String createdAt;

    public AuditLog() {}

    public AuditLog(JsonObject json) {
        this.id = json.getString("_id");
        this.action = json.getString("action");
        this.entityType = json.getString("entityType");
        this.entityId = json.getString("entityId");
        this.userId = json.getString("userId");
        this.previousState = json.getJsonObject("previousState");
        this.newState = json.getJsonObject("newState");
        this.ipAddress = json.getString("ipAddress");
        this.createdAt = json.getString("createdAt");
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();
        if (id != null) json.put("_id", id);
        json.put("action", action);
        json.put("entityType", entityType);
        if (entityId != null) json.put("entityId", entityId);
        if (userId != null) json.put("userId", userId);
        if (previousState != null) json.put("previousState", previousState);
        if (newState != null) json.put("newState", newState);
        if (ipAddress != null) json.put("ipAddress", ipAddress);
        if (createdAt != null) json.put("createdAt", createdAt);
        return json;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public JsonObject getPreviousState() { return previousState; }
    public void setPreviousState(JsonObject previousState) { this.previousState = previousState; }
    public JsonObject getNewState() { return newState; }
    public void setNewState(JsonObject newState) { this.newState = newState; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
