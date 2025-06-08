// app/api/admin/students/route.ts
import { NextResponse } from 'next/server';
import admin from '@/app/firebase/admin'; 


interface StudentProfile {
  uid: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isStudentApproved?: boolean | null;
}

export async function GET(request: Request) {
  try {
    // 1. Verify Admin Authentication
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json({ message: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return NextResponse.json({ message: 'Unauthorized: Invalid token.' }, { status: 401 });
    }

    // Check if the user is an admin
    const adminUserDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Not an admin.' }, { status: 403 });
    }

    // 2. Fetch Student Data
    const studentsRef = admin.firestore().collection('users'); // Use admin.firestore() for Firestore instance
    const q = studentsRef.where('role', '==', 'student');
    const snapshot = await q.get();

    const students = snapshot.docs.map(doc => ({
      uid: doc.id,
      email: doc.data().email,
      firstName: doc.data().firstName || null,
      lastName: doc.data().lastName || null,
      isStudentApproved: doc.data().isStudentApproved ?? null, // Use nullish coalescing
    }));

    // Sort: Pending (null) first, then Approved (true), then Rejected (false)
    const sortedStudents = students.sort((a: StudentProfile, b: StudentProfile) => { // Fix: Explicitly type 'a' and 'b'
      const getPriority = (status: boolean | null | undefined) => {
        if (status === null || status === undefined) return 0;
        if (status === true) return 1;
        return 2;
      };
      return getPriority(a.isStudentApproved) - getPriority(b.isStudentApproved);
    });

    return NextResponse.json(sortedStudents, { status: 200 });
  } catch (error) {
    console.error('API Error fetching students:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}