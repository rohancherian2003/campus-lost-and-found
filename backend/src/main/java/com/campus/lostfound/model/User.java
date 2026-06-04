package com.campus.lostfound.model;

import io.vertx.core.json.JsonObject;
import java.time.Instant;

/**
 * User entity for authentication and authorization.
 */
public class User {

    private String id;
    private String email;
    private String passwordHash;
    private String role;
    private String fullName;
    private Instant lastLogin;
    private boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public User() {}

    public User(JsonObject json) {
        this.id = json.getString("_id");
        this.email = json.getString("email");
        this.passwordHash = json.getString("passwordHash");
        this.role = json.getString("role", "ADMIN");
        this.fullName = json.getString("fullName");
        this.isActive = json.getBoolean("isActive", true);
        if (json.getString("lastLogin") != null) {
            this.lastLogin = Instant.parse(json.getString("lastLogin"));
        }
        if (json.getString("createdAt") != null) {
            this.createdAt = Instant.parse(json.getString("createdAt"));
        }
        if (json.getString("updatedAt") != null) {
            this.updatedAt = Instant.parse(json.getString("updatedAt"));
        }
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();
        if (id != null) json.put("_id", id);
        json.put("email", email);
        json.put("passwordHash", passwordHash);
        json.put("role", role);
        json.put("fullName", fullName);
        json.put("isActive", isActive);
        if (lastLogin != null) json.put("lastLogin", lastLogin.toString());
        if (createdAt != null) json.put("createdAt", createdAt.toString());
        if (updatedAt != null) json.put("updatedAt", updatedAt.toString());
        return json;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Instant getLastLogin() { return lastLogin; }
    public void setLastLogin(Instant lastLogin) { this.lastLogin = lastLogin; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
