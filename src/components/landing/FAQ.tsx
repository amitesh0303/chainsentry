'use client';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Which blockchains do you support?',
    a: 'Ethereum, BSC, Polygon, Arbitrum, Optimism, and Base. More chains coming soon.',
  },
  {
    q: 'How fast is the API?',
    a: 'Our median response time is under 10ms for cached results and under 50ms for full simulation. We run all 8 threat detectors in parallel.',
  },
  {
    q: 'How do I keep my API key secure?',
    a: 'Never expose your API key client-side. Use environment variables and server-side calls only. You can rotate keys anytime from your dashboard.',
  },
  {
    q: "What's included in the free trial?",
    a: "The Pro and Scale trials give you full access to all features for 30 days, no credit card required. You'll be notified before the trial ends.",
  },
  {
    q: 'Can I use ChainSentry with LangChain?',
    a: "Yes! We have a native LangChain tool wrapper. Install @chainsentry/langchain and pass it to your agent's tool array.",
  },
  {
    q: "What is a 'verdict' in the API response?",
    a: 'The verdict is SAFE, THREAT, or WARN. SAFE means no significant risks. THREAT means block the transaction. WARN means proceed with caution.',
  },
  {
    q: 'Do you store transaction data?',
    a: 'We store anonymized usage logs for billing. We never store private keys, wallet seeds, or personally identifiable transaction data.',
  },
  {
    q: 'What happens when I hit my rate limit?',
    a: "You'll receive a 429 response with a Retry-After header. Upgrade your plan or contact us for temporary limit increases.",
  },
];

export default function FAQ() {
  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gradient-text mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-400">Everything you need to know about ChainSentry</p>
        </div>

        <Accordion.Root type="single" collapsible className="flex flex-col">
          {faqs.map((faq, i) => (
            <Accordion.Item
              key={i}
              value={`item-${i}`}
              className="border-b border-[#1e293b]"
            >
              <Accordion.Trigger className="flex justify-between items-center py-4 w-full text-left font-medium hover:text-[#00ff88] transition-colors group">
                <span>{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 group-data-[state=open]:rotate-180 transition-transform flex-shrink-0 ml-4" />
              </Accordion.Trigger>
              <Accordion.Content className="text-gray-400 pb-4 text-sm leading-relaxed data-[state=open]:animate-none">
                {faq.a}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
