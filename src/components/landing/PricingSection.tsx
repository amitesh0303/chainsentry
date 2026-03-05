'use client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    limit: '50 req/day',
    badge: null,
    trialBadge: null,
    features: [
      'Basic threat detection',
      '1 API key',
      'Community support',
      'Ethereum & BSC only',
    ],
    cta: 'Get Started Free',
    ctaHref: '/register',
    ctaClass: 'border border-[#1e293b] text-[#e2e8f0] hover:border-[#00ff88] transition-colors',
    cardClass: 'border border-[#1e293b]',
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/mo',
    limit: '10,000 req/day',
    badge: 'Most Popular',
    trialBadge: '30-day free trial • No credit card',
    features: [
      'All 8 threat detectors',
      '5 API keys',
      'Email support',
      '6 chains',
      'Webhook notifications',
      'Usage analytics',
    ],
    cta: 'Start Free Trial',
    ctaHref: '/register',
    ctaClass: 'bg-[#00ff88] text-black hover:bg-[#00ff88]/90 transition-colors',
    cardClass: 'border-2 border-[#00ff88] glow-green scale-105 relative',
  },
  {
    name: 'Scale',
    price: '$299',
    period: '/mo',
    limit: '50,000 req/day',
    badge: null,
    trialBadge: '30-day free trial',
    features: [
      'Everything in Pro',
      '20 API keys',
      'Priority support',
      'Custom rate limits',
      'SLA guarantee',
      'Dedicated endpoint',
    ],
    cta: 'Start Free Trial',
    ctaHref: '/register',
    ctaClass: 'bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90 transition-colors',
    cardClass: 'border-2 border-[#00d4ff]',
  },
  {
    name: 'Builder',
    price: 'Custom',
    period: '',
    limit: 'For indie hackers',
    badge: null,
    trialBadge: null,
    features: [
      'Flexible req limits',
      'Revenue share option',
      'Co-marketing',
      'Early access',
    ],
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@chainsentry.io',
    ctaClass: 'border border-[#1e293b] text-[#e2e8f0] hover:border-[#00ff88] transition-colors',
    cardClass: 'border border-[#1e293b]',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    limit: 'For institutions',
    badge: null,
    trialBadge: null,
    features: [
      'Unlimited requests',
      'On-premise option',
      'Custom SLA',
      'Dedicated support',
      'Audit logs',
      'SSO',
    ],
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@chainsentry.io',
    ctaClass: 'border border-[#1e293b] text-[#e2e8f0] hover:border-[#00ff88] transition-colors',
    cardClass: 'border border-[#1e293b]',
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gradient-text mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400">Start free. Scale as you grow. No surprise bills.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card-dark rounded-2xl p-6 flex flex-col ${plan.cardClass}`}
            >
              {plan.badge && (
                <div className="text-xs font-bold text-[#00ff88] border border-[#00ff88]/30 bg-[#00ff88]/10 rounded-full px-3 py-1 mb-3 text-center">
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">{plan.limit}</div>
              </div>

              {plan.trialBadge && (
                <div className="text-xs text-gray-400 mb-4">{plan.trialBadge}</div>
              )}

              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`w-full py-3 rounded-lg font-semibold text-center text-sm ${plan.ctaClass}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
