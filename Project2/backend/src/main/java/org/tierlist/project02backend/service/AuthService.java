package org.tierlist.project02backend.service;

import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;





import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;


import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    // Securely inject the Firebase API key from application.properties (or env variables)
    @Value("${firebase.apiKey}")
    private String firebaseApiKey;

    // New login method using the Firebase Identity Toolkit REST API
    public String loginUser(String email, String password) throws FirebaseAuthException {
        try {
            // Construct the endpoint URL using your secure API key
            String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + firebaseApiKey;

            // Prepare the request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("email", email);
            requestBody.put("password", password);
            requestBody.put("returnSecureToken", true);

            // Use RestTemplate to send the POST request
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestBody, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseBody = response.getBody();
                if (responseBody.containsKey("idToken")) {
                    // Retrieve the ID token returned by Firebase Identity Toolkit
                    String idToken = (String) responseBody.get("idToken");

                    // Verify the token using Firebase Admin SDK to ensure its validity
                    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                    String uid = decodedToken.getUid();

                    // Create a custom token for your application (optional)
                    String customToken = FirebaseAuth.getInstance().createCustomToken(uid);
                    return customToken;
                } else {
                    throw new RuntimeException("LOGIN_FAILED: idToken not found in response");
                }
            } else {

                throw new RuntimeException("LOGIN_FAILED: idToken not found in response");

            }
        } catch (Exception e) {

            throw new RuntimeException("LOGIN_FAILED: " + e.getMessage(), e);


        }
    } // <-- Close loginUser method here

    // Verify an ID token from Firebase
    public UserRecord verifyToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        return FirebaseAuth.getInstance().getUser(decodedToken.getUid());
    }

    // Create a new user using Firebase Admin SDK
    public UserRecord createUser(String email, String password, String displayName) throws FirebaseAuthException {
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(displayName)
                .setEmailVerified(false);

        return FirebaseAuth.getInstance().createUser(request);
    }

    public String signupUser(String email, String password, String displayName) throws FirebaseAuthException {
        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + firebaseApiKey;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("email", email);
        requestBody.put("password", password);
        requestBody.put("returnSecureToken", true);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestBody, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map body = response.getBody();
            if (body.containsKey("idToken")) {
                String idToken = (String) body.get("idToken");
                FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String uid = decoded.getUid();

                // Optionally update displayName with Admin SDK
                UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(uid)
                        .setDisplayName(displayName);
                FirebaseAuth.getInstance().updateUser(updateRequest);

                // Return custom token or the idToken
                return FirebaseAuth.getInstance().createCustomToken(uid);
            } else {
                throw new RuntimeException("SIGNUP_FAILED: idToken not found in response");
            }
        } else {
            throw new RuntimeException("SIGNUP_FAILED: HTTP error: " + response.getStatusCode());
        }
    }

    //  Added Google Token Verification
    public UserRecord verifyGoogleToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        return FirebaseAuth.getInstance().getUser(decodedToken.getUid());
    }

    // JWT Token Generation for Authenticated Users
    public String generateJwtToken(String uid) {
        String secretKey = "your_secret_key"; // Store securely in environment variables

        return Jwts.builder()
                .setSubject(uid)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day expiry
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }


}
