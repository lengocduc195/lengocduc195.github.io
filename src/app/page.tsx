import Link from 'next/link';
import Image from 'next/image';
import { getHighlightedProjects, getAboutData } from '@/lib/dataUtils';

export default async function HomePage() {
  // Lấy danh sách các dự án nổi bật và thông tin about
  const [highlightedProjects, aboutData] = await Promise.all([
    getHighlightedProjects(),
    getAboutData()
  ]);
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 to-black/30">
          {/* Background image */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-80" />
          <div className="absolute inset-0 bg-[url('/images/project-5.jpg')] bg-cover bg-center opacity-30" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white animate-fade-in-down">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              {aboutData.name || 'Duc Le'}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto animate-fade-in">
            {aboutData['main role'] || 'Research Scientist'} • {aboutData.roles && aboutData.roles.length > 1 ? aboutData.roles[1] : 'Developer'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up">
            <Link href="/about" className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 shadow-lg">
              About Me
            </Link>
            <Link href="/projects" className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-full hover:bg-white/10 transition duration-300">
              View My Work
            </Link>
          </div>

          {/* Social Links */}
          <div className="mt-12 flex justify-center space-x-6">
            {aboutData.social?.github && (
              <a href={aboutData.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {aboutData.social?.linkedin && (
              <a href={aboutData.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
            <a href={`mailto:${aboutData.email || 'lengocduc195@gmail.com'}`} className="text-gray-300 hover:text-white transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
            Featured <span className="text-blue-500">Projects</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlightedProjects.map((project) => (
              <div key={project.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="h-48 bg-gray-700 relative">
                  {/* Sử dụng hình ảnh đầu tiên từ mảng images nếu có */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: Array.isArray(project.images) && project.images.length > 0
                        ? `url(${typeof project.images[0] === 'string'
                            ? project.images[0]
                            : (project.images[0]?.url || '/images/project-1.jpg')})`
                        : `url('/images/project-${project.id % 3 + 1}.jpg')`
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{project.title}</h3>
                  <p className="text-gray-300 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies && project.technologies.slice(0, 3).map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full">{tech}</span>
                    ))}
                  </div>
                  <Link href={`/projects/${project.id}`} className="text-blue-400 hover:text-blue-300 font-medium">View Details →</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/projects" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 shadow-lg">
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* About Me Preview Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden mx-auto border-4 border-blue-500 shadow-xl">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${aboutData.image || '/images/Duc_Le.jpg'}')` }} />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl z-10 shadow-lg transform rotate-12">
                Hello!
              </div>
            </div>

            <div className="md:w-1/2 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                About <span className="text-blue-500">Me</span>
              </h2>
              <p className="text-gray-300 mb-6 text-lg">
                {aboutData.bio ? aboutData.bio.split('\n\n')[0] : "I'm a passionate researcher and developer with expertise in AI and Machine Learning. With several years of experience, I've worked on various projects ranging from computer vision to natural language processing applications."}
              </p>
              <p className="text-gray-300 mb-8 text-lg">
                {aboutData.bio && aboutData.bio.split('\n\n')[1] ? aboutData.bio.split('\n\n')[1] : "My goal is to create innovative solutions that solve real-world problems using cutting-edge technologies. I'm constantly learning and exploring new approaches to improve my skills and stay at the forefront of technological advancements."}
              </p>
              <Link href="/about" className="inline-block px-6 py-3 bg-transparent border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition duration-300">
                Learn More About Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Explore <span className="text-blue-500">More</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/publications" className="bg-gray-800 p-6 rounded-xl text-center hover:bg-gray-700 transition duration-300 transform hover:-translate-y-2">
              <svg className="w-12 h-12 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-white">Publications</h3>
              <p className="text-gray-400">Explore my research papers and academic publications.</p>
            </Link>

            <Link href="/products" className="bg-gray-800 p-6 rounded-xl text-center hover:bg-gray-700 transition duration-300 transform hover:-translate-y-2">
              <svg className="w-12 h-12 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-white">Products</h3>
              <p className="text-gray-400">Check out products and tools I've developed.</p>
            </Link>

            <Link href="/blogs" className="bg-gray-800 p-6 rounded-xl text-center hover:bg-gray-700 transition duration-300 transform hover:-translate-y-2">
              <svg className="w-12 h-12 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-white">Blogs</h3>
              <p className="text-gray-400">Read my thoughts and tutorials on various topics.</p>
            </Link>

            <Link href="/journey" className="bg-gray-800 p-6 rounded-xl text-center hover:bg-gray-700 transition duration-300 transform hover:-translate-y-2">
              <svg className="w-12 h-12 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-white">Journeys</h3>
              <p className="text-gray-400">Follow my professional journeys and milestones.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Let's <span className="text-blue-500">Connect</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Have a project in mind or just want to chat? Feel free to reach out!
          </p>
          <a href={`mailto:${aboutData.email || 'lengocduc195@gmail.com'}`} className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-medium hover:bg-blue-700 transition duration-300 shadow-lg">
            Get In Touch
          </a>
        </div>
      </section>


    </main>
  );
}
