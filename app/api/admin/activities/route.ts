// app/api/admin/activities/route.ts
// This file handles GET requests to fetch admin activity logs.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase'; // Your Firestore DB instance
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'; // Firestore functions
import admin from '@/app/firebase/admin'; // Firebase Admin SDK for token verification

/**
 * Handles GET requests to /api/admin/activities
 * Fetches recent admin activity logs from Firestore.
 * This endpoint is protected and only accessible by 'admin' users.
 */
export async function GET(request: NextRequest) {
  console.log("Backend: GET /api/admin/activities route hit!");

  try {
    // --- START: Admin Authentication and Authorization Check ---
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      console.error("Backend Auth Failed: No Bearer token provided for admin activity fetch.");
      return NextResponse.json({ error: 'Unauthorized: No Firebase ID token provided.' }, { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      // Ensure the requesting user has the 'admin' role
      if (decodedToken.role !== 'admin') {
        console.error("Backend Auth Failed: User is not an admin. Role:", decodedToken.role);
        return NextResponse.json({ error: 'Forbidden: Only administrators can access activity logs.' }, { status: 403 });
      }
    } catch (tokenError) {
      console.error('Error verifying Firebase ID token for admin activity fetch:', tokenError);
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired Firebase ID token.' }, { status: 401 });
    }
    // --- END: Admin Authentication and Authorization Check ---

    // Fetch documents from the 'admin_logs' collection
    // Order by timestamp in descending order and limit to, say, 50 most recent logs
    const logsQuery = query(
      collection(db, 'admin_logs'),
      orderBy('timestamp', 'desc'),
      limit(50) // Adjust limit as needed
    );

    const querySnapshot = await getDocs(logsQuery);
    const activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure timestamp is string for consistency with frontend interface
      timestamp: doc.data().timestamp instanceof admin.firestore.Timestamp
                 ? doc.data().timestamp.toDate().toISOString()
                 : doc.data().timestamp,
    }));

    console.log(`Fetched ${activities.length} admin activities.`);
    return NextResponse.json(activities, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/admin/activities:', error);
    return NextResponse.json({ error: (error as Error).message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}
