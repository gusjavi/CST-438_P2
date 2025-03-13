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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;





@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            String customToken = authService.loginUser(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(new AuthResponse(true, customToken, null));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.ok(new AuthResponse(false, null, e.getMessage()));
        }
    }
    @PostMapping("/google-verify")
    public ResponseEntity<AuthResponse> verifyGoogleToken(@RequestBody AuthRequest request) {
        try {
            UserRecord user = authService.verifyToken(request.getToken());
            // If needed, create or fetch a user in your DB, then respond
            return ResponseEntity.ok(new AuthResponse(true, user.getUid(), null));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.ok(new AuthResponse(false, null, e.getMessage()));
        }
    }





    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verifyToken(@RequestBody AuthRequest request) {
        try {
            UserRecord user = authService.verifyToken(request.getToken());
            return ResponseEntity.ok(new AuthResponse(true, user.getDisplayName(), null));
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
            return ResponseEntity.ok(new AuthResponse(true, customToken, null));
        } catch (Exception e) {
            return ResponseEntity.ok(new AuthResponse(false, null, e.getMessage()));
        }
    }

}