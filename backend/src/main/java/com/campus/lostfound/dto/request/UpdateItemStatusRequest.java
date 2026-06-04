package com.campus.lostfound.dto.request;

import io.vertx.core.json.JsonObject;

/**
 * Request DTO for updating item status (mark as returned).
 */
public class UpdateItemStatusRequest {

    private String status;
    private String studentName;
    private String rollNo;
    private String phone;
    private String email;
    private String returnedDate;
    private String returnedTime;
    private String remarks;

    public UpdateItemStatusRequest() {}

    public UpdateItemStatusRequest(JsonObject json) {
        this.status = json.getString("status");
        this.studentName = json.getString("studentName");
        this.rollNo = json.getString("rollNo");
        this.phone = json.getString("phone");
        this.email = json.getString("email");
        this.returnedDate = json.getString("returnedDate");
        this.returnedTime = json.getString("returnedTime");
        this.remarks = json.getString("remarks");
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
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
