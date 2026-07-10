import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { ArrowRight, Calendar, Link as LinkIcon, Tag, Linkedin, Instagram, Facebook } from 'lucide-react';
import DOMPurify from 'dompurify';
import '../blog-prose.css';

// Strict DOMPurify allowlist for rendering blog content.
// iframe is intentionally excluded from ALLOWED_TAGS:
//   - Any iframe src can load arbitrary third-party content (clickjacking, data exfil).
//   - YouTube embeds are validated to youtube.com/embed/{id} format before storage
//     by the admin editor's handleEmbedInsert(); they survive as <div class="embed-block">
//     wrappers which are safe. The actual <iframe> is re-rendered client-side by the
//     blog-prose CSS, never injected raw.
// ALLOWED_URI_REGEXP restricts href and src to https/http/data (images) only.
const BLOG_PURIFY_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'br', 'strong', 'em', 'u', 's', 'del',
    'a', 'ol', 'ul', 'li', 'blockquote', 'pre', 'code', 'img',
    'div', 'span', 'hr',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'class', 'target', 'rel',
    'width', 'height', 'alt',
  ],
  // Only permit safe URL schemes — blocks javascript:, data:text/html, vbscript: etc.
  ALLOWED_URI_REGEXP: /^(?:https?:|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,)/i,
  ALLOW_DATA_ATTR: false,
};

// SVG for Medium brand icon (official brand layout)
const MediumIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z" />
  </svg>
);

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { blogs } = useContent();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Match by id OR slug
  const blogIndex = blogs.findIndex(b => b.id === id || b.slug === id);
  const blog = blogs[blogIndex];

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#111]">
        <p className="text-xl font-medium mb-6">Article not found.</p>
        <Link to="/blog" className="text-sm font-semibold uppercase tracking-wider underline">Back to Journal</Link>
      </div>
    );
  }

  // Guard drafts — redirect public readers
  if (blog.status === 'draft') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#111]">
        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Draft</span>
        <p className="text-xl font-medium mb-6">This post is not yet published.</p>
        <Link to="/blog" className="text-sm font-semibold uppercase tracking-wider underline">← Back to Journal</Link>
      </div>
    );
  }

  const prevBlog = blogIndex > 0 ? blogs.filter(b => b.status !== 'draft')[
    blogs.filter(b => b.status !== 'draft').findIndex(b => b.id === blog.id) - 1
  ] ?? blogs.filter(b => b.status !== 'draft').slice(-1)[0] : blogs.filter(b => b.status !== 'draft').slice(-1)[0];

  const nextBlog = blogs.filter(b => b.status !== 'draft')[
    blogs.filter(b => b.status !== 'draft').findIndex(b => b.id === blog.id) + 1
  ] ?? blogs.filter(b => b.status !== 'draft')[0];

  const related = [prevBlog, nextBlog].filter(Boolean).filter(b => b.id !== blog.id);

  const mockAvatar = "/archana.png";

  const ctaButton = (
    <a
      href="https://topmate.io/archanagavas"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center bg-[#D1F0AA] text-[#111] px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors hover:bg-[#bceb81]"
    >
      Talk to our project expert <ArrowRight className="ml-2 w-4 h-4" />
    </a>
  );

  return (
    <div className="bg-white text-[#111] min-h-screen font-sans">
      <Helmet>
        <title>{blog.metaTitle || blog.title} | Anvitam Sustainable Architecture</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        {blog.slug && <link rel="canonical" href={`https://www.anvitam.com/blog/${blog.slug}`} />}
        <meta name="keywords" content={blog.tags && blog.tags.length > 0 ? blog.tags.join(', ') : 'architecture, sustainable architecture, permaculture design'} />
        <meta name="robots" content="index, follow" />
        <meta name="X-Robots-Tag" content="index, follow" />
        <meta name="publisher" content="Anvitam" />
        <link rel="publisher" href="https://www.anvitam.com/" />
        {/* Open Graph */}
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
        <meta property="og:image" content={blog.image} />
        <meta property="og:type" content="article" />
        {/* FAQ Schema Markup (AEO/SEO/GEO Engine) */}
        {blog.faqs && blog.faqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": blog.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        )}
      </Helmet>

      {/* Blog Header */}
      <div className="max-w-4xl mx-auto px-6 pt-32 mb-12 text-center">
        <div className="flex justify-center items-center space-x-3 text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-wider">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-sm">Insight</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{blog.date}</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#111] mb-8 leading-tight tracking-tight max-w-3xl mx-auto">
          {blog.title}
        </h1>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {blog.tags.flatMap(t => t.split(',').map(s => s.trim())).filter(Boolean).map(tag => (
              <span key={tag} className="blog-tag">
                <Tag className="inline w-2.5 h-2.5 mr-1 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center space-x-3">
          <img src={blog.authorImage || mockAvatar} className="w-10 h-10 rounded-full object-cover" alt={blog.author} />
          <div className="text-left">
            <p className="font-bold text-[#111] text-sm">{blog.author}</p>
            <p className="text-xs text-gray-500 font-medium">Sustainable Architect</p>
          </div>
        </div>
      </div>

      {/* Feature Image */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div className="aspect-[16/9] w-full overflow-hidden bg-gray-50 rounded-sm">
          <img src={blog.image} alt={blog.coverImageAlt || blog.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Main Content — scoped blog-prose class */}
      <div className="max-w-3xl mx-auto px-6 mb-16">
        <div
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content, BLOG_PURIFY_CONFIG) as string }}
        />

        {/* Visible FAQ Section */}
        {blog.faqs && blog.faqs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100 text-left">
            <h3 className="text-xl font-bold text-[#111] mb-6 tracking-tight flex items-center gap-2">
              <span>💡</span> Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {blog.faqs.map((faq, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-5 bg-gray-50/50">
                  <h4 className="font-bold text-[#111] text-sm md:text-base mb-2">{faq.question}</h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Author Footer Card */}
        <div className="border border-gray-150 rounded-2xl p-6 md:p-8 bg-gray-50/50 flex flex-col md:flex-row gap-6 items-start text-left my-16">
          <img 
            src={blog.authorImage || mockAvatar} 
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-sm shrink-0" 
            alt={blog.author || 'Archana Gavas'} 
          />
          <div className="space-y-3 flex-1">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Written By</span>
              <h4 className="text-lg md:text-xl font-bold text-[#111]">{blog.author || 'Archana Gavas'}</h4>
              <p className="text-xs md:text-sm text-[#8bc34a] font-bold">Principal Architect &amp; Founder, Anvitam</p>
            </div>
            
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed max-w-xl">
              {blog.authorBio || 'Architect & Permaculture Designer | Farm Retreats, Eco Homestays, Food Forests, Agroforestry & Agrotourism | Consultation, Site Planning, Designing & Visualization - 4 years experience'}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="https://www.linkedin.com/in/archana-gavas" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0077b5] transition-colors font-semibold"
              >
                <Linkedin size={14} />
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://medium.com/@archanagavas/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors font-semibold"
              >
                <MediumIcon size={14} />
                <span>Medium</span>
              </a>
              <a 
                href="https://www.instagram.com/designby.archana/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#e1306c] transition-colors font-semibold"
              >
                <Instagram size={14} />
                <span>Instagram</span>
              </a>
              <a 
                href="https://www.facebook.com/archana.gavas" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1877f2] transition-colors font-semibold"
              >
                <Facebook size={14} />
                <span>Facebook</span>
              </a>
            </div>
          </div>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            className="flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#111] hover:border-gray-400 hover:bg-gray-50 transition-colors self-start md:self-center shrink-0"
          >
            <LinkIcon className="w-3 h-3" />
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* Related Blogs */}
      {related.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 mb-24">
          <h3 className="text-xl font-bold text-[#111] mb-8 tracking-tight">Related Blogs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {related.slice(0, 2).map(rb => (
              <Link key={rb.id} to={`/blog/${rb.slug || rb.id}`} className="flex items-center space-x-5 group p-2 hover:bg-gray-50 rounded-sm transition-colors">
                <img src={rb.image} alt={rb.title} className="w-24 h-24 object-cover rounded-sm flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-[#111] text-sm md:text-base leading-tight group-hover:text-[#8bc34a] transition-colors mb-2 line-clamp-2">{rb.title}</h4>
                  <p className="text-xs font-bold text-gray-400 flex items-center tracking-wider">
                    <Calendar className="w-3 h-3 mr-1.5" /> {rb.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default BlogDetail;