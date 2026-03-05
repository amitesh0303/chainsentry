'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bug, TrendingDown, Zap, Wallet, Percent, Ban, GitBranch, AlertTriangle } from 'lucide-react';

const threats = [
  { icon: Bug, title: 'Honeypot Detection', description: "Detects tokens you can't sell" },
  { icon: TrendingDown, title: 'Rug Pull Risk', description: 'Scores liquidity removal probability' },
  { icon: Zap, title: 'MEV/Sandwich Attack', description: 'Identifies frontrunning vectors' },
  { icon: Wallet, title: 'Wallet Drainer', description: 'Catches approval-based drainers' },
  { icon: Percent, title: 'Tax Analysis', description: 'Reveals hidden buy/sell taxes' },
  { icon: Ban, title: 'Blacklist Check', description: 'Screens against known bad actors' },
  { icon: GitBranch, title: 'Contract Similarity', description: 'Matches known exploit patterns' },
  { icon: AlertTriangle, title: 'Malicious Approval', description: 'Flags dangerous token approvals' },
];

export default function ThreatCoverage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-24 bg-[#0d0d14]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gradient-text mb-4">What We Detect</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            8 threat detectors running in parallel on every transaction check
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {threats.map((threat, i) => (
            <motion.div
              key={threat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="card-dark rounded-xl p-6 hover:border-[#00ff88]/50 transition-all duration-300 cursor-default"
            >
              <threat.icon className="w-8 h-8 text-[#ff2d55] mb-3" />
              <h3 className="font-bold text-white text-sm mb-1">{threat.title}</h3>
              <p className="text-gray-500 text-xs">{threat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
