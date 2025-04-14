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
  main_image?: { url: string; caption: string }; // Ảnh chính hiển thị trên danh sách project
  tags?: string[]; // Sử dụng tags làm chính
  topics?: string[]; // Thêm trường topics tương tự như trong Blog
  productUrl?: string | null;
  githubUrl?: string | null;
  technologies?: string[]; // Giữ lại nếu cần
  videoUrl?: string | null;
  content?: string | BlogContentItem[];
  company?: string; // Công ty mà dự án được xây dựng cho
  lab?: string | null; // Phòng lab nghiên cứu liên quan đến dự án
  // Thêm các trường khác từ file mẫu nếu cần
  name?: string; // Giữ lại name nếu dùng ở đâu đó
  repoUrl?: string; // Giữ lại nếu dùng ở đâu đó
  liveUrl?: string | null; // Giữ lại nếu dùng ở đâu đó
  related?: RelatedLink[]; // Thêm related links
  links?: RelatedLink[]; // Thêm external links
  unexpectedInsights?: string[]; // Các phát hiện bất ngờ
  notableObservations?: string[]; // Các quan sát đáng chú ý
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
    highlight?: boolean; // Thêm trường highlight để đánh dấu publication nổi bật
    type?: 'Conference' | 'Journal' | 'Workshop'; // Thêm trường type để phân loại
    venue?: string;
    year: number;
    abstract?: string;
    fullText?: string;
    // 6 phần quan trọng của publication
    problem?: Array<{ type: 'text' | 'image' | 'video'; text?: string; url?: string; caption?: string; videoId?: string }> | string; // Vấn đề (Problem): Nêu bài toán đang tồn tại và tại sao quan trọng
    gap?: Array<{ type: 'text' | 'image' | 'video'; text?: string; url?: string; caption?: string; videoId?: string }> | string; // Khoảng trống (Gap): Chỉ ra hạn chế của các nghiên cứu hiện tại
    solution?: Array<{ type: 'text' | 'image' | 'video'; text?: string; url?: string; caption?: string; videoId?: string }> | string; // Giải pháp đề xuất (Proposed Method): Nêu ý tưởng chính, cách tiếp cận
    results?: Array<{ type: 'text' | 'image' | 'video'; text?: string; url?: string; caption?: string; videoId?: string }> | string; // Kết quả chính (Key Results): Trình bày kết quả định lượng ấn tượng
    insights?: Array<{ type: 'text' | 'image' | 'video'; text?: string; url?: string; caption?: string; videoId?: string }> | string; // Phát hiện / Hiểu biết thú vị (Insight / Observation): Gợi mở chiều sâu
    contributions?: Array<{ type: 'text' | 'image' | 'video'; text?: string; url?: string; caption?: string; videoId?: string }> | string; // Đóng góp chính + Hướng phát triển (Contributions & Future Work)
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
    references?: Record<string, string>; // Thêm trường references để lưu trữ thông tin trích dẫn
    // Giữ lại nếu cần
    url?: string;
    technologies?: string[];
    related?: RelatedLink[]; // Thêm related links
    links?: RelatedLink[]; // Thêm external links
}

export async function getPublications(): Promise<Publication[]> {
    return readDataFiles<Publication>('publications');
}

// Hàm tạo slug từ title hoặc id
export function createSlug(title: string | undefined, id: string | number | undefined): string {
    if (typeof title === 'string' && title.trim() !== '') {
        return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    } else if (id !== null && id !== undefined) {
        return id.toString();
    }
    return 'unknown';
}

// Hàm lấy các publication nổi bật
export async function getHighlightedPublications(limit: number = 2): Promise<Publication[]> {
    const publications = await getPublications();
    // Lọc các publication có highlight và sắp xếp theo năm mới nhất
    const highlightedPublications = publications
        .filter(pub => pub.highlight)
        .sort((a, b) => (b.year || 0) - (a.year || 0));


    // Nếu không có publication nào có highlight, trả về các publication mới nhất
    if (highlightedPublications.length === 0) {
        console.warn("No highlighted publications found. Returning latest publications instead.", publications);
        return publications
            .sort((a, b) => (b.year || 0) - (a.year || 0))
            .slice(0, limit);
    }
    // console.log("Highlighted publications:", highlightedPublications);

    // Đảm bảo trả về các publication mới nhất trong số các publication được highlight
    return highlightedPublications.slice(0, limit);
}

// Hàm mới để lấy topics từ publications và đếm số lượng
export async function getPublicationTopicsWithCounts(): Promise<{ topic: string; count: number }[]> {
    const publications = await getPublications();
    const topicCounts: { [key: string]: number } = {};

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

// Hàm để lấy topics từ blogs và projects và đếm số lượng
export async function getOngoingExplorationTopics(): Promise<{ topic: string; count: number; source: string[] }[]> {
    const [blogs, projects] = await Promise.all([
        getBlogs(),
        getProjects()
    ]);

    const topicCounts: { [key: string]: { count: number; source: Set<string> } } = {};

    // Xử lý topics từ blogs
    if (Array.isArray(blogs)) {
        blogs.forEach(blog => {
            if (Array.isArray(blog.topics)) {
                blog.topics.forEach(item => {
                    if (typeof item === 'string' && item.trim() !== '') {
                        const trimmedTopic = item.trim();
                        if (!topicCounts[trimmedTopic]) {
                            topicCounts[trimmedTopic] = { count: 0, source: new Set() };
                        }
                        topicCounts[trimmedTopic].count += 1;
                        topicCounts[trimmedTopic].source.add('blog');
                    }
                });
            }
        });
    }

    // Xử lý topics từ projects
    if (Array.isArray(projects)) {
        projects.forEach(project => {
            if (Array.isArray(project.topics)) {
                project.topics.forEach(item => {
                    if (typeof item === 'string' && item.trim() !== '') {
                        const trimmedTopic = item.trim();
                        if (!topicCounts[trimmedTopic]) {
                            topicCounts[trimmedTopic] = { count: 0, source: new Set() };
                        }
                        topicCounts[trimmedTopic].count += 1;
                        topicCounts[trimmedTopic].source.add('project');
                    }
                });
            }
        });
    }

    // Chuyển đổi thành mảng và sắp xếp
    const sortedTopics = Object.entries(topicCounts)
        .map(([topic, { count, source }]) => ({
            topic,
            count,
            source: Array.from(source)
        }))
        .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));

    return sortedTopics;
}

// Đọc file technologies.json để lấy cấu trúc phân loại
export async function getTechnologyCategories(): Promise<Record<string, Record<string, string[]>>> {
    try {
        const filePath = path.join(dataPath, 'technologies.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        return data.AI_Architecture || {};
    } catch (error) {
        console.error('Error reading technologies.json:', error);
        return {};
    }
}

// Hàm để tìm danh mục cho một công nghệ
function findCategoryForTechnology(tech: string, categories: Record<string, Record<string, any>>): { mainCategory: string; subCategory: string; nestedSubCategory?: string } | null {
    const techLower = tech.toLowerCase();

    // Danh sách các subCategory có cấu trúc lồng nhau
    const nestedSubCategories = [
        'Foundation Models', 'Model Serving', 'Advanced Serving', 'Inference APIs',
        'Monitoring', 'Ethics & Safety', 'Fairness & Inclusion', 'Explainability & Governance',
        'RAG', 'Agents', 'Multi-Modal', 'Edge AI', 'Neural Databases', 'Neuromorphic Computing'
    ];

    // Kiểm tra trong tất cả các danh mục
    for (const mainCategory in categories) {
        for (const subCategory in categories[mainCategory]) {
            // Kiểm tra xem subCategory có phải là một object lồng nhau không
            if (nestedSubCategories.includes(subCategory)) {
                // Xử lý các subCategory lồng nhau
                for (const nestedSubCategory in categories[mainCategory][subCategory]) {
                    const techList = categories[mainCategory][subCategory][nestedSubCategory];
                    if (Array.isArray(techList)) {
                        for (const item of techList) {
                            if (item.toLowerCase() === techLower) {
                                return { mainCategory, subCategory, nestedSubCategory };
                            }
                        }
                    }
                }
            } else {
                // Xử lý các subCategory thông thường
                const techList = categories[mainCategory][subCategory];
                if (Array.isArray(techList)) {
                    for (const item of techList) {
                        if (item.toLowerCase() === techLower) {
                            return { mainCategory, subCategory };
                        }
                    }
                }
            }
        }
    }

    // Nếu không tìm thấy trong danh mục cụ thể, kiểm tra trong Skills Overview
    if (categories['Skills Overview']) {
        for (const subCategory in categories['Skills Overview']) {
            const techList = categories['Skills Overview'][subCategory];
            if (Array.isArray(techList)) {
                for (const item of techList) {
                    if (item.toLowerCase() === techLower) {
                        return { mainCategory: 'Skills Overview', subCategory };
                    }
                }
            }
        }
    }

    return null;
}

// Hàm để lấy tất cả technologies từ các nguồn khác nhau và phân loại chúng
export async function getAllTechnologies(): Promise<{
    categorizedTechs: Record<string, Record<string, any>>;
    uncategorizedTechs: { technology: string; count: number; sources: string[] }[];
}> {
    const [projects, publications, blogs, products, categories] = await Promise.all([
        getProjects(),
        getPublications(),
        getBlogs(),
        getProducts(),
        getTechnologyCategories()
    ]);

    const techCounts: { [key: string]: { count: number; sources: Set<string> } } = {};

    // Xử lý technologies từ projects
    if (Array.isArray(projects)) {
        projects.forEach(project => {
            if (Array.isArray(project.technologies)) {
                project.technologies.forEach(item => {
                    if (typeof item === 'string' && item.trim() !== '') {
                        const trimmedTech = item.trim();
                        if (!techCounts[trimmedTech]) {
                            techCounts[trimmedTech] = { count: 0, sources: new Set() };
                        }
                        techCounts[trimmedTech].count += 1;
                        techCounts[trimmedTech].sources.add('project');
                    }
                });
            }
        });
    }

    // Xử lý technologies từ publications
    if (Array.isArray(publications)) {
        publications.forEach(pub => {
            if (Array.isArray(pub.technologies)) {
                pub.technologies.forEach(item => {
                    if (typeof item === 'string' && item.trim() !== '') {
                        const trimmedTech = item.trim();
                        if (!techCounts[trimmedTech]) {
                            techCounts[trimmedTech] = { count: 0, sources: new Set() };
                        }
                        techCounts[trimmedTech].count += 1;
                        techCounts[trimmedTech].sources.add('publication');
                    }
                });
            }
        });
    }

    // Xử lý technologies từ blogs
    if (Array.isArray(blogs)) {
        blogs.forEach(blog => {
            if (Array.isArray(blog.technologies)) {
                blog.technologies.forEach(item => {
                    if (typeof item === 'string' && item.trim() !== '') {
                        const trimmedTech = item.trim();
                        if (!techCounts[trimmedTech]) {
                            techCounts[trimmedTech] = { count: 0, sources: new Set() };
                        }
                        techCounts[trimmedTech].count += 1;
                        techCounts[trimmedTech].sources.add('blog');
                    }
                });
            }
        });
    }

    // Xử lý technologies từ products
    if (Array.isArray(products)) {
        products.forEach(product => {
            if (Array.isArray(product.technologies)) {
                product.technologies.forEach(item => {
                    if (typeof item === 'string' && item.trim() !== '') {
                        const trimmedTech = item.trim();
                        if (!techCounts[trimmedTech]) {
                            techCounts[trimmedTech] = { count: 0, sources: new Set() };
                        }
                        techCounts[trimmedTech].count += 1;
                        techCounts[trimmedTech].sources.add('product');
                    }
                });
            }
        });
    }

    // Chuyển đổi thành mảng và sắp xếp
    const allTechs = Object.entries(techCounts)
        .map(([technology, { count, sources }]) => ({
            technology,
            count,
            sources: Array.from(sources)
        }))
        .sort((a, b) => b.count - a.count || a.technology.localeCompare(b.technology));

    // Phân loại các công nghệ
    const categorizedTechs: Record<string, Record<string, any>> = {};
    const uncategorizedTechs: { technology: string; count: number; sources: string[] }[] = [];

    // Danh sách các subCategory có cấu trúc lồng nhau
    const nestedSubCategories = [
        'Foundation Models', 'Model Serving', 'Advanced Serving', 'Inference APIs',
        'Monitoring', 'Ethics & Safety', 'Fairness & Inclusion', 'Explainability & Governance',
        'RAG', 'Agents', 'Multi-Modal', 'Edge AI', 'Neural Databases', 'Neuromorphic Computing'
    ];

    allTechs.forEach(tech => {
        const category = findCategoryForTechnology(tech.technology, categories);

        if (category) {
            const { mainCategory, subCategory, nestedSubCategory } = category;

            if (!categorizedTechs[mainCategory]) {
                categorizedTechs[mainCategory] = {};
            }

            if (nestedSubCategory) {
                // Xử lý các công nghệ thuộc cấp độ lồng nhau
                if (!categorizedTechs[mainCategory][subCategory]) {
                    categorizedTechs[mainCategory][subCategory] = {};
                }

                if (!categorizedTechs[mainCategory][subCategory][nestedSubCategory]) {
                    categorizedTechs[mainCategory][subCategory][nestedSubCategory] = [];
                }

                categorizedTechs[mainCategory][subCategory][nestedSubCategory].push(tech);
            } else {
                // Xử lý các công nghệ thuộc cấp độ thông thường
                if (!categorizedTechs[mainCategory][subCategory]) {
                    categorizedTechs[mainCategory][subCategory] = [];
                }

                categorizedTechs[mainCategory][subCategory].push(tech);
            }
        } else {
            uncategorizedTechs.push(tech);
        }
    });

    return { categorizedTechs, uncategorizedTechs };
}

// Interface Product (Cập nhật để khớp file mẫu products_1.json)
export interface Product {
    id: number;
    author?: string[];
    name: string;
    description?: string;
    content?: string | BlogContentItem[]; // Nội dung chi tiết về sản phẩm
    images?: { url: string; caption: string }[] | string[];
    main_image?: { url: string; caption: string }; // Ảnh chính hiển thị trên danh sách product
    tags?: string[]; // Dùng tags
    topics?: string[]; // Chủ đề của sản phẩm
    videoUrl?: string | null; // Link YouTube để mô tả sản phẩm
    productUrl?: string | null; // Link đến website sản phẩm
    demoUrl?: string | null; // Link đến video demo trên YouTube
    githubUrl?: string | null; // Link đến mã nguồn GitHub
    company?: string; // Công ty mà sản phẩm được xây dựng cho
    lab?: string | null; // Phòng lab nghiên cứu
    "social reviews"?: any[]; // JSON không cho phép key có dấu cách nếu không trong ngoặc kép
    technologies?: string[]; // Giữ lại nếu cần
    date: string; // YYYY-MM-DD
    // Giữ lại nếu cần để tương thích ngược
    url?: string;
    link?: string;
    related?: RelatedLink[]; // Thêm related links
    links?: RelatedLink[]; // Thêm external links
    unexpectedInsights?: string[]; // Các phát hiện bất ngờ
    notableObservations?: string[]; // Các quan sát đáng chú ý
}

export async function getProducts(): Promise<Product[]> {
    const products = await readDataFiles<Product>('products');
    // Xử lý các trường để đảm bảo tương thích ngược
    return products.map(p => ({
        ...p,
        // Đảm bảo các trường URL được điền đầy đủ
        url: p.url ?? p.link ?? p.productUrl ?? undefined,
        productUrl: p.productUrl ?? p.url ?? p.link,
        demoUrl: p.demoUrl ?? p.videoUrl ?? null,
        // Đảm bảo tags và technologies được điền đầy đủ
        tags: p.tags ?? p.technologies,
    }));
}

// Interface cho các phần nội dung blog
export interface BlogContentItem {
    type: 'text' | 'image';
    text?: string;
    url?: string;
    caption?: string;
}

// Interface Blog (Cập nhật để khớp file mẫu spatial-based augmentation.json)
export interface Blog {
    id: string | number;
    title: string;
    description?: string;
    author?: string;
    date: string; // YYYY-MM-DD
    content?: string | BlogContentItem[];
    topics?: string[];
    videoUrl?: string;
    githubUrl?: string;
    productUrl?: string;
    technologies?: string[];
    images?: Array<{ url: string; caption?: string; title?: string }> | string[];
    main_image?: { url: string; caption: string }; // Ảnh chính hiển thị trên danh sách blog
    related?: RelatedLink[];
    // Các trường mới
    unexpectedInsights?: string[];
    notableObservations?: string[];
    references?: Record<string, string>; // Thêm trường references để lưu trữ thông tin trích dẫn
    // Giữ lại các trường cũ để tương thích ngược
    authors?: string[];
    excerpt?: string;
    tags?: string[];
    keywords?: string[];
    url?: string;
    featuredImage?: string;
    contentFile?: string;
    category?: string;
    readingTime?: string;
    links?: RelatedLink[];
}

export function getBlogs(): Promise<Blog[]> {
    return readDataFiles<Blog>('blogs');
}

// Hàm tạo slug cho blog
export function generateBlogSlug(blog: Blog): string {
  if (typeof blog.title === 'string' && blog.title.trim() !== '') {
    return blog.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  } else if (blog.id !== null && blog.id !== undefined) {
    return blog.id.toString();
  }
  return '';
}

// Hàm lấy các Notable Observations từ blogs, products và projects
export async function getLatestNotableObservations(limit: number = 2): Promise<{title: string; observation: string; slug: string; date: string; type: 'blog' | 'product' | 'project'}[]> {
  const [blogs, products, projects] = await Promise.all([
    getBlogs(),
    getProducts(),
    getProjects()
  ]);

  const allObservations: {title: string; observation: string; slug: string; date: string; type: 'blog' | 'product' | 'project'}[] = [];

  // Lấy observations từ blogs
  blogs
    .filter(blog => Array.isArray(blog.notableObservations) && blog.notableObservations.length > 0)
    .forEach(blog => {
      if (Array.isArray(blog.notableObservations) && blog.notableObservations.length > 0) {
        allObservations.push({
          title: blog.title,
          observation: blog.notableObservations[0],
          slug: generateBlogSlug(blog),
          date: blog.date || '',
          type: 'blog'
        });
      }
    });

  // Lấy observations từ products
  products
    .filter(product => Array.isArray(product.notableObservations) && product.notableObservations.length > 0)
    .forEach(product => {
      if (Array.isArray(product.notableObservations) && product.notableObservations.length > 0) {
        allObservations.push({
          title: product.name,
          observation: product.notableObservations[0],
          slug: product.id.toString(),
          date: product.date || '',
          type: 'product'
        });
      }
    });

  // Lấy observations từ projects
  projects
    .filter(project => Array.isArray(project.notableObservations) && project.notableObservations.length > 0)
    .forEach(project => {
      if (Array.isArray(project.notableObservations) && project.notableObservations.length > 0) {
        allObservations.push({
          title: project.title,
          observation: project.notableObservations[0],
          slug: project.id.toString(),
          date: project.date || '',
          type: 'project'
        });
      }
    });

  // Sắp xếp tất cả observations theo ngày mới nhất và lấy limit phần tử đầu tiên
  return allObservations
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Hàm lấy các Unexpected Insights từ blogs, products và projects
export async function getLatestUnexpectedInsights(limit: number = 2): Promise<{title: string; insight: string; slug: string; date: string; type: 'blog' | 'product' | 'project'}[]> {
  const [blogs, products, projects] = await Promise.all([
    getBlogs(),
    getProducts(),
    getProjects()
  ]);

  const allInsights: {title: string; insight: string; slug: string; date: string; type: 'blog' | 'product' | 'project'}[] = [];

  // Lấy insights từ blogs
  blogs
    .filter(blog => Array.isArray(blog.unexpectedInsights) && blog.unexpectedInsights.length > 0)
    .forEach(blog => {
      if (Array.isArray(blog.unexpectedInsights) && blog.unexpectedInsights.length > 0) {
        allInsights.push({
          title: blog.title,
          insight: blog.unexpectedInsights[0],
          slug: generateBlogSlug(blog),
          date: blog.date || '',
          type: 'blog'
        });
      }
    });

  // Lấy insights từ products
  products
    .filter(product => Array.isArray(product.unexpectedInsights) && product.unexpectedInsights.length > 0)
    .forEach(product => {
      if (Array.isArray(product.unexpectedInsights) && product.unexpectedInsights.length > 0) {
        allInsights.push({
          title: product.name,
          insight: product.unexpectedInsights[0],
          slug: product.id.toString(),
          date: product.date || '',
          type: 'product'
        });
      }
    });

  // Lấy insights từ projects
  projects
    .filter(project => Array.isArray(project.unexpectedInsights) && project.unexpectedInsights.length > 0)
    .forEach(project => {
      if (Array.isArray(project.unexpectedInsights) && project.unexpectedInsights.length > 0) {
        allInsights.push({
          title: project.title,
          insight: project.unexpectedInsights[0],
          slug: project.id.toString(),
          date: project.date || '',
          type: 'project'
        });
      }
    });

  // Sắp xếp tất cả insights theo ngày mới nhất và lấy limit phần tử đầu tiên
  return allInsights
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
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