import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">The Data We Collect</h2>
          <p className="mb-4">
            We collect various types of information to improve your experience and understand how visitors use our site. This includes:
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Device Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Browser type and version</li>
            <li>Operating system and version</li>
            <li>Device type (desktop, mobile, tablet)</li>
            <li>Screen resolution and color depth</li>
            <li>Browser vendor and platform</li>
            <li>Hardware capabilities (memory, CPU cores, etc.)</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">Location Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Country, region, and city</li>
            <li>Approximate geographic coordinates (if permission is granted)</li>
            <li>Timezone information</li>
            <li>Internet service provider</li>
            <li>Connection type</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">Usage Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Pages visited and navigation paths</li>
            <li>Time spent on pages</li>
            <li>Interactions (clicks, scrolls, form submissions)</li>
            <li>Features used</li>
            <li>Search queries</li>
            <li>Files downloaded</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">Network Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>IP address (stored in anonymized form)</li>
            <li>Connection speed and type</li>
            <li>Network provider information</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">Referral Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Source of your visit (search engine, social media, direct)</li>
            <li>Search terms used to find our site</li>
            <li>UTM parameters from marketing campaigns</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
          <p className="mb-4">We use the collected data for various purposes:</p>
          <ul className="list-disc pl-6">
            <li>To analyze website traffic patterns and user behavior</li>
            <li>To improve our website content, layout, and user experience</li>
            <li>To identify and fix technical issues</li>
            <li>To understand our audience demographics and interests</li>
            <li>To measure the effectiveness of our content and features</li>
            <li>To personalize your experience and show you relevant content</li>
            <li>To protect our website from abuse and unauthorized access</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
          <p className="mb-4">
            All collected data is stored in our Firebase Realtime Database with appropriate security measures in place. We implement various security measures to maintain the safety of your personal data when it is entered, stored, or accessed.
          </p>
          <p>
            We retain your data only for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data:</p>
          <ul className="list-disc pl-6">
            <li><strong>Right to access</strong> - You can request access to your personal data.</li>
            <li><strong>Right to rectification</strong> - You can request correction of your personal data.</li>
            <li><strong>Right to erasure</strong> - You can request deletion of your personal data.</li>
            <li><strong>Right to restrict processing</strong> - You can request restriction of processing your personal data.</li>
            <li><strong>Right to data portability</strong> - You can request transfer of your personal data.</li>
            <li><strong>Right to object</strong> - You can object to processing of your personal data.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Similar Technologies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:lnduc19502@gmail.com" className="text-blue-600 hover:underline">lnduc19502@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
