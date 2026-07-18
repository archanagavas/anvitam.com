import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const CommunityCentre: React.FC = () => {
  const canonical = 'https://www.anvitam.com/seo/community-centre';
  return (
    <div className="min-h-screen bg-[#EFEFEB] text-[#111] pt-32 px-6">
      <Helmet>
        <title>Community Centers &amp; Civic Architecture | Anvitam</title>
        <meta name="description" content="Designing sustainable, accessible, and resilient community centers that serve local neighborhoods and teach ecology through action." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Community Centers &amp; Civic Architecture | Anvitam" />
        <meta property="og:description" content="Designing sustainable, accessible, and resilient community centers that serve local neighborhoods and teach ecology through action." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#111] mb-6">Community Centers &amp; Civic Architecture</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Anvitam designs sustainable, accessible, and resilient community centers that serve local neighborhoods and teach ecology through action. Our civic architecture integrates natural materials, passive cooling, and permaculture landscapes.
        </p>
        <Link to="/contact" className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#bce600] transition-colors">
          Start a Community Project →
        </Link>
      </div>
    </div>
  );
};
export default CommunityCentre;
