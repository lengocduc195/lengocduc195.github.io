import { getJourneys } from '@/lib/dataUtils';
import Link from 'next/link';
import JourneyFilter from './JourneyFilter';

export default async function JourneyPage() {
  const journeys = await getJourneys();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <section className="relative py-24 mb-8 overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 opacity-20">
          {/* Animated dots */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,_#ffffff33_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in-down">
            My <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Journeys</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8 animate-fade-in">
            Explore the key milestones and experiences that have shaped my personal and professional path.
          </p>

        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Journey Timeline</h2>
          <p className="text-gray-400 text-center mb-6">A chronological view of my experiences and milestones</p>

          {/* Filter Component */}
          <JourneyFilter journeys={journeys} />


        </div>
      </section>
    </div>
  );
}