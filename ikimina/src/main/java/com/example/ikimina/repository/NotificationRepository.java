package com.example.ikimina.repository;

import com.example.ikimina.entity.Notification;
import com.example.ikimina.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications for a specific user
    List<Notification> findByUser(User user);
    
    // Find unread notifications for a specific user
    List<Notification> findByUserAndIsReadFalse(User user);
    
    // Count unread notifications for a specific user
    long countByUserAndIsReadFalse(User user);
    
    // Find notifications ordered by creation date (newest first)
    List<Notification> findByUserOrderByCreatedDateDesc(User user);
}