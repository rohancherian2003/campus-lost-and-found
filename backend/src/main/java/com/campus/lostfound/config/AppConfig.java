package com.campus.lostfound.config;

import io.vertx.core.json.JsonObject;

/**
 * Application configuration loaded from environment variables or defaults.
 */
public class AppConfig {

    private final int httpPort;
    private final String mongoUri;
    private final String mongoDatabase;
    private final String jwtSecret;
    private final String corsOrigin;

    public AppConfig(JsonObject config) {
        this.httpPort = config.getInteger("HTTP_PORT",
                Integer.parseInt(System.getenv().getOrDefault("HTTP_PORT", "8080")));
        this.mongoUri = config.getString("MONGO_URI",
                System.getenv().getOrDefault("MONGO_URI", "mongodb://localhost:27017"));
        this.mongoDatabase = config.getString("MONGO_DATABASE",
                System.getenv().getOrDefault("MONGO_DATABASE", "campus_lost_found"));
        
        // Read JWT_SECRET from config or environment variables
        String secret = config.getString("JWT_SECRET", System.getenv("JWT_SECRET"));
        
        if (secret == null) {
            throw new IllegalStateException("JWT_SECRET environment variable is missing.");
        }
        
        secret = secret.trim();
        if (secret.isEmpty()) {
            throw new IllegalStateException("JWT_SECRET environment variable is empty.");
        }
        
        if (secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET is too short. Minimum required length is 32 characters for security compliance.");
        }
        
        this.jwtSecret = secret;
        
        this.corsOrigin = config.getString("CORS_ORIGIN",
                System.getenv().getOrDefault("CORS_ORIGIN", "http://localhost:4200"));
    }

    public int getHttpPort() { return httpPort; }
    public String getMongoUri() { return mongoUri; }
    public String getMongoDatabase() { return mongoDatabase; }
    public String getJwtSecret() { return jwtSecret; }
    public String getCorsOrigin() { return corsOrigin; }

    public JsonObject getMongoConfig() {
        return new JsonObject()
                .put("connection_string", mongoUri)
                .put("db_name", mongoDatabase);
    }
}
