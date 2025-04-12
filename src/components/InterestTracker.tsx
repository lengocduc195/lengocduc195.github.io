"use client";

import React, { ReactNode } from 'react';

interface InterestTrackerProps {
  interest: string;
  children: ReactNode;
  className?: string;
}

/**
 * A component that wraps elements to track user interest
 * Adds data-interest attribute to the wrapped element
 */
export default function InterestTracker({ interest, children, className = '' }: InterestTrackerProps) {
  return (
    <div data-interest={interest} className={`clickable ${className}`}>
      {children}
    </div>
  );
}
