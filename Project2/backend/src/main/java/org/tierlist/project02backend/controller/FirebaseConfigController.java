package org.tierlist.project02backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FirebaseConfigController {

    @GetMapping("/firebase-config")
    public Map<String, String> getFirebaseConfig() {
        return Map.of(
                "apiKey", "AIzaSyDRUhjpENDGnVxcWzf7GZEXYEI620m0FUc",
                "authDomain", "autho-8946f.firebaseapp.com",
                "projectId", "autho-8946f",
                "storageBucket", "autho-8946f.appspot.com",
                "messagingSenderId", "812368438765",
                "appId", "1:812368438765:web:0daa5d1f2b9ef8db873e4"
        );
    }
}
