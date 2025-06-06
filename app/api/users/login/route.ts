// app/api/users/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import admin from '@/app/firebase/admin'; // Assuming admin SDK is initialized here
import { db } from '@/config/firebase'; // Import your Firestore DB instance
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

export async function POST(req: NextRequest) {
  try {
    const authorizationHeader = req.headers.get('Authorization');

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized: No Bearer token provided.' }, { status: 401 });
    }

    const token = authorizationHeader.split('Bearer ')[1];

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userUid = decodedToken.uid;

    // Fetch user's profile from Firestore to get their role and other details
    const userDocRef = doc(db, 'users', userUid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.warn(`User profile not found in Firestore for UID: ${userUid}. This should ideally not happen for a valid login.`);
      // Return a basic user object with a default role if Firestore profile is missing
      return NextResponse.json({
        message: 'Login successful, but user profile not found. Defaulting to user role.',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          firstName: decodedToken.name?.split(' ')[0] || 'User',
          lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
          role: 'user', // Default role if Firestore profile is missing
          status: 'approved', // Default status
        },
      }, { status: 200 });
    }

    const userProfileData = userDocSnap.data();
    // Ensure role and other necessary fields are included from Firestore
    const userToReturn = {
      uid: userProfileData.uid,
      email: userProfileData.email,
      firstName: userProfileData.firstName,
      lastName: userProfileData.lastName,
      college: userProfileData.college,
      year_of_study: userProfileData.year_of_study,
      role: userProfileData.role || 'user', // Fallback to 'user' if role is missing in Firestore
      status: userProfileData.status || 'approved', // Fallback status
    };

    // Respond with successful login message and full user profile data
    return NextResponse.json({
      message: 'Login successful',
      user: userToReturn,
    }, { status: 200 });

  } catch (error) {
    console.error('Error verifying Firebase ID token or fetching user profile:', error);
    return NextResponse.json({ message: 'Authentication failed. Invalid token or server error.' }, { status: 401 });
  }
}
