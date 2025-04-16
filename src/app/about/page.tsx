import { getPublicationTopicsWithCounts, getAboutData, getOngoingExplorationTopics, getAllTechnologies, getAllTopics, getCategorizedExplorationTopics } from '@/lib/dataUtils';
import Image from 'next/image'; // Import Next Image
import { FaGithub, FaLinkedin, FaTwitter, FaGoogle, FaResearchgate, FaOrcid } from 'react-icons/fa';
import Link from 'next/link';

// Map social keys to icons and names
const socialIconMap: { [key: string]: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>, name: string, colorClass: string, iconSize?: string } } = {
  github: { icon: FaGithub, name: 'GitHub', colorClass: 'hover:text-gray-900 dark:hover:text-white' },
  linkedin: { icon: FaLinkedin, name: 'LinkedIn', colorClass: 'hover:text-blue-700 dark:hover:text-blue-500' },
  twitter: { icon: FaTwitter, name: 'Twitter', colorClass: 'hover:text-sky-500 dark:hover:text-sky-400' },
  googleScholar: { icon: FaGoogle, name: 'Google Scholar', colorClass: 'hover:text-blue-600 dark:hover:text-blue-400'},
  researchgate: { icon: FaResearchgate, name: 'ResearchGate', colorClass: 'hover:text-cyan-600 dark:hover:text-cyan-400'},
  orcid: { icon: FaOrcid, name: 'ORCID', colorClass: 'hover:text-lime-600 dark:hover:text-lime-400' }
};

export default async function AboutPage() {
  const [publicationTopics, aboutData, explorationTopics, allTechnologies, allTopics, categorizedExplorationTopics] = await Promise.all([
    getPublicationTopicsWithCounts(),
    getAboutData(),
    getOngoingExplorationTopics(),
    getAllTechnologies(),
    getAllTopics(),
    getCategorizedExplorationTopics()
  ]);
  console.log('publicationTopics', publicationTopics);
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            About <span className="text-yellow-300">Me</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-blue-100">
            Get to know my background, skills, and professional journey
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <section className="mb-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {aboutData.image && (
              <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0 transform hover:scale-105 transition-transform duration-300">
                <Image
                  src={aboutData.image}
                  alt={aboutData.name || 'Profile Picture'}
                  fill
                  className="rounded-full shadow-xl border-4 border-white dark:border-gray-600 object-cover"
                  priority
                />
              </div>
            )}
            <div className="flex-grow text-center md:text-left">
              <div className="inline-block mb-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                Hello, I&apos;m
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {aboutData.name || 'Your Name'}
              </h1>
              <h2 className="text-2xl text-indigo-600 dark:text-indigo-400 font-medium mb-4">{aboutData['main role'] || aboutData.title || 'Research Scientist'}</h2>
              {aboutData.roles && aboutData.roles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                  {aboutData.roles.map((role, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                      {role}
                    </span>
                  ))}
                </div>
              )}
              {aboutData.location && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex items-center justify-center md:justify-start">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {aboutData.location}
                </p>
              )}
              {aboutData.bio && (
                <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-inner">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line italic">&ldquo;{aboutData.bio}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {aboutData.social && Object.keys(aboutData.social).length > 0 && (
          <section className="mb-16 text-center">
            <div className="inline-block mb-6 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full">
              <h2 className="text-2xl font-bold text-white">Connect with Me</h2>
            </div>
            <div className="flex justify-center items-center flex-wrap gap-6">
              {Object.entries(aboutData.social)
                .filter(([key, url]) => url && socialIconMap[key])
                .map(([key, url]) => {
                  const { icon: IconComponent, name, colorClass } = socialIconMap[key];
                  return (
                    <a
                      key={key}
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-600 dark:text-gray-400 transition-all duration-300 transform hover:scale-110 ${colorClass}`}
                      title={name}
                    >
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
                        <IconComponent className="w-18 h-6" />
                      </div>
                      <span className="block mt-2 text-sm font-medium">{name}</span>
                    </a>
                  );
                })}
            </div>
          </section>
        )}

        {publicationTopics.length > 0 && (
          <section className="mb-16">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg leading-none">
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    <h2 className="text-2xl font-bold text-white">Research Interests</h2>
                  </div>
                </div>
              </div>
              <Link href="/publications" className="group relative inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium mt-4 md:mt-0 transition-all duration-300">
                <span className="text-sm font-medium">View my publications</span>
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl border border-blue-100 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-wrap gap-3">
                {publicationTopics.map(({ topic, count }) => (
                  <span
                    key={topic}
                    className="relative group bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-medium px-5 py-2.5 rounded-full dark:from-blue-900 dark:to-indigo-900 dark:text-blue-200 shadow-md hover:shadow-lg transition-all duration-300 cursor-default flex items-center hover:scale-105 transform"
                    title={`${count} publication(s)`}
                  >
                    <span className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-0 group-hover:opacity-20 transition duration-300"></span>
                    <span className="relative bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 text-blue-800 dark:text-blue-200 w-7 h-7 rounded-full flex items-center justify-center mr-2.5 text-xs font-bold shadow-inner">{count}</span>
                    <span className="relative">{topic}</span>
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ongoing Explorations Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative px-6 py-3 bg-gradient-to-r from-green-600 to-teal-700 rounded-lg leading-none">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                  <h2 className="text-2xl font-bold text-white">Ongoing Explorations</h2>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
              <Link href="/blogs" className="group relative inline-flex items-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium transition-all duration-300">
                <span className="text-sm font-medium">View my blogs</span>
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/projects" className="group relative inline-flex items-center text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-all duration-300">
                <span className="text-sm font-medium">View my projects</span>
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Technologies by Category */}
          <div className="space-y-8 bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl border border-green-100 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Main Categories */}
            {Object.keys(allTopics.categorizedTechs)
              .filter(mainCategory => mainCategory !== 'Topics Overview') // Xử lý Skills Overview riêng
              .map(mainCategory => (
              <div key={mainCategory} className="mb-12">
                <div className="flex items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 bg-blue-100 dark:bg-blue-900/40 px-4 py-2 rounded-lg">{mainCategory}</h3>
                  <div className="flex-grow ml-4 h-0.5 bg-blue-200 dark:bg-blue-700"></div>
                </div>

                {/* Sub Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.keys(allTopics.categorizedTechs[mainCategory]).map(subCategory => {
                    // Kiểm tra xem subCategory có phải là một object với các sub-categories khác không
                    const isNestedCategory = typeof allTopics.categorizedTechs[mainCategory][subCategory] === 'object' &&
                                           !Array.isArray(allTopics.categorizedTechs[mainCategory][subCategory]);

                    if (isNestedCategory) {
                      // Xử lý nested category
                      return (
                        <div key={`${mainCategory}-${subCategory}`} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group">
                          <div className="flex items-center mb-4">
                            <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-md">{subCategory}</h4>
                            <div className="flex-grow ml-3 h-px bg-indigo-100 dark:bg-indigo-800"></div>
                          </div>

                          <div className="space-y-4 pl-2">
                            {Object.keys(allTopics.categorizedTechs[mainCategory][subCategory]).map(nestedSubCategory => (
                              <div key={`${mainCategory}-${subCategory}-${nestedSubCategory}`} className="mb-4">
                                <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2 border-l-4 border-indigo-400 pl-2">{nestedSubCategory}</h5>
                                <div className="flex flex-wrap gap-2 pl-3">
                                  {allTopics.categorizedTechs[mainCategory][subCategory][nestedSubCategory].map(tech => (
                                    <span
                                      key={tech.technology}
                                      className="relative group bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full dark:from-green-900 dark:to-teal-900 dark:text-green-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-default flex items-center hover:scale-105 transform"
                                      title={`Used in ${tech.count} item(s) from ${tech.sources.join(', ')}`}
                                    >
                                      <span className="bg-gradient-to-r from-green-200 to-teal-200 dark:from-green-800 dark:to-teal-800 text-green-800 dark:text-green-200 w-5 h-5 rounded-full flex items-center justify-center mr-1.5 text-xs font-bold">{tech.count}</span>
                                      {tech.technology}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      // Xử lý regular category
                      return (
                        <div key={`${mainCategory}-${subCategory}`} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group">
                          <div className="flex items-center mb-3">
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md">{subCategory}</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {allTopics.categorizedTechs[mainCategory][subCategory].map(tech => (
                              <span
                                key={tech.technology}
                                className="relative group bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full dark:from-green-900 dark:to-teal-900 dark:text-green-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-default flex items-center hover:scale-105 transform"
                                title={`Used in ${tech.count} item(s) from ${tech.sources.join(', ')}`}
                              >
                                <span className="bg-gradient-to-r from-green-200 to-teal-200 dark:from-green-800 dark:to-teal-800 text-green-800 dark:text-green-200 w-5 h-5 rounded-full flex items-center justify-center mr-1.5 text-xs font-bold">{tech.count}</span>
                                {tech.technology}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ))}

            {/* Skills Overview Section */}
            {allTopics.categorizedTechs['Skills Overview'] && (
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 bg-purple-100 dark:bg-purple-900/40 px-4 py-2 rounded-lg">Skills Overview</h3>
                  <div className="flex-grow ml-4 h-0.5 bg-purple-200 dark:bg-purple-700"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(allTopics.categorizedTechs['Skills Overview']).map(skillCategory => (
                    <div key={`Skills-${skillCategory}`} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group">
                      <div className="flex items-center mb-3">
                        <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-md">{skillCategory}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allTopics.categorizedTechs['Skills Overview'][skillCategory].map(tech => (
                          <span
                            key={tech.technology}
                            className="relative group bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium px-3 py-1.5 rounded-full dark:from-purple-900 dark:to-pink-900 dark:text-purple-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-default flex items-center hover:scale-105 transform"
                            title={`Used in ${tech.count} item(s) from ${tech.sources.join(', ')}`}
                          >
                            <span className="bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 text-purple-800 dark:text-purple-200 w-5 h-5 rounded-full flex items-center justify-center mr-1.5 text-xs font-bold">{tech.count}</span>
                            {tech.technology}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uncategorized Technologies */}
            {allTopics.uncategorizedTechs.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">Other Technologies</h3>
                  <div className="flex-grow ml-4 h-0.5 bg-gray-200 dark:bg-gray-600"></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {allTopics.uncategorizedTechs.map(tech => (
                    <span
                      key={tech.technology}
                      className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-lg dark:bg-indigo-900 dark:text-indigo-300 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                      title={`Used in ${tech.count} item(s) from ${tech.sources.join(', ')}`}
                    >
                      <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 w-5 h-5 rounded-full inline-flex items-center justify-center mr-1.5 text-xs font-bold">{tech.count}</span>
                      {tech.technology}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Skills & Technologies Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-700 rounded-lg leading-none">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <h2 className="text-2xl font-bold text-white">Skills & Technologies</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies by Category */}
          <div className="space-y-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl border border-purple-100 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Main Categories */}
            {Object.keys(allTechnologies.categorizedTechs)
              .filter(mainCategory => mainCategory !== 'Skills Overview') // Xử lý Skills Overview riêng
              .map(mainCategory => (
              <div key={mainCategory} className="mb-12">
                <div className="flex items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 bg-blue-100 dark:bg-blue-900/40 px-4 py-2 rounded-lg">{mainCategory}</h3>
                  <div className="flex-grow ml-4 h-0.5 bg-blue-200 dark:bg-blue-700"></div>
                </div>

                {/* Sub Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.keys(allTechnologies.categorizedTechs[mainCategory]).map(subCategory => {
                    // Kiểm tra xem subCategory có phải là một object với các sub-categories khác không
                    const isNestedCategory = typeof allTechnologies.categorizedTechs[mainCategory][subCategory] === 'object' &&
                                           !Array.isArray(allTechnologies.categorizedTechs[mainCategory][subCategory]);

                    if (isNestedCategory) {
                      // Xử lý nested category
                      return (
                        <div key={`${mainCategory}-${subCategory}`} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group">
                          <div className="flex items-center mb-4">
                            <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-md">{subCategory}</h4>
                            <div className="flex-grow ml-3 h-px bg-indigo-100 dark:bg-indigo-800"></div>
                          </div>

                          <div className="space-y-4 pl-2">
                            {Object.keys(allTechnologies.categorizedTechs[mainCategory][subCategory]).map(nestedSubCategory => (
                              <div key={`${mainCategory}-${subCategory}-${nestedSubCategory}`} className="mb-4">
                                <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2 border-l-4 border-indigo-400 pl-2">{nestedSubCategory}</h5>
                                <div className="flex flex-wrap gap-2 pl-3">
                                  {allTechnologies.categorizedTechs[mainCategory][subCategory][nestedSubCategory].map(tech => (
                                    <span
                                      key={tech.technology}
                                      className="relative group bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full dark:from-green-900 dark:to-teal-900 dark:text-green-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-default flex items-center hover:scale-105 transform"
                                      title={`Used in ${tech.count} item(s) from ${tech.sources.join(', ')}`}
                                    >
                                      <span className="bg-gradient-to-r from-green-200 to-teal-200 dark:from-green-800 dark:to-teal-800 text-green-800 dark:text-green-200 w-5 h-5 rounded-full flex items-center justify-center mr-1.5 text-xs font-bold">{tech.count}</span>
                                      {tech.technology}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      // Xử lý regular category
                      return (
                        <div key={`${mainCategory}-${subCategory}`} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group">
                          <div className="flex items-center mb-3">
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md">{subCategory}</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {allTechnologies.categorizedTechs[mainCategory][subCategory].map(tech => (
                              <span
                                key={tech.technology}
                                className="relative group bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full dark:from-green-900 dark:to-teal-900 dark:text-green-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-default flex items-center hover:scale-105 transform"
                                title={`Used in ${tech.count} item(s) from ${tech.sources.join(', ')}`}
                              >
                                <span className="bg-gradient-to-r from-green-200 to-teal-200 dark:from-green-800 dark:to-teal-800 text-green-800 dark:text-green-200 w-5 h-5 rounded-full flex items-center justify-center mr-1.5 text-xs font-bold">{tech.count}</span>
                                {tech.technology}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ))}

            {/* Skills Overview Section */}
            {allTechnologies.categorizedTechs['Skills Overview'] && (
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 bg-purple-100 dark:bg-purple-900/40 px-4 py-2 rounded-lg">Skills Overview</h3>
                  <div className="flex-grow ml-4 h-0.5 bg-purple-200 dark:bg-purple-700"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(allTechnologies.categorizedTechs['Skills Overview']).map(skillCategory => (
                    <div key={`Skills-${skillCategory}`} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group">
                      <div className="flex items-center mb-3">
                        <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-md">{skillCategory}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allTechnologies.categorizedTechs['Skills Overview'][skillCategory].map(tech => (
                          <span
                            key={tech.technology}
                            className="relative group bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium px-3 py-1.5 rounded-full dark:from-purple-900 dark:to-pink-900 dark:text-purple-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-default flex items-center hover:scale-105 transform"
                            title={`Used in ${tech.count} item(s) from ${tech.sources.join(', ')}`}
                          >
                            <span className="bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 text-purple-800 dark:text-purple-200 w-5 h-5 rounded-full flex items-center justify-center mr-1.5 text-xs font-bold">{tech.count}</span>
                            {tech.technology}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uncategorized Technologies */}
            {allTechnologies.uncategorizedTechs.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">Other Technologies</h3>
                  <div className="flex-grow ml-4 h-0.5 bg-gray-200 dark:bg-gray-600"></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {allTechnologies.uncategorizedTechs.map(tech => (
                    <span
                      key={tech.technology}
                      className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-lg dark:bg-indigo-900 dark:text-indigo-300 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                      title={`Used in ${tech.count} item(s) from ${tech.sources.join(', ')}`}
                    >
                      <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 w-5 h-5 rounded-full inline-flex items-center justify-center mr-1.5 text-xs font-bold">{tech.count}</span>
                      {tech.technology}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {aboutData.education && aboutData.education.length > 0 && (
          <section className="mb-16">
            <div className="inline-block mb-6 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full">
              <h2 className="text-2xl font-bold text-white">Education</h2>
            </div>
            <div className="space-y-8 border-l-4 border-blue-500 dark:border-blue-600 pl-8 relative">
              {aboutData.education.map((edu, index) => (
                <div key={index} className="relative group">
                  <div className="absolute w-6 h-6 bg-blue-500 rounded-full -left-[42px] top-1 border-4 border-white dark:border-gray-800 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{edu.degree}</h3>
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium">{edu.school}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        {edu.year}
                      </span>
                    </div>
                    {edu.description && (
                      <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        {Array.isArray(edu.description) ? (
                          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                            {edu.description.map((item, idx) => <li key={idx}>{item}</li>)}
                          </ul>
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{edu.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {aboutData.experience && aboutData.experience.length > 0 && (
          <section className="mb-16">
            <div className="inline-block mb-6 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full">
              <h2 className="text-2xl font-bold text-white">Experience</h2>
            </div>
            <div className="space-y-8 border-l-4 border-green-500 dark:border-green-600 pl-8 relative">
              {aboutData.experience.map((exp, index) => (
                <div key={index} className="relative group">
                  <div className="absolute w-6 h-6 bg-green-500 rounded-full -left-[42px] top-1 border-4 border-white dark:border-gray-800 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{exp.title}</h3>
                        <p className="text-purple-600 dark:text-purple-400 font-medium">{exp.company}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
                        {exp.period}
                      </span>
                    </div>
                    {exp.description && (
                      <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        {Array.isArray(exp.description) ? (
                          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                            {exp.description.map((item, idx) => <li key={idx}>{item}</li>)}
                          </ul>
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{exp.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(aboutData.cv?.url || aboutData.resume?.url) && (
          <section className="mb-12 text-center">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-8 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-center items-center gap-6 mt-8">
              {aboutData.cv?.url && (
                <a
                  href={aboutData.cv.url}
                  download={aboutData.cv.filename || 'CV.pdf'}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CV
                </a>
              )}
              {aboutData.resume?.url && (
                <a
                  href={aboutData.resume.url}
                  download={aboutData.resume.filename || 'Resume.pdf'}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-full shadow-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Resume
                </a>
              )}
            </div>
          </section>
        )}

        </div>
      </div>
    </main>
  );
}