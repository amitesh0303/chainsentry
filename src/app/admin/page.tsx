import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, Activity, Key, LayoutDashboard } from 'lucide-react';

const statCards = [
  { label: 'Total Users', value: '1,247', icon: Users, color: 'text-[#00ff88]' },
  { label: 'Total Requests', value: '847,293', icon: Activity, color: 'text-[#00d4ff]' },
  { label: 'Blocked Transactions', value: '12,847', icon: Shield, color: 'text-[#ff2d55]' },
  { label: 'Active API Keys', value: '3,891', icon: Key, color: 'text-[#00ff88]' },
];

const mockLogs = [
  { userId: 'usr_abc123', endpoint: '/v1/check', verdict: 'SAFE', latencyMs: 8, timestamp: '2025-01-15 14:23:01' },
  { userId: 'usr_def456', endpoint: '/v1/check', verdict: 'THREAT', latencyMs: 12, timestamp: '2025-01-15 14:22:47' },
  { userId: 'usr_ghi789', endpoint: '/v1/token', verdict: 'SAFE', latencyMs: 6, timestamp: '2025-01-15 14:22:31' },
  { userId: 'usr_jkl012', endpoint: '/v1/check', verdict: 'WARN', latencyMs: 45, timestamp: '2025-01-15 14:22:18' },
  { userId: 'usr_mno345', endpoint: '/v1/check', verdict: 'SAFE', latencyMs: 9, timestamp: '2025-01-15 14:21:55' },
  { userId: 'usr_pqr678', endpoint: '/v1/status', verdict: '-', latencyMs: 2, timestamp: '2025-01-15 14:21:40' },
  { userId: 'usr_stu901', endpoint: '/v1/check', verdict: 'THREAT', latencyMs: 18, timestamp: '2025-01-15 14:21:27' },
  { userId: 'usr_vwx234', endpoint: '/v1/check', verdict: 'SAFE', latencyMs: 7, timestamp: '2025-01-15 14:21:10' },
  { userId: 'usr_yza567', endpoint: '/v1/token', verdict: 'SAFE', latencyMs: 11, timestamp: '2025-01-15 14:20:58' },
  { userId: 'usr_bcd890', endpoint: '/v1/check', verdict: 'THREAT', latencyMs: 15, timestamp: '2025-01-15 14:20:42' },
];

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-[#050508] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 min-h-screen bg-[#0d0d14] border-r border-[#1e293b] p-6 flex flex-col z-40">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <Shield className="w-6 h-6 text-[#ff2d55]" />
          <span className="font-bold text-lg">
            <span className="text-white">Chain</span>
            <span className="text-[#ff2d55]">Admin</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {[
            { icon: LayoutDashboard, label: 'Overview', href: '/admin', active: true },
            { icon: Users, label: 'Users', href: '/admin/users', active: false },
            { icon: Activity, label: 'Logs', href: '/admin/logs', active: false },
            { icon: Key, label: 'API Keys', href: '/admin/keys', active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? 'bg-[#ff2d55]/10 text-[#ff2d55]'
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">System overview and usage logs</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="card-dark rounded-xl p-6 relative">
              <card.icon className={`w-5 h-5 ${card.color} absolute top-4 right-4 opacity-60`} />
              <div className={`text-3xl font-bold ${card.color} mb-1`}>{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="bg-[#0d0d14] border border-[#1e293b] rounded-xl p-8 text-center text-gray-500 mb-6">
          📊 Charts coming soon
        </div>

        {/* Usage log table */}
        <div className="bg-[#0d0d14] border border-[#1e293b] rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">Recent Usage Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left text-gray-500 font-medium pb-3">User ID</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Endpoint</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Verdict</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Latency</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {mockLogs.map((log, i) => (
                  <tr key={i} className="border-b border-[#1e293b]/50">
                    <td className="py-3 pr-4">
                      <code className="text-xs text-gray-400">{log.userId}</code>
                    </td>
                    <td className="py-3 pr-4">
                      <code className="text-xs text-[#00d4ff]">{log.endpoint}</code>
                    </td>
                    <td className="py-3 pr-4">
                      {log.verdict === 'SAFE' && (
                        <span className="bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 rounded px-2 py-1 text-xs">SAFE</span>
                      )}
                      {log.verdict === 'THREAT' && (
                        <span className="bg-[#ff2d55]/10 text-[#ff2d55] border border-[#ff2d55]/30 rounded px-2 py-1 text-xs">THREAT</span>
                      )}
                      {log.verdict === 'WARN' && (
                        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded px-2 py-1 text-xs">WARN</span>
                      )}
                      {log.verdict === '-' && (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{log.latencyMs}ms</td>
                    <td className="py-3 text-gray-500 text-xs">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
