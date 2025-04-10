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

// Add calendar synchronization feature with popular calendar apps
const syncCalendar = () => {
    const user = firebase.auth().currentUser;
    if (user) {
        const eventsRef = database.ref('events');
        eventsRef.once('value', (snapshot) => {
            const events = snapshot.val();
            const googleCalendarUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
            const outlookCalendarUrl = 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent';

            for (const eventId in events) {
                const event = events[eventId];
                const eventTitle = encodeURIComponent(event.title);
                const eventStart = encodeURIComponent(event.start);
                const eventEnd = encodeURIComponent(event.end);

                const googleEventUrl = `${googleCalendarUrl}&text=${eventTitle}&dates=${eventStart}/${eventEnd}`;
                const outlookEventUrl = `${outlookCalendarUrl}&subject=${eventTitle}&startdt=${eventStart}&enddt=${eventEnd}`;

                // Add buttons or links to sync events with Google Calendar and Outlook
                const googleButton = document.createElement('a');
                googleButton.href = googleEventUrl;
                googleButton.textContent = 'Sync with Google Calendar';
                googleButton.target = '_blank';

                const outlookButton = document.createElement('a');
                outlookButton.href = outlookEventUrl;
                outlookButton.textContent = 'Sync with Outlook Calendar';
                outlookButton.target = '_blank';

                document.body.appendChild(googleButton);
                document.body.appendChild(outlookButton);
            }
        });
    } else {
        alert('Please log in to sync your calendar.');
    }
};

document.addEventListener('DOMContentLoaded', syncCalendar);
