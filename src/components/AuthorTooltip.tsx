'use client';

import React from 'react';

interface AuthorTooltipProps {
  authors: string[];
  yourName?: string | string[];
}

export default function AuthorTooltip({ authors, yourName = ['Duc Le', 'Le Ngoc-Duc'] }: AuthorTooltipProps) {
  // Convert yourName to array if it's a string
  const yourNameArray = typeof yourName === 'string' ? [yourName] : yourName;
  
  // Format the authors list with highlighting for your name
  const formattedAuthors = authors.map(author => {
    const isYourName = yourNameArray.some(name => 
      author.includes(name) || author === name
    );
    
    return isYourName 
      ? <span key={author} className="highlight">{author}</span>
      : <span key={author}>{author}</span>;
  });
  
  // Insert commas between authors
  const authorElements: React.ReactNode[] = [];
  formattedAuthors.forEach((author, index) => {
    authorElements.push(author);
    if (index < formattedAuthors.length - 1) {
      authorElements.push(<span key={`comma-${index}`}>, </span>);
    }
  });
  
  return (
    <span className="author-tooltip">
      <span className="text-blue-300 text-sm hover:underline">
        {authors[0] || 'Duc Le'}{authors.length > 1 ? ' et al.' : ''}
      </span>
      <div className="tooltip-content">
        {authorElements}
      </div>
    </span>
  );
}
