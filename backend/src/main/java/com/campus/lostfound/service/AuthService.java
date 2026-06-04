package com.campus.lostfound.service;

import com.campus.lostfound.dto.request.LoginRequest;
import com.campus.lostfound.exception.AuthenticationException;
import com.campus.lostfound.util.JwtUtils;
import com.campus.lostfound.util.PasswordUtils;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Authentication service handling login, token refresh, and user lookup.
 */
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final String USERS_COLLECTION = "users";

    private final MongoClient mongoClient;
    private final JWTAuth jwtAuth;
    private final io.vertx.core.Vertx vertx;

    public AuthService(MongoClient mongoClient, JWTAuth jwtAuth, io.vertx.core.Vertx vertx) {
        this.mongoClient = mongoClient;
        this.jwtAuth = jwtAuth;
        this.vertx = vertx;
    }

    /**
     * Authenticate a user by email and password.
     * Returns JWT access token and refresh token.
     */
    public Future<JsonObject> login(LoginRequest req) {
        return mongoClient.findOne(USERS_COLLECTION,
                new JsonObject().put("email", req.getEmail()).put("isActive", true),
                null)
                .compose(user -> {
                    if (user == null) {
                        return Future.failedFuture(
                                new AuthenticationException("Invalid admin credentials. Please try again."));
                    }

                    String storedHash = user.getString("passwordHash");
                    
                    return PasswordUtils.verifyPassword(vertx, req.getPassword(), storedHash)
                            .compose(isValid -> {
                                if (!isValid) {
                                    return Future.failedFuture(
                                            new AuthenticationException("Invalid admin credentials. Please try again."));
                                }

                                String userId = user.getString("_id");
                                String email = user.getString("email");
                                String role = user.getString("role", "ADMIN");
                                String fullName = user.getString("fullName", "Admin");

                                String accessToken = JwtUtils.generateAccessToken(jwtAuth, userId, email, role);
                                String refreshToken = JwtUtils.generateRefreshToken(jwtAuth, userId, email);

                                // Update last login
                                mongoClient.updateCollection(USERS_COLLECTION,
                                        new JsonObject().put("_id", userId),
                                        new JsonObject().put("$set", new JsonObject()
                                                .put("lastLogin", java.time.Instant.now().toString())));

                                logger.info("User logged in: {}", email);

                                return Future.succeededFuture(new JsonObject()
                                        .put("accessToken", accessToken)
                                        .put("refreshToken", refreshToken)
                                        .put("user", new JsonObject()
                                                .put("id", userId)
                                                .put("email", email)
                                                .put("role", role)
                                                .put("fullName", fullName)));
                            });
                });
    }

    /**
     * Refresh an access token using a valid refresh token.
     */
    public Future<JsonObject> refreshToken(String refreshToken) {
        return jwtAuth.authenticate(new JsonObject().put("token", refreshToken))
                .compose(user -> {
                    String tokenType = user.principal().getString("tokenType");
                    if (!"REFRESH".equals(tokenType)) {
                        return Future.failedFuture(
                                new AuthenticationException("Invalid refresh token"));
                    }

                    String userId = user.principal().getString("sub");
                    String email = user.principal().getString("email");

                    // Look up user to get current role
                    return mongoClient.findOne(USERS_COLLECTION,
                            new JsonObject().put("_id", userId).put("isActive", true), null)
                            .compose(userDoc -> {
                                if (userDoc == null) {
                                    return Future.failedFuture(
                                            new AuthenticationException("User no longer active"));
                                }
                                String role = userDoc.getString("role", "ADMIN");
                                String newAccessToken = JwtUtils.generateAccessToken(jwtAuth, userId, email, role);
                                return Future.succeededFuture(new JsonObject()
                                        .put("accessToken", newAccessToken));
                            });
                })
                .recover(err -> Future.failedFuture(
                        new AuthenticationException("Invalid or expired refresh token")));
    }

    /**
     * Get user profile by ID.
     */
    public Future<JsonObject> getProfile(String userId) {
        return mongoClient.findOne(USERS_COLLECTION,
                new JsonObject().put("_id", userId),
                new JsonObject().put("passwordHash", 0))
                .map(user -> {
                    if (user == null) {
                        throw new com.campus.lostfound.exception.NotFoundException("User not found");
                    }
                    return user;
                });
    }
}
