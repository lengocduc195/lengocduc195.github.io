"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/95 shadow-lg backdrop-blur-sm py-2' : hasHeroGradient ? 'bg-gray-900/30 backdrop-blur-sm shadow-md py-4' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold drop-shadow-md">
          <span className="text-blue-500">Duc</span>Le
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none"
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
        <div className="hidden md:flex space-x-6">
          <Link
            href="/"
            className={`${pathname === '/' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white transition-colors drop-shadow-md`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`${pathname === '/about' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white transition-colors drop-shadow-md`}
          >
            About
          </Link>
          <Link
            href="/projects"
            className={`${pathname === '/projects' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white transition-colors drop-shadow-md`}
          >
            Projects
          </Link>
          <Link
            href="/products"
            className={`${pathname === '/products' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white transition-colors drop-shadow-md`}
          >
            Products
          </Link>
          <Link
            href="/publications"
            className={`${pathname === '/publications' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white transition-colors drop-shadow-md`}
          >
            Publications
          </Link>
          <Link
            href="/blogs"
            className={`${pathname === '/blogs' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white transition-colors drop-shadow-md`}
          >
            Blogs
          </Link>
          <Link
            href="/journeys"
            className={`${pathname === '/journeys' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white transition-colors drop-shadow-md`}
          >
            Journeys
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-900/95 backdrop-blur-sm px-4 py-2 mt-2 space-y-3">
          <Link
            href="/"
            className={`block ${pathname === '/' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white py-2 transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`block ${pathname === '/about' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white py-2 transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/projects"
            className={`block ${pathname === '/projects' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white py-2 transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Projects
          </Link>
          <Link
            href="/products"
            className={`block ${pathname === '/products' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white py-2 transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/publications"
            className={`block ${pathname === '/publications' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white py-2 transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Publications
          </Link>
          <Link
            href="/blogs"
            className={`block ${pathname === '/blogs' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white py-2 transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Blogs
          </Link>
          <Link
            href="/journeys"
            className={`block ${pathname === '/journeys' ? 'text-white font-medium' : 'text-gray-300'} hover:text-white py-2 transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Journeys
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;