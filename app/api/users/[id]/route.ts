// app/api/users/route.ts
// This file handles POST requests to /api/users for creating new user profiles.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase'; // Your Firestore DB instance
import { doc, setDoc } from 'firebase/firestore'; // Firestore functions for setting document
import admin from '@/app/firebase/admin'; // Firebase Admin SDK for token verification

/**
 * Handles POST requests to /api/users
 * Used for creating a new user profile in Firestore after Firebase Auth registration.
 */
export async function POST(request: NextRequest) {
  console.log("Backend: POST /api/users route hit (User Creation)");

  try {
    const body = await request.json();
    const { uid, email, firstName, lastName, college, year_of_study, role, status } = body;

    // --- START NEW: Firebase ID Token Verification ---
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      console.error("Backend Auth Failed: No Bearer token provided for user creation.");
      return NextResponse.json({ error: 'Unauthorized: No Firebase ID token provided.' }, { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      // Ensure the UID from the verified token matches the UID sent in the body
      if (decodedToken.uid !== uid) {
        console.error("Backend Auth Failed: Firebase ID token UID mismatch. Token UID:", decodedToken.uid, "Body UID:", uid);
        return NextResponse.json({ error: 'Forbidden: UID mismatch, cannot create profile for another user.' }, { status: 403 });
      }
    } catch (tokenError) {
      console.error('Error verifying Firebase ID token for user creation:', tokenError);
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired Firebase ID token.' }, { status: 401 });
    }
    // --- END NEW: Firebase ID Token Verification ---

    // Validate incoming role and set status
    const allowedRoles = ['user', 'expert', 'mentor'];
    const finalRole = allowedRoles.includes(role) ? role : 'user'; // Default to 'user' if invalid role sent

    // Status: 'approved' for 'user', 'pending' for 'expert'/'mentor'
    const finalStatus = (finalRole === 'expert' || finalRole === 'mentor') ? 'pending' : 'approved';

    const userDocData = {
      uid,
      email,
      firstName,
      lastName,
      college,
      year_of_study,
      role: finalRole,
      status: finalStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use setDoc with the user's UID as the document ID
    await setDoc(doc(db, 'users', uid), userDocData);

    console.log(`User profile created/updated in Firestore for UID: ${uid} with role: ${finalRole}, status: ${finalStatus}`);
    return NextResponse.json({ message: 'User profile created successfully', user: userDocData }, { status: 201 });

  } catch (error) {
    console.error("Error creating user profile:", error);
    // Return more specific error if Firestore operation fails
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}

// You might also have a GET /api/users for listing all users (admin only)
// or other methods here if your API design requires it.
// For now, this POST handles the initial creation.
