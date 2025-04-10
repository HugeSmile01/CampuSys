import { app, analytics } from './firebaseConfig';
import 'firebase/database';
import 'firebase/auth';

// Firebase Realtime Database reference
const database = firebase.database();

// Fetch posts from Firebase Realtime Database
const fetchPosts = () => {
    const postsRef = database.ref('posts');
    postsRef.on('value', (snapshot) => {
        const posts = snapshot.val();
        displayPosts(posts);
    });
};

// Display posts on the post page
const displayPosts = (posts) => {
    const postListSection = document.getElementById('postList');
    postListSection.innerHTML = '';

    for (const postId in posts) {
        const post = posts[postId];
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <p><small>Posted by ${post.author}</small></p>
        `;
        postListSection.appendChild(postElement);
    }
};

// Add real-time updates for the post page
const postForm = document.getElementById('postForm');
postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const postTitle = document.getElementById('postTitle').value;
    const postContent = document.getElementById('postContent').value;
    const user = firebase.auth().currentUser;

    if (user) {
        const postRef = database.ref('posts').push();
        postRef.set({
            title: postTitle,
            content: postContent,
            author: user.email
        });
        postForm.reset();
    } else {
        alert('Please log in to create a post.');
    }
});

// Add search functionality for filtering posts
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const postsRef = database.ref('posts');
    postsRef.once('value', (snapshot) => {
        const posts = snapshot.val();
        const filteredPosts = {};

        for (const postId in posts) {
            const post = posts[postId];
            if (post.title.toLowerCase().includes(searchQuery) || post.content.toLowerCase().includes(searchQuery)) {
                filteredPosts[postId] = post;
            }
        }

        displayPosts(filteredPosts);
    });
});

// Ensure only authenticated users can view the post page
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        fetchPosts();
    } else {
        alert('Please log in to view the posts.');
        window.location.href = 'index.html';
    }
});
