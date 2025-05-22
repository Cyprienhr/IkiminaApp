/**
 * Landing page JavaScript for Ikimina application
 * Handles mobile menu toggling and smooth scrolling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language
    initLanguage();
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const landingNav = document.querySelector('.landing-nav');
    const headerActions = document.querySelector('.header-actions');
    
    mobileMenuToggle.addEventListener('click', function() {
        landingNav.classList.toggle('active');
        headerActions.classList.toggle('active');
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            landingNav.classList.remove('active');
            headerActions.classList.remove('active');
            
            // Scroll to target
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add active class to nav items based on scroll position
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.landing-nav a').forEach(navItem => {
                    navItem.classList.remove('active');
                    if (navItem.getAttribute('href') === `#${sectionId}`) {
                        navItem.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Add active class to nav links style
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .landing-nav a.active {
                color: var(--primary-color);
                font-weight: 600;
            }
        </style>
    `);
});