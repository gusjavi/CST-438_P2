package org.tierlist.project02backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class FirebaseConfigController {

    // Firebase configuration loaded from environment variables
    @Value("${FIREBASE_API_KEY}")
    private String apiKey;

    @Value("${FIREBASE_AUTH_DOMAIN}")
    private String authDomain;

    @Value("${FIREBASE_PROJECT_ID}")
    private String projectId;

    @Value("${FIREBASE_STORAGE_BUCKET}")
    private String storageBucket;

    @Value("${FIREBASE_MESSAGING_SENDER_ID}")
    private String messagingSenderId;

    @Value("${FIREBASE_APP_ID}")
    private String appId;

    @GetMapping("/firebase-config")
    public Map<String, String> getFirebaseConfig() {
        return Map.of(
                "FIREBASE_API_KEY", apiKey,
                "FIREBASE_AUTH_DOMAIN", authDomain,
                "FIREBASE_PROJECT_ID", projectId,
                "FIREBASE_STORAGE_BUCKET", storageBucket,
                "FIREBASE_MESSAGING_SENDER_ID", messagingSenderId,
                "FIREBASE_APP_ID", appId
        );
    }
}

