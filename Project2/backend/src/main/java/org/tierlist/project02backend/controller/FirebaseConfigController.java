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
                
    }
}
