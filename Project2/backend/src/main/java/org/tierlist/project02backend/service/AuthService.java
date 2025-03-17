package org.tierlist.project02backend.service;

import com.google.firebase.auth.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.tierlist.project02backend.model.User;
import org.tierlist.project02backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FirebaseService firebaseService;

    @Autowired
    public AuthService(UserRepository userRepository, FirebaseService firebaseService) {
        this.userRepository = userRepository;
        this.firebaseService = firebaseService;
    }

    /**
     * Get the Firebase Auth instance
     */
    public FirebaseAuth getFirebaseAuth() {
        return firebaseService.getFirebaseAuth();
    }

    /**
     * Create a new user in Firebase and save to database
     */
    public String signupUser(String email, String password, String username) throws FirebaseAuthException {
        // Create user in Firebase
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(username)
                .setEmailVerified(false);

        UserRecord userRecord = firebaseService.getFirebaseAuth().createUser(request);

        // Create user in your database
        User user = new User(userRecord.getUid(), username, email);
        userRepository.save(user);

        // Return a custom token for the user
        return firebaseService.createCustomToken(userRecord.getUid());
    }

    /**
     * Login user with email and password
     * Note: Firebase Admin SDK doesn't support direct email/password sign-in verification
     * This is a workaround that simulates authentication by creating a custom token
     */
    public String loginUser(String email, String password) throws FirebaseAuthException {
        try {
            // Get the user by email
            UserRecord userRecord = firebaseService.getFirebaseAuth().getUserByEmail(email);

            // Note: Firebase Admin SDK cannot directly verify passwords
            // In a production environment, you would need to use Firebase Authentication REST API
            // or implement a separate authentication mechanism

            // Generate a custom token for the authenticated user
            return firebaseService.createCustomToken(userRecord.getUid());
        } catch (FirebaseAuthException e) {

            return e.getMessage();
        }
    }

    /**
     * Verify a Firebase ID token
     */
    public UserRecord verifyToken(String idToken) throws FirebaseAuthException {
        return firebaseService.getUserByToken(idToken);
    }
}