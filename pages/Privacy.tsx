import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { FileText, Database, Eye, Lock, Shield, Mail } from 'lucide-react';

const PolicySection: React.FC<{ num: number; title: string; icon: any; children: React.ReactNode }> = ({ num, title, icon: Icon, children }) => (
  <div className="mb-16 md:mb-24 flex flex-col md:flex-row gap-6 md:gap-16 items-start">
     <div className="md:w-1/3 flex border-t-2 border-black/10 pt-6 w-full">
        <div className="w-12 h-12 bg-[#CCFF00] rounded-full flex items-center justify-center mr-4 shrink-0 transition-transform hover:scale-110 duration-500">
          <Icon size={20} className="text-[#111]" />
        </div>
        <div>
           <span className="text-gray-400 text-xs font-bold tracking-widest mb-1 block uppercase">Section 0{num}</span>
           <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111] leading-tight">{title}</h2>
        </div>
     </div>
     <div className="md:w-2/3 md:border-t-2 border-transparent md:border-black/5 md:pt-6 w-full">
       <div className="space-y-6 text-gray-600 leading-relaxed text-lg/8 font-medium">
          {children}
       </div>
     </div>
  </div>
);

const Privacy: React.FC = () => {
  return (
    <div
      className="bg-[#EFEFEB] min-h-screen text-[#111]"
    >
      <Helmet>
        <title>Privacy Policy | Anvitam Architecture</title>
        <meta name="description" content="Privacy Policy for Anvitam Sustainable Architecture." />
        <meta name="keywords" content="privacy policy, anvitam privacy, data protection, cookies policy" />
        <meta name="robots" content="index, follow" />
        <meta name="X-Robots-Tag" content="index, follow" />
        <meta name="publisher" content="Anvitam" />
        <link rel="publisher" href="https://www.anvitam.com/" />
        <link rel="canonical" href="https://www.anvitam.com/privacy" />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-16 bg-[#0D0D0D] text-white">
        <div className="max-w-screen-xl mx-auto">
          <span className="inline-block py-1.5 px-3 rounded-full border border-white/20 text-white/70 text-xs font-bold tracking-widest uppercase mb-6">
            Legal // Security
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1]">
            Privacy Policy.
          </h1>
          <p className="text-xl text-white/60 max-w-2xl font-light">
            We are committed to protecting your privacy. This document outlines how your personal data is collected, securely managed, and responsibly utilized by Anvitam.
          </p>
          <div className="mt-12 pt-8 border-t border-white/10 flex gap-8 text-sm">
            <div>
              <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-1">Last Updated</p>
              <p className="text-[#CCFF00] font-bold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-1">Company</p>
              <p className="text-white font-bold">Anvitam Architecture</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-24 px-6 md:px-16 max-w-screen-xl mx-auto">
        <PolicySection num={1} title="Introduction" icon={FileText}>
          <p>
            Anvitam Architecture ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
          </p>
          <p>
            Our core mission revolves around sustainable and transparent practices, and that ethos extends directly to how we handle the digital footprints of our clients and partners.
          </p>
        </PolicySection>

        <PolicySection num={2} title="Information We Collect" icon={Database}>
          <p>
            We collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          </p>
          <ul className="grid md:grid-cols-2 gap-4 mt-4">
            {['Identity Data (Name, Title)', 'Contact Data (Email, Phone)', 'Project Specifications', 'Site Analytics Data'].map(item => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                <span className="text-gray-800 font-bold">{item}</span>
              </li>
            ))}
          </ul>
        </PolicySection>

        <PolicySection num={3} title="Data Utilization" icon={Eye}>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <p>
            Where we need to perform the contract we are about to enter into or have entered into with you (such as designing your architectural spaces). Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.
          </p>
        </PolicySection>

        <PolicySection num={4} title="Protection & Security" icon={Lock}>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. 
          </p>
          <p>
            In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a strict architectural or business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
          </p>
        </PolicySection>

        <PolicySection num={5} title="Third-Party Disclosure" icon={Shield}>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
          </p>
        </PolicySection>

        <PolicySection num={6} title="Contact Information" icon={Mail}>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact our data stewardship team using the details provided below:
          </p>
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mt-6 inline-block">
            <p className="flex items-center gap-3 mb-3">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-xs w-16">Email:</span>
              <a href="mailto:anvitamarchitects@gmail.com" className="text-black font-bold hover:text-[#CCFF00] transition-colors">anvitamarchitects@gmail.com</a>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-xs w-16">Phone:</span>
              <a href="tel:+917990657190" className="text-black font-bold hover:text-[#CCFF00] transition-colors">+91 7990657190</a>
            </p>
          </div>
        </PolicySection>
      </section>
    </div>
  );
};

export default Privacy;
