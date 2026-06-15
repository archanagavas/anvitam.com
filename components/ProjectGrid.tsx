import React from 'react';
import { Project } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface ProjectGridProps {
  projects: Project[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16"
    >
      {projects.map((project) => (
        <motion.div 
          key={project.id} 
          variants={itemVariants}
          onClick={() => navigate(`/projects/${project.id}`)} 
          className="group cursor-pointer"
        >
          <div className="relative overflow-hidden bg-white/5 aspect-[4/3] mb-6 rounded-sm">
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-full object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <span className="text-white border border-white/50 bg-black/20 px-8 py-3 text-xs tracking-[0.2em] uppercase transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 backdrop-blur-md hover:bg-white hover:text-black">
                View Project
              </span>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl md:text-2xl font-light text-white group-hover:text-[#5A5A40] transition-colors duration-300 font-serif">
                {project.title}
              </h3>
              <p className="text-sm text-white/50 mt-2 font-mono uppercase tracking-wider">{project.location}</p>
            </div>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.15em] border border-white/20 bg-white/5 px-3 py-1.5 rounded-full">
              {project.category}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProjectGrid;