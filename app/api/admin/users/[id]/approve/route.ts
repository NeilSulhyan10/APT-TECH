// app/api/admin/users/[id]/approve/route.ts
// This file handles PATCH requests to approve or reject expert/mentor users,
// and now also logs these actions to a Firestore collection.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase'; // Your Firestore DB instance
import { doc, updateDoc, getDoc, collection, addDoc } from 'firebase/firestore'; // Firestore functions
import admin from '@/app/firebase/admin'; // Firebase Admin SDK for token verification and custom claims

/**
 * Handles PATCH requests to approve or reject a user (specifically experts/mentors).
 * Only administrators can call this endpoint.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params; // The UID of the user to be approved/rejected
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
    const currentRole = userData?.role;
    const currentStatus = userData?.status;
    const targetUserEmail = userData?.email || 'N/A'; // Email of the user being acted upon
    const targetUserFirstName = userData?.firstName || '';
    const targetUserLastName = userData?.lastName || '';


    // Only allow approval/rejection for expert/mentor roles that are pending
    if (!(currentRole === 'expert' || currentRole === 'mentor') || currentStatus !== 'pending') {
        return NextResponse.json({ error: `Cannot ${action} user. User is not a pending expert/mentor.` }, { status: 400 });
    }

    let message = '';
    let updatedStatus = '';
    let updatedRole = currentRole; // Role in Firestore remains 'expert' or 'mentor'
    let activityActionType = '';

    if (action === 'approve') {
      updatedStatus = 'approved';
      message = `${currentRole} user ${id} approved successfully.`;
      activityActionType = `approved_${currentRole}`;
      // Set Firebase Custom Claim for the approved expert/mentor
      await admin.auth().setCustomUserClaims(id, { role: updatedRole });
      // Revoke existing tokens to force the user to re-authenticate and get the new token with claims
      await admin.auth().revokeRefreshTokens(id);
      console.log(`Firebase Custom Claim 'role:${updatedRole}' set for ${id}. Refresh tokens revoked.`);
    } else { // action === 'reject'
      updatedStatus = 'rejected';
      message = `${currentRole} user ${id} rejected.`;
      activityActionType = `rejected_${currentRole}`;
      // When rejecting, revert their Firebase Auth claim to 'user'
      await admin.auth().setCustomUserClaims(id, { role: 'user' });
      await admin.auth().revokeRefreshTokens(id);
      console.log(`Firebase Custom Claim reverted to 'role:user' for ${id}. Refresh tokens revoked.`);
    }

    // Update the user's document in Firestore
    await updateDoc(userDocRef, {
      status: updatedStatus,
      updatedAt: new Date().toISOString(),
    });

    // --- NEW: Log the admin activity to Firestore ---
    await addDoc(collection(db, 'admin_logs'), {
      adminUid: adminUid,
      adminEmail: adminEmail,
      action: activityActionType,
      targetUid: id,
      targetEmail: targetUserEmail,
      targetRole: currentRole, // The role they were attempting to get
      targetFirstName: targetUserFirstName,
      targetLastName: targetUserLastName,
      timestamp: new Date().toISOString(),
    });
    console.log(`Admin activity logged: ${activityActionType} for ${id}`);
    // --- END NEW ---

    console.log(message);
    return NextResponse.json({ message, uid: id, newStatus: updatedStatus }, { status: 200 });

  } catch (error) {
    console.error(`Error in PATCH /api/admin/users/${id}/approve:`, error);
    return NextResponse.json({ error: (error as Error).message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}
