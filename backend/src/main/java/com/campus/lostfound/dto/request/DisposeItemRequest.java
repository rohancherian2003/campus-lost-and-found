package com.campus.lostfound.dto.request;

import io.vertx.core.json.JsonObject;

/**
 * Request DTO for disposing an expired item.
 */
public class DisposeItemRequest {

    private String disposalLocation;
    private String donatedTo;
    private String notes;

    public DisposeItemRequest() {}

    public DisposeItemRequest(JsonObject json) {
        this.disposalLocation = json.getString("disposalLocation");
        this.donatedTo = json.getString("donatedTo");
        this.notes = json.getString("notes");
    }

    public String getDisposalLocation() { return disposalLocation; }
    public void setDisposalLocation(String disposalLocation) { this.disposalLocation = disposalLocation; }
    public String getDonatedTo() { return donatedTo; }
    public void setDonatedTo(String donatedTo) { this.donatedTo = donatedTo; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
