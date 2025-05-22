package com.example.ikimina.controller;

import com.example.ikimina.entity.Notification;
import com.example.ikimina.entity.User;
import com.example.ikimina.service.NotificationService;
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
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserService userService;

    /**
     * Get all notifications for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getNotificationsByUser(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with ID: " + userId);
            }
            
            List<Notification> notifications = notificationService.getNotificationsForUser(userOpt.get());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get unread notifications for a user
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnreadNotificationsByUser(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with ID: " + userId);
            }
            
            List<Notification> notifications = notificationService.getUnreadNotificationsForUser(userOpt.get());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Mark a notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        try {
            Optional<Notification> notificationOpt = notificationService.getNotificationById(id);
            if (!notificationOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Notification not found with ID: " + id);
            }
            
            Notification notification = notificationOpt.get();
            
            // Check if the notification is already read
            if (notification.isRead()) {
                return ResponseEntity.badRequest().body("Notification is already marked as read");
            }
            
            // Mark the notification as read
            Notification readNotification = notificationService.markNotificationAsRead(notification);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", readNotification.getId());
            response.put("userId", readNotification.getUser().getId());
            response.put("message", readNotification.getMessage());
            response.put("isRead", readNotification.isRead());
            response.put("createdDate", readNotification.getCreatedDate());
            response.put("message", "Notification marked as read successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllNotificationsAsRead(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with ID: " + userId);
            }
            
            notificationService.markAllNotificationsAsRead(userOpt.get());
            
            // Get the count of notifications that were marked as read
            List<Notification> unreadNotifications = notificationService.getUnreadNotificationsForUser(userOpt.get());
            int count = unreadNotifications.size();
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("message", count + " notifications marked as read successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get unread notification count for a user
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<?> getUnreadNotificationCount(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with ID: " + userId);
            }
            
            long count = notificationService.countUnreadNotificationsForUser(userOpt.get());
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }
}