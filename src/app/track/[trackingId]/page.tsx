'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, Mail, Phone, Clock, MapPin } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { TrackingTimeline } from '@/components/TrackingTimeline';
import { Tracking } from '@/types';

interface TrackingPageProps {
  params: Promise<{
    trackingId: string;
  }>;
}

export default function TrackingPage({ params }: TrackingPageProps) {
  const router = useRouter();
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string>('');

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const resolvedParams = await params;
        setTrackingId(resolvedParams.trackingId);
        
        const response = await fetch(`/api/tracking/${resolvedParams.trackingId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Tracking data received:', data); // Debug log
          console.log('Image URL:', data.imageUrl); // Debug log
          setTracking(data);
        } else if (response.status === 404) {
          setError('Tracking not found');
        } else {
          setError('Failed to load tracking information');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [params]);

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundImage: 'url(/shipping.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 via-purple-800/70 to-blue-900/80"></div>
        <Card className="w-full max-w-md p-6 text-center animate-fade-in relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-orange-200/50">
          <div className="flex justify-center mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-orange-200 border-t-orange-600 rounded-full"></div>
          </div>
          <p className="text-orange-700 dark:text-orange-300">Loading tracking information...</p>
        </Card>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundImage: 'url(/shipping.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 via-purple-800/70 to-blue-900/80"></div>
        <Card className="w-full max-w-md p-6 text-center animate-fade-in relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-orange-200/50">
          <div className="flex justify-center mb-4">
            <Package className="h-16 w-16 text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Tracking Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || `The tracking ID "${trackingId}" was not found in our system.`}
          </p>
          <Button onClick={handleBack} variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/shipping.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/70 via-purple-800/60 to-blue-900/70"></div>
      
      {/* Header */}
      <header className="relative z-10 w-full px-4 py-6 border-b border-orange-200/30 bg-white/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-orange-200" />
              <h1 className="text-xl font-semibold text-white">
                Tracker
              </h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-200">Tracking ID</p>
            <p className="font-mono text-sm font-medium text-white bg-white/20 px-2 py-1 rounded">
              {tracking.id}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Package Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Package Status */}
            <Card className="animate-fade-in bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-orange-200/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-orange-900 dark:text-orange-100">{tracking.name}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(tracking.status)} border border-current/20`}>
                    {tracking.status.replace('-', ' ')}
                  </span>
                </CardTitle>
                {tracking.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={tracking.imageUrl}
                      alt={tracking.name}
                      className="w-full h-48 object-cover rounded-lg border border-orange-200/50"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-orange-600 dark:text-orange-300 mb-1">Created</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{formatDate(tracking.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-orange-600 dark:text-orange-300 mb-1">Last Updated</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{formatDate(tracking.updatedAt)}</p>
                  </div>
                  {tracking.estimatedDelivery && (
                    <div className="col-span-2">
                      <p className="text-orange-600 dark:text-orange-300 mb-1">Estimated Delivery</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <p className="font-medium text-orange-700 dark:text-orange-300">
                          {formatDate(tracking.estimatedDelivery)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card className="animate-fade-in bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-orange-200/50" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span className="text-orange-900 dark:text-orange-100">Package Journey</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrackingTimeline tracking={tracking} />
              </CardContent>
            </Card>
          </div>

          {/* Customer Info */}
          <div className="space-y-6">
            <Card className="animate-fade-in bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-orange-200/50" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-orange-600" />
                  <span className="text-orange-900 dark:text-orange-100">Customer Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-300 mb-1">Name</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{tracking.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-300 mb-1">Email</p>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-orange-400" />
                    <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{tracking.user.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-300 mb-1">Phone</p>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-orange-400" />
                    <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{tracking.user.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Summary */}
            <Card className="animate-fade-in bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-orange-200/50" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="text-orange-900 dark:text-orange-100">Route Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-300 mb-1">From</p>
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{tracking.startLocation.name}</p>
                </div>
                {tracking.stopovers.length > 0 && (
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-300 mb-1">Via</p>
                    <div className="space-y-1">
                      {tracking.stopovers.map((stopover, index) => (
                        <p key={stopover.id} className="font-medium text-sm text-slate-800 dark:text-slate-200">
                          {index + 1}. {stopover.name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-300 mb-1">To</p>
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{tracking.endLocation.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
