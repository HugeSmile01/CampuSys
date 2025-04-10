import { app, analytics } from './firebaseConfig';
import 'firebase/database';

// Firebase Realtime Database reference
const database = firebase.database();

// Fetch notifications from Firebase Realtime Database
const fetchNotifications = () => {
    const notificationsRef = database.ref('notifications');
    notificationsRef.on('value', (snapshot) => {
        const notifications = snapshot.val();
        displayNotifications(notifications);
    });
};

// Display notifications on the notifications page
const displayNotifications = (notifications) => {
    const notificationsSection = document.getElementById('notifications');
    notificationsSection.innerHTML = '';

    for (const key in notifications) {
        if (notifications.hasOwnProperty(key)) {
            const notification = notifications[key];
            const notificationElement = document.createElement('div');
            notificationElement.classList.add('notification');
            notificationElement.innerHTML = `
                <h3>${notification.title}</h3>
                <p>${notification.message}</p>
                <p><small>${new Date(notification.timestamp).toLocaleString()}</small></p>
            `;
            notificationsSection.appendChild(notificationElement);
        }
    }
};

// Initialize notifications fetching
fetchNotifications();
