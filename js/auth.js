document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and redirect
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        window.location.href = 'index.html';
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Reset error messages
            document.getElementById('email-error').style.display = 'none';
            document.getElementById('password-error').style.display = 'none';
            
            // Validate inputs
            let isValid = true;
            
            if (!email) {
                document.getElementById('email-error').textContent = 'Email is required';
                document.getElementById('email-error').style.display = 'block';
                isValid = false;
            } else if (!validateEmail(email)) {
                document.getElementById('email-error').textContent = 'Please enter a valid email';
                document.getElementById('email-error').style.display = 'block';
                isValid = false;
            }
            
            if (!password) {
                document.getElementById('password-error').textContent = 'Password is required';
                document.getElementById('password-error').style.display = 'block';
                isValid = false;
            } else if (password.length < 6) {
                document.getElementById('password-error').textContent = 'Password must be at least 6 characters';
                document.getElementById('password-error').style.display = 'block';
                document.getElementById('password-error').style.fontSize = '20px';

                isValid = false;
            }
            
            if (!isValid) return;
            
            // Check user credentials
            fetch('http://localhost:3001/users')
                .then(response => response.json())
                .then(users => {
                    const user = users.find(u => u.email === email && u.password === password);
                    if (user) {
                        // Successful login
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        window.location.href = 'index.html';
                    } else {
                        document.getElementById('password-error').textContent = 'Invalid email or password';
                        document.getElementById('password-error').style.display = 'block';
                        document.getElementById('password-error').style.textAlign = 'center';
                        document.getElementById('password-error').style.fontSize = '20px';
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Reset error messages
            document.getElementById('name-error').style.display = 'none';
            document.getElementById('email-error').style.display = 'none';
            document.getElementById('password-error').style.display = 'none';
            document.getElementById('confirm-password-error').style.display = 'none';
            
            // Validate inputs
            let isValid = true;
            
            if (!name) {
                document.getElementById('name-error').textContent = 'Name is required';
                document.getElementById('name-error').style.display = 'block';
                isValid = false;
            }
            
            if (!email) {
                document.getElementById('email-error').textContent = 'Email is required';
                document.getElementById('email-error').style.display = 'block';
                isValid = false;
            } else if (!validateEmail(email)) {
                document.getElementById('email-error').textContent = 'Please enter a valid email';
                document.getElementById('email-error').style.display = 'block';
                isValid = false;
            }
            
            if (!password) {
                document.getElementById('password-error').textContent = 'Password is required';
                document.getElementById('password-error').style.display = 'block';
                isValid = false;
            } else if (password.length < 6) {
                document.getElementById('password-error').textContent = 'Password must be at least 6 characters';
                document.getElementById('password-error').style.display = 'block';
                isValid = false;
            }
            
            if (!confirmPassword) {
                document.getElementById('confirm-password-error').textContent = 'Please confirm your password';
                document.getElementById('confirm-password-error').style.display = 'block';
                isValid = false;
            } else if (password !== confirmPassword) {
                document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
                document.getElementById('confirm-password-error').style.display = 'block';
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Check if email already exists
            fetch('http://localhost:3001/users')
                .then(response => response.json())
                .then(users => {
                    const emailExists = users.some(u => u.email === email);//return true
                    let id = Math.max(...users.map(x=>x.id));
                    id++;
                    
                    
                    if (emailExists) {
                        document.getElementById('email-error').textContent = 'Email already registered';
                        document.getElementById('email-error').style.display = 'block';
                    } else {
                        // Register new user
                        const newUser = {
                            id:id.toString(),
                            name,
                            email,
                            password
                        };
                        
                        fetch('http://localhost:3001/users', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(newUser)
                        })
                        .then(response => response.json())
                        .then(() => {
                            localStorage.setItem('isLoggedIn', 'true');
                            localStorage.setItem('currentUser', JSON.stringify(newUser));
                            window.location.href = 'login.html';
                        })
                        .catch(error => console.error('Error:', error));
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}