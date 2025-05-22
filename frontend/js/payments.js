/**
 * Payments JavaScript for Ikimina application
 * Handles payment management functionality
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
    initializePaymentsUI();
    
    // Load payments data
    loadPayments();
});

/**
 * Initialize payments UI elements and event listeners
 */
function initializePaymentsUI() {
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Use AUTH.logout() for consistent logout behavior
            AUTH.logout();
        });
    }
    
    // Submit payment button
    const submitPaymentBtn = document.getElementById('submit-payment-btn');
    if (submitPaymentBtn) {
        submitPaymentBtn.addEventListener('click', function() {
            const submitPaymentModal = document.getElementById('submit-payment-modal');
            if (submitPaymentModal) {
                // Load groups for dropdown before showing modal
                loadUserGroups();
                submitPaymentModal.classList.add('active');
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
                
                // Reset file input preview
                const filePreview = modal.querySelector('.file-preview');
                if (filePreview) {
                    filePreview.innerHTML = '';
                    filePreview.style.display = 'none';
                }
            }
        });
    });
    
    // Submit payment form
    const submitPaymentForm = document.getElementById('submit-payment-form');
    if (submitPaymentForm) {
        submitPaymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitPayment();
        });
    }
    
    // File input change handler
    const proofFileInput = document.getElementById('payment-proof');
    const filePreview = document.querySelector('.file-preview');
    
    if (proofFileInput && filePreview) {
        proofFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Show preview
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    filePreview.innerHTML = `
                        <div class="preview-container">
                            <img src="${e.target.result}" alt="Payment Proof Preview">
                            <div class="file-info">
                                <span class="file-name">${file.name}</span>
                                <span class="file-size">${formatFileSize(file.size)}</span>
                            </div>
                        </div>
                    `;
                    filePreview.style.display = 'block';
                };
                
                reader.readAsDataURL(file);
            } else {
                // Clear preview
                filePreview.innerHTML = '';
                filePreview.style.display = 'none';
            }
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
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filter = this.getAttribute('data-filter');
            
            // Apply filter
            filterPayments(filter);
        });
    });
}

/**
 * Load payments from API
 */
async function loadPayments() {
    try {
        const token = localStorage.getItem('token');
        
        // Get payments data from API
        const response = await fetch(API_BASE_URL + '/api/payments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load payments');
        }
        
        const data = await response.json();
        
        // Store payments data for filtering
        window.paymentsData = data;
        
        // Update payments list
        renderPayments(data);
        
    } catch (error) {
        console.error('Error loading payments:', error);
        
        // Show error message
        const paymentsList = document.getElementById('payments-list');
        if (paymentsList) {
            paymentsList.innerHTML = `
                <div class="empty-state error">
                    <div class="empty-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p data-i18n="errorLoadingPayments">Error loading payments</p>
                </div>
            `;
        }
        
        // Update translations for error message
        updateTranslations();
    }
}

/**
 * Render payments list
 */
function renderPayments(payments) {
    const paymentsList = document.getElementById('payments-list');
    
    if (payments && payments.length > 0) {
        // Clear empty state
        paymentsList.innerHTML = '';
        
        // Add payment items
        payments.forEach(payment => {
            const paymentItem = document.createElement('div');
            paymentItem.className = 'payment-item';
            paymentItem.setAttribute('data-payment-id', payment.id);
            paymentItem.setAttribute('data-status', payment.status);
            
            // Format date
            const paymentDate = new Date(payment.paymentDate);
            const formattedDate = paymentDate.toLocaleDateString();
            
            paymentItem.innerHTML = `
                <div class="payment-header">
                    <div class="payment-info">
                        <h3 class="payment-group">${payment.groupName}</h3>
                        <span class="payment-date">${formattedDate}</span>
                    </div>
                    <div class="payment-status ${getStatusClass(payment.status)}">
                        <span>${getStatusText(payment.status)}</span>
                    </div>
                </div>
                <div class="payment-details">
                    <div class="payment-amount">
                        <span class="label" data-i18n="amount">Amount</span>
                        <span class="value">${formatCurrency(payment.amount)}</span>
                    </div>
                    <div class="payment-method">
                        <span class="label" data-i18n="paymentMethod">Payment Method</span>
                        <span class="value">${payment.paymentMethod}</span>
                    </div>
                    <div class="payment-reference">
                        <span class="label" data-i18n="reference">Reference</span>
                        <span class="value">${payment.reference || '-'}</span>
                    </div>
                </div>
                <div class="payment-actions">
                    <button class="btn btn-primary view-payment" data-payment-id="${payment.id}" data-i18n="viewDetails">View Details</button>
                    ${payment.status === 'REJECTED' ? '<button class="btn btn-secondary resubmit-payment" data-payment-id="' + payment.id + '" data-i18n="resubmit">Resubmit</button>' : ''}
                </div>
            `;
            
            paymentsList.appendChild(paymentItem);
        });
        
        // Add event listeners to view payment buttons
        const viewPaymentButtons = document.querySelectorAll('.view-payment');
        viewPaymentButtons.forEach(button => {
            button.addEventListener('click', function() {
                const paymentId = this.getAttribute('data-payment-id');
                viewPaymentDetails(paymentId);
            });
        });
        
        // Add event listeners to resubmit payment buttons
        const resubmitButtons = document.querySelectorAll('.resubmit-payment');
        resubmitButtons.forEach(button => {
            button.addEventListener('click', function() {
                const paymentId = this.getAttribute('data-payment-id');
                resubmitPayment(paymentId);
            });
        });
    } else {
        // Show empty state
        paymentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <p data-i18n="noPayments">No payments found</p>
                <div class="empty-actions">
                    <button id="empty-submit-btn" class="btn btn-primary" data-i18n="submitPayment">Submit Payment</button>
                </div>
            </div>
        `;
        
        // Add event listener to empty state button
        const emptySubmitBtn = document.getElementById('empty-submit-btn');
        if (emptySubmitBtn) {
            emptySubmitBtn.addEventListener('click', function() {
                const submitPaymentModal = document.getElementById('submit-payment-modal');
                if (submitPaymentModal) {
                    // Load groups for dropdown before showing modal
                    loadUserGroups();
                    submitPaymentModal.classList.add('active');
                }
            });
        }
    }
    
    // Update translations after dynamic content is loaded
    updateTranslations();
}

/**
 * Filter payments by status
 */
function filterPayments(filter) {
    if (!window.paymentsData) return;
    
    let filteredPayments;
    
    if (filter === 'all') {
        filteredPayments = window.paymentsData;
    } else {
        filteredPayments = window.paymentsData.filter(payment => payment.status === filter.toUpperCase());
    }
    
    renderPayments(filteredPayments);
}

/**
 * Load user groups for payment submission
 */
async function loadUserGroups() {
    try {
        const token = localStorage.getItem('token');
        
        // Get user groups from API
        const response = await fetch(API_BASE_URL + '/api/groups', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load groups');
        }
        
        const data = await response.json();
        
        // Update group dropdown
        const groupSelect = document.getElementById('payment-group');
        
        if (groupSelect && data && data.length > 0) {
            // Clear existing options
            groupSelect.innerHTML = '<option value="" data-i18n="selectGroup">Select Group</option>';
            
            // Add group options
            data.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.name;
                groupSelect.appendChild(option);
            });
            
            // Update translations
            updateTranslations();
        }
        
    } catch (error) {
        console.error('Error loading groups:', error);
        
        // Show error message
        showNotification(getCurrentLanguage() === 'en' ? 'Failed to load groups' : 'Kugarura amatsinda ntibyashobotse', 'error');
    }
}

/**
 * Submit a new payment
 */
async function submitPayment() {
    try {
        const token = localStorage.getItem('token');
        const submitPaymentForm = document.getElementById('submit-payment-form');
        
        // Validate form
        const groupId = submitPaymentForm.querySelector('#payment-group').value;
        const amount = submitPaymentForm.querySelector('#payment-amount').value;
        const paymentMethod = submitPaymentForm.querySelector('#payment-method').value;
        const reference = submitPaymentForm.querySelector('#payment-reference').value;
        const proofFile = submitPaymentForm.querySelector('#payment-proof').files[0];
        
        if (!groupId || !amount || !paymentMethod || !proofFile) {
            throw new Error(getCurrentLanguage() === 'en' ? 'Please fill all required fields' : 'Uzuza ibisabwa byose');
        }
        
        // Show loading state
        const submitButton = submitPaymentForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (getCurrentLanguage() === 'en' ? 'Submitting...' : 'Kohereza...');
        
        // Create form data
        const formData = new FormData();
        formData.append('groupId', groupId);
        formData.append('amount', amount);
        formData.append('paymentMethod', paymentMethod);
        formData.append('reference', reference);
        formData.append('proofFile', proofFile);
        
        // Submit payment via API
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit payment');
        }
        
        // Close modal
        const submitPaymentModal = document.getElementById('submit-payment-modal');
        if (submitPaymentModal) {
            submitPaymentModal.classList.remove('active');
        }
        
        // Reset form
        submitPaymentForm.reset();
        
        // Clear file preview
        const filePreview = submitPaymentForm.querySelector('.file-preview');
        if (filePreview) {
            filePreview.innerHTML = '';
            filePreview.style.display = 'none';
        }
        
        // Reload payments
        loadPayments();
        
        // Show success message
        showNotification(getCurrentLanguage() === 'en' ? 'Payment submitted successfully' : 'Ubwishyu bwoherejwe neza');
        
    } catch (error) {
        console.error('Error submitting payment:', error);
        
        // Show error message
        showNotification(error.message || (getCurrentLanguage() === 'en' ? 'Failed to submit payment' : 'Kohereza ubwishyu ntibyashobotse'), 'error');
    }
}

/**
 * View payment details
 */
function viewPaymentDetails(paymentId) {
    // Find payment in data
    const payment = window.paymentsData.find(p => p.id === paymentId);
    
    if (!payment) return;
    
    // Create modal for payment details
    const detailsModal = document.createElement('div');
    detailsModal.className = 'modal payment-details-modal active';
    
    // Format date
    const paymentDate = new Date(payment.paymentDate);
    const formattedDate = paymentDate.toLocaleDateString();
    
    // Format verification date if available
    let verificationInfo = '';
    if (payment.verificationDate) {
        const verificationDate = new Date(payment.verificationDate);
        const formattedVerificationDate = verificationDate.toLocaleDateString();
        verificationInfo = `
            <div class="detail-item">
                <span class="label" data-i18n="verifiedBy">Verified By</span>
                <span class="value">${payment.verifiedBy || '-'}</span>
            </div>
            <div class="detail-item">
                <span class="label" data-i18n="verificationDate">Verification Date</span>
                <span class="value">${formattedVerificationDate}</span>
            </div>
        `;
    }
    
    // Add rejection reason if rejected
    let rejectionInfo = '';
    if (payment.status === 'REJECTED' && payment.rejectionReason) {
        rejectionInfo = `
            <div class="detail-item rejection-reason">
                <span class="label" data-i18n="rejectionReason">Rejection Reason</span>
                <span class="value">${payment.rejectionReason}</span>
            </div>
        `;
    }
    
    detailsModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 data-i18n="paymentDetails">Payment Details</h2>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="payment-status-banner ${getStatusClass(payment.status)}">
                    <span>${getStatusText(payment.status)}</span>
                </div>
                
                <div class="payment-details-content">
                    <div class="detail-item">
                        <span class="label" data-i18n="group">Group</span>
                        <span class="value">${payment.groupName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label" data-i18n="amount">Amount</span>
                        <span class="value">${formatCurrency(payment.amount)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label" data-i18n="paymentDate">Payment Date</span>
                        <span class="value">${formattedDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label" data-i18n="paymentMethod">Payment Method</span>
                        <span class="value">${payment.paymentMethod}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label" data-i18n="reference">Reference</span>
                        <span class="value">${payment.reference || '-'}</span>
                    </div>
                    ${verificationInfo}
                    ${rejectionInfo}
                    
                    <div class="proof-image">
                        <h3 data-i18n="paymentProof">Payment Proof</h3>
                        <img src="/api/payments/${payment.id}/proof" alt="Payment Proof">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(detailsModal);
    
    // Add close button event
    const closeButton = detailsModal.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            detailsModal.remove();
        });
    }
    
    // Update translations
    updateTranslations();
}

/**
 * Resubmit a rejected payment
 */
function resubmitPayment(paymentId) {
    // Find payment in data
    const payment = window.paymentsData.find(p => p.id === paymentId);
    
    if (!payment) return;
    
    // Open submit payment modal
    const submitPaymentModal = document.getElementById('submit-payment-modal');
    if (submitPaymentModal) {
        // Load groups for dropdown before showing modal
        loadUserGroups().then(() => {
            // Pre-fill form with payment data
            const groupSelect = document.getElementById('payment-group');
            const amountInput = document.getElementById('payment-amount');
            const methodSelect = document.getElementById('payment-method');
            const referenceInput = document.getElementById('payment-reference');
            
            if (groupSelect) groupSelect.value = payment.groupId;
            if (amountInput) amountInput.value = payment.amount;
            if (methodSelect) methodSelect.value = payment.paymentMethod;
            if (referenceInput) referenceInput.value = payment.reference || '';
            
            // Show modal
            submitPaymentModal.classList.add('active');
        });
    }
}

/**
 * Get status class based on payment status
 */
function getStatusClass(status) {
    switch (status) {
        case 'PENDING':
            return 'status-pending';
        case 'VERIFIED':
            return 'status-verified';
        case 'REJECTED':
            return 'status-rejected';
        default:
            return '';
    }
}

/**
 * Get status text based on payment status
 */
function getStatusText(status) {
    if (getCurrentLanguage() === 'en') {
        switch (status) {
            case 'PENDING':
                return 'Pending';
            case 'VERIFIED':
                return 'Verified';
            case 'REJECTED':
                return 'Rejected';
            default:
                return status;
        }
    } else {
        // Kinyarwanda
        switch (status) {
            case 'PENDING':
                return 'Bitegerejwe';
            case 'VERIFIED':
                return 'Byemejwe';
            case 'REJECTED':
                return 'Byanzwe';
            default:
                return status;
        }
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
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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