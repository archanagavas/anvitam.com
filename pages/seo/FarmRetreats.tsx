import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const FarmRetreats: React.FC = () => {
  const canonical = 'https://www.anvitam.com/seo/farm-retreat-architecture';
  return (
    <div className="min-h-screen bg-[#EFEFEB] text-[#111] pt-32 px-6">
      <Helmet>
        <title>Farm Retreat Architecture &amp; Design | Anvitam</title>
        <meta name="description" content="Discover sustainable farm retreat architecture and design by Anvitam. We build eco-friendly farm stays integrated with nature, permaculture, and natural building materials." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Farm Retreat Architecture &amp; Design | Anvitam" />
        <meta property="og:description" content="Discover sustainable farm retreat architecture and design by Anvitam. We build eco-friendly farm stays integrated with nature, permaculture, and natural building materials." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#111] mb-6">Farm Retreat Architecture &amp; Design</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Anvitam specializes in sustainable farm retreat architecture — designing off-grid farm stays, agritourism retreats, and eco-friendly hospitality properties that blend seamlessly with their natural surroundings using earth, stone, bamboo, and lime.
        </p>
        <Link to="/services/farm-retreat" className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#bce600] transition-colors mr-4">
          Explore Farm Retreat Service →
        </Link>
        <Link to="/contact" className="inline-flex items-center border border-[#111] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#111] hover:text-white transition-colors">
          Free Consultation
        </Link>
      </div>
    </div>
  );
};
export default FarmRetreats;
