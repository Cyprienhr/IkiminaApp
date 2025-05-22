package com.example.ikimina.repository;

import com.example.ikimina.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find user by phone number
    Optional<User> findByPhoneNumber(String phoneNumber);
    
    // Check if phone number exists
    boolean existsByPhoneNumber(String phoneNumber);
    
    // Find users by role
    Iterable<User> findByRole(User.UserRole role);
}