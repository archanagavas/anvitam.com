import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { FileText, Shield, Image as ImageIcon, AlertTriangle, Scale, MapPin } from 'lucide-react';

const TermsSection: React.FC<{ num: number; title: string; icon: any; children: React.ReactNode }> = ({ num, title, icon: Icon, children }) => (
  <div className="mb-16 md:mb-24 flex flex-col md:flex-row gap-6 md:gap-16 items-start">
     <div className="md:w-1/3 flex border-t-2 border-black/10 pt-6 w-full">
        <div className="w-12 h-12 bg-[#CCFF00] rounded-full flex items-center justify-center mr-4 shrink-0 transition-transform hover:scale-110 duration-500">
          <Icon size={20} className="text-[#111]" />
        </div>
        <div>
           <span className="text-gray-400 text-xs font-bold tracking-widest mb-1 block uppercase">Clause 0{num}</span>
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

const Terms: React.FC = () => {
  return (
    <div
      className="bg-[#EFEFEB] min-h-screen text-[#111]"
    >
      <Helmet>
        <title>Terms & Conditions | Anvitam Architecture</title>
        <meta name="description" content="Terms and Conditions for engaging with Anvitam Sustainable Architecture." />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-16 bg-[#0D0D0D] text-white">
        <div className="max-w-screen-xl mx-auto">
          <span className="inline-block py-1.5 px-3 rounded-full border border-white/20 text-white/70 text-xs font-bold tracking-widest uppercase mb-6">
            Legal // Engagement
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1]">
            Terms & Conditions.
          </h1>
          <p className="text-xl text-white/60 max-w-2xl font-light">
            By engaging with Anvitam's platform or services, you agree to these legal terms defining intellectual property, liability, and the nature of our architectural deliverables.
          </p>
          <div className="mt-12 pt-8 border-t border-white/10 flex gap-8 text-sm">
            <div>
              <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-1">Effective Date</p>
              <p className="text-[#CCFF00] font-bold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-1">Entity</p>
              <p className="text-white font-bold">Anvitam Group</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-24 px-6 md:px-16 max-w-screen-xl mx-auto">
        <TermsSection num={1} title="Agreement to Terms" icon={FileText}>
          <p>
            By viewing, accessing, or utilizing any resources on this website, you agree to comply with and be bound by the following terms and conditions of use. 
          </p>
          <p>
            If you disagree with any segment of these terms, you must discontinue your use of our platform and refrain from engaging our architectural services. We reserve the right to amend these Terms at any time without prior, individual notice.
          </p>
        </TermsSection>

        <TermsSection num={2} title="Intellectual Property" icon={Shield}>
          <p>
            Anvitam Architecture retains full and exclusive ownership of all intellectual property rights and materials contained in this Website. This includes, but is not limited to, architectural blueprints, digital renders, conceptual sketches, photographs, brand logos, and written copy.
          </p>
          <div className="bg-red-50 border border-red-100 text-red-900 p-6 rounded-xl mt-4">
            <strong className="block mb-2 font-bold text-red-700">Strict Prohibition:</strong>
            Any unauthorized reproduction, modification, distribution, or public exhibition of the architectural content found on this site is strictly prohibited and subject to immediate legal action under copyright law.
          </div>
        </TermsSection>

        <TermsSection num={3} title="Service Capabilities" icon={ImageIcon}>
          <p>
            The aesthetic representations (renders, sketches, moodboards) provided on this website are for illustrative purposes and visual inspiration. 
          </p>
          <p>
            Final architectural execution always relies on signed, physical/digital milestone contracts unique to individual clients, accounting for precise topography, local jurisdiction planning laws, and engineering constraints. Web content does not constitute a legally binding guarantee of a built outcome.
          </p>
        </TermsSection>

        <TermsSection num={4} title="Liability Limitation" icon={AlertTriangle}>
          <p>
            In no event shall Anvitam Architecture, nor any of its officers, directors, architects, or employees, be held liable for any damages arising out of or in any way connected with your use of this Website. 
          </p>
          <p>
            Under no circumstances shall Anvitam be held liable for indirect, consequential, or special liability resulting from errors, technical downtime, or third-party links hosted on this platform.
          </p>
        </TermsSection>

        <TermsSection num={5} title="Indemnification" icon={Scale}>
          <p>
            You hereby indemnify to the fullest extent Anvitam Architecture from and against any and/or all liabilities, costs, demands, causes of action, damages, and expenses arising in any way related to your breach of any of the provisions of these Terms.
          </p>
        </TermsSection>

        <TermsSection num={6} title="Governing Jurisdiction" icon={MapPin}>
          <p>
            These Terms shall be interpreted, construed, and enforced in accordance with the laws of the jurisdiction in which Anvitam's primary headquarters is located, without regard to its conflict of law principles.
          </p>
          <p>
            Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the state and federal courts operating within that region.
          </p>
        </TermsSection>
      </section>
    </div>
  );
};

export default Terms;
