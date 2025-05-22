package com.example.ikimina.controller;

import com.example.ikimina.entity.Group;
import com.example.ikimina.entity.User;
import com.example.ikimina.service.GroupService;
import com.example.ikimina.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;
    
    @Autowired
    private UserService userService;

    /**
     * Create a new group
     */
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> request) {
        try {
            // Extract request parameters
            String groupName = (String) request.get("groupName");
            String description = (String) request.get("description");
            Long createdByUserId = Long.valueOf(request.get("createdByUserId").toString());
            BigDecimal paymentAmount = new BigDecimal(request.get("paymentAmount").toString());
            String paymentFrequency = (String) request.get("paymentFrequency");
            
            // Validate request parameters
            if (groupName == null || createdByUserId == null || paymentAmount == null || paymentFrequency == null) {
                return ResponseEntity.badRequest().body("Group name, created by user ID, payment amount, and payment frequency are required");
            }
            
            // Get the user who is creating the group
            Optional<User> userOpt = userService.getUserById(createdByUserId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with ID: " + createdByUserId);
            }
            
            // Create the group
            Group.PaymentFrequency frequency;
            try {
                frequency = Group.PaymentFrequency.valueOf(paymentFrequency.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid payment frequency. Valid values are: WEEKLY, BIWEEKLY, MONTHLY");
            }
            
            Group group = groupService.createGroup(groupName, description, paymentAmount, frequency, userOpt.get());
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", group.getId());
            response.put("groupName", group.getGroupName());
            response.put("description", group.getDescription());
            response.put("createdByUser", group.getCreatedByUser().getId());
            response.put("paymentAmount", group.getPaymentAmount());
            response.put("paymentFrequency", group.getPaymentFrequency());
            response.put("createdDate", group.getCreatedDate());
            response.put("message", "Group created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get group by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupById(@PathVariable Long id) {
        try {
            Optional<Group> groupOpt = groupService.getGroupById(id);
            
            if (groupOpt.isPresent()) {
                Group group = groupOpt.get();
                
                // Create response
                Map<String, Object> response = new HashMap<>();
                response.put("id", group.getId());
                response.put("groupName", group.getGroupName());
                response.put("description", group.getDescription());
                response.put("createdByUser", group.getCreatedByUser().getId());
                response.put("paymentAmount", group.getPaymentAmount());
                response.put("paymentFrequency", group.getPaymentFrequency());
                response.put("createdDate", group.getCreatedDate());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Group not found with ID: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get all groups
     */
    @GetMapping
    public ResponseEntity<?> getAllGroups() {
        try {
            List<Group> groups = groupService.getAllGroups();
            
            // Create a list to hold the safe response objects
            List<Map<String, Object>> responseList = new ArrayList<>();
            
            for (Group group : groups) {
                Map<String, Object> groupMap = new HashMap<>();
                groupMap.put("id", group.getId());
                groupMap.put("groupName", group.getGroupName());
                groupMap.put("description", group.getDescription());
                
                // Safely handle potentially null objects
                if (group.getCreatedByUser() != null) {
                    groupMap.put("createdByUser", group.getCreatedByUser().getId());
                } else {
                    groupMap.put("createdByUser", null);
                }
                
                groupMap.put("paymentAmount", group.getPaymentAmount());
                groupMap.put("paymentFrequency", group.getPaymentFrequency() != null ? 
                        group.getPaymentFrequency().toString() : null);
                groupMap.put("createdDate", group.getCreatedDate());
                
                responseList.add(groupMap);
            }
            
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get groups created by a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getGroupsByUser(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with ID: " + userId);
            }
            
            List<Group> groups = groupService.getGroupsByCreator(userOpt.get());
            
            // Create a list to hold the safe response objects
            List<Map<String, Object>> responseList = new ArrayList<>();
            
            for (Group group : groups) {
                Map<String, Object> groupMap = new HashMap<>();
                groupMap.put("id", group.getId());
                groupMap.put("groupName", group.getGroupName());
                groupMap.put("description", group.getDescription());
                
                // Safely handle potentially null objects
                if (group.getCreatedByUser() != null) {
                    groupMap.put("createdByUser", group.getCreatedByUser().getId());
                } else {
                    groupMap.put("createdByUser", null);
                }
                
                groupMap.put("paymentAmount", group.getPaymentAmount());
                groupMap.put("paymentFrequency", group.getPaymentFrequency() != null ? 
                        group.getPaymentFrequency().toString() : null);
                groupMap.put("createdDate", group.getCreatedDate());
                
                responseList.add(groupMap);
            }
            
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Search groups by name
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchGroups(@RequestParam String query) {
        try {
            List<Group> groups = groupService.searchGroupsByName(query);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Update group
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGroup(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            // Extract request parameters
            String groupName = (String) request.get("groupName");
            String description = (String) request.get("description");
            BigDecimal paymentAmount = request.get("paymentAmount") != null ? 
                    new BigDecimal(request.get("paymentAmount").toString()) : null;
            String paymentFrequency = (String) request.get("paymentFrequency");
            
            // Get the group to update
            Optional<Group> groupOpt = groupService.getGroupById(id);
            if (!groupOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Group not found with ID: " + id);
            }
            
            Group group = groupOpt.get();
            
            // Update group fields if provided
            if (groupName != null) {
                group.setGroupName(groupName);
            }
            
            if (description != null) {
                group.setDescription(description);
            }
            
            if (paymentAmount != null) {
                group.setPaymentAmount(paymentAmount);
            }
            
            if (paymentFrequency != null) {
                try {
                    Group.PaymentFrequency frequency = Group.PaymentFrequency.valueOf(paymentFrequency.toUpperCase());
                    group.setPaymentFrequency(frequency);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Invalid payment frequency. Valid values are: WEEKLY, BIWEEKLY, MONTHLY");
                }
            }
            
            // Update the group
            Group updatedGroup = groupService.updateGroup(group);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedGroup.getId());
            response.put("groupName", updatedGroup.getGroupName());
            response.put("description", updatedGroup.getDescription());
            response.put("createdByUser", updatedGroup.getCreatedByUser().getId());
            response.put("paymentAmount", updatedGroup.getPaymentAmount());
            response.put("paymentFrequency", updatedGroup.getPaymentFrequency());
            response.put("createdDate", updatedGroup.getCreatedDate());
            response.put("message", "Group updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Delete group
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        try {
            Optional<Group> groupOpt = groupService.getGroupById(id);
            if (!groupOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Group not found with ID: " + id);
            }
            
            groupService.deleteGroup(groupOpt.get());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Group deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }
}