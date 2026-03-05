'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const len = password.length;
  const strength = len < 6 ? 'weak' : len <= 10 ? 'medium' : 'strong';
  const colors: Record<string, string> = { weak: 'bg-[#ff2d55]', medium: 'bg-yellow-400', strong: 'bg-[#00ff88]' };
  const widths: Record<string, string> = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' };
  return (
    <div className="mt-1.5">
      <div className="w-full bg-[#1e293b] rounded-full h-1">
        <div className={`${colors[strength]} ${widths[strength]} h-1 rounded-full transition-all duration-300`} />
      </div>
      <p className={`text-xs mt-1 ${strength === 'weak' ? 'text-[#ff2d55]' : strength === 'medium' ? 'text-yellow-400' : 'text-[#00ff88]'}`}>
        {strength.charAt(0).toUpperCase() + strength.slice(1)} password
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        setApiKey(data.apiKey || 'cs_live_xxxxxxxxxxxx');
        setTimeout(() => router.push('/dashboard'), 3000);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (apiKey) {
    return (
      <div className="bg-[#0d0d14] border border-[#1e293b] rounded-2xl p-8 w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-[#00ff88]/10 border border-[#00ff88] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-[#00ff88]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
        <p className="text-gray-400 text-sm mb-6">Save your API key — it won&apos;t be shown again.</p>
        <div className="bg-[#050508] border border-[#00ff88]/30 rounded-lg px-4 py-3 font-mono text-sm text-[#00ff88] break-all mb-4">
          {apiKey}
        </div>
        <p className="text-gray-500 text-xs">Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d14] border border-[#1e293b] rounded-2xl p-8 w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Shield className="w-7 h-7 text-[#00ff88]" />
        <span className="font-bold text-xl">
          <span className="text-white">Chain</span>
          <span className="text-[#00ff88]">Sentry</span>
        </span>
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">Create your account</h1>
      <p className="text-gray-500 text-sm text-center mb-8">Get your free API key in seconds.</p>

      {error && (
        <div className="bg-[#ff2d55]/10 border border-[#ff2d55]/30 text-[#ff2d55] rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1.5">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-[#050508] border border-[#1e293b] rounded-lg px-4 py-3 w-full text-[#e2e8f0] focus:border-[#00ff88] focus:outline-none placeholder-gray-600"
          />
        </div>
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
          <PasswordStrength password={password} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#00ff88] text-black w-full py-3 rounded-lg font-bold glow-green hover:bg-[#00ff88]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          )}
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#00ff88] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
