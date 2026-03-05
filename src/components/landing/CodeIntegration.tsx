'use client';
import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b]">
        <span className="text-xs text-gray-500">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#00ff88] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-5 text-sm font-mono leading-6 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const jsCode = `import { ChainSentry } from "@chainsentry/sdk";
import { Tool } from "langchain/tools";

const sentry = new ChainSentry({ apiKey: process.env.CHAINSENTRY_API_KEY });

const checkTxSafety = new Tool({
  name: "check_transaction_safety",
  description: "Check if a blockchain transaction is safe before execution",
  func: async (txJson: string) => {
    const tx = JSON.parse(txJson);
    const result = await sentry.check(tx);
    return JSON.stringify(result);
  },
});`;

const pythonCode = `from chainsentry import ChainSentry
import os

sentry = ChainSentry(api_key=os.environ["CHAINSENTRY_API_KEY"])

class TransactionSafetyTool:
    name = "check_transaction_safety"
    description = "Validates blockchain transactions before execution"
    
    def run(self, transaction: dict) -> dict:
        result = sentry.check(
            chain=transaction["chain"],
            to=transaction["to"],
        )
        return result`;

const curlCode = `curl -X POST https://api.chainsentry.io/v1/check \\
  -H "Authorization: Bearer cs_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"chain": "ethereum", "to": "0x7a250...", "value": "1000000000000000000"}'

# Response:
# { "verdict": "SAFE", "score": 12, "latencyMs": 8 }`;

function JsCodeContent() {
  return (
    <div className="relative bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b]">
        <span className="text-xs text-gray-500">JavaScript / TypeScript</span>
        <CopyBtn code={jsCode} />
      </div>
      <pre className="p-5 text-sm font-mono leading-6 overflow-x-auto">
        <code>
          <span style={{ color: '#a78bfa' }}>import</span>
          {' '}
          <span style={{ color: '#e2e8f0' }}>{'{ ChainSentry }'}</span>
          {' '}
          <span style={{ color: '#a78bfa' }}>from</span>
          {' '}
          <span style={{ color: '#00ff88' }}>&quot;@chainsentry/sdk&quot;</span>
          {';'}<br />
          <span style={{ color: '#a78bfa' }}>import</span>
          {' '}
          <span style={{ color: '#e2e8f0' }}>{'{ Tool }'}</span>
          {' '}
          <span style={{ color: '#a78bfa' }}>from</span>
          {' '}
          <span style={{ color: '#00ff88' }}>&quot;langchain/tools&quot;</span>
          {';'}<br />
          <br />
          <span style={{ color: '#a78bfa' }}>const</span>
          {' '}
          <span style={{ color: '#e2e8f0' }}>sentry</span>
          {' = '}
          <span style={{ color: '#a78bfa' }}>new</span>
          {' '}
          <span style={{ color: '#00d4ff' }}>ChainSentry</span>
          {'({ '}
          <span style={{ color: '#00d4ff' }}>apiKey</span>
          {': process.env.'}
          <span style={{ color: '#00d4ff' }}>CHAINSENTRY_API_KEY</span>
          {' });'}<br />
          <br />
          <span style={{ color: '#a78bfa' }}>const</span>
          {' '}
          <span style={{ color: '#e2e8f0' }}>checkTxSafety</span>
          {' = '}
          <span style={{ color: '#a78bfa' }}>new</span>
          {' '}
          <span style={{ color: '#00d4ff' }}>Tool</span>
          {'({'}<br />
          {'  '}
          <span style={{ color: '#00d4ff' }}>name</span>
          {': '}
          <span style={{ color: '#00ff88' }}>&quot;check_transaction_safety&quot;</span>
          {','}<br />
          {'  '}
          <span style={{ color: '#00d4ff' }}>description</span>
          {': '}
          <span style={{ color: '#00ff88' }}>&quot;Check if a blockchain transaction is safe before execution&quot;</span>
          {','}<br />
          {'  '}
          <span style={{ color: '#00d4ff' }}>func</span>
          {': '}
          <span style={{ color: '#a78bfa' }}>async</span>
          {' (txJson: '}
          <span style={{ color: '#00d4ff' }}>string</span>
          {') => {'}<br />
          {'    '}
          <span style={{ color: '#a78bfa' }}>const</span>
          {' tx = JSON.'}
          <span style={{ color: '#00d4ff' }}>parse</span>
          {'(txJson);'}<br />
          {'    '}
          <span style={{ color: '#a78bfa' }}>const</span>
          {' result = '}
          <span style={{ color: '#a78bfa' }}>await</span>
          {' sentry.'}
          <span style={{ color: '#00d4ff' }}>check</span>
          {'(tx);'}<br />
          {'    '}
          <span style={{ color: '#a78bfa' }}>return</span>
          {' JSON.'}
          <span style={{ color: '#00d4ff' }}>stringify</span>
          {'(result);'}<br />
          {'  },'}
          <br />
          {'});'}
        </code>
      </pre>
    </div>
  );
}

function PythonCodeContent() {
  return (
    <div className="relative bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b]">
        <span className="text-xs text-gray-500">Python</span>
        <CopyBtn code={pythonCode} />
      </div>
      <pre className="p-5 text-sm font-mono leading-6 overflow-x-auto">
        <code>
          <span style={{ color: '#a78bfa' }}>from</span>
          {' chainsentry '}
          <span style={{ color: '#a78bfa' }}>import</span>
          {' ChainSentry'}<br />
          <span style={{ color: '#a78bfa' }}>import</span>
          {' os'}<br />
          <br />
          {'sentry = '}
          <span style={{ color: '#00d4ff' }}>ChainSentry</span>
          {'(api_key=os.environ['}
          <span style={{ color: '#00ff88' }}>&quot;CHAINSENTRY_API_KEY&quot;</span>
          {'])'}<br />
          <br />
          <span style={{ color: '#a78bfa' }}>class</span>
          {' '}
          <span style={{ color: '#00d4ff' }}>TransactionSafetyTool</span>
          {':'}<br />
          {'    name = '}
          <span style={{ color: '#00ff88' }}>&quot;check_transaction_safety&quot;</span>
          <br />
          {'    description = '}
          <span style={{ color: '#00ff88' }}>&quot;Validates blockchain transactions before execution&quot;</span>
          <br />
          <br />
          {'    '}
          <span style={{ color: '#a78bfa' }}>def</span>
          {' '}
          <span style={{ color: '#00d4ff' }}>run</span>
          {'(self, transaction: '}
          <span style={{ color: '#00d4ff' }}>dict</span>
          {') -> '}
          <span style={{ color: '#00d4ff' }}>dict</span>
          {':'}<br />
          {'        result = sentry.'}
          <span style={{ color: '#00d4ff' }}>check</span>
          {'('}<br />
          {'            chain=transaction['}
          <span style={{ color: '#00ff88' }}>&quot;chain&quot;</span>
          {'],'}<br />
          {'            to=transaction['}
          <span style={{ color: '#00ff88' }}>&quot;to&quot;</span>
          {'],'}<br />
          {'        )'}<br />
          {'        '}
          <span style={{ color: '#a78bfa' }}>return</span>
          {' result'}
        </code>
      </pre>
    </div>
  );
}

function CurlCodeContent() {
  return (
    <div className="relative bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b]">
        <span className="text-xs text-gray-500">cURL</span>
        <CopyBtn code={curlCode} />
      </div>
      <pre className="p-5 text-sm font-mono leading-6 overflow-x-auto">
        <code>
          <span style={{ color: '#00d4ff' }}>curl</span>
          {' -X POST '}
          <span style={{ color: '#00ff88' }}>https://api.chainsentry.io/v1/check</span>
          {' \\'}<br />
          {'  -H '}
          <span style={{ color: '#00ff88' }}>&quot;Authorization: Bearer cs_live_xxxxxxxxxxxx&quot;</span>
          {' \\'}<br />
          {'  -H '}
          <span style={{ color: '#00ff88' }}>&quot;Content-Type: application/json&quot;</span>
          {' \\'}<br />
          {'  -d '}
          <span style={{ color: '#00ff88' }}>&apos;&#123;&quot;chain&quot;: &quot;ethereum&quot;, &quot;to&quot;: &quot;0x7a250...&quot;, &quot;value&quot;: &quot;1000000000000000000&quot;&#125;&apos;</span>
          <br />
          <br />
          <span style={{ color: '#6b7280' }}># Response:</span>
          <br />
          <span style={{ color: '#6b7280' }}># {'{ "verdict": "SAFE", "score": 12, "latencyMs": 8 }'}</span>
        </code>
      </pre>
    </div>
  );
}

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

export default function CodeIntegration() {
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold gradient-text mb-4">Integrate in Minutes</h2>
          <p className="text-gray-400">Drop ChainSentry into your existing agent or bot with a few lines of code.</p>
        </div>

        <Tabs.Root defaultValue="js">
          <Tabs.List className="flex justify-center mb-6">
            <div className="bg-[#0d0d14] border border-[#1e293b] rounded-full p-1 inline-flex gap-1">
              {[
                { value: 'js', label: 'JavaScript' },
                { value: 'python', label: 'Python' },
                { value: 'curl', label: 'cURL' },
              ].map((tab) => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  className="px-5 py-2 rounded-full text-sm text-gray-400 transition-colors data-[state=active]:bg-[#1e293b] data-[state=active]:text-[#00ff88]"
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </div>
          </Tabs.List>

          <Tabs.Content value="js">
            <JsCodeContent />
          </Tabs.Content>
          <Tabs.Content value="python">
            <PythonCodeContent />
          </Tabs.Content>
          <Tabs.Content value="curl">
            <CurlCodeContent />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </section>
  );
}
