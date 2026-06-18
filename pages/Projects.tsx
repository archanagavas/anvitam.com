import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, ChevronRight, Ruler, Zap, Clock, Leaf } from 'lucide-react';

const Projects: React.FC = () => {
  const { projects } = useContent();
  const navigate = useNavigate();
  
  const featuredProjects = projects.slice(0, 3);
  const archivedProjects = projects.slice(3);

  const getSpecIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('area') || l.includes('sqft') || l.includes('size')) return <Ruler size={16} strokeWidth={2.5} className="text-[#0a0a0a] shrink-0" />;
    if (l.includes('energy') || l.includes('power')) return <Zap size={16} strokeWidth={2.5} className="text-[#0a0a0a] shrink-0" />;
    if (l.includes('time') || l.includes('duration')) return <Clock size={16} strokeWidth={2.5} className="text-[#0a0a0a] shrink-0" />;
    if (l.includes('team') || l.includes('lead')) return <Leaf size={16} fill="#CCFF00" strokeWidth={1} className="text-[#0a0a0a] shrink-0" />;
    return <ChevronRight size={16} strokeWidth={2.5} className="text-[#0a0a0a] shrink-0" />;
  };

  return (
    <div className="bg-[#ffffff] text-[#0a0a0a] min-h-screen font-sans selection:bg-[#CCFF00] selection:text-[#111]">
      <Helmet>
        <title>Projects | Sustainable Resort Architect & Eco Retreat Designer</title>
        <meta name="description" content="Explore our portfolio of sustainable architecture, permaculture design, farm retreats, wellness spaces, and weekend villa design." />
      </Helmet>

      {/* Hero Section */}
      <div className="relative pt-40 pb-32 flex flex-col justify-end text-left overflow-hidden min-h-[50vh] md:min-h-[60vh]">
        <div className="absolute inset-0 z-0">
          <img 
             src="https://images.unsplash.com/photo-1540544660406-6a69dacb2804?q=80&w=2000&auto=format&fit=crop" 
             alt="Hero Background" 
             className="w-full h-full object-cover brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-12 w-full mt-auto">
           <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl lg:text-7xl font-sans font-medium text-white mb-4 leading-tight"
           >
              Projects
           </motion.h1>
           <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-white/90 font-light mb-8 max-w-lg leading-relaxed"
           >
              Here are some of the best sustainable architecture projects we are designing across the region.
           </motion.p>
           <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white text-[#0a0a0a] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#ccff00] flex items-center gap-2 w-max transition-colors"
           >
              View guide <ArrowRight size={14}/>
           </motion.button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 md:py-32">
         {/* Title Section */}
         <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-24 gap-8">
            <div className="flex-1">
               <span className="inline-block py-1 px-3 rounded-md border border-gray-200 text-[10px] font-bold uppercase tracking-widest mb-6 bg-white text-gray-400">
                  Case Studies
               </span>
               <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-medium text-[#0a0a0a] max-w-2xl leading-[1.1]">
                  See How We're Designing Change Around the World
               </h2>
            </div>
            <button className="bg-[#ccff00] text-[#0a0a0a] px-6 py-3 rounded-full text-xs font-bold shrink-0 flex items-center gap-2 hover:bg-[#bce600] transition-colors w-max">
               View all projects <ArrowRight size={14}/>
            </button>
         </div>

         {/* Featured Projects Loop */}
         <div className="space-y-24 md:space-y-32">
            {featuredProjects.map(project => (
                <motion.div 
                   key={project.id} 
                   initial={{ opacity: 0, y: 40 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ duration: 0.8 }}
                   className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center"
                >
                   {/* Image */}
                   <div 
                      className="w-full aspect-square bg-gray-100 cursor-pointer overflow-hidden" 
                      onClick={() => navigate(`/projects/${project.id}`)}
                   >
                      <img 
                         src={project.image} 
                         alt={project.title} 
                         className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                   </div>
                   
                   {/* Text Block */}
                   <div className="flex flex-col">
                      <h3 className="text-2xl md:text-[1.75rem] font-medium text-[#0a0a0a] mb-4 leading-tight">{project.title}</h3>
                      <p className="text-[#0a0a0a]/60 text-sm md:text-base leading-relaxed mb-10 pb-4 border-b border-transparent">
                         {project.description}
                      </p>
                      
                      {/* Specs List */}
                      <div className="space-y-0 text-sm md:text-xs">
                         {/* Location */}
                         <div className="flex justify-between items-center border-b border-gray-200 py-3">
                            <span className="font-bold flex items-center gap-2.5 text-[#0a0a0a]">
                               <MapPin size={16} fill="#CCFF00" strokeWidth={1} className="text-[#0a0a0a] shrink-0" /> 
                               Location
                            </span>
                            <span className="text-[#0a0a0a]/60 font-medium">{project.location}</span>
                         </div>
                         {/* Year */}
                         <div className="flex justify-between items-center border-b border-gray-200 py-3">
                            <span className="font-bold flex items-center gap-2.5 text-[#0a0a0a]">
                               <Calendar size={16} fill="#CCFF00" strokeWidth={1} className="text-[#0a0a0a] shrink-0" /> 
                               Year
                            </span>
                            <span className="text-[#0a0a0a]/60 font-medium">{project.year}</span>
                         </div>
                         {/* Status */}
                         {project.status && (
                            <div className="flex justify-between items-center border-b border-gray-200 py-3">
                               <span className="font-bold flex items-center gap-2.5 text-[#0a0a0a]">
                                  <ChevronRight size={16} strokeWidth={2.5} className="text-[#0a0a0a] shrink-0" /> 
                                  Status
                               </span>
                               <span className="text-[#0a0a0a]/60 font-medium">{project.status === 'ongoing' ? 'Ongoing' : 'Delivered'}</span>
                            </div>
                         )}
                         {/* Dynamic Specs */}
                         {project.specs?.slice(0, 4).map(spec => (
                            <div key={spec.label} className="flex justify-between items-center border-b border-gray-200 py-3">
                               <span className="font-bold flex items-center gap-2.5 text-[#0a0a0a]">
                                  {getSpecIcon(spec.label)}
                                  {spec.label}
                               </span>
                               <span className="text-[#0a0a0a]/60 font-medium">{spec.value}</span>
                            </div>
                         ))}
                      </div>

                      <div className="mt-10">
                         <button 
                            onClick={() => navigate(`/projects/${project.id}`)} 
                            className="bg-[#ccff00] text-[#0a0a0a] px-6 py-3 rounded-full text-xs font-bold hover:bg-[#bce600] inline-flex items-center gap-2 transition-colors"
                         >
                            View full study <ArrowRight size={14} />
                         </button>
                      </div>
                   </div>
                </motion.div>
            ))}
         </div>

         {/* Archives Section */}
         {archivedProjects.length > 0 && (
            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="mt-32 pt-8 mb-4 border-t-0"
            >
                <h2 className="text-2xl md:text-[1.75rem] font-medium text-[#0a0a0a] mb-8">Archieves</h2>
                <div className="flex flex-col border-t border-gray-200">
                   {archivedProjects.map(project => (
                      <div 
                         key={project.id} 
                         onClick={() => navigate(`/projects/${project.id}`)} 
                         className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center border-b border-gray-200 py-5 hover:bg-gray-50 transition-colors cursor-pointer group px-4 -mx-4 rounded-xl"
                      >
                         <div className="md:col-span-4">
                            <h4 className="font-bold text-sm text-[#0a0a0a] group-hover:text-black transition-colors">{project.title}</h4>
                         </div>
                         <div className="md:col-span-2 text-xs text-[#0a0a0a]/50 flex items-center gap-1.5 font-medium">
                            <MapPin size={12} className="shrink-0 text-gray-400" /> {project.location}
                         </div>
                         <div className="md:col-span-4 text-xs text-[#0a0a0a]/40 line-clamp-1 font-medium">
                            {project.description}
                         </div>
                         <div className="md:col-span-2 text-left md:text-right mt-1 md:mt-0">
                            <span className="text-[10px] font-bold uppercase tracking-widest border border-gray-200 rounded-full px-4 py-2 hover:bg-[#0a0a0a] hover:text-[#ccff00] transition-colors inline-flex items-center gap-1 text-[#0a0a0a]">
                               View Project <ArrowRight size={10} />
                            </span>
                         </div>
                      </div>
                   ))}
                </div>
            </motion.div>
         )}
      </div>

    </div>
  );
};

export default Projects;