package org.tierlist.project02backend.controller;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tierlist.project02backend.service.AuthService;
import org.tierlist.project02backend.model.AuthRequest;
import org.tierlist.project02backend.model.AuthResponse;
import org.tierlist.project02backend.model.SignupRequest;
import org.tierlist.project02backend.model.User;
import org.tierlist.project02backend.repository.UserRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(
        origins = "http://localhost",
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @Autowired
    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            // Get user information and token
            UserRecord userRecord = authService.getFirebaseAuth().getUserByEmail(request.getEmail());
            String customToken = authService.loginUser(request.getEmail(), request.getPassword());

            // Create response with username
            AuthResponse response = new AuthResponse(true, customToken, null);
            response.setUsername(userRecord.getDisplayName());

            return ResponseEntity.ok(response);
        } catch (FirebaseAuthException e) {
            return ResponseEntity.ok(new AuthResponse(false, null, e.getMessage()));
        }
    }

    @PostMapping("/google-verify")
    public ResponseEntity<AuthResponse> verifyGoogleToken(@RequestBody AuthRequest request) {
        try {
            UserRecord user = authService.verifyToken(request.getToken());

            // Check if user exists in our database, if not create them
            User dbUser = userRepository.findById(user.getUid()).orElse(null);
            if (dbUser == null) {
                // Create a new user in our database
                dbUser = new User(user.getUid(), user.getDisplayName(), user.getEmail());
                userRepository.save(dbUser);
            }

            // Create response with username
            AuthResponse response = new AuthResponse(true, user.getUid(), null);
            response.setUsername(user.getDisplayName());
            return ResponseEntity.ok(response);
        } catch (FirebaseAuthException e) {
            return ResponseEntity.ok(new AuthResponse(false, null, e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verifyToken(@RequestBody AuthRequest request) {
        try {
            UserRecord user = authService.verifyToken(request.getToken());

            // Include username in response
            AuthResponse response = new AuthResponse(true, user.getUid(), null);
            response.setUsername(user.getDisplayName());
            return ResponseEntity.ok(response);
        } catch (FirebaseAuthException e) {
            return ResponseEntity.ok(new AuthResponse(false, null, e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        try {
            String customToken = authService.signupUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getUsername()
            );

            // Include username in response
            AuthResponse response = new AuthResponse(true, customToken, null);
            response.setUsername(request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(new AuthResponse(false, null, e.getMessage()));
        }
    }

    @PostMapping("/save-user")
    public ResponseEntity<AuthResponse> saveUser(@RequestBody SignupRequest request,
                                                 @RequestHeader("Authorization") String token) {
        try {
            // Extract the token from the Authorization header
            String idToken = token.replace("Bearer ", "");

            // Verify the Firebase token and get user info
            UserRecord userRecord = authService.verifyToken(idToken);
            String uid = userRecord.getUid();  // This is the trusted UID

            // Create and save user to database - use the UID from the token
            User user = new User(request.getUid(), request.getUsername(), request.getEmail());

            userRepository.save(user);

            // Include username in response
            AuthResponse response = new AuthResponse(true, uid, null);
            response.setUsername(request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(new AuthResponse(false, null, e.getMessage()));
        }
    }
}