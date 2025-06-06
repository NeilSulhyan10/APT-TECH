// app/api/users/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import admin from '@/app/firebase/admin'; // Firebase Admin SDK (usually just `firebase-admin`)

// This import is crucial. It must point to the file where you initialize and export admin.firestore()
import { db } from '@/config/firebase';

// Note: The imports `doc, getDoc` from 'firebase/firestore' (client-side SDK)
// are not needed here if you are exclusively using `adminDb.collection().doc().get()`.
// You can remove `import { doc, getDoc } from 'firebase/firestore';` from this file if it exists.

export async function POST(req: NextRequest) {
  try {
    const authorizationHeader = req.headers.get('Authorization');

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized: No Bearer token provided.' }, { status: 401 });
    }

    const token = authorizationHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (tokenError: any) {
      console.error('Error verifying Firebase ID token during login:', tokenError);
      return NextResponse.json(
        { message: 'Authentication failed: Invalid or expired token.', details: tokenError.message },
        { status: 401 }
      );
    }

    const { uid, email } = decodedToken;

    // This line uses the `adminDb` instance which should now correctly have `.collection()`
    const userDocRef = admin.firestore().collection('users').doc(uid);
    const userDocSnap = await userDocRef.get(); // Using Admin SDK's `get()`

    if (!userDocSnap.exists) {
      console.warn(`User profile not found in Firestore for UID: ${uid}. Returning basic info.`);
      return NextResponse.json({
        message: 'Login successful, but user profile not found in database.',
        user: {
          uid,
          email,
          firstName: decodedToken.name?.split(' ')[0] || '',
          lastName: decodedToken.name?.split(' ')[1] || '',
          role: null, // Indicate role is unknown without profile
          mentorship: null,
          isMentorApproved: null,
        },
      }, { status: 200 });
    }

    const userProfile = userDocSnap.data();
    console.log(`User profile fetched from Firestore for UID: ${uid}`);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        uid: userProfile?.uid || uid,
        email: userProfile?.email || email,
        firstName: userProfile?.firstName || decodedToken.name?.split(' ')[0] || '',
        lastName: userProfile?.lastName || decodedToken.name?.split(' ')[1] || '',
        college: userProfile?.college || null,
        year_of_study: userProfile?.year_of_study || null,
        role: userProfile?.role || null,
        mentorship: userProfile?.mentorship || null,
        isMentorApproved: userProfile?.isMentorApproved !== undefined ? userProfile.isMentorApproved : null,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('General error in /api/users/login:', error);
    return NextResponse.json({ message: 'Internal Server Error during login.', details: (error as Error).message }, { status: 500 });
  }
}