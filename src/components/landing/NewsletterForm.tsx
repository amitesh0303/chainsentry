'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-[#00ff88] text-sm font-medium">
        ✓ Thanks for subscribing!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="bg-[#050508] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-gray-600 focus:border-[#00ff88] focus:outline-none flex-1 min-w-0"
      />
      <button
        type="submit"
        className="bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00ff88]/90 transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
