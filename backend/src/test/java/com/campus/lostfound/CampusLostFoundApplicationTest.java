package com.campus.lostfound;

import com.campus.lostfound.util.PasswordUtils;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class CampusLostFoundApplicationTest {

    private CampusLostFoundApplication app;
    private Vertx vertx;

    @BeforeEach
    public void setUp() {
        app = new CampusLostFoundApplication();
        vertx = Vertx.vertx();
        app.init(vertx, vertx.getOrCreateContext());
    }

    @AfterEach
    public void tearDown() {
        vertx.close();
    }

    @Test
    public void testValidatePasswordSuccess() {
        // Minimum length 12, valid secure password
        assertDoesNotThrow(() -> app.validateAdminSeedPassword("StrongSecurePassword123!"));
    }

    @Test
    public void testValidatePasswordMissing() {
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            app.validateAdminSeedPassword(null);
        });
        assertTrue(ex.getMessage().contains("missing"));
    }

    @Test
    public void testValidatePasswordEmpty() {
        IllegalStateException ex1 = assertThrows(IllegalStateException.class, () -> {
            app.validateAdminSeedPassword("");
        });
        assertTrue(ex1.getMessage().contains("empty or blank"));

        IllegalStateException ex2 = assertThrows(IllegalStateException.class, () -> {
            app.validateAdminSeedPassword("    ");
        });
        assertTrue(ex2.getMessage().contains("empty or blank"));
    }

    @Test
    public void testValidatePasswordTooShort() {
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            app.validateAdminSeedPassword("shortpwd123"); // 11 characters
        });
        assertTrue(ex.getMessage().contains("at least 12 characters"));
    }

    @Test
    public void testValidatePasswordWeakRejection() {
        String[] weakPasswords = {"admin", "password", "admin123", "12345678", "qwerty123"};
        for (String weak : weakPasswords) {
            IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
                app.validateAdminSeedPassword(weak);
            });
            assertTrue(ex.getMessage().contains("weak password"));
        }
    }

    @Test
    public void testValidatePasswordComplexityRejection() {
        // Missing special character
        IllegalStateException ex1 = assertThrows(IllegalStateException.class, () -> {
            app.validateAdminSeedPassword("StrongPwd123");
        });
        assertTrue(ex1.getMessage().contains("complexity"));

        // Missing number
        IllegalStateException ex2 = assertThrows(IllegalStateException.class, () -> {
            app.validateAdminSeedPassword("StrongPwd!!!");
        });
        assertTrue(ex2.getMessage().contains("complexity"));

        // Missing uppercase
        IllegalStateException ex3 = assertThrows(IllegalStateException.class, () -> {
            app.validateAdminSeedPassword("strongpwd123!");
        });
        assertTrue(ex3.getMessage().contains("complexity"));

        // Missing lowercase
        IllegalStateException ex4 = assertThrows(IllegalStateException.class, () -> {
            app.validateAdminSeedPassword("STRONGPWD123!");
        });
        assertTrue(ex4.getMessage().contains("complexity"));
    }

    @Test
    public void testBCryptHashingValidation() {
        String password = "StrongSecurePassword123!";
        String hash = PasswordUtils.hashPasswordSync(password);
        assertNotNull(hash);
        assertTrue(hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")); // BCrypt prefix
        assertTrue(PasswordUtils.verifyPasswordSync(password, hash));
    }

    @Test
    public void testExistingAdminPreservation() throws Exception {
        MongoClient mongoClient = mock(MongoClient.class);
        
        // Mock existing admin user returned
        JsonObject existingAdmin = new JsonObject().put("email", "admin@campus.edu");
        when(mongoClient.findOne(eq("users"), any(), any()))
                .thenReturn(Future.succeededFuture(existingAdmin));
                
        // Mock categories counts to skip category seeding
        when(mongoClient.count(eq("categories"), any()))
                .thenReturn(Future.succeededFuture(1L));

        // Mock index creation methods
        when(mongoClient.createIndexWithOptions(anyString(), any(JsonObject.class), any()))
                .thenReturn(Future.succeededFuture());
        when(mongoClient.createIndex(anyString(), any(JsonObject.class)))
                .thenReturn(Future.succeededFuture());

        // Invoke seedDatabase
        Future<Void> seedFuture = app.seedDatabase(mongoClient, "StrongSecurePassword123!");
        
        // Block and verify success
        java.util.concurrent.CompletableFuture<Void> cf = new java.util.concurrent.CompletableFuture<>();
        seedFuture.onComplete(ar -> {
            if (ar.succeeded()) {
                cf.complete(null);
            } else {
                cf.completeExceptionally(ar.cause());
            }
        });
        cf.get(); // Wait for completion
        
        // Verify findOne was called but insert was never called on "users"
        verify(mongoClient, times(1)).findOne(eq("users"), any(), any());
        verify(mongoClient, never()).insert(eq("users"), any());
    }

    @Test
    public void testDatabaseIndexingRegistration() throws Exception {
        MongoClient mongoClient = mock(MongoClient.class);
        
        // Mock DB calls
        when(mongoClient.findOne(eq("users"), any(), any()))
                .thenReturn(Future.succeededFuture(null)); // Seed admin
        when(mongoClient.insert(eq("users"), any()))
                .thenReturn(Future.succeededFuture("admin_id"));
        when(mongoClient.count(eq("categories"), any()))
                .thenReturn(Future.succeededFuture(1L)); // Skip category seeding

        when(mongoClient.createIndexWithOptions(anyString(), any(JsonObject.class), any()))
                .thenReturn(Future.succeededFuture());
        when(mongoClient.createIndex(anyString(), any(JsonObject.class)))
                .thenReturn(Future.succeededFuture());

        // Invoke seedDatabase
        Future<Void> seedFuture = app.seedDatabase(mongoClient, "StrongSecurePassword123!");
        
        // Block and verify success
        java.util.concurrent.CompletableFuture<Void> cf = new java.util.concurrent.CompletableFuture<>();
        seedFuture.onComplete(ar -> {
            if (ar.succeeded()) {
                cf.complete(null);
            } else {
                cf.completeExceptionally(ar.cause());
            }
        });
        cf.get();
        
        // Verify index registrations on specific collections
        verify(mongoClient).createIndexWithOptions(eq("users"), eq(new JsonObject().put("email", 1)), any());
        verify(mongoClient).createIndex(eq("lost_items"), eq(new JsonObject().put("isDeleted", 1).put("status", 1).put("dateFound", 1)));
        verify(mongoClient).createIndex(eq("found_items"), eq(new JsonObject().put("isDeleted", 1).put("status", 1).put("dateFound", 1)));
        
        verify(mongoClient).createIndex(eq("audit_logs"), eq(new JsonObject().put("entityType", 1).put("entityId", 1).put("createdAt", -1)));
        verify(mongoClient).createIndex(eq("audit_logs"), eq(new JsonObject().put("userId", 1).put("createdAt", -1)));
        verify(mongoClient).createIndex(eq("audit_logs"), eq(new JsonObject().put("action", 1).put("createdAt", -1)));
        
        verify(mongoClient).createIndex(eq("disposed_items"), eq(new JsonObject().put("disposedDate", -1)));
        verify(mongoClient).createIndex(eq("disposed_items"), eq(new JsonObject().put("type", 1).put("disposedDate", -1)));
        verify(mongoClient).createIndex(eq("disposed_items"), eq(new JsonObject().put("disposalLocation", 1).put("disposedDate", -1)));
    }
}
