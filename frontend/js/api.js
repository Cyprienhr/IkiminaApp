/**
 * API JavaScript for Ikimina application
 * Handles all API interactions with the backend
 */

// API base URL
const API_BASE_URL = 'http://localhost:8080'; // Update this to point to the Spring Boot backend

// API endpoints
const API = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        PROFILE: '/api/auth/profile'
    },
    // Groups endpoints
    GROUPS: {
        LIST: '/api/groups',
        CREATE: '/api/groups',
        JOIN: '/api/groups/join',
        DETAILS: (id) => `/api/groups/${id}`,
        MEMBERS: (id) => `/api/groups/${id}/members`
    },
    // Payments endpoints
    PAYMENTS: {
        LIST: '/api/payments',
        CREATE: '/api/payments',
        DETAILS: (id) => `/api/payments/${id}`,
        APPROVE: (id) => `/api/payments/${id}/approve`,
        REJECT: (id) => `/api/payments/${id}/reject`
    },
    // Notifications endpoints
    NOTIFICATIONS: {
        LIST: '/api/notifications',
        READ: (id) => `/api/notifications/${id}/read`,
        READ_ALL: '/api/notifications/read-all'
    }
};

// API client with authentication
const ApiClient = {
    // Get auth token
    getToken: function() {
        return localStorage.getItem('token');
    },
    
    // Get auth headers
    getHeaders: function(includeContentType = true) {
        const headers = {};
        const token = this.getToken();
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        
        return headers;
    },
    
    // Handle API errors
    handleError: function(response) {
        if (!response.ok) {
            // Try to get error message from response
            return response.json().then(data => {
                throw new Error(data.message || `Error: ${response.status}`);
            }).catch(err => {
                if (err instanceof SyntaxError) {
                    throw new Error(`Error: ${response.status}`);
                }
                throw err;
            });
        }
        return response;
    },
    
    // GET request
    get: async function(url) {
        try {
            const response = await fetch(API_BASE_URL + url, {
                method: 'GET',
                headers: this.getHeaders(false)
            });
            
            await this.handleError(response);
            return await response.json();
        } catch (error) {
            console.error(`GET ${url} error:`, error);
            throw error;
        }
    },
    
    // POST request
    post: async function(url, data) {
        try {
            const response = await fetch(API_BASE_URL + url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            await this.handleError(response);
            return await response.json();
        } catch (error) {
            console.error(`POST ${url} error:`, error);
            throw error;
        }
    },
    
    // PUT request
    put: async function(url, data) {
        try {
            const response = await fetch(API_BASE_URL + url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            await this.handleError(response);
            return await response.json();
        } catch (error) {
            console.error(`PUT ${url} error:`, error);
            throw error;
        }
    },
    
    // DELETE request
    delete: async function(url) {
        try {
            const response = await fetch(API_BASE_URL + url, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            await this.handleError(response);
            return await response.json();
        } catch (error) {
            console.error(`DELETE ${url} error:`, error);
            throw error;
        }
    },
    
    // Upload file
    upload: async function(url, file, additionalData = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Add any additional data
            for (const key in additionalData) {
                formData.append(key, additionalData[key]);
            }
            
            const response = await fetch(API_BASE_URL + url, {
                method: 'POST',
                headers: this.getHeaders(false),
                body: formData
            });
            
            await this.handleError(response);
            return await response.json();
        } catch (error) {
            console.error(`UPLOAD ${url} error:`, error);
            throw error;
        }
    }
};

// API service functions
const ApiService = {
    // Auth services
    auth: {
        login: async function(phoneNumber, password) {
            return await ApiClient.post(API.AUTH.LOGIN, { phoneNumber, password });
        },
        
        register: async function(userData) {
            return await ApiClient.post(API.AUTH.REGISTER, userData);
        },
        
        getProfile: async function() {
            return await ApiClient.get(API.AUTH.PROFILE);
        },
        
        updateProfile: async function(userData) {
            return await ApiClient.put(API.AUTH.PROFILE, userData);
        }
    },
    
    // Groups services
    groups: {
        getAll: async function() {
            return await ApiClient.get(API.GROUPS.LIST);
        },
        
        create: async function(groupData) {
            return await ApiClient.post(API.GROUPS.CREATE, groupData);
        },
        
        join: async function(groupCode) {
            return await ApiClient.post(API.GROUPS.JOIN, { groupCode });
        },
        
        getDetails: async function(groupId) {
            return await ApiClient.get(API.GROUPS.DETAILS(groupId));
        },
        
        getMembers: async function(groupId) {
            return await ApiClient.get(API.GROUPS.MEMBERS(groupId));
        }
    },
    
    // Payments services
    payments: {
        getAll: async function() {
            return await ApiClient.get(API.PAYMENTS.LIST);
        },
        
        create: async function(paymentData, proofFile) {
            if (proofFile) {
                return await ApiClient.upload(API.PAYMENTS.CREATE, proofFile, paymentData);
            } else {
                return await ApiClient.post(API.PAYMENTS.CREATE, paymentData);
            }
        },
        
        getDetails: async function(paymentId) {
            return await ApiClient.get(API.PAYMENTS.DETAILS(paymentId));
        },
        
        approve: async function(paymentId) {
            return await ApiClient.put(API.PAYMENTS.APPROVE(paymentId), {});
        },
        
        reject: async function(paymentId, reason) {
            return await ApiClient.put(API.PAYMENTS.REJECT(paymentId), { reason });
        }
    },
    
    // Notifications services
    notifications: {
        getAll: async function() {
            return await ApiClient.get(API.NOTIFICATIONS.LIST);
        },
        
        markAsRead: async function(notificationId) {
            return await ApiClient.put(API.NOTIFICATIONS.READ(notificationId), {});
        },
        
        markAllAsRead: async function() {
            return await ApiClient.put(API.NOTIFICATIONS.READ_ALL, {});
        }
    }
};