package org.tierlist.project02backend.model;

public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String uid;



    // Getters and setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
}