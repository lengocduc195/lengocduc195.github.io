import { getJourneys } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface JourneyDetailPageProps {
  params: { slug: string };
}

async function getJourneyDetails(slug: string) {
  const allJourneys = await getJourneys();

  // Tìm journey theo slug (từ title hoặc id)
  const entry = allJourneys.find(j => {
    // Kiểm tra nếu slug khớp với id
    if (j.id?.toString() === slug) return true;

    // Kiểm tra nếu slug khớp với title đã được chuyển đổi
    if (typeof j.title === 'string') {
      const titleSlug = j.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return titleSlug === slug;
    }

    return false;
  });

  return entry;
}

export default async function JourneyDetailPage({ params }: JourneyDetailPageProps) {
  // Đảm bảo params được await trước khi sử dụng
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  const entry = await getJourneyDetails(slug);

  if (!entry) {
    notFound();
  }

  // Chọn màu gradient dựa trên category
  let gradientClass = "from-blue-500 to-purple-500";
  if (entry.category === 'Education') gradientClass = "from-blue-500 to-cyan-400";
  if (entry.category === 'Career') gradientClass = "from-purple-500 to-pink-500";
  if (entry.category === 'Volunteer') gradientClass = "from-green-500 to-emerald-400";
  if (entry.category === 'Family') gradientClass = "from-red-500 to-orange-400";
  if (entry.category === 'Relocation') gradientClass = "from-amber-500 to-yellow-400";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{entry.title || 'Untitled Journey'}</h1>
        <p className="text-gray-600 mb-4">{entry.date || 'No date'}</p>
        {entry.category && (
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{entry.category}</span>
          </div>
        )}
        <p className="mb-8">{entry.description || 'No description available'}</p>
        
        <Link href="/journeys" className="text-blue-500 hover:underline">
          ← Back to Journeys
        </Link>
      </div>
    </div>
  );
}
