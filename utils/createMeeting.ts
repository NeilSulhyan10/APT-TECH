import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export async function createMeeting(roomId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in');

  await setDoc(doc(db, 'meetings', roomId), {
    hostUid: user.uid,
    createdAt: Date.now(),
  });
}
