import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public', 'assets', 'data');

// Hàm đọc tất cả file JSON từ một thư mục con
async function readDataFiles<T>(subfolder: string): Promise<T[]> {
  const dirPath = path.join(dataPath, subfolder);
  const results: T[] = [];
  try {
    const filenames = await fs.readdir(dirPath);
    const jsonFiles = filenames.filter((file) => path.extname(file) === '.json');

    await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(dirPath, file);
        try {
          const fileContent = await fs.readFile(filePath, 'utf8');
          // Thêm kiểm tra nội dung rỗng trước khi parse
          if (fileContent.trim() === '') {
            console.warn(`Skipping empty JSON file: ${filePath}`);
            return;
          }
          const jsonData = JSON.parse(fileContent) as T;
          results.push(jsonData); // Chỉ thêm vào results nếu parse thành công
        } catch (parseError) {
          // Ghi log lỗi cụ thể và tên file
          console.error(`Error parsing JSON file ${filePath}:`, parseError);
          // Không thêm file lỗi vào kết quả
        }
      })
    );
  } catch (readDirError) {
    if (readDirError instanceof Error && 'code' in readDirError && readDirError.code === 'ENOENT') {
      console.warn(`Directory not found, skipping: ${dirPath}`);
    } else {
      console.error(`Error reading directory ${dirPath}:`, readDirError);
    }
  }
  return results;
}

// Hàm đọc dữ liệu từ các thư mục con của Journeys
async function readJourneyFiles<T>(): Promise<T[]> {
    const journeysPath = path.join(dataPath, 'journeys');
    let allJourneys: T[] = [];
    try {
        const categories = await fs.readdir(journeysPath, { withFileTypes: true });
        const categoryFolders = categories.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

        await Promise.all(categoryFolders.map(async (category) => {
            const categoryPath = path.join(journeysPath, category);
            try {
                const filenames = await fs.readdir(categoryPath);
                const jsonFiles = filenames.filter((file) => path.extname(file) === '.json');

                await Promise.all(
                    jsonFiles.map(async (file) => {
                        const filePath = path.join(categoryPath, file);
                        try {
                            const fileContent = await fs.readFile(filePath, 'utf8');
                            if (fileContent.trim() === '') {
                                console.warn(`Skipping empty JSON file: ${filePath}`);
                                return;
                            }
                            let jsonData = JSON.parse(fileContent) as any;

                            // Thêm category từ tên thư mục nếu không có
                            if (!jsonData.category) {
                                jsonData.category = category;
                            }

                            // Sử dụng push thay vì concat để tránh lỗi race condition tiềm ẩn
                            allJourneys.push(jsonData as T);
                        } catch (parseError) {
                            console.error(`Error parsing JSON file ${filePath}:`, parseError);
                        }
                    })
                );
            } catch (readDirError) {
                 console.error(`Error reading category directory ${categoryPath}:`, readDirError);
            }
        }));

    } catch (readJourneysError) {
        if (readJourneysError instanceof Error && 'code' in readJourneysError && readJourneysError.code === 'ENOENT') {
            console.warn(`Directory not found, skipping: ${journeysPath}`);
        } else {
            console.error(`Error reading journeys directory ${journeysPath}:`, readJourneysError);
        }
    }
    return allJourneys;
}

// Interface cho about.json
export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  researchgate?: string;
  googleScholar?: string;
  orcid?: string;
  [key: string]: string | undefined; // Cho phép các key khác
}

export interface CvResumeInfo {
  url?: string;
  filename?: string;
}

export interface EducationEntry {
  degree: string;
  school: string;
  year: string;
  description?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  period: string;
  description?: string | string[]; // Có thể là một chuỗi hoặc danh sách
}

export interface AboutData {
  name?: string;
  title?: string;
  'main role'?: string;
  roles?: string[];
  bio?: string;
  image?: string;
  location?: string;
  email?: string;
  social?: SocialLinks;
  cv?: CvResumeInfo;
  resume?: CvResumeInfo;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  interests?: string[];
  technologyCategories?: Record<string, string[]>;
}

// Hàm đọc about.json
export async function getAboutData(): Promise<AboutData> {
  const filePath = path.join(dataPath, 'about.json');
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    if (fileContent.trim() === '') {
      console.warn("about.json is empty.");
      return {};
    }
    return JSON.parse(fileContent) as AboutData;
  } catch (error) {
     if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
         console.warn(`about.json not found.`);
     } else {
        console.error(`Error reading or parsing about.json:`, error);
     }
    return {}; // Trả về object rỗng nếu có lỗi
  }
}

// Interface cho requirements.json
export interface SkillRequirements {
  [category: string]: string[];
}

// Hàm đọc requirements.json
export async function getSkillRequirements(): Promise<SkillRequirements> {
  const filePath = path.join(dataPath, 'requirements.json');
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    if (fileContent.trim() === '') {
      console.warn("requirements.json is empty.");
      return {};
    }
    return JSON.parse(fileContent) as SkillRequirements;
  } catch (error) {
     if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
         console.warn(`requirements.json not found.`);
     } else {
        console.error(`Error reading or parsing requirements.json:`, error);
     }
    return {};
  }
}

// Interface DataItem (Giữ nguyên hoặc đơn giản hóa nếu chỉ cần technologies)
interface DataItem {
  technologies?: string[];
  // Bỏ qua các trường khác nếu không cần cho việc lấy skill
}

// Cập nhật getAllSkills để chỉ lấy từ trường "technologies"
export async function getAllSkills(): Promise<string[]> {
  const allTechSkills = new Set<string>();

  const dataSources: Promise<DataItem[]>[] = [
    readDataFiles<DataItem>('projects'),
    readDataFiles<DataItem>('products'),
    readDataFiles<DataItem>('publications'),
    readDataFiles<DataItem>('blogs'),
    // Không lấy từ journeys nữa nếu không có trường technologies
    // readJourneyFiles<DataItem>(),
  ];

  try {
    const results = await Promise.all(dataSources);
    results.forEach((dataSet) => {
      if (!Array.isArray(dataSet)) {
        console.warn("Skipping non-array dataset in getAllSkills");
        return;
      }
      dataSet.forEach((item) => {
        // Chỉ lấy từ trường technologies
        if (Array.isArray(item.technologies)) {
          item.technologies.forEach((tech) => {
            if (typeof tech === 'string' && tech.trim() !== '') {
              allTechSkills.add(tech.trim());
            }
          });
        }
      });
    });
  } catch (error) {
    console.error("Error fetching or processing technology skills:", error);
  }

  return Array.from(allTechSkills).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

// --- Các hàm đọc dữ liệu cụ thể cho từng trang ---

// Interface cho Link nội bộ và bên ngoài
interface RelatedLink {
  title: string;
  url: string; // Có thể là link nội bộ (/...) hoặc link ngoài (https://...)
}

// Interface Project (Cập nhật để khớp file mẫu project_1.json)
export interface Project {
  id: number;
  author?: string[];
  highlight?: boolean; // Thêm trường highlight để đánh dấu dự án nổi bật
  date: string; // YYYY-MM-DD
  title: string; // Đổi từ name sang title
  description?: string;
  images?: { url: string; caption: string }[] | string[]; // Chấp nhận cả mảng string hoặc object
  tags?: string[]; // Sử dụng tags làm chính
  demoUrl?: string | null;
  githubUrl?: string | null;
  technologies?: string[]; // Giữ lại nếu cần
  videoUrl?: string | null;
  content?: string;
  // Thêm các trường khác từ file mẫu nếu cần
  name?: string; // Giữ lại name nếu dùng ở đâu đó
  repoUrl?: string; // Giữ lại nếu dùng ở đâu đó
  liveUrl?: string | null; // Giữ lại nếu dùng ở đâu đó
  related?: RelatedLink[]; // Thêm related links
  links?: RelatedLink[]; // Thêm external links
}

export async function getProjects(): Promise<Project[]> {
    const projects = await readDataFiles<Project>('projects');
    // Có thể thêm bước chuyển đổi dữ liệu ở đây nếu cần
    // Ví dụ: Gán project.name = project.title nếu name bị thiếu
    return projects.map(p => ({ ...p, name: p.name ?? p.title }));
}

// Hàm mới để lấy các dự án nổi bật cho trang chủ
export async function getHighlightedProjects(): Promise<Project[]> {
    const allProjects = await getProjects();
    // Lọc các dự án có highlight = true
    const highlightedProjects = allProjects.filter(project => project.highlight === true);
    // Nếu không có dự án nào được đánh dấu highlight, trả về 3 dự án đầu tiên
    if (highlightedProjects.length === 0) {
        console.warn("No highlighted projects found. Returning first 3 projects instead.");
        return allProjects.slice(0, 3);
    }
    // Giới hạn số lượng dự án nổi bật hiển thị (ví dụ: tối đa 3)
    return highlightedProjects.slice(0, 3);
}

// Interface Publication (Cập nhật để khớp file mẫu publication_1.json)
export interface Publication {
    id: number;
    rank?: string;
    title: string;
    authors: string[];
    isFirstAuthor?: boolean;
    venue?: string;
    year: number;
    abstract?: string;
    fullText?: string;
    tags?: string[]; // Dùng tags thay technologies?
    doi?: string | null;
    link?: string; // URL chính?
    citationCount?: number;
    citationFormat?: string;
    videoUrl?: string | null;
    github?: string | null;
    images?: { url: string; caption: string }[] | string[];
    topics?: string[]; // Add topics field for categorization
    content?: string; // Add content field (alternative to abstract/fullText)
    // Giữ lại nếu cần
    url?: string;
    technologies?: string[];
    related?: RelatedLink[]; // Thêm related links
    links?: RelatedLink[]; // Thêm external links
}

export async function getPublications(): Promise<Publication[]> {
    return readDataFiles<Publication>('publications');
}

// Hàm mới để lấy topics từ publications và đếm số lượng
export async function getPublicationTopicsWithCounts(): Promise<{ topic: string; count: number }[]> {
    const publications = await getPublications();
    const topicCounts: { [key: string]: number } = {};
    console.log('publications', publications);
    if (!Array.isArray(publications)) {
        console.warn("getPublications did not return an array.");
        return [];
    }

    publications.forEach(pub => {
        if (Array.isArray(pub.topics)) {
            pub.topics.forEach(item => {
                if (typeof item === 'string' && item.trim() !== '') {
                    const trimmedTopic = item.trim();
                    topicCounts[trimmedTopic] = (topicCounts[trimmedTopic] || 0) + 1;
                }
            });
        }
    });

    // Chuyển đổi thành mảng { topic: string, count: number } và sắp xếp
    const sortedTopics = Object.entries(topicCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic)); // Sắp xếp theo count giảm dần, sau đó theo tên

    return sortedTopics;
}

// Interface Product (Cập nhật để khớp file mẫu products_1.json)
export interface Product {
    id: number;
    author?: string[];
    name: string;
    description?: string;
    images?: { url: string; caption: string }[] | string[];
    tags?: string[]; // Dùng tags
    demoUrl?: string | null;
    link?: string; // URL chính?
    lab?: string | null;
    "social reviews"?: any[]; // JSON không cho phép key có dấu cách nếu không trong ngoặc kép
    technologies?: string[]; // Giữ lại nếu cần
    date: string; // YYYY-MM-DD
    // Giữ lại nếu cần
    url?: string;
    related?: RelatedLink[]; // Thêm related links
    links?: RelatedLink[]; // Thêm external links
}

export async function getProducts(): Promise<Product[]> {
    const products = await readDataFiles<Product>('products');
     // Chuyển đổi url = link nếu url thiếu?
    return products.map(p => ({ ...p, url: p.url ?? p.link }));
}

// Interface Blog (Cập nhật để khớp file mẫu spatial-based augmentation.json)
export interface Blog {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    authors?: string[];
    excerpt?: string;
    tags?: string[];
    keywords?: string[];
    url: string;
    featuredImage?: string;
    images?: { url: string; caption: string }[] | string[];
    contentFile?: string;
    content?: string; // Thêm trường content nếu cần lưu text trực tiếp
    category?: string;
    readingTime?: string;
    related?: RelatedLink[]; // Thêm related links
    links?: RelatedLink[]; // Thêm external links
}

export function getBlogs(): Promise<Blog[]> {
    return readDataFiles<Blog>('blogs');
}

// Interface JourneyEntry (Cập nhật để phù hợp với dữ liệu thực tế)
export interface JourneyEntry {
    id?: number | string; // Có thể là number hoặc string
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    tags?: string[];
    category?: string; // Thêm từ tên thư mục nếu không có
    images?: { url: string; caption: string }[] | string[];
    content?: any; // Có thể là string hoặc mảng block
    related?: RelatedLink[];
    links?: RelatedLink[];
    author?: string | string[];
}

export function getJourneys(): Promise<JourneyEntry[]> {
    return readJourneyFiles<JourneyEntry>();
}