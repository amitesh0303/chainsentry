'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: '$2.4M+', label: 'Daily Volume Protected', color: 'text-[#00ff88]' },
  { value: '99.9%', label: 'Detection Rate', color: 'text-[#00d4ff]' },
  { value: '<10ms', label: 'Response Time', color: 'text-[#00ff88]' },
  { value: '6', label: 'Chains Supported', color: 'text-[#00d4ff]' },
];

export default function StatsBar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className="bg-[#0d0d14] border-t border-b border-[#1e293b] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="flex flex-wrap justify-center md:justify-between items-center gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
              {i < stats.length - 1 && (
                <div className="hidden md:block w-px bg-[#1e293b] h-12" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
