package com.campus.lostfound.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

/**
 * Date utility functions matching the standard ISO 8601 UTC date-time formats.
 */
public final class DateUtils {

    private DateUtils() {}

    /**
     * Format current timestamp as ISO 8601 UTC string.
     */
    public static String formatNow() {
        return Instant.now().toString();
    }

    /**
     * Format current date as ISO 8601 UTC string.
     */
    public static String formatDateNow() {
        return Instant.now().toString();
    }

    /**
     * Parse ISO 8601 date string to Instant.
     */
    public static Instant parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return Instant.parse(dateStr.trim());
        } catch (Exception e) {
            // Support fallback parsing for standard local date format (YYYY-MM-DD)
            try {
                return LocalDate.parse(dateStr.trim()).atStartOfDay(ZoneId.of("UTC")).toInstant();
            } catch (Exception ex) {
                return null;
            }
        }
    }

    /**
     * Calculate days elapsed since the given date string.
     */
    public static long daysElapsed(String dateStr) {
        Instant reported = parseDate(dateStr);
        if (reported == null) return 0;
        return ChronoUnit.DAYS.between(reported, Instant.now());
    }

    /**
     * Calculate remaining days in the 60-day claim window.
     */
    public static long daysRemaining(String dateStr) {
        long elapsed = daysElapsed(dateStr);
        return Math.max(0, 60 - elapsed);
    }

    /**
     * Check if item has expired (60+ days old).
     */
    public static boolean isExpired(String dateStr) {
        return daysElapsed(dateStr) >= 60;
    }

    /**
     * Get countdown status: "active", "expiring", "last10", "expired".
     */
    public static String getCountdownStatus(String dateStr) {
        long remaining = daysRemaining(dateStr);
        if (remaining <= 0) return "expired";
        if (remaining <= 10) return "last10";
        if (remaining <= 30) return "expiring";
        return "active";
    }

    /**
     * Get current ISO timestamp string.
     */
    public static String nowIso() {
        return Instant.now().toString();
    }

    /**
     * Check if a string is a valid ISO 8601 date-time string.
     */
    public static boolean isValidIso8601(String dateStr) {
        return parseDate(dateStr) != null;
    }

    /**
     * Check if a string represents a date in the future (after today in system timezone).
     */
    public static boolean isFutureDate(String dateStr) {
        Instant parsed = parseDate(dateStr);
        if (parsed == null) return false;
        java.time.LocalDate inputDate = parsed.atZone(java.time.ZoneId.of("UTC")).toLocalDate();
        java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneId.of("UTC"));
        return inputDate.isAfter(today.plusDays(1));
    }
}
