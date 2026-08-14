import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, User, Wrench, Calendar, Activity } from 'lucide-react';
import FlowButton from '../components/ui/flow-button';

const Projects: React.FC = () => {
  const { projects } = useContent();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = [
    { label: 'All Projects', value: 'All' },
    { label: '🏡 Homes & Retreats', value: 'Residential' },
    { label: '🏨 Hospitality & Resorts', value: 'Hospitality' },
    { label: '🌿 Land & Gardens', value: 'Permaculture' },
    { label: '💬 Consultation', value: 'Consultation' }
  ];

  // Category filter
  const categoryFiltered = selectedCategory === 'All'
    ? projects
    : projects.filter(p => 
        p.category?.toLowerCase().includes(selectedCategory.toLowerCase()) || 
        (selectedCategory === 'Residential' && (p.category === 'Residential' || p.category === 'Homes & Retreats' || p.title.toLowerCase().includes('home') || p.title.toLowerCase().includes('house') || p.title.toLowerCase().includes('villa'))) || 
        (selectedCategory === 'Hospitality' && (p.category === 'Hospitality' || p.category === 'Hospitality & Resorts' || p.title.toLowerCase().includes('resort') || p.title.toLowerCase().includes('stay') || p.title.toLowerCase().includes('yurt'))) || 
        (selectedCategory === 'Permaculture' && (p.category === 'Permaculture' || p.category === 'Land & Gardens' || p.title.toLowerCase().includes('farm') || p.title.toLowerCase().includes('garden'))) ||
        (selectedCategory === 'Consultation' && (p.category === 'Consultation' || p.title.toLowerCase().includes('consult') || p.title.toLowerCase().includes('advisory')))
      );

  // Sort Ongoing projects first, then Delivered. Within each group, keep user creation/update order
  const sortedProjects = [...categoryFiltered].sort((a, b) => {
    const statusA = a.status === 'ongoing' ? 0 : 1;
    const statusB = b.status === 'ongoing' ? 0 : 1;
    return statusA - statusB;
  });

  const getClientValue = (project: typeof projects[0]) => {
    const found = project.specs?.find(s => s.label.toLowerCase() === 'client');
    if (found) return found.value;
    return null;
  };

  const getTechniquesValue = (project: typeof projects[0]) => {
    const found = project.specs?.find(s => 
      ['techniques', 'typology', 'materials', 'focus', 'strategy'].includes(s.label.toLowerCase())
    );
    if (found) return found.value;
    return null;
  };

  const renderProjectCard = (project: typeof projects[0]) => {
    const clientVal = getClientValue(project);
    const techVal = getTechniquesValue(project);

    return (
      <motion.div 
        key={project.id} 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Image */}
        <div 
          className="w-full aspect-square bg-gray-100 rounded-2xl cursor-pointer overflow-hidden relative group" 
          onClick={() => navigate(`/projects/${project.slug || project.id}`)}
        >
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* Floating status badge on image */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-xs flex items-center gap-1.5 ${
              project.status === 'ongoing' 
                ? 'bg-amber-500/90 text-white border-amber-400' 
                : 'bg-emerald-950/80 text-[#CCFF00] border-emerald-500/40'
            }`}>
              {project.status === 'ongoing' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping"></span>
                  Ongoing Development
                </>
              ) : (
                'Delivered Project'
              )}
            </span>
          </div>
        </div>
        
        {/* Text Block */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              {project.category}
            </span>
            {project.year && (
              <span className="text-[11px] font-bold text-gray-400">
                {project.year}
              </span>
            )}
          </div>

          <h3 
            onClick={() => navigate(`/projects/${project.slug || project.id}`)}
            className="text-2xl md:text-3xl font-bold text-[#0a0a0a] leading-tight cursor-pointer hover:text-emerald-900 transition-colors mb-3"
          >
            {project.title}
          </h3>

          <p className="text-[#0a0a0a]/70 text-sm md:text-base leading-relaxed mb-8 pb-4 border-b border-gray-100">
            {project.description}
          </p>
          
          {/* Standardized Specs Table */}
          <div className="space-y-0 text-xs mb-8">
            {/* Location */}
            <div className="flex justify-between items-center border-b border-gray-100 py-2.5">
              <span className="font-bold flex items-center gap-2.5 text-[#0a0a0a]">
                <MapPin size={15} fill="#CCFF00" strokeWidth={1} className="text-[#0a0a0a] shrink-0" /> 
                Location
              </span>
              <span className="text-[#0a0a0a]/70 font-medium">{project.location || 'Vadodara, India'}</span>
            </div>

            {/* Client (if present) */}
            {clientVal && (
              <div className="flex justify-between items-center border-b border-gray-100 py-2.5">
                <span className="font-bold flex items-center gap-2.5 text-[#0a0a0a]">
                  <User size={15} fill="#CCFF00" strokeWidth={1} className="text-[#0a0a0a] shrink-0" /> 
                  Client
                </span>
                <span className="text-[#0a0a0a]/70 font-medium">{clientVal}</span>
              </div>
            )}

            {/* Techniques / Typology */}
            {techVal && (
              <div className="flex justify-between items-center border-b border-gray-100 py-2.5">
                <span className="font-bold flex items-center gap-2.5 text-[#0a0a0a]">
                  <Wrench size={15} fill="#CCFF00" strokeWidth={1} className="text-[#0a0a0a] shrink-0" /> 
                  Techniques / Typology
                </span>
                <span className="text-[#0a0a0a]/70 font-medium">{techVal}</span>
              </div>
            )}

            {/* Project Year */}
            <div className="flex justify-between items-center border-b border-gray-100 py-2.5">
              <span className="font-bold flex items-center gap-2.5 text-[#0a0a0a]">
                <Calendar size={15} fill="#CCFF00" strokeWidth={1} className="text-[#0a0a0a] shrink-0" /> 
                Project Year
              </span>
              <span className="text-[#0a0a0a]/70 font-medium">{project.year || '2026'}</span>
            </div>

            {/* Project Status */}
            <div className="flex justify-between items-center border-b border-gray-100 py-2.5">
              <span className="font-bold flex items-center gap-2.5 text-[#0a0a0a]">
                <Activity size={15} className="text-emerald-700 shrink-0" /> 
                Project Status
              </span>
              <span className="text-[#0a0a0a]/70 font-medium">
                {project.status === 'ongoing' ? 'Ongoing Development' : 'Delivered'}
              </span>
            </div>
          </div>

          <div>
            <FlowButton 
              text="Explore Project Study"
              variant="lime"
              onClick={() => navigate(`/projects/${project.slug || project.id}`)}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-[#ffffff] text-[#0a0a0a] min-h-screen font-sans selection:bg-[#CCFF00] selection:text-[#111]">
      <Helmet>
        <title>Projects | Sustainable Farmhouse, Eco Resort & Permaculture Portfolio</title>
        <meta name="description" content="Explore our complete portfolio of sustainable architecture, permaculture design, farm retreats, food forests, and eco resorts by Anvitam." />
        <meta name="keywords" content="sustainable architecture projects, eco resort design, permaculture farm retreats, green building design, architectural portfolio, vadodara architecture" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.anvitam.com/projects" />
      </Helmet>

      {/* Hero Section */}
      <div className="relative pt-40 pb-28 flex flex-col justify-end text-left overflow-hidden min-h-[45vh]">
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
              className="text-4xl md:text-6xl font-sans font-bold text-white mb-4 leading-tight"
           >
              Our Masterplanned Projects
           </motion.h1>
           <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-white/90 font-light mb-6 max-w-xl leading-relaxed"
           >
              Active developments, real farmhouses, eco-resorts, food forests, and land masterplans.
           </motion.p>
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 pt-10 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-gray-900 text-[#CCFF00] shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-12 md:py-20">
         {sortedProjects.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200">
             <p className="text-base text-gray-500 font-medium">No projects found matching the selected category.</p>
             <button 
               onClick={() => setSelectedCategory('All')}
               className="mt-4 px-4 py-2 bg-black text-[#CCFF00] rounded-full text-xs font-bold"
             >
               Show All Projects
             </button>
           </div>
         ) : (
           <div className="space-y-16">
             {sortedProjects.map(project => renderProjectCard(project))}
           </div>
         )}
      </div>
    </div>
  );
};

export default Projects;