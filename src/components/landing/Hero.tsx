'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  const [verdict, setVerdict] = useState<'SAFE' | 'THREAT'>('SAFE');

  useEffect(() => {
    const interval = setInterval(() => {
      setVerdict((v) => (v === 'SAFE' ? 'THREAT' : 'SAFE'));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const codeLines = [
    { text: '// ChainSentry - Pre-execution Safety Check', color: '#6b7280' },
    { text: '', color: '' },
    {
      text: (
        <>
          <span style={{ color: '#a78bfa' }}>const</span>{' '}
          <span style={{ color: '#e2e8f0' }}>result</span>{' '}
          <span style={{ color: '#a78bfa' }}>=</span>{' '}
          <span style={{ color: '#a78bfa' }}>await</span>{' '}
          <span style={{ color: '#e2e8f0' }}>chainsentry</span>
          <span style={{ color: '#e2e8f0' }}>.</span>
          <span style={{ color: '#00d4ff' }}>check</span>
          <span style={{ color: '#e2e8f0' }}>(&#123;</span>
        </>
      ),
    },
    {
      text: (
        <>
          {'  '}
          <span style={{ color: '#00d4ff' }}>chain</span>
          <span style={{ color: '#e2e8f0' }}>: </span>
          <span style={{ color: '#00ff88' }}>&quot;ethereum&quot;</span>
          <span style={{ color: '#e2e8f0' }}>,</span>
        </>
      ),
    },
    {
      text: (
        <>
          {'  '}
          <span style={{ color: '#00d4ff' }}>to</span>
          <span style={{ color: '#e2e8f0' }}>: </span>
          <span style={{ color: '#00ff88' }}>&quot;0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D&quot;</span>
          <span style={{ color: '#e2e8f0' }}>,</span>
        </>
      ),
    },
    {
      text: (
        <>
          {'  '}
          <span style={{ color: '#00d4ff' }}>from</span>
          <span style={{ color: '#e2e8f0' }}>: </span>
          <span style={{ color: '#e2e8f0' }}>wallet</span>
          <span style={{ color: '#e2e8f0' }}>.</span>
          <span style={{ color: '#00d4ff' }}>address</span>
          <span style={{ color: '#e2e8f0' }}>,</span>
        </>
      ),
    },
    {
      text: (
        <>
          {'  '}
          <span style={{ color: '#00d4ff' }}>value</span>
          <span style={{ color: '#e2e8f0' }}>: </span>
          <span style={{ color: '#00ff88' }}>&quot;1000000000000000000&quot;</span>
          <span style={{ color: '#6b7280' }}>{' '}// 1 ETH</span>
        </>
      ),
    },
    { text: <span style={{ color: '#e2e8f0' }}>&#125;);</span> },
    { text: '' },
    {
      text: (
        <>
          <span style={{ color: '#a78bfa' }}>if</span>
          <span style={{ color: '#e2e8f0' }}> (result.</span>
          <span style={{ color: '#00d4ff' }}>verdict</span>
          <span style={{ color: '#e2e8f0' }}> === </span>
          <span style={{ color: '#00ff88' }}>&quot;SAFE&quot;</span>
          <span style={{ color: '#e2e8f0' }}>) &#123;</span>
        </>
      ),
    },
    {
      text: (
        <>
          {'  '}
          <span style={{ color: '#a78bfa' }}>await</span>
          <span style={{ color: '#e2e8f0' }}> wallet.</span>
          <span style={{ color: '#00d4ff' }}>sendTransaction</span>
          <span style={{ color: '#e2e8f0' }}>(tx);</span>
        </>
      ),
    },
    { text: <span style={{ color: '#e2e8f0' }}>&#125; </span> },
    {
      text: (
        <>
          <span style={{ color: '#a78bfa' }}>else</span>
          <span style={{ color: '#e2e8f0' }}> &#123;</span>
        </>
      ),
    },
    {
      text: (
        <>
          {'  '}
          <span style={{ color: '#e2e8f0' }}>console.</span>
          <span style={{ color: '#00d4ff' }}>warn</span>
          <span style={{ color: '#e2e8f0' }}>(</span>
          <span style={{ color: '#00ff88' }}>&quot;🚨 Threat detected:&quot;</span>
          <span style={{ color: '#e2e8f0' }}>, result.</span>
          <span style={{ color: '#00d4ff' }}>threats</span>
          <span style={{ color: '#e2e8f0' }}>);</span>
        </>
      ),
    },
    { text: <span style={{ color: '#e2e8f0' }}>&#125;</span> },
  ];

  return (
    <section
      className="min-h-screen flex items-center relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at center, rgba(0,255,136,0.05) 0%, transparent 70%),
          repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,255,136,0.03) 40px, rgba(0,255,136,0.03) 41px),
          repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,255,136,0.03) 40px, rgba(0,255,136,0.03) 41px)
        `,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left: Text */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 border border-[#00ff88]/40 rounded-full px-4 py-1.5 text-sm text-[#00ff88] mb-6"
            >
              🛡️ Pre-execution Security Layer
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            >
              Stop Your Trading Bot
              <br />
              From Getting{' '}
              <span className="gradient-text-danger">Rugged</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-gray-400 mb-8 max-w-xl mx-auto md:mx-0"
            >
              Pre-execution transaction safety for AI agents &amp; DeFi bots. Detect
              honeypots, rug pulls, and exploits before they happen.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Link
                href="/register"
                className="bg-[#00ff88] text-black px-8 py-4 rounded-lg font-bold glow-green hover:bg-[#00ff88]/90 transition-colors text-center"
              >
                Get API Key Free
              </Link>
              <Link
                href="/docs"
                className="bg-transparent border border-[#00ff88] text-[#00ff88] px-8 py-4 rounded-lg hover:bg-[#00ff88]/10 transition-colors text-center"
              >
                View Docs
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex gap-8 mt-12 justify-center md:justify-start"
            >
              {[
                { value: '<10ms', label: 'Response Time' },
                { value: '99.9%', label: 'Detection Rate' },
                { value: '2.4M+', label: 'Txs Analyzed' },
              ].map((stat) => (
                <div key={stat.label} className="text-center md:text-left">
                  <div className="text-2xl font-bold text-[#00ff88]">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Code Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 w-full md:w-1/2"
          >
            <div className="bg-[#0d0d14] border border-[#1e293b] rounded-xl p-6">
              {/* Window chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#ff2d55]/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-[#00ff88]/60" />
                <span className="ml-2 text-xs text-gray-500">tx-safety.ts</span>
              </div>

              <pre className="text-sm font-mono leading-6 overflow-x-auto">
                <code>
                  {codeLines.map((line, i) => (
                    <div key={i}>
                      {typeof line.text === 'string' ? (
                        <span style={{ color: line.color || '#e2e8f0' }}>{line.text || '\u00a0'}</span>
                      ) : (
                        line.text
                      )}
                    </div>
                  ))}
                </code>
              </pre>

              {/* Verdict badge */}
              <div className="mt-4 flex justify-end">
                <motion.div
                  key={verdict}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border ${
                    verdict === 'SAFE'
                      ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30'
                      : 'bg-[#ff2d55]/10 text-[#ff2d55] border-[#ff2d55]/30'
                  }`}
                >
                  {verdict === 'SAFE' ? '✓ SAFE' : '⚠ THREAT'}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
