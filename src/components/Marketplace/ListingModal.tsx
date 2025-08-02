import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Listing, Transaction } from '../../contexts/DataContext';
import { X, User, Clock, MessageCircle, ShoppingCart, Star, AlertTriangle } from 'lucide-react';

interface ListingModalProps {
  listing: Listing;
  onClose: () => void;
  isPublic?: boolean;
}

export default function ListingModal({ listing, onClose, isPublic }: ListingModalProps) {
  const { user, updateCredits, login } = useAuth();
  const { purchaseItem, sendMessage, getUserTransactions, addRating } = useData();
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const userTransactions = user ? getUserTransactions(user.id) : [];
  const purchaseTransaction = user ? userTransactions.find(
    t => t.listingId === listing.id && t.buyerId === user.id
  ) : undefined;
  const hasAlreadyPurchased = !!purchaseTransaction;
  const canRate = hasAlreadyPurchased && !purchaseTransaction?.rating;
  const isOwnListing = user ? listing.sellerId === user.id : false;
  const canAfford = user ? user.credits >= listing.price : false;

  const handlePurchase = () => {
    if (purchaseItem(listing.id)) {
      updateCredits(-listing.price);
      setShowPurchaseConfirm(false);
      onClose();
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(listing.sellerId, message, listing.id);
      setMessage('');
      setShowMessageForm(false);
    }
  };

  const handleSubmitRating = () => {
    if (rating > 0 && purchaseTransaction) {
      addRating(purchaseTransaction.id, rating, review);
      setShowRatingForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Listing Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="aspect-video mb-6 rounded-lg overflow-hidden">
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{listing.price}</p>
                  <p className="text-sm text-gray-600">credits</p>
                </div>
              </div>
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {listing.category}
              </span>
            </div>

            <p className="text-gray-700 leading-relaxed">{listing.description}</p>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{listing.sellerUsername}</p>
                  <p className="text-sm text-gray-600">Seller</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Listed {timeAgo(listing.createdAt)}</span>
                </div>
              </div>
            </div>

            {!isPublic && hasAlreadyPurchased && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-medium">You purchased this item</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Purchased on {new Date(purchaseTransaction.timestamp).toLocaleDateString()}
                </p>
                {purchaseTransaction.rating && (
                  <div className="mt-3 p-3 bg-white rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= purchaseTransaction.rating!
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {purchaseTransaction.review && (
                      <p className="text-sm text-gray-700">{purchaseTransaction.review}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isPublic && !canAfford && !isOwnListing && !hasAlreadyPurchased && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Insufficient credits</span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  You need {listing.price - (user?.credits || 0)} more credits to purchase this item.
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              {isPublic ? (
                <button
                  onClick={() => login()}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Sign in to Purchase</span>
                </button>
              ) : (
                <>
                  {!isOwnListing && !hasAlreadyPurchased && listing.isAvailable && (
                    <button
                      onClick={() => setShowPurchaseConfirm(true)}
                      disabled={!canAfford}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Buy Now</span>
                    </button>
                  )}

                  {!isOwnListing && (
                    <button
                      onClick={() => setShowMessageForm(true)}
                      className="bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Message</span>
                    </button>
                  )}

                  {canRate && (
                    <button
                      onClick={() => setShowRatingForm(true)}
                      className="bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                    >
                      <Star className="w-5 h-5" />
                      <span>Rate</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Purchase Confirmation Modal */}
        {showPurchaseConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Purchase</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to purchase "{listing.title}" for {listing.price} credits?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handlePurchase}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Confirm Purchase
                </button>
                <button
                  onClick={() => setShowPurchaseConfirm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Form Modal */}
        {showMessageForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Send Message</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32"
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowMessageForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Form Modal */}
        {showRatingForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Rate This Purchase</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-400'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review (Optional)</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitRating}
                  disabled={rating === 0}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Rating
                </button>
                <button
                  onClick={() => setShowRatingForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}