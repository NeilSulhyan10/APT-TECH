// app/api/users/route.ts
// This file handles POST requests to /api/users (for creating user profiles)
// and GET requests to /api/users (for fetching all user profiles).

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase'; // Assuming your Firestore DB instance is exported here
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'; // Firestore functions
import admin from '@/app/firebase/admin'; // Firebase Admin SDK for token verification (backend only)

// Helper to get users collection reference
const usersCollectionRef = collection(db, 'users');

/**
 * Handles POST requests to /api/users
 * Used for creating a new user profile document in Firestore after Firebase Authentication.
 * This now includes handling the user's chosen role and initial status.
 */
export async function POST(request: NextRequest) {
  console.log("Backend: POST /api/users route hit (User Profile Creation)");

  try {
    const rawBody = await request.text();
    const parsedBody = JSON.parse(rawBody);

    const { uid, email, firstName, lastName, college, year_of_study, role, ...otherProfileData } = parsedBody;

    // Basic Server-Side Validation: Ensure essential profile data is present
    if (!uid || !email || !firstName || !lastName || !role) {
      console.error("Backend Validation Failed: Missing required fields for user profile creation.");
      return NextResponse.json(
        { error: 'Missing required user profile data (uid, email, firstName, lastName, or role).' },
        { status: 400 }
      );
    }

    // Firebase ID Token Verification for Security:
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      console.error("Backend Auth Failed: No Bearer token provided in Authorization header.");
      return NextResponse.json(
        { error: 'Unauthorized: No Firebase ID token provided.' },
        { status: 401 }
      );
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      // Critical security check: Ensure the UID from the token matches the UID sent in the body.
      if (decodedToken.uid !== uid) {
        console.error("Backend Auth Failed: Firebase ID token UID mismatch. Token UID:", decodedToken.uid, "Body UID:", uid);
        return NextResponse.json(
          { error: 'Unauthorized: Firebase ID token UID mismatch.' },
          { status: 401 }
        );
      }
    } catch (tokenError) {
      console.error('Error verifying Firebase ID token for profile creation:', tokenError);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired Firebase ID token.' },
        { status: 401 }
      );
    }

    // Determine initial status based on role
    let initialStatus: 'pending' | 'approved' = 'approved';
    if (role === 'expert' || role === 'admin') { // Admins can also be 'pending' if applied through a form
        initialStatus = 'pending';
    }

    const userProfileData = {
        uid,
        email,
        firstName,
        lastName,
        college,
        year_of_study,
        role,           // Store the chosen role
        status: initialStatus, // Store the initial status
        createdAt: new Date().toISOString(), // Timestamp for when the profile was created
        ...otherProfileData // Include any other data passed from the frontend
    };


    // Save User Profile Data to Firestore:
    const userProfileRef = doc(db, 'users', uid);
    await setDoc(userProfileRef, userProfileData, { merge: true }); // Use merge: true to avoid overwriting

    // Respond with success
    console.log(`User profile for UID: ${uid} created/updated successfully in Firestore with role: ${role} and status: ${initialStatus}.`);
    return NextResponse.json(
      { message: 'User profile created/updated successfully in Firestore.', uid, role, status: initialStatus },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'An unexpected error occurred on the server.' },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to /api/users
 * Used for fetching all user profiles from Firestore.
 * This endpoint should ideally be protected for admin use.
 */
export async function GET(request: NextRequest) {
  console.log("Backend: GET /api/users route hit (Fetch All Users)"); // Debugging log
  try {
    // --- START: Admin Authentication and Authorization Check for GET /api/users ---
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      console.error("Backend Auth Failed: No Bearer token provided for fetching all users.");
      return NextResponse.json({ error: 'Unauthorized: No Firebase ID token provided.' }, { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      // Ensure the requesting user has the 'admin' role
      if (decodedToken.role !== 'admin') {
        console.error("Backend Auth Failed: User is not an admin. Role:", decodedToken.role);
        return NextResponse.json({ error: 'Forbidden: Only administrators can view all users.' }, { status: 403 });
      }
    } catch (tokenError) {
      console.error('Error verifying Firebase ID token for fetching all users:', tokenError);
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired Firebase ID token.' }, { status: 401 });
    }
    // --- END: Admin Authentication and Authorization Check ---


    const snapshot = await getDocs(usersCollectionRef);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Fetched ${users.length} user profiles.`);
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: (error as Error).message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
