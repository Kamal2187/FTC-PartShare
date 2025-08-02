import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ShoppingBag, DollarSign, Star, MessageCircle, TrendingUp, Package } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { listings, getUserTransactions } = useData();

  if (!user) return null;

  const userTransactions = getUserTransactions(user.id);
  const userListings = listings.filter(l => l.sellerId === user.id);
  const purchasedItems = userTransactions.filter(t => t.buyerId === user.id);
  const soldItems = userTransactions.filter(t => t.sellerId === user.id);

  const stats = [
    {
      title: 'Available Credits',
      value: user.credits,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Items Listed',
      value: userListings.length,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Items Purchased',
      value: purchasedItems.length,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Items Sold',
      value: soldItems.length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentTransactions = userTransactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.username}! Here's your activity overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const listing = listings.find(l => l.id === transaction.listingId);
                const isPurchase = transaction.buyerId === user.id;
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isPurchase ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {isPurchase ? (
                          <ShoppingBag className={`w-5 h-5 ${isPurchase ? 'text-red-600' : 'text-green-600'}`} />
                        ) : (
                          <DollarSign className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{listing?.title || 'Unknown Item'}</p>
                        <p className="text-sm text-gray-600">
                          {isPurchase ? 'Purchased' : 'Sold'} • {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isPurchase ? 'text-red-600' : 'text-green-600'}`}>
                        {isPurchase ? '-' : '+'}{transaction.amount} credits
                      </p>
                      {transaction.rating && (
                        <div className="flex items-center justify-end mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{transaction.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Start buying or selling to see your activity here</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Active Listings</h2>
          {userListings.filter(l => l.isAvailable).length > 0 ? (
            <div className="space-y-4">
              {userListings.filter(l => l.isAvailable).slice(0, 5).map((listing) => (
                <div key={listing.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{listing.title}</p>
                    <p className="text-sm text-gray-600">{listing.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{listing.price} credits</p>
                    <p className="text-sm text-gray-500">Listed {new Date(listing.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active listings</p>
              <p className="text-sm text-gray-500 mt-1">Create your first listing to start selling</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <ShoppingBag className="w-8 h-8 mb-2" />
            <h3 className="font-semibold mb-1">Browse Marketplace</h3>
            <p className="text-sm opacity-90">Find parts and services for your robot</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <Package className="w-8 h-8 mb-2" />
            <h3 className="font-semibold mb-1">Create Listing</h3>
            <p className="text-sm opacity-90">Sell your robotics parts and services</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <MessageCircle className="w-8 h-8 mb-2" />
            <h3 className="font-semibold mb-1">Connect with Sellers</h3>
            <p className="text-sm opacity-90">Message other teams about listings</p>
          </div>
        </div>
      </div>
    </div>
  );
}