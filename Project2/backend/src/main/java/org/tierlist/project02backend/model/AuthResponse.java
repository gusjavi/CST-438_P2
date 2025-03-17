package org.tierlist.project02backend.model;

public class AuthResponse {
    private boolean success;
    private String data;
    private String error;
    private String username;  // Added username field

    public AuthResponse() {}

    public AuthResponse(boolean success, String data, String error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }

    // Getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    // New getter and setter for username
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}