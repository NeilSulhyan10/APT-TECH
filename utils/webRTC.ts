import { db } from '@/config/firebase';
import { doc, collection, getDoc, setDoc, updateDoc, onSnapshot, addDoc, deleteDoc, getDocs } from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;

export const startCall = async (callId: string, onRemoteStream: (stream: MediaStream) => void) => {
  // 1. Get local media
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  // 2. Create RTCPeerConnection
  peerConnection = new RTCPeerConnection(servers);

  // 3. Add local tracks to peer connection
  localStream.getTracks().forEach(track => {
    if (peerConnection) {
      peerConnection.addTrack(track, localStream!);
    }
  });

  // 4. Handle remote stream (when tracks are received)
  remoteStream = new MediaStream();
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream!.addTrack(track);
    });
    onRemoteStream(remoteStream!);
  };

  // 5. Create offer and set it as local description
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  // 6. Signaling: Save offer to Firestore
  const callDoc = doc(db, 'calls', callId);
  await setDoc(callDoc, { offer: { sdp: offer.sdp, type: offer.type } });

  // 7. Signaling: Listen for ICE candidates from local peer and add to Firestore
  const offerCandidatesCollection = collection(callDoc, 'offerCandidates');
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(offerCandidatesCollection, event.candidate.toJSON());
    }
  };

  // 8. Signaling: Listen for remote answer and ICE candidates
  onSnapshot(callDoc, async (snapshot) => {
    const data = snapshot.data();
    if (data?.answer && !peerConnection?.currentRemoteDescription) {
      const answerDescription = new RTCSessionDescription(data.answer);
      await peerConnection!.setRemoteDescription(answerDescription);
    }
  });

  const answerCandidatesCollection = collection(callDoc, 'answerCandidates');
  onSnapshot(answerCandidatesCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        peerConnection!.addIceCandidate(candidate);
      }
    });
  });

  return localStream; // Return local stream to display it
};

export const answerCall = async (callId: string, onRemoteStream: (stream: MediaStream) => void) => {
  // 1. Get local media
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  // 2. Create RTCPeerConnection
  peerConnection = new RTCPeerConnection(servers);

  // 3. Add local tracks to peer connection
  localStream.getTracks().forEach(track => {
    if (peerConnection) {
      peerConnection.addTrack(track, localStream!);
    }
  });

  // 4. Handle remote stream
  remoteStream = new MediaStream();
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream!.addTrack(track);
    });
    onRemoteStream(remoteStream!);
  };

  // 5. Signaling: Listen for ICE candidates from local peer and add to Firestore
  const callDoc = doc(db, 'calls', callId);
  const answerCandidatesCollection = collection(callDoc, 'answerCandidates');
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(answerCandidatesCollection, event.candidate.toJSON());
    }
  };

  // 6. Signaling: Get offer from Firestore and set as remote description
  const callSnapshot = await getDoc(callDoc);
  const offerData = callSnapshot.data()?.offer;
  if (offerData) {
    const offerDescription = new RTCSessionDescription(offerData);
    await peerConnection!.setRemoteDescription(offerDescription);

    // 7. Create answer and set as local description
    const answer = await peerConnection!.createAnswer();
    await peerConnection!.setLocalDescription(answer);

    // 8. Signaling: Save answer to Firestore
    await updateDoc(callDoc, { answer: { sdp: answer.sdp, type: answer.type } });
  }

  // 9. Signaling: Listen for remote offer candidates
  const offerCandidatesCollection = collection(callDoc, 'offerCandidates');
  onSnapshot(offerCandidatesCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        peerConnection!.addIceCandidate(candidate);
      }
    });
  });

  return localStream;
};

export const endCall = async (callId: string) => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
    remoteStream = null;
  }
  // Clean up Firestore data related to this call
  const callDocRef = doc(db, 'calls', callId);
  const offerCandidatesRef = collection(callDocRef, 'offerCandidates');
  const answerCandidatesRef = collection(callDocRef, 'answerCandidates');

  const offerCandidates = await getDocs(offerCandidatesRef);
  offerCandidates.forEach(async (doc) => await deleteDoc(doc.ref));

  const answerCandidates = await getDocs(answerCandidatesRef);
  answerCandidates.forEach(async (doc) => await deleteDoc(doc.ref));

  await deleteDoc(callDocRef);
};
