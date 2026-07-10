import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Blog: React.FC = () => {
  const { blogs } = useContent();
  const navigate = useNavigate();

  // Only show published posts on the public listing
  const publishedBlogs = useMemo(() => blogs.filter(b => b.status !== 'draft'), [blogs]);

  // Build dynamic tab list from all tags across published posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    publishedBlogs.forEach(b => {
      b.tags?.forEach(t => {
        t.split(',').map(s => s.trim()).filter(Boolean).forEach(tag => tagSet.add(tag));
      });
    });
    return ['All', ...Array.from(tagSet)];
  }, [publishedBlogs]);

  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset tab if it disappears (e.g. after deleting posts)
  useEffect(() => {
    if (!allTags.includes(activeTab)) setActiveTab('All');
  }, [allTags]);

  const filteredBlogs = activeTab === 'All'
    ? publishedBlogs
    : publishedBlogs.filter(b => 
        b.tags?.some(t => 
          t.split(',').map(s => s.trim().toLowerCase()).includes(activeTab.toLowerCase())
        )
      );

  return (
    <div className="bg-white text-[#111] min-h-screen font-sans">
      <Helmet>
        <title>News &amp; Insight | Anvitam Sustainable Architecture</title>
        <meta name="description" content="Stay updated with the latest news, architectural features, project stories and sustainable design trends and updates." />
        <meta name="keywords" content="architecture blog, sustainable architecture news, permaculture articles, eco design journal, farm retreat design ideas" />
        <meta name="robots" content="index, follow" />
        <meta name="X-Robots-Tag" content="index, follow" />
        <meta name="publisher" content="Anvitam" />
        <link rel="publisher" href="https://www.anvitam.com/" />
        <link rel="canonical" href="https://www.anvitam.com/blog" />
      </Helmet>

      {/* Header */}
      <div className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-[54px] font-medium mb-6 tracking-tight text-[#111]">
          News &amp; Insight
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-medium">
          Stay updated with the latest news, architectural features, project stories and sustainable design trends.
        </p>
      </div>

      {/* Tabs — dynamic from tags */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="flex justify-start md:justify-center md:space-x-8 space-x-6 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {allTags.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-4 px-2 text-sm font-semibold transition-colors relative ${
                activeTab === tab ? 'text-[#111]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#8bc34a]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-6xl mx-auto px-6 mb-32">
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16 lg:gap-x-14 lg:gap-y-20">
            {filteredBlogs.map(blog => (
              <article
                key={blog.id}
                className="group cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/blog/${blog.slug || blog.id}`)}
              >
                <div className="w-full aspect-[16/9] mb-6 overflow-hidden rounded-sm bg-gray-50">
                  <img
                    src={blog.image}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={blog.title}
                    loading="lazy"
                  />
                </div>

                {/* Tags chips */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {blog.tags.flatMap(t => t.split(',').map(s => s.trim())).filter(Boolean).slice(0, 5).map(t => (
                      <span key={t} className="text-[10px] font-bold uppercase tracking-wider text-[#8bc34a] bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <h2 className="text-2xl md:text-[28px] font-bold mb-4 tracking-tight text-[#111] group-hover:text-[#8bc34a] transition-colors leading-tight">
                  {blog.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed font-medium mb-8 flex-grow line-clamp-3">
                  {blog.excerpt}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                  <span className="text-xs font-semibold text-gray-400 tracking-wider">
                    {blog.date} · {blog.author}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-[#111] border border-gray-200 rounded-full px-5 py-2 group-hover:border-gray-400 transition-colors">
                    Read more <ArrowRight className="w-3 h-3 ml-2" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 font-medium text-lg">No posts found for "{activeTab}".</p>
            <button onClick={() => setActiveTab('All')} className="mt-6 text-sm font-semibold text-[#8bc34a] hover:underline">
              View all posts
            </button>
          </div>
        )}
      </div>

      {/* Pre-Footer CTA */}
      <div className="bg-[#111111] text-white pt-10 pb-10 px-6 rounded-t-2xl md:rounded-t-[2.5rem] mt-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6">
          <h2 className="text-xl md:text-2xl font-semibold max-w-lg leading-tight tracking-tight text-[#f9f9f9]">
            Want to stay Updated with our Newsletter?
          </h2>
          <div className="flex-shrink-0">
            <a
              href="https://www.linkedin.com/newsletters/design-by-archana-7412717337734455296/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#D1F0AA] text-[#111] px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors hover:bg-[#bceb81]"
            >
              Subscribe Today <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;