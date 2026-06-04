package com.campus.lostfound.exception;

public class ValidationException extends AppException {
    public ValidationException(String message) {
        super(400, message);
    }
}
