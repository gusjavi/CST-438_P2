package org.tierlist.project02backend.controller;

import org.tierlist.project02backend.model.User;
import org.tierlist.project02backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Create a new user
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    // Delete a user
    //@DeleteMapping("/users/{username}")
    //public ResponseEntity<Void> deleteUser(@PathVariable String username) {
        //userService.deleteUser(username);
        //return ResponseEntity.ok().build();
   // }

    // Update a user
    @PatchMapping("/users/{username}")
    public ResponseEntity<User> updateUser(@PathVariable String username, @RequestBody User updatedUser) {
        return ResponseEntity.ok(userService.updateUser(
                username,
                updatedUser.getName(),  // 🔹 Changed from getUsername() to getName()
                updatedUser.getPassword(),
                updatedUser.isAdmin()
        ));
    }
}
