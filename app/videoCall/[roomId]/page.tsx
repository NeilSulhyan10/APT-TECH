'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { createMeeting } from '@/utils/createMeeting';
import { startCall, answerCall, endCall } from '@/utils/webRTC';

export default function VideoCallRoom() {
  const { roomId } = useParams();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isHost, setIsHost] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [meetingExists, setMeetingExists] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setErrorMessage('You must be logged in to join a call.');
        return;
      }

      const ref = doc(db, 'meetings', roomId as string);
      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const isUserHost = data.hostUid === user.uid;
        setIsHost(isUserHost);
        setMeetingExists(true);
      } else {
        try {
          // If meeting doesn't exist, and user is the one who generated the room, create it
          await createMeeting(roomId as string);
          setIsHost(true);
          setMeetingExists(true);
        } catch (err) {
          console.error(err);
          setErrorMessage('Failed to create meeting.');
        }
      }

      setUserLoaded(true);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleStartCall = async () => {
    try {
      setIsCalling(true);
      const stream = await startCall(roomId as string, (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to start call.');
      setIsCalling(false);
    }
  };

  const handleAnswerCall = async () => {
    try {
      setIsReceiving(true);
      const stream = await answerCall(roomId as string, (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to join call.');
      setIsReceiving(false);
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall(roomId as string);
      setIsCalling(false);
      setIsReceiving(false);
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to end call.');
    }
  };

  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>Loading meeting...</p>
      </div>
    );
  }

  if (!meetingExists) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>{errorMessage || 'Meeting not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-xl font-semibold mb-4">Meeting Room: {roomId}</h1>

      {errorMessage && (
        <p className="text-red-400 text-sm mb-2">{errorMessage}</p>
      )}

      <div className="flex gap-4 mb-6">
        {isHost ? (
          <>
            <button
              onClick={handleStartCall}
              disabled={isCalling || isReceiving}
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl disabled:opacity-50"
            >
              Start Call
            </button>
            <button
              onClick={handleEndCall}
              disabled={!isCalling && !isReceiving}
              className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl disabled:opacity-50"
            >
              End Call
            </button>
          </>
        ) : (
          <button
            onClick={handleAnswerCall}
            disabled={isCalling || isReceiving}
            className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl disabled:opacity-50"
          >
            Join Call
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="relative bg-gray-800 rounded-xl aspect-video overflow-hidden">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 text-sm rounded-md">You</p>
        </div>
        <div className="relative bg-gray-800 rounded-xl aspect-video overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 text-sm rounded-md">Remote</p>
        </div>
      </div>
    </div>
  );
}
