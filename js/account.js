import { app, analytics } from './firebaseConfig';
import 'firebase/auth';
import 'firebase/database';

// Firebase Authentication and Realtime Database references
const auth = firebase.auth();
const database = firebase.database();

// Fetch user profile information from Firebase Realtime Database
const fetchUserProfile = (userId) => {
    const userRef = database.ref(`users/${userId}`);
    userRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        document.getElementById('profile-name').textContent = userData.name;
        document.getElementById('profile-email').textContent = userData.email;
        document.getElementById('profile-role').textContent = userData.role;
    });
};

// Display user profile information on the account page
auth.onAuthStateChanged((user) => {
    if (user) {
        fetchUserProfile(user.uid);
    } else {
        // Redirect to login page if user is not authenticated
        window.location.href = 'login.html';
    }
});

// Implement functionality for updating user profile information
document.getElementById('updateProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = auth.currentUser.uid;
    const updatedName = document.getElementById('updateName').value;
    const updatedEmail = document.getElementById('updateEmail').value;
    const updatedRole = document.getElementById('updateRole').value;

    const userRef = database.ref(`users/${userId}`);
    userRef.update({
        name: updatedName,
        email: updatedEmail,
        role: updatedRole
    }).then(() => {
        alert('Profile updated successfully!');
        fetchUserProfile(userId);
    }).catch((error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    });
});
