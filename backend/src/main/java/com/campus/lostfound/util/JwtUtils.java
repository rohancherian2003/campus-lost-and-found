package com.campus.lostfound.util;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;

/**
 * JWT token generation and configuration utilities.
 */
public final class JwtUtils {

    private JwtUtils() {}

    /**
     * Generate an access token (15 minutes).
     */
    public static String generateAccessToken(JWTAuth jwtAuth, String userId, String email, String role) {
        return jwtAuth.generateToken(
                new JsonObject()
                        .put("sub", userId)
                        .put("email", email)
                        .put("role", role)
                        .put("tokenType", "ACCESS"),
                new JWTOptions().setExpiresInMinutes(15)
        );
    }

    /**
     * Generate a refresh token (7 days).
     */
    public static String generateRefreshToken(JWTAuth jwtAuth, String userId, String email) {
        return jwtAuth.generateToken(
                new JsonObject()
                        .put("sub", userId)
                        .put("email", email)
                        .put("tokenType", "REFRESH"),
                new JWTOptions().setExpiresInMinutes(60 * 24 * 7)
        );
    }
}
