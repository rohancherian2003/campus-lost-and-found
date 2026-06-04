package com.campus.lostfound.dto.response;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

/**
 * Standard API response wrapper for all endpoints.
 */
public class ApiResponse {

    private boolean success;
    private String message;
    private Object data;
    private int statusCode;

    private ApiResponse(boolean success, String message, Object data, int statusCode) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
    }

    public static ApiResponse ok(Object data) {
        return new ApiResponse(true, "Success", data, 200);
    }

    public static ApiResponse ok(String message, Object data) {
        return new ApiResponse(true, message, data, 200);
    }

    public static ApiResponse created(Object data) {
        return new ApiResponse(true, "Created", data, 201);
    }

    public static ApiResponse created(String message, Object data) {
        return new ApiResponse(true, message, data, 201);
    }

    public static ApiResponse error(int statusCode, String message) {
        return new ApiResponse(false, message, null, statusCode);
    }

    public static ApiResponse badRequest(String message) {
        return error(400, message);
    }

    public static ApiResponse unauthorized(String message) {
        return error(401, message);
    }

    public static ApiResponse forbidden(String message) {
        return error(403, message);
    }

    public static ApiResponse notFound(String message) {
        return error(404, message);
    }

    public static ApiResponse serverError(String message) {
        return error(500, message);
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject()
                .put("success", success)
                .put("message", message);
        if (data instanceof JsonObject) {
            json.put("data", (JsonObject) data);
        } else if (data instanceof JsonArray) {
            json.put("data", (JsonArray) data);
        } else if (data != null) {
            json.put("data", data.toString());
        }
        return json;
    }

    public int getStatusCode() { return statusCode; }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Object getData() { return data; }
}
