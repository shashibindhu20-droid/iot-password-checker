// =============== Password Registration/Login Protection ===============

// Helper: Hash function for password (simple, for demo; in production use a real hash like SHA256)
function simpleHash(str) {
    // DJB2 hash (not cryptographically secure, but prevents plain text storage)
    let hash = 5381;
    for (let i = 0; i < str.length; i++)
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    return hash.toString();
}

// Register/Login event
document.getElementById('authForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('userPassword').value;
    const authMsg = document.getElementById('authMessage');
    authMsg.className = 'message'; // Reset

    if (!username || !password) {
        authMsg.textContent = "Please enter both username and password.";
        authMsg.classList.add('warning');
        return;
    }

    // Hash password for storage
    const pwdHash = simpleHash(password);

    // Get stored users from localStorage (object: {username: hash, ...})
    let users = JSON.parse(localStorage.getItem('iotUsers') || '{}');

    // Check if password hash already exists for another user
    let ownerUser = null;
    for (let user in users) {
        if (users[user] === pwdHash) {
            ownerUser = user;
            break;
        }
    }

    if (ownerUser && ownerUser !== username) {
        // Password belongs to another user
        authMsg.textContent = "⚠️ This password belongs to another user. Access denied.";
        authMsg.classList.add('warning');
        return;
    } else if (users[username] === pwdHash) {
        // Correct user and password
        authMsg.textContent = "✅ Access granted. Welcome back!";
        authMsg.classList.add('success');
        return;
    } else if (users[username] && users[username] !== pwdHash) {
        // Username exists but wrong password
        authMsg.textContent = "⚠️ Incorrect password for this user.";
        authMsg.classList.add('warning');
        return;
    } else {
        // New user, save username and password hash
        users[username] = pwdHash;
        localStorage.setItem('iotUsers', JSON.stringify(users));
        authMsg.textContent = "✅ Registered successfully. Welcome!";
        authMsg.classList.add('success');
        return;
    }
});

// =============== Password Strength Checker ===============
const checkPasswordEl = document.getElementById('checkPassword');
const strengthBarEl = document.getElementById('strengthBar');
const strengthTextEl = document.getElementById('strengthText');

// Returns score (0-4) and description
function checkPasswordStrength(password) {
    let score = 0;
    if (password.length > 7) score++;           // Length
    if (/[A-Z]/.test(password)) score++;         // Uppercase
    if (/[0-9]/.test(password)) score++;         // Number
    if (/[^A-Za-z0-9]/.test(password)) score++;  // Special char
    let desc = ["Very Weak", "Weak", "Okay", "Strong", "Very Strong"];
    return { score: score, desc: desc[score] };
}

checkPasswordEl.addEventListener('input', function() {
    const pwd = this.value;
    const { score, desc } = checkPasswordStrength(pwd);

    // Update bar color and width
    const colors = ["#e53935", "#fbc02d", "#ffb300", "#43a047", "#0078d4"];
    strengthBarEl.innerHTML = `<span style="width:${(score+1)*20}%;background:${colors[score]};"></span>`;
    strengthTextEl.textContent = pwd ? desc : '';
});

// =============== Strong Password Generator ===============
const generateBtn = document.getElementById('generateBtn');
const generatedPasswordEl = document.getElementById('generatedPassword');
const copyBtn = document.getElementById('copyBtn');

// Generate a strong random password
function generatePassword(len = 12) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pwd = "";
    for(let i=0;i<len;i++)
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    return pwd;
}

generateBtn.addEventListener('click', () => {
    const pwd = generatePassword();
    generatedPasswordEl.value = pwd;
    checkPasswordEl.value = pwd;
    checkPasswordEl.dispatchEvent(new Event('input'));
});

copyBtn.addEventListener('click', () => {
    generatedPasswordEl.select();
    document.execCommand('copy');
    copyBtn.textContent = "Copied!";
    setTimeout(()=>{ copyBtn.textContent = "Copy"; }, 1200);
});

// =============== End of Script ===============
// Everything runs directly in browser (no backend) and works with localStorage.
// Comments are included for clarity!