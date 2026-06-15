import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PROCESS_STEPS } from '../constants';
import { motion } from 'framer-motion';

const Process: React.FC = () => {
  const { phase } = useParams<{ phase: string }>();
  const currentStep = PROCESS_STEPS.find(s => s.id === phase);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  if (!currentStep) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f0] font-sans">
        <p className="text-xl font-serif mb-4 text-[#0a0a0a]">Process phase not found.</p>
        <Link to="/" className="border-b border-[#0a0a0a] pb-1 text-[#0a0a0a] hover:text-[#5A5A40] transition-colors">Back Home</Link>
      </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-24 pb-12 relative overflow-hidden font-sans">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stucco.png")' }}></div>

      <Helmet>
        <title>{currentStep.title} | Sustainable Architecture Process</title>
        <meta name="description" content={`${currentStep.description} Learn about our sustainable resort architecture, eco retreat design, and green building design process.`} />
      </Helmet>
      
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Navigation Breadcrumbs for Process */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex space-x-8 mb-16 border-b border-[#0a0a0a]/10 pb-4 overflow-x-auto scrollbar-hide"
        >
           {PROCESS_STEPS.map(step => (
             <Link 
              key={step.id} 
              to={`/process/${step.id}`}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex-shrink-0 whitespace-nowrap ${step.id === phase ? 'text-[#5A5A40] border-b-2 border-[#5A5A40] pb-4 -mb-[17px]' : 'text-[#0a0a0a]/40 hover:text-[#0a0a0a]'}`}
             >
               {step.number}. {step.title}
             </Link>
           ))}
        </motion.div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 items-start"
        >
           
           {/* Left Column: Number, Title, Items */}
           <div className="md:col-span-5">
             <motion.div variants={fadeInUp}>
               <span className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-serif text-[#0a0a0a]/10 block -ml-2 mb-4 leading-none select-none">{currentStep.number}</span>
               <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#0a0a0a] mb-8 leading-tight tracking-tight">{currentStep.title}</h1>
               
               <ul className="space-y-4 mb-12">
                 {currentStep.items.map((item, idx) => (
                   <motion.li 
                     key={idx} 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.3 + (idx * 0.1), ease: [0.16, 1, 0.3, 1] }}
                     className="flex items-center text-lg font-light text-[#0a0a0a]/80"
                   >
                     <span className="mr-4 text-[#5A5A40] opacity-50">[</span>
                     {item}
                     <span className="ml-4 text-[#5A5A40] opacity-50">]</span>
                   </motion.li>
                 ))}
               </ul>

               {/* Image for Mobile Only */}
               <div className="block md:hidden mb-8 aspect-[4/3] bg-[#0a0a0a]/5 overflow-hidden rounded-sm shadow-lg">
                  <img src={currentStep.image} alt={`${currentStep.title} - Sustainable Design Process`} className="w-full h-full object-cover" />
               </div>
             </motion.div>
           </div>

           {/* Right Column: Image (Desktop), Description, Approach */}
           <div className="md:col-span-7 space-y-12 md:pt-12">
             
             {/* Main Image - Desktop */}
             <motion.div variants={fadeInUp} className="hidden md:block aspect-[16/9] w-full bg-[#0a0a0a]/5 overflow-hidden mb-12 shadow-xl rounded-sm group">
                <img 
                  src={currentStep.image} 
                  alt={`${currentStep.title} - Eco Retreat Designer`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-[0.16,1,0.3,1]" 
                />
             </motion.div>

             <motion.div variants={fadeInUp}>
               <p className="text-2xl md:text-3xl font-serif leading-relaxed text-[#0a0a0a]/90">
                 {currentStep.description}
               </p>
               <p className="text-lg leading-relaxed text-[#0a0a0a]/70 mt-8 font-light">
                 At Anvitam, we believe that <span className="italic text-[#5A5A40]">{currentStep.title.toLowerCase()}ing</span> is not just a phase, but a continuous dialogue. By engaging deeply with this step, we ensure that the outcome is not just a building, but a living, breathing ecosystem that respects its inhabitants and its environment, embodying true <span className="font-medium text-[#0a0a0a]">sustainable architecture</span>.
               </p>
             </motion.div>

             {/* Approach Box */}
             <motion.div variants={fadeInUp}>
               <div className="bg-white p-8 md:p-12 border border-[#0a0a0a]/5 shadow-sm mt-12 relative overflow-hidden group rounded-sm">
                 <div className="absolute top-0 left-0 w-1 h-full bg-[#5A5A40] transform origin-top scale-y-100 transition-transform duration-500"></div>
                 <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-6 text-[#5A5A40]">Our Approach</h3>
                 <p className="text-[#0a0a0a]/70 text-base leading-loose font-light">
                   We employ a rigorous methodology for the {currentStep.title} phase, ensuring no detail is overlooked. From initial sketches to advanced simulations, our process is designed to mitigate risk and maximize creativity, whether for <span className="italic font-serif text-[#0a0a0a]">farm retreat architecture</span> or <span className="italic font-serif text-[#0a0a0a]">wellness retreat planning</span>.
                 </p>
               </div>
             </motion.div>
           </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Process;