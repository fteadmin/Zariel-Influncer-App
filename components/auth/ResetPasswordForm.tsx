'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Check if we have a valid session (means user clicked reset link)
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setValidToken(true);
        } else {
          setError('Invalid or expired reset link. Please request a new one.');
        }
      } catch (err) {
        setError('Failed to verify reset link.');
      } finally {
        setCheckingToken(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#A7D129] mx-auto" />
          <p className="text-gray-600 font-medium">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!validToken && !checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border-2 border-gray-200 shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4 py-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Invalid Reset Link</h3>
                <p className="text-gray-600">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <div className="pt-4">
                <Link href="/auth/forgot-password">
                  <Button className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#A7D129] to-[#95c51f] hover:from-[#95c51f] hover:to-[#A7D129] text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    Request New Link
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#A7D129]/20 to-[#95c51f]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-[#6A7B92]/15 to-[#5a6a7e]/10 rounded-full blur-3xl"
        />
      </div>

      {/* Animated SVG Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M 0 300 Q 400 100 800 300 T 1600 300"
          stroke="url(#gradient1)"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A7D129" />
            <stop offset="100%" stopColor="#6A7B92" />
          </linearGradient>
        </defs>
      </svg>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-8 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A7D129] to-[#6A7B92] rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-black text-white">Z</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black bg-gradient-to-r from-[#6A7B92] to-[#A7D129] bg-clip-text text-transparent leading-tight">
                Zariel & Co
              </span>
              <span className="text-xs font-bold text-gray-500 leading-tight">
                Influencer Marketplace
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Reset Password Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/90 backdrop-blur-xl border-2 border-gray-200 shadow-2xl">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-3xl font-black text-gray-900">Set New Password</CardTitle>
              <CardDescription className="text-base text-gray-600">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 py-6"
                >
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Password Reset Successful!</h3>
                    <p className="text-gray-600">
                      Your password has been updated. Redirecting to login...
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="animate-slide-in-left">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 text-base border-2 border-gray-200 focus:border-[#A7D129] focus:ring-2 focus:ring-[#A7D129]/20 transition-all rounded-xl"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 text-base border-2 border-gray-200 focus:border-[#A7D129] focus:ring-2 focus:ring-[#A7D129]/20 transition-all rounded-xl"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#A7D129] to-[#95c51f] hover:from-[#95c51f] hover:to-[#A7D129] text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <Link href="/auth/login" className="text-sm text-gray-600 hover:text-[#A7D129] font-semibold transition-colors">
                      ← Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-6"
        >
          <Link href="/" className="text-sm text-gray-600 hover:text-[#A7D129] font-semibold transition-colors">
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
