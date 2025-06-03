// app/api/users/login/route.ts
import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import admin from '@/app/firebase/admin';

export async function POST(req: NextRequest) { // Ensure 'req' is typed as NextRequest
  try {
    // 1. Get the Authorization header from the incoming request
    const authorizationHeader = req.headers.get('Authorization');

    // 2. Validate the header: Check if it exists and starts with 'Bearer '
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      // If no valid header is found, return an unauthorized response
      return NextResponse.json({ message: 'Unauthorized: No Bearer token provided.' }, { status: 401 });
    }

    // 3. Extract the token string: Remove the 'Bearer ' prefix
    const token = authorizationHeader.split('Bearer ')[1];

    // 4. Now, 'token' holds your Firebase ID token, which you can verify
    const decodedToken = await admin.auth().verifyIdToken(token);

    // ... (rest of your logic for successful login) ...

    return NextResponse.json({
      message: 'Login successful',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || '',
      },
    });
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return NextResponse.json({ message: 'Authentication failed. Invalid token or server error.' }, { status: 401 });
  }
}