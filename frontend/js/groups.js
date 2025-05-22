/**
 * Groups JavaScript for Ikimina application
 * Handles group management functionality
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
    initializeGroupsUI();
    
    // Load groups data
    loadGroups();
});

/**
 * Initialize groups UI elements and event listeners
 */
function initializeGroupsUI() {
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Redirect to logout page
            window.location.href = 'logout.html';
        });
    }
    
    // Create group button
    const createGroupBtn = document.getElementById('create-group-btn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', function() {
            const createGroupModal = document.getElementById('create-group-modal');
            if (createGroupModal) {
                createGroupModal.classList.add('active');
            }
        });
    }
    
    // Join group button
    const joinGroupBtn = document.getElementById('join-group-btn');
    if (joinGroupBtn) {
        joinGroupBtn.addEventListener('click', function() {
            const joinGroupModal = document.getElementById('join-group-modal');
            if (joinGroupModal) {
                joinGroupModal.classList.add('active');
            }
        });
    }
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                
                // Reset form
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                }
            }
        });
    });
    
    // Create group form submission
    const createGroupForm = document.getElementById('create-group-form');
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createGroup();
        });
    }
    
    // Join group form submission
    const joinGroupForm = document.getElementById('join-group-form');
    if (joinGroupForm) {
        joinGroupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            joinGroup();
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
 * Load groups from API
 */
async function loadGroups() {
    try {
        const token = localStorage.getItem('token');
        
        // Get groups data from API
        const response = await fetch('/api/groups', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load groups');
        }
        
        const data = await response.json();
        
        // Update groups list
        const groupsList = document.getElementById('groups-list');
        
        if (data && data.length > 0) {
            // Clear empty state
            groupsList.innerHTML = '';
            
            // Add group items
            data.forEach(group => {
                const groupItem = document.createElement('div');
                groupItem.className = 'group-item';
                groupItem.setAttribute('data-group-id', group.id);
                
                groupItem.innerHTML = `
                    <div class="group-header">
                        <h3 class="group-name">${group.name}</h3>
                        <span class="group-status ${getStatusClass(group.status)}">${group.status}</span>
                    </div>
                    <div class="group-details">
                        <p class="group-description">${group.description || ''}</p>
                        <div class="group-meta">
                            <span class="group-members"><i class="fas fa-users"></i> ${group.memberCount} <span data-i18n="members">members</span></span>
                            <span class="group-contribution"><i class="fas fa-money-bill-wave"></i> ${formatCurrency(group.contributionAmount)}</span>
                        </div>
                    </div>
                    <div class="group-actions">
                        <button class="btn btn-primary view-group" data-group-id="${group.id}" data-i18n="viewDetails">View Details</button>
                        ${group.isAdmin ? '<button class="btn btn-secondary manage-group" data-group-id="' + group.id + '" data-i18n="manageGroup">Manage Group</button>' : ''}
                    </div>
                `;
                
                groupsList.appendChild(groupItem);
            });
            
            // Add event listeners to view group buttons
            const viewGroupButtons = document.querySelectorAll('.view-group');
            viewGroupButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const groupId = this.getAttribute('data-group-id');
                    viewGroupDetails(groupId);
                });
            });
            
            // Add event listeners to manage group buttons
            const manageGroupButtons = document.querySelectorAll('.manage-group');
            manageGroupButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const groupId = this.getAttribute('data-group-id');
                    manageGroup(groupId);
                });
            });
        } else {
            // Show empty state
            groupsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <p data-i18n="noGroups">You are not a member of any groups yet</p>
                    <div class="empty-actions">
                        <button id="empty-create-btn" class="btn btn-primary" data-i18n="createGroup">Create Group</button>
                        <button id="empty-join-btn" class="btn btn-secondary" data-i18n="joinGroup">Join Group</button>
                    </div>
                </div>
            `;
            
            // Add event listeners to empty state buttons
            const emptyCreateBtn = document.getElementById('empty-create-btn');
            if (emptyCreateBtn) {
                emptyCreateBtn.addEventListener('click', function() {
                    const createGroupModal = document.getElementById('create-group-modal');
                    if (createGroupModal) {
                        createGroupModal.classList.add('active');
                    }
                });
            }
            
            const emptyJoinBtn = document.getElementById('empty-join-btn');
            if (emptyJoinBtn) {
                emptyJoinBtn.addEventListener('click', function() {
                    const joinGroupModal = document.getElementById('join-group-modal');
                    if (joinGroupModal) {
                        joinGroupModal.classList.add('active');
                    }
                });
            }
        }
        
        // Update translations after dynamic content is loaded
        updateTranslations();
        
    } catch (error) {
        console.error('Error loading groups:', error);
        
        // Show error message
        const groupsList = document.getElementById('groups-list');
        if (groupsList) {
            groupsList.innerHTML = `
                <div class="empty-state error">
                    <div class="empty-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p data-i18n="errorLoadingGroups">Error loading groups</p>
                </div>
            `;
        }
        
        // Update translations for error message
        updateTranslations();
    }
}

/**
 * Create a new group
 */
async function createGroup() {
    try {
        const token = localStorage.getItem('token');
        const createGroupForm = document.getElementById('create-group-form');
        
        // Get form data
        const formData = new FormData(createGroupForm);
        const groupData = {
            name: formData.get('group-name'),
            description: formData.get('group-description'),
            contributionAmount: formData.get('contribution-amount'),
            contributionFrequency: formData.get('contribution-frequency')
        };
        
        // Show loading state
        const submitButton = createGroupForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (getCurrentLanguage() === 'en' ? 'Creating...' : 'Gukora...');
        
        // Create group via API
        const response = await fetch('/api/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(groupData)
        });
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create group');
        }
        
        // Close modal
        const createGroupModal = document.getElementById('create-group-modal');
        if (createGroupModal) {
            createGroupModal.classList.remove('active');
        }
        
        // Reset form
        createGroupForm.reset();
        
        // Reload groups
        loadGroups();
        
        // Show success message
        showNotification(getCurrentLanguage() === 'en' ? 'Group created successfully' : 'Itsinda ryaremwe neza');
        
    } catch (error) {
        console.error('Error creating group:', error);
        
        // Show error message
        showNotification(error.message || (getCurrentLanguage() === 'en' ? 'Failed to create group' : 'Itsinda ntiryashobotse gukora'), 'error');
    }
}

/**
 * Join an existing group
 */
async function joinGroup() {
    try {
        const token = localStorage.getItem('token');
        const joinGroupForm = document.getElementById('join-group-form');
        
        // Get form data
        const formData = new FormData(joinGroupForm);
        const inviteCode = formData.get('invite-code');
        
        // Show loading state
        const submitButton = joinGroupForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (getCurrentLanguage() === 'en' ? 'Joining...' : 'Kwinjira...');
        
        // Join group via API
        const response = await fetch('/api/groups/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ inviteCode })
        });
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to join group');
        }
        
        // Close modal
        const joinGroupModal = document.getElementById('join-group-modal');
        if (joinGroupModal) {
            joinGroupModal.classList.remove('active');
        }
        
        // Reset form
        joinGroupForm.reset();
        
        // Reload groups
        loadGroups();
        
        // Show success message
        showNotification(getCurrentLanguage() === 'en' ? 'Joined group successfully' : 'Winjiye mu itsinda neza');
        
    } catch (error) {
        console.error('Error joining group:', error);
        
        // Show error message
        showNotification(error.message || (getCurrentLanguage() === 'en' ? 'Failed to join group' : 'Kwinjira mu itsinda ntibyashobotse'), 'error');
    }
}

/**
 * View group details
 */
function viewGroupDetails(groupId) {
    // Redirect to group details page
    window.location.href = `/groups/${groupId}`;
}

/**
 * Manage group (admin only)
 */
function manageGroup(groupId) {
    // Redirect to group management page
    window.location.href = `/groups/${groupId}/manage`;
}

/**
 * Get status class based on group status
 */
function getStatusClass(status) {
    switch (status) {
        case 'ACTIVE':
            return 'status-active';
        case 'PENDING':
            return 'status-pending';
        case 'INACTIVE':
            return 'status-inactive';
        default:
            return '';
    }
}

/**
 * Format currency amount
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' })
        .format(amount || 0);
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close button event
    const closeButton = notification.querySelector('.notification-close');
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