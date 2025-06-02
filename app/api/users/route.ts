import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

// Helper to get users collection ref
const usersCollection = collection(db, 'users');

// POST /api/users -> create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstname, lastname, email, password, college, year_of_study } = body;

    if (!firstname || !lastname || !email || !password || !college || !year_of_study) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if email exists
    const q = query(usersCollection, where('email', '==', email));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const docRef = await addDoc(usersCollection, {
      firstname,
      lastname,
      email,
      password,
      college,
      year_of_study,
    });

    return NextResponse.json({ message: 'User created', id: docRef.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// GET /api/users -> get all users
export async function GET() {
  try {
    const snapshot = await getDocs(usersCollection);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// GET /api/users/:id -> get user by id
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
