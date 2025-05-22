/**
 * Translations for Ikimina application
 * Supports English and Kinyarwanda languages
 */

const translations = {
    en: {
        // General
        appName: "Ikimina Connect",
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        confirm: "Confirm",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        search: "Search",
        submit: "Submit",
        back: "Back",
        next: "Next",
        yes: "Yes",
        no: "No",
        success: "Success",
        error: "Error",
        warning: "Warning",
        info: "Information",
        required: "Required",
        optional: "Optional",
        footer: "© 2023 Ikimina Connect. All rights reserved.",
        
        // Auth
        login: "Login",
        register: "Register",
        logout: "Logout",
        phoneNumber: "Phone Number",
        password: "Password",
        confirmPassword: "Confirm Password",
        fullName: "Full Name",
        forgotPassword: "Forgot Password?",
        noAccount: "Don't have an account?",
        hasAccount: "Already have an account?",
        loginHere: "Login here",
        registerHere: "Register here",
        loginSuccess: "Login successful",
        registerSuccess: "Registration successful",
        logoutSuccess: "Logout successful",
        
        // Dashboard
        dashboard: "Dashboard",
        welcome: "Welcome",
        overview: "Overview",
        statistics: "Statistics",
        recentActivity: "Recent Activity",
        
        // Navigation
        home: "Home",
        groups: "Groups",
        myGroups: "My Groups",
        createGroup: "Create Group",
        joinGroup: "Join Group",
        payments: "Payments",
        makePayment: "Make Payment",
        paymentHistory: "Payment History",
        notifications: "Notifications",
        profile: "Profile",
        settings: "Settings",
        admin: "Admin",
        users: "Users",
        
        // Groups
        groupName: "Group Name",
        groupDescription: "Group Description",
        groupMembers: "Group Members",
        groupAdmin: "Group Admin",
        groupCreated: "Group Created",
        groupJoined: "Group Joined",
        groupLeft: "Group Left",
        joinRequests: "Join Requests",
        approveRequest: "Approve Request",
        rejectRequest: "Reject Request",
        leaveGroup: "Leave Group",
        deleteGroup: "Delete Group",
        paymentAmount: "Payment Amount",
        paymentFrequency: "Payment Frequency",
        weekly: "Weekly",
        biweekly: "Bi-weekly",
        monthly: "Monthly",
        
        // Payments
        amount: "Amount",
        date: "Date",
        status: "Status",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        paymentProof: "Payment Proof",
        uploadProof: "Upload Proof",
        paymentCode: "Payment Code",
        
        // Profile
        updateProfile: "Update Profile",
        changePassword: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        profileUpdated: "Profile Updated",
        passwordChanged: "Password Changed",
        
        // Notifications
        markAsRead: "Mark as Read",
        markAllAsRead: "Mark All as Read",
        noNotifications: "No Notifications",
        
        // Admin
        totalUsers: "Total Users",
        totalGroups: "Total Groups",
        totalPayments: "Total Payments",
        activeUsers: "Active Users",
        inactiveUsers: "Inactive Users",
        
        // Validation
        fieldRequired: "This field is required",
        invalidPhone: "Invalid phone number",
        passwordMismatch: "Passwords do not match",
        passwordLength: "Password must be at least 6 characters",
        invalidAmount: "Invalid amount",
        
        // Errors
        serverError: "Server error. Please try again later.",
        networkError: "Network error. Please check your connection.",
        authError: "Authentication error. Please login again.",
        accessDenied: "Access denied. You don't have permission.",
        notFound: "Not found.",
        
        // Language
        language: "Language",
        english: "English",
        kinyarwanda: "Kinyarwanda"
    },
    rw: {
        // General
        appName: "Ikimina Connect",
        loading: "Gutegereza...",
        save: "Kubika",
        cancel: "Guhagarika",
        confirm: "Kwemeza",
        delete: "Gusiba",
        edit: "Guhindura",
        view: "Kureba",
        search: "Gushakisha",
        submit: "Kohereza",
        back: "Gusubira inyuma",
        next: "Komeza",
        yes: "Yego",
        no: "Oya",
        success: "Byagenze neza",
        error: "Ikosa",
        warning: "Iburira",
        info: "Amakuru",
        required: "Bisabwa",
        optional: "Bishoboka",
        footer: "© 2023 Ikimina Connect. Uburenganzira bwose bwihariwe.",
        
        // Auth
        login: "Kwinjira",
        register: "Kwiyandikisha",
        logout: "Gusohoka",
        phoneNumber: "Nimero ya telefoni",
        password: "Ijambo ry'ibanga",
        confirmPassword: "Emeza ijambo ry'ibanga",
        fullName: "Amazina yombi",
        forgotPassword: "Wibagiwe ijambo ry'ibanga?",
        noAccount: "Nta konti ufite?",
        hasAccount: "Usanzwe ufite konti?",
        loginHere: "Injira hano",
        registerHere: "Iyandikishe hano",
        loginSuccess: "Kwinjira byagenze neza",
        registerSuccess: "Kwiyandikisha byagenze neza",
        logoutSuccess: "Gusohoka byagenze neza",
        
        // Dashboard
        dashboard: "Ikibaho",
        welcome: "Murakaza neza",
        overview: "Incamake",
        statistics: "Imibare",
        recentActivity: "Ibikorwa bishya",
        
        // Navigation
        home: "Ahabanza",
        groups: "Amatsinda",
        myGroups: "Amatsinda yanjye",
        createGroup: "Gushinga itsinda",
        joinGroup: "Kwinjira mu itsinda",
        payments: "Ubwishyu",
        makePayment: "Gukora ubwishyu",
        paymentHistory: "Amateka y'ubwishyu",
        notifications: "Imenyesha",
        profile: "Umwirondoro",
        settings: "Igenamiterere",
        admin: "Umuyobozi",
        users: "Abakoresha",
        
        // Groups
        groupName: "Izina ry'itsinda",
        groupDescription: "Ibisobanuro by'itsinda",
        groupMembers: "Abanyamuryango",
        groupAdmin: "Umuyobozi w'itsinda",
        groupCreated: "Itsinda ryashyizweho",
        groupJoined: "Winjiye mu itsinda",
        groupLeft: "Wasohotse mu itsinda",
        joinRequests: "Gusaba kwinjira",
        approveRequest: "Kwemeza ubusabe",
        rejectRequest: "Kwanga ubusabe",
        leaveGroup: "Gusohoka mu itsinda",
        deleteGroup: "Gusiba itsinda",
        paymentAmount: "Ingano y'ubwishyu",
        paymentFrequency: "Inshuro z'ubwishyu",
        weekly: "Buri cyumweru",
        biweekly: "Buri byumweru bibiri",
        monthly: "Buri kwezi",
        
        // Payments
        amount: "Amafaranga",
        date: "Itariki",
        status: "Imiterere",
        pending: "Birategerejwe",
        approved: "Byemejwe",
        rejected: "Byanzwe",
        paymentProof: "Icyemezo cy'ubwishyu",
        uploadProof: "Kohereza icyemezo",
        paymentCode: "Kode y'ubwishyu",
        
        // Profile
        updateProfile: "Kuvugurura umwirondoro",
        changePassword: "Guhindura ijambo ry'ibanga",
        currentPassword: "Ijambo ry'ibanga rya none",
        newPassword: "Ijambo ry'ibanga rishya",
        profileUpdated: "Umwirondoro wavuguruwe",
        passwordChanged: "Ijambo ry'ibanga ryahinduwe",
        
        // Notifications
        markAsRead: "Gushyira ku byasomwe",
        markAllAsRead: "Gushyira byose ku byasomwe",
        noNotifications: "Nta menyesha",
        
        // Admin
        totalUsers: "Abakoresha bose",
        totalGroups: "Amatsinda yose",
        totalPayments: "Ubwishyu bwose",
        activeUsers: "Abakoresha bakora",
        inactiveUsers: "Abakoresha badakora",
        
        // Validation
        fieldRequired: "Iki gice gisabwa",
        invalidPhone: "Nimero ya telefoni itari yo",
        passwordMismatch: "Amagambo y'ibanga ntabwo ahura",
        passwordLength: "Ijambo ry'ibanga rigomba kugira nibura inyuguti 6",
        invalidAmount: "Amafaranga atari yo",
        
        // Errors
        serverError: "Ikibazo cya seriveri. Nyamuneka ongera ugerageze nyuma.",
        networkError: "Ikibazo cy'umurongo. Nyamuneka suzuma umurongo wawe.",
        authError: "Ikibazo cyo kwemeza. Nyamuneka ongera winjire.",
        accessDenied: "Ntibyemerewe. Ntabwo ufite uburenganzira.",
        notFound: "Ntibisanzwe.",
        
        // Language
        language: "Ururimi",
        english: "Icyongereza",
        kinyarwanda: "Ikinyarwanda"
    }
};

// Default language
let currentLanguage = localStorage.getItem('language') || 'en';

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
function t(key) {
    const keys = key.split('.');
    let result = translations[currentLanguage];
    
    for (const k of keys) {
        if (result && result[k]) {
            result = result[k];
        } else {
            // Fallback to English if key not found
            let fallback = translations['en'];
            for (const fk of keys) {
                if (fallback && fallback[fk]) {
                    fallback = fallback[fk];
                } else {
                    return key; // Return the key if not found in fallback
                }
            }
            return fallback;
        }
    }
    
    return result;
}

/**
 * Change the current language
 * @param {string} lang - Language code ('en' or 'rw')
 */
function changeLanguage(lang) {
    if (lang && (lang === 'en' || lang === 'rw')) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updatePageLanguage();
    }
}

/**
 * Update all translatable elements on the page
 */
function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.setAttribute('placeholder', t(key));
    });
    
    document.querySelectorAll('[data-i18n-value]').forEach(element => {
        const key = element.getAttribute('data-i18n-value');
        element.setAttribute('value', t(key));
    });
    
    // Update document title if it has translation
    if (document.title) {
        const titleKey = document.querySelector('meta[name="title-i18n"]')?.getAttribute('content');
        if (titleKey) {
            document.title = t(titleKey);
        }
    }
    
    // Dispatch event for custom handling
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
    
    // Setup language switcher if it exists
    const languageSwitcher = document.getElementById('language-switcher');
    if (languageSwitcher) {
        languageSwitcher.value = currentLanguage;
        languageSwitcher.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
});