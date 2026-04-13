// /js/dashboard.js
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'auth.html'; // Protect dashboard
    } else {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) updateDashboardUI(userDoc.data());
        
        // Load default page on first visit
        if(document.getElementById('dashboard-content').innerHTML.trim() === "") {
            loadPage('home');
        }
    }
});

function updateDashboardUI(data) {
    const balanceEl = document.querySelectorAll('.user-balance');
    balanceEl.forEach(el => el.innerText = `₹${data.balance.toFixed(2)}`);
    
    // Updates link dynamically if element exists on page
    const refLink = document.getElementById('dynamicRefLink');
    if(refLink) refLink.innerText = `https://boostifyx.in/ref/${data.username}`;
}

// Sidebar logic
document.getElementById('openMenuBtn').onclick = () => {
    document.getElementById('sidebarMenu').classList.add('active');
    document.getElementById('sidebarOverlay').classList.add('active');
}
document.getElementById('closeMenuBtn').onclick = document.getElementById('sidebarOverlay').onclick = () => {
    document.getElementById('sidebarMenu').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}
