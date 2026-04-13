// Toggle logic for auth.html
function toggleAuth(type) {
    if(type === 'login') {
        document.getElementById('signup-card-container').style.display = 'none';
        document.getElementById('login-card-container').style.display = 'block';
    } else {
        document.getElementById('login-card-container').style.display = 'none';
        document.getElementById('signup-card-container').style.display = 'block';
    }
}

// Redirect if already logged in
auth.onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('auth.html')) {
        window.location.href = 'dashboard.html';
    }
});

// Purana handleLogin, handleSignup, signInWithGoogle yahan paste karein.
async function handleLogin(event) {
    event.preventDefault();
    const loginInput = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!loginInput || !password) return alert("Enter credentials");

    let loginEmail = loginInput;
    try {
        if (!loginInput.includes('@')) {
            const snapshot = await db.collection('users').where('username', '==', loginInput).get();
            if (snapshot.empty) return alert("Username not found.");
            loginEmail = snapshot.docs[0].data().email;
        }
        await auth.signInWithEmailAndPassword(loginEmail, password);
        window.location.href = 'dashboard.html';
    } catch (error) { alert(error.message); }
}

async function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
        const usernameCheck = await db.collection('users').where('username', '==', username).get();
        if(!usernameCheck.empty) return alert("Username taken.");

        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        await userCred.user.updateProfile({ displayName: username });
        await db.collection('users').doc(userCred.user.uid).set({
            uid: userCred.user.uid, username: username, email: email, balance: 0.00, spent: 0.00
        });
        window.location.href = 'dashboard.html';
    } catch (error) { alert(error.message); }
}

function logoutUser(e) {
    if(e) e.preventDefault();
    auth.signOut().then(() => window.location.href = 'index.html');
}
