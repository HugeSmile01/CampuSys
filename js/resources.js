import { app, analytics } from './firebaseConfig';
import 'firebase/database';
import 'firebase/auth';

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

// Add file upload and sharing feature
document.getElementById('fileUploadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fileName = document.getElementById('fileName').value;
    const fileDescription = document.getElementById('fileDescription').value;
    const fileUpload = document.getElementById('fileUpload').files[0];
    const userId = firebase.auth().currentUser.uid;

    if (fileUpload) {
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`resources/${userId}/${fileUpload.name}`);
        fileRef.put(fileUpload).then(() => {
            fileRef.getDownloadURL().then((url) => {
                const resourceRef = database.ref('resources').push();
                resourceRef.set({
                    name: fileName,
                    description: fileDescription,
                    link: url,
                    type: 'shared',
                    userId: userId
                });
                alert('File uploaded and shared successfully!');
                document.getElementById('fileUploadForm').reset();
            });
        }).catch((error) => {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please try again.');
        });
    } else {
        alert('Please select a file to upload.');
    }
});
