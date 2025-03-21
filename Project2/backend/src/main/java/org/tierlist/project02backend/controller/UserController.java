package org.tierlist.project02backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tierlist.project02backend.model.AuthResponse;
import org.tierlist.project02backend.model.User;
import com.google.firebase.auth.*;
import org.tierlist.project02backend.repository.UserRepository;
import org.tierlist.project02backend.service.AuthService;



import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuthService authService;

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Get user by ID
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        Optional<User> user = userRepository.findById(userId);

        if (user.isPresent()) {
            return new ResponseEntity<>(user.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get user ID by username
    @GetMapping("/by-name/{name}")
    public ResponseEntity<?> getUserIdByName(@PathVariable String name) {
        Optional<User> user = userRepository.findByName(name);

        if (user.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("userId", user.get().getUserId());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create new user
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User newUser = userRepository.save(user);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    // Update user
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId, @RequestBody User userDetails) {
        Optional<User> userData = userRepository.findById(userId);

        if (userData.isPresent()) {
            User user = userData.get();
            user.setName(userDetails.getName());
            user.setEmail(userDetails.getEmail());
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Add authentication check for deleting users
    @DeleteMapping("/{userId}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable String userId,
                                                 @RequestHeader("Authorization") String token) {
        try {
            // Extract token
            String idToken = token.replace("Bearer ", "");

            // Verify the Firebase token and get user info
            UserRecord userRecord = authService.verifyToken(idToken);
            String authenticatedUid = userRecord.getUid();

            // Security check: Only allow users to delete their own account
            if (!authenticatedUid.equals(userId)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Delete the user from your database
            userRepository.deleteById(userId);

            // Note: This doesn't delete the user from Firebase Auth
            // That's handled on the client side
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add endpoint to delete user data but keep the account
    @DeleteMapping("/{userId}/data")
    public ResponseEntity<HttpStatus> deleteUserData(@PathVariable String userId,
                                                     @RequestHeader("Authorization") String token) {
        try {
            // Extract token
            String idToken = token.replace("Bearer ", "");

            // Verify the Firebase token and get user info
            UserRecord userRecord = authService.verifyToken(idToken);
            String authenticatedUid = userRecord.getUid();

            // Security check: Only allow users to delete their own data
            if (!authenticatedUid.equals(userId)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            // Implement logic to delete user data (like tier lists, etc.)
            // This will depend on your data model
            // For example:
            // tierListRepository.deleteByUserId(userId);

            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}