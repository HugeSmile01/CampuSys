import { app, analytics } from './firebaseConfig';
import 'firebase/database';
import 'firebase/auth';

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
            <button class="like-button" data-post-id="${postId}">Like</button>
            <div class="comments-section" data-post-id="${postId}">
                <input type="text" class="comment-input" placeholder="Add a comment...">
                <button class="comment-button" data-post-id="${postId}">Comment</button>
                <div class="comments-list"></div>
            </div>
            <button class="share-button" data-post-id="${postId}">Share</button>
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
        Swal.fire({
            icon: 'info',
            title: 'Session expired',
            text: 'Please log in again to continue using the application.',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = 'index.html';
        });
    }
});

// Event listener for like button
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('like-button')) {
        const postId = e.target.getAttribute('data-post-id');
        const userId = firebase.auth().currentUser.uid;
        const likesRef = database.ref(`newsfeed/${postId}/likes/${userId}`);

        likesRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                likesRef.remove();
            } else {
                likesRef.set(true);
            }
        });
    }
});

// Event listener for comment button
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('comment-button')) {
        const postId = e.target.getAttribute('data-post-id');
        const commentInput = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        const commentText = commentInput.value;
        const userId = firebase.auth().currentUser.uid;
        const commentsRef = database.ref(`newsfeed/${postId}/comments`);

        commentsRef.push({
            userId,
            commentText,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        commentInput.value = '';
    }
});

// Event listener for share button
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('share-button')) {
        const postId = e.target.getAttribute('data-post-id');
        const postRef = database.ref(`newsfeed/${postId}`);

        postRef.once('value', (snapshot) => {
            const post = snapshot.val();
            const shareText = `${post.title}\n\n${post.content}\n\nPosted by ${post.author}`;
            navigator.share({
                title: post.title,
                text: shareText,
                url: window.location.href
            });
        });
    }
});

// Real-time updates for new posts, likes, and comments
const newsfeedRef = database.ref('newsfeed');
newsfeedRef.on('child_added', (snapshot) => {
    const post = snapshot.val();
    displayNewsfeedPosts({ [snapshot.key]: post });
});

newsfeedRef.on('child_changed', (snapshot) => {
    const post = snapshot.val();
    displayNewsfeedPosts({ [snapshot.key]: post });
});

newsfeedRef.on('child_removed', (snapshot) => {
    const postId = snapshot.key;
    const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
    if (postElement) {
        postElement.remove();
    }
});

// Infinite scrolling for newsfeed
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        fetchNewsfeedPosts();
    }
});

// Loading spinner for new content
const loadingSpinner = document.createElement('div');
loadingSpinner.classList.add('loading-spinner');
document.body.appendChild(loadingSpinner);

const showLoadingSpinner = () => {
    loadingSpinner.style.display = 'block';
};

const hideLoadingSpinner = () => {
    loadingSpinner.style.display = 'none';
};

newsfeedRef.on('value', (snapshot) => {
    hideLoadingSpinner();
});

// Animations and transitions for user experience
document.addEventListener('DOMContentLoaded', () => {
    const posts = document.querySelectorAll('.post');
    posts.forEach((post, index) => {
        setTimeout(() => {
            post.classList.add('visible');
        }, index * 200);
    });
});
