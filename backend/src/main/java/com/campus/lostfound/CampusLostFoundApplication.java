package com.campus.lostfound;

import com.campus.lostfound.config.AppConfig;
import com.campus.lostfound.dto.request.*;
import com.campus.lostfound.dto.response.ApiResponse;
import com.campus.lostfound.exception.GlobalExceptionHandler;
import com.campus.lostfound.middleware.AuthHandler;
import com.campus.lostfound.middleware.RequestLogHandler;
import com.campus.lostfound.service.AuthService;
import com.campus.lostfound.service.ItemService;
import com.campus.lostfound.util.PasswordUtils;
import com.campus.lostfound.validator.ItemValidator;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.PubSecKeyOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTAuthOptions;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Main Vert.x Verticle starting the HTTP Server and registering routes.
 */
public class CampusLostFoundApplication extends AbstractVerticle {

    private static final Logger logger = LoggerFactory.getLogger(CampusLostFoundApplication.class);
    private MongoClient mongoClient;
    private JWTAuth jwtAuth;
    private AuthService authService;
    private ItemService itemService;

    private String adminSeedPassword;

    // Package-private for testing
    void validateAdminSeedPassword(String password) {
        if (password == null) {
            String errorMsg = "Critical Configuration Error: ADMIN_SEED_PASSWORD environment variable is missing.";
            logger.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }
        if (password.isBlank()) {
            String errorMsg = "Critical Configuration Error: ADMIN_SEED_PASSWORD environment variable is empty or blank.";
            logger.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        // Check for common weak passwords
        String lower = password.toLowerCase().trim();
        if (lower.equals("admin") || lower.equals("password") || lower.equals("admin123") || 
            lower.equals("12345678") || lower.equals("qwerty123")) {
            String errorMsg = "Critical Configuration Error: ADMIN_SEED_PASSWORD is a known weak password.";
            logger.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        if (password.length() < 12) {
            String errorMsg = "Critical Configuration Error: ADMIN_SEED_PASSWORD must be at least 12 characters long.";
            logger.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        // Complexity requirement: Uppercase, Lowercase, Numeric, Special Character
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) {
                hasUpper = true;
            } else if (Character.isLowerCase(c)) {
                hasLower = true;
            } else if (Character.isDigit(c)) {
                hasDigit = true;
            } else {
                hasSpecial = true;
            }
        }

        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            String errorMsg = "Critical Configuration Error: ADMIN_SEED_PASSWORD does not meet complexity requirements. It must contain uppercase, lowercase, numeric, and special characters.";
            logger.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }
    }

    @Override
    public void start(Promise<Void> startPromise) {
        logger.info("Starting Campus Lost & Found backend verticle...");
        
        try {
            validateAdminSeedPassword(AppConfig.getEnv("ADMIN_SEED_PASSWORD"));
            this.adminSeedPassword = AppConfig.getEnv("ADMIN_SEED_PASSWORD");
        } catch (Exception e) {
            logger.error("Startup validation failed: {}", e.getMessage());
            startPromise.fail(e);
            return;
        }

        AppConfig appConfig = new AppConfig(config());

        // Initialize MongoClient
        this.mongoClient = MongoClient.createShared(vertx, appConfig.getMongoConfig());

        // Initialize JWTAuth
        JWTAuthOptions jwtAuthOptions = new JWTAuthOptions()
                .addPubSecKey(new PubSecKeyOptions()
                        .setAlgorithm("HS256")
                        .setBuffer(Buffer.buffer(appConfig.getJwtSecret()))
                        .setSymmetric(true));
        this.jwtAuth = JWTAuth.create(vertx, jwtAuthOptions);

        // Initialize services
        this.authService = new AuthService(mongoClient, jwtAuth, vertx);
        this.itemService = new ItemService(mongoClient);

        // Seed database first, then start HTTP server
        seedDatabase(mongoClient, adminSeedPassword)
                .compose(v -> startHttpServer(appConfig))
                .onSuccess(server -> {
                    logger.info("HTTP server started on port {}", appConfig.getHttpPort());
                    this.adminSeedPassword = null; // Clear from memory
                    startPromise.complete();
                })
                .onFailure(err -> {
                    logger.error("Failed to start verticle", err);
                    this.adminSeedPassword = null; // Clear from memory
                    startPromise.fail(err);
                });
    }

    // Package-private for testing
    Future<Void> seedDatabase(MongoClient mongoClient, String password) {
        Promise<Void> promise = Promise.promise();

        // Seed default admin user if none exists
        JsonObject adminQuery = new JsonObject().put("email", "admin@campus.edu");
        mongoClient.findOne("users", adminQuery, null)
                .compose(user -> {
                    if (user == null) {
                        logger.info("Admin user not found. Seeding default admin...");
                        return PasswordUtils.hashPassword(vertx, password)
                                .compose(hash -> {
                                    JsonObject newAdmin = new JsonObject()
                                            .put("email", "admin@campus.edu")
                                            .put("passwordHash", hash)
                                            .put("role", "ADMIN")
                                            .put("fullName", "System Administrator")
                                            .put("isActive", true)
                                            .put("createdAt", Instant.now().toString())
                                            .put("updatedAt", Instant.now().toString());
                                    return mongoClient.insert("users", newAdmin).map(v -> null);
                                });
                    } else {
                        logger.info("Admin user already exists. Skipping admin seeding.");
                        return Future.succeededFuture();
                    }
                })
                .compose(v -> {
                    // Seed categories if categories collection is empty
                    return mongoClient.count("categories", new JsonObject())
                            .compose(count -> {
                                if (count == 0) {
                                    logger.info("Categories collection is empty. Seeding default categories...");
                                    List<Future<String>> insertFutures = new ArrayList<>();
                                    String now = Instant.now().toString();

                                    String[][] defaultCategories = {
                                            {"Bags & Backpacks", "🎒"},
                                            {"Water Bottles", "🍶"},
                                            {"Electronics", "💻"},
                                            {"Books & Notebooks", "📚"},
                                            {"Keys & Keychains", "🔑"},
                                            {"Accessories", "⌚"},
                                            {"Eyewear", "🕶️"},
                                            {"Others", "📦"}
                                    };

                                    for (String[] cat : defaultCategories) {
                                            JsonObject categoryDoc = new JsonObject()
                                                    .put("name", cat[0])
                                                    .put("icon", cat[1])
                                                    .put("isActive", true)
                                                    .put("createdAt", now)
                                                    .put("updatedAt", now);
                                            insertFutures.add(mongoClient.insert("categories", categoryDoc));
                                    }
                                    return Future.all(insertFutures).map(cf -> null);
                                } else {
                                    logger.info("Categories collection already seeded. Skipping categories seeding.");
                                    return Future.succeededFuture();
                                }
                            });
                })
                .compose(v -> {
                    logger.info("Creating database indexes...");
                    Future<Void> userIndex = mongoClient.createIndexWithOptions("users", 
                            new JsonObject().put("email", 1), 
                            new io.vertx.ext.mongo.IndexOptions().unique(true));
                    Future<Void> lostIndex = mongoClient.createIndex("lost_items", 
                            new JsonObject().put("isDeleted", 1).put("status", 1).put("dateFound", 1));
                    Future<Void> foundIndex = mongoClient.createIndex("found_items", 
                            new JsonObject().put("isDeleted", 1).put("status", 1).put("dateFound", 1));

                    // Optimized compound indexes for audit_logs
                    Future<Void> auditIndex1 = mongoClient.createIndex("audit_logs", 
                            new JsonObject().put("entityType", 1).put("entityId", 1).put("createdAt", -1));
                    Future<Void> auditIndex2 = mongoClient.createIndex("audit_logs", 
                            new JsonObject().put("userId", 1).put("createdAt", -1));
                    Future<Void> auditIndex3 = mongoClient.createIndex("audit_logs", 
                            new JsonObject().put("action", 1).put("createdAt", -1));

                    // Optimized compound indexes for disposed_items
                    Future<Void> disposedIndex1 = mongoClient.createIndex("disposed_items", 
                            new JsonObject().put("disposedDate", -1));
                    Future<Void> disposedIndex2 = mongoClient.createIndex("disposed_items", 
                            new JsonObject().put("type", 1).put("disposedDate", -1));
                    Future<Void> disposedIndex3 = mongoClient.createIndex("disposed_items", 
                            new JsonObject().put("disposalLocation", 1).put("disposedDate", -1));

                    return Future.all(List.of(
                            userIndex, lostIndex, foundIndex,
                            auditIndex1, auditIndex2, auditIndex3,
                            disposedIndex1, disposedIndex2, disposedIndex3
                    )).map(cf -> null);
                })
                .compose(v -> {
                    // --- Phase 6: Additional compound + text indexes for scalability ---
                    logger.info("Creating additional scalability indexes...");

                    // lost_items: category filter index
                    Future<Void> lostCategoryIdx = mongoClient.createIndex("lost_items",
                            new JsonObject().put("isDeleted", 1).put("category", 1).put("status", 1).put("dateFound", -1));
                    // lost_items: location filter index
                    Future<Void> lostLocationIdx = mongoClient.createIndex("lost_items",
                            new JsonObject().put("isDeleted", 1).put("location", 1).put("status", 1).put("dateFound", -1));
                    // lost_items: sort-by-lastUpdated index
                    Future<Void> lostLastUpdatedIdx = mongoClient.createIndex("lost_items",
                            new JsonObject().put("isDeleted", 1).put("status", 1).put("lastUpdated", -1));
                    // lost_items: sort-by-name index
                    Future<Void> lostNameIdx = mongoClient.createIndex("lost_items",
                            new JsonObject().put("isDeleted", 1).put("status", 1).put("name", 1));

                    // found_items: category filter index
                    Future<Void> foundCategoryIdx = mongoClient.createIndex("found_items",
                            new JsonObject().put("isDeleted", 1).put("category", 1).put("status", 1).put("dateFound", -1));
                    // found_items: location filter index
                    Future<Void> foundLocationIdx = mongoClient.createIndex("found_items",
                            new JsonObject().put("isDeleted", 1).put("location", 1).put("status", 1).put("dateFound", -1));
                    // found_items: primary foundAt sort index
                    Future<Void> foundFoundAtIdx = mongoClient.createIndex("found_items",
                            new JsonObject().put("isDeleted", 1).put("status", 1).put("foundAt", -1));
                    // found_items: lastUpdated sort index
                    Future<Void> foundLastUpdatedIdx = mongoClient.createIndex("found_items",
                            new JsonObject().put("isDeleted", 1).put("status", 1).put("lastUpdated", -1));
                    // found_items: sort-by-name index
                    Future<Void> foundNameIdx = mongoClient.createIndex("found_items",
                            new JsonObject().put("isDeleted", 1).put("status", 1).put("name", 1));

                    return Future.all(List.of(
                            lostCategoryIdx, lostLocationIdx, lostLastUpdatedIdx, lostNameIdx,
                            foundCategoryIdx, foundLocationIdx, foundFoundAtIdx, foundLastUpdatedIdx, foundNameIdx
                    )).map(cf -> null);
                })
                .onSuccess(v -> {
                    logger.info("Database seeding and indexing completed successfully.");
                    promise.complete();
                })
                .onFailure(err -> {
                    logger.error("Database seeding and indexing failed", err);
                    promise.fail(err);
                });

        return promise.future();
    }

    private Future<io.vertx.core.http.HttpServer> startHttpServer(AppConfig appConfig) {
        Router router = Router.router(vertx);

        // Security headers middleware (OWASP best practices)
        router.route().handler(ctx -> {
            ctx.response()
                    .putHeader("X-Frame-Options", "DENY")
                    .putHeader("X-Content-Type-Options", "nosniff")
                    .putHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;")
                    .putHeader("X-XSS-Protection", "1; mode=block")
                    .putHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            ctx.next();
        });

        // Enable CORS using configured origin pattern + development fallbacks
        StringBuilder patternBuilder = new StringBuilder();
        patternBuilder.append("^(http://localhost:\\d+|http://127.0.0.1:\\d+|https://.*\\.vercel\\.app|https://.*\\.onrender\\.com");
        
        String corsOriginConf = appConfig.getCorsOrigin();
        if (corsOriginConf != null) {
            for (String origin : corsOriginConf.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty()) {
                    String escaped = trimmed.replace(".", "\\.").replace(":", "\\:");
                    patternBuilder.append("|").append(escaped);
                }
            }
        }
        patternBuilder.append(")$");
        String allowedOriginPattern = patternBuilder.toString();
        logger.info("Configuring CORS with pattern: {}", allowedOriginPattern);

        CorsHandler corsHandler = CorsHandler.create(allowedOriginPattern)
                .allowedMethod(HttpMethod.GET)
                .allowedMethod(HttpMethod.POST)
                .allowedMethod(HttpMethod.PUT)
                .allowedMethod(HttpMethod.DELETE)
                .allowedHeader("Authorization")
                .allowedHeader("Content-Type")
                .allowCredentials(true);
        router.route().handler(corsHandler);

        // Request logger middleware
        router.route().handler(new RequestLogHandler());

        // Body handler
        router.route().handler(BodyHandler.create());

        // Global Exception/Failure Handler
        router.route().failureHandler(GlobalExceptionHandler::handle);

        // Wire routes
        registerRoutes(router);

        return vertx.createHttpServer()
                .requestHandler(router)
                .listen(appConfig.getHttpPort());
    }

    private void registerRoutes(Router router) {
        // Root and Health Check APIs
        router.get("/").handler(this::handleRoot);
        router.get("/api").handler(this::handleRoot);
        router.get("/api/").handler(this::handleRoot);

        // Public API
        router.post("/api/auth/login").handler(this::handleLogin);
        router.post("/api/auth/refresh").handler(this::handleRefresh);
        router.get("/api/public/items").handler(this::handleGetPublicItems);
        router.get("/api/public/categories").handler(this::handleGetPublicCategories);
        router.get("/api/public/stats/overview").handler(this::handleGetStatsOverview);

        // Authenticated API middleware
        AuthHandler authHandler = new AuthHandler(jwtAuth);
        router.route("/api/admin/*").handler(authHandler);
        router.route("/api/auth/profile").handler(authHandler); // Profile requires auth

        // Profile endpoint
        router.get("/api/auth/profile").handler(this::handleGetProfile);

        // Admin categories
        router.get("/api/admin/categories").handler(this::handleGetCategories);
        router.post("/api/admin/categories").handler(this::handleCreateCategory);

        // Admin lost items
        router.get("/api/admin/lost-items").handler(this::handleGetLostItems);
        router.get("/api/admin/lost-items/:id").handler(this::handleGetLostItemById);
        router.post("/api/admin/lost-items").handler(this::handleCreateLostItem);
        router.put("/api/admin/lost-items/:id").handler(this::handleUpdateLostItem);
        router.delete("/api/admin/lost-items/:id").handler(this::handleDeleteLostItem);

        // Admin found items
        router.get("/api/admin/found-items").handler(this::handleGetFoundItems);
        router.get("/api/admin/found-items/:id").handler(this::handleGetFoundItemById);
        router.post("/api/admin/found-items").handler(this::handleCreateFoundItem);
        router.put("/api/admin/found-items/:id").handler(this::handleUpdateFoundItem);
        router.delete("/api/admin/found-items/:id").handler(this::handleDeleteFoundItem);

        // Expired & Disposal
        router.get("/api/admin/expired-items").handler(this::handleGetExpiredItems);
        router.post("/api/admin/expired-items/:id/dispose").handler(this::handleDisposeItem);
        // History
        router.get("/api/admin/history/returned").handler(this::handleGetHistoryReturned);
        router.get("/api/admin/history/disposed").handler(this::handleGetHistoryDisposed);
        router.get("/api/admin/history/lost-not-found").handler(this::handleGetHistoryLostNotFound);
        router.get("/api/admin/history/stats").handler(this::handleGetHistoryStats);
        // Stats
        router.get("/api/admin/stats/overview").handler(this::handleGetStatsOverview);
        router.get("/api/admin/stats/countdown").handler(this::handleGetStatsCountdown);
    }

    private void handleRoot(RoutingContext ctx) {
        JsonObject statusInfo = new JsonObject()
                .put("status", "UP")
                .put("timestamp", Instant.now().toString());
        sendResponse(ctx, 200, ApiResponse.ok("Campus Lost and Found API Server is running", statusInfo));
    }

    private void handleLogin(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            if (body == null) {
                ctx.fail(400, new IllegalArgumentException("Request body is empty"));
                return;
            }
            LoginRequest req = new LoginRequest(body);
            ItemValidator.validateLogin(req);

            authService.login(req)
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok("Login successful", res)))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleRefresh(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            String refreshToken = body != null ? body.getString("refreshToken") : null;
            if (refreshToken == null || refreshToken.isBlank()) {
                ctx.fail(400, new IllegalArgumentException("Refresh token is required"));
                return;
            }

            authService.refreshToken(refreshToken)
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok("Token refreshed successfully", res)))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleGetProfile(RoutingContext ctx) {
        String userId = ctx.get("userId");
        if (userId == null) {
            ctx.fail(401);
            return;
        }

        authService.getProfile(userId)
                .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res)))
                .onFailure(ctx::fail);
    }

    private void handleGetPublicItems(RoutingContext ctx) {
        try {
            String type = ctx.request().getParam("type");
            if (type == null || type.isBlank()) {
                ctx.fail(400, new IllegalArgumentException("Query parameter 'type' is required"));
                return;
            }

            int page = getQueryInt(ctx, "page", 1);
            int pageSize = getQueryInt(ctx, "pageSize", 10);
            String search = ctx.request().getParam("search");
            String location = ctx.request().getParam("location");
            String category = ctx.request().getParam("category");
            String countdownFilter = ctx.request().getParam("countdownFilter");

            itemService.getPublicItems(type, page, pageSize, search, location, category, countdownFilter)
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res.toJson())))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleGetPublicCategories(RoutingContext ctx) {
        itemService.getCategories()
                .onSuccess(list -> {
                    JsonArray arr = new JsonArray(list);
                    sendResponse(ctx, 200, ApiResponse.ok(arr));
                })
                .onFailure(ctx::fail);
    }

    private void handleGetCategories(RoutingContext ctx) {
        itemService.getCategories()
                .onSuccess(list -> {
                    JsonArray arr = new JsonArray(list);
                    sendResponse(ctx, 200, ApiResponse.ok(arr));
                })
                .onFailure(ctx::fail);
    }

    private void handleCreateCategory(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            if (body == null || body.getString("name") == null || body.getString("name").isBlank()) {
                ctx.fail(400, new IllegalArgumentException("Category name is required"));
                return;
            }
            String userId = ctx.get("userId");

            itemService.createCategory(body)
                    .compose(cat -> itemService.logAudit(
                            "CREATE", "Category", cat.getString("_id"), userId, null, cat
                    ).map(v -> cat))
                    .onSuccess(cat -> sendResponse(ctx, 201, ApiResponse.created(cat)))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleGetLostItems(RoutingContext ctx) {
        try {
            int page = getQueryInt(ctx, "page", 1);
            int pageSize = getQueryInt(ctx, "pageSize", 10);
            String search = ctx.request().getParam("search");
            String location = ctx.request().getParam("location");
            String countdownFilter = ctx.request().getParam("countdownFilter");
            String sort = ctx.request().getParam("sort");
            String direction = ctx.request().getParam("direction");

            itemService.getLostItems(page, pageSize, search, location, countdownFilter, sort, direction)
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res.toJson())))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleGetLostItemById(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        itemService.getLostItemById(id)
                .onSuccess(item -> sendResponse(ctx, 200, ApiResponse.ok(item)))
                .onFailure(ctx::fail);
    }

    private void handleCreateLostItem(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            if (body == null) {
                ctx.fail(400, new IllegalArgumentException("Body is empty"));
                return;
            }
            CreateItemRequest req = new CreateItemRequest(body);
            ItemValidator.validateCreateItem(req);
            String userId = ctx.get("userId");

            itemService.createLostItem(req)
                    .compose(item -> itemService.logAudit(
                            "CREATE", "LostItem", item.getString("_id"), userId, null, item
                    ).map(v -> item))
                    .onSuccess(item -> sendResponse(ctx, 201, ApiResponse.created(item)))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleUpdateLostItem(RoutingContext ctx) {
        try {
            String id = ctx.pathParam("id");
            JsonObject body = ctx.body().asJsonObject();
            if (body == null) {
                ctx.fail(400, new IllegalArgumentException("Body is empty"));
                return;
            }
            UpdateItemStatusRequest req = new UpdateItemStatusRequest(body);
            ItemValidator.validateUpdateStatus(req);
            String userId = ctx.get("userId");

            itemService.getLostItemById(id)
                    .compose(oldItem -> itemService.updateLostItem(id, req)
                            .compose(newItem -> itemService.logAudit(
                                    "UPDATE", "LostItem", id, userId, oldItem, newItem
                            ).map(v -> newItem)))
                    .onSuccess(item -> sendResponse(ctx, 200, ApiResponse.ok(item)))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleDeleteLostItem(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        String userId = ctx.get("userId");

        itemService.getLostItemById(id)
                .compose(oldItem -> itemService.deleteLostItem(id)
                        .compose(v -> itemService.logAudit(
                                "DELETE", "LostItem", id, userId, oldItem, null
                        )))
                .onSuccess(v -> sendResponse(ctx, 200, ApiResponse.ok("Lost item deleted successfully", null)))
                .onFailure(ctx::fail);
    }

    private void handleGetFoundItems(RoutingContext ctx) {
        try {
            int page = getQueryInt(ctx, "page", 1);
            int pageSize = getQueryInt(ctx, "pageSize", 10);
            String search = ctx.request().getParam("search");
            String location = ctx.request().getParam("location");
            String countdownFilter = ctx.request().getParam("countdownFilter");
            String category = ctx.request().getParam("category");
            String sort = ctx.request().getParam("sort");
            String direction = ctx.request().getParam("direction");

            itemService.getFoundItems(page, pageSize, search, location, countdownFilter, category, sort, direction)
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res.toJson())))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleGetFoundItemById(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        itemService.getFoundItemById(id)
                .onSuccess(item -> sendResponse(ctx, 200, ApiResponse.ok(item)))
                .onFailure(ctx::fail);
    }

    private void handleCreateFoundItem(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            if (body == null) {
                ctx.fail(400, new IllegalArgumentException("Body is empty"));
                return;
            }
            CreateItemRequest req = new CreateItemRequest(body);
            ItemValidator.validateCreateItem(req);
            String userId = ctx.get("userId");

            itemService.createFoundItem(req)
                    .compose(item -> itemService.logAudit(
                            "CREATE", "FoundItem", item.getString("_id"), userId, null, item
                    ).map(v -> item))
                    .onSuccess(item -> sendResponse(ctx, 201, ApiResponse.created(item)))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleUpdateFoundItem(RoutingContext ctx) {
        try {
            String id = ctx.pathParam("id");
            JsonObject body = ctx.body().asJsonObject();
            if (body == null) {
                ctx.fail(400, new IllegalArgumentException("Body is empty"));
                return;
            }
            UpdateItemStatusRequest req = new UpdateItemStatusRequest(body);
            ItemValidator.validateUpdateStatus(req);
            String userId = ctx.get("userId");

            itemService.getFoundItemById(id)
                    .compose(oldItem -> itemService.updateFoundItem(id, req)
                            .compose(newItem -> itemService.logAudit(
                                    "UPDATE", "FoundItem", id, userId, oldItem, newItem
                            ).map(v -> newItem)))
                    .onSuccess(item -> sendResponse(ctx, 200, ApiResponse.ok(item)))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleDeleteFoundItem(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        String userId = ctx.get("userId");

        itemService.getFoundItemById(id)
                .compose(oldItem -> itemService.deleteFoundItem(id)
                        .compose(v -> itemService.logAudit(
                                "DELETE", "FoundItem", id, userId, oldItem, null
                        )))
                .onSuccess(v -> sendResponse(ctx, 200, ApiResponse.ok("Found item deleted successfully", null)))
                .onFailure(ctx::fail);
    }

    private void handleGetExpiredItems(RoutingContext ctx) {
        try {
            int page = getQueryInt(ctx, "page", 1);
            int pageSize = getQueryInt(ctx, "pageSize", 25);
            String search = ctx.request().getParam("search");

            itemService.getExpiredItems(page, pageSize, search)
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res.toJson())))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleDisposeItem(RoutingContext ctx) {
        try {
            String id = ctx.pathParam("id");
            String type = ctx.request().getParam("type");
            if (type == null || (!"Found".equals(type) && !"Lost".equals(type))) {
                ctx.fail(400, new IllegalArgumentException("Query parameter 'type' must be 'Found' or 'Lost'"));
                return;
            }

            JsonObject body = ctx.body().asJsonObject();
            if (body == null) {
                ctx.fail(400, new IllegalArgumentException("Body is empty"));
                return;
            }
            DisposeItemRequest req = new DisposeItemRequest(body);
            ItemValidator.validateDispose(req);
            String userId = ctx.get("userId");

            String collection = "Found".equals(type) ? "found_items" : "lost_items";
            mongoClient.findOne(collection, new JsonObject().put("_id", id), null)
                    .compose(oldItem -> {
                        if (oldItem == null) {
                            return Future.failedFuture(new com.campus.lostfound.exception.NotFoundException("Item not found"));
                        }
                        return itemService.disposeItem(id, type, req)
                                .compose(disposedRecord -> itemService.logAudit(
                                        "DISPOSE", type + "Item", id, userId, oldItem, disposedRecord
                                ).map(v -> disposedRecord));
                    })
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res)))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleGetHistoryReturned(RoutingContext ctx) {
        try {
            int page = getQueryInt(ctx, "page", 1);
            int pageSize = getQueryInt(ctx, "pageSize", 10);
            String search = ctx.request().getParam("search");
            String type = ctx.request().getParam("type");
            String dateTo = ctx.request().getParam("dateTo");

            itemService.getReturnedItems(page, pageSize, search, type, dateTo)
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res.toJson())))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleGetHistoryDisposed(RoutingContext ctx) {
        try {
            int page = getQueryInt(ctx, "page", 1);
            int pageSize = getQueryInt(ctx, "pageSize", 10);
            String search = ctx.request().getParam("search");
            String type = ctx.request().getParam("type");
            String dateTo = ctx.request().getParam("dateTo");

            itemService.getDisposedItems(page, pageSize, search, type, dateTo)
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res.toJson())))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleGetHistoryLostNotFound(RoutingContext ctx) {
        try {
            int page = getQueryInt(ctx, "page", 1);
            int pageSize = getQueryInt(ctx, "pageSize", 10);
            String search = ctx.request().getParam("search");
            String dateTo = ctx.request().getParam("dateTo");

            itemService.getLostNotFoundItems(page, pageSize, search, dateTo)
                    .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res.toJson())))
                    .onFailure(ctx::fail);
        } catch (Exception e) {
            ctx.fail(400, e);
        }
    }

    private void handleGetHistoryStats(RoutingContext ctx) {
        itemService.getHistoryStats()
                .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res)))
                .onFailure(ctx::fail);
    }

    private void handleGetStatsOverview(RoutingContext ctx) {
        itemService.getOverviewStats()
                .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res)))
                .onFailure(ctx::fail);
    }

    private void handleGetStatsCountdown(RoutingContext ctx) {
        itemService.getCountdownStats()
                .onSuccess(res -> sendResponse(ctx, 200, ApiResponse.ok(res)))
                .onFailure(ctx::fail);
    }

    private void sendResponse(RoutingContext ctx, int statusCode, ApiResponse response) {
        ctx.response()
                .setStatusCode(statusCode)
                .putHeader("Content-Type", "application/json")
                .end(response.toJson().encode());
    }

    private int getQueryInt(RoutingContext ctx, String param, int defaultValue) {
        String val = ctx.request().getParam(param);
        if (val == null || val.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        vertx.deployVerticle(new CampusLostFoundApplication())
                .onSuccess(id -> logger.info("Verticle deployed successfully with ID: {}", id))
                .onFailure(err -> {
                    logger.error("Failed to deploy verticle", err);
                    System.exit(1);
                });
    }
}
