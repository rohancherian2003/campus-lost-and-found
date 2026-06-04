package com.campus.lostfound.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ItemServiceTest {

    private MongoClient mongoClient;
    private ItemService itemService;

    @BeforeEach
    public void setUp() {
        mongoClient = mock(MongoClient.class);
        itemService = new ItemService(mongoClient);
    }

    private void runSearchTest(String searchInput, String expectedRegexPattern) {
        // Mock mongoClient.count to return a completed future of 0 to stop further execution
        ArgumentCaptor<JsonObject> queryCaptor = ArgumentCaptor.forClass(JsonObject.class);
        when(mongoClient.count(eq("lost_items"), queryCaptor.capture()))
                .thenReturn(Future.succeededFuture(0L));

        // Trigger search
        itemService.getLostItems(1, 10, searchInput, null, null);

        // Verify query building
        JsonObject query = queryCaptor.getValue();
        assertNotNull(query);
        assertTrue(query.containsKey("$or"));

        // Verify search term is escaped in each field of $or block
        JsonObject firstOr = query.getJsonArray("$or").getJsonObject(0);
        String nameRegex = firstOr.getJsonObject("name").getString("$regex");
        assertEquals(expectedRegexPattern, nameRegex);

        JsonObject secondOr = query.getJsonArray("$or").getJsonObject(1);
        String descRegex = secondOr.getJsonObject("description").getString("$regex");
        assertEquals(expectedRegexPattern, descRegex);

        JsonObject thirdOr = query.getJsonArray("$or").getJsonObject(2);
        String locRegex = thirdOr.getJsonObject("location").getString("$regex");
        assertEquals(expectedRegexPattern, locRegex);
    }

    private void runLocationTest(String locationInput, String expectedRegexPattern) {
        ArgumentCaptor<JsonObject> queryCaptor = ArgumentCaptor.forClass(JsonObject.class);
        when(mongoClient.count(eq("lost_items"), queryCaptor.capture()))
                .thenReturn(Future.succeededFuture(0L));

        // Trigger location query
        itemService.getLostItems(1, 10, null, locationInput, null);

        // Verify query building
        JsonObject query = queryCaptor.getValue();
        assertNotNull(query);
        assertTrue(query.containsKey("location"));
        String locRegex = query.getJsonObject("location").getString("$regex");
        assertEquals(expectedRegexPattern, locRegex);
    }

    @Test
    public void testNormalInputs() {
        // Search inputs
        runSearchTest("Laptop", "Laptop");
        runSearchTest("Mobile", "Mobile");
        runSearchTest("Lost Wallet", "Lost Wallet");

        // Location inputs
        runLocationTest("Library", "Library");
        runLocationTest("Electronics", "Electronics");
    }

    @Test
    public void testMaliciousRegexInjectionInputs() {
        // Wildcards & special chars
        runSearchTest(".*", "\\.\\*");
        runSearchTest(".+", "\\.\\+");
        runSearchTest("[a-z]*", "\\[a-z\\]\\*");
        runSearchTest("(?=.)", "\\(\\?=\\.\\)");
        runSearchTest(".$", "\\.\\$");

        // ReDoS backtracking payloads
        runSearchTest("(a+)+", "\\(a\\+\\)\\+");
        runSearchTest("[a-z]{10000}", "\\[a-z\\]\\{10000\\}");

        // Alternation and anchors
        runSearchTest("test|admin", "test\\|admin");
        runSearchTest("^admin$", "\\^admin\\$");

        // Location inputs
        runLocationTest(".*", "\\.\\*");
        runLocationTest("(a+)+", "\\(a\\+\\)\\+");
    }
}
