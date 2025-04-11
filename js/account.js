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
        document.getElementById('profile-contact').textContent = userData.contact;
        document.getElementById('profile-lrn').textContent = userData.lrn;
        document.getElementById('profile-sex').textContent = userData.sex;
        document.getElementById('profile-birthday').textContent = userData.birthday;
        document.getElementById('profile-picture').src = userData.profilePicture || 'default-profile-picture.png';
    });
};

// Display user profile information on the account page
auth.onAuthStateChanged((user) => {
    if (user) {
        fetchUserProfile(user.uid);
    } else {
        // Redirect to login page if user is not authenticated
        window.location.href = 'index.html';
    }
});

// Implement functionality for updating user profile information
document.getElementById('updateProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = auth.currentUser.uid;
    const updatedName = document.getElementById('updateName').value;
    const updatedEmail = document.getElementById('updateEmail').value;
    const updatedRole = document.getElementById('updateRole').value;
    const updatedContact = document.getElementById('updateContact').value;
    const updatedLRN = document.getElementById('updateLRN').value;
    const updatedSex = document.getElementById('updateSex').value;
    const updatedBirthday = document.getElementById('updateBirthday').value;
    const updatedProfilePicture = document.getElementById('updateProfilePicture').files[0];

    const userRef = database.ref(`users/${userId}`);
    const updates = {
        name: updatedName,
        email: updatedEmail,
        role: updatedRole,
        contact: updatedContact,
        lrn: updatedLRN,
        sex: updatedSex,
        birthday: updatedBirthday
    };

    if (updatedProfilePicture) {
        const storageRef = firebase.storage().ref();
        const profilePictureRef = storageRef.child(`profilePictures/${userId}`);
        profilePictureRef.put(updatedProfilePicture).then(() => {
            profilePictureRef.getDownloadURL().then((url) => {
                updates.profilePicture = url;
                userRef.update(updates).then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Profile updated successfully!',
                        confirmButtonText: 'OK'
                    });
                    fetchUserProfile(userId);
                }).catch((error) => {
                    console.error('Error updating profile:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed to update profile',
                        text: 'Please try again.',
                        confirmButtonText: 'OK'
                    });
                });
            });
        }).catch((error) => {
            console.error('Error uploading profile picture:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to upload profile picture',
                text: 'Please try again.',
                confirmButtonText: 'OK'
            });
        });
    } else {
        userRef.update(updates).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Profile updated successfully!',
                confirmButtonText: 'OK'
            });
            fetchUserProfile(userId);
        }).catch((error) => {
            console.error('Error updating profile:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to update profile',
                text: 'Please try again.',
                confirmButtonText: 'OK'
            });
        });
    }
});
