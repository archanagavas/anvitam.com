import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Permaculture: React.FC = () => {
  const canonical = 'https://www.anvitam.com/seo/permaculture';
  return (
    <div className="min-h-screen bg-[#EFEFEB] text-[#111] pt-32 px-6">
      <Helmet>
        <title>Permaculture Design &amp; Consultation | Anvitam</title>
        <meta name="description" content="Professional permaculture design and consultation services to turn your land into a self-sustaining, biodiverse, and productive food forest by Anvitam architects." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Permaculture Design &amp; Consultation | Anvitam" />
        <meta property="og:description" content="Professional permaculture design and consultation services to turn your land into a self-sustaining, biodiverse, and productive food forest by Anvitam architects." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#111] mb-6">Permaculture Design &amp; Consultation</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Anvitam provides full permaculture masterplanning for agricultural land, eco-communities, and private estates. Our designs optimize water resources, maximize soil health, and integrate edible landscapes using organic and regenerative principles.
        </p>
        <Link to="/services/permaculture-design" className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#bce600] transition-colors mr-4">
          Explore Permaculture Service →
        </Link>
        <Link to="/contact" className="inline-flex items-center border border-[#111] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#111] hover:text-white transition-colors">
          Free Consultation
        </Link>
      </div>
    </div>
  );
};
export default Permaculture;
