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
