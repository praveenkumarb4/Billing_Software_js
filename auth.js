//const API_BASE_URL = 'http://localhost:8080/api';
const API_BASE_URL = 'https://billing-software-java.onrender.com/api';

// Check if user is authenticated
function isAuthenticated() {
    return sessionStorage.getItem('user') !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Check authentication and redirect if needed
function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();

    const shopName = document.getElementById('shopName').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shopName, username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store user info and shop info in session
            sessionStorage.setItem('user', JSON.stringify(data.user));
            sessionStorage.setItem('shop', JSON.stringify(data.shop));
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            // Show error message
            errorMessage.textContent = data.message || 'Login failed';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}
