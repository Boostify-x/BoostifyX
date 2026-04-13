```javascript
// ===================================
// DASHBOARD LOGIC
// ===================================

function updateDashboardUI(userData) {
    if (!userData) return;
    
    const userBalanceEls = document.querySelectorAll('.user-balance');
    const formattedBalance = `₹${userData.balance.toFixed(5)}`;
    userBalanceEls.forEach(el => el.innerText = formattedBalance);

    if (document.querySelector('#dash-username-card h3')) {
        document.querySelector('#dash-username-card h3').innerText = userData.username || 'User';
    }
    if (document.querySelector('#dash-spent-card h3')) {
        document.querySelector('#dash-spent-card h3').innerText = `₹${userData.spent.toFixed(2)}`;
    }
    if (document.getElementById('profile-email-field')) {
        document.getElementById('profile-email-field').value = userData.email;
    }
    if (document.getElementById('dynamicRefLink')) {
        document.getElementById('dynamicRefLink').innerText = `https://boostifyx.in/ref/${userData.username}`;
    }
}

// Sidebar logic
const openBtn = document.getElementById('openMenuBtn');
const closeBtn = document.getElementById('closeMenuBtn');
const sidebar = document.getElementById('sidebarMenu');
const overlay = document.getElementById('sidebarOverlay');

function toggleSidebar() {
    if(sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
    }
}
if(openBtn) openBtn.addEventListener('click', toggleSidebar);
if(closeBtn) closeBtn.addEventListener('click', toggleSidebar);
if(overlay) overlay.addEventListener('click', toggleSidebar);

// Landing / Misc UI Logics
function toggleMenu() {
    const menu = document.getElementById('mobileDropdown');
    const icon = document.getElementById('menuIcon');
    if(menu && icon) {
        menu.classList.toggle('active');
        if (menu.classList.contains('active')) {
            icon.classList.remove('fa-bars'); icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
        }
    }
}

// Counter Logic
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const counter = entry.target.querySelector('.counter');
            if (counter && !counter.dataset.animated) {
                startCounter(counter); counter.dataset.animated = "true";
            }
            observer.unobserve(entry.target); 
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

function startCounter(el) {
    const target = +el.getAttribute('data-target');
    let current = 0;
    const increment = target / 100;
    const updateCount = () => {
        if (current < target) {
            current += increment;
            el.innerText = Math.ceil(current).toLocaleString();
            requestAnimationFrame(updateCount);
        } else {
            el.innerText = target.toLocaleString();
        }
    };
    updateCount();
}

function openPolicyPage(policyType) {
    const mainPage = document.getElementById('main-page');
    const policyPage = document.getElementById('policy-page');
    if(!mainPage || !policyPage) return;

    mainPage.style.display = 'none';
    policyPage.style.display = 'block';
    window.scrollTo(0, 0);

    ['terms', 'privacy', 'refund', 'disclaimer'].forEach(id => {
        const el = document.getElementById('content-' + id);
        if(el) el.style.display = 'none';
    });

    const targetContent = document.getElementById('content-' + policyType);
    if(targetContent) {
        targetContent.style.display = 'block';
        const titles = {
            'terms': 'Terms of Service',
            'privacy': 'Privacy Policy',
            'refund': 'Refund Policy',
            'disclaimer': 'Disclaimer'
        };
        document.getElementById('policy-title').innerText = titles[policyType];
    }
}

function closePolicyPage() {
    const mainPage = document.getElementById('main-page');
    const policyPage = document.getElementById('policy-page');
    if(mainPage && policyPage) {
        policyPage.style.display = 'none';
        mainPage.style.display = 'block';
        window.scrollTo(0, 0);
    }
}

// Internal Hash routing for embedded views inside dashboard.html
function handleHashView() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    const validViews = ['dashboard', 'profile', 'affiliates', 'announcements', 'blog', 'blog-details', 'massorder', 'neworder'];
    
    if (validViews.includes(hash)) {
        document.querySelectorAll('.container[id^="view-"]').forEach(el => el.style.display = 'none');
        const target = document.getElementById('view-' + hash);
        if (target) {
            target.style.display = 'block';
        }
        
        document.querySelectorAll('.sidebar-menu a').forEach(el => el.classList.remove('active'));
        const activeNav = document.getElementById('nav-' + hash);
        if(activeNav) activeNav.classList.add('active');
        
        if(sidebar && sidebar.classList.contains('active')) toggleSidebar();
        window.scrollTo(0, 0);
    }
}

if(document.body.classList.contains('dashboard-mode')) {
    window.addEventListener('hashchange', handleHashView);
    document.addEventListener('DOMContentLoaded', handleHashView);
}

// Forms & Functions
const paymentForm = document.getElementById('paymentForm');
if(paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const currentUser = auth.currentUser;
        if (!currentUser) return alert("You must be logged in to add funds.");
        
        const amount = parseFloat(document.getElementById('payAmount').value);
        const orderId = document.getElementById('payOrderID').value;
        const method = document.getElementById('payMethod').value;
        if(!amount || !orderId) { alert("Please enter Amount and Transaction ID"); return; }
        if(amount <= 0) { return alert("Amount must be positive."); }

        const userDocRef = db.collection('users').doc(currentUser.uid);

        try {
            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists) throw "User data not found!";
                
                const newBalance = userDoc.data().balance + amount;
                transaction.update(userDocRef, { balance: newBalance });

                const transactionsRef = userDocRef.collection('transactions').doc();
                transaction.set(transactionsRef, {
                    type: 'credit',
                    method: method,
                    amount: amount,
                    orderId: orderId,
                    status: 'Completed',
                    timestamp: FieldValue.serverTimestamp()
                });
            });

            updateDashboardUI((await userDocRef.get()).data());
            alert("Payment Verified! Balance Updated.");
            paymentForm.reset();
        } catch (error) {
            console.error("Error adding funds: ", error);
            alert("An error occurred while updating your balance. Please try again.");
        }
    });
}

const ticketForm = document.getElementById('ticketForm');
if(ticketForm) {
    ticketForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('ticketID').value;
        const msg = document.getElementById('ticketMsg').value;
        if(!msg) { alert("Please enter a message"); return; }
        const noTicketMsg = document.getElementById('noTicketMsg');
        if(noTicketMsg) noTicketMsg.style.display = 'none';
        const randID = Math.floor(Math.random() * 10000);
        const row = `<tr><td>${randID}</td><td>${id ? 'Order: ' + id : 'Support Request'}</td><td><span class="badge badge-new" style="background:#e0f2fe; color:#0284c7;">Pending</span></td><td>Just Now</td></tr>`;
        document.querySelector('#ticketTable tbody').insertAdjacentHTML('afterbegin', row);
        alert("Ticket Submitted Successfully!");
        ticketForm.reset();
    });
}

function openBlog(id) {
    window.location.hash = 'blog-details';
    if(id === 1) {
        document.getElementById('detailTitle').innerText = "How To Rank Telegram Channel Fast";
        document.getElementById('detailImg').src = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
    } else {
        document.getElementById('detailTitle').innerText = "Organic vs Paid Growth – What Works Better?";
        document.getElementById('detailImg').src = "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1000&auto=format&fit=crop";
    }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active'); b.style.background = '#fff'; b.style.borderColor = '#eee';
        });
        this.classList.add('active');
        const color = this.getAttribute('data-color');
        let r = parseInt(color.slice(1, 3), 16), g = parseInt(color.slice(3, 5), 16), bHex = parseInt(color.slice(5, 7), 16);
        this.style.background = `rgba(${r}, ${g}, ${bHex}, 0.1)`;
        this.style.borderColor = color;
    });
});

document.querySelectorAll('.order-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const parent = this.parentElement;
        parent.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-question');
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            const currentItem = this.parentElement;
            const isActive = currentItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
            if (!isActive) currentItem.classList.add('active');
        });
    });
});

function copyRefLink() {
    const linkText = document.getElementById('dynamicRefLink').innerText;
    navigator.clipboard.writeText(linkText).then(() => alert("Referral Link Copied!"));
}

// ===================================
// AI CHATBOT LOGIC
// ===================================
let chatInit = false;
let flow = "MAIN", curCat = "", qIdx = 0;
let specialState = "";

const db_chat = {
    "Order Status": { subs: ["Pending", "Partial", "Canceled"], qs: ["Order ID"], res: "I have checked your order status with our server. Our team is working on it and updates will reflect shortly." },
    "Add Funds Issues": { subs: ["UPI Payment Failed", "Crypto Not Added", "Amount Not Reflected"], qs: ["Transaction ID", "Amount (₹)"], res: "Our payment gateway team is verifying your transaction. Usually, it takes 5-15 minutes to reflect." },
    "Refill / Drop Issues": { subs: ["Followers Dropped", "Refill Button Not Working", "Partial Refill Only"], qs: ["Order ID", "Drop Percentage (%)"], res: "I have sent a refill request to the respective server. Please allow 24-48 hours for processing." },
    "Support Agent": { subs: ["Talk to Human", "Main Menu"], qs: [], res: "" }
}

function openChatbotPage() {
    document.getElementById('globalChatBtn').style.display = 'none';
    document.getElementById('chatbot-page').style.display = 'flex';
    if(!chatInit) { startChat(); chatInit = true; }
}

function closeChatbotPage() {
    document.getElementById('chatbot-page').style.display = 'none';
    document.getElementById('globalChatBtn').style.display = 'block';
}

function startChat(skipGreeting = false) {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = ""; specialState = "";
    if(!skipGreeting) {
        showBot("Hello! I am your <b>Boostify<span class='x-accent'>X</span> AI Assistant</b>.<br>Please select your issue category below so I can assist you instantly:");
    } else {
        showBot("Please select a category from the Main Menu:");
    }
    showOpts(Object.keys(db_chat), "MAIN");
}

function showBot(txt, delay = 600) {
    const chatBox = document.getElementById('chatBox');
    const id = 'b' + Date.now();
    const w = document.createElement('div'); w.className = 'chat-msg-wrap chat-msg-bot';
    w.innerHTML = `<div class="chat-bubble chat-bubble-bot" id="${id}"><div class="chat-typing"><span></span><span></span><span></span></div></div>`;
    chatBox.appendChild(w); chatBox.scrollTop = chatBox.scrollHeight;
    setTimeout(() => { document.getElementById(id).innerHTML = txt; chatBox.scrollTop = chatBox.scrollHeight; }, delay);
}

function showOpts(opts, type) {
    const chatBox = document.getElementById('chatBox');
    flow = type;
    const l = document.createElement('div'); l.className = 'chat-options-list';
    opts.forEach(o => {
        const b = document.createElement('div'); b.className = 'chat-chip'; b.innerText = o;
        b.onclick = () => onSelect(o, l); l.appendChild(b);
    });
    setTimeout(() => { chatBox.appendChild(l); chatBox.scrollTop = chatBox.scrollHeight; }, 700);
}

function onSelect(txt, container) {
    const chatBox = document.getElementById('chatBox');
    container.style.opacity = "0.5"; container.style.pointerEvents = "none";
    const w = document.createElement('div'); w.className = 'chat-msg-wrap chat-msg-user';
    w.innerHTML = `<div class="chat-bubble chat-bubble-user">${txt}</div>`;
    chatBox.appendChild(w); chatBox.scrollTop = chatBox.scrollHeight;

    if(txt === "Main Menu" || txt === "Go Back") { setTimeout(() => startChat(true), 500); return; }
    if(txt === "Talk to Human") { showBot("Connecting you to our support...<br>Please provide your <b>Order ID</b> below (or type N/A)"); specialState = "TICKET_CREATE"; unlockInput(); return; }

    if(flow === "MAIN") { curCat = txt; showBot(`You selected <b>${txt}</b>.<br>Please choose your specific issue:`); showOpts(db_chat[txt].subs, "SUB"); }
    else if(flow === "SUB") { qIdx = 0; flow = "ASK"; ask(); }
}

function ask() {
    const qs = db_chat[curCat].qs;
    if(qIdx < qs.length) { showBot(`Please enter your <b>${qs[qIdx]}</b>:`); unlockInput(); }
    else { const tkt = "#BX" + Math.floor(Math.random()*900000+100000); showBot(`<b>Request Submitted Successfully!</b><br>${db_chat[curCat].res}<br><i>Ref ID: ${tkt}</i>`); setTimeout(askFinalMenu, 2000); }
}

function askFinalMenu() { showBot("Is there anything else I can help you with?"); showOpts(["Main Menu"], "FINAL"); }

function unlockInput() { 
    const inp = document.getElementById('msgInp');
    inp.disabled = false; inp.classList.remove('locked'); inp.placeholder = "Type your answer here..."; inp.focus(); checkInput();
}

function checkInput() {
    const val = document.getElementById('msgInp').value.trim();
    const btn = document.getElementById('sendBtn');
    if(val.length > 0) btn.classList.add('active'); else btn.classList.remove('active');
}

function onSend() {
    const chatBox = document.getElementById('chatBox');
    const inp = document.getElementById('msgInp'); const txt = inp.value.trim(); 
    if(!txt) return;
    
    inp.value = ""; inp.disabled = true; inp.classList.add('locked'); inp.placeholder = "Select an option above...";
    document.getElementById('sendBtn').classList.remove('active');

    const w = document.createElement('div'); w.className = 'chat-msg-wrap chat-msg-user';
    w.innerHTML = `<div class="chat-bubble chat-bubble-user">${txt}</div>`;
    chatBox.appendChild(w); chatBox.scrollTop = chatBox.scrollHeight;

    if(specialState === "TICKET_CREATE") {
        specialState = ""; const tkt = "#TKT" + Math.floor(Math.random()*900000+100000);
        showBot(`Thanks! <b>Ticket ID: ${tkt}</b> has been assigned to a human agent. They will reply in your ticket section soon.`);
        setTimeout(askFinalMenu, 2000); return;
    }

    if(flow === "ASK") { qIdx++; setTimeout(ask, 500); }
}

const msgInp = document.getElementById('msgInp');
if(msgInp) {
    msgInp.addEventListener("keypress", function(event) {
        if (event.key === "Enter") { event.preventDefault(); document.getElementById("sendBtn").click(); }
    });
}

function handleFile(inp) {
    const chatBox = document.getElementById('chatBox');
    const f = inp.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = (e) => { 
        const w = document.createElement('div'); w.className = 'chat-msg-wrap chat-msg-user';
        let h = `<div class="chat-bubble chat-bubble-user">Sent an attachment</div>`;
        h += `<img src="${e.target.result}" style="max-width:180px; border-radius:12px; margin-top:8px; border:3px solid #fff;">`;
        w.innerHTML = h; chatBox.appendChild(w); chatBox.scrollTop = chatBox.scrollHeight;
        showBot("Screenshot received successfully! 🔍 Our team will review this.");
        document.getElementById('msgInp').disabled = true; document.getElementById('msgInp').classList.add('locked');
        document.getElementById('msgInp').placeholder = "Select an option above...";
        document.getElementById('sendBtn').classList.remove('active');
        setTimeout(askFinalMenu, 2000);
    };
    r.readAsDataURL(f);
}
```
