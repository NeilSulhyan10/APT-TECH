// components/chat/ConversationList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/config/firebase'; // Your Firebase client SDK instance
import { collection, query, where, orderBy, onSnapshot, limit, or } from 'firebase/firestore';
import { Loader2, MessageSquareText, Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ConversationItem } from '@/app/chat/page'; // Import interface from main chat page
import { formatDistanceToNowStrict } from 'date-fns'; // For relative time formatting

interface ConversationListProps {
  currentUserId: string;
  onSelectConversation: (conversation: ConversationItem) => void;
  isAdminView: boolean;
}

export default function ConversationList({ currentUserId, onSelectConversation, isAdminView }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) {
      setError("User ID is missing to fetch conversations.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let q;
    if (isAdminView) {
      // Admin sees all conversations (limited for performance, consider pagination for large apps)
      q = query(
        collection(db, 'conversations'),
        orderBy('lastMessageTimestamp', 'desc'),
        limit(50) // Limit for admin view
      );
    } else {
      // Students/Experts see only their own conversations
      q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUserId), // Filter by participant
        orderBy('lastMessageTimestamp', 'desc')
      );
    }


    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedConversations: ConversationItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let otherParticipantId = ''; // Initialize
        let otherParticipantName = 'Unknown User'; // Initialize

        const participantUids = data.participants as string[];
        const participantNamesMap = data.participantNames as { [uid: string]: string };

        if (isAdminView) {
            // For admin, otherParticipantId can be the ID of the first participant
            // This is primarily to ensure selectedChatPartnerId is not null/empty
            // The ChatInterface will use conversationId to fetch all messages.
            if (participantUids && participantUids.length > 0) {
                otherParticipantId = participantUids[0]; // Take the first participant's ID

                // Construct a combined name for admin view
                if (participantUids.length === 2) {
                    const [id1, id2] = participantUids;
                    const name1 = participantNamesMap[id1] || `User ${id1.substring(0, 4)}`;
                    const name2 = participantNamesMap[id2] || `User ${id2.substring(0, 4)}`;
                    otherParticipantName = `${name1} & ${name2}`;
                } else if (participantUids.length === 1) {
                    otherParticipantName = participantNamesMap[participantUids[0]] || `User ${participantUids[0].substring(0, 4)}`;
                } else {
                    otherParticipantName = 'Multiple Users'; // Fallback for more than 2 or unexpected
                }
            } else {
                otherParticipantName = 'No Participants'; // Should not happen for valid conversations
            }

        } else {
            // For student/expert, find the other participant in the conversation
            otherParticipantId = participantUids.find((uid) => uid !== currentUserId) || '';
            otherParticipantName = participantNamesMap[otherParticipantId] || 'Unknown User';
        }


        fetchedConversations.push({
          id: doc.id,
          lastMessage: data.lastMessage || 'No messages yet.',
          lastMessageTimestamp: data.lastMessageTimestamp,
          otherParticipantId: otherParticipantId, // Now correctly set for admin view too
          otherParticipantName: otherParticipantName, // Now correctly set for admin view too
          participants: data.participants,
        });
      });
      setConversations(fetchedConversations);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations. Please try again.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId, isAdminView]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRandomColor = (id: string) => {
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
      '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
      '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E',
      '#607D8B',
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground mt-2">Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {conversations.length === 0 ? (
        <p className="p-4 text-center text-muted-foreground text-sm">
          {isAdminView ? "No active conversations to display." : "No conversations yet. Start a new chat!"}
        </p>
      ) : (
        conversations.map((convo) => (
          <div
            key={convo.id}
            onClick={() => onSelectConversation(convo)}
            className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback
                style={{ backgroundColor: getRandomColor(convo.otherParticipantId || convo.id) }} // Use convo ID for random color if no other participant ID
                className="text-white text-md font-bold"
              >
                {getInitials(convo.otherParticipantName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm truncate pr-2">{convo.otherParticipantName}</p>
                {convo.lastMessageTimestamp && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNowStrict(convo.lastMessageTimestamp.toDate(), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
