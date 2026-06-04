package com.campus.lostfound.model;

import io.vertx.core.json.JsonObject;

/**
 * Embedded reporter contact information.
 */
public class Reporter {

    private String name;
    private String rollNo;
    private String phone;
    private String email;
    private String type; // "STUDENT" | "STAFF"
    private String employeeId;
    private String department;

    public Reporter() {}

    public Reporter(JsonObject json) {
        if (json == null) return;
        this.name = json.getString("name");
        this.rollNo = json.getString("rollNo");
        this.phone = json.getString("phone");
        this.email = json.getString("email");
        this.type = json.getString("type", "STUDENT");
        this.employeeId = json.getString("employeeId");
        this.department = json.getString("department");
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();
        if (name != null) json.put("name", name);
        if (rollNo != null) json.put("rollNo", rollNo);
        if (phone != null) json.put("phone", phone);
        if (email != null) json.put("email", email);
        if (type != null) json.put("type", type);
        if (employeeId != null) json.put("employeeId", employeeId);
        if (department != null) json.put("department", department);
        return json;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
