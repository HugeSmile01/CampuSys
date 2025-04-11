import { app, analytics } from './firebaseConfig';

// Firebase Authentication and Realtime Database references
const auth = firebase.auth();
const database = firebase.database();

// Role-based access control using custom claims
const setCustomUserClaims = (userId, role) => {
    const userRef = database.ref(`users/${userId}`);
    userRef.set({ role });
};

// Event listeners for user registration and login
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            setCustomUserClaims(user.uid, role);
            user.sendEmailVerification();
            Swal.fire({
                icon: 'success',
                title: 'Registration successful!',
                text: 'Please verify your email before logging in.',
                confirmButtonText: 'OK'
            });
        })
        .catch((error) => {
            console.error('Error during registration:', error);
            Swal.fire({
                icon: 'error',
                title: 'Registration failed',
                text: 'Please try again.',
                confirmButtonText: 'OK'
            });
        });
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    Swal.fire({
        title: 'Logging in...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user.emailVerified) {
                Swal.fire({
                    icon: 'success',
                    title: 'Login successful!',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Redirect to the appropriate dashboard or homepage
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Email not verified',
                    text: 'Please verify your email before logging in.',
                    confirmButtonText: 'OK'
                });
            }
        })
        .catch((error) => {
            console.error('Error during login:', error);
            Swal.fire({
                icon: 'error',
                title: 'Login failed',
                text: 'Please try again.',
                confirmButtonText: 'OK'
            });
        });
});

// Toggle hamburger menu
document.getElementById('hamburger-menu').addEventListener('click', () => {
    const menu = document.getElementById('navigation-menu');
    const isExpanded = menu.getAttribute('aria-hidden') === 'false';
    menu.setAttribute('aria-hidden', isExpanded ? 'true' : 'false');
    document.getElementById('hamburger-menu').setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('slide-animation');
});

// Lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const lazyLoad = (image) => {
        image.src = image.dataset.src;
        image.removeAttribute('data-src');
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    lazyLoad(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        lazyImages.forEach((image) => {
            observer.observe(image);
        });
    } else {
        lazyImages.forEach((image) => {
            lazyLoad(image);
        });
    }
});

// Event listener for the registration form submission to capture additional registration data and store it in Firebase
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('registerFullName').value;
    const contact = document.getElementById('registerContact').value;
    const lrn = document.getElementById('registerLRN').value;
    const sex = document.getElementById('registerSex').value;
    const birthday = document.getElementById('registerBirthday').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userRef = database.ref(`users/${user.uid}`);
            userRef.set({
                fullName,
                contact,
                lrn,
                sex,
                birthday,
                email
            });
            user.sendEmailVerification();
            Swal.fire({
                icon: 'success',
                title: 'Registration successful!',
                text: 'Please verify your email before logging in.',
                confirmButtonText: 'OK'
            });
        })
        .catch((error) => {
            console.error('Error during registration:', error);
            Swal.fire({
                icon: 'error',
                title: 'Registration failed',
                text: 'Please try again.',
                confirmButtonText: 'OK'
            });
        });
});

// Add functionality for "Forgot Password" feature
document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt('Please enter your email address:');
    if (email) {
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Password reset email sent!',
                    text: 'Please check your inbox.',
                    confirmButtonText: 'OK'
                });
            })
            .catch((error) => {
                console.error('Error sending password reset email:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to send password reset email',
                    text: 'Please try again.',
                    confirmButtonText: 'OK'
                });
            });
    }
});

// Add dark mode toggle
const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
};

document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Add chat feature
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const message = chatInput.value;
        const userId = firebase.auth().currentUser.uid;
        const chatRef = database.ref('chat');

        chatRef.push({
            userId,
            message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        chatInput.value = '';
    }
});

const fetchChatMessages = () => {
    const chatRef = database.ref('chat');
    chatRef.on('value', (snapshot) => {
        const messages = snapshot.val();
        chatMessages.innerHTML = '';

        for (const messageId in messages) {
            const message = messages[messageId];
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');
            messageElement.innerHTML = `
                <p>${message.message}</p>
                <small>${new Date(message.timestamp).toLocaleString()}</small>
            `;
            chatMessages.appendChild(messageElement);
        }
    });
};

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        fetchChatMessages();
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Session expired',
            text: 'Please log in again to continue using the application.',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = 'index.html';
        });
    }
});

// Implement role-based access control system
const checkUserRole = (requiredRole) => {
    const userId = firebase.auth().currentUser.uid;
    const userRef = database.ref(`users/${userId}`);

    userRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData.role !== requiredRole) {
            Swal.fire({
                icon: 'error',
                title: 'Access denied',
                text: 'You do not have permission to access this feature.',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = 'index.html';
            });
        }
    });
};

// Global authentication check to restrict access to other files
const globalAuthCheck = () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            Swal.fire({
                icon: 'info',
                title: 'Session expired',
                text: 'Please log in again to continue using the application.',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = 'index.html';
            });
        }
    });
};

globalAuthCheck();
