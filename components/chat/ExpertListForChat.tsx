// components/chat/ExpertListForChat.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/config/firebase'; // Your Firebase client SDK instance
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input'; // For search functionality (optional)
import { ExpertForChat } from '@/app/chat/page'; // Import interface

interface ExpertListForChatProps {
  onSelectExpert: (expert: ExpertForChat) => void;
  currentUserId: string; // To ensure student cannot chat with themselves, or highlight self if expert list shown to experts
}

export default function ExpertListForChat({ onSelectExpert, currentUserId }: ExpertListForChatProps) {
  const [experts, setExperts] = useState<ExpertForChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchExperts = async () => {
      try {
        // Fetch only approved experts
        const q = query(
          collection(db, 'experts'),
          where('profileCreated', '==', true) // Only show experts who have set up their profile
        );
        const querySnapshot = await getDocs(q);

        const fetchedExperts: ExpertForChat[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown Expert',
            role: data.role || 'Expert',
            initials: data.initials || (data.name ? data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'EX'),
            color: data.color || '#60A5FA', // Default color if not set
          };
        }).filter(expert => expert.id !== currentUserId); // Filter out the current user if they are also an expert

        setExperts(fetchedExperts);
      } catch (err: any) {
        console.error("Error fetching experts for chat:", err);
        setError(`Failed to load experts: ${err.message || "Unknown error."}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [currentUserId]);

  const filteredExperts = experts.filter(expert =>
    expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-4 pt-2">
      <Input
        placeholder="Search experts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 h-9 text-sm"
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground mt-2">Loading experts...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center text-sm">{error}</p>
      ) : filteredExperts.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm">No experts found.</p>
      ) : (
        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
          {filteredExperts.map((expert) => (
            <div
              key={expert.id}
              onClick={() => onSelectExpert(expert)}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback style={{ backgroundColor: expert.color || '#60A5FA' }} className="text-white text-base font-bold">
                  {getInitials(expert.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-semibold text-sm">{expert.name}</p>
                <p className="text-xs text-muted-foreground">{expert.role}</p>
              </div>
              <MessageSquarePlus className="ml-auto h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// This component displays a list of experts available for chat, allowing students to select one to start a conversation.