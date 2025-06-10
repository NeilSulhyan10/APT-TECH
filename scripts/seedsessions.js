// seedSessions.js
const admin = require('firebase-admin');

// IMPORTANT: Replace with the path to your downloaded service account key JSON file
// For example: const serviceAccount = require('./path/to/your-service-account-key.json');
const serviceAccount = require('../apt-tech-faaa6-firebase-adminsdk-fbsvc-2a526d2abe.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Optionally, if you have a databaseURL for Realtime Database:
  // databaseURL: "https://your-project-id.firebaseio.com"
});

const db = admin.firestore();

// Your session data (expertId updated to match the numerical IDs from EXPERTS_DATA)
const sessionsData = [
  {
    id: "session-1", // You can remove this 'id' if Firestore auto-generates document IDs
    title: "TCS NQT Strategies & Shortcuts",
    trainer: "Mr. Sanir Kittur",
    expertId: "1", // <-- UPDATED: Matches Sanir Kittur's ID in EXPERTS_DATA
    date: "May 5, 2023",
    time: "4:00 PM - 5:30 PM",
    attendees: 125,
    status: "past", // Changed to past for example, adjust as needed
    tags: ["Aptitude", "TCS", "Vedic Math"],
    initials: "SK",
    color: "blue",
    description: "Learn advanced Vedic Math techniques specifically designed for TCS NQT quantitative section. Master shortcuts to solve complex problems in seconds.",
    registrationLink: "https://example.com/register/tcs-nqt-strategies", // Example link
    recordingLink: "https://example.com/recording/tcs-nqt-strategies", // Example link
  },
  {
    id: "session-2",
    title: "Capgemini Game-Based Round Walkthrough",
    trainer: "Mr. Akshay Khandekar",
    expertId: "2", // <-- UPDATED: Matches Akshay Khandekar's ID
    date: "May 7, 2023",
    time: "5:00 PM - 6:30 PM",
    attendees: 98,
    status: "past", // Changed to past
    tags: ["Games", "Capgemini", "Puzzles"],
    initials: "AK",
    color: "green",
    description: "Get hands-on practice with Capgemini's unique game-based assessment. Learn strategies to excel in each game type and understand the scoring system.",
    registrationLink: "https://example.com/register/capgemini-game-based",
    recordingLink: "https://example.com/recording/capgemini-game-based",
  },
  {
    id: "session-3",
    title: "Group Discussion Techniques for Wipro",
    trainer: "Mrs. Mokshita Badve",
    expertId: "4", // <-- UPDATED: Matches Mokshita Badve's ID
    date: "July 10, 2025", // Changed to upcoming
    time: "3:00 PM - 4:30 PM",
    attendees: 112,
    status: "upcoming",
    tags: ["GD", "Wipro", "Soft Skills"],
    initials: "MB",
    color: "purple",
    description: "Master the art of group discussions with practical tips and real Wipro GD topics. Learn how to make impactful contributions and stand out from the crowd.",
    registrationLink: "https://example.com/register/wipro-gd",
  },
  {
    id: "session-4",
    title: "Infosys InfyTQ Platform Deep Dive",
    trainer: "Mr. Navneet Dutta",
    expertId: "7", // <-- UPDATED: Matches Navneet Dutta's ID
    date: "July 15, 2025", // Changed to upcoming
    time: "6:00 PM - 7:30 PM",
    attendees: 87,
    status: "upcoming",
    tags: ["Infosys", "InfyTQ", "Technical"],
    initials: "ND",
    color: "indigo",
    description: "Comprehensive walkthrough of the InfyTQ platform with focus on Python programming, DBMS, and OOP concepts. Includes practice with previous questions.",
    registrationLink: "https://example.com/register/infosys-infytq",
  },
  {
    id: "session-5",
    title: "Resume Building Workshop",
    trainer: "Dr. Satish Lakde",
    expertId: "8", // <-- UPDATED: Matches Satish Lakde's ID
    date: "July 20, 2025", // Changed to upcoming
    time: "4:30 PM - 6:00 PM",
    attendees: 145,
    status: "upcoming",
    tags: ["Resume", "HR", "Soft Skills"],
    initials: "SL",
    color: "emerald",
    description: "Learn how to craft an ATS-friendly resume that highlights your strengths. Get personalized feedback on your resume structure and content.",
    registrationLink: "https://example.com/register/resume-workshop",
  },
  {
    id: "session-6",
    title: "Mock Interview Session: TCS",
    trainer: "Mr. SP Patil",
    expertId: "9", // <-- UPDATED: Matches SP Patil's ID
    date: "July 25, 2025", // Changed to upcoming
    time: "5:00 PM - 7:00 PM",
    attendees: 76,
    status: "upcoming",
    tags: ["Interview", "TCS", "HR"],
    initials: "SP",
    color: "blue",
    description: "Live mock interviews with real-time feedback. Covers both technical and HR rounds with focus on commonly asked TCS interview questions.",
    registrationLink: "https://example.com/register/tcs-mock-interview",
  },
  {
    id: "session-7",
    title: "Logical Reasoning Masterclass",
    trainer: "Mrs. Aishwarya Pimpalgaonkar",
    expertId: "3", // <-- UPDATED: Matches Aishwarya Pimpalgaonkar's ID
    date: "April 28, 2023",
    time: "4:00 PM - 5:30 PM",
    attendees: 132,
    status: "past",
    tags: ["Reasoning", "Logic", "Aptitude"],
    initials: "AP",
    color: "cyan",
    description: "Comprehensive coverage of all logical reasoning question types with proven solving techniques. Includes practice with company-specific patterns.",
    recordingLink: "https://example.com/recording/logical-reasoning",
  },
  {
    id: "session-8",
    title: "Coding Interview Preparation",
    trainer: "Mr. Rushad Mistry",
    expertId: "6", // <-- UPDATED: Matches Rushad Mistry's ID
    date: "April 25, 2023",
    time: "6:00 PM - 7:30 PM",
    attendees: 108,
    status: "past",
    tags: ["Coding", "DSA", "Technical"],
    initials: "RM",
    color: "amber",
    description: "Master data structures and algorithms commonly asked in coding interviews. Learn problem-solving approaches with live coding demonstrations.",
    recordingLink: "https://example.com/recording/coding-interview",
  },
];


async function seedSessions() {
  console.log("Starting to seed session data...");
  const collectionRef = db.collection('qASessions'); // Using 'qASessions' as per previous code

  for (const session of sessionsData) {
    try {
      // Use .doc().set() to specify the document ID (session.id)
      await collectionRef.doc(session.id).set(session);
      console.log(`Added session: ${session.title} with ID: ${session.id}`);
    } catch (error) {
      console.error(`Error adding session ${session.title}:`, error);
    }
  }
  console.log("Session seeding complete.");
}

seedSessions().catch(console.error);