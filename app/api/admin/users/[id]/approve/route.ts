// app/api/admin/users/[id]/approve/route.ts
// This file handles PATCH requests to approve or reject various user roles (expert, mentor, admin).
// It also logs these actions to a Firestore collection.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase'; // Your Firestore DB instance
import { doc, updateDoc, getDoc, collection, addDoc } from 'firebase/firestore'; // Firestore functions
import admin from '@/app/firebase/admin'; // Firebase Admin SDK for token verification and custom claims

/**
 * Handles PATCH requests to approve or reject a user's pending role request.
 * Only administrators can call this endpoint.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params; // The UID of the user whose role request is being acted upon
  console.log(`Backend: PATCH /api/admin/users/${id}/approve route hit!`);

  try {
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ error: 'Invalid action provided. Must be "approve" or "reject".' }, { status: 400 });
    }

    // --- START: Admin Authentication and Authorization Check ---
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      console.error("Backend Auth Failed: No Bearer token provided for admin action.");
      return NextResponse.json({ error: 'Unauthorized: No Firebase ID token provided.' }, { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      // Ensure the requesting user has the 'admin' role
      if (decodedToken.role !== 'admin') {
        console.error("Backend Auth Failed: User is not an admin. Role:", decodedToken.role);
        return NextResponse.json({ error: 'Forbidden: Only administrators can perform this action.' }, { status: 403 });
      }
    } catch (tokenError) {
      console.error('Error verifying Firebase ID token for admin action:', tokenError);
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired Firebase ID token.' }, { status: 401 });
    }
    const adminUid = decodedToken.uid; // UID of the admin performing the action
    const adminEmail = decodedToken.email || 'N/A'; // Email of the admin performing the action
    // --- END: Admin Authentication and Authorization Check ---

    // Get the user's current profile from Firestore
    const userDocRef = doc(db, 'users', id);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return NextResponse.json({ error: 'User not found in Firestore.' }, { status: 404 });
    }

    const userData = userDocSnap.data();
    const currentRequestedRole = userData?.role; // The role they requested (e.g., 'expert', 'admin')
    const currentStatus = userData?.status;
    const targetUserEmail = userData?.email || 'N/A';
    const targetUserFirstName = userData?.firstName || '';
    const targetUserLastName = userData?.lastName || '';


    // Only allow approval/rejection for roles that are currently 'pending'
    if (currentStatus !== 'pending') {
        return NextResponse.json({ error: `Cannot ${action} user. User is not in a pending state.` }, { status: 400 });
    }

    let message = '';
    let updatedStatus = '';
    let firebaseAuthRoleClaim = 'user'; // Default role claim if rejected or default user
    let activityActionType = '';

    if (action === 'approve') {
      updatedStatus = 'approved';
      firebaseAuthRoleClaim = currentRequestedRole; // Set Firebase Auth claim to the requested role
      message = `${currentRequestedRole} user ${id} approved successfully.`;
      activityActionType = `approved_${currentRequestedRole}`;
    } else { // action === 'reject'
      updatedStatus = 'rejected';
      firebaseAuthRoleClaim = 'user'; // If rejected, set Firebase Auth claim back to 'user'
      message = `${currentRequestedRole} user ${id} rejected. Their role is reverted to 'user'.`;
      activityActionType = `rejected_${currentRequestedRole}`;
    }

    // Update the user's document in Firestore
    await updateDoc(userDocRef, {
      status: updatedStatus,
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase Custom Claim for the user and revoke refresh tokens
    await admin.auth().setCustomUserClaims(id, { role: firebaseAuthRoleClaim });
    await admin.auth().revokeRefreshTokens(id); // Force re-authentication to get new token with claims
    console.log(`Firebase Custom Claim 'role:${firebaseAuthRoleClaim}' set for ${id}. Refresh tokens revoked.`);


    // --- Log the admin activity to Firestore ---
    await addDoc(collection(db, 'admin_logs'), {
      adminUid: adminUid,
      adminEmail: adminEmail,
      action: activityActionType,
      targetUid: id,
      targetEmail: targetUserEmail,
      targetRole: currentRequestedRole, // The role they were attempting to get (e.g., 'expert', 'admin')
      targetFirstName: targetUserFirstName,
      targetLastName: targetUserLastName,
      timestamp: new Date().toISOString(),
    });
    console.log(`Admin activity logged: ${activityActionType} for ${id}`);

    return NextResponse.json({ message, uid: id, newStatus: updatedStatus }, { status: 200 });

  } catch (error) {
    console.error(`Error in PATCH /api/admin/users/${id}/approve:`, error);
    return NextResponse.json({ error: (error as Error).message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}
