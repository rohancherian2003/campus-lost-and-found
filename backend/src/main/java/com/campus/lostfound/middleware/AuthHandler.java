package com.campus.lostfound.middleware;

import com.campus.lostfound.dto.response.ApiResponse;
import io.vertx.core.Handler;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JWT authentication handler for protected routes.
 * Extracts Bearer token from Authorization header and validates it.
 */
public class AuthHandler implements Handler<RoutingContext> {

    private static final Logger logger = LoggerFactory.getLogger(AuthHandler.class);
    private final JWTAuth jwtAuth;

    public AuthHandler(JWTAuth jwtAuth) {
        this.jwtAuth = jwtAuth;
    }

    @Override
    public void handle(RoutingContext ctx) {
        String authHeader = ctx.request().getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendUnauthorized(ctx, "Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7);

        jwtAuth.authenticate(new io.vertx.core.json.JsonObject().put("token", token))
                .onSuccess(user -> {
                    String tokenType = user.principal().getString("tokenType");
                    if (!"ACCESS".equals(tokenType)) {
                        logger.warn("JWT authentication failed: Access token required, got {}", tokenType);
                        sendUnauthorized(ctx, "Invalid token type. Access token required.");
                        return;
                    }
                    ctx.setUser(user);
                    // Store userId and role in context for downstream handlers
                    ctx.put("userId", user.principal().getString("sub"));
                    ctx.put("userEmail", user.principal().getString("email"));
                    ctx.put("userRole", user.principal().getString("role"));
                    ctx.next();
                })
                .onFailure(err -> {
                    logger.warn("JWT authentication failed: {}", err.getMessage());
                    sendUnauthorized(ctx, "Invalid or expired token");
                });
    }

    private void sendUnauthorized(RoutingContext ctx, String message) {
        ctx.response()
                .setStatusCode(401)
                .putHeader("Content-Type", "application/json")
                .end(ApiResponse.unauthorized(message).toJson().encodePrettily());
    }
}
