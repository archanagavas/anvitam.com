import React from 'react';
import { Helmet } from 'react-helmet-async';
import CADStudio from '../components/rachnacad/CADStudio';

/**
 * RachnaCAD Desktop-Grade Software Workspace
 * Pure CAD/BIM Application GUI (Archicad 3D BIM + AutoCAD 2D Precision + Multi-AI Engine)
 * No marketing landing page fluff.
 */
export default function RachnaCAD() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-white text-gray-900 flex flex-col font-sans select-none">
      <Helmet>
        <title>RachnaCAD Studio | 2D AutoCAD Precision &amp; 3D Archicad BIM</title>
        <meta
          name="description"
          content="Professional Architectural CAD &amp; BIM software. 2D precision drafting, 3D parametric WebGPU BIM, and local multi-model AI."
        />
      </Helmet>
      <CADStudio fullScreen={true} />
    </div>
  );
}
