package com.campus.lostfound.dto.request;

import io.vertx.core.json.JsonObject;

/**
 * Login request DTO.
 */
public class LoginRequest {

    private String email;
    private String password;

    public LoginRequest() {}

    public LoginRequest(JsonObject json) {
        this.email = json.getString("email");
        this.password = json.getString("password");
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
