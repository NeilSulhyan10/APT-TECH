// app/api/users/login/route.ts
import { NextResponse } from 'next/server';
import admin from '@/app/firebase/admin';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Here you can optionally check user roles or perform other logic.

    // For demonstration, just send back the user info
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
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
