import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Property, PropertyType } from '../../types';
import { 
  fetchAllProperties, 
  savePropertyToSupabase, 
  removeSavedPropertyFromSupabase 
} from '../../services/propertyService';
import { PropertyListModal } from './PropertyListModal';
import { 
  Home, 
  Heart, 
  Plus, 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Filter, 
  Share2, 
  Phone, 
  Mail, 
  Sparkles, 
  Building, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Tag,
  Database,
  Copy,
  Check
} from 'lucide-react';

interface PropertiesSectionProps {
  onRequireLogin: (reason?: string) => void;
  onNavigateToProfile?: () => void;
}

export const PropertiesSection: React.FC<PropertiesSectionProps> = ({
  onRequireLogin,
  onNavigateToProfile
}) => {
  const { user, isAuthenticated, addNotification } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState<Property | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSqlSchemaModal, setShowSqlSchemaModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Load properties
  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllProperties(user?.id);
    setProperties(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Handle Like / Save Toggle (Only Logged-in Users)
  const handleToggleLike = async (property: Property, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      addNotification(
        'Login Required',
        'Please sign in with Supabase to save and bookmark properties to your account.',
        'warning'
      );
      onRequireLogin('Please log in with Supabase to save properties to your account.');
      return;
    }

    const currentlyLiked = property.isLiked;
    const newLikedState = !currentlyLiked;

    // Optimistic UI update
    setProperties(prev => prev.map(p => {
      if (p.id === property.id) {
        return {
          ...p,
          isLiked: newLikedState,
          likesCount: (p.likesCount || 0) + (newLikedState ? 1 : -1)
        };
      }
      return p;
    }));

    if (newLikedState) {
      await savePropertyToSupabase(user.id, property.id);
      addNotification(
        'Property Saved to Profile',
        `"${property.title}" was saved to your Supabase profile!`,
        'success'
      );
    } else {
      await removeSavedPropertyFromSupabase(user.id, property.id);
      addNotification(
        'Property Removed',
        `Removed "${property.title}" from your saved list.`,
        'info'
      );
    }
  };

  const handleOpenListModal = () => {
    if (!isAuthenticated || !user) {
      addNotification(
        'Authentication Required',
        'Please sign in with Supabase to list your property on the campus marketplace.',
        'warning'
      );
      onRequireLogin('Please log in with Supabase to list a property.');
      return;
    }
    setShowListModal(true);
  };

  // Filter properties
  const filteredProperties = properties.filter(prop => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'ALL' || prop.propertyType === selectedType;
    const matchesPrice = prop.price <= maxPrice;

    return matchesSearch && matchesType && matchesPrice;
  });

  const categories: { label: string; value: string }[] = [
    { label: 'All Housing', value: 'ALL' },
    { label: 'Apartments', value: 'Apartment' },
    { label: 'Studio Lofts', value: 'Studio' },
    { label: 'PG / Hostels', value: 'Shared PG / Hostel' },
    { label: 'Villas', value: 'Villa' },
    { label: 'Study Rooms', value: 'Study Room' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in">
      
      {/* Banner / Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-500/30">
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>Campus Student Housing & Real Estate Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Discover, Save & List <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              Verified Student Accommodations
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Live database synchronized with <strong>Supabase Auth & Database</strong>. Verified campus housing, student PGs, research studio lofts, and group apartments.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleOpenListModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>List Your Property</span>
            </button>

            {isAuthenticated && onNavigateToProfile && (
              <button
                onClick={onNavigateToProfile}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black backdrop-blur-md border border-white/10 flex items-center gap-2 transition-all"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>My Saved & Listed Properties</span>
              </button>
            )}

            <button
              onClick={() => setShowSqlSchemaModal(true)}
              className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Database className="w-4 h-4 text-sky-400" />
              <span>Supabase SQL Schema</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Search input & category pills */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by area, WiFi, near Gate 2, BHK..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedType(cat.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedType === cat.value
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Slider & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-slate-500 font-bold shrink-0">Max Budget:</span>
            <input
              type="range"
              min="3000"
              max="40000"
              step="1000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full sm:w-48 accent-blue-600 cursor-pointer"
            />
            <span className="font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-500/20">
              ₹{maxPrice.toLocaleString()}/mo
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <span>Showing <strong>{filteredProperties.length}</strong> available listings</span>
            {!isAuthenticated && (
              <span className="text-amber-500 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Log in to save / list</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="rounded-3xl bg-slate-100 dark:bg-slate-800/50 h-80 animate-pulse" />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Home className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No properties found matching criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters, budget slider, or be the first to list a new property in this area.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('ALL');
              setMaxPrice(40000);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <div
              key={property.id}
              onClick={() => {
                setSelectedPropertyDetail(property);
                setActiveImageIndex(0);
              }}
              className="group cursor-pointer rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                
                {/* Image Container with Like Button */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase border border-white/10">
                    {property.propertyType}
                  </div>

                  {/* LIKE / SAVE HEART BUTTON (Supabase Synced) */}
                  <button
                    onClick={(e) => handleToggleLike(property, e)}
                    title={property.isLiked ? "Saved to your profile" : "Save to Supabase profile"}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md active:scale-75 ${
                      property.isLiked
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-950/60 text-white hover:bg-rose-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${property.isLiked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white shadow-lg border border-slate-200/60 dark:border-slate-800">
                    <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">
                      ₹{property.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 ml-1">
                      /{property.pricePeriod || 'mo'}
                    </span>
                  </div>

                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </div>

                  {/* Specs: Bed, Bath, Sqft */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Bed className="w-3.5 h-3.5 text-blue-500" />
                      <span>{property.bedrooms} Bed</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Bath className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{property.bathrooms} Bath</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Maximize2 className="w-3.5 h-3.5 text-purple-500" />
                      <span>{property.areaSqft} sq.ft</span>
                    </div>
                  </div>

                  {/* Amenities Chips (Top 3) */}
                  <div className="flex flex-wrap gap-1">
                    {property.amenities.slice(0, 3).map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold"
                      >
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                </div>

              </div>

              {/* Card Footer: Owner Info & Action */}
              <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                    {property.ownerName.charAt(0)}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                    {property.ownerName}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 text-[11px] group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Property Details Modal */}
      {selectedPropertyDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header Image Gallery */}
            <div className="relative aspect-video max-h-80 w-full overflow-hidden bg-slate-950">
              <img
                src={selectedPropertyDetail.images[activeImageIndex] || selectedPropertyDetail.images[0]}
                alt={selectedPropertyDetail.title}
                className="w-full h-full object-cover"
              />

              {/* Close Button */}
              <button
                onClick={() => setSelectedPropertyDetail(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Like Button */}
              <button
                onClick={(e) => handleToggleLike(selectedPropertyDetail, e)}
                className={`absolute top-3 right-14 p-2 rounded-full backdrop-blur-md transition-all shadow-md z-10 ${
                  selectedPropertyDetail.isLiked
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-950/80 text-white hover:bg-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${selectedPropertyDetail.isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Image Navigation Arrows */}
              {selectedPropertyDetail.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev === 0 ? selectedPropertyDetail.images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev === selectedPropertyDetail.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image index counter */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold">
                {activeImageIndex + 1} / {selectedPropertyDetail.images.length}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {selectedPropertyDetail.propertyType}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {selectedPropertyDetail.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{selectedPropertyDetail.location}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    ₹{selectedPropertyDetail.price.toLocaleString()}
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    per {selectedPropertyDetail.pricePeriod || 'month'}
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bedrooms</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{selectedPropertyDetail.bedrooms} BHK</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bathrooms</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{selectedPropertyDetail.bathrooms} Bath</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Area</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{selectedPropertyDetail.areaSqft} sq.ft</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Property Overview
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPropertyDetail.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Included Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPropertyDetail.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>{amenity}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Owner / Contact Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-100 via-blue-50/50 to-slate-100 dark:from-slate-800/80 dark:via-blue-950/30 dark:to-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                    {selectedPropertyDetail.ownerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      Listed by: {selectedPropertyDetail.ownerName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedPropertyDetail.ownerEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {selectedPropertyDetail.ownerPhone && (
                    <a
                      href={`tel:${selectedPropertyDetail.ownerPhone}`}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Owner</span>
                    </a>
                  )}
                  <a
                    href={`mailto:${selectedPropertyDetail.ownerEmail}?subject=Inquiry regarding ${encodeURIComponent(selectedPropertyDetail.title)}`}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* List New Property Modal */}
      {showListModal && (
        <PropertyListModal
          isOpen={showListModal}
          onClose={() => setShowListModal(false)}
          onSuccess={(newProp) => {
            setProperties(prev => [newProp, ...prev]);
          }}
          onRequireLogin={() => onRequireLogin('Please log in with Supabase to list a property.')}
        />
      )}

      {/* Supabase SQL Schema Viewer Modal */}
      {showSqlSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-6">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Supabase SQL Database Schema
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tables, foreign keys, RLS security policies & seed rows for properties & saved likes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlSchemaModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                  Execute this SQL in your Supabase SQL Editor
                </span>
                <button
                  onClick={() => {
                    const sqlText = `-- Supabase Schema for SHOV Properties & Saved Likes
CREATE TABLE IF NOT EXISTS public.properties (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_name VARCHAR(128) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(32),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    price_period VARCHAR(32) DEFAULT 'month',
    location VARCHAR(255) NOT NULL,
    property_type VARCHAR(64) NOT NULL DEFAULT 'Apartment',
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    area_sqft INTEGER DEFAULT 500,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.saved_properties (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id VARCHAR(64) NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public properties are viewable by everyone" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own properties" ON public.properties FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own saved properties" ON public.saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save properties" ON public.saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove saved properties" ON public.saved_properties FOR DELETE USING (auth.uid() = user_id);`;
                    navigator.clipboard.writeText(sqlText);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-sky-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 select-all">
{`-- 1. PROPERTIES TABLE (Accommodations & Housing)
CREATE TABLE IF NOT EXISTS public.properties (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_name VARCHAR(128) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(32),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    price_period VARCHAR(32) DEFAULT 'month',
    location VARCHAR(255) NOT NULL,
    property_type VARCHAR(64) NOT NULL DEFAULT 'Apartment',
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    area_sqft INTEGER DEFAULT 500,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SAVED PROPERTIES (User Bookmarks / Likes)
CREATE TABLE IF NOT EXISTS public.saved_properties (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id VARCHAR(64) NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public properties are viewable by everyone" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own properties" ON public.properties FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own saved properties" ON public.saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save properties" ON public.saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove saved properties" ON public.saved_properties FOR DELETE USING (auth.uid() = user_id);`}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
