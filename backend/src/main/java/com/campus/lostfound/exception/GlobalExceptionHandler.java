package com.campus.lostfound.exception;

import com.campus.lostfound.dto.response.ApiResponse;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Centralized exception handler for all API routes.
 * Converts exceptions into standardized API error responses.
 */
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private GlobalExceptionHandler() {}

    /**
     * Handles any exception thrown during request processing.
     */
    public static void handle(RoutingContext ctx) {
        Throwable failure = ctx.failure();

        if (failure == null) {
            int statusCode = ctx.statusCode();
            if (statusCode == 404) {
                sendError(ctx, 404, "Resource not found");
            } else if (statusCode == 405) {
                sendError(ctx, 405, "Method not allowed");
            } else {
                sendError(ctx, statusCode > 0 ? statusCode : 500, "An unexpected error occurred");
            }
            return;
        }

        if (failure instanceof AppException appException) {
            logger.warn("Application error: {} - {}", appException.getStatusCode(), appException.getMessage());
            sendError(ctx, appException.getStatusCode(), appException.getMessage());
        } else if (failure instanceof IllegalArgumentException) {
            logger.warn("Validation error: {}", failure.getMessage());
            sendError(ctx, 400, failure.getMessage());
        } else {
            logger.error("Unhandled exception", failure);
            sendError(ctx, 500, "Internal server error");
        }
    }

    private static void sendError(RoutingContext ctx, int statusCode, String message) {
        if (!ctx.response().ended()) {
            ctx.response()
                    .setStatusCode(statusCode)
                    .putHeader("Content-Type", "application/json")
                    .end(ApiResponse.error(statusCode, message).toJson().encodePrettily());
        }
    }
}
