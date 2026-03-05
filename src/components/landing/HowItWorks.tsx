'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Cpu, Shield } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Send,
    title: 'Submit TX',
    description: 'Send transaction params to our API — chain, to, from, data, value',
  },
  {
    number: 2,
    icon: Cpu,
    title: 'Simulate & Analyze',
    description: 'We run 8 threat detectors in parallel using on-chain simulation',
  },
  {
    number: 3,
    icon: Shield,
    title: 'Get Verdict',
    description: 'Receive SAFE/THREAT verdict with detailed risk breakdown in <10ms',
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gradient-text mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Three simple steps to protect every transaction your bot executes
          </p>
        </div>

        <div ref={ref} className="flex flex-col md:flex-row items-center gap-0 md:gap-0 relative">
          {steps.map((step, i) => (
            <div key={step.number} className="flex flex-col md:flex-row items-center flex-1 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex-1 flex flex-col items-center text-center p-8"
              >
                <div className="w-12 h-12 rounded-full border-2 border-[#00ff88] text-[#00ff88] flex items-center justify-center font-bold text-lg mb-4">
                  {step.number}
                </div>
                <step.icon className="w-8 h-8 text-[#00ff88] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm max-w-xs">{step.description}</p>
              </motion.div>

              {i < steps.length - 1 && (
                <div className="hidden md:block flex-none w-16 border-t border-dashed border-[#1e293b]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
