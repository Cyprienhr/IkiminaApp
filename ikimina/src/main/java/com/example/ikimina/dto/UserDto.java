package com.example.ikimina.dto;

import com.example.ikimina.entity.User;

public class UserDto {
    private Long id;
    private String name;
    private String phoneNumber;
    private String role;
    private String status;
    
    // Default constructor
    public UserDto() {
    }
    
    // Constructor from User entity
    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.phoneNumber = user.getPhoneNumber();
        this.role = user.getRole().toString();
        this.status = user.getStatus().toString();
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}