// This script is intended to be run in a Node.js environment
// to securely interact with your Firebase project.

// --- Configuration & Firebase Admin SDK Initialization ---
const admin = require('firebase-admin');

// IMPORTANT: ADJUST THIS PATH based on where you've saved your serviceAccountKey.json
// Example: If it's at the project root (e.g., D:\Coding\APT-TECH\APT-TECH\your-key-name.json), use:
// const serviceAccount = require('../your-key-name.json');
// If it's in app/firebase/ (e.g., D:\Coding\APT-TECH\APT-TECH\app\firebase\your-key-name.json), use:
const serviceAccount = require('../apt-tech-faaa6-firebase-adminsdk-fbsvc-2a526d2abe.json'); // <<< VERIFY/UPDATE THIS PATH

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // If you're also using Realtime Database or Storage, you might need these:
            // databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
            // storageBucket: "https://YOUR_PROJECT_ID.appspot.com"
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
        console.error("ERROR: Failed to initialize Firebase Admin SDK. Check serviceAccountKey.json path and permissions.", error);
        process.exit(1); // Exit if initialization fails
    }
}

// Get a Firestore instance
const db = admin.firestore();

// --- Data to be populated into the 'forums' collection ---
const forumsData = [
  {
    title: "How to approach TCS NQT Verbal Ability section?",
    author: "Rahul Sharma",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "June 10, 2025 10:00:00 GMT+0530", // Original post date
    category: "TCS",
    tags: ["Verbal", "TCS NQT", "Preparation"],
    replies: 12,
    views: 156,
    likes: 24,
    solved: true,
    lastReplyText: "Focus on idioms and sentence correction. Practice daily!", // Mock latest reply
    lastReplyAuthor: "Anjali Singh", // Mock latest reply author
  },
  {
    title: "Struggling with Capgemini's Pseudo Code questions",
    author: "Priya Patel",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "June 11, 2025 09:30:00 GMT+0530", // Original post date
    category: "Capgemini",
    tags: ["Coding", "Pseudo Code", "Logic"],
    replies: 8,
    views: 98,
    likes: 15,
    solved: false,
    lastReplyText: "Try to understand the logic flow, not just syntax. Dry run with small examples.", // Mock latest reply
    lastReplyAuthor: "Rohan Varma", // Mock latest reply author
  },
  {
    title: "Tips for Infosys InfyTQ platform preparation?",
    author: "Suresh Mehta",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "June 09, 2025 14:15:00 GMT+0530", // Original post date
    category: "Infosys",
    tags: ["InfyTQ", "Python", "DBMS"],
    replies: 15,
    views: 210,
    likes: 32,
    solved: true,
    lastReplyText: "Their SQL queries are tricky. Make sure to cover advanced joins.", // Mock latest reply
    lastReplyAuthor: "Kiran Rao", // Mock latest reply author
  },
  {
    title: "How to solve Vedic Math problems quickly?",
    author: "Anjali Deshpande",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "June 12, 2025 13:00:00 GMT+0530", // Original post date (earlier today)
    category: "Aptitude",
    tags: ["Vedic Math", "Quantitative", "Speed"],
    // replies, views, likes will default to 0 if not present
    // You can also add them explicitly like: replies: 0, views: 0, likes: 0,
    solved: false,
  },
  {
    title: "Group Discussion topics for Wipro Elite NLTH",
    author: "Nikhil Kulkarni",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "June 05, 2025 16:45:00 GMT+0530", // Original post date (1 week ago)
    category: "Wipro",
    tags: ["GD", "Soft Skills", "Elite NLTH"],
    replies: 20,
    views: 245,
    likes: 42,
    solved: true,
  },
  {
    title: "Accenture Coding Assessment patterns for 2023",
    author: "Sneha Gupta",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "June 09, 2025 11:00:00 GMT+0530", // Original post date
    category: "Accenture",
    tags: ["Coding", "Assessment", "Patterns"],
    // replies, views, likes will default to 0 if not present
    solved: false,
  },
];

// Function to add forums data to Firestore
async function addForumsToFirestore() {
  console.log("Starting to add forums data to Firestore...");
  for (const forum of forumsData) {
    try {
      // Create a copy to modify and ensure defaults
      const forumDataToSave = { ...forum };

      // Ensure 'replies', 'views', and 'likes' are initialized to 0 if not explicitly provided
      forumDataToSave.replies = forum.replies ?? 0;
      forumDataToSave.views = forum.views ?? 0;
      forumDataToSave.likes = forum.likes ?? 0;
      forumDataToSave.solved = forum.solved ?? false; // Also ensure solved is boolean

      // Remove the local 'id' property if it exists, as Firestore will auto-generate
      delete forumDataToSave.id;

      // Convert the 'date' string (original post date) to a Firestore Timestamp
      const originalPostDate = new Date(forum.date);
      if (isNaN(originalPostDate.getTime())) {
          console.warn(`Invalid date string for forum "${forum.title}": "${forum.date}". Storing as string.`);
          // If date parsing fails, keep it as string from original data
      } else {
          forumDataToSave.date = admin.firestore.Timestamp.fromDate(originalPostDate);
      }

      // Add a 'createdAt' timestamp (original creation time)
      // and 'lastActivityAt' (initial activity time).
      // Use the current time for both for initial population consistency.
      const now = admin.firestore.Timestamp.now();
      forumDataToSave.createdAt = now;
      // If there's a lastReplyText, assume recent activity for lastActivityAt, otherwise use createdAt
      forumDataToSave.lastActivityAt = forumDataToSave.lastReplyText ? now : forumDataToSave.createdAt;


      const docRef = await db.collection("forums").add(forumDataToSave);
      console.log(`Document written with ID: ${docRef.id} for forum: "${forum.title}"`);
    } catch (e) {
      console.error(`Error adding document for forum "${forum.title}":`, e);
    }
  }
  console.log("Finished adding forums data to Firestore.");
}

// Execute the function
addForumsToFirestore();
