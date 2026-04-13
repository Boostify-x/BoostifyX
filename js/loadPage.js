// /js/loadPage.js
async function loadPage(page) {
    try {
        const response = await fetch(`pages/${page}.html`);
        if (!response.ok) throw new Error('Page not found');
        
        const html = await response.text();
        document.getElementById('dashboard-content').innerHTML = html;

        // Update active nav link
        document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${page}`);
        if(activeNav) activeNav.classList.add('active');

        // Close sidebar on mobile
        document.getElementById('sidebarMenu').classList.remove('active');
        document.getElementById('sidebarOverlay').classList.remove('active');
        
        // Re-attach tab logic if it exists on the new page
        attachTabListeners();

    } catch (error) {
        console.error("Error loading page:", error);
        document.getElementById('dashboard-content').innerHTML = "<h2>Page Error</h2><p>Could not load content.</p>";
    }
}

// Function to handle Horizontal Tabs (Orders/Transactions)
function attachTabListeners() {
    document.querySelectorAll('.order-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}
