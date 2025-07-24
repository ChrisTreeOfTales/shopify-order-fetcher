// Navigation functionality for all pages

// Set the active navigation link based on current page
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Check if this link matches the current page
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || 
            (currentPath === '/' && linkPath === '/') ||
            (currentPath === '/index.html' && linkPath === '/')) {
            link.classList.add('active');
        }
    });
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
});

// Optional: Update navigation when navigating with history API
window.addEventListener('popstate', () => {
    setActiveNavLink();
});