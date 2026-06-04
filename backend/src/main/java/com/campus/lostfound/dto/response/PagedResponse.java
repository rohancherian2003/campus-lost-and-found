package com.campus.lostfound.dto.response;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

/**
 * Paginated response wrapper.
 */
public class PagedResponse {

    private final List<JsonObject> items;
    private final int currentPage;
    private final int pageSize;
    private final long totalItems;
    private final int totalPages;

    public PagedResponse(List<JsonObject> items, int currentPage, int pageSize, long totalItems) {
        this.items = items;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalItems = totalItems;
        this.totalPages = (int) Math.ceil((double) totalItems / pageSize);
    }

    public JsonObject toJson() {
        JsonArray arr = new JsonArray();
        if (items != null) {
            items.forEach(arr::add);
        }
        return new JsonObject()
                .put("items", arr)
                .put("currentPage", currentPage)
                .put("pageSize", pageSize)
                .put("totalItems", totalItems)
                .put("totalPages", totalPages);
    }

    public List<JsonObject> getItems() { return items; }
    public int getCurrentPage() { return currentPage; }
    public int getPageSize() { return pageSize; }
    public long getTotalItems() { return totalItems; }
    public int getTotalPages() { return totalPages; }
}
