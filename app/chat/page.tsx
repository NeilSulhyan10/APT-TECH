// app/chat/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/authContext'; // Your AuthContext hook
import { db } from '@/config/firebase'; // Your Firebase client SDK instance
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Users, User, ArrowLeft, XCircle } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface'; // New component we'll create
import ConversationList from '@/components/chat/ConversationList'; // New component we'll create
import ExpertListForChat from '@/components/chat/ExpertListForChat'; // New component we'll create
import { Separator } from '@/components/ui/separator';

// Define the shape of a conversation item for lists
export interface ConversationItem {
  id: string; // conversationId
  lastMessage: string;
  lastMessageTimestamp: any; // Firebase Timestamp
  otherParticipantId: string;
  otherParticipantName: string;
  participants: string[];
}

export interface ExpertForChat {
  id: string; // Expert UID
  name: string;
  role: string;
  initials: string;
  color: string;
}

export default function ChatPage() {
  // Destructure only essential auth state directly from useAuth
  const { user, userData, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to manage which chat is currently open
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState<string | null>(null);
  const [selectedChatPartnerName, setSelectedChatPartnerName] = useState<string | null>(null);

  const currentUserId = user?.uid;
  const currentUserName = userData?.firstName && userData?.lastName
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.firstName || userData?.email || 'You';

  // Derive roles locally from userData
  const isStudent = userData?.role === 'student';
  const isExpert = userData?.role === 'expert';
  const isAdmin = userData?.role === 'admin'; // Assuming 'admin' is the role for administrators

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        console.warn("Unauthenticated access attempt to chat. Redirecting to login.");
        router.push('/login');
        return;
      }
      setLoadingPage(false); // Auth is loaded, user is authenticated
    }
  }, [authLoading, isAuthenticated, router]);

  // Handle selection of an existing conversation
  const handleSelectConversation = (conversation: ConversationItem) => {
    setSelectedConversationId(conversation.id);
    setSelectedChatPartnerId(conversation.otherParticipantId);
    setSelectedChatPartnerName(conversation.otherParticipantName);
  };

  // Handle selection of an expert to start a new chat
  const handleSelectExpertToChat = (expert: ExpertForChat) => {
    // Generate conversation ID for this pair
    const convoId = currentUserId && expert.id ? [currentUserId, expert.id].sort().join('_') : null;
    if (convoId) {
      setSelectedConversationId(convoId);
      setSelectedChatPartnerId(expert.id);
      setSelectedChatPartnerName(expert.name);
    } else {
      setError("Failed to start chat. User or expert ID missing.");
    }
  };

  // Clear the currently selected chat
  const handleCloseChat = () => {
    setSelectedConversationId(null);
    setSelectedChatPartnerId(null);
    setSelectedChatPartnerName(null);
  };

  if (loadingPage || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-muted-foreground">Loading chat application...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4 text-red-500">
        <XCircle className="h-12 w-12 mb-4" />
        <p className="text-center text-lg mb-4">{error}</p>
        <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
      </div>
    );
  }

  if (!isAuthenticated || !currentUserId || !currentUserName) {
    // This state should ideally be caught by the useEffect above and redirected
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4 text-muted-foreground">
        <p>You must be logged in to access the chat.</p>
        <Button onClick={() => router.push('/login')} className="mt-4">Login</Button>
      </div>
    );
  }

  return (
    // The main container now has explicit height and flex properties
    <div className="container mx-auto p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar for Conversation List / Expert List */}
      <Card className={`flex-shrink-0 ${selectedConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 flex-col overflow-hidden h-full`}> {/* Added h-full here */}
        <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5" /> Chats
          </CardTitle>
        </CardHeader>
        {/* Added min-h-0 to CardContent for correct flex behavior */}
        <CardContent className="flex-1 p-0 overflow-y-auto custom-scrollbar min-h-0">
          {/* Render content based on role */}
          {isAdmin ? (
            <ConversationList
              currentUserId={currentUserId}
              onSelectConversation={handleSelectConversation}
              isAdminView={true} // Indicate admin view for different data fetching
            />
          ) : (
            <div className="flex flex-col h-full">
              {isStudent && (
                <>
                  <h3 className="text-md font-semibold px-4 pt-4">Start New Chat</h3>
                  <ExpertListForChat onSelectExpert={handleSelectExpertToChat} currentUserId={currentUserId} />
                  <Separator className="my-2" />
                </>
              )}
              <h3 className="text-md font-semibold px-4 pt-4">My Conversations</h3>
              <ConversationList
                currentUserId={currentUserId}
                onSelectConversation={handleSelectConversation}
                isAdminView={false}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Chat Interface */}
      <Card className={`flex-1 ${selectedConversationId ? 'flex' : 'hidden md:flex'} flex-col h-full`}> {/* Added h-full here */}
        {selectedConversationId && selectedChatPartnerId && selectedChatPartnerName ? (
          <ChatInterface
            conversationId={selectedConversationId}
            chatPartnerId={selectedChatPartnerId}
            chatPartnerName={selectedChatPartnerName}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onCloseChat={handleCloseChat} // Allow closing the chat on mobile
            isReadOnly={isAdmin} // Admins get read-only access
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <MessageSquare className="h-20 w-20 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">Select a conversation or an expert to start chatting.</p>
            {!isAdmin && (
                <p className="text-sm mt-2">
                    {isStudent ? "Choose an expert from 'Start New Chat' or resume an existing conversation." : "Select a conversation from the left to reply to a student."}
                </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
