'use client';

import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Input } from '@/components/Input';
import { ArrowLeft, Lock, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Set admin session (in a real app, use proper authentication)
        sessionStorage.setItem('adminAuthenticated', 'true');
        router.push('/admin/dashboard');
      } else {
        const error = await response.json();
        setError(error.error || 'Invalid username or password');
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tracker
          </Button>
          
          <div className="flex justify-center">
            <div className="p-4 bg-orange-100 dark:bg-orange-900/50 rounded-2xl">
              <Lock className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Package className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Tracker Admin
            </h1>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                error={error}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            
            {/* <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Demo credentials:
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
