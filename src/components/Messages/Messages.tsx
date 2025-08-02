import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { MessageCircle, Send, User, Clock } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const { getUserMessages, markMessageAsRead, sendMessage, listings } = useData();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  if (!user) return null;

  const userMessages = getUserMessages(user.id);

  // Group messages by conversation (other user)
  const conversations = userMessages.reduce((acc, message) => {
    const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
    if (!acc[otherUserId]) {
      acc[otherUserId] = [];
    }
    acc[otherUserId].push(message);
    return acc;
  }, {} as Record<string, typeof userMessages>);

  // Sort conversations by latest message
  const sortedConversations = Object.entries(conversations).sort(([, messagesA], [, messagesB]) => {
    const latestA = Math.max(...messagesA.map(m => new Date(m.timestamp).getTime()));
    const latestB = Math.max(...messagesB.map(m => new Date(m.timestamp).getTime()));
    return latestB - latestA;
  });

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;

    sendMessage(selectedConversation, newMessage);
    setNewMessage('');
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
    // Mark messages as read
    conversations[userId]
      .filter(m => m.receiverId === user.id && !m.isRead)
      .forEach(m => markMessageAsRead(m.id));
  };

  const selectedMessages = selectedConversation ? conversations[selectedConversation] : [];
  const sortedSelectedMessages = selectedMessages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Connect with buyers and sellers</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sortedConversations.length > 0 ? (
                sortedConversations.map(([userId, messages]) => {
                  const latestMessage = messages.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  )[0];
                  const unreadCount = messages.filter(m => 
                    m.receiverId === user.id && !m.isRead
                  ).length;
                  
                  // Get other user's username from messages
                  const otherUserMessage = messages.find(m => m.senderId === userId);
                  const otherUsername = `User${userId.slice(-4)}`;

                  return (
                    <button
                      key={userId}
                      onClick={() => handleSelectConversation(userId)}
                      className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                        selectedConversation === userId ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {otherUsername.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{otherUsername}</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {latestMessage.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(latestMessage.timestamp).toLocaleDateString()}
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No conversations yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start messaging by contacting sellers in the marketplace
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Messages View */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      U
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">User{selectedConversation.slice(-4)}</h3>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {sortedSelectedMessages.map((message) => {
                    const isFromUser = message.senderId === user.id;
                    const listing = message.listingId ? listings.find(l => l.id === message.listingId) : null;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isFromUser 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          {listing && (
                            <div className="text-xs opacity-75 mb-1">
                              Re: {listing.title}
                            </div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isFromUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the left to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}