```javascript
// ===================================
// AUTH STATE MANAGEMENT & LOGIC
// ===================================

auth.onAuthStateChanged(async (user) => {
    const path = window.location.pathname;
    const isRoot = !path.includes('/pages/');
    const isAuthPage = path.endsWith('index.html') || path.endsWith('auth.html') || path.endsWith('/') || path.indexOf('.html') === -1;

    if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            let generatedUsername = user.displayName ? user.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000) : "user" + Math.floor(Math.random() * 10000);
            await createUserData(user, generatedUsername, null);
        }
        
        // Redirect if on auth pages
        if (isAuthPage) {
            window.location.href = 'dashboard.html';
        } else {
            // Update Dashboard UI
            if (typeof updateDashboardUI === 'function') {
                updateDashboardUI((await userDocRef.get()).data());
            }
        }
    } else {
        // Redirect logged-out users away from dashboard pages
        if (!isAuthPage) {
            window.location.href = isRoot ? 'auth.html' : '../auth.html';
        }
    }
});

async function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const whatsapp = document.getElementById('signup-whatsapp').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!username || !email || !password) {
        return alert("Please fill all required fields.");
    }
    if (password !== confirmPassword) {
        return alert("Passwords do not match.");
    }

    try {
        const usernameCheck = await db.collection('users').where('username', '==', username).get();
        if(!usernameCheck.empty) {
            return alert("Username already taken. Please choose another.");
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        await user.updateProfile({ displayName: username });
        await createUserData(user, username, whatsapp);
        
        alert("Account created successfully! Welcome to BoostifyX.");
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const loginInput = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!loginInput || !password) {
        return alert("Please enter both username/email and password.");
    }

    let loginEmail = loginInput;

    try {
        if (!loginInput.includes('@')) {
            const snapshot = await db.collection('users').where('username', '==', loginInput).get();
            if (snapshot.empty) {
                return alert("Username not found. Please check or sign up.");
            }
            loginEmail = snapshot.docs[0].data().email;
        }

        await auth.signInWithEmailAndPassword(loginEmail, password);
    } catch (error) {
        alert(`Login Error: ${error.message}`);
    }
}

async function handleForgotPassword() {
    const loginInput = document.getElementById('login-email').value.trim();
    if (!loginInput) {
        return alert("Please enter your Username or Email in the login box first, then click Forgot Password.");
    }

    let resetEmail = loginInput;
    try {
        if (!loginInput.includes('@')) {
            const snapshot = await db.collection('users').where('username', '==', loginInput).get();
            if (snapshot.empty) return alert("Username not found.");
            resetEmail = snapshot.docs[0].data().email;
        }
        await auth.sendPasswordResetEmail(resetEmail);
        alert(`Password reset link sent to: ${resetEmail}\n(Please check your spam folder as well)`);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function signInWithGoogle(event) {
    event.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            let generatedUsername = user.displayName ? user.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000) : "user" + Math.floor(Math.random() * 10000);
            await createUserData(user, generatedUsername, null);
            alert(`Welcome, ${user.displayName}! Your account has been created.`);
        }
    } catch (error) {
        alert(`Google Sign-In Error: ${error.message}`);
    }
}

async function createUserData(user, username, whatsapp) {
    const userRef = db.collection('users').doc(user.uid);
    await userRef.set({
        uid: user.uid,
        username: username,
        email: user.email,
        whatsapp: whatsapp || '',
        balance: 0.00,
        spent: 0.00,
        createdAt: FieldValue.serverTimestamp()
    });
}

function logoutUser(event) {
    event.preventDefault();
    auth.signOut().catch(error => alert(`Logout Error: ${error.message}`));
}

// Auth page UI toggles
function showLoginCard() {
    const loginCard = document.getElementById('login-card-container');
    const signupCard = document.getElementById('signup-card-container');
    if (loginCard && signupCard) {
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
        setTimeout(() => {
            loginCard.style.boxShadow = "0 0 40px rgba(255, 46, 99, 0.7)";
            setTimeout(() => { loginCard.style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)"; }, 1500);
        }, 50);
    }
}

function showSignupCard() {
    const loginCard = document.getElementById('login-card-container');
    const signupCard = document.getElementById('signup-card-container');
    if (loginCard && signupCard) {
        loginCard.style.display = 'none';
        signupCard.style.display = 'block';
        setTimeout(() => {
            signupCard.style.boxShadow = "0 0 40px rgba(108, 44, 246, 0.7)";
            setTimeout(() => { signupCard.style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)"; }, 1500);
        }, 50);
    }
}
```
