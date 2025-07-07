// components/chat/ChatInterface.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/config/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  limit,
  startAfter,
  getDocs,
  where, // Import where for status updates
  writeBatch // Import writeBatch for batch operations
} from 'firebase/firestore';
import { Loader2, Send, X, Check, CheckCheck, ArrowLeft } from 'lucide-react'; // Added Check and CheckCheck icons
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Using Textarea for message input
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils'; // For conditional class merging
import { getDoc } from 'firebase/firestore';

// Define interfaces for message and chat partner
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  status: 'sent' | 'delivered' | 'read'; // New status field
}

interface ChatInterfaceProps {
  conversationId: string;
  chatPartnerId: string;
  chatPartnerName: string;
  currentUserId: string;
  currentUserName: string;
  onCloseChat: () => void; // Function to close the chat (for mobile back button)
  isReadOnly?: boolean; // New prop: if true, input is disabled (e.g., for admin view)
  isAdminView?: boolean; // New prop: to indicate if it's an admin viewing the chat
}

const MESSAGES_PER_LOAD = 20; // Number of messages to load at once

export default function ChatInterface({
  conversationId,
  chatPartnerId,
  chatPartnerName,
  currentUserId,
  currentUserName,
  onCloseChat,
  isReadOnly = false,
  isAdminView = false, // Default to false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastVisibleMessage, setLastVisibleMessage] = useState<any>(null); // For pagination
  const [participantNames, setParticipantNames] = useState<{ [key: string]: string }>({}); // To store names of all participants

  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling to bottom
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for scroll listener

  // Function to scroll to the bottom of the chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages and set up real-time listener
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    setError(null);

    // Initial query for messages (latest messages first)
    const messagesCollectionRef = collection(db, `conversations/${conversationId}/messages`);
    const q = query(
      messagesCollectionRef,
      orderBy('timestamp', 'desc'), // Order by newest first for initial load
      limit(MESSAGES_PER_LOAD)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedMessages: Message[] = [];
      const unreadMessagesToMark: string[] = []; // Collect IDs of unread messages
      const uniqueSenderIds = new Set<string>();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const message: Message = {
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp,
          status: data.status || 'sent', // Default to 'sent' if status is missing
        };
        fetchedMessages.push(message);
        uniqueSenderIds.add(message.senderId);

        // If the current user is the recipient and the message is not yet 'read'
        if (message.senderId !== currentUserId && message.status !== 'read') {
          unreadMessagesToMark.push(message.id);
        }
      });

      // Fetch names for all unique sender IDs if in admin view or if not already known
      const newParticipantNames: { [key: string]: string } = { ...participantNames };
      for (const senderId of Array.from(uniqueSenderIds)) {
        // Only fetch if name is not already known or if it's a generic fallback name
        if (!newParticipantNames[senderId] || newParticipantNames[senderId].startsWith('User ')) {
          let fetchedName = '';
          // Try fetching from 'users' collection first
          const userDocRef = doc(db, 'users', senderId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            fetchedName = (userData.firstName && userData.lastName)
              ? `${userData.firstName} ${userData.lastName}`
              : userData.firstName || userData.email || ''; // Fallback to firstName, then email
          }

          if (!fetchedName) { // If not found in users or name is empty, try 'experts'
            const expertDocRef = doc(db, 'experts', senderId);
            const expertDocSnap = await getDoc(expertDocRef);
            if (expertDocSnap.exists()) {
              const expertData = expertDocSnap.data();
              fetchedName = expertData.name || expertData.email || ''; // Fallback to email for experts
            }
          }

          newParticipantNames[senderId] = fetchedName || `User ${senderId.substring(0, 4)}`; // Final fallback
        }
      }
      setParticipantNames(newParticipantNames);


      // Sort messages by timestamp ascending for display
      fetchedMessages.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
      setMessages(fetchedMessages);
      setLoadingMessages(false);
      setLastVisibleMessage(snapshot.docs[snapshot.docs.length - 1]); // Store the oldest message for pagination
      setHasMoreMessages(snapshot.docs.length === MESSAGES_PER_LOAD);

      // Mark unread messages as 'read' in Firestore
      if (unreadMessagesToMark.length > 0 && !isReadOnly) { // Only mark as read if not read-only view
        const batch = writeBatch(db); // Correctly initialize batch
        unreadMessagesToMark.forEach(messageId => {
          const messageRef = doc(db, `conversations/${conversationId}/messages`, messageId);
          batch.update(messageRef, { status: 'read' });
        });
        try {
          await batch.commit();
          console.log(`Marked ${unreadMessagesToMark.length} messages as 'read'.`);
        } catch (batchError) {
          console.error("Error updating message statuses to 'read':", batchError);
        }
      }

      scrollToBottom(); // Scroll to bottom when new messages arrive
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages.");
      setLoadingMessages(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount or conversationId change
  }, [conversationId, currentUserId, isReadOnly, isAdminView, scrollToBottom]); // Added isAdminView to dependencies

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessageText.trim() || sendingMessage) return;

    setSendingMessage(true); // Start sending indicator
    try {
      const messagesCollectionRef = collection(db, `conversations/${conversationId}/messages`);
      const newMessageData = {
        senderId: currentUserId,
        text: newMessageText.trim(),
        timestamp: Timestamp.now(),
        status: 'sent', // Initial status is 'sent'
      };
      await addDoc(messagesCollectionRef, newMessageData);

      // Update last message on the conversation document
      const conversationDocRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationDocRef, {
        lastMessage: newMessageText.trim(),
        lastMessageTimestamp: Timestamp.now(),
      });

      setNewMessageText('');
      scrollToBottom(); // Scroll to bottom after sending
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    } finally {
      setSendingMessage(false); // End sending indicator
    }
  };

  // Function to load older messages (pagination)
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || !lastVisibleMessage) return;

    setLoadingMessages(true);
    try {
      const messagesCollectionRef = collection(db, `conversations/${conversationId}/messages`);
      const q = query(
        messagesCollectionRef,
        orderBy('timestamp', 'desc'),
        startAfter(lastVisibleMessage),
        limit(MESSAGES_PER_LOAD)
      );
      const querySnapshot = await getDocs(q);

      const oldMessages: Message[] = [];
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        oldMessages.push({
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp,
          status: data.status || 'sent',
        });
      });

      // Add new messages to the beginning of the existing messages
      setMessages(prevMessages => [...oldMessages.reverse(), ...prevMessages]); // Reverse to maintain chronological order
      setLastVisibleMessage(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMoreMessages(oldMessages.length === MESSAGES_PER_LOAD);
    } catch (err) {
      console.error("Error loading more messages:", err);
      setError("Failed to load older messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };


  // Group messages by date for better readability
  const groupedMessages = messages.reduce((acc: { [key: string]: Message[] }, message) => {
    const dateKey = format(message.timestamp.toDate(), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(message);
    return acc;
  }, {});


  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-card">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onCloseChat}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1 ml-2 md:ml-0">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(chatPartnerName)}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold truncate">{chatPartnerName}</h2>
        </div>
        {/* Potentially add video/call icons here */}
      </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col-reverse">
        {loadingMessages && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}
        {hasMoreMessages && (
          <div className="flex justify-center py-2">
            <Button variant="link" onClick={loadMoreMessages} disabled={loadingMessages}>
              Load More Messages
            </Button>
          </div>
        )}

        {Object.keys(groupedMessages).sort().reverse().map(dateKey => (
          <div key={dateKey}>
            <div className="text-center text-xs text-muted-foreground my-4 sticky top-0 bg-background z-10 py-1">
              {isSameDay(new Date(dateKey), new Date()) ? 'Today' : format(new Date(dateKey), 'MMM dd,yyyy')}
            </div>
            {groupedMessages[dateKey].map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2 mb-3",
                  message.senderId === currentUserId ? "justify-end" : "justify-start"
                )}
              >
                {/* Avatar for sender if not current user */}
                {message.senderId !== currentUserId && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(participantNames[message.senderId] || '??')}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col">
                  {/* Display sender's name above message bubble if in admin view OR if not current user */}
                  {(isAdminView || message.senderId !== currentUserId) && (
                    <p className={cn(
                      "text-xs text-muted-foreground mb-1",
                      message.senderId === currentUserId ? "text-right" : "text-left"
                    )}>
                      {message.senderId === currentUserId ? currentUserName : participantNames[message.senderId] || 'Loading...'}
                    </p>
                  )}
                  <div
                    className={cn(
                      "relative max-w-[70%] px-3 pt-3 pb-6 rounded-lg shadow-sm text-sm",
                      message.senderId === currentUserId
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
                    )}
                  >
                    <p className="break-words pr-16">{message.text}</p> {/* Changed pr-12 to pr-16 */}
                    <div className={cn(
                      "absolute bottom-1 right-1 flex items-center text-[0.6rem] text-white/80 dark:text-gray-300/80",
                      message.senderId === currentUserId ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                    )}>
                      <span className="ml-2">{format(message.timestamp.toDate(), 'hh:mm a')}</span>
                      {message.senderId === currentUserId && (
                        <span className="ml-1 flex items-center">
                          {message.status === 'sent' && <Check className="h-3 w-3" />}
                          {message.status === 'read' && <CheckCheck className="h-3 w-3 text-green-300" />} {/* Green for read */}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Avatar for current user */}
                {message.senderId === currentUserId && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(currentUserName)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </div>

      {/* Message Input */}
      {!isReadOnly && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-card flex items-center gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              // Removed maxRows prop as it's not supported by Shadcn's Textarea
              className="flex-1 resize-none overflow-hidden h-auto max-h-28" // Ensure it resizes
              disabled={sendingMessage}
            />
            <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessageText.trim()}>
              {sendingMessage ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }
