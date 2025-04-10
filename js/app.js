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
            alert('Registration successful! Please verify your email before logging in.');
        })
        .catch((error) => {
            console.error('Error during registration:', error);
            alert('Registration failed. Please try again.');
        });
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user.emailVerified) {
                alert('Login successful!');
                // Redirect to the appropriate dashboard or homepage
            } else {
                alert('Please verify your email before logging in.');
            }
        })
        .catch((error) => {
            console.error('Error during login:', error);
            alert('Login failed. Please try again.');
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
            alert('Registration successful! Please verify your email before logging in.');
        })
        .catch((error) => {
            console.error('Error during registration:', error);
            alert('Registration failed. Please try again.');
        });
});

// Add functionality for "Forgot Password" feature
document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt('Please enter your email address:');
    if (email) {
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent! Please check your inbox.');
            })
            .catch((error) => {
                console.error('Error sending password reset email:', error);
                alert('Failed to send password reset email. Please try again.');
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
        alert('Please log in to use the chat feature.');
        window.location.href = 'index.html';
    }
});

// Implement role-based access control system
const checkUserRole = (requiredRole) => {
    const userId = firebase.auth().currentUser.uid;
    const userRef = database.ref(`users/${userId}`);

    userRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData.role !== requiredRole) {
            alert('You do not have permission to access this feature.');
            window.location.href = 'index.html';
        }
    });
};
