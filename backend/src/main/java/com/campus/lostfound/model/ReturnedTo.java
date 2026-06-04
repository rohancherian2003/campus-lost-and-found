package com.campus.lostfound.model;

import io.vertx.core.json.JsonObject;

/**
 * Embedded return-to subdocument for tracking who collected an item.
 */
public class ReturnedTo {

    private String studentName;
    private String rollNo;
    private String phone;
    private String email;
    private String returnedDate;
    private String returnedTime;
    private String remarks;

    public ReturnedTo() {}

    public ReturnedTo(JsonObject json) {
        if (json == null) return;
        this.studentName = json.getString("studentName");
        this.rollNo = json.getString("rollNo");
        this.phone = json.getString("phone");
        this.email = json.getString("email");
        this.returnedDate = json.getString("returnedDate");
        this.returnedTime = json.getString("returnedTime");
        this.remarks = json.getString("remarks");
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();
        if (studentName != null) json.put("studentName", studentName);
        if (rollNo != null) json.put("rollNo", rollNo);
        if (phone != null) json.put("phone", phone);
        if (email != null) json.put("email", email);
        if (returnedDate != null) json.put("returnedDate", returnedDate);
        if (returnedTime != null) json.put("returnedTime", returnedTime);
        if (remarks != null) json.put("remarks", remarks);
        return json;
    }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getReturnedDate() { return returnedDate; }
    public void setReturnedDate(String returnedDate) { this.returnedDate = returnedDate; }
    public String getReturnedTime() { return returnedTime; }
    public void setReturnedTime(String returnedTime) { this.returnedTime = returnedTime; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
