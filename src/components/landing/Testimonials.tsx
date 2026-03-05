const testimonials = [
  {
    quote:
      'ChainSentry caught a honeypot that would have cost us 15 ETH. The <10ms latency fits perfectly in our execution pipeline.',
    name: 'Alex M.',
    role: 'MEV Bot Developer @ QuantumArb',
    initials: 'AM',
  },
  {
    quote:
      'We integrated ChainSentry into our LangChain trading agent in 20 minutes. Now our AI never executes a transaction without a safety check.',
    name: 'Sarah K.',
    role: 'Lead Engineer @ DeFiLogic Labs',
    initials: 'SK',
  },
  {
    quote:
      'The rug pull scorer alone has saved our fund from 3 bad positions this month. Worth every penny.',
    name: 'Marcus T.',
    role: 'Portfolio Manager @ CryptoVault Capital',
    initials: 'MT',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#0d0d14]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gradient-text mb-4">Trusted by Bot Builders</h2>
          <p className="text-gray-400">Join thousands of developers protecting their bots with ChainSentry</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card-dark rounded-xl p-6">
              <p className="text-gray-400 italic mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="border-t border-[#1e293b] pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-[#00ff88] font-bold text-sm flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
