'use client';
import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  active: boolean;
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'Default Key',
    prefix: 'cs_live_xxxx',
    createdAt: '2025-01-01',
    lastUsed: '2 hours ago',
    active: true,
  },
];

export default function ApiKeyManager({ userId }: { userId: string }) {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  // userId is used to scope key management (included for API integration)
  void userId;

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      prefix: `cs_live_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      active: true,
    };
    setKeys((prev) => [...prev, newKey]);
    setNewKeyName('');
    setCreating(false);
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div className="bg-[#0d0d14] border border-[#1e293b] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white text-lg">API Keys</h3>
        <button
          onClick={() => setCreating((c) => !c)}
          className="flex items-center gap-2 bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00ff88]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Key
        </button>
      </div>

      {creating && (
        <div className="flex gap-2 mb-4 p-4 bg-[#050508] border border-[#1e293b] rounded-lg">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex-1 bg-transparent border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:border-[#00ff88] focus:outline-none placeholder-gray-600"
          />
          <button
            onClick={handleCreate}
            className="bg-[#00ff88] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00ff88]/90 transition-colors"
          >
            Create
          </button>
          <button
            onClick={() => { setCreating(false); setNewKeyName(''); }}
            className="text-gray-500 hover:text-white px-2 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e293b]">
              <th className="text-left text-gray-500 font-medium pb-3">Key</th>
              <th className="text-left text-gray-500 font-medium pb-3">Name</th>
              <th className="text-left text-gray-500 font-medium pb-3 hidden sm:table-cell">Created</th>
              <th className="text-left text-gray-500 font-medium pb-3 hidden md:table-cell">Last Used</th>
              <th className="text-right text-gray-500 font-medium pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-[#1e293b]/50 hover:bg-white/[0.02]">
                <td className="py-3 pr-4">
                  <code className="text-[#00ff88] text-xs bg-[#00ff88]/10 px-2 py-1 rounded">
                    {key.prefix}...
                  </code>
                </td>
                <td className="py-3 pr-4 text-[#e2e8f0]">{key.name}</td>
                <td className="py-3 pr-4 text-gray-500 hidden sm:table-cell">{key.createdAt}</td>
                <td className="py-3 pr-4 text-gray-500 hidden md:table-cell">{key.lastUsed}</td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="flex items-center gap-1.5 text-xs text-[#ff2d55] border border-[#ff2d55]/30 px-3 py-1.5 rounded hover:bg-[#ff2d55]/10 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-600 text-sm">
                  No API keys. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
