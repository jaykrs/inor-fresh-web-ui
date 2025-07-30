import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Products',
      links: [
        { name: 'Boats Management', href: '/boats' },
        { name: 'Warehouse System', href: '/warehouse' },
        { name: 'Inventory', href: '/products' },
        { name: 'Supplier Portal', href: '/suppliers' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
        { name: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook size={18} />, href: 'https://facebook.com' },
    { icon: <Twitter size={18} />, href: 'https://twitter.com' },
    { icon: <Instagram size={18} />, href: 'https://instagram.com' },
    { icon: <Linkedin size={18} />, href: 'https://linkedin.com' },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center group mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                F
              </div>
              <span className="ml-3 text-xl font-bold dark:text-white">
                <span className="text-blue-600 dark:text-blue-400">Fisher</span>
                <span className="text-gray-600 dark:text-gray-300">Pro</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mt-2 dark:text-gray-500">
              Comprehensive fishing management solution for modern fisheries.
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors dark:hover:text-blue-400"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="mt-4 md:mt-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 dark:text-gray-400">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors dark:hover:text-blue-400"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="mt-4 md:mt-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 dark:text-gray-400">
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm mt-4 dark:text-gray-500">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form className="mt-4 flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-800 text-white px-4 py-2 rounded-l-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-br from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white px-4 py-2 rounded-r-md text-sm font-medium shadow-sm transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm dark:border-gray-800">
          <p>
            &copy; {currentYear} Fisher Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;