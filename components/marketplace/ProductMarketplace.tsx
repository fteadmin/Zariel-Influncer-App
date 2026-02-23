'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Package, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_tokens: number;
  category: string;
  stock_quantity: number;
  status: string;
  product_number?: string;
  admin: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function ProductMarketplace() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, categoryFilter, products]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`/api/products?category=all`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load products');
      }
      
      console.log('Products loaded:', data.products); // Debug log
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error: any) {
      console.error('Error loading products:', error); // Debug log
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    if (!profile) {
      toast({
        title: 'Error',
        description: 'Please log in to make a purchase',
        variant: 'destructive',
      });
      return;
    }

    if (profile.token_balance < product.price_tokens) {
      toast({
        title: 'Insufficient Tokens',
        description: `You need ${product.price_tokens} Zaryo tokens but only have ${profile.token_balance}`,
        variant: 'destructive',
      });
      return;
    }

    if (product.stock_quantity === 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently out of stock',
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(product.id);
    try {
      const response = await fetch('/api/products/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          buyer_id: profile.id,
          quantity: 1
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase product');
      }

      // Show detailed success message
      toast({
        title: '🎉 Purchase Successful!',
        description: `You successfully purchased "${product.title}" for ${data.tokens_paid} Zaryo tokens. Your new balance will be updated shortly.`,
        duration: 5000, // Show for 5 seconds
      });

      // Refresh the page to update token balance and product stock
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Wait 2 seconds before refresh to let user see the message

    } catch (error: any) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Something went wrong during the purchase. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getStockDisplay = (stock: number) => {
    if (stock === -1) return 'In Stock';
    if (stock === 0) return 'Out of Stock';
    return `${stock} left`;
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock > 0 && stock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#A7D129] mx-auto" />
          <p className="text-sm font-semibold text-[#6A7B92]">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-sm bg-[#A7D129]" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6A7B92]">
              Marketplace
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Product Store
          </h1>
          <p className="text-[#6A7B92] text-sm font-medium mt-1.5">
            Discover exclusive products and redeem with your Zaryo tokens
          </p>
        </div>
        {profile && (
          <div className="bg-gradient-to-br from-[#A7D129] to-[#A7D129]/80 rounded-2xl px-6 py-4 shadow-lg shadow-[#A7D129]/20">
            <div className="text-xs font-bold text-white/80 mb-1">Your Balance</div>
            <div className="text-2xl font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              {profile.token_balance || 0} Zaryo
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      {products.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6A7B92]/50" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-gray-50 border-gray-200 rounded-xl focus:ring-[#A7D129] focus:border-[#A7D129]"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 h-11 bg-gray-50 border-gray-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="games">Games</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {searchQuery || categoryFilter !== 'all' ? 'No products found' : 'No products available'}
          </h3>
          <p className="text-[#6A7B92] text-sm">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Check back later for new products'}
          </p>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#A7D129]/40 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300"
            >
              {/* Product Image */}
              {product.image_url && (
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              )}
              
              {/* Product Content */}
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {product.product_number && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6A7B92]/10 text-[#6A7B92] mb-1">
                        {product.product_number}
                      </span>
                    )}
                    <h3 className="text-lg font-black text-gray-900 leading-tight truncate">
                      {product.title}
                    </h3>
                    <p className="text-xs font-medium text-[#6A7B92] mt-1">
                      By {product.admin.full_name}
                    </p>
                  </div>
                  <Badge className="bg-[#6A7B92]/10 text-[#6A7B92] border-0 text-xs font-bold">
                    {product.category}
                  </Badge>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                )}
                
                {/* Price & Stock */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-gray-900">
                      {product.price_tokens}
                    </span>
                    <span className="text-xs font-bold text-[#A7D129] uppercase tracking-wider">
                      Zaryo
                    </span>
                  </div>
                  <div className={`text-xs font-bold ${getStockColor(product.stock_quantity)}`}>
                    {getStockDisplay(product.stock_quantity)}
                  </div>
                </div>

                {/* Purchase Button */}
                <Button 
                  className={`w-full h-11 rounded-xl font-bold transition-all ${
                    product.stock_quantity === 0 || !profile || (profile?.token_balance || 0) < product.price_tokens
                      ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-[#A7D129] text-white shadow-lg hover:shadow-[#A7D129]/25 hover:scale-[1.02]'
                  }`}
                  onClick={() => handlePurchase(product)}
                  disabled={
                    !profile || 
                    purchasing === product.id || 
                    product.stock_quantity === 0 ||
                    (profile?.token_balance || 0) < product.price_tokens
                  }
                >
                  {purchasing === product.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock_quantity === 0 
                        ? 'Out of Stock' 
                        : !profile 
                        ? 'Login to Purchase'
                        : (profile.token_balance || 0) < product.price_tokens
                        ? 'Insufficient Tokens'
                        : 'Purchase Now'}
                    </>
                  )}
                </Button>
                {purchasing === product.id && (
                  <p className="text-xs text-center text-[#6A7B92] -mt-2">
                    ⚠️ Please wait, processing your purchase...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}