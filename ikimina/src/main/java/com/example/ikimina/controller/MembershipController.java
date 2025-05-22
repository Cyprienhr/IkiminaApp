package com.example.ikimina.controller;

import com.example.ikimina.entity.Group;
import com.example.ikimina.entity.Membership;
import com.example.ikimina.entity.User;
import com.example.ikimina.service.GroupService;
import com.example.ikimina.service.MembershipService;
import com.example.ikimina.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    @Autowired
    private MembershipService membershipService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private GroupService groupService;

    /**
     * Request to join a group
     */
    @PostMapping("/request")
    public ResponseEntity<?> requestToJoinGroup(@RequestBody Map<String, Long> request) {
        try {
            // Extract request parameters
            Long userId = request.get("userId");
            Long groupId = request.get("groupId");
            
            // Validate request parameters
            if (userId == null || groupId == null) {
                return ResponseEntity.badRequest().body("User ID and Group ID are required");
            }
            
            // Get the user and group
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with ID: " + userId);
            }
            
            Optional<Group> groupOpt = groupService.getGroupById(groupId);
            if (!groupOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Group not found with ID: " + groupId);
            }
            
            // Check if the user is already a member of the group
            if (membershipService.isUserMemberOfGroup(userOpt.get(), groupOpt.get())) {
                return ResponseEntity.badRequest().body("User is already a member of this group");
            }
            
            // Request to join the group
            Membership membership = membershipService.requestJoinGroup(userOpt.get(), groupOpt.get());
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", membership.getId());
            response.put("userId", membership.getUser().getId());
            response.put("groupId", membership.getGroup().getId());
            response.put("isConfirmed", membership.isConfirmed());
            response.put("joinRequestDate", membership.getJoinRequestDate());
            response.put("message", "Join request submitted successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Confirm a membership request
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmMembership(@PathVariable Long id) {
        try {
            Optional<Membership> membershipOpt = membershipService.getMembershipById(id);
            if (!membershipOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Membership not found with ID: " + id);
            }
            
            Membership membership = membershipOpt.get();
            
            // Check if the membership is already confirmed
            if (membership.isConfirmed()) {
                return ResponseEntity.badRequest().body("Membership is already confirmed");
            }
            
            // Confirm the membership
            Membership confirmedMembership = membershipService.confirmMembership(membership);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", confirmedMembership.getId());
            response.put("userId", confirmedMembership.getUser().getId());
            response.put("groupId", confirmedMembership.getGroup().getId());
            response.put("isConfirmed", confirmedMembership.isConfirmed());
            response.put("joinRequestDate", confirmedMembership.getJoinRequestDate());
            response.put("confirmationDate", confirmedMembership.getConfirmationDate());
            response.put("message", "Membership confirmed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get all memberships for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getMembershipsByUser(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with ID: " + userId);
            }
            
            List<Membership> memberships = membershipService.getMembershipsByUser(userOpt.get());
            return ResponseEntity.ok(memberships);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get all memberships for a group
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getMembershipsByGroup(@PathVariable Long groupId) {
        try {
            Optional<Group> groupOpt = groupService.getGroupById(groupId);
            if (!groupOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Group not found with ID: " + groupId);
            }
            
            List<Membership> memberships = membershipService.getMembershipsByGroup(groupOpt.get());
            return ResponseEntity.ok(memberships);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get confirmed memberships for a group
     */
    @GetMapping("/group/{groupId}/confirmed")
    public ResponseEntity<?> getConfirmedMembershipsByGroup(@PathVariable Long groupId) {
        try {
            Optional<Group> groupOpt = groupService.getGroupById(groupId);
            if (!groupOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Group not found with ID: " + groupId);
            }
            
            List<Membership> memberships = membershipService.getConfirmedMembershipsByGroup(groupOpt.get());
            return ResponseEntity.ok(memberships);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get pending memberships for a group
     */
    @GetMapping("/group/{groupId}/pending")
    public ResponseEntity<?> getPendingMembershipsByGroup(@PathVariable Long groupId) {
        try {
            Optional<Group> groupOpt = groupService.getGroupById(groupId);
            if (!groupOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Group not found with ID: " + groupId);
            }
            
            List<Membership> memberships = membershipService.getPendingMembershipsByGroup(groupOpt.get());
            return ResponseEntity.ok(memberships);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Delete a membership
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMembership(@PathVariable Long id) {
        try {
            Optional<Membership> membershipOpt = membershipService.getMembershipById(id);
            if (!membershipOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Membership not found with ID: " + id);
            }
            
            membershipService.removeMembership(membershipOpt.get());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Membership deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }
}