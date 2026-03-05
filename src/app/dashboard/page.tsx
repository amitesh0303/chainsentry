import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, LayoutDashboard, Key, BarChart2, Zap } from 'lucide-react';
import ApiKeyManager from '@/components/dashboard/ApiKeyManager';

const mockVerdicts = [
  { time: '2 min ago', chain: 'ethereum', address: '0x7a25...2488D', verdict: 'SAFE' },
  { time: '5 min ago', chain: 'bsc', address: '0xd8dA...6045e', verdict: 'THREAT' },
  { time: '12 min ago', chain: 'ethereum', address: '0x1f98...0010F', verdict: 'SAFE' },
  { time: '23 min ago', chain: 'polygon', address: '0xE592...7D4b5', verdict: 'SAFE' },
  { time: '1 hr ago', chain: 'ethereum', address: '0xA0b8...6eBc4', verdict: 'THREAT' },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as { id?: string }).id ?? '';

  return (
    <div className="min-h-screen bg-[#050508] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 min-h-screen bg-[#0d0d14] border-r border-[#1e293b] p-6 flex flex-col z-40">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <Shield className="w-6 h-6 text-[#00ff88]" />
          <span className="font-bold text-lg">
            <span className="text-white">Chain</span>
            <span className="text-[#00ff88]">Sentry</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
            { icon: Key, label: 'API Keys', href: '/dashboard/keys', active: false },
            { icon: BarChart2, label: 'Usage', href: '/dashboard/usage', active: false },
            { icon: Zap, label: 'Upgrade', href: '/pricing', active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? 'bg-[#00ff88]/10 text-[#00ff88]'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {session.user?.name || session.user?.email}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here&apos;s your security overview</p>
          </div>
          <span className="text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full px-3 py-1">
            FREE PLAN
          </span>
        </div>

        {/* Usage card */}
        <div className="bg-[#0d0d14] border border-[#1e293b] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Daily Usage</h2>
            <span className="text-sm text-gray-500">23 / 50 requests</span>
          </div>
          <div className="w-full bg-[#1e293b] rounded-full h-2">
            <div className="bg-[#00ff88] h-2 rounded-full" style={{ width: '46%' }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">46% of daily limit used</p>
        </div>

        {/* Recent Verdicts */}
        <div className="bg-[#0d0d14] border border-[#1e293b] rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">Recent Verdicts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left text-gray-500 font-medium pb-3">Time</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Chain</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Address</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {mockVerdicts.map((v, i) => (
                  <tr key={i} className="border-b border-[#1e293b]/50">
                    <td className="py-3 pr-4 text-gray-500">{v.time}</td>
                    <td className="py-3 pr-4 text-gray-400 capitalize">{v.chain}</td>
                    <td className="py-3 pr-4">
                      <code className="text-xs text-gray-400">{v.address}</code>
                    </td>
                    <td className="py-3">
                      {v.verdict === 'SAFE' ? (
                        <span className="bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 rounded px-2 py-1 text-xs font-medium">
                          SAFE
                        </span>
                      ) : (
                        <span className="bg-[#ff2d55]/10 text-[#ff2d55] border border-[#ff2d55]/30 rounded px-2 py-1 text-xs font-medium">
                          THREAT
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Keys */}
        <ApiKeyManager userId={userId} />
      </main>
    </div>
  );
}
