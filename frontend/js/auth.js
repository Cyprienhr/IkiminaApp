/**
 * Authentication JavaScript for Ikimina application
 * Handles login, registration, and token management
 */

// Token management
const AUTH = {
    // Save token and user data to localStorage
    setAuth: function(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    // Get token from localStorage
    getToken: function() {
        return localStorage.getItem('token');
    },
    
    // Get user data from localStorage
    getUser: function() {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    },
    
    // Check if user is authenticated
    isAuthenticated: function() {
        return !!this.getToken();
    },
    
    // Clear authentication data
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },
    
    // Redirect if not authenticated
    requireAuth: function() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    // Redirect if already authenticated
    redirectIfAuth: function() {
        if (this.isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return true;
        }
        return false;
    }
};

// Login functionality
function handleLogin() {
    // Check if already logged in
    if (AUTH.redirectIfAuth()) return;
    
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous error
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
            
            // Get form data
            const phoneNumber = document.getElementById('phoneNumber').value;
            const password = document.getElementById('password').value;
            
            // Validate form
            if (!phoneNumber || !password) {
                errorMessage.textContent = getTranslation('fill_all_fields');
                errorMessage.style.display = 'block';
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + getTranslation('logging_in');
            
            // Send login request
            console.log('Sending login request to:', API_BASE_URL + '/api/auth/login');
            console.log('With data:', {phoneNumber, password});
            
            fetch(API_BASE_URL + API.AUTH.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    password: password
                })
            })
            .then(response => {
                console.log('Login response status:', response.status);
                if (!response.ok) {
                    throw new Error(response.status === 401 ? getTranslation('invalid_credentials') : getTranslation('login_error'));
                }
                return response.json();
            })
            .then(data => {
                console.log('Login successful, received data:', data);
                // Save auth data
                AUTH.setAuth(data.token, data.user);
                
                // Redirect to dashboard
                console.log('Redirecting to dashboard...');
                window.location.href = 'dashboard.html';
            })
            .catch(error => {
                console.error('Login error:', error);
                // Show error message
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
                document.getElementById('login-alert').classList.remove('hidden');
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
        });
    }
}

// Registration functionality
function handleRegistration() {
    // Check if already logged in
    if (AUTH.redirectIfAuth()) return;
    
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous error
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
            
            // Get form data
            const fullName = document.getElementById('fullName').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate form
            if (!fullName || !phoneNumber || !password || !confirmPassword) {
                errorMessage.textContent = getTranslation('fill_all_fields');
                errorMessage.style.display = 'block';
                return;
            }
            
            if (password !== confirmPassword) {
                errorMessage.textContent = getTranslation('passwords_not_match');
                errorMessage.style.display = 'block';
                return;
            }
            
            // Show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + getTranslation('registering');
            
            // Send registration request
            fetch(`${API_BASE_URL}${API.AUTH.REGISTER}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: fullName,
                    phoneNumber: phoneNumber,
                    password: password
                })
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 409) {
                        throw new Error(getTranslation('phone_already_exists'));
                    } else {
                        throw new Error(getTranslation('registration_error'));
                    }
                }
                return response.json();
            })
            .then(data => {
                console.log('Login successful, received data:', data);
                // Save auth data
                AUTH.setAuth(data.token, data.user);
                
                // Redirect to dashboard
                console.log('Redirecting to dashboard...');
                window.location.href = 'dashboard.html';
            })
            .catch(error => {
                console.error('Login error:', error);
                // Show error message
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
                document.getElementById('login-alert').classList.remove('hidden');
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
        });
    }
}

// Initialize auth functionality based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', AUTH.logout);
    }
    
    // Get current path
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop();
    
    // Handle auth based on current page
    if (currentPage === 'login.html' || currentPath.endsWith('/login')) {
        handleLogin();
    } else if (currentPage === 'register.html' || currentPath.endsWith('/register')) {
        handleRegistration();
    } else if (currentPage === 'dashboard.html' || 
               currentPage === 'groups.html' || 
               currentPage === 'payments.html' || 
               currentPage === 'notifications.html' || 
               currentPage === 'profile.html') {
        // Protected routes - redirect if not authenticated
        AUTH.requireAuth();
        
        // Load user info if available
        const userName = document.getElementById('userName');
        if (userName) {
            const user = AUTH.getUser();
            if (user) {
                userName.textContent = user.fullName;
            }
        }
    }
});