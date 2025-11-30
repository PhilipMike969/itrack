'use client';

import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Input } from '@/components/Input';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Tracking, TrackingFormData } from '@/types';
import {
  AlertTriangle,
  Clock,
  Edit,
  Eye,
  Filter,
  LogOut,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<Tracking | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; estimatedDelivery?: string }>({
    name: '',
    estimatedDelivery: ''
  });
  const [formData, setFormData] = useState<TrackingFormData>({
    name: '',
    startLocation: '',
    endLocation: '',
    stopovers: [''],
    userName: '',
    userEmail: '',
    userPhone: '',
    imageUrl: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<TrackingFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const router = useRouter();

  // Check authentication and load data
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    fetchTrackings();
  }, [router]);

  const fetchTrackings = async () => {
    try {
      const response = await fetch('/api/tracking');
      if (response.ok) {
        const data = await response.json();
        setTrackings(data);
      }
    } catch (error) {
      console.error('Error fetching trackings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    router.push('/admin/login');
  };

  const handleViewTracking = (trackingId: string) => {
    router.push(`/track/${trackingId}`);
  };

  const validateForm = (): boolean => {
    const errors: Partial<TrackingFormData> = {};

    if (!formData.name.trim()) errors.name = 'Package name is required';
    if (!formData.startLocation.trim()) errors.startLocation = 'Start location is required';
    if (!formData.endLocation.trim()) errors.endLocation = 'End location is required';
    if (!formData.userName.trim()) errors.userName = 'Customer name is required';
    if (!formData.userEmail.trim()) errors.userEmail = 'Customer email is required';
    if (!formData.userPhone.trim()) errors.userPhone = 'Customer phone is required';
    
    // Email validation
    if (formData.userEmail && !/\S+@\S+\.\S+/.test(formData.userEmail)) {
      errors.userEmail = 'Please enter a valid email';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
        setImagePreview(data.imageUrl);
      } else {
        const error = await response.json();
        console.error('Upload failed:', error);
        alert('Failed to upload image: ' + error.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP).');
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 10MB.');
        return;
      }

      handleImageUpload(file);
    }
  };

  const handleCreateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          stopovers: formData.stopovers.filter(s => s.trim()),
        }),
      });

      if (response.ok) {
        const newTracking = await response.json();
        setTrackings([newTracking, ...trackings]);
        setShowCreateForm(false);
        
        // Reset form
        setFormData({
          name: '',
          startLocation: '',
          endLocation: '',
          stopovers: [''],
          userName: '',
          userEmail: '',
          userPhone: '',
          imageUrl: '',
        });
        setImagePreview('');
        setFormErrors({});
      } else {
        const error = await response.json();
        console.error('Error creating tracking:', error);
      }
    } catch (error) {
      console.error('Error creating tracking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (trackingId: string, status: string, currentLocationIndex?: number) => {
    try {
      const response = await fetch('/api/admin/update-tracking', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: trackingId, status, currentLocationIndex }),
      });

      if (response.ok) {
        fetchTrackings(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  const handleEditProgress = (tracking: Tracking) => {
    setSelectedTracking(tracking);
    setShowProgressModal(true);
  };

  const handleEditTracking = (tracking: Tracking) => {
    setSelectedTracking(tracking);
    setEditFormData({
      name: tracking.name,
      estimatedDelivery: tracking.estimatedDelivery ? new Date(tracking.estimatedDelivery).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleDeleteTracking = (tracking: Tracking) => {
    setSelectedTracking(tracking);
    setShowDeleteModal(true);
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTracking) return;
    
    setSubmitting(true);
    
    try {
      const updateData: any = {
        name: editFormData.name.trim()
      };

      if (editFormData.estimatedDelivery) {
        updateData.estimatedDelivery = editFormData.estimatedDelivery; // Send as date string, API will convert
      }

      const response = await fetch(`/api/tracking/${selectedTracking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedTracking = await response.json();
        setTrackings(trackings.map(t => t.id === selectedTracking.id ? updatedTracking : t));
        setShowEditModal(false);
        setSelectedTracking(null);
      } else {
        const error = await response.json();
        console.error('Error updating tracking:', error);
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTracking) return;
    
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/tracking/${selectedTracking.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTrackings(trackings.filter(t => t.id !== selectedTracking.id));
        setShowDeleteModal(false);
        setSelectedTracking(null);
      } else {
        const error = await response.json();
        console.error('Error deleting tracking:', error);
      }
    } catch (error) {
      console.error('Error deleting tracking:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateProgress = async (currentLocationIndex: number, status: string) => {
    if (!selectedTracking) return;
    
    await handleUpdateStatus(selectedTracking.id, status, currentLocationIndex);
    setShowProgressModal(false);
    setSelectedTracking(null);
  };

  const addStopover = () => {
    setFormData(prev => ({
      ...prev,
      stopovers: [...prev.stopovers, '']
    }));
  };

  const updateStopover = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      stopovers: prev.stopovers.map((stopover, i) => i === index ? value : stopover)
    }));
  };

  const removeStopover = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stopovers: prev.stopovers.filter((_, i) => i !== index)
    }));
  };

  const filteredTrackings = filterStatus === 'all' 
    ? trackings 
    : trackings.filter(tracking => tracking.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950">
        <div className="animate-spin h-8 w-8 border-4 border-orange-200 border-t-orange-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage trackings and monitor shipments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => fetchTrackings()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Tracking
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {trackings.length}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-purple-900/30 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {trackings.filter(t => t.status === 'in-progress').length}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {trackings.filter(t => t.status === 'completed').length}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {trackings.filter(t => t.status === 'pending').length}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Create Form Modal */}
        { showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Create New Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTracking} className="space-y-4">
                  <Input
                    label="Package Name"
                    placeholder="e.g., Electronics Package"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    error={formErrors.name}
                  />

                  {/* Image Upload */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Product Image (Optional)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        disabled={uploadingImage}
                      />
                      {uploadingImage && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full" />
                          <span>Uploading image...</span>
                        </div>
                      )}
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Start Location"
                      placeholder="e.g., New York Warehouse"
                      value={formData.startLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, startLocation: e.target.value }))}
                      error={formErrors.startLocation}
                    />
                    <Input
                      label="End Location"
                      placeholder="e.g., Customer Address"
                      value={formData.endLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, endLocation: e.target.value }))}
                      error={formErrors.endLocation}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Stopovers (Optional)
                    </label>
                    {formData.stopovers.map((stopover, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                          placeholder={`Stopover ${index + 1}`}
                          value={stopover}
                          onChange={(e) => updateStopover(index, e.target.value)}
                          className="flex-1"
                        />
                        {formData.stopovers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeStopover(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addStopover}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stopover
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Customer Information</h4>
                    <Input
                      label="Customer Name"
                      placeholder="John Doe"
                      value={formData.userName}
                      onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                      error={formErrors.userName}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.userEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, userEmail: e.target.value }))}
                        error={formErrors.userEmail}
                      />
                      <Input
                        label="Phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.userPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, userPhone: e.target.value }))}
                        error={formErrors.userPhone}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                          Creating...
                        </>
                      ) : (
                        'Create Tracking'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Edit Modal */}
        { showProgressModal && selectedTracking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm max-h-[90dvh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span>Edit Progress</span>
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedTracking.name} • {selectedTracking.id}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                      Current Location in Route
                    </label>
                    
                    {/* Route Timeline */}
                    <div className="space-y-3">
                      {[
                        { name: selectedTracking.startLocation.name, type: 'start', index: 0 },
                        ...selectedTracking.stopovers.map((stopover, index) => ({
                          name: stopover.name,
                          type: 'stopover',
                          index: index + 1
                        })),
                        { name: selectedTracking.endLocation.name, type: 'end', index: selectedTracking.stopovers.length + 1 }
                      ].map((location, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              const newStatus = index === selectedTracking.stopovers.length + 1 ? 'completed' : 'in-progress';
                              handleUpdateProgress(index, newStatus);
                            }}
                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                              index <= selectedTracking.currentLocationIndex
                                ? 'bg-orange-600 border-orange-600 text-white'
                                : 'border-slate-300 bg-white text-slate-400 hover:border-orange-400 hover:bg-orange-50'
                            }`}
                          >
                            {index < selectedTracking.currentLocationIndex ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="text-xs font-medium">{index + 1}</span>
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${
                              index <= selectedTracking.currentLocationIndex
                                ? 'text-slate-900 dark:text-slate-100'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {location.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                              {location.type} {location.type === 'stopover' ? `#${index}` : ''}
                            </div>
                          </div>
                          
                          {index === selectedTracking.currentLocationIndex && (
                            <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                              <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                              <span>Current</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Status
                    </label>
                    <select
                      value={selectedTracking.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as Tracking['status'];
                        handleUpdateProgress(selectedTracking.currentLocationIndex, newStatus);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900/70 backdrop-blur-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>Tip:</strong> Click on any location in the route above to set it as the current location. 
                      The package will be marked as "in progress" automatically, or "completed" if you select the final destination.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProgressModal(false);
                      setSelectedTracking(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Tracking Modal */}
        {showEditModal && selectedTracking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5 text-orange-600" />
                  <span>Edit Tracking</span>
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedTracking.id}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateTracking} className="space-y-4">
                  <Input
                    label="Package Name"
                    placeholder="e.g., Electronics Package"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Estimated Delivery Date (Optional)"
                    type="date"
                    value={editFormData.estimatedDelivery}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  />

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Note:</strong> To edit locations or customer information, you'll need to create a new tracking 
                      as these details affect the tracking system integrity.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedTracking(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                          Updating...
                        </>
                      ) : (
                        'Update Tracking'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedTracking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Delete Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Are you sure you want to delete this tracking? This action cannot be undone.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {selectedTracking.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      ID: {selectedTracking.id}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Customer: {selectedTracking.user.name} ({selectedTracking.user.email})
                    </p>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>Warning:</strong> The customer will no longer be able to track this package once deleted.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedTracking(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              All Trackings ({filteredTrackings.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white/70 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900/70 backdrop-blur-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trackings Table */}
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardContent className="-mx-6">
            { filteredTrackings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  {filterStatus === 'all' ? 'No trackings found' : `No ${filterStatus} trackings found`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Tracking ID</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Package</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Route</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    { filteredTrackings.map((tracking) => (
                      <tr key={tracking.id} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <code className="text-sm font-mono bg-slate-100/70 dark:bg-slate-800/70 px-2 py-1 rounded">
                            {tracking.id}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{tracking.name.length > 20 ? `${tracking.name.slice(0, 20)}...` : tracking.name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{tracking.user.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{tracking.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                            <MapPin className="h-3 w-3" />
                            <span>{tracking.startLocation.name}</span>
                            <span>→</span>
                            <span>{tracking.endLocation.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(tracking.status)}`}>
                            {tracking.status.replace('-', '')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(tracking.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTracking(tracking.id)}
                              title="View Tracking"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTracking(tracking)}
                              title="Edit Tracking"
                              className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProgress(tracking)}
                              title="Edit Progress"
                              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                            >
                              <MapPin className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTracking(tracking)}
                              title="Delete Tracking"
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <select
                              value={tracking.status}
                              onChange={(e) => handleUpdateStatus(tracking.id, e.target.value as Tracking['status'])}
                              className="rounded border border-slate-300 bg-white/70 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900/70"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
