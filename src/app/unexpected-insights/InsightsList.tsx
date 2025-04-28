'use client';

import { useState } from 'react';
import Link from 'next/link';
import { InsightItem } from '@/lib/dataUtils';

// Component to display a single insight card
function InsightCard({ item }) {
  return (
    <div className="border-l-4 border-green-500 dark:border-green-600 pl-6 py-4 bg-green-50 dark:bg-green-900/20 rounded-r-md hover:shadow-md transition-shadow">
      <p className="text-lg text-gray-800 dark:text-gray-200 mb-3">{item.insight}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center">
          <Link
            href={`/${item.type}s/${item.slug}`}
            className="text-green-600 dark:text-green-400 hover:underline font-medium flex items-center"
          >
            {item.type === 'blog' && (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
              </svg>
            )}
            {item.type === 'project' && (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
            )}
            {item.type === 'product' && (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            )}
            {item.title}
          </Link>
        </div>
        <span className="text-gray-500 dark:text-gray-400">
          {new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
}

export default function InsightsList({ insights, topicCategories }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('hierarchical');

  // Extract all unique topics from insights
  const allTopics = new Set();
  insights.forEach(item => {
    if (Array.isArray(item.topics)) {
      item.topics.forEach(topic => allTopics.add(topic));
    }
  });

  // Create a flat list of all topics for search
  const topicsList = Array.from(allTopics).sort();

  // Create a mapping of topics to their categories
  const topicToCategory = {};
  const nestedCategories = {};

  // Recursive function to process topics at any depth
  const processTopics = (topics, path = {}) => {
    if (Array.isArray(topics)) {
      // We've reached leaf topics (actual topics)
      return topics.map(topic => {
        // Register this topic with its full path
        topicToCategory[topic] = { ...path };
        return topic;
      });
    } else if (typeof topics === 'object') {
      // This is a container of more topics or subtopics
      const result = {};
      Object.entries(topics).forEach(([key, value]) => {
        result[key] = processTopics(value, { ...path, [Object.keys(path).length]: key });
      });
      return result;
    }
    return [];
  };

  // Process the topic categories to create a hierarchical structure
  Object.entries(topicCategories).forEach(([category, subcategories]) => {
    nestedCategories[category] = { subcategories: {} };

    Object.entries(subcategories).forEach(([subcategory, topics]) => {
      if (Array.isArray(topics)) {
        // Simple case: category -> subcategory -> topics
        nestedCategories[category].subcategories[subcategory] = { topics: [] };
        topics.forEach(topic => {
          topicToCategory[topic] = { category, subcategory };
          nestedCategories[category].subcategories[subcategory].topics.push(topic);
        });
      } else if (typeof topics === 'object') {
        // Complex case with potentially multiple levels
        nestedCategories[category].subcategories[subcategory] = { topicGroups: {} };

        Object.entries(topics).forEach(([topicGroup, value]) => {
          if (Array.isArray(value)) {
            // topicGroup -> specificTopics (leaf topics)
            nestedCategories[category].subcategories[subcategory].topicGroups[topicGroup] = { specificTopics: [] };
            value.forEach(topic => {
              topicToCategory[topic] = { category, subcategory, topicGroup };
              nestedCategories[category].subcategories[subcategory].topicGroups[topicGroup].specificTopics.push(topic);
            });
          } else if (typeof value === 'object') {
            // topicGroup -> subGroups -> specificTopics (deeper nesting)
            nestedCategories[category].subcategories[subcategory].topicGroups[topicGroup] = {
              subGroups: {},
              specificTopics: []
            };

            Object.entries(value).forEach(([subGroup, subTopics]) => {
              nestedCategories[category].subcategories[subcategory].topicGroups[topicGroup].subGroups[subGroup] = { specificTopics: [] };

              if (Array.isArray(subTopics)) {
                subTopics.forEach(topic => {
                  topicToCategory[topic] = { category, subcategory, topicGroup, subGroup };
                  nestedCategories[category].subcategories[subcategory].topicGroups[topicGroup].subGroups[subGroup].specificTopics.push(topic);
                });
              }
            });
          }
        });
      }
    });
  });

  // Get all categories
  const categories = ['All', ...Object.keys(topicCategories)];

  // Get subcategories for the selected category
  const subcategories = selectedCategory === 'All'
    ? ['All']
    : ['All', ...Object.keys(topicCategories[selectedCategory] || {})];

  // Get nested subcategories for the selected subcategory
  const nestedSubcategories = (selectedCategory !== 'All' && selectedSubcategory !== 'All' &&
    topicCategories[selectedCategory] &&
    typeof topicCategories[selectedCategory][selectedSubcategory] === 'object' &&
    !Array.isArray(topicCategories[selectedCategory][selectedSubcategory]))
    ? ['All', ...Object.keys(topicCategories[selectedCategory][selectedSubcategory] || {})]
    : ['All'];

  const [selectedNestedSubcategory, setSelectedNestedSubcategory] = useState('All');

  // Filter insights based on selected category, subcategory, nested subcategory, and search term
  const filteredInsights = insights.filter(item => {
    // Filter by search term
    const matchesSearch = searchTerm === '' ||
      item.insight.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(item.topics) && item.topics.some(topic =>
        topic.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    if (!matchesSearch) return false;

    // If no category is selected, show all
    if (selectedCategory === 'All') return true;

    // Check if the item has topics that match the selected category
    if (!Array.isArray(item.topics) || item.topics.length === 0) return false;

    // Get all topics that match the current filter criteria
    const matchingTopics = item.topics.filter(topic => {
      const categoryInfo = topicToCategory[topic];
      if (!categoryInfo) return false;

      // Check if topic belongs to selected category
      if (categoryInfo.category !== selectedCategory) return false;

      // If subcategory is 'All', any topic in the category matches
      if (selectedSubcategory === 'All') return true;

      // Check if topic belongs to selected subcategory
      if (categoryInfo.subcategory !== selectedSubcategory) return false;

      // If nested subcategory is 'All', any topic in the subcategory matches
      if (selectedNestedSubcategory === 'All') return true;

      // Check if topic belongs to selected nested subcategory
      return categoryInfo.nestedSubcategory === selectedNestedSubcategory;
    });

    // Item matches if it has at least one topic that matches the filter criteria
    return matchingTopics.length > 0;
  });

  // Group insights by hierarchical structure
  const groupedInsights = {
    byCategory: {},
    byTopic: {}
  };

  // First, group by topic for flat view
  filteredInsights.forEach(item => {
    if (Array.isArray(item.topics) && item.topics.length > 0) {
      // Get only the topics that match the current filter criteria
      const relevantTopics = selectedCategory === 'All' ?
        item.topics :
        item.topics.filter(topic => {
          const categoryInfo = topicToCategory[topic];
          if (!categoryInfo) return false;

          // If a category is selected, only topics from that category are relevant
          if (categoryInfo.category !== selectedCategory) return false;

          // If no specific subcategory is selected, all topics in the category are relevant
          if (selectedSubcategory === 'All') return true;

          // If a subcategory is selected, only topics from that subcategory are relevant
          if (categoryInfo.subcategory !== selectedSubcategory) return false;

          // If no specific nested subcategory is selected, all topics in the subcategory are relevant
          if (selectedNestedSubcategory === 'All') return true;

          // If a nested subcategory is selected, only topics from that nested subcategory are relevant
          return categoryInfo.nestedSubcategory === selectedNestedSubcategory;
        });

      // Group the item by its relevant topics only
      relevantTopics.forEach(topic => {
        if (!groupedInsights.byTopic[topic]) {
          groupedInsights.byTopic[topic] = [];
        }
        groupedInsights.byTopic[topic].push(item);
      });
    } else {
      // For items without topics
      if (!groupedInsights.byTopic['Uncategorized']) {
        groupedInsights.byTopic['Uncategorized'] = [];
      }
      groupedInsights.byTopic['Uncategorized'].push(item);
    }
  });

  // Then, group by hierarchical structure
  filteredInsights.forEach(item => {
    if (Array.isArray(item.topics) && item.topics.length > 0) {
      // Get only the topics that match the current filter criteria
      const relevantTopics = item.topics.filter(topic => {
        const categoryInfo = topicToCategory[topic];
        if (!categoryInfo) return false;

        // If no specific category is selected, all topics are relevant
        if (selectedCategory === 'All') return true;

        // If a category is selected, only topics from that category are relevant
        if (categoryInfo.category !== selectedCategory) return false;

        // If no specific subcategory is selected, all topics in the category are relevant
        if (selectedSubcategory === 'All') return true;

        // If a subcategory is selected, only topics from that subcategory are relevant
        if (categoryInfo.subcategory !== selectedSubcategory) return false;

        // If no specific nested subcategory is selected, all topics in the subcategory are relevant
        if (selectedNestedSubcategory === 'All') return true;

        // If a nested subcategory is selected, only topics from that nested subcategory are relevant
        return categoryInfo.nestedSubcategory === selectedNestedSubcategory;
      });

      // Group the item by its relevant topics only
      relevantTopics.forEach(topic => {
        const categoryInfo = topicToCategory[topic];
        if (categoryInfo) {
          const { category, subcategory, nestedSubcategory } = categoryInfo;

          // Initialize category if it doesn't exist
          if (!groupedInsights.byCategory[category]) {
            groupedInsights.byCategory[category] = { items: [], subcategories: {} };
          }

          // Add to category items
          if (!groupedInsights.byCategory[category].items.some(i => i.insight === item.insight)) {
            groupedInsights.byCategory[category].items.push(item);
          }

          // Initialize subcategory if it doesn't exist
          if (!groupedInsights.byCategory[category].subcategories[subcategory]) {
            groupedInsights.byCategory[category].subcategories[subcategory] = { items: [], nestedSubcategories: {} };
          }

          // Add to subcategory items
          if (!groupedInsights.byCategory[category].subcategories[subcategory].items.some(i => i.insight === item.insight)) {
            groupedInsights.byCategory[category].subcategories[subcategory].items.push(item);
          }

          // If there's a nested subcategory
          if (nestedSubcategory) {
            // Initialize nested subcategory if it doesn't exist
            if (!groupedInsights.byCategory[category].subcategories[subcategory].nestedSubcategories[nestedSubcategory]) {
              groupedInsights.byCategory[category].subcategories[subcategory].nestedSubcategories[nestedSubcategory] = { items: [] };
            }

            // Add to nested subcategory items
            if (!groupedInsights.byCategory[category].subcategories[subcategory].nestedSubcategories[nestedSubcategory].items.some(i => i.insight === item.insight)) {
              groupedInsights.byCategory[category].subcategories[subcategory].nestedSubcategories[nestedSubcategory].items.push(item);
            }
          }
        }
      });
    }
  });

  // Sort topics by name for flat view
  const sortedTopics = Object.keys(groupedInsights.byTopic).sort();

  // Sort categories, subcategories, and nested subcategories
  const sortedCategories = Object.keys(groupedInsights.byCategory).sort();

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Filter Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('All');
                setSelectedNestedSubcategory('All');
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Subcategory filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subcategory</label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={selectedSubcategory}
              onChange={(e) => {
                setSelectedSubcategory(e.target.value);
                setSelectedNestedSubcategory('All');
              }}
              disabled={selectedCategory === 'All'}
            >
              {subcategories.map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>

          {/* Nested Subcategory filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nested Subcategory</label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={selectedNestedSubcategory}
              onChange={(e) => setSelectedNestedSubcategory(e.target.value)}
              disabled={selectedCategory === 'All' || selectedSubcategory === 'All' || nestedSubcategories.length <= 1}
            >
              {nestedSubcategories.map(nestedSubcategory => (
                <option key={nestedSubcategory} value={nestedSubcategory}>{nestedSubcategory}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Reset button */}
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          onClick={() => {
            setSelectedCategory('All');
            setSelectedSubcategory('All');
            setSelectedNestedSubcategory('All');
            setSearchTerm('');
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300">
          Showing {filteredInsights.length} of {insights.length} unexpected insights
        </p>
      </div>

      {/* Display view selection tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`py-2 px-4 font-medium ${selectedView === 'hierarchical' ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500 dark:border-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-300'}`}
            onClick={() => setSelectedView('hierarchical')}
          >
            Hierarchical View
          </button>
          <button
            className={`py-2 px-4 font-medium ${selectedView === 'flat' ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500 dark:border-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-300'}`}
            onClick={() => setSelectedView('flat')}
          >
            Topic View
          </button>
        </div>
      </div>

      {/* Display insights based on selected view */}
      {filteredInsights.length > 0 ? (
        selectedView === 'flat' ? (
          // Flat view (grouped by topic)
          <div className="space-y-8">
            {sortedTopics.map(topic => (
              <div key={topic} className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400 border-b border-green-200 dark:border-green-800 pb-2">
                  {topic}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({groupedInsights.byTopic[topic].length})</span>
                </h3>
                <div className="space-y-4">
                  {groupedInsights.byTopic[topic].map((item, index) => (
                    <InsightCard key={`${topic}-insight-${index}`} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Hierarchical view (grouped by category > subcategory > nested subcategory)
          <div className="space-y-10">
            {sortedCategories.map(category => {
              const categoryData = groupedInsights.byCategory[category];
              const sortedSubcategories = Object.keys(categoryData.subcategories).sort();

              return (
                <div key={category} className="mb-10 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  {/* Category heading */}
                  <div className="bg-gradient-to-r from-green-600 to-green-800 dark:from-green-700 dark:to-green-900 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-sm bg-green-400 bg-opacity-30 text-white font-medium rounded-full px-3 py-1 border border-green-300 border-opacity-30 shadow-inner">
                        {categoryData.items.length} {categoryData.items.length === 1 ? 'insight' : 'insights'}
                      </span>
                    </h2>
                  </div>

                  {/* Subcategories */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {sortedSubcategories.map(subcategory => {
                        const subcategoryData = categoryData.subcategories[subcategory];
                        const hasTopicGroups = Object.keys(subcategoryData.topicGroups || {}).length > 0;
                        const sortedTopicGroups = hasTopicGroups ? Object.keys(subcategoryData.topicGroups).sort() : [];

                        return (
                          <div key={`${category}-${subcategory}`} className="mb-6 bg-green-100 dark:bg-green-900/30 rounded-lg overflow-hidden border border-green-200 dark:border-green-800">
                            {/* Subcategory heading */}
                            <div className="bg-green-200 dark:bg-green-800/60 px-4 py-3 flex items-center justify-between border-b border-green-300 dark:border-green-700">
                              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                                {subcategory}
                              </h3>
                              <span className="text-xs bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 rounded-full px-2.5 py-1 border border-green-300 dark:border-green-600 shadow-sm">
                                {subcategoryData.items.length} {subcategoryData.items.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>

                            <div className="p-4">
                              {hasTopicGroups ? (
                                // If there are topic groups
                                <div className="space-y-4">
                                  {sortedTopicGroups.map(topicGroup => {
                                    const topicGroupData = subcategoryData.topicGroups[topicGroup];
                                    const specificTopics = topicGroupData.specificTopics || [];

                                    return (
                                      <div key={`${category}-${subcategory}-${topicGroup}`} className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-green-100 dark:border-green-900">
                                        {/* Topic group heading */}
                                        <div className="bg-green-50 dark:bg-green-900/40 px-3 py-2 flex items-center justify-between border-b border-green-100 dark:border-green-900">
                                          <h4 className="font-medium text-green-700 dark:text-green-300">
                                            {topicGroup}
                                          </h4>
                                          <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-full px-2 py-0.5 border border-green-200 dark:border-green-700">
                                            {specificTopics.length} {specificTopics.length === 1 ? 'topic' : 'topics'}
                                          </span>
                                        </div>

                                        {/* Specific topics */}
                                        <div className="p-3">
                                          <ul className="list-disc pl-5 space-y-1 text-green-700 dark:text-green-300">
                                            {specificTopics.map((topic, index) => {
                                              // Find insights with this specific topic
                                              const topicInsights = filteredInsights.filter(item =>
                                                Array.isArray(item.topics) && item.topics.includes(topic)
                                              );

                                              return (
                                                <li key={`${category}-${subcategory}-${topicGroup}-topic-${index}`} className="mb-3">
                                                  <div className="font-medium mb-1">{topic} <span className="text-xs text-gray-500 dark:text-gray-400">({topicInsights.length})</span></div>
                                                  {topicInsights.length > 0 && (
                                                    <div className="ml-2 space-y-2">
                                                      {topicInsights.map((item, insightIndex) => (
                                                        <InsightCard key={`${category}-${subcategory}-${topicGroup}-${topic}-insight-${insightIndex}`} item={item} />
                                                      ))}
                                                    </div>
                                                  )}
                                                </li>
                                              );
                                            })}
                                          </ul>

                                          {/* Check if there are subGroups */}
                                          {topicGroupData.subGroups && Object.keys(topicGroupData.subGroups).length > 0 && (
                                            <div className="mt-4 border-t border-green-100 dark:border-green-800 pt-3">
                                              <h5 className="font-medium text-green-600 dark:text-green-400 mb-2">Sub-groups:</h5>
                                              <div className="space-y-4 pl-2">
                                                {Object.entries(topicGroupData.subGroups).map(([subGroup, subGroupData]) => (
                                                  <div key={`${category}-${subcategory}-${topicGroup}-${subGroup}`} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-900">
                                                    <h6 className="font-medium text-green-700 dark:text-green-300 mb-2 flex justify-between items-center">
                                                      {subGroup}
                                                      <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-full px-2 py-0.5 border border-green-200 dark:border-green-700">
                                                        {subGroupData.specificTopics.length} {subGroupData.specificTopics.length === 1 ? 'topic' : 'topics'}
                                                      </span>
                                                    </h6>
                                                    <ul className="list-disc pl-5 space-y-1 text-green-700 dark:text-green-300">
                                                      {subGroupData.specificTopics.map((topic, index) => {
                                                        // Find insights with this specific topic
                                                        const topicInsights = filteredInsights.filter(item =>
                                                          Array.isArray(item.topics) && item.topics.includes(topic)
                                                        );

                                                        return (
                                                          <li key={`${category}-${subcategory}-${topicGroup}-${subGroup}-topic-${index}`} className="mb-3">
                                                            <div className="font-medium mb-1">{topic} <span className="text-xs text-gray-500 dark:text-gray-400">({topicInsights.length})</span></div>
                                                            {topicInsights.length > 0 && (
                                                              <div className="ml-2 space-y-2">
                                                                {topicInsights.map((item, insightIndex) => (
                                                                  <InsightCard key={`${category}-${subcategory}-${topicGroup}-${subGroup}-${topic}-insight-${insightIndex}`} item={item} />
                                                                ))}
                                                              </div>
                                                            )}
                                                          </li>
                                                        );
                                                      })}
                                                    </ul>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                // If there are no topic groups
                                <div className="space-y-3">
                                  {subcategoryData.items.map((item, index) => (
                                    <InsightCard key={`${category}-${subcategory}-insight-${index}`} item={item} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No insights found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
