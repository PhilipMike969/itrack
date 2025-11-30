'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent } from '@/components/Card';

export default function Home() {
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      setLoading(false);
      return;
    }

    // Basic validation for tracking ID format
    if (trackingId.length < 6) {
      setError('Please enter a valid tracking ID');
      setLoading(false);
      return;
    }

    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    router.push(`/track/${trackingId.trim()}`);
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: "url('/shipping.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-orange-900/70 backdrop-blur-[1px]"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full px-4 py-6">
          <div className="max-w-6xl mx-auto flex justify-center items-center">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-orange-400" />
              <h1 className="text-2xl font-bold text-white">
                Tracker
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-2xl">
                  <Search className="h-12 w-12 text-orange-300" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Track Your Package
              </h2>
              <p className="text-slate-200 text-lg">
                Enter your tracking ID to see real-time updates on your shipment's journey
              </p>
            </div>

            {/* Tracking Form */}
            <Card className="p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Tracking ID"
                  placeholder="Enter your tracking ID (e.g., TRK123456789)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  error={error}
                  className="text-center text-lg h-12"
                />
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Track Package
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                {/* <p className="text-sm text-slate-500">
                  Try demo tracking ID: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">TRK123456789</code>
                </p> */}
              </div>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <MapPin className="h-6 w-6 text-orange-300" />
                  </div>
                </div>
                <p className="text-sm text-slate-200">
                  Real-time Location
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-200">
                  Live Updates
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <Package className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-200">
                  Secure Tracking
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-4 py-6 text-center text-sm text-slate-300">
          <p>&copy; 2024 Tracker. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
