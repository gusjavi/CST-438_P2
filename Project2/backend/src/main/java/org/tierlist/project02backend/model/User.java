package org.tierlist.project02backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private String userId;

    private String username;
    private String email;

    @Column(nullable = false)  // Ensure it's required
    private String password;   // 🔹 ADD PASSWORD FIELD

    private boolean isAdmin;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor is required by JPA
    public User() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public User(String userId, String name, String email) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }


    // Getters and setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {  // 🔹 Renaming "username" to "name"
        return username;
    }

    public void setName(String name) {
        this.username = name;
        setUpdatedAt(LocalDateTime.now());
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
        setUpdatedAt(LocalDateTime.now());
    }

    public String getPassword() {  // 🔹 Add getter for password
        return password;
    }

    public void setPassword(String password) {  // 🔹 Add setter for password
        this.password = password;
        setUpdatedAt(LocalDateTime.now());
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
