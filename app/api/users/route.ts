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
 */
export async function POST(request: NextRequest) {
  console.log("Backend: POST /api/users route hit!"); // Debugging log

  try {
    // Read the raw request body and parse it as JSON
    const rawBody = await request.text();
    console.log("Backend: Raw Request Body:", rawBody);
    const parsedBody = JSON.parse(rawBody);

    // Destructure the expected user profile data from the parsed body
    const {
      uid,
      email,
      firstName,
      lastName,
      college,
      year_of_study,
      role,
      isMentorApproved,
      mentorship,
      createdAt
    } = parsedBody;

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

    // Prepare the user profile data for Firestore
    const userProfileToSave: { [key: string]: any } = {
      uid,
      email,
      firstName,
      lastName,
      college: college || null,
      year_of_study: year_of_study || null,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (role === 'mentor') {
        userProfileToSave.isMentorApproved = typeof isMentorApproved === 'boolean' ? isMentorApproved : false;
    } else if (role === 'student') {
        userProfileToSave.mentorship = typeof mentorship === 'string' ? mentorship : 'no';
    }

    // Save User Profile Data to Firestore
    const userProfileRef = doc(db, 'users', uid);
    await setDoc(userProfileRef, userProfileToSave, { merge: true });

    // Respond with success, including the full userProfileToSave object
    console.log(`User profile for UID: ${uid} with role: ${role} created/updated successfully in Firestore.`);
    return NextResponse.json(
      {
        message: 'User profile created/updated successfully in Firestore.',
        uid: uid,
        user: userProfileToSave // IMPORTANT: Include the full user profile object here
      },
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
 */
export async function GET(request: NextRequest) { // Added NextRequest type for consistency
  console.log("Backend: GET /api/users route hit!"); // Debugging log
  try {
    const snapshot = await getDocs(usersCollectionRef);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Fetched ${users.length} user profiles.`);
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}