import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const WellnessRetreat: React.FC = () => {
  const canonical = 'https://www.anvitam.com/seo/wellness-retreat';
  return (
    <div className="min-h-screen bg-[#EFEFEB] text-[#111] pt-32 px-6">
      <Helmet>
        <title>Wellness Retreat Architecture &amp; Sanctuaries | Anvitam</title>
        <meta name="description" content="Architecting world-class wellness retreats, meditation shalas, and healing sanctuaries that promote physical, mental, and spiritual rejuvenation using biophilic design." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Wellness Retreat Architecture &amp; Sanctuaries | Anvitam" />
        <meta property="og:description" content="Architecting world-class wellness retreats, meditation shalas, and healing sanctuaries that promote physical, mental, and spiritual rejuvenation using biophilic design." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#111] mb-6">Wellness Retreat Architecture</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Anvitam architects world-class wellness retreats, meditation centers, and healing sanctuaries. Our biophilic approach integrates natural materials, therapeutic gardens, water features, and passive solar design to create spaces that genuinely restore mind and body.
        </p>
        <Link to="/services/wellness-retreat" className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#bce600] transition-colors mr-4">
          Explore Wellness Retreat Service →
        </Link>
        <Link to="/contact" className="inline-flex items-center border border-[#111] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#111] hover:text-white transition-colors">
          Free Consultation
        </Link>
      </div>
    </div>
  );
};
export default WellnessRetreat;
