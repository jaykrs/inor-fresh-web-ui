"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, User, LogIn } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Boats', href: '/boats' },
    { name: 'Warehouse', href: '/warehouse' },
    { name: 'Products', href: '/products', submenu: [
      { name: 'Inventory', href: '/products/inventory' },
      { name: 'Categories', href: '/products/categories' }
    ]},
    { name: 'Suppliers', href: '/suppliers' },
    { name: 'Reports', href: '/reports', submenu: [
      { name: 'Daily', href: '/reports/daily' },
      { name: 'Monthly', href: '/reports/monthly' },
      { name: 'Annual', href: '/reports/annual' }
    ]},
  ];

  const toggleSubmenu = (name: string) => {
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${scrolled ? 'bg-white shadow-sm py-2 border-b border-gray-100' : 'bg-white/95 backdrop-blur-lg py-3'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              F
            </div>
            <span className="ml-3 text-xl font-bold text-gray-800 hidden sm:block">
              <span className="text-blue-600">Fisher</span>
              <span className="text-gray-600">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <div className="flex items-center">
                  <Link
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                      pathname === link.href 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                    {link.submenu && (
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                        activeSubmenu === link.name ? 'rotate-180' : ''
                      }`} />
                    )}
                  </Link>
                </div>

                {link.submenu && (
                  <div className="absolute left-0 mt-1 w-48 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out transform scale-95">
                    <div className="py-1">
                      {link.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block px-4 py-2 text-sm ${
                            pathname === subItem.href
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-500 rounded-lg hover:bg-gray-50 transition-colors">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </button>
            <button className="bg-gradient-to-br from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-blue-500 hover:bg-gray-100 focus:outline-none transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.name}>
                <div 
                  className={`flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium ${
                    pathname === link.href 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => link.submenu ? toggleSubmenu(link.name) : null}
                >
                  {link.submenu ? (
                    <span>{link.name}</span>
                  ) : (
                    <Link href={link.href} className="block w-full" onClick={() => setIsOpen(false)}>
                      {link.name}
                    </Link>
                  )}
                  {link.submenu && (
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform ${
                        activeSubmenu === link.name ? 'rotate-180' : ''
                      }`} 
                    />
                  )}
                </div>
                
                {link.submenu && activeSubmenu === link.name && (
                  <div className="pl-4 mt-1 space-y-1">
                    {link.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block px-3 py-2 rounded-lg text-sm ${
                          pathname === subItem.href
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </button>
              <button className="w-full bg-gradient-to-br from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white px-4 py-2 rounded-lg text-base font-medium shadow-sm">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;