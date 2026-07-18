import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const AirbnbHomestay: React.FC = () => {
  const canonical = 'https://www.anvitam.com/seo/airbnb-homestay';
  return (
    <div className="min-h-screen bg-[#EFEFEB] text-[#111] pt-32 px-6">
      <Helmet>
        <title>Airbnb &amp; Homestay Design for Revenue | Anvitam</title>
        <meta name="description" content="Elevate your rental property with Anvitam's signature Airbnb & Homestay design, maximizing occupancy, guest reviews, and local authenticity through sustainable architecture." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Airbnb &amp; Homestay Design for Revenue | Anvitam" />
        <meta property="og:description" content="Elevate your rental property with Anvitam's signature Airbnb & Homestay design, maximizing occupancy, guest reviews, and local authenticity through sustainable architecture." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#111] mb-6">Airbnb &amp; Homestay Architecture Design</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Anvitam transforms residential properties into high-earning Airbnb and homestay experiences. We combine biophilic design, natural materials, and space optimization to create unique guest experiences that generate 5-star reviews and repeat bookings.
        </p>
        <Link to="/services/airbnb" className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#bce600] transition-colors mr-4">
          Explore Airbnb Design Service →
        </Link>
        <Link to="/contact" className="inline-flex items-center border border-[#111] text-[#111] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#111] hover:text-white transition-colors">
          Free Consultation
        </Link>
      </div>
    </div>
  );
};
export default AirbnbHomestay;
