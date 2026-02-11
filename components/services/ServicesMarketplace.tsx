'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MapPin, DollarSign, Calendar } from 'lucide-react';
import { ServiceUploadDialog } from './ServiceUploadDialog';
import { ServiceBookingDialog } from './ServiceBookingDialog';

interface Service {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  price_type: string;
  price_amount: number;
  location: string;
  availability: string;
  image_url: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const categoryLabels: Record<string, string> = {
  studio_rental: 'Studio Rental',
  photographer: 'Photographer',
  talent: 'Talent',
  service_provider: 'Service Provider',
  production: 'Production',
  actor_model: 'Actor/Model',
  singer: 'Singer',
  other: 'Other Services',
};

export function ServicesMarketplace() {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, services]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchQuery.trim()) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categoryLabels[s.category]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };
  const getPriceDisplay = (service: Service) => {
    if (service.price_type === 'negotiable') return 'Negotiable';
    if (!service.price_amount) return 'Contact for price';
    
    const amount = `${service.price_amount} ZARYO`;
    switch (service.price_type) {
      case 'hourly': return `${amount}/hr`;
      case 'daily': return `${amount}/day`;
      case 'fixed': return amount;
      default: return amount;
    }
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-sm bg-[#6A7B92]" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6A7B92]">
              Services
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Services Marketplace
          </h1>
          <p className="text-[#6A7B92] text-sm font-medium mt-1.5">
            Discover and book professional services from creators
          </p>
        </div>
        <Button 
          onClick={() => setUploadDialogOpen(true)}
          className="bg-gradient-to-r from-[#6A7B92] to-[#6A7B92]/80 hover:from-[#6A7B92]/90 hover:to-[#6A7B92]/70 text-white font-bold px-6 py-2.5 h-auto rounded-xl shadow-lg shadow-[#6A7B92]/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Post Service
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6A7B92]/50" />
          <Input
            placeholder="Search services by title, description, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-[#6A7B92] focus:border-[#6A7B92]"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6A7B92] border-t-transparent mx-auto" />
            <p className="text-sm font-semibold text-[#6A7B92]">Loading services...</p>
          </div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No services found</h3>
          <p className="text-[#6A7B92] text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div 
              key={service.id} 
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#6A7B92]/40 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300"
            >
              {/* Service Image */}
              {service.image_url && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              )}
              
              {/* Service Content */}
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-gray-900 leading-tight truncate">
                      {service.title}
                    </h3>
                    <p className="text-xs font-medium text-[#6A7B92] mt-1">
                      by {service.profiles.full_name}
                    </p>
                  </div>
                  <Badge className="bg-[#6A7B92]/10 text-[#6A7B92] border-0 text-xs font-bold shrink-0">
                    {categoryLabels[service.category]}
                  </Badge>
                </div>

                {/* Description */}
                {service.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                )}
                
                {/* Service Details */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {service.location && (
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-[#6A7B92]" />
                      <span className="font-medium">{service.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-baseline gap-1.5">
                    <DollarSign className="h-4 w-4 text-[#A7D129]" />
                    <span className="text-lg font-black text-gray-900">
                      {getPriceDisplay(service)}
                    </span>
                  </div>

                  {service.availability && (
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#6A7B92]" />
                      {service.availability}
                    </div>
                  )}
                </div>

                {/* Book Button */}
                <Button 
                  className={`w-full h-11 rounded-xl font-bold transition-all ${
                    service.user_id === profile?.id
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-100 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#6A7B92] to-[#6A7B92]/80 hover:from-[#6A7B92]/90 hover:to-[#6A7B92]/70 text-white shadow-lg hover:shadow-[#6A7B92]/25 hover:scale-[1.02]'
                  }`}
                  onClick={() => handleBookService(service)}
                  disabled={service.user_id === profile?.id}
                >
                  {service.user_id === profile?.id ? 'Your Service' : 'Book Service'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ServiceUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={loadServices}
      />

      {selectedService && (
        <ServiceBookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          service={selectedService}
          onSuccess={() => {
            setBookingDialogOpen(false);
            loadServices();
          }}
        />
      )}
    </div>
  );
}
