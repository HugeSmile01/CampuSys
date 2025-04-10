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

// Fetch newsfeed posts from Firebase Realtime Database
const fetchNewsfeedPosts = () => {
    const newsfeedRef = database.ref('newsfeed');
    newsfeedRef.on('value', (snapshot) => {
        const posts = snapshot.val();
        displayNewsfeedPosts(posts);
    });
};

// Display newsfeed posts on the newsfeed page
const displayNewsfeedPosts = (posts) => {
    const newsfeedPostsSection = document.getElementById('newsfeedPosts');
    newsfeedPostsSection.innerHTML = '';

    for (const postId in posts) {
        const post = posts[postId];
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <p><small>Posted by ${post.author}</small></p>
        `;
        newsfeedPostsSection.appendChild(postElement);
    }
};

// Add search functionality for filtering posts
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const newsfeedRef = database.ref('newsfeed');
    newsfeedRef.once('value', (snapshot) => {
        const posts = snapshot.val();
        const filteredPosts = {};

        for (const postId in posts) {
            const post = posts[postId];
            if (post.title.toLowerCase().includes(searchQuery) || post.content.toLowerCase().includes(searchQuery)) {
                filteredPosts[postId] = post;
            }
        }

        displayNewsfeedPosts(filteredPosts);
    });
});

// Ensure only authenticated users can view the newsfeed
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        fetchNewsfeedPosts();
    } else {
        alert('Please log in to view the newsfeed.');
        window.location.href = 'index.html';
    }
});
