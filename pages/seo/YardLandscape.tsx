import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const YardLandscape: React.FC = () => {
  const canonical = 'https://www.anvitam.com/seo/yard-landscape';
  return (
    <div className="min-h-screen bg-[#EFEFEB] text-[#111] pt-32 px-6">
      <Helmet>
        <title>Backyard &amp; Ecological Landscape Design | Anvitam</title>
        <meta name="description" content="Beautiful backyard designs featuring natural chemical-free pools, local flora, and passive water harvesting setups by Anvitam sustainable architects." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Backyard &amp; Ecological Landscape Design | Anvitam" />
        <meta property="og:description" content="Beautiful backyard designs featuring natural chemical-free pools, local flora, and passive water harvesting setups by Anvitam sustainable architects." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#111] mb-6">Backyard &amp; Ecological Landscape Design</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Anvitam transforms ordinary yards into ecological landscapes that function as mini food forests, wildlife habitats, and water harvesting systems. We design with native plants, natural pools, bioswales, and sensory garden features.
        </p>
        <Link to="/services/terrace-garden" className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#bce600] transition-colors mr-4">
          Explore Landscape Service →
        </Link>
        <Link to="/contact" className="inline-flex items-center border border-[#111] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#111] hover:text-white transition-colors">
          Free Consultation
        </Link>
      </div>
    </div>
  );
};
export default YardLandscape;
