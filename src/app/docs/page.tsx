'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Shield, Copy, Check } from 'lucide-react';

function CopyBtn({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#00ff88] transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b]">
        <span className="text-xs text-gray-500">{language || 'bash'}</span>
        <CopyBtn code={code} />
      </div>
      <pre className="p-4 text-sm font-mono text-[#e2e8f0] overflow-x-auto leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const sidebarSections = [
  { label: 'Overview', href: '#overview' },
  { label: 'Authentication', href: '#auth' },
  { label: 'POST /v1/check', href: '#check' },
  { label: 'GET /v1/token/:chain/:addr', href: '#token' },
  { label: 'GET /v1/status', href: '#status' },
  { label: 'GET /v1/usage', href: '#usage' },
  { label: 'Webhooks', href: '#webhooks' },
  { label: 'SDKs', href: '#sdks' },
  { label: 'Rate Limits', href: '#rate-limits' },
  { label: 'Changelog', href: '#changelog' },
];

const rateLimits = [
  { plan: 'Free', day: '50', min: '5' },
  { plan: 'Pro', day: '10,000', min: '100' },
  { plan: 'Scale', day: '50,000', min: '500' },
  { plan: 'Enterprise', day: 'Unlimited', min: 'Custom' },
];

const requestFields = [
  { field: 'chain', type: 'string', required: true, desc: 'Chain identifier (ethereum, bsc, polygon, arbitrum, optimism, base)' },
  { field: 'to', type: 'string', required: true, desc: 'Target contract or wallet address' },
  { field: 'from', type: 'string', required: false, desc: 'Sender wallet address (improves analysis)' },
  { field: 'data', type: 'string', required: false, desc: 'Transaction calldata (hex-encoded)' },
  { field: 'value', type: 'string', required: false, desc: 'ETH value in wei (as string to avoid precision loss)' },
];

export default function DocsPage() {
  const [chain, setChain] = useState('ethereum');
  const [toAddr, setToAddr] = useState('');
  const [fromAddr, setFromAddr] = useState('');
  const [tryResult, setTryResult] = useState<string | null>(null);

  const handleTry = (e: React.FormEvent) => {
    e.preventDefault();
    setTryResult(
      JSON.stringify(
        {
          verdict: 'SAFE',
          score: 12,
          threats: { honeypot: false, rugPull: 0.12, mev: false },
          latencyMs: 8,
        },
        null,
        2
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#050508] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-[#0d0d14] border-r border-[#1e293b] p-6 overflow-y-auto z-40 flex flex-col">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Shield className="w-6 h-6 text-[#00ff88]" />
          <span className="font-bold text-base">
            <span className="text-white">Chain</span>
            <span className="text-[#00ff88]">Sentry</span>
          </span>
        </Link>

        <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest mb-3">API Reference</p>
        <nav className="flex flex-col gap-0.5">
          {sidebarSections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="text-sm text-gray-500 hover:text-[#00ff88] py-1.5 px-2 rounded hover:bg-[#00ff88]/5 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 p-8 max-w-4xl">
        {/* Overview */}
        <section id="overview" className="mb-16 scroll-mt-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">API Documentation</h1>
          <p className="text-gray-400 mb-6 leading-relaxed">
            The ChainSentry API provides pre-execution blockchain transaction security analysis. Submit a transaction
            and receive a verdict — <span className="text-[#00ff88]">SAFE</span>,{' '}
            <span className="text-yellow-400">WARN</span>, or{' '}
            <span className="text-[#ff2d55]">THREAT</span> — in milliseconds.
          </p>
          <p className="text-gray-500 text-sm mb-3">Base URL</p>
          <CodeBlock code="https://api.chainsentry.io/v1" language="text" />
        </section>

        {/* Authentication */}
        <section id="auth" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold gradient-text mb-4">Authentication</h2>
          <p className="text-gray-400 mb-4">
            Authenticate requests using a Bearer token in the <code className="text-[#00d4ff] bg-[#0d1117] px-1.5 py-0.5 rounded text-sm">Authorization</code> header.
            You can generate API keys from your{' '}
            <Link href="/dashboard" className="text-[#00ff88] hover:underline">dashboard</Link>.
          </p>
          <CodeBlock code={'Authorization: Bearer cs_live_xxxxxxxxxxxx'} language="http" />
          <div className="bg-[#ff2d55]/5 border border-[#ff2d55]/20 rounded-lg px-4 py-3 text-sm text-gray-400">
            ⚠️ Never expose your API key in client-side code. Always use environment variables and server-side requests.
          </div>
        </section>

        {/* POST /v1/check */}
        <section id="check" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold gradient-text mb-2">POST /v1/check</h2>
          <p className="text-gray-400 mb-6">Analyze a transaction for threats before execution.</p>

          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Request Body</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Field</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Type</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Required</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {requestFields.map((f) => (
                  <tr key={f.field} className="border-b border-[#1e293b]/50">
                    <td className="py-2.5 pr-4">
                      <code className="text-[#00d4ff] text-xs">{f.field}</code>
                    </td>
                    <td className="py-2.5 pr-4">
                      <code className="text-gray-400 text-xs">{f.type}</code>
                    </td>
                    <td className="py-2.5 pr-4 text-xs">
                      {f.required ? (
                        <span className="text-[#00ff88]">required</span>
                      ) : (
                        <span className="text-gray-600">optional</span>
                      )}
                    </td>
                    <td className="py-2.5 text-gray-400 text-xs">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Response Schema</h3>
          <CodeBlock
            code={`{
  "verdict": "SAFE" | "THREAT" | "WARN",
  "score": 0-100,           // 0 = safe, 100 = critical threat
  "threats": {
    "honeypot": boolean,
    "rugPull": number,      // 0.0 - 1.0 probability
    "mev": boolean,
    "drainer": boolean,
    "tax": { "buy": number, "sell": number },
    "blacklisted": boolean,
    "similarExploit": boolean,
    "maliciousApproval": boolean
  },
  "latencyMs": number
}`}
            language="json"
          />

          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Example Request</h3>
          <CodeBlock
            code={`curl -X POST https://api.chainsentry.io/v1/check \\
  -H "Authorization: Bearer cs_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chain": "ethereum",
    "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "from": "0xYourWalletAddress",
    "value": "1000000000000000000"
  }'`}
          />

          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Example Response</h3>
          <CodeBlock
            code={`{
  "verdict": "SAFE",
  "score": 12,
  "threats": {
    "honeypot": false,
    "rugPull": 0.12,
    "mev": false,
    "drainer": false,
    "blacklisted": false
  },
  "latencyMs": 8
}`}
            language="json"
          />

          {/* Try It */}
          <div className="bg-[#0d0d14] border border-[#1e293b] rounded-xl p-6 mt-6">
            <h3 className="font-semibold text-white mb-4">🧪 Try It</h3>
            <form onSubmit={handleTry} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Chain</label>
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  className="bg-[#050508] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:border-[#00ff88] focus:outline-none w-full"
                >
                  {['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">To Address</label>
                <input
                  type="text"
                  value={toAddr}
                  onChange={(e) => setToAddr(e.target.value)}
                  placeholder="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
                  className="bg-[#050508] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:border-[#00ff88] focus:outline-none w-full placeholder-gray-600 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">From Address (optional)</label>
                <input
                  type="text"
                  value={fromAddr}
                  onChange={(e) => setFromAddr(e.target.value)}
                  placeholder="0xYourWalletAddress"
                  className="bg-[#050508] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:border-[#00ff88] focus:outline-none w-full placeholder-gray-600 font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-[#00ff88] text-black px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#00ff88]/90 transition-colors self-start"
              >
                Run Check
              </button>
            </form>
            {tryResult && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Response:</p>
                <pre className="bg-[#0d1117] border border-[#1e293b] rounded-lg p-4 text-sm text-[#00ff88] overflow-x-auto">
                  <code>{tryResult}</code>
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* GET /v1/token */}
        <section id="token" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold gradient-text mb-2">GET /v1/token/:chain/:addr</h2>
          <p className="text-gray-400 mb-4">Retrieve threat analysis for a specific token contract address.</p>
          <CodeBlock code="GET /v1/token/ethereum/0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" language="http" />
        </section>

        {/* GET /v1/status */}
        <section id="status" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold gradient-text mb-2">GET /v1/status</h2>
          <p className="text-gray-400 mb-4">Check API health and uptime.</p>
          <CodeBlock code={`{ "status": "ok", "version": "1.0.0", "uptimeMs": 3600000 }`} language="json" />
        </section>

        {/* GET /v1/usage */}
        <section id="usage" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold gradient-text mb-2">GET /v1/usage</h2>
          <p className="text-gray-400 mb-4">Retrieve your current usage statistics for the billing period.</p>
          <CodeBlock
            code={`{
  "plan": "pro",
  "requestsToday": 423,
  "dailyLimit": 10000,
  "requestsThisMonth": 9847,
  "resetAt": "2025-02-01T00:00:00Z"
}`}
            language="json"
          />
        </section>

        {/* Webhooks */}
        <section id="webhooks" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold gradient-text mb-2">Webhooks</h2>
          <p className="text-gray-400 mb-4">
            Register a webhook URL to receive real-time THREAT notifications when your checks detect malicious transactions.
          </p>
          <CodeBlock
            code={`POST /v1/webhook/register
{
  "url": "https://your-app.com/webhook",
  "events": ["THREAT", "WARN"],
  "secret": "your-signing-secret"
}`}
            language="json"
          />
        </section>

        {/* SDKs */}
        <section id="sdks" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold gradient-text mb-2">SDKs</h2>
          <p className="text-gray-400 mb-6">Official client libraries for faster integration.</p>

          <h3 className="text-sm font-semibold text-gray-300 mb-2">JavaScript / TypeScript</h3>
          <CodeBlock code="npm install @chainsentry/sdk" />

          <h3 className="text-sm font-semibold text-gray-300 mb-2">LangChain Tool</h3>
          <CodeBlock code="npm install @chainsentry/langchain" />

          <h3 className="text-sm font-semibold text-gray-300 mb-2">Python</h3>
          <CodeBlock code="pip install chainsentry" />
        </section>

        {/* Rate Limits */}
        <section id="rate-limits" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold gradient-text mb-4">Rate Limits</h2>
          <p className="text-gray-400 mb-6">
            Rate limits are applied per API key. Exceeding the limit returns a{' '}
            <code className="text-[#ff2d55] bg-[#0d1117] px-1.5 py-0.5 rounded text-sm">429 Too Many Requests</code>{' '}
            response with a <code className="text-[#00d4ff] bg-[#0d1117] px-1.5 py-0.5 rounded text-sm">Retry-After</code> header.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left text-gray-500 font-medium pb-3 pr-8">Plan</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-8">Requests / Day</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Requests / Min</th>
                </tr>
              </thead>
              <tbody>
                {rateLimits.map((r) => (
                  <tr key={r.plan} className="border-b border-[#1e293b]/50">
                    <td className="py-3 pr-8 text-white font-medium">{r.plan}</td>
                    <td className="py-3 pr-8 text-[#00ff88]">{r.day}</td>
                    <td className="py-3 text-[#00d4ff]">{r.min}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Changelog */}
        <section id="changelog" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold gradient-text mb-6">Changelog</h2>
          <div className="flex flex-col gap-6">
            {[
              { version: 'v1.2.0', date: '2025-01-15', changes: ['Added Optimism and Base chain support', 'MEV detector v2 with sandwich attack identification', 'Webhook notification system'] },
              { version: 'v1.1.0', date: '2025-01-01', changes: ['Python SDK released', 'LangChain tool wrapper', 'Usage analytics endpoint'] },
              { version: 'v1.0.0', date: '2024-12-01', changes: ['Initial release', '6 threat detectors', 'Ethereum, BSC, Polygon, Arbitrum support'] },
            ].map((entry) => (
              <div key={entry.version} className="border-l-2 border-[#00ff88]/30 pl-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-bold text-[#00ff88]">{entry.version}</span>
                  <span className="text-xs text-gray-600">{entry.date}</span>
                </div>
                <ul className="flex flex-col gap-1">
                  {entry.changes.map((c) => (
                    <li key={c} className="text-gray-400 text-sm">• {c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
