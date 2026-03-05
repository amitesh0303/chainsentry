'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password.');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="bg-[#0d0d14] border border-[#1e293b] rounded-2xl p-8 w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Shield className="w-7 h-7 text-[#00ff88]" />
        <span className="font-bold text-xl">
          <span className="text-white">Chain</span>
          <span className="text-[#00ff88]">Sentry</span>
        </span>
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">Sign in to ChainSentry</h1>
      <p className="text-gray-500 text-sm text-center mb-8">Welcome back. Enter your credentials to continue.</p>

      {error && (
        <div className="bg-[#ff2d55]/10 border border-[#ff2d55]/30 text-[#ff2d55] rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="bg-[#050508] border border-[#1e293b] rounded-lg px-4 py-3 w-full text-[#e2e8f0] focus:border-[#00ff88] focus:outline-none placeholder-gray-600"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="bg-[#050508] border border-[#1e293b] rounded-lg px-4 py-3 w-full text-[#e2e8f0] focus:border-[#00ff88] focus:outline-none placeholder-gray-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#00ff88] text-black w-full py-3 rounded-lg font-bold glow-green hover:bg-[#00ff88]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          )}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#1e293b]" />
        <span className="text-xs text-gray-600">or</span>
        <div className="flex-1 h-px bg-[#1e293b]" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full py-3 rounded-lg border border-[#1e293b] text-[#e2e8f0] hover:border-[#00ff88] transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#00ff88] hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
