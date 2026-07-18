import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const TerraceGarden: React.FC = () => {
  const canonical = 'https://www.anvitam.com/seo/terrace-garden';
  return (
    <div className="min-h-screen bg-[#EFEFEB] text-[#111] pt-32 px-6">
      <Helmet>
        <title>Terrace Garden &amp; Rooftop Sanctuary Design | Anvitam</title>
        <meta name="description" content="Transform barren rooftops into lush, productive terrace gardens. Structural auditing, lightweight soil engineering, and biophilic design by Anvitam." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Terrace Garden &amp; Rooftop Sanctuary Design | Anvitam" />
        <meta property="og:description" content="Transform barren rooftops into lush, productive terrace gardens. Structural auditing, lightweight soil engineering, and biophilic design by Anvitam." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#111] mb-6">Terrace Garden &amp; Rooftop Design</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Anvitam transforms neglected rooftops into thriving terrace gardens and outdoor sanctuaries. Our designs include structural load analysis, lightweight growing media, drip irrigation, edible planting, and biophilic elements that cool the building naturally.
        </p>
        <Link to="/services/terrace-garden" className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#bce600] transition-colors mr-4">
          Explore Terrace Garden Service →
        </Link>
        <Link to="/contact" className="inline-flex items-center border border-[#111] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#111] hover:text-white transition-colors">
          Free Consultation
        </Link>
      </div>
    </div>
  );
};
export default TerraceGarden;
