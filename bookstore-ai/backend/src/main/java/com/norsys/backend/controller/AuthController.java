package com.norsys.backend.controller;

import com.norsys.backend.dto.AuthRequest;
import com.norsys.backend.dto.AuthResponse;
import com.norsys.backend.model.User;
import com.norsys.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")

public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody User user) {
        AuthResponse response = authService.signup(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody AuthRequest request) {
        AuthResponse response = authService.signin(request);
        return ResponseEntity.ok(response);
    }

}