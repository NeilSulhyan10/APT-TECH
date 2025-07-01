'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import  app  from '@/config/firebase'; // adjust the path to your Firebase config

function generateAlphaId() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += letters[Math.floor(Math.random() * letters.length)];
  }
  return id.match(/.{1,4}/g)?.join('-') || '';
}

export default function HomePage() {
  const router = useRouter();
  const [callId, setCallId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Firebase Auth
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleGenerateRoom = () => {
    if (!isLoggedIn) {
      setErrorMessage('You must be logged in to generate a room.');
      return;
    }
    const generatedId = generateAlphaId();
    setCallId(generatedId);
    setErrorMessage('');
  };

  const handleShareLink = () => {
    if (!isLoggedIn) {
      setErrorMessage('You must be logged in to share a room.');
      return;
    }
    if (!callId) {
      setErrorMessage('Generate a Call ID first to share.');
      return;
    }
    const url = `${window.location.origin}/videoCall/${callId}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('Call link copied to clipboard!'))
      .catch((err) => {
        console.error(err);
        setErrorMessage('Failed to copy link.');
      });
  };

  const handleGoToCall = () => {
    if (!isLoggedIn) {
      setErrorMessage('You must be logged in to join a call.');
      return;
    }
    if (!callId) {
      setErrorMessage('Generate a room first.');
      return;
    }
    router.push(`/videoCall/${callId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter">
      <h1 className="text-4xl font-bold mb-8 text-indigo-700">Create a Room</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <input
          type="text"
          value={callId}
          disabled
          readOnly
          placeholder="Room ID will appear here"
          className="shadow border rounded-xl w-full py-3 px-4 text-gray-700 bg-gray-100 cursor-not-allowed mb-4"
        />

        {errorMessage && <p className="text-red-500 text-sm italic mb-4">{errorMessage}</p>}

        <div className="space-y-4">
          <button
            onClick={handleGenerateRoom}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded-xl"
          >
            Generate Room
          </button>

          <button
            onClick={handleShareLink}
            disabled={!callId}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 w-full rounded-xl disabled:opacity-50"
          >
            Copy Share Link
          </button>

          <button
            onClick={handleGoToCall}
            disabled={!callId}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 w-full rounded-xl disabled:opacity-50"
          >
            Go to Video Call
          </button>
        </div>
      </div>
    </div>
  );
}