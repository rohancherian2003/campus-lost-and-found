package com.campus.lostfound.util;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Password hashing utilities using BCrypt, executing on Vert.x worker pool.
 */
public final class PasswordUtils {

    private static final int BCRYPT_ROUNDS = 12;

    private PasswordUtils() {}

    /**
     * Hash a plaintext password synchronously.
     */
    public static String hashPasswordSync(String plaintext) {
        return BCrypt.hashpw(plaintext, BCrypt.gensalt(BCRYPT_ROUNDS));
    }

    /**
     * Verify a plaintext password against a hash synchronously.
     */
    public static boolean verifyPasswordSync(String plaintext, String hash) {
        return BCrypt.checkpw(plaintext, hash);
    }

    /**
     * Hash a plaintext password asynchronously on a worker thread.
     */
    public static Future<String> hashPassword(Vertx vertx, String plaintext) {
        return vertx.executeBlocking(promise -> {
            try {
                promise.complete(hashPasswordSync(plaintext));
            } catch (Exception e) {
                promise.fail(e);
            }
        });
    }

    /**
     * Verify a plaintext password against a hash asynchronously on a worker thread.
     */
    public static Future<Boolean> verifyPassword(Vertx vertx, String plaintext, String hash) {
        return vertx.executeBlocking(promise -> {
            try {
                promise.complete(verifyPasswordSync(plaintext, hash));
            } catch (Exception e) {
                promise.fail(e);
            }
        });
    }
}
