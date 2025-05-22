package com.example.ikimina.service;

import com.example.ikimina.entity.Notification;
import com.example.ikimina.entity.User;
import com.example.ikimina.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Create a new notification for a user
     */
    public Notification createNotification(User user, String message) {
        Notification notification = new Notification(user, message);
        return notificationRepository.save(notification);
    }

    /**
     * Get notification by ID
     */
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    /**
     * Get all notifications for a user
     */
    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedDateDesc(user);
    }

    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotificationsForUser(User user) {
        return notificationRepository.findByUserAndIsReadFalse(user);
    }

    /**
     * Count unread notifications for a user
     */
    public long countUnreadNotificationsForUser(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * Mark a notification as read
     */
    public Notification markNotificationAsRead(Notification notification) {
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllNotificationsAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalse(user);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Delete a notification
     */
    public void deleteNotification(Notification notification) {
        notificationRepository.delete(notification);
    }
}