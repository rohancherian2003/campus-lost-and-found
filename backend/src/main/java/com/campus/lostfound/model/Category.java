package com.campus.lostfound.model;

import io.vertx.core.json.JsonObject;

/**
 * Category entity for organizing items.
 */
public class Category {

    private String id;
    private String name;
    private String icon;
    private int itemCount;
    private boolean isActive;
    private String createdAt;
    private String updatedAt;

    public Category() {}

    public Category(JsonObject json) {
        this.id = json.getString("_id");
        this.name = json.getString("name");
        this.icon = json.getString("icon");
        this.itemCount = json.getInteger("itemCount", 0);
        this.isActive = json.getBoolean("isActive", true);
        this.createdAt = json.getString("createdAt");
        this.updatedAt = json.getString("updatedAt");
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();
        if (id != null) json.put("_id", id);
        json.put("name", name);
        if (icon != null) json.put("icon", icon);
        json.put("itemCount", itemCount);
        json.put("isActive", isActive);
        if (createdAt != null) json.put("createdAt", createdAt);
        if (updatedAt != null) json.put("updatedAt", updatedAt);
        return json;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public int getItemCount() { return itemCount; }
    public void setItemCount(int itemCount) { this.itemCount = itemCount; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
