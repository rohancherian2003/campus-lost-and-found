package com.campus.lostfound.validator;

import com.campus.lostfound.dto.request.CreateItemRequest;
import com.campus.lostfound.dto.request.DisposeItemRequest;
import com.campus.lostfound.dto.request.LoginRequest;
import com.campus.lostfound.dto.request.UpdateItemStatusRequest;
import com.campus.lostfound.exception.ValidationException;
import com.campus.lostfound.util.DateUtils;

/**
 * Input validation for all request DTOs, enforcing ISO 8601 standards.
 */
public final class ItemValidator {

    private ItemValidator() {}

    public static void validateLogin(LoginRequest req) {
        if (isBlank(req.getEmail())) {
            throw new ValidationException("Email is required");
        }
        if (!req.getEmail().contains("@")) {
            throw new ValidationException("Invalid email format");
        }
        if (isBlank(req.getPassword())) {
            throw new ValidationException("Password is required");
        }
    }

    public static void validateCreateItem(CreateItemRequest req) {
        if (isBlank(req.getName())) {
            throw new ValidationException("Item name is required");
        }
        if (isBlank(req.getLocation())) {
            throw new ValidationException("Location is required");
        }
        if (isBlank(req.getDate())) {
            throw new ValidationException("Date is required");
        }
        if (!DateUtils.isValidIso8601(req.getDate())) {
            throw new ValidationException("Invalid date format. Date must be in valid ISO 8601 UTC format.");
        }
        if (DateUtils.isFutureDate(req.getDate())) {
            throw new ValidationException("Date cannot be in the future");
        }
        if (isBlank(req.getDescription())) {
            throw new ValidationException("Description is required");
        }
        
        // Validate contact info based on contact type
        String contactType = req.getContactType();
        if ("student".equals(contactType)) {
            if (isBlank(req.getStudentName())) {
                throw new ValidationException("Student name is required");
            }
            if (isBlank(req.getRollNo())) {
                throw new ValidationException("Roll number is required");
            }
            if (isBlank(req.getPhone())) {
                throw new ValidationException("Phone number is required");
            }
            if (isBlank(req.getEmail())) {
                throw new ValidationException("Email address is required");
            }
        } else if ("staff".equals(contactType)) {
            if (isBlank(req.getStaffName())) {
                throw new ValidationException("Staff name is required");
            }
            if (isBlank(req.getEmployeeId())) {
                throw new ValidationException("Employee ID is required");
            }
            if (isBlank(req.getDepartment())) {
                throw new ValidationException("Department is required");
            }
            if (isBlank(req.getStaffPhone())) {
                throw new ValidationException("Staff phone number is required");
            }
            if (isBlank(req.getStaffEmail())) {
                throw new ValidationException("Staff email is required");
            }
        } else {
            throw new ValidationException("Contact type must be either 'student' or 'staff'");
        }
    }

    public static void validateUpdateStatus(UpdateItemStatusRequest req) {
        if (isBlank(req.getStatus())) {
            throw new ValidationException("Status is required");
        }
        if (!"Not Returned".equals(req.getStatus()) && !"Returned".equals(req.getStatus())) {
            throw new ValidationException("Status must be 'Not Returned' or 'Returned'");
        }
        if ("Returned".equals(req.getStatus())) {
            if (isBlank(req.getStudentName())) {
                throw new ValidationException("Student name is required when marking as returned");
            }
            if (isBlank(req.getRollNo())) {
                throw new ValidationException("Roll number is required when marking as returned");
            }
            if (!isBlank(req.getReturnedDate())) {
                if (!DateUtils.isValidIso8601(req.getReturnedDate())) {
                    throw new ValidationException("Invalid returned date format. Date must be in valid ISO 8601 UTC format.");
                }
                if (DateUtils.isFutureDate(req.getReturnedDate())) {
                    throw new ValidationException("Returned date cannot be in the future");
                }
            }
        }
    }

    public static void validateDispose(DisposeItemRequest req) {
        if (isBlank(req.getDisposalLocation())) {
            throw new ValidationException("Disposal location / club is required");
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
