import Link from 'next/link';
import { Shield, Github, Twitter } from 'lucide-react';
import NewsletterForm from './NewsletterForm';

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Changelog', href: '/changelog' },
];

const devLinks = [
  { label: 'API Reference', href: '/docs' },
  { label: 'SDKs', href: '/docs#sdks' },
  { label: 'GitHub', href: 'https://github.com/chainsentry' },
  { label: 'Status', href: '/status' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: 'mailto:hello@chainsentry.io' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#1e293b] bg-[#0d0d14] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Logo + tagline */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Shield className="w-6 h-6 text-[#00ff88]" />
              <span className="font-bold text-lg text-white">ChainSentry</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              Pre-execution blockchain transaction security for AI agents and DeFi bots.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/chainsentry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#00ff88] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/chainsentry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#00ff88] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Product</h4>
            <ul className="flex flex-col gap-2">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 text-sm hover:text-[#00ff88] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Developers</h4>
            <ul className="flex flex-col gap-2">
              {devLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 text-sm hover:text-[#00ff88] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Newsletter */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Company</h4>
            <ul className="flex flex-col gap-2 mb-6">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 text-sm hover:text-[#00ff88] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-semibold text-white text-sm mb-3">Stay updated</h4>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t-2 border-[#00ff88]/30 mt-8 pt-8 text-center text-sm text-gray-500">
          © 2025 ChainSentry. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
