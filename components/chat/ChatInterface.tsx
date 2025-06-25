// components/chat/ChatInterface.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, UserCircle, Loader2, ArrowLeftCircle } from 'lucide-react';
import { db } from '@/config/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, doc, setDoc } from 'firebase/firestore'; // Added doc and setDoc
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

// Define a type for a single message
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  text: string;
  timestamp: Timestamp;
}

interface ChatInterfaceProps {
  conversationId: string;
  chatPartnerId: string;
  chatPartnerName: string;
  currentUserId: string; 
  currentUserName: string;
  onCloseChat: () => void;
  isReadOnly?: boolean;
}

export default function ChatInterface({
  conversationId,
  chatPartnerId,
  chatPartnerName,
  currentUserId,
  currentUserName,
  onCloseChat,
  isReadOnly = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // messagesEndRef is now used again for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to fetch and listen for messages in real-time
  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setError("Could not establish chat. Missing conversation ID or user ID.");
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    setError(null);

    const messagesCollectionRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({
          id: doc.id,
          ...doc.data() as Omit<Message, 'id'>,
        });
      });
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again.");
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [conversationId, currentUserId]);

  // Re-added the useEffect that handles automatic scrolling to messagesEndRef
  useEffect(() => {
    // Small delay to ensure render is complete before scrolling
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);


  const handleSendMessage = async () => {
    if (!newMessage.trim() || isReadOnly) {
      return;
    }

    setSendingMessage(true);
    setError(null);

    try {
      const messageData: Omit<Message, 'id'> = {
        senderId: currentUserId,
        receiverId: chatPartnerId,
        senderName: currentUserName,
        receiverName: chatPartnerName,
        text: newMessage.trim(),
        timestamp: Timestamp.now(),
      };

      const messagesCollectionRef = collection(db, 'conversations', conversationId, 'messages');
      await addDoc(messagesCollectionRef, messageData);

      const conversationDocRef = doc(db, 'conversations', conversationId);
      await setDoc(conversationDocRef, {
        participants: [currentUserId, chatPartnerId].sort(),
        lastMessage: newMessage.trim(),
        lastMessageTimestamp: Timestamp.now(),
        participantNames: {
          [currentUserId]: currentUserName,
          [chatPartnerId]: chatPartnerName,
        }
      }, { merge: true });

      setNewMessage('');
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(`Failed to send message: ${err.message || "Unknown error."}`);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isReadOnly) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loadingMessages) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-2 text-lg">Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-500">
        <p className="text-center p-4">{error}</p>
        <Button onClick={onCloseChat} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCloseChat}
          className="mr-2 md:hidden"
        >
          <ArrowLeftCircle className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-semibold flex-1">Chat with {chatPartnerName}</h2>
        <UserCircle className="h-8 w-8 text-blue-500 dark:text-blue-400" />
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">Start your conversation with {chatPartnerName}!</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex flex-col max-w-[70%] md:max-w-[60%] p-3 rounded-lg shadow-md ${
                  message.senderId === currentUserId
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                }`}
              >
                <span className={`text-xs ${message.senderId === currentUserId ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'} font-medium mb-1`}>
                  {message.senderId === currentUserId ? 'You' : message.senderName}
                </span>
                <p className="text-sm break-words">
                  {message.text}
                </p>
                <span className={`text-xs mt-1 self-end ${message.senderId === currentUserId ? 'text-blue-300' : 'text-gray-400 dark:text-gray-500'}`}>
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} /> {/* Element is here and automatically scrolled to */}
      </div>

      {/* Message Input */}
      {!isReadOnly && (
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-md flex-shrink-0 rounded-b-lg md:rounded-t-none">
          <textarea
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none overflow-y-auto text-sm max-h-28"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            disabled={sendingMessage}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim() || sendingMessage}
          >
            {sendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      )}
      {isReadOnly && (
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-md flex-shrink-0 rounded-b-lg md:rounded-t-none">
          <p className="text-muted-foreground text-sm">Read-only view for administrators.</p>
        </div>
      )}
    </div>
  );
}
