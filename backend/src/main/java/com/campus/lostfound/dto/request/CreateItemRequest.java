package com.campus.lostfound.dto.request;

import io.vertx.core.json.JsonObject;

/**
 * Request DTO for creating/updating lost or found items.
 */
public class CreateItemRequest {

    private String name;
    private String location;
    private String date;
    private String collectFrom;
    private String description;
    private String image;
    private String category;

    // Reporter fields
    private String contactType; // "student" | "staff"
    private String studentName;
    private String rollNo;
    private String phone;
    private String email;
    private String staffName;
    private String employeeId;
    private String department;
    private String staffPhone;
    private String staffEmail;

    public CreateItemRequest() {}

    public CreateItemRequest(JsonObject json) {
        this.name = json.getString("name");
        this.location = json.getString("location");
        this.date = json.getString("date");
        this.collectFrom = json.getString("collectFrom");
        this.description = json.getString("description");
        this.image = json.getString("image");
        this.category = json.getString("category");
        this.contactType = json.getString("contactType", "student");
        this.studentName = json.getString("studentName");
        this.rollNo = json.getString("rollNo");
        this.phone = json.getString("phone");
        this.email = json.getString("email");
        this.staffName = json.getString("staffName");
        this.employeeId = json.getString("employeeId");
        this.department = json.getString("department");
        this.staffPhone = json.getString("staffPhone");
        this.staffEmail = json.getString("staffEmail");
    }

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getCollectFrom() { return collectFrom; }
    public void setCollectFrom(String collectFrom) { this.collectFrom = collectFrom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getContactType() { return contactType; }
    public void setContactType(String contactType) { this.contactType = contactType; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getStaffPhone() { return staffPhone; }
    public void setStaffPhone(String staffPhone) { this.staffPhone = staffPhone; }
    public String getStaffEmail() { return staffEmail; }
    public void setStaffEmail(String staffEmail) { this.staffEmail = staffEmail; }
}
