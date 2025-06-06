// setAdminRole.js
// This script is used to manually assign the 'admin' custom claim to a Firebase user.
// It uses environment variables for Firebase Admin SDK credentials.

// Load environment variables from .env.local file.
// This is important because Next.js typically uses .env.local, and this script
// needs to explicitly load from it as a standalone Node.js process.
require('dotenv').config({ path: './.env.local' }); // <--- EDITED LINE

const admin = require('firebase-admin');

// Ensure all required environment variables are set
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Replace escaped newlines

if (!projectId || !clientEmail || !privateKey) {
  console.error("Error: Missing one or more Firebase environment variables.");
  console.error("Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in your .env.local file.");
  process.exit(1); // Exit if critical variables are missing
}

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });
}

// --- IMPORTANT: REPLACE THIS WITH YOUR ADMIN USER'S ACTUAL UID ---
const adminUid = 'f0hBsy78SRYUyFp37kMRL7W4pnk2'; 
// Example: const adminUid = 'pYx9Z0aBcDeF1gH2iJ3kL4mN5oP6qR7s'; 
// Get this from your Firebase Console -> Authentication -> Users.
// --- END IMPORTANT ---


async function setAdminClaim() {
  if (adminUid === 'YOUR_ADMIN_UID_HERE') {
    console.error("Error: Please replace 'YOUR_ADMIN_UID_HERE' with the actual UID of your admin user.");
    process.exit(1);
  }

  try {
    // Set the custom claim for the admin user
    await admin.auth().setCustomUserClaims(adminUid, { role: 'admin' });
    console.log(`Successfully set custom claim 'role: admin' for user ${adminUid}`);

    // Revoke all refresh tokens for this user.
    // This forces the user to re-authenticate or refresh their token
    // to get a new ID token that contains the updated custom claim.
    await admin.auth().revokeRefreshTokens(adminUid);
    console.log(`Revoked refresh tokens for user ${adminUid}.`);
    console.log("\nACTION REQUIRED: Please log out and log back in to your application as this admin user.");
    console.log("This will ensure your new Firebase ID token includes the 'admin' role claim.");

  } catch (error) {
    console.error('Error setting custom claim or revoking refresh tokens:', error);
  }
}

setAdminClaim();
