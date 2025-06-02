// This file is a server component that handles static generation
// for the admin/visitor/[id] route

export async function generateStaticParams() {
  // For admin routes, we can return an empty array or some placeholder IDs
  // The actual data will be fetched client-side
  return [
    { id: 'placeholder' }
  ];
}

// Set the page to be statically generated
export const dynamic = 'force-static';
