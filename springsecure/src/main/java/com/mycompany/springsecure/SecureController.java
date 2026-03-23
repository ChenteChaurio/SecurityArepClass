package com.mycompany.springsecure;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure")
public class SecureController {

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping(Principal principal) {
        return ResponseEntity.ok(Map.of(
                "message", "Acceso seguro correcto",
                "email", principal.getName()));
    }
}
