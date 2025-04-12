import { getJourneys } from '@/lib/dataUtils';
import JourneyList from './JourneyList';

export default async function JourneyPage() {
  const initialJourneys = await getJourneys();

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12 text-center">My Journeys</h1>
      <JourneyList initialJourneys={initialJourneys} />
    </main>
  );
} 