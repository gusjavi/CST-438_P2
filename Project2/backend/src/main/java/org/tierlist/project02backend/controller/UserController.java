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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(
        origins = "http://localhost", // The browser origin
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
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
    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getUserIdByEmail(@PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);

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

    @PatchMapping("/{userId}")
    public ResponseEntity<User> partialUpdateUser(
            @PathVariable String userId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader("Authorization") String token) {

        try {
            Optional<User> userData = userRepository.findById(userId);
            if (!userData.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            User user = userData.get();

            if (updates.containsKey("username") && updates.get("username") instanceof String) {
                user.setName((String) updates.get("username"));
            }

            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error in PATCH user: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add authentication check for deleting users
    @DeleteMapping("/{userId}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable String userId,
                                                 @RequestHeader("Authorization") String token) {
        try {
            String idToken = token.replace("Bearer ", "");
            UserRecord userRecord = authService.verifyToken(idToken);
            String authenticatedUid = userRecord.getUid();
            if (!authenticatedUid.equals(userId)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            userRepository.deleteById(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add endpoint to delete user data but keep the account doesnt work
    @DeleteMapping("/{userId}/data")
    public ResponseEntity<HttpStatus> deleteUserData(@PathVariable String userId,
                                                     @RequestHeader("Authorization") String token) {
        try {
            // Extract token
            String idToken = token.replace("Bearer ", "");

            UserRecord userRecord = authService.verifyToken(idToken);
            String authenticatedUid = userRecord.getUid();

            if (!authenticatedUid.equals(userId)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}