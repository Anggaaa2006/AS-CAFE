// Enhanced Login System with Registration
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabSwitching();
        this.setupPasswordToggle();
        this.setupPasswordStrength();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Social login buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('social-btn')) {
                this.handleSocialLogin(e);
            }
        });
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const authForms = document.querySelectorAll('.auth-form');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remove active class from all tabs and forms
                tabButtons.forEach(btn => btn.classList.remove('active'));
                authForms.forEach(form => form.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding form
                button.classList.add('active');
                document.getElementById(`${targetTab}-form`).classList.add('active');
            });
        });
    }

    setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('registerPassword');
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (passwordInput && strengthBar && strengthText) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                const strength = this.calculatePasswordStrength(password);
                
                strengthBar.className = `strength-fill ${strength.level}`;
                strengthText.textContent = strength.text;
            });
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score < 3) {
            return { level: 'weak', text: 'Password lemah' };
        } else if (score < 5) {
            return { level: 'medium', text: 'Password sedang' };
        } else {
            return { level: 'strong', text: 'Password kuat' };
        }
    }

    handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe');
        
        // Validate input
        if (!email || !password) {
            this.showMessage('Mohon lengkapi semua field', 'error');
            return;
        }
        
        // Check credentials
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Login successful
            this.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role || 'customer',
                loginTime: new Date().toISOString()
            };
            
            // Save user session
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            if (rememberMe) {
                localStorage.setItem('rememberUser', JSON.stringify({
                    email: email,
                    rememberMe: true
                }));
            }
            
            this.showMessage('Login berhasil! Mengalihkan...', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
            
        } else {
            this.showMessage('Email atau password salah', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const agreeTerms = formData.get('agreeTerms');
        
        // Validate input
        if (!name || !email || !phone || !password || !confirmPassword) {
            this.showMessage('Mohon lengkapi semua field', 'error');
            return;
        }
        
        if (!agreeTerms) {
            this.showMessage('Anda harus menyetujui syarat dan ketentuan', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('Password dan konfirmasi password tidak sama', 'error');
            return;
        }
        
        if (password.length < 8) {
            this.showMessage('Password minimal 8 karakter', 'error');
            return;
        }
        
        // Check if email already exists
        if (this.users.find(u => u.email === email)) {
            this.showMessage('Email sudah terdaftar', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: `user_${Date.now()}`,
            name: name,
            email: email,
            phone: phone,
            password: password, // In production, this should be hashed
            role: 'customer',
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        // Add to users array
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // Add to admin data if available
        if (window.adminDataManager) {
            const adminData = window.adminDataManager.getData();
            adminData.users = adminData.users || [];
            adminData.users.push(newUser);
            window.adminDataManager.saveData(adminData);
            
            // Add notification
            window.adminDataManager.addNotification({
                type: 'success',
                title: 'Pengguna Baru',
                message: `Pengguna baru terdaftar: ${newUser.name}`,
                timestamp: new Date().toISOString()
            });
        }
        
        this.showMessage('Registrasi berhasil! Silakan login', 'success');
        
        // Switch to login tab
        setTimeout(() => {
            document.querySelector('[data-tab="login"]').click();
            
            // Pre-fill login form
            document.getElementById('loginEmail').value = email;
        }, 1500);
    }

    handleSocialLogin(e) {
        const provider = e.target.classList.contains('google') ? 'Google' : 'Facebook';
        this.showMessage(`Login dengan ${provider} belum tersedia`, 'error');
    }

    checkAuthStatus() {
        // Check if user is already logged in
        if (this.currentUser) {
            // Redirect to appropriate page
            if (this.currentUser.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
            return;
        }
        
        // Check remember me
        const rememberedUser = JSON.parse(localStorage.getItem('rememberUser') || 'null');
        if (rememberedUser && rememberedUser.rememberMe) {
            document.getElementById('loginEmail').value = rememberedUser.email;
            document.getElementById('rememberMe').checked = true;
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Insert message at the top of active form
        const activeForm = document.querySelector('.auth-form.active');
        if (activeForm) {
            activeForm.insertBefore(messageDiv, activeForm.firstChild);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberUser');
        window.location.href = 'login.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
}

// Initialize auth system
const authSystem = new AuthSystem();

// Make auth system globally available
window.authSystem = authSystem;

// Enhanced login styles
const loginStyles = `
.message {
    padding: 12px 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.95rem;
    font-weight: 500;
    animation: slideDown 0.3s ease;
}

.message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.auth-form {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.input-group input:focus {
    outline: none;
    border-color: #c8a97e;
    background: white;
    box-shadow: 0 0 0 3px rgba(200, 169, 126, 0.1);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #b89669 0%, #a68558 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(200, 169, 126, 0.3);
}

.social-btn:hover {
    border-color: #c8a97e;
    background: #f8f9fa;
    transform: translateY(-1px);
}

.tab-btn {
    transition: all 0.3s ease;
}

.tab-btn:hover {
    color: #c8a97e;
}

.tab-btn.active {
    color: #c8a97e;
}

.tab-btn.active::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #c8a97e;
}
`;

// Add login styles
const loginStyleSheet = document.createElement('style');
loginStyleSheet.textContent = loginStyles;
document.head.appendChild(loginStyleSheet);