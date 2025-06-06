"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import UserProfileButton from './auth/UserProfileButton';

interface NavItem {
  path: string;
  label: string;
  highlight?: boolean;
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Kiểm tra xem trang hiện tại có hero section gradient không
  const hasHeroGradient = ["/about", "/projects", "/products", "/publications", "/blogs"].includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Set active item based on current pathname
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname]);

  // Hàm đóng menu mobile
  const closeMenu = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Define navigation items
  const navItems: NavItem[] = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Projects' },
    { path: '/products', label: 'Products' },
    { path: '/publications', label: 'Publications' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/journeys', label: 'Journeys' },
    { path: '/notable-observations', label: 'Observations' },
    { path: '/unexpected-insights', label: 'Insights' },
    { path: '/shop', label: 'Shop', highlight: true },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/95 shadow-lg backdrop-blur-sm py-2' : hasHeroGradient ? 'bg-gray-900/50 backdrop-blur-sm shadow-md py-4' : 'bg-gray-900/70 backdrop-blur-sm py-4'}`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold drop-shadow-md flex items-center group">
          <span className="text-blue-500 inline-block hover:scale-110 transition-transform duration-200">
            Duc
          </span>
          <span className="inline-block hover:scale-110 transition-transform duration-200">
            Le
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none hover:scale-105 active:scale-95 transition-transform duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <div className="flex space-x-1 relative mr-4">
            {navItems.map((item) => (
              <div key={item.path} className="relative px-1">
                <Link
                  href={item.path}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${pathname === item.path ? 'text-white' : item.highlight ? 'text-indigo-300 hover:text-white' : 'text-gray-300 hover:text-white'}
                    ${item.highlight ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border-b border-indigo-500/30' : ''}
                  `}
                  onMouseEnter={() => setActiveItem(item.path)}
                  onMouseLeave={() => setActiveItem(pathname)}
                >
                  {item.highlight && (
                    <>
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-md blur-sm"></span>
                      <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    </>
                  )}
                  {item.label}

                  {pathname === item.path && (
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 w-full opacity-100 transition-opacity duration-300 ${item.highlight ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}
                    />
                  )}
                </Link>
                {activeItem === item.path && activeItem !== pathname && (
                  <span
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400/70 to-purple-500/70 w-full opacity-100 transition-opacity duration-200"
                  />
                )}
              </div>
            ))}
          </div>

          {/* User Profile Button */}
          <UserProfileButton />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-gray-900/95 backdrop-blur-sm px-4 py-2 mt-2 space-y-1 rounded-b-lg shadow-lg">
          {/* User Profile Section (Mobile) */}
          <div className="py-3 border-b border-gray-800 mb-2">
            <div className="px-3">
              <UserProfileButton />
            </div>
          </div>

          {navItems.map((item) => (
            <div
              key={item.path}
              className="transform transition-transform duration-200 hover:translate-x-1"
            >
              <Link
                href={item.path}
                className={`block px-3 py-2 rounded-md
                  ${pathname === item.path ? 'bg-gray-800/50 text-white font-medium' : item.highlight ? 'text-indigo-300 hover:text-white' : 'text-gray-300 hover:bg-gray-800/30 hover:text-white'}
                  ${item.highlight ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-indigo-500/30' : ''}
                  transition-all duration-200 relative`}
                onClick={closeMenu}
              >
                <div className="flex items-center relative">
                  {item.highlight && (
                    <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  )}
                  {item.path === '/' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                  {item.path === '/about' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  {item.path === '/projects' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  )}
                  {item.path === '/products' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                  {item.path === '/shop' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {item.path === '/publications' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                  {item.path === '/blogs' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  )}
                  {item.path === '/journeys' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  )}
                  {item.path === '/notable-observations' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  )}
                  {item.path === '/unexpected-insights' && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {item.label}

                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;