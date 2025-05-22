/**
 * Dashboard JavaScript for Ikimina application
 * Handles dashboard functionality and data loading
 */
const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language
    initLanguage();
    
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Set user name
    const userNameElement = document.getElementById('user-name');
    if (user.fullName) {
        userNameElement.textContent = user.fullName;
    }
    
    // Toggle sidebar on mobile
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    if (sidebarToggle && dashboardContainer) {
        sidebarToggle.addEventListener('click', function() {
            dashboardContainer.classList.toggle('sidebar-collapsed');
        });
    }
    
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Redirect to logout page
            window.location.href = 'logout.html';
        });
    }
    
    // Load dashboard data
    loadDashboardData();
});

/**
 * Load dashboard data from API
 */
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Get dashboard data from API
        const response = await fetch(API_BASE_URL + '/api/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        const data = await response.json();
        
        // Update dashboard stats
        document.getElementById('groups-count').textContent = data.groupsCount || 0;
        document.getElementById('contributions-amount').textContent = 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' })
                .format(data.totalContributions || 0);
        document.getElementById('upcoming-payments').textContent = data.upcomingPayments || 0;
        
        // Update activity list
        const activityList = document.getElementById('activity-list');
        
        if (data.recentActivities && data.recentActivities.length > 0) {
            // Clear empty state
            activityList.innerHTML = '';
            
            // Add activity items
            data.recentActivities.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                // Format date
                const activityDate = new Date(activity.timestamp);
                const formattedDate = activityDate.toLocaleDateString();
                
                activityItem.innerHTML = `
                    <div class="activity-icon ${getActivityIconClass(activity.type)}">
                        <i class="${getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-description">${activity.description}</div>
                        <div class="activity-time">${formattedDate}</div>
                    </div>
                `;
                
                activityList.appendChild(activityItem);
            });
        } else {
            // Show empty state
            activityList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <p data-i18n="noActivities">No recent activities</p>
                </div>
            `;
        }
        
        // Update translations after dynamic content is loaded
        updateTranslations();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Show error message
        const activityList = document.getElementById('activity-list');
        if (activityList) {
            activityList.innerHTML = `
                <div class="empty-state error">
                    <div class="empty-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p data-i18n="errorLoadingData">Error loading data</p>
                </div>
            `;
        }
        
        // Update translations for error message
        updateTranslations();
    }
}

/**
 * Get icon class based on activity type
 */
function getActivityIconClass(type) {
    switch (type) {
        case 'PAYMENT':
            return 'payment-icon';
        case 'GROUP':
            return 'group-icon';
        case 'MEMBERSHIP':
            return 'membership-icon';
        default:
            return 'default-icon';
    }
}

/**
 * Get icon based on activity type
 */
function getActivityIcon(type) {
    switch (type) {
        case 'PAYMENT':
            return 'fas fa-money-bill-wave';
        case 'GROUP':
            return 'fas fa-users';
        case 'MEMBERSHIP':
            return 'fas fa-user-plus';
        default:
            return 'fas fa-bell';
    }
}