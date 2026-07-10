import React from 'react';
import { Helmet } from 'react-helmet-async';
import { TEAM_MEMBERS } from '../constants';
import { motion } from 'framer-motion';

const Team: React.FC = () => {
  const archana = TEAM_MEMBERS.find(m => m.name.includes('Archana'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="py-24 bg-[#f5f5f0] min-h-screen relative overflow-hidden font-sans">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stucco.png")' }}></div>
      
      <Helmet>
        <title>Who We Are | Sustainable Resort Architect & Eco Retreat Designer</title>
        <meta name="description" content="Meet Archana Gavas, Principal Architect and Founder of Anvitam, specializing in sustainable resort architecture, eco retreat design, and permaculture landscape design." />
        <meta name="keywords" content="archana gavas, sustainable resort architect, eco retreat designer, permaculture landscape design, backyard garden design, farm retreat architecture" />
        <meta name="robots" content="index, follow" />
        <meta name="X-Robots-Tag" content="index, follow" />
        <meta name="publisher" content="Anvitam" />
        <link rel="publisher" href="https://www.anvitam.com/" />
        <link rel="canonical" href="https://www.anvitam.com/team" />
      </Helmet>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-16 relative z-10"
      >
        
        {/* Left Col: Image & Contact */}
        <div className="md:col-span-5 md:sticky md:top-32 self-start">
           <motion.div variants={itemVariants}>
             <div className="relative overflow-hidden aspect-[3/4] mb-8 bg-[#0a0a0a]/5 rounded-sm group">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  src={archana?.image || "/founder.jpg"} 
                  alt="Archana Gavas - Sustainable Resort Architect" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"; // Fallback
                  }}
                />
                <div className="absolute inset-0 bg-[#0a0a0a]/10 group-hover:bg-transparent transition-colors duration-500"></div>
             </div>
             <h1 className="text-4xl font-serif text-[#0a0a0a] mb-2">Archana Gavas</h1>
             <p className="text-[10px] uppercase tracking-[0.2em] text-[#5A5A40] mb-8 font-bold">Principal Architect, Founder</p>
             
             <div className="text-sm text-[#0a0a0a]/70 font-light space-y-4">
               <p className="flex items-center gap-3 hover:text-[#5A5A40] transition-colors cursor-pointer group">
                 <span className="w-6 h-px bg-[#5A5A40] group-hover:w-8 transition-all duration-300"></span>
                 anvitamarchitect@gmail.com
               </p>
               <a href="https://www.linkedin.com/in/archana-gavas/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#5A5A40] transition-colors group">
                 <span className="w-6 h-px bg-[#5A5A40] group-hover:w-8 transition-all duration-300"></span>
                 LinkedIn Profile
               </a>
             </div>
           </motion.div>
        </div>

        {/* Right Col: Narrative */}
        <div className="md:col-span-7 pt-8 md:pt-0">
          <div className="prose prose-lg prose-headings:font-serif prose-p:font-light text-[#0a0a0a]/80 max-w-none">
            <motion.div variants={itemVariants}>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5A40] mb-12 flex items-center gap-4">
                <span className="w-12 h-px bg-[#5A5A40]"></span>
                Meet Us
              </h2>
              
              <p className="text-3xl md:text-5xl font-serif italic text-[#0a0a0a] mb-16 leading-tight">
                "I didn’t start with a firm. No team. No funding. No roadmap. Just a quiet belief in sustainable architecture."
              </p>
            </motion.div>

            <div className="space-y-10 leading-relaxed text-lg">
              <motion.div variants={itemVariants}>
                <p>
                  As a freelance architect, I wore every hat. From concept to execution, budgeting to supervision. What kept me going was the hope that every space I touched—whether a <strong>farm retreat architecture</strong> project or a <strong>community centre design</strong>—might help someone feel seen, safe, or inspired.
                </p>
                
                <p>
                  That belief shaped <strong>Anvitam</strong> — my independent architecture studio, built from the ground up. I’ve led 10+ projects spanning residential architecture, commercial space design, community-driven architecture, and landscape planning. Each one rooted in context, emotion, and honest simplicity.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <p>
                  But creativity, to me, doesn’t end at walls and plans. It belongs in classrooms, offices, and playgrounds too. That’s why I founded <em>Nest N Nurture</em> — a space for creative workshops that bring imagination back into design. We invite people — especially children — to transform their own spaces using color, stories, and collaboration. It’s not just a makeover. It’s ownership.
                </p>

                <div className="relative pl-8 py-6 my-16 italic text-[#0a0a0a] text-2xl font-serif border-l border-[#5A5A40]/30">
                  "My process is Raw. Intentional. Rooted in <strong>permaculture landscape design</strong>, nature-based systems, and user-centered thinking."
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <p>
                  Whether it’s a <strong>backyard garden design</strong>, a classroom, or a <strong>wellness retreat architecture</strong> project — I design for how people feel, grow, and belong in a space.
                </p>

                <p>
                  Yes, the road’s been rough. Being a solo woman founder in architecture comes with its weight. But I’ve learned to trust the quiet power of consistency, intuition, and care. I don’t follow trends. I follow stories. People. Place. Possibility.
                </p>

                <p className="font-serif text-[#0a0a0a] text-2xl mt-16 border-t border-[#0a0a0a]/10 pt-12">
                  If you believe design can be deeper — let’s build something meaningful together.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Team;