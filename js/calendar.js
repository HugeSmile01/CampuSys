import { app, analytics } from './firebaseConfig';
import 'firebase/database';
import 'firebase/auth';
import 'fullcalendar';

// Firebase Realtime Database reference
const database = firebase.database();

// Fetch events from Firebase Realtime Database
const fetchEvents = () => {
    const eventsRef = database.ref('events');
    eventsRef.on('value', (snapshot) => {
        const events = snapshot.val();
        displayEvents(events);
    });
};

// Display events on the calendar planner page
const displayEvents = (events) => {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: []
    });

    for (const eventId in events) {
        const event = events[eventId];
        calendar.addEvent({
            title: event.title,
            start: event.start,
            end: event.end
        });
    }

    calendar.render();
};

// Ensure only authenticated users can access the calendar planner
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        fetchEvents();
    } else {
        alert('Please log in to view the calendar planner.');
        window.location.href = 'index.html';
    }
});
