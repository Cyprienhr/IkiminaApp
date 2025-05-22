/**
 * Language handling for Ikimina application
 * Manages language switching between English and Kinyarwanda
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize language from localStorage or default to English
    const currentLanguage = localStorage.getItem('language') || 'en';
    
    // Set up language switcher if it exists
    const languageSwitcher = document.getElementById('language-switcher');
    if (languageSwitcher) {
        languageSwitcher.value = currentLanguage;
        languageSwitcher.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    
    // Apply initial language
    updatePageLanguage();
});

/**
 * Change the current language
 * @param {string} lang - Language code ('en' or 'rw')
 */
function changeLanguage(lang) {
    if (lang && (lang === 'en' || lang === 'rw')) {
        localStorage.setItem('language', lang);
        updatePageLanguage();
    }
}

/**
 * Update all translatable elements on the page
 */
function updatePageLanguage() {
    const currentLanguage = localStorage.getItem('language') || 'en';
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.setAttribute('placeholder', t(key));
    });
    
    // Update button values
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
    document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: currentLanguage } 
    }));
}

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
function t(key) {
    return getTranslation(key);
}

/**
 * Alias for t() function for backward compatibility
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
function getTranslation(key) {
    const currentLanguage = localStorage.getItem('language') || 'en';
    
    if (!translations || !translations[currentLanguage]) {
        console.error('Translations not loaded or language not supported');
        return key;
    }
    
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