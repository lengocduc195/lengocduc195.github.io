import { getPublications } from '@/lib/dataUtils';
import { Publication } from '@/lib/dataUtils';
import PublicationSection from './PublicationSection';
import fs from 'fs/promises';
import path from 'path';

// Thay thế bằng tên của bạn để highlight và sort
const YOUR_NAME = "Duc Le";

export default async function PublicationsPage() {
  const allPublications = await getPublications();

  // Phân loại publications theo type
  const conferencePublications = allPublications.filter(pub => pub.type === 'Conference');
  const journalPublications = allPublications.filter(pub => pub.type === 'Journal');
  const workshopPublications = allPublications.filter(pub => pub.type === 'Workshop');

  // Xử lý các publications không có type
  const unclassifiedPublications = allPublications.filter(pub => !pub.type);

  // Tải dữ liệu rank từ file ranks.json
  const ranksFilePath = path.join(process.cwd(), 'public', 'assets', 'data', 'ranks.json');
  let rankOrder: { [key: string]: number } = {};

  try {
    const fileContent = await fs.readFile(ranksFilePath, 'utf8');
    const rankData = JSON.parse(fileContent);

    // Tạo một object chứa tất cả các rank từ cả conference và journal
    const combinedRanks: { [key: string]: number } = {};

    // Thêm conference ranks
    if (rankData.conference) {
      Object.entries(rankData.conference).forEach(([rank, value]) => {
        // Thêm cả hai phiên bản: có và không có tiền tố "CORE"
        combinedRanks[`CORE ${rank}`] = value as number;
        combinedRanks[rank] = value as number;
      });
    }

    // Thêm journal ranks
    if (rankData.journal) {
      Object.entries(rankData.journal).forEach(([rank, value]) => {
        combinedRanks[rank] = value as number;
      });
    }

    rankOrder = combinedRanks;
  } catch (error) {
    console.error('Error reading ranks.json:', error);
    // Fallback to default ranks if loading fails
    rankOrder = {
      'CORE A*': 1,
      'A*': 1,
      'Q1': 1,
      'CORE A': 2,
      'A': 2,
      'Q2': 2,
      'CORE B': 3,
      'B': 3,
      'Q3': 3,
      'CORE C': 4,
      'C': 4,
      'Q4': 4,
    };
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Academic <span className="text-yellow-300">Publications</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-green-100">
            Explore my research contributions to the academic community.
            Each publication represents a significant advancement in knowledge and understanding.
          </p>
        </div>
      </div>

      {/* Publications List Section */}
      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 space-y-8">
          {/* Conference Publications */}
          <PublicationSection
            publications={conferencePublications}
            yourName={YOUR_NAME}
            sectionTitle="Conference Publications"
            rankOrder={rankOrder}
          />

          {/* Journal Publications */}
          <PublicationSection
            publications={journalPublications}
            yourName={YOUR_NAME}
            sectionTitle="Journal Publications"
            rankOrder={rankOrder}
          />

          {/* Workshop Publications */}
          <PublicationSection
            publications={workshopPublications}
            yourName={YOUR_NAME}
            sectionTitle="Workshop Publications"
            rankOrder={rankOrder}
          />

          {/* Unclassified Publications (if any) */}
          {unclassifiedPublications.length > 0 && (
            <PublicationSection
              publications={unclassifiedPublications}
              yourName={YOUR_NAME}
              sectionTitle="Other Publications"
              rankOrder={rankOrder}
            />
          )}
        </div>
      </div>
    </main>
  );
}