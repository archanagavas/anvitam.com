import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const WeekendVillas: React.FC = () => {
  const canonical = 'https://www.anvitam.com/seo/weekend-villas';
  return (
    <div className="min-h-screen bg-[#EFEFEB] text-[#111] pt-32 px-6">
      <Helmet>
        <title>Sustainable Weekend Villas | Anvitam Architecture</title>
        <meta name="description" content="Design beautiful, eco-friendly weekend villas blending biophilic architecture with modern comforts. Grounded in natural materials and off-grid living by Anvitam." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Sustainable Weekend Villas | Anvitam Architecture" />
        <meta property="og:description" content="Design beautiful, eco-friendly weekend villas blending biophilic architecture with modern comforts. Grounded in natural materials and off-grid living by Anvitam." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#111] mb-6">Sustainable Weekend Villa Design</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Anvitam designs sustainable weekend villas that serve as personal retreats and income-generating holiday rentals. Our villa designs prioritize natural ventilation, locally sourced stone and timber, rainwater harvesting, and food forest gardens.
        </p>
        <Link to="/services/weekend-villa" className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#bce600] transition-colors mr-4">
          Explore Weekend Villa Service →
        </Link>
        <Link to="/contact" className="inline-flex items-center border border-[#111] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#111] hover:text-white transition-colors">
          Free Consultation
        </Link>
      </div>
    </div>
  );
};
export default WeekendVillas;
