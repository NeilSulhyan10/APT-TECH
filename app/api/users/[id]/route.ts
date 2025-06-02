import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

export async function GETById(id: string) {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// PATCH /api/users/:id -> update user by id
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await updateDoc(docRef, body);
    return NextResponse.json({ message: 'User updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/users/:id -> delete user by id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await deleteDoc(docRef);
    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
