package com.codehire.controller;

import com.codehire.dto.ApiResponse;
import com.codehire.dto.user.AuthRequest;
import com.codehire.dto.user.AuthResponse;
import com.codehire.dto.user.RegisterRequest;
import com.codehire.service.user.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest authRequest)
    {
         AuthResponse response= authService.login(authRequest);
         return ResponseEntity.ok(
                 new ApiResponse<>(true , "User logedin successfully" , response )
         );
    }


    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> register(@ModelAttribute RegisterRequest registerRequest) throws IOException {
        authService.register(registerRequest);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "User registered successfully", null)
        );
    }
}
