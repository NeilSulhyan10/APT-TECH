// scripts/populateFirestore.js

// --- Configuration ---
// IMPORTANT: ADJUST THIS PATH based on where you've saved your serviceAccountKey.json
// If it's at the project root (e.g., D:\Coding\APT-TECH\APT-TECH\your-key-name.json), use:
// const serviceAccount = require('../your-key-name.json');
// If it's in app/firebase/ (e.g., D:\Coding\APT-TECH\APT-TECH\app\firebase\your-key-name.json), use:
const serviceAccount = require('../apt-tech-faaa6-firebase-adminsdk-fbsvc-2a526d2abe.json'); // <<< UPDATE THIS LINE

// Initialize Firebase Admin SDK
const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // If you're also using Realtime Database or Storage, you might need:
            // databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
            // storageBucket: "YOUR_PROJECT_ID.appspot.com"
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
        console.error("ERROR: Failed to initialize Firebase Admin SDK. Check serviceAccountKey.json path and permissions.", error);
        process.exit(1); // Exit if initialization fails
    }
}

const db = admin.firestore();

// --- Data to be populated ---
// The 'id' field here is for script internal mapping, NOT for storage in Firestore documents.
const EXPERTS_DATA = [
    {
        id: "1", // This 'id' is for internal script use only.
        name: "Mr. Sanir Kittur",
        role: "Founder, APT-TECH",
        experience: "21++ Years Experience",
        description: "Specializes in Quantitative Aptitude, Vedic Maths, and TCS NQT strategies.",
        tags: ["Aptitude", "TCS NQT", "Vedic Math"],
        color: "blue",
        bio: "Lead Aptitude Trainer with expertise in Quantitative Aptitude, D.I and Reasoning. Over 6+ years experience with 8000+ training hours across 30+ Engineering and PG Colleges in western Maharashtra.",
        initials: "SK",
        rating: 4.9,
        students: 5000,
        sessions: 120,
        resources: 25,
    },
    {
        id: "2",
        name: "Mr. Akshay Khandekar",
        role: "Associate VP",
        experience: "4+ Years Experience",
        description: "Specializes in Quantitative Aptitude and Logical Reasoning.",
        tags: ["Aptitude", "Logical Reasoning", "Quantitative"],
        color: "green",
        bio: "Mr. Akshay Khandekar is an experienced Aptitude Trainer with expertise in Quantitative Aptitude and Logical Reasoning. He is known for his innovative teaching methods and ability to simplify complex concepts for students.",
        initials: "AK",
        rating: 4.8,
        students: 3000,
        sessions: 85,
        resources: 18,
    },
    {
        id: "3",
        name: "Mrs. Aishwarya Pimpalgaonkar",
        role: "Chief Operational Officer",
        experience: "4+ Years Experience",
        description: "Specializes in Aptitude & Soft Skills Training.",
        tags: ["Aptitude", "Soft Skills", "Training"],
        color: "cyan",
        bio: "B.Tech graduate in Electronics and Telecommunication (ENTC) Engineering with over 4 years of experience at APT TECH SOLUTIONS specialized in Aptitude & Soft Skills Training, with a proven track record of successfully training 2000+ students across 15+ colleges.",
        initials: "AP",
        rating: 4.7,
        students: 2000,
        sessions: 70,
        resources: 15,
    },
    {
        id: "4",
        name: "Mrs. Mokshita Badve",
        role: "Public Relations Officer",
        experience: "3+ Years Experience",
        description: "Specializes in Reasoning, Verbal, and Soft Skills Training.",
        tags: ["Reasoning", "Verbal", "Soft Skills"],
        color: "purple",
        bio: "An experienced Reasoning, Verbal, and Soft Skills Trainer, currently pursuing her MBA from Symbiosis University. With three years of expertise, she has trained students across leading universities in India, including Lovely Professional University and Parul University.",
        initials: "MB",
        rating: 4.6,
        students: 1800,
        sessions: 60,
        resources: 12,
    },
    {
        id: "5",
        name: "Mr. Shoaib Attar",
        role: "Aptitude Training Lead",
        experience: "4+ Years Experience",
        description: "Specializes in Quantitative Aptitude, Logical Reasoning, and Cognitive Assessments.",
        tags: ["Aptitude", "Reasoning", "Cognitive"],
        color: "red",
        bio: "With over 4 years of experience at APT TECH SOLUTIONS, he has developed a strong background in Aptitude and Soft Skills Training, having successfully trained 3000+ students across 20+ colleges. As the Aptitude Training Lead and Coordinator, he is responsible for overseeing and delivering top-tier training programs in Quantitative Aptitude, Logical Reasoning, and Cognitive Assessments.",
        initials: "SA",
        rating: 4.9,
        students: 3000,
        sessions: 90,
        resources: 20,
    },
    {
        id: "6",
        name: "Mr. Rushad Mistry",
        role: "Technical Expert",
        experience: "19+ Years Experience",
        description: "Specializes in Robotics, PLCs, Automotive and Mechatronics Subjects.",
        tags: ["Mechanical", "Robotics", "Technical"],
        color: "amber",
        bio: "Did his MS in Australia in Robotics in 2005. He has worked in WIT Solapur for 14 years and in BOSCH as a Mechanical Engineer for 5 years. He teaches core and technical Mechanical Subjects as well as Aptitude. His expertise includes PLCs, Robotics, Automotive and Mechatronics Subjects.",
        initials: "RM",
        rating: 4.7,
        students: 1500,
        sessions: 50,
        resources: 10,
    },
    {
        id: "7",
        name: "Mr. Navneet Dutta",
        role: "Educational Counselor",
        experience: "7+ Years Experience",
        description: "Specializes in Vedic Maths, Probability, PNC, Gaming round, visual reasoning.",
        tags: ["Vedic Math", "Probability", "Reasoning"],
        color: "indigo",
        bio: "Educational Qualification: BE Electrical Engineering. Expertise in Vedic Maths, Probability, PNC, Gaming round, visual reasoning, and counselling students for higher education in MPSC, UPSC, GRE & CAT. Teaching experience of 7 years with campus placement training in 3 top companies in Pune.",
        initials: "ND",
        rating: 4.8,
        students: 2500,
        sessions: 75,
        resources: 18,
    },
    {
        id: "8",
        name: "Dr. Satish Lakde",
        role: "Soft Skills Expert",
        experience: "19+ Years Experience",
        description: "Specializes in Resume Building, Group Discussion and Soft Skills.",
        tags: ["Resume", "GD", "Soft Skills"],
        color: "emerald",
        bio: "PhD holder in Linguistic English Language. Has worked in WIPRO for 5 years and as a TPO of WIT for 9 years. Also worked as a Head Consulting HR in a reputed firm. His core areas are Resume, Group Discussion and Soft Skills. He has taught Verbal for CAT and has experience of more than 19 years.",
        initials: "SL",
        rating: 4.9,
        students: 4000,
        sessions: 100,
        resources: 30,
    },
    {
        id: "9",
        name: "Mr. SP Patil",
        role: "Aptitude Expert",
        experience: "20+ Years Experience",
        description: "Specializes in CAT and Aptitude Training.",
        tags: ["CAT", "Aptitude", "Logical Reasoning"],
        color: "blue",
        bio: "Sunil Patil, the Owner & Founder of S.P ACADEMY, bringing over 20 years of experience in CAT and Aptitude Training. Throughout his career, he has successfully trained 10,000+ students, equipping them with the essential skills required for academic and professional success.",
        initials: "SP",
        rating: 4.9,
        students: 10000,
        sessions: 200,
        resources: 40,
    },
    {
        id: "10",
        name: "Mrs. Tehzib Hadimani",
        role: "Senior Aptitude Trainer",
        experience: "5+ Years Experience",
        description: "Specializes in Aptitude Training and Quantitative Skills.",
        tags: ["Aptitude", "Quantitative", "Training"],
        color: "pink",
        bio: "Mrs. Tehzib is a Senior Aptitude Trainer and Core Team member of Apt-tech Solutions. She has trained numerous students of various Engineering Colleges and has earned huge respect and love within students which is next to none.",
        initials: "TH",
        rating: 4.8,
        students: 3500,
        sessions: 80,
        resources: 15,
    },
    {
        id: "11",
        name: "Mr. Shrikant Sundaragiri",
        role: "Motivational Speaker",
        experience: "5+ Years Experience",
        description: "Specializes in Motivation and Life Coaching.",
        tags: ["Motivation", "Life Coach", "Soft Skills"],
        color: "orange",
        bio: "Working in this field for the last 5 years, he has trained and coached 50,000+ people across India. Has delivered training for reputed corporate bodies like NIKE, Mercedes, Barclays, Infos, Wipro, etc. Rewarded 'Best Motivational Speaker and Life Coach in Maharashtra' by Indian Leadership Award.",
        initials: "SS",
        rating: 4.9,
        students: 50000,
        sessions: 150,
        resources: 20,
    },
    {
        id: "12",
        name: "Mrs. Renu Dawda",
        role: "Soft Skills Trainer",
        experience: "6+ Years Experience",
        description: "Specializes in Soft Skills, Time Management & Confidence Building.",
        tags: ["Soft Skills", "Time Management", "Confidence"],
        color: "teal",
        bio: "Mrs. Renu is CA by profession. She completed her SSC in prestigious HOLY CROSS SCHOOL. She is an author and teaches Soft Skills, Time Management & Confidence Building.",
        initials: "RD",
        rating: 4.7,
        students: 2200,
        sessions: 65,
        resources: 10,
    },
    {
        id: "13",
        name: "Mrs. Ketaki Gurav",
        role: "Soft Skills Trainer",
        experience: "4+ Years Experience",
        description: "Specializes in Soft Skills and Problem Solving.",
        tags: ["Soft Skills", "Problem Solving", "Critical Thinking"],
        color: "violet",
        bio: "Worked as Treasurer at Saturday Club Global Trust (NGO), Gadhinglaj Chapter. Received Best Presentation Award at District Level from Saturday Club Global Trust. His transferable skills include Soft Skills, Problem Solving Skills, Critical Thinking Skills, Collaboration Skills, Goal orientation, and Creativity.",
        initials: "KG",
        rating: 4.6,
        students: 1900,
        sessions: 55,
        resources: 8,
    },
    {
        id: "14",
        name: "Mr. Salman Chougle",
        role: "Senior Aptitude Trainer",
        experience: "5+ Years Experience",
        description: "Specializes in Aptitude Training and Civil Services Preparation.",
        tags: ["Aptitude", "Civil Services", "Training"],
        color: "lime",
        bio: "Mr. Salman Chougle is a Senior Aptitude Trainer. He is one of the experienced faculty in APT-Tech. He is also preparing for Civil Services and is renowned by students for his Dynamic Personality & Friendly Behavior.",
        initials: "SC",
        rating: 4.8,
        students: 2800,
        sessions: 78,
        resources: 16,
    },
    {
        id: "15",
        name: "Mr. Mohan Shinde",
        role: "Verbal Ability Trainer",
        experience: "9+ Years Experience",
        description: "Specializes in Soft Skills and Verbal Ability.",
        tags: ["Verbal", "Soft Skills", "English"],
        color: "sky",
        bio: "Mr. Mohan Shinde is a Soft Skills and Verbal Ability trainer. He has completed M.A. in English. He had been an educational counsellor & worked for 4 years as a counsellor. Then he worked as a spoken English trainer for 5 years before starting his career as a soft skills and verbal ability trainer.",
        initials: "MS",
        rating: 4.7,
        students: 2700,
        sessions: 72,
        resources: 14,
    },
];

const EXPERT_SUBCOLLECTION_DATA = {
    "1": { // Mr. Sanir Kittur - keyed by the original 'id' for script internal use
        testimonials: [
            {
                // The 'id' field here will be removed before storing in Firestore
                id: "1",
                studentName: "Rahul Sharma",
                college: "PICT, Pune",
                text: "Mr. Kittur's Vedic Math techniques helped me solve aptitude questions in half the time. His teaching style is exceptional!",
                rating: 5,
                initials: "RS",
            },
            {
                id: "2",
                studentName: "Priya Patel",
                college: "COEP, Pune",
                text: "The shortcuts taught by Mr. Kittur were invaluable during my TCS NQT. I wouldn't have cleared it without his guidance.",
                rating: 5,
                initials: "PP",
            },
            {
                id: "3",
                studentName: "Suresh Mehta",
                college: "WIT, Solapur",
                text: "Mr. Kittur's expertise in aptitude is unmatched. His sessions are always packed with valuable insights.",
                rating: 4,
                initials: "SM",
            },
        ],
        upcomingSessions: [
            {
                id: "1",
                title: "TCS NQT Strategies & Shortcuts",
                date: "June 15, 2025",
                time: "4:00 PM - 5:30 PM",
                attendees: 125,
                status: "upcoming",
                tags: ["Aptitude", "TCS", "Vedic Math"],
                initials: "SK",
                color: "blue",
                description: "Learn advanced Vedic Math techniques specifically designed for TCS NQT quantitative section. Master shortcuts to solve complex problems in seconds.",
                registrationLink: "/register-session/tcs-nqt-strategies",
            },
            {
                id: "2",
                title: "Vedic Math Masterclass",
                date: "July 1, 2025",
                time: "5:00 PM - 6:30 PM",
                attendees: 98,
                status: "upcoming",
                tags: ["Aptitude", "Vedic Math"],
                initials: "SK",
                color: "blue",
                description: "Deep dive into Vedic Math principles for faster calculations and problem-solving.",
                registrationLink: "/register-session/vedic-math-masterclass",
            },
        ],
        pastSessions: [
            {
                id: "3",
                title: "Intro to TCS NQT 2023",
                date: "May 5, 2023",
                time: "4:00 PM - 5:30 PM",
                attendees: 125,
                status: "past",
                tags: ["Aptitude", "TCS", "Vedic Math"],
                initials: "SK",
                color: "blue",
                description: "An introductory session to TCS NQT patterns and basics for 2023.",
                recordingLink: "/recordings/tcs-nqt-2023-intro",
            },
        ],
        resources: [
            {
                id: "1",
                title: "TCS NQT Complete Guide",
                type: "PDF",
                downloads: 1250,
            },
            {
                id: "2",
                title: "Vedic Math Shortcuts",
                type: "PDF",
                downloads: 980,
            },
            {
                id: "3",
                title: "Aptitude Practice Set",
                type: "Practice Set",
                downloads: 750,
            },
        ],
    },
    "2": { // Mr. Akshay Khandekar
        testimonials: [
            {
                id: "1",
                studentName: "Smita Kulkarni",
                college: "MIT, Pune",
                text: "Mr. Khandekar's logical reasoning sessions were game-changers for my preparation. Highly recommended!",
                rating: 5,
                initials: "SK",
            },
            {
                id: "2",
                studentName: "Vivek Singh",
                college: "VIT, Pune",
                text: "Mr. Khandekar's approach to problem-solving is unique and effective. His sessions are always engaging.",
                rating: 5,
                initials: "VS",
            },
            {
                id: "3",
                studentName: "Disha Parekh",
                college: "BITS, Pilani",
                text: "The way Mr. Khandekar breaks down complex problems into simple steps is amazing. Great teacher!",
                rating: 4,
                initials: "DP",
            },
        ],
        upcomingSessions: [
            {
                id: "1",
                title: "Capgemini Game-Based Round Walkthrough",
                date: "June 20, 2025",
                time: "4:00 PM - 5:30 PM",
                attendees: 125,
                status: "upcoming",
                tags: ["Games", "Capgemini", "Puzzles"],
                initials: "AK",
                color: "green",
                description: "Get hands-on practice with Capgemini's unique game-based assessment. Learn strategies to excel in each game type and understand the scoring system.",
                registrationLink: "/register-session/capgemini-games",
            },
            {
                id: "2",
                title: "Advanced Logical Reasoning",
                date: "July 5, 2025",
                time: "5:00 PM - 6:30 PM",
                attendees: 98,
                status: "upcoming",
                tags: ["Logical Reasoning"],
                initials: "AK",
                color: "green",
                description: "Master advanced logical reasoning concepts and common interview patterns.",
                registrationLink: "/register-session/advanced-lr",
            },
        ],
        pastSessions: [
            {
                id: "3",
                title: "Basic LR Concepts",
                date: "April 28, 2023",
                time: "4:00 PM - 5:30 PM",
                attendees: 132,
                status: "past",
                tags: ["Reasoning", "Logic", "Aptitude"],
                initials: "AK",
                color: "green",
                description: "Comprehensive coverage of all logical reasoning question types with proven solving techniques.",
                recordingLink: "/recordings/basic-lr-concepts",
            },
        ],
        resources: [
            {
                id: "1",
                title: "Logical Reasoning Handbook",
                type: "PDF",
                downloads: 1250,
            },
            {
                id: "2",
                title: "Quantitative Aptitude Formulas",
                type: "PDF",
                downloads: 980,
            },
            {
                id: "3",
                title: "Problem Solving Techniques",
                type: "Practice Set",
                downloads: 750,
            },
        ],
    },
    "3": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "4": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "5": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "6": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "7": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "8": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "9": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "10": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "11": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "12": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "13": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "14": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
    "15": { testimonials: [], upcomingSessions: [], pastSessions: [], resources: [] },
};


// --- Firestore Population Logic ---
async function populateFirestore() {
    console.log("Starting Firestore population script...");
    console.log(`Targeting Firebase Project ID: ${admin.app().options.projectId}`);

    // Map to store original expert ID to new Firestore auto-generated ID
    const expertIdMap = {};

    try {
        const expertsCollectionRef = db.collection('experts');
        const qaSessionsCollectionRef = db.collection('qASessions'); // For top-level QA Sessions
        const testimonialsCollectionRef = db.collection('testimonials'); // For top-level Testimonials

        console.log(`\n--- Populating 'experts' collection with auto-generated IDs ---`);
        for (const expert of EXPERTS_DATA) {
            // Destructure 'id' out of the expert object, so it's not stored in Firestore
            const { id: originalExpertId, ...expertDataWithoutId } = expert;

            const newExpertRef = await expertsCollectionRef.add(expertDataWithoutId);
            expertIdMap[originalExpertId] = newExpertRef.id; // Store the mapping for subcollections
            console.log(`  SUCCESS: Expert '${expert.name}' added with new ID: ${newExpertRef.id}`);
        }

        console.log(`\n--- Populating subcollections and top-level 'qASessions' and 'testimonials' ---`);
        for (const originalExpertId in EXPERT_SUBCOLLECTION_DATA) {
            const newExpertDocId = expertIdMap[originalExpertId];
            const expertSubData = EXPERT_SUBCOLLECTION_DATA[originalExpertId];

            if (!newExpertDocId) {
                console.warn(`Skipping subcollection data for original expert ID '${originalExpertId}': New expert document ID not found.`);
                continue;
            }

            // Populate Testimonials
            if (expertSubData.testimonials && expertSubData.testimonials.length > 0) {
                console.log(`  Processing ${expertSubData.testimonials.length} testimonials for expert ${newExpertDocId}...`);
                for (const testimonial of expertSubData.testimonials) {
                    // Destructure 'id' out of the testimonial object
                    const { id: originalTestimonialId, ...testDataWithoutId } = testimonial;

                    // Add to expert's subcollection
                    await expertsCollectionRef.doc(newExpertDocId).collection('testimonials').add(testDataWithoutId);

                    // Add to top-level 'testimonials' collection (linking via expertId)
                    await testimonialsCollectionRef.add({
                        ...testDataWithoutId,
                        expertId: newExpertDocId, // Link to the new expert document ID
                        date: admin.firestore.Timestamp.fromDate(new Date("June 11, 2025")), // Default or parse from data if available
                    });
                }
                console.log(`  SUCCESS: Added testimonials for expert ${newExpertDocId}.`);
            } else {
                console.log(`  No testimonials data for expert ${originalExpertId}.`);
            }

            // Populate Q&A Sessions (both upcoming and past)
            const allSessionsForExpert = [...expertSubData.upcomingSessions, ...expertSubData.pastSessions];
            if (allSessionsForExpert.length > 0) {
                console.log(`  Processing ${allSessionsForExpert.length} Q&A sessions for expert ${newExpertDocId}...`);
                for (const session of allSessionsForExpert) {
                    // Destructure 'id' out of the session object
                    const { id: originalSessionId, ...sessionDataWithoutId } = session;

                    // Add to expert's subcollection
                    await expertsCollectionRef.doc(newExpertDocId).collection('qASessions').add(sessionDataWithoutId);

                    // Add to top-level 'qASessions' collection
                    const sessionDate = new Date(`${session.date} ${session.time.split(" - ")[0]}`);
                    await qaSessionsCollectionRef.add({
                        ...sessionDataWithoutId,
                        expertId: newExpertDocId, // Link to the new expert document ID
                        date: admin.firestore.Timestamp.fromDate(sessionDate), // Convert to Firestore Timestamp
                    });
                }
                console.log(`  SUCCESS: Added Q&A sessions for expert ${newExpertDocId}.`);
            } else {
                console.log(`  No Q&A sessions data for expert ${originalExpertId}.`);
            }

            // Populate Resources
            if (expertSubData.resources && expertSubData.resources.length > 0) {
                console.log(`  Processing ${expertSubData.resources.length} resources for expert ${newExpertDocId}...`);
                for (const resource of expertSubData.resources) {
                    // Destructure 'id' out of the resource object
                    const { id: originalResourceId, ...resourceDataWithoutId } = resource;
                    await expertsCollectionRef.doc(newExpertDocId).collection('resources').add(resourceDataWithoutId);
                }
                console.log(`  SUCCESS: Added resources for expert ${newExpertDocId}.`);
            } else {
                console.log(`  No resources data for expert ${originalExpertId}.`);
            }
        }

        console.log("\n--- Firestore population complete! ---");
    } catch (error) {
        console.error("\n!!! CRITICAL ERROR populating Firestore:", error);
    } finally {
        process.exit(0); // Exit the script gracefully
    }
}

// Execute the function
populateFirestore();