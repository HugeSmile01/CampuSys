import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Realtime Database reference
const database = firebase.database();

// Fetch resources from Firebase Realtime Database
const fetchResources = () => {
    const resourcesRef = database.ref('resources');
    resourcesRef.on('value', (snapshot) => {
        const resources = snapshot.val();
        displayResources(resources);
    });
};

// Display resources on the resources page
const displayResources = (resources) => {
    const toolsAppsSection = document.getElementById('toolsApps');
    const moduleListSection = document.getElementById('moduleList');
    toolsAppsSection.innerHTML = '';
    moduleListSection.innerHTML = '';

    for (const resourceId in resources) {
        const resource = resources[resourceId];
        const resourceElement = document.createElement('li');
        resourceElement.innerHTML = `<a href="${resource.link}">${resource.name}</a>`;

        if (resource.type === 'tool') {
            toolsAppsSection.appendChild(resourceElement);
        } else if (resource.type === 'module') {
            const moduleElement = document.createElement('ul');
            moduleElement.innerHTML = `<h3>${resource.subject}</h3>`;
            moduleElement.appendChild(resourceElement);
            moduleListSection.appendChild(moduleElement);
        }
    }
};

// Add search functionality for filtering resources
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const resourcesRef = database.ref('resources');
    resourcesRef.once('value', (snapshot) => {
        const resources = snapshot.val();
        const filteredResources = {};

        for (const resourceId in resources) {
            const resource = resources[resourceId];
            if (resource.name.toLowerCase().includes(searchQuery)) {
                filteredResources[resourceId] = resource;
            }
        }

        displayResources(filteredResources);
    });
});

// Ensure only authenticated users can view the resources
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        fetchResources();
    } else {
        alert('Please log in to view the resources.');
        window.location.href = 'index.html';
    }
});
