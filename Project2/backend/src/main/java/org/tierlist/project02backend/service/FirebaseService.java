package org.tierlist.project02backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {

    /**
     * Get the Firebase Auth instance
     * @return FirebaseAuth instance
     */
    public FirebaseAuth getFirebaseAuth() {
        return FirebaseAuth.getInstance();
    }

    /**
     * Verify an ID token and return the corresponding user record
     * @param idToken The Firebase ID token to verify
     * @return UserRecord of the authenticated user
     * @throws FirebaseAuthException if the token is invalid
     */
    public UserRecord getUserByToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        String uid = decodedToken.getUid();
        return FirebaseAuth.getInstance().getUser(uid);
    }

    /**
     * Create a custom token for a user
     * @param uid The user ID
     * @return A custom token
     * @throws FirebaseAuthException if token creation fails
     */
    public String createCustomToken(String uid) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().createCustomToken(uid);
    }
}