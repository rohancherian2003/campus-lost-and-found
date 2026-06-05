package com.campus.lostfound.config;

import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Application configuration loaded from environment variables, profiles, or defaults.
 */
public class AppConfig {
    private static final Logger logger = LoggerFactory.getLogger(AppConfig.class);

    private final int httpPort;
    private final String mongoUri;
    private final String mongoDatabase;
    private final String jwtSecret;
    private final String corsOrigin;

    private static final Map<String, String> dotEnvMap = new HashMap<>();

    static {
        // Load .env from workspace root or backend root
        java.io.File envFile = new java.io.File(".env");
        if (!envFile.exists()) {
            envFile = new java.io.File("../.env");
        }
        if (envFile.exists()) {
            try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.substring(1, value.length() - 1);
                        }
                        dotEnvMap.put(key, value);
                    }
                }
                logger.info("Loaded environment variables from .env file successfully.");
            } catch (Exception e) {
                logger.error("Error reading .env file: {}", e.getMessage());
            }
        } else {
            logger.warn(".env file not found. Falling back to system environment variables only.");
        }
    }

    public static String getEnv(String key) {
        String val = System.getenv(key);
        if (val == null) {
            val = dotEnvMap.get(key);
        }
        return val;
    }

    public static String getEnv(String key, String defaultValue) {
        String val = getEnv(key);
        return val != null ? val : defaultValue;
    }

    public AppConfig(JsonObject config) {
        // 1. Determine the active profile (default to 'dev')
        String profile = getEnv("ACTIVE_PROFILE", "dev");
        logger.info("Loading configuration for profile: {}", profile);

        // 2. Load the profile JSON configuration file
        JsonObject profileConfig = loadProfileConfig(profile);

        // 3. Fallback to passed config (for testing)
        JsonObject mergedConfig = profileConfig.mergeIn(config != null ? config : new JsonObject());

        // 4. Resolve variables with order of precedence: 
        //    Environment Variable / .env > profileConfig > Defaults
        this.httpPort = Integer.parseInt(getEnv("HTTP_PORT", 
                mergedConfig.getValue("HTTP_PORT", "8080").toString()));

        this.mongoUri = getEnv("MONGO_URI", 
                mergedConfig.getString("MONGO_URI", "mongodb://localhost:27017"));

        this.mongoDatabase = getEnv("MONGO_DATABASE", 
                mergedConfig.getString("MONGO_DATABASE", "campus_lost_found"));

        this.corsOrigin = getEnv("CORS_ORIGIN", 
                mergedConfig.getString("CORS_ORIGIN", "http://localhost:4200"));

        String secret = getEnv("JWT_SECRET", mergedConfig.getString("JWT_SECRET"));

        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("JWT_SECRET configuration is missing or empty.");
        }

        secret = secret.trim();
        if (secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET is too short. Minimum required length is 32 characters.");
        }
        this.jwtSecret = secret;
    }

    private JsonObject loadProfileConfig(String profile) {
        String fileName = "application-" + profile + ".json";
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(fileName)) {
            if (is == null) {
                logger.warn("Profile configuration file {} not found on classpath, using default values.", fileName);
                return new JsonObject();
            }
            byte[] bytes = is.readAllBytes();
            String jsonStr = new String(bytes, StandardCharsets.UTF_8);
            return new JsonObject(jsonStr);
        } catch (Exception e) {
            logger.error("Failed to load profile configuration file {}: {}", fileName, e.getMessage());
            return new JsonObject();
        }
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
