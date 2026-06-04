package com.campus.lostfound.exception;

public class AuthenticationException extends AppException {
    public AuthenticationException(String message) {
        super(401, message);
    }
}
