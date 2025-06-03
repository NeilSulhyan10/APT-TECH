// app/api/users/[id]/route.ts
// This file handles GET, PATCH, and DELETE requests to /api/users/:id
// for operations on a specific user profile identified by their ID.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase'; // Assuming your Firestore DB instance is exported here
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // Firestore functions
// import admin from '@/app/firebase/admin'; // Include if you need token verification for these routes too

/**
 * Handles GET requests to /api/users/:id
 * Used for fetching a single user profile by ID.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(`Backend: GET /api/users/${id} route hit!`); // Debugging log

  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`User with ID ${id} not found.`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`Fetched user profile for ID: ${id}`);
    return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/users/${id}:`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * Handles PATCH requests to /api/users/:id
 * Used for updating a user profile by ID.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(`Backend: PATCH /api/users/${id} route hit!`); // Debugging log

  try {
    const body = await request.json();
    console.log(`Backend: PATCH body for ${id}:`, body);

    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.log(`User with ID ${id} not found for PATCH.`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Optional: Implement token verification here if only authenticated users can update their own profiles
    // const authorizationHeader = request.headers.get('Authorization');
    // ... (logic similar to POST /api/users/route.ts to verify token and match UID) ...

    await updateDoc(docRef, body);
    console.log(`User profile for ID: ${id} updated.`);
    return NextResponse.json({ message: 'User updated' }, { status: 200 });
  } catch (error) {
    console.error(`Error in PATCH /api/users/${id}:`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to /api/users/:id
 * Used for deleting a user profile by ID.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(`Backend: DELETE /api/users/${id} route hit!`); // Debugging log

  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`User with ID ${id} not found for DELETE.`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Optional: Implement token verification here if only authenticated users can delete their own profiles
    // const authorizationHeader = request.headers.get('Authorization');
    // ... (logic similar to POST /api/users/route.ts to verify token and match UID) ...

    await deleteDoc(docRef);
    console.log(`User profile for ID: ${id} deleted.`);
    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    console.error(`Error in DELETE /api/users/${id}:`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}