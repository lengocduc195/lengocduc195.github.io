// This is a server component that includes generateStaticParams
// for static site generation with dynamic routes

// Set the page to be statically generated
export const dynamic = 'force-static';

// Generate static params for build time
export async function generateStaticParams() {
  // For admin routes, we can return an empty array or some placeholder IDs
  // The actual data will be fetched client-side
  return [
    { id: 'placeholder' }
  ];
}

// Import the client component that contains the actual page content
import VisitorDetailClient from './VisitorDetailClient';



// Define the default export as the client component
export default function Page({ params }: { params: { id: string } }) {
  return <VisitorDetailClient />;
}
