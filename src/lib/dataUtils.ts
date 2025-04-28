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
                // console.log("Processing blog topics:", blog.topics);
                blog.topics.forEach(item => {
                    if (typeof item === 'string' && item.trim() !== '') {
                        const trimmedTopic = item.trim();
                        // console.log("Processing blog topics trimmedTopic:", trimmedTopic);
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
                    // console.log("Processing project topics:", project.topics);
                    if (typeof item === 'string' && item.trim() !== '') {
                        const trimmedTopic = item.trim();
                        // console.log("Processing project topics trimmedTopic:", trimmedTopic);
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
    // console.log("topicCounts:", topicCounts);
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
        // console.log("getTechnologyCategories data:", data);
        return data.AI_Architecture || {};
    } catch (error) {
        console.error('Error reading technologies.json:', error);
        return {};
    }
}

// Đọc file technologies.json để lấy cấu trúc phân loại
export async function getTopicCategories(): Promise<Record<string, Record<string, string[]>>> {
    try {
        const filePath = path.join(dataPath, 'topics.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        // console.log("getTopicCategories data:", data);
        // console.log("getTopicCategories data dddd:", data["Artificial Intelligence"]["Ethics and Philosophy"]["AI Ethics"]);
        return data || {};
    } catch (error) {
        console.error('Error reading topics.json:', error);
        return {};
    }
}



// Hàm để tìm danh mục cho một công nghệ
function findCategoryForTechnology(tech: string, categories: Record<string, Record<string, any>>): { mainCategory: string; subCategory: string; nestedSubCategory?: string } | null {
    const techLower = tech.toLowerCase();

    // Kiểm tra trong tất cả các danh mục
    for (const mainCategory in categories) {
        for (const subCategory in categories[mainCategory]) {
            // Kiểm tra xem subCategory có phải là một object lồng nhau không
            const isNested = typeof categories[mainCategory][subCategory] === 'object' &&
                           !Array.isArray(categories[mainCategory][subCategory]) &&
                           Object.keys(categories[mainCategory][subCategory]).some(key =>
                               typeof categories[mainCategory][subCategory][key] === 'object' ||
                               Array.isArray(categories[mainCategory][subCategory][key]));

            if (isNested) {
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

    // Xác định các danh mục lồng nhau dựa trên cấu trúc dữ liệu
    const detectNestedCategories = (data: Record<string, Record<string, any>>) => {
        const nestedCategories: string[] = [];
        for (const category in data) {
            for (const subcategory in data[category]) {
                const isNested = typeof data[category][subcategory] === 'object' &&
                               !Array.isArray(data[category][subcategory]) &&
                               Object.keys(data[category][subcategory]).some(key =>
                                   typeof data[category][subcategory][key] === 'object' ||
                                   Array.isArray(data[category][subcategory][key]));
                if (isNested) {
                    nestedCategories.push(subcategory);
                }
            }
        }
        return nestedCategories;
    };

    const nestedSubCategories = detectNestedCategories(categories);

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

    // Sử dụng nestedSubCategories để phân loại các công nghệ
    // console.log('Nested subcategories:', nestedSubCategories);

    return { categorizedTechs, uncategorizedTechs };
}


// Hàm để lấy tất cả technologies từ các nguồn khác nhau và phân loại chúng
export async function getAllTopics(): Promise<{
    categorizedTechs: Record<string, Record<string, any>>;
    uncategorizedTechs: { technology: string; count: number; sources: string[] }[];
}> {
    const [projects, blogs, categories] = await Promise.all([
        getProjects(),
        // getPublications(),
        getBlogs(),
        // getProducts(),
        getTopicCategories()
    ]);
    // console.log("categories 1", categories)

    const techCounts: { [key: string]: { count: number; sources: Set<string> } } = {};

    // Xử lý technologies từ projects
    if (Array.isArray(projects)) {
        projects.forEach(project => {
            if (Array.isArray(project.topics)) {
                project.topics.forEach(item => {
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

    // Xử lý technologies từ blogs
    if (Array.isArray(blogs)) {
        blogs.forEach(blog => {
            if (Array.isArray(blog.topics)) {
                blog.topics.forEach(item => {
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

    // // Xử lý technologies từ products
    // if (Array.isArray(products)) {
    //     products.forEach(product => {
    //         if (Array.isArray(product.topics)) {
    //             product.topics.forEach(item => {
    //                 if (typeof item === 'string' && item.trim() !== '') {
    //                     const trimmedTech = item.trim();
    //                     if (!techCounts[trimmedTech]) {
    //                         techCounts[trimmedTech] = { count: 0, sources: new Set() };
    //                     }
    //                     techCounts[trimmedTech].count += 1;
    //                     techCounts[trimmedTech].sources.add('product');
    //                 }
    //             });
    //         }
    //     });
    // }

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

    // Xác định các danh mục lồng nhau dựa trên cấu trúc dữ liệu
    const detectNestedCategories = (data: Record<string, Record<string, any>>) => {
        const nestedCategories: string[] = [];
        for (const category in data) {
            for (const subcategory in data[category]) {
                const isNested = typeof data[category][subcategory] === 'object' &&
                               !Array.isArray(data[category][subcategory]) &&
                               Object.keys(data[category][subcategory]).some(key =>
                                   typeof data[category][subcategory][key] === 'object' ||
                                   Array.isArray(data[category][subcategory][key]));
                if (isNested) {
                    nestedCategories.push(subcategory);
                }
            }
        }
        return nestedCategories;
    };

    // console.log("categories 2", categories)
    const nestedSubCategories = detectNestedCategories(categories);

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

    // Sử dụng nestedSubCategories để phân loại các công nghệ
    // console.log('Nested subcategories:', nestedSubCategories);

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

// Interface for Notable Observation and Unexpected Insight items
export interface ObservationItem {
  title: string;
  observation: string;
  slug: string;
  date: string;
  type: 'blog' | 'product' | 'project';
  topics?: string[];
}

export interface InsightItem {
  title: string;
  insight: string;
  slug: string;
  date: string;
  type: 'blog' | 'product' | 'project';
  topics?: string[];
}

// Hàm lấy tất cả Notable Observations từ blogs, products và projects
export async function getAllNotableObservations(): Promise<ObservationItem[]> {
  const [blogs, products, projects] = await Promise.all([
    getBlogs(),
    getProducts(),
    getProjects()
  ]);

  const allObservations: ObservationItem[] = [];

  // Lấy tất cả observations từ blogs
  blogs
    .filter(blog => Array.isArray(blog.notableObservations) && blog.notableObservations.length > 0)
    .forEach(blog => {
      if (Array.isArray(blog.notableObservations)) {
        blog.notableObservations.forEach(observation => {
          allObservations.push({
            title: blog.title,
            observation: observation,
            slug: generateBlogSlug(blog),
            date: blog.date || '',
            type: 'blog',
            topics: blog.topics || []
          });
        });
      }
    });

  // Lấy tất cả observations từ products
  products
    .filter(product => Array.isArray(product.notableObservations) && product.notableObservations.length > 0)
    .forEach(product => {
      if (Array.isArray(product.notableObservations)) {
        product.notableObservations.forEach(observation => {
          allObservations.push({
            title: product.name,
            observation: observation,
            slug: product.id.toString(),
            date: product.date || '',
            type: 'product',
            topics: product.topics || []
          });
        });
      }
    });

  // Lấy tất cả observations từ projects
  projects
    .filter(project => Array.isArray(project.notableObservations) && project.notableObservations.length > 0)
    .forEach(project => {
      if (Array.isArray(project.notableObservations)) {
        project.notableObservations.forEach(observation => {
          allObservations.push({
            title: project.title,
            observation: observation,
            slug: project.id.toString(),
            date: project.date || '',
            type: 'project',
            topics: project.topics || []
          });
        });
      }
    });

  // Sắp xếp tất cả observations theo ngày mới nhất
  return allObservations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Hàm lấy các Notable Observations từ blogs, products và projects với giới hạn số lượng
export async function getLatestNotableObservations(limit: number = 2): Promise<ObservationItem[]> {
  const allObservations = await getAllNotableObservations();
  return allObservations.slice(0, limit);
}

// Hàm lấy tất cả Unexpected Insights từ blogs, products và projects
export async function getAllUnexpectedInsights(): Promise<InsightItem[]> {
  const [blogs, products, projects] = await Promise.all([
    getBlogs(),
    getProducts(),
    getProjects()
  ]);

  const allInsights: InsightItem[] = [];

  // Lấy tất cả insights từ blogs
  blogs
    .filter(blog => Array.isArray(blog.unexpectedInsights) && blog.unexpectedInsights.length > 0)
    .forEach(blog => {
      if (Array.isArray(blog.unexpectedInsights)) {
        blog.unexpectedInsights.forEach(insight => {
          allInsights.push({
            title: blog.title,
            insight: insight,
            slug: generateBlogSlug(blog),
            date: blog.date || '',
            type: 'blog',
            topics: blog.topics || []
          });
        });
      }
    });

  // Lấy tất cả insights từ products
  products
    .filter(product => Array.isArray(product.unexpectedInsights) && product.unexpectedInsights.length > 0)
    .forEach(product => {
      if (Array.isArray(product.unexpectedInsights)) {
        product.unexpectedInsights.forEach(insight => {
          allInsights.push({
            title: product.name,
            insight: insight,
            slug: product.id.toString(),
            date: product.date || '',
            type: 'product',
            topics: product.topics || []
          });
        });
      }
    });

  // Lấy tất cả insights từ projects
  projects
    .filter(project => Array.isArray(project.unexpectedInsights) && project.unexpectedInsights.length > 0)
    .forEach(project => {
      if (Array.isArray(project.unexpectedInsights)) {
        project.unexpectedInsights.forEach(insight => {
          allInsights.push({
            title: project.title,
            insight: insight,
            slug: project.id.toString(),
            date: project.date || '',
            type: 'project',
            topics: project.topics || []
          });
        });
      }
    });

  // Sắp xếp tất cả insights theo ngày mới nhất
  return allInsights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Hàm lấy các Unexpected Insights từ blogs, products và projects với giới hạn số lượng
export async function getLatestUnexpectedInsights(limit: number = 2): Promise<InsightItem[]> {
  const allInsights = await getAllUnexpectedInsights();
  return allInsights.slice(0, limit);
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

// Interface cho cấu trúc dữ liệu topics.json
export interface TopicsData {
    [category: string]: {
        [subcategory: string]: string[] | {
            [nestedSubcategory: string]: string[]
        }
    }
}

// // Hàm đọc file topics.json
// export async function getTopicsData(): Promise<TopicsData> {
//     try {
//         const filePath = path.join(dataPath, 'topics.json');
//         const fileContent = await fs.readFile(filePath, 'utf8');
//         if (fileContent.trim() === '') {
//             console.warn("topics.json is empty.");
//             return {};
//         }
//         return JSON.parse(fileContent) as TopicsData;
//     } catch (error) {
//         if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
//             console.warn(`topics.json not found.`);
//         } else {
//             console.error(`Error reading or parsing topics.json:`, error);
//         }
//         return {};
//     }
// }

// // Hàm để chuyển đổi cấu trúc topics.json thành cấu trúc phẳng cho hiển thị
// export async function getExplorationTopicsFromFile(): Promise<{
//     categories: {
//         name: string;
//         subcategories: {
//             name: string;
//             isNested: boolean;
//             topics: string[] | {
//                 name: string;
//                 isNested?: boolean;
//                 topics: string[] | {
//                     name: string;
//                     topics: string[];
//                 }[];
//             }[];
//         }[];
//     }[];
// }> {
//     const topicsData = await getTopicsData();
//     const result: {
//         categories: {
//             name: string;
//             subcategories: {
//                 name: string;
//                 isNested: boolean;
//                 topics: string[] | {
//                     name: string;
//                     isNested?: boolean;
//                     topics: string[] | {
//                         name: string;
//                         topics: string[];
//                     }[];
//                 }[];
//             }[];
//         }[];
//     } = { categories: [] };

//     // Xác định các danh mục lồng nhau dựa trên cấu trúc dữ liệu
//     const detectNestedCategories = (data: Record<string, Record<string, any>>) => {
//         const nestedCategories: string[] = [];
//         for (const category in data) {
//             for (const subcategory in data[category]) {
//                 const isNested = typeof data[category][subcategory] === 'object' &&
//                                !Array.isArray(data[category][subcategory]) &&
//                                Object.keys(data[category][subcategory]).some(key =>
//                                    typeof data[category][subcategory][key] === 'object' ||
//                                    Array.isArray(data[category][subcategory][key]));
//                 if (isNested) {
//                     nestedCategories.push(subcategory);
//                 }
//             }
//         }
//         return nestedCategories;
//     };

//     const nestedSubCategories = detectNestedCategories(topicsData);

//     // Chuyển đổi cấu trúc
//     for (const categoryName in topicsData) {
//         const category = {
//             name: categoryName,
//             subcategories: [] as {
//                 name: string;
//                 isNested: boolean;
//                 topics: string[] | {
//                     name: string;
//                     topics: string[];
//                 }[];
//             }[]
//         };

//         for (const subcategoryName in topicsData[categoryName]) {
//             const subcategoryData = topicsData[categoryName][subcategoryName];
//             const isNested = nestedSubCategories.includes(subcategoryName);

//             if (isNested) {
//                 // Xử lý subcategory lồng nhau
//                 try {
//                     const nestedTopics = [] as { name: string; isNested?: boolean; topics: string[] | { name: string; topics: string[] }[] }[];
//                     for (const nestedSubcategoryName in subcategoryData as Record<string, any>) {
//                         try {
//                             const nestedTopicsList = (subcategoryData as Record<string, any>)[nestedSubcategoryName];

//                             // Kiểm tra xem nestedTopicsList có phải là một mảng hay là một đối tượng
//                             if (Array.isArray(nestedTopicsList)) {
//                                 // Nếu là mảng, xử lý như trước
//                                 nestedTopics.push({
//                                     name: nestedSubcategoryName,
//                                     topics: nestedTopicsList
//                                 });
//                             } else if (typeof nestedTopicsList === 'object' && nestedTopicsList !== null) {
//                                 // Nếu là đối tượng, xử lý cấu trúc lồng nhau sâu hơn
//                                 const level4Topics = [] as { name: string; topics: string[] }[];

//                                 for (const level4Name in nestedTopicsList) {
//                                     const level4List = nestedTopicsList[level4Name];
//                                     if (Array.isArray(level4List)) {
//                                         level4Topics.push({
//                                             name: level4Name,
//                                             topics: level4List
//                                         });
//                                     } else {
//                                         console.warn(`Level 4 topics for ${level4Name} is not an array:`, level4List);
//                                         level4Topics.push({
//                                             name: level4Name,
//                                             topics: []
//                                         });
//                                     }
//                                 }

//                                 nestedTopics.push({
//                                     name: nestedSubcategoryName,
//                                     isNested: true,
//                                     topics: level4Topics
//                                 });
//                             } else {
//                                 console.warn(`Topics for ${nestedSubcategoryName} is not an array or object:`, nestedTopicsList);
//                                 nestedTopics.push({
//                                     name: nestedSubcategoryName,
//                                     topics: []
//                                 });
//                             }
//                         } catch (error) {
//                             console.error(`Error processing nested subcategory ${nestedSubcategoryName}:`, error);
//                             nestedTopics.push({
//                                 name: nestedSubcategoryName,
//                                 topics: []
//                             });
//                         }
//                     }
//                     category.subcategories.push({
//                         name: subcategoryName,
//                         isNested: true,
//                         topics: nestedTopics as any
//                     });
//                 } catch (error) {
//                     console.error(`Error processing nested subcategory ${subcategoryName}:`, error);
//                     category.subcategories.push({
//                         name: subcategoryName,
//                         isNested: true,
//                         topics: []
//                     });
//                 }
//             } else {
//                 // Xử lý subcategory thông thường
//                 try {
//                     if (Array.isArray(subcategoryData)) {
//                         category.subcategories.push({
//                             name: subcategoryName,
//                             isNested: false,
//                             topics: subcategoryData
//                         });
//                     } else {
//                         console.warn(`Topics for ${subcategoryName} is not an array:`, subcategoryData);
//                         category.subcategories.push({
//                             name: subcategoryName,
//                             isNested: false,
//                             topics: []
//                         });
//                     }
//                 } catch (error) {
//                     console.error(`Error processing subcategory ${subcategoryName}:`, error);
//                     category.subcategories.push({
//                         name: subcategoryName,
//                         isNested: false,
//                         topics: []
//                     });
//                 }
//             }
//         }

//         result.categories.push(category);
//     }

//     return result;
// }

// Hàm để phân loại các chủ đề từ blogs và projects vào các nhóm dựa trên cấu trúc trong file topics.json
export async function getCategorizedExplorationTopics(): Promise<{
    categorized: {
        [category: string]: {
            [subcategory: string]: {
                isNested: boolean;
                topics: { topic: string; count: number; source: string[] }[] | {
                    [nestedSubcategory: string]: { topic: string; count: number; source: string[] }[]
                };
            };
        };
    };
    uncategorized: { topic: string; count: number; source: string[] }[];
}> {
    const [explorationTopics, topicsData] = await Promise.all([
        getOngoingExplorationTopics(),
        getTopicCategories()
    ]);
    // console.log("topicsData", topicsData)
    const result: {
        categorized: {
            [category: string]: {
                [subcategory: string]: {
                    isNested: boolean;
                    topics: { topic: string; count: number; source: string[] }[] | {
                        [nestedSubcategory: string]: { topic: string; count: number; source: string[] }[]
                    };
                };
            };
        };
        uncategorized: { topic: string; count: number; source: string[] }[];
    } = {
        categorized: {},
        uncategorized: []
    };

    // Xác định các danh mục lồng nhau dựa trên cấu trúc dữ liệu
    const detectNestedCategories = (data: Record<string, Record<string, any>>) => {
        const nestedCategories: string[] = [];
        for (const category in data) {
            for (const subcategory in data[category]) {
                const isNested = typeof data[category][subcategory] === 'object' &&
                               !Array.isArray(data[category][subcategory]) &&
                               Object.keys(data[category][subcategory]).some(key =>
                                   typeof data[category][subcategory][key] === 'object' ||
                                   Array.isArray(data[category][subcategory][key]));
                if (isNested) {
                    nestedCategories.push(subcategory);
                }
            }
        }
        return nestedCategories;
    };

    const nestedSubCategories = detectNestedCategories(topicsData);

    // Tạo danh sách các từ khóa và danh mục tương ứng từ file topics.json
    // Cấu trúc: {từ khóa: {category, subcategory, nestedSubcategory?}}
    const keywordCategories: {[key: string]: {category: string, subcategory: string, nestedSubcategory?: string, level4Category?: string}} = {};

    // Duyệt qua các danh mục chính
    for (const category in topicsData) {
        // Duyệt qua các danh mục con
        for (const subcategory in topicsData[category]) {
            const subcategoryData = topicsData[category][subcategory];

            // Kiểm tra xem danh mục con có lồng nhau không
            if (typeof subcategoryData === 'object' && !Array.isArray(subcategoryData)) {
                // Danh mục con lồng nhau (cấp 3)
                for (const nestedSubcategory in subcategoryData) {
                    const nestedData = subcategoryData[nestedSubcategory];

                    // Kiểm tra xem danh mục cấp 3 có lồng nhau nữa không (cấp 4)
                    if (typeof nestedData === 'object' && !Array.isArray(nestedData)) {
                        // Danh mục cấp 4
                        for (const level4Category in nestedData as Record<string, any>) {
                            const level4Data = (nestedData as Record<string, any>)[level4Category];

                            if (Array.isArray(level4Data)) {
                                // Thêm các từ khóa từ danh mục cấp 4
                                for (const topic of level4Data as string[]) {
                                    const normalizedTopic = topic.toLowerCase().trim();
                                    keywordCategories[normalizedTopic] = {
                                        category,
                                        subcategory,
                                        nestedSubcategory,
                                        level4Category
                                    };
                                }
                            }
                        }
                    } else if (Array.isArray(nestedData)) {
                        // Thêm các từ khóa từ danh mục cấp 3
                        for (const topic of nestedData as string[]) {
                            const normalizedTopic = topic.toLowerCase().trim();
                            keywordCategories[normalizedTopic] = {
                                category,
                                subcategory,
                                nestedSubcategory
                            };
                        }
                    }
                }
            } else if (Array.isArray(subcategoryData)) {
                // Danh mục con thông thường (cấp 2)
                for (const topic of subcategoryData as string[]) {
                    const normalizedTopic = topic.toLowerCase().trim();
                    keywordCategories[normalizedTopic] = {
                        category,
                        subcategory
                    };
                }
            }
        }
    }

    // Thêm các từ khóa đặc biệt
    // General AI terms
    // keywordCategories['artificial intelligence'] = {category: 'Artificial Intelligence', subcategory: 'Foundations'};
    // // 'ai' as a standalone word (with word boundaries)
    // keywordCategories[' ai '] = {category: 'Artificial Intelligence', subcategory: 'Foundations'};
    // keywordCategories['ai.'] = {category: 'Artificial Intelligence', subcategory: 'Foundations'};
    // keywordCategories['ai,'] = {category: 'Artificial Intelligence', subcategory: 'Foundations'};
    // keywordCategories['ai;'] = {category: 'Artificial Intelligence', subcategory: 'Foundations'};
    // keywordCategories['ai:'] = {category: 'Artificial Intelligence', subcategory: 'Foundations'};
    // keywordCategories['ai-'] = {category: 'Artificial Intelligence', subcategory: 'Foundations'};

    // Tạo cấu trúc phân loại từ file topics.json
    for (const category in topicsData) {
        result.categorized[category] = {};

        for (const subcategory in topicsData[category]) {
            const isNested = nestedSubCategories.includes(subcategory);
            const subcategoryData = topicsData[category][subcategory];

            if (isNested) {
                // Xử lý subcategory lồng nhau
                result.categorized[category][subcategory] = {
                    isNested: true,
                    topics: {}
                };

                for (const nestedSubcategory in subcategoryData as Record<string, any>) {
                    const nestedTopicsData = (subcategoryData as Record<string, any>)[nestedSubcategory];

                    // Kiểm tra xem nestedTopicsData có phải là một mảng hay là một đối tượng
                    if (Array.isArray(nestedTopicsData)) {
                        // Nếu là mảng, xử lý như trước
                        (result.categorized[category][subcategory].topics as Record<string, { topic: string; count: number; source: string[] }[]>)[nestedSubcategory] = [];
                    } else if (typeof nestedTopicsData === 'object' && nestedTopicsData !== null) {
                        // Xử lý cấu trúc lồng nhau sâu hơn (level 4)
                        (result.categorized[category][subcategory].topics as Record<string, { topic: string; count: number; source: string[] }[]>)[nestedSubcategory] = [];

                        // Xử lý từng danh mục con cấp 4
                        for (const level4Category in nestedTopicsData) {
                            const level4Topics = nestedTopicsData[level4Category];

                            if (Array.isArray(level4Topics)) {
                                // Tìm các chủ đề từ blogs và projects thuộc về nhóm này
                                for (const topic of level4Topics) {
                                    // Tìm kiếm chủ đề phù hợp với cách so sánh linh hoạt hơn
                                    const matchingTopic = explorationTopics.find(t => {
                                        // Chuẩn hóa cả hai chuỗi để so sánh
                                        const normalizedTopic = topic.toLowerCase().trim();
                                        const normalizedT = t.topic.toLowerCase().trim();

                                        // So sánh chính xác
                                        if (normalizedT === normalizedTopic) return true;

                                        // So sánh nếu chuỗi này chứa chuỗi kia
                                        if (normalizedT.includes(normalizedTopic) || normalizedTopic.includes(normalizedT)) return true;

                                        // So sánh nếu chuỗi này là một phần của chuỗi kia (các từ riêng biệt)
                                        const topicWords = normalizedTopic.split(/\s+/);
                                        const tWords = normalizedT.split(/\s+/);

                                        // Nếu có ít nhất 2 từ trùng nhau và chiều dài từ trùng > 3
                                        const commonWords = topicWords.filter((word: string) => tWords.includes(word) && word.length > 3);
                                        if (commonWords.length >= 2) return true;

                                        return false;
                                    });

                                    if (matchingTopic) {
                                        // Thêm chủ đề vào danh mục con cấp 3
                                        // Và thêm thông tin về danh mục con cấp 4
                                        const topicWithLevel4 = { ...matchingTopic, level4Category };
                                        (result.categorized[category][subcategory].topics as Record<string, { topic: string; count: number; source: string[]; level4Category?: string }[]>)[nestedSubcategory].push(topicWithLevel4);
                                    }
                                }
                            }
                        }

                        // Không cần xử lý nữa vì đã xử lý ở trên
                    }
                }
            } else {
                // Xử lý subcategory thông thường
                result.categorized[category][subcategory] = {
                    isNested: false,
                    topics: []
                };

                if (Array.isArray(subcategoryData)) {
                    // Tìm các chủ đề từ blogs và projects thuộc về nhóm này
                    for (const topic of subcategoryData) {
                        // Tìm kiếm chủ đề phù hợp với cách so sánh linh hoạt hơn
                        const matchingTopic = explorationTopics.find(t => {
                            // Chuẩn hóa cả hai chuỗi để so sánh
                            const normalizedTopic = topic.toLowerCase().trim();
                            const normalizedT = t.topic.toLowerCase().trim();

                            // So sánh chính xác
                            if (normalizedT === normalizedTopic) return true;

                            // So sánh nếu chuỗi này chứa chuỗi kia
                            if (normalizedT.includes(normalizedTopic) || normalizedTopic.includes(normalizedT)) return true;

                            // So sánh nếu chuỗi này là một phần của chuỗi kia (các từ riêng biệt)
                            const topicWords = normalizedTopic.split(/\s+/);
                            const tWords = normalizedT.split(/\s+/);

                            // Nếu có ít nhất 2 từ trùng nhau và chiều dài từ trùng > 3
                            const commonWords = topicWords.filter((word: string) => tWords.includes(word) && word.length > 3);
                            if (commonWords.length >= 2) return true;

                            return false;
                        });

                        if (matchingTopic) {
                            (result.categorized[category][subcategory].topics as { topic: string; count: number; source: string[] }[]).push(matchingTopic);
                        }
                    }
                }
            }
        }
    }



    // Các chủ đề không thuộc về nhóm nào
    result.uncategorized = explorationTopics.filter(topic => {
        // Kiểm tra xem chủ đề đã được phân loại chưa
        for (const category in result.categorized) {
            for (const subcategory in result.categorized[category]) {
                const subcategoryData = result.categorized[category][subcategory];
                if (subcategoryData.isNested) {
                    // Kiểm tra trong các nhóm lồng nhau
                    for (const nestedSubcategory in subcategoryData.topics as Record<string, { topic: string; count: number; source: string[] }[]>) {
                        const nestedTopics = (subcategoryData.topics as Record<string, { topic: string; count: number; source: string[] }[]>)[nestedSubcategory];
                        if (nestedTopics.some(t => t.topic === topic.topic)) {
                            return false;
                        }
                    }
                } else {
                    // Kiểm tra trong các nhóm thông thường
                    if ((subcategoryData.topics as { topic: string; count: number; source: string[] }[]).some(t => t.topic === topic.topic)) {
                        return false;
                    }
                }
            }
        }

        // Thử phân loại thêm vào các danh mục phổ biến
        const normalizedTopic = topic.topic.toLowerCase().trim();

        // Sử dụng keywordCategories đã được tạo trước đó

        // Kiểm tra xem chủ đề có chứa từ khóa nào không
        for (const [keyword, categoryInfo] of Object.entries(keywordCategories)) {
            // Xử lý đặc biệt cho từ khóa 'ai' để tránh phân loại sai
            if (keyword === ' ai ' || keyword === 'ai.' || keyword === 'ai,' || keyword === 'ai;' || keyword === 'ai:' || keyword === 'ai-') {
                // Kiểm tra xem 'ai' có phải là một từ riêng biệt không
                const aiRegex = new RegExp(`(^|\\s)ai($|\\s|\\.|,|;|:|-)`, 'i');
                if (aiRegex.test(normalizedTopic)) {
                    // Nếu chủ đề chính xác là 'AI' (không phân biệt chữ hoa/thường), chỉ phân loại vào Foundations
                    if (topic.topic.toLowerCase() === 'ai') {
                        // Chỉ phân loại vào Foundations
                        if (categoryInfo.subcategory === 'Foundations') {
                            // Nếu chưa có danh mục này, tạo mới
                            if (!result.categorized[categoryInfo.category]) {
                                result.categorized[categoryInfo.category] = {};
                            }

                            // Nếu chưa có danh mục con này, tạo mới
                            if (!result.categorized[categoryInfo.category][categoryInfo.subcategory]) {
                                // Kiểm tra xem có danh mục con lồng nhau không
                                const isNested = nestedSubCategories.includes(categoryInfo.subcategory);
                                result.categorized[categoryInfo.category][categoryInfo.subcategory] = {
                                    isNested: isNested,
                                    topics: isNested ? {} : []
                                };
                            }

                            // Xử lý phân loại
                            const subcategoryData = result.categorized[categoryInfo.category][categoryInfo.subcategory];

                            if (!subcategoryData.isNested) {
                                // Phân loại vào danh mục con thông thường
                                const existingTopics = subcategoryData.topics as { topic: string; count: number; source: string[] }[];
                                if (!existingTopics.some(t => t.topic === topic.topic)) {
                                    existingTopics.push(topic);
                                    return false; // Đã được phân loại, không cần thêm vào uncategorized
                                }
                            }
                        }
                    } else {
                        // Xử lý phân loại cho các chủ đề khác có chứa 'ai' như một từ riêng biệt
                        // Nếu chưa có danh mục này, tạo mới
                        if (!result.categorized[categoryInfo.category]) {
                            result.categorized[categoryInfo.category] = {};
                        }

                        // Nếu chưa có danh mục con này, tạo mới
                        if (!result.categorized[categoryInfo.category][categoryInfo.subcategory]) {
                            // Kiểm tra xem có danh mục con lồng nhau không
                            const isNested = nestedSubCategories.includes(categoryInfo.subcategory);
                            result.categorized[categoryInfo.category][categoryInfo.subcategory] = {
                                isNested: isNested,
                                topics: isNested ? {} : []
                            };
                        }

                        // Xử lý phân loại
                        const subcategoryData = result.categorized[categoryInfo.category][categoryInfo.subcategory];

                        if (subcategoryData.isNested && categoryInfo.nestedSubcategory) {
                            // Phân loại vào danh mục con lồng nhau
                            const nestedTopics = subcategoryData.topics as Record<string, { topic: string; count: number; source: string[] }[]>;

                            // Tạo danh mục con lồng nhau nếu chưa có
                            if (!nestedTopics[categoryInfo.nestedSubcategory]) {
                                nestedTopics[categoryInfo.nestedSubcategory] = [];
                            }

                            // Kiểm tra xem chủ đề đã được thêm vào danh mục này chưa
                            if (!nestedTopics[categoryInfo.nestedSubcategory].some(t => t.topic === topic.topic)) {
                                nestedTopics[categoryInfo.nestedSubcategory].push(topic);
                                return false; // Đã được phân loại, không cần thêm vào uncategorized
                            }
                        } else if (!subcategoryData.isNested) {
                            // Phân loại vào danh mục con thông thường
                            const existingTopics = subcategoryData.topics as { topic: string; count: number; source: string[] }[];
                            if (!existingTopics.some(t => t.topic === topic.topic)) {
                                existingTopics.push(topic);
                                return false; // Đã được phân loại, không cần thêm vào uncategorized
                            }
                        }
                    }
                } else {
                    continue; // Bỏ qua nếu 'ai' không phải là một từ riêng biệt
                }
            } else if (normalizedTopic.includes(keyword)) {
                // Nếu chưa có danh mục này, tạo mới
                if (!result.categorized[categoryInfo.category]) {
                    result.categorized[categoryInfo.category] = {};
                }

                // Nếu chưa có danh mục con này, tạo mới
                if (!result.categorized[categoryInfo.category][categoryInfo.subcategory]) {
                    // Kiểm tra xem có danh mục con lồng nhau không
                    const isNested = nestedSubCategories.includes(categoryInfo.subcategory);
                    result.categorized[categoryInfo.category][categoryInfo.subcategory] = {
                        isNested: isNested,
                        topics: isNested ? {} : []
                    };
                }

                // Xử lý phân loại
                const subcategoryData = result.categorized[categoryInfo.category][categoryInfo.subcategory];

                if (subcategoryData.isNested && categoryInfo.nestedSubcategory) {
                    // Phân loại vào danh mục con lồng nhau
                    const nestedTopics = subcategoryData.topics as Record<string, { topic: string; count: number; source: string[] }[]>;

                    // Tạo danh mục con lồng nhau nếu chưa có
                    if (!nestedTopics[categoryInfo.nestedSubcategory]) {
                        nestedTopics[categoryInfo.nestedSubcategory] = [];
                    }

                    // Kiểm tra xem chủ đề đã được thêm vào danh mục này chưa
                    if (!nestedTopics[categoryInfo.nestedSubcategory].some(t => t.topic === topic.topic)) {
                        nestedTopics[categoryInfo.nestedSubcategory].push(topic);
                        return false; // Đã được phân loại, không cần thêm vào uncategorized
                    }
                } else if (!subcategoryData.isNested) {
                    // Phân loại vào danh mục con thông thường
                    const existingTopics = subcategoryData.topics as { topic: string; count: number; source: string[] }[];
                    if (!existingTopics.some(t => t.topic === topic.topic)) {
                        existingTopics.push(topic);
                        return false; // Đã được phân loại, không cần thêm vào uncategorized
                    }
                }
            }
        }

        return true;
    });

    return result;
}