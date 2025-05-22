package com.example.ikimina.controller;

import com.example.ikimina.dto.AuthResponse;
import com.example.ikimina.dto.LoginRequest;
import com.example.ikimina.dto.RegisterRequest;
import com.example.ikimina.dto.UserDto;
import com.example.ikimina.entity.User;
import com.example.ikimina.security.JwtTokenProvider;
import com.example.ikimina.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, 
                         JwtTokenProvider jwtTokenProvider, 
                         UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            User user = userService.registerUser(
                registerRequest.getName(), 
                registerRequest.getPhoneNumber(), 
                registerRequest.getPassword()
            );
            
            UserDto userDto = new UserDto(user);
            String token = jwtTokenProvider.createToken(user.getPhoneNumber());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, userDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred during registration: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getPhoneNumber(), 
                    loginRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userService.getUserByPhoneNumber(loginRequest.getPhoneNumber())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            UserDto userDto = new UserDto(user);
            String token = jwtTokenProvider.createToken(user.getPhoneNumber());
            
            return ResponseEntity.ok(new AuthResponse(token, userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid phone number or password");
        }
    }
    
    /**
     * Logout endpoint to invalidate the JWT token
     * @param request the HTTP request containing the JWT token in the Authorization header
     * @return ResponseEntity with success or error message
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            // Extract the JWT token from the Authorization header
            String authorizationHeader = request.getHeader("Authorization");
            
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                
                // Blacklist the token
                jwtTokenProvider.blacklistToken(token);
                
                // Clear the security context
                SecurityContextHolder.clearContext();
                
                return ResponseEntity.ok().body("Logged out successfully");
            }
            
            return ResponseEntity.badRequest().body("No valid token found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred during logout: " + e.getMessage());
        }
    }
}