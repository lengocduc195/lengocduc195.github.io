'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem('analytics_consent');
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const acceptConsent = () => {
    localStorage.setItem('analytics_consent', 'true');
    setShowBanner(false);
  };

  const declineConsent = () => {
    localStorage.setItem('analytics_consent', 'false');
    setShowBanner(false);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="container mx-auto">
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Privacy and Data Collection Notice</h3>
            <p className="mb-2">
              This website collects data about your visit to improve your experience and help us understand how visitors use our site.
              We value your privacy and want to be transparent about the information we collect.
            </p>
            <button
              onClick={toggleDetails}
              className="text-blue-400 hover:text-blue-300 underline text-sm mb-2"
            >
              {showDetails ? 'Hide details' : 'Show details about data collection'}
            </button>

            {showDetails && (
              <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm">
                <h4 className="font-semibold mb-2">Data We Collect:</h4>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  <li><strong>Device Information:</strong> Browser type, operating system, screen size, device type</li>
                  <li><strong>Location Information:</strong> Country, region, city, and approximate geographic location</li>
                  <li><strong>Usage Information:</strong> Pages visited, time spent on pages, interactions with the site</li>
                  <li><strong>Network Information:</strong> IP address, connection type, internet service provider</li>
                  <li><strong>Referral Information:</strong> How you found our site (search engine, social media, etc.)</li>
                </ul>

                <h4 className="font-semibold mb-2">How We Use This Data:</h4>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  <li>Analyze website traffic and user behavior to improve our content and user experience</li>
                  <li>Identify technical issues and optimize website performance</li>
                  <li>Understand our audience demographics and interests</li>
                  <li>Measure the effectiveness of our content and features</li>
                </ul>

                <h4 className="font-semibold mb-2">Your Rights:</h4>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  <li>You can decline data collection by clicking "Decline" below</li>
                  <li>You can change your preferences at any time by clearing your browser cookies</li>
                  <li>You can request access to or deletion of your data by contacting us</li>
                </ul>

                <p className="text-xs mt-2">
                  For more information, please see our{' '}
                  <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-end">
            <button
              onClick={acceptConsent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
            >
              Accept All
            </button>
            <button
              onClick={declineConsent}
              className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded font-medium"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
