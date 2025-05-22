/**
 * Notifications JavaScript for Ikimina application
 * Handles notification management functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language
    initLanguage();
    
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize UI elements
    initializeNotificationsUI();
    
    // Load notifications data
    loadNotifications();
});

/**
 * Initialize notifications UI elements and event listeners
 */
function initializeNotificationsUI() {
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Use AUTH.logout() for consistent logout behavior
            AUTH.logout();
        });
    }
    
    // Mark all as read button
    const markAllReadBtn = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            markAllAsRead();
        });
    }
    
    // Toggle sidebar on mobile
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    if (sidebarToggle && dashboardContainer) {
        sidebarToggle.addEventListener('click', function() {
            dashboardContainer.classList.toggle('sidebar-collapsed');
        });
    }
}

/**
 * Load notifications from API
 */
async function loadNotifications() {
    try {
        const token = localStorage.getItem('token');
        
        // Get notifications data from API
        const response = await fetch(API_BASE_URL + '/api/notifications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load notifications');
        }
        
        const data = await response.json();
        
        // Update notifications list
        const notificationsList = document.getElementById('notifications-list');
        
        if (data && data.length > 0) {
            // Clear empty state
            notificationsList.innerHTML = '';
            
            // Add notification items
            data.forEach(notification => {
                const notificationItem = document.createElement('div');
                notificationItem.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
                notificationItem.setAttribute('data-notification-id', notification.id);
                
                // Format date
                const notificationDate = new Date(notification.createdAt);
                const formattedDate = formatRelativeTime(notificationDate);
                
                notificationItem.innerHTML = `
                    <div class="notification-content">
                        <div class="notification-icon ${getNotificationIconClass(notification.type)}">
                            <i class="${getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-details">
                            <div class="notification-title">${notification.title}</div>
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-time">${formattedDate}</div>
                        </div>
                    </div>
                    <div class="notification-actions">
                        ${!notification.read ? '<button class="mark-read" data-notification-id="' + notification.id + '" title="' + (getCurrentLanguage() === 'en' ? 'Mark as read' : 'Gushyira nk\'ibyasomwe') + '"><i class="fas fa-check"></i></button>' : ''}
                    </div>
                `;
                
                notificationsList.appendChild(notificationItem);
            });
            
            // Add event listeners to mark as read buttons
            const markReadButtons = document.querySelectorAll('.mark-read');
            markReadButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent notification item click
                    const notificationId = this.getAttribute('data-notification-id');
                    markAsRead(notificationId);
                });
            });
            
            // Add event listeners to notification items
            const notificationItems = document.querySelectorAll('.notification-item');
            notificationItems.forEach(item => {
                item.addEventListener('click', function() {
                    const notificationId = this.getAttribute('data-notification-id');
                    const isUnread = this.classList.contains('unread');
                    
                    // Mark as read if unread
                    if (isUnread) {
                        markAsRead(notificationId);
                    }
                    
                    // Handle notification click based on type
                    handleNotificationClick(notificationId);
                });
            });
        } else {
            // Show empty state
            notificationsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <p data-i18n="noNotifications">You have no notifications</p>
                </div>
            `;
        }
        
        // Update translations after dynamic content is loaded
        updateTranslations();
        
        // Update notification count
        updateNotificationCount(data);
        
    } catch (error) {
        console.error('Error loading notifications:', error);
        
        // Show error message
        const notificationsList = document.getElementById('notifications-list');
        if (notificationsList) {
            notificationsList.innerHTML = `
                <div class="empty-state error">
                    <div class="empty-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p data-i18n="errorLoadingNotifications">Error loading notifications</p>
                </div>
            `;
        }
        
        // Update translations for error message
        updateTranslations();
    }
}

/**
 * Mark a notification as read
 */
async function markAsRead(notificationId) {
    try {
        const token = localStorage.getItem('token');
        
        // Mark notification as read via API
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }
        
        // Update UI
        const notificationItem = document.querySelector(`.notification-item[data-notification-id="${notificationId}"]`);
        if (notificationItem) {
            notificationItem.classList.remove('unread');
            notificationItem.classList.add('read');
            
            // Remove mark as read button
            const markReadButton = notificationItem.querySelector('.mark-read');
            if (markReadButton) {
                markReadButton.remove();
            }
        }
        
        // Update notification count
        updateNotificationCountAfterRead();
        
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead() {
    try {
        const token = localStorage.getItem('token');
        
        // Mark all notifications as read via API
        const response = await fetch('/api/notifications/read-all', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
        }
        
        // Update UI
        const unreadItems = document.querySelectorAll('.notification-item.unread');
        unreadItems.forEach(item => {
            item.classList.remove('unread');
            item.classList.add('read');
            
            // Remove mark as read button
            const markReadButton = item.querySelector('.mark-read');
            if (markReadButton) {
                markReadButton.remove();
            }
        });
        
        // Update notification count
        updateNotificationCountAfterReadAll();
        
        // Show success message
        showNotification(getCurrentLanguage() === 'en' ? 'All notifications marked as read' : 'Ubutumwa bwose bwashyizwe nk\'ibyasomwe');
        
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        
        // Show error message
        showNotification(getCurrentLanguage() === 'en' ? 'Failed to mark all as read' : 'Gushyira ubutumwa bwose nk\'ibyasomwe ntibyashobotse', 'error');
    }
}

/**
 * Handle notification click based on type
 */
function handleNotificationClick(notificationId) {
    // Find notification data
    // In a real implementation, you would fetch the notification details
    // or store them when loading notifications
    
    // For now, we'll just simulate navigation based on notification type
    // This would be replaced with actual navigation based on notification data
    
    // Example:
    // if (notification.type === 'PAYMENT') {
    //     window.location.href = `/payments/${notification.referenceId}`;
    // } else if (notification.type === 'GROUP') {
    //     window.location.href = `/groups/${notification.referenceId}`;
    // }
}

/**
 * Update notification count in UI
 */
function updateNotificationCount(notifications) {
    if (!notifications) return;
    
    // Count unread notifications
    const unreadCount = notifications.filter(notification => !notification.read).length;
    
    // Update count in UI
    const countElement = document.querySelector('.notification-count');
    if (countElement) {
        countElement.textContent = unreadCount;
        
        // Hide count if zero
        if (unreadCount === 0) {
            countElement.style.display = 'none';
        } else {
            countElement.style.display = 'flex';
        }
    }
}

/**
 * Update notification count after marking one as read
 */
function updateNotificationCountAfterRead() {
    const countElement = document.querySelector('.notification-count');
    if (countElement) {
        let count = parseInt(countElement.textContent) || 0;
        if (count > 0) {
            count--;
            countElement.textContent = count;
            
            // Hide count if zero
            if (count === 0) {
                countElement.style.display = 'none';
            }
        }
    }
}

/**
 * Update notification count after marking all as read
 */
function updateNotificationCountAfterReadAll() {
    const countElement = document.querySelector('.notification-count');
    if (countElement) {
        countElement.textContent = '0';
        countElement.style.display = 'none';
    }
}

/**
 * Get icon class based on notification type
 */
function getNotificationIconClass(type) {
    switch (type) {
        case 'PAYMENT':
            return 'payment-icon';
        case 'GROUP':
            return 'group-icon';
        case 'MEMBERSHIP':
            return 'membership-icon';
        case 'SYSTEM':
            return 'system-icon';
        default:
            return 'default-icon';
    }
}

/**
 * Get icon based on notification type
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'PAYMENT':
            return 'fas fa-money-bill-wave';
        case 'GROUP':
            return 'fas fa-users';
        case 'MEMBERSHIP':
            return 'fas fa-user-plus';
        case 'SYSTEM':
            return 'fas fa-cog';
        default:
            return 'fas fa-bell';
    }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const isEnglish = getCurrentLanguage() === 'en';
    
    if (diffInSeconds < 60) {
        return isEnglish ? 'Just now' : 'Ubu ngubu';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return isEnglish ? 
            `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago` : 
            `${diffInMinutes} ${diffInMinutes === 1 ? 'umunota' : 'iminota'} ishize`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return isEnglish ? 
            `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago` : 
            `${diffInHours} ${diffInHours === 1 ? 'isaha' : 'amasaha'} ashize`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return isEnglish ? 
            `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago` : 
            `${diffInDays} ${diffInDays === 1 ? 'umunsi' : 'iminsi'} ishize`;
    }
    
    // For older notifications, show the actual date
    return date.toLocaleDateString();
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-toast-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close button event
    const closeButton = notification.querySelector('.notification-toast-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            notification.remove();
        });
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}