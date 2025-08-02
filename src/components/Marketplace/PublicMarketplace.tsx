import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import ListingCard from './ListingCard';
import ListingModal from './ListingModal';
import SearchFilters from './SearchFilters';
import { Listing } from '../../contexts/DataContext';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function PublicMarketplace() {
  const { listings } = useData();
  const { login } = useAuth();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });

  const categories = Array.from(new Set(listings.map(l => l.category)));

  const filteredListings = listings.filter(listing => {
    if (!listing.isAvailable) return false;
    
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || listing.category === selectedCategory;
    const matchesPrice = listing.price >= priceRange.min && listing.price <= priceRange.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Robotics Marketplace</h1>
          <p className="text-gray-600 mt-2">Discover robotics parts and services from the community</p>
        </div>
        
        <button
          onClick={() => login()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          Sign in to List Items
        </button>
      </div>

      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
      />

      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredListings.length} of {listings.filter(l => l.isAvailable).length} available items
        </p>
      </div>

      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={setSelectedListing}
              isPublic
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory ? 
              'Try adjusting your search filters to find more items.' : 
              'No listings are available at the moment.'
            }
          </p>
        </div>
      )}

      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          isPublic
        />
      )}
    </div>
  );
} 