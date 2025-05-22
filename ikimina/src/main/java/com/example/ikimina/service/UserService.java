package com.example.ikimina.service;

import com.example.ikimina.entity.User;
import com.example.ikimina.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Initialize the system with a default admin user
     */
    @PostConstruct
    public void init() {
        // Check if system admin exists, if not create one
        if (userRepository.findByRole(User.UserRole.SYSTEM_ADMIN).spliterator().getExactSizeIfKnown() == 0) {
            User adminUser = new User();
            adminUser.setName("System Admin");
            adminUser.setPhoneNumber("0787140195"); // Default admin phone
            adminUser.setPassword(passwordEncoder.encode("rwendere")); // Now properly encoded
            adminUser.setRole(User.UserRole.SYSTEM_ADMIN);
            userRepository.save(adminUser);
        }
    }

    /**
     * Register a new user
     */
    public User registerUser(String name, String phoneNumber, String password) {
        // Check if phone number already exists
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("Phone number already registered");
        }

        User user = new User();
        user.setName(name);
        user.setPhoneNumber(phoneNumber);
        user.setPassword(passwordEncoder.encode(password)); // Now properly encoded
        user.setRole(User.UserRole.MEMBER); // Default role is MEMBER

        return userRepository.save(user);
    }

    /**
     * Update a user's role to GROUP_ADMIN
     */
    public User promoteToGroupAdmin(User user) {
        user.setRole(User.UserRole.GROUP_ADMIN);
        return userRepository.save(user);
    }

    /**
     * Get user by ID
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Get user by phone number
     */
    public Optional<User> getUserByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Update user information
     */
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Delete a user account
     */
    @Transactional
    public void deleteUser(User user) {
        // Set user status to INACTIVE (soft delete)
        user.setStatus(User.UserStatus.INACTIVE);
        userRepository.save(user);
    }
}