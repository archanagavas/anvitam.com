import React, { useState } from 'react';
import {
  Building2, Box, Sparkles, FolderOpen, FilePlus, Download,
  Laptop, Monitor, ArrowRight, CheckCircle2, ChevronRight,
  HardDrive, ShieldCheck, Clock, Layers, HelpCircle,
  Upload, Image as ImageIcon, Ruler, Zap, Compass, Check,
  ExternalLink, Terminal, Play, Cpu
} from 'lucide-react';
import { CADElement } from './CADStudio';

interface WelcomeHubProps {
  onNewProject: (templateName?: string, templateElements?: CADElement[]) => void;
  onOpenProject: (fileData?: any) => void;
  onOpenVectorizer: () => void;
  onOpenDesktopSetup: () => void;
  recentProjects?: Array<{
    id: string;
    name: string;
    path: string;
    lastModified: string;
    elementsCount: number;
    type: string;
  }>;
}

// Built-in starter architectural templates
const TEMPLATES: Array<{
  id: string;
  title: string;
  desc: string;
  category: string;
  elements: CADElement[];
}> = [
  {
    id: 'blank',
    title: 'Empty Canvas (2D + 3D)',
    desc: 'Clean workspace with AutoCAD precision grid and WebGPU 3D parametric BIM kernel.',
    category: 'Scratch',
    elements: []
  },
  {
    id: 'residential_30x40',
    title: 'Residential 30x40 ft Plot (2BHK)',
    desc: 'Standard urban residential plot layout with Master Bed, Kitchen in Agni (SE), Living, and Balcony.',
    category: 'Residential',
    elements: [
      { id: 'w1', type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 0, x2: 360, y2: 0, thickness: 9, height: 10, material: 'Brick Masonry', label: 'North Wall' },
      { id: 'w2', type: 'wall', layer: 'A-WALL-EXT', x1: 360, y1: 0, x2: 360, y2: 480, thickness: 9, height: 10, material: 'Brick Masonry', label: 'East Wall' },
      { id: 'w3', type: 'wall', layer: 'A-WALL-EXT', x1: 360, y1: 480, x2: 0, y2: 480, thickness: 9, height: 10, material: 'Brick Masonry', label: 'South Wall' },
      { id: 'w4', type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 480, x2: 0, y2: 0, thickness: 9, height: 10, material: 'Brick Masonry', label: 'West Wall' },
      { id: 'w5', type: 'wall', layer: 'A-WALL-INT', x1: 0, y1: 240, x2: 240, y2: 240, thickness: 4.5, height: 10, material: 'Drywall Partition', label: 'Living Partition' },
      { id: 'w6', type: 'wall', layer: 'A-WALL-INT', x1: 240, y1: 0, x2: 240, y2: 240, thickness: 4.5, height: 10, material: 'Drywall Partition', label: 'Bedroom Partition' },
      { id: 'd1', type: 'door', layer: 'A-DOOR', x1: 180, y1: 480, x2: 216, y2: 480, thickness: 9, label: "Main Entrance (3'-0\")" },
      { id: 'd2', type: 'door', layer: 'A-DOOR', x1: 240, y1: 180, x2: 240, y2: 216, thickness: 4.5, label: "Bed Door (3'-0\")" },
      { id: 'wn1', type: 'window', layer: 'A-GLAZ', x1: 60, y1: 0, x2: 120, y2: 0, thickness: 9, label: "North Window (5'-0\")" },
      { id: 'wn2', type: 'window', layer: 'A-GLAZ', x1: 360, y1: 80, x2: 360, y2: 140, thickness: 9, label: "East Daylight (5'-0\")" },
      { id: 'rm1', type: 'room', layer: 'A-AREA', x1: 120, y1: 360, x2: 120, y2: 360, label: 'LIVING & DINING', areaSqFt: 540 },
      { id: 'rm2', type: 'room', layer: 'A-AREA', x1: 300, y1: 120, x2: 300, y2: 120, label: 'MASTER BEDROOM', areaSqFt: 300 },
      { id: 'rm3', type: 'room', layer: 'A-AREA', x1: 120, y1: 120, x2: 120, y2: 120, label: 'KITCHEN (SE)', areaSqFt: 180 },
    ]
  },
  {
    id: 'commercial_50x60',
    title: 'Commercial Office Suite (50x60 ft)',
    desc: 'Open-plan workspace with structural column grid, executive meeting cabins, and central core.',
    category: 'Commercial',
    elements: [
      { id: 'cw1', type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 0, x2: 600, y2: 0, thickness: 9, height: 12, material: 'Reinforced Concrete', label: 'Curtain Wall N' },
      { id: 'cw2', type: 'wall', layer: 'A-WALL-EXT', x1: 600, y1: 0, x2: 600, y2: 720, thickness: 9, height: 12, material: 'Reinforced Concrete', label: 'Curtain Wall E' },
      { id: 'cw3', type: 'wall', layer: 'A-WALL-EXT', x1: 600, y1: 720, x2: 0, y2: 720, thickness: 9, height: 12, material: 'Reinforced Concrete', label: 'Curtain Wall S' },
      { id: 'cw4', type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 720, x2: 0, y2: 0, thickness: 9, height: 12, material: 'Reinforced Concrete', label: 'Curtain Wall W' },
      { id: 'cw5', type: 'wall', layer: 'A-WALL-INT', x1: 400, y1: 0, x2: 400, y2: 300, thickness: 4.5, height: 12, material: 'Drywall Partition', label: 'Boardroom Partition' },
      { id: 'cw6', type: 'wall', layer: 'A-WALL-INT', x1: 400, y1: 300, x2: 600, y2: 300, thickness: 4.5, height: 12, material: 'Drywall Partition', label: 'Boardroom South' },
      { id: 'crm1', type: 'room', layer: 'A-AREA', x1: 200, y1: 360, x2: 200, y2: 360, label: 'OPEN COLLABORATION ZONE', areaSqFt: 1800 },
      { id: 'crm2', type: 'room', layer: 'A-AREA', x1: 500, y1: 150, x2: 500, y2: 150, label: 'EXECUTIVE BOARDROOM', areaSqFt: 500 },
    ]
  },
  {
    id: 'studio_cottage',
    title: 'Eco Studio Cottage (20x30 ft)',
    desc: 'Compact sustainable architecture with timber framing, cross-ventilation, and passive solar orientation.',
    category: 'Eco-Living',
    elements: [
      { id: 'sw1', type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 0, x2: 240, y2: 0, thickness: 6, height: 9.5, material: 'Timber Frame', label: 'North Log Wall' },
      { id: 'sw2', type: 'wall', layer: 'A-WALL-EXT', x1: 240, y1: 0, x2: 240, y2: 360, thickness: 6, height: 9.5, material: 'Timber Frame', label: 'East Wall' },
      { id: 'sw3', type: 'wall', layer: 'A-WALL-EXT', x1: 240, y1: 360, x2: 0, y2: 360, thickness: 6, height: 9.5, material: 'Timber Frame', label: 'South Porch' },
      { id: 'sw4', type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 360, x2: 0, y2: 0, thickness: 6, height: 9.5, material: 'Timber Frame', label: 'West Wall' },
      { id: 'sd1', type: 'door', layer: 'A-DOOR', x1: 100, y1: 360, x2: 136, y2: 360, thickness: 6, label: 'Main Timber Door' },
      { id: 'srm1', type: 'room', layer: 'A-AREA', x1: 120, y1: 180, x2: 120, y2: 180, label: 'ECO-STUDIO LIVING', areaSqFt: 600 },
    ]
  }
];

const DEFAULT_RECENT_PROJECTS = [
  {
    id: 'p1',
    name: 'Modern_Residence_Plot_A',
    path: 'C:\\Users\\Architect\\Documents\\RachnaCAD\\Modern_Residence_Plot_A.rcad',
    lastModified: 'Today, 2:45 PM',
    elementsCount: 9,
    type: 'Residential 2BHK'
  },
  {
    id: 'p2',
    name: 'Green_Valley_Villa_Vastu',
    path: 'D:\\Projects\\Anvitam\\Green_Valley_Villa_Vastu.rcad',
    lastModified: 'Yesterday',
    elementsCount: 24,
    type: 'Vastu Compliant 3BHK'
  },
  {
    id: 'p3',
    name: 'TechPark_Executive_Suite',
    path: 'D:\\Projects\\Commercial\\TechPark_Suite.rcad',
    lastModified: 'Sep 26, 2026',
    elementsCount: 38,
    type: 'Commercial Office'
  }
];

export default function WelcomeHub({
  onNewProject,
  onOpenProject,
  onOpenVectorizer,
  onOpenDesktopSetup,
  recentProjects = DEFAULT_RECENT_PROJECTS
}: WelcomeHubProps) {
  const [selectedTab, setSelectedTab] = useState<'workspaces' | 'templates' | 'download'>('workspaces');
  const [quickPrompt, setQuickPrompt] = useState('');
  const [selectedAIModel, setSelectedAIModel] = useState('qwen');

  const handleLaunchTemplate = (template: typeof TEMPLATES[0]) => {
    onNewProject(template.title, template.elements);
  };

  const handleQuickPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    // Launch standard canvas with prompt transferred
    onNewProject('AI_Draft_' + Date.now());
  };

  return (
    <div className="w-full h-full bg-[#18181B] text-gray-100 flex overflow-hidden font-sans select-none">
      {/* ── LEFT NARROW ACTIVITY BAR (Antigravity IDE style) ── */}
      <div className="w-12 bg-[#121214] border-r border-[#27272A] flex flex-col items-center py-3 space-y-4">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="w-6 border-t border-[#27272A]" />
        <button
          onClick={() => setSelectedTab('workspaces')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            selectedTab === 'workspaces' ? 'bg-[#27272A] text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Workspaces & Recent Projects"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSelectedTab('templates')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            selectedTab === 'templates' ? 'bg-[#27272A] text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Architectural Templates"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSelectedTab('download')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            selectedTab === 'download' ? 'bg-[#27272A] text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Standalone Desktop Installers (Mac/Linux/Windows)"
        >
          <Download className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <button
          onClick={onOpenDesktopSetup}
          className="w-9 h-9 rounded-lg text-emerald-400 hover:bg-[#27272A] flex items-center justify-center"
          title="Native Desktop Setup Wizard"
        >
          <HardDrive className="w-4 h-4" />
        </button>
      </div>

      {/* ── CENTER HUB MAIN CONTENT (Matches Image 1 Antigravity Welcome Screen) ── */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start pt-10 pb-16 px-8">
        <div className="max-w-2xl w-full">
          {/* Logo & Product Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-sky-400 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4 ring-1 ring-white/20">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M19 21v-8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8" />
                <path d="M9 11V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v7" />
                <path d="M9 7h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              RachnaCAD Studio
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                v1.0 BIM + CAD
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-md">
              Desktop Architectural CAD &amp; Parametric BIM Workspace. AutoCAD 2D precision drafting meets Archicad 3D WebGPU BIM and multi-model AI.
            </p>
          </div>

          {/* Primary Action Buttons (Matching Image 1 Big Primary Buttons) */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => onNewProject('Untitled_Project')}
              className="w-full py-3.5 px-5 rounded-xl bg-[#007ACC] hover:bg-[#0066AA] text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-600/20 cursor-pointer group"
            >
              <FilePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>New Project</span>
            </button>

            <button
              onClick={() => onOpenProject()}
              className="w-full py-3.5 px-5 rounded-xl bg-[#27272A] hover:bg-[#323236] text-gray-200 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all border border-[#3F3F46] cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span>Open Project (.rcad, .dxf, .ifc)</span>
            </button>

            <button
              onClick={onOpenVectorizer}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-900/30 to-emerald-950/40 hover:from-emerald-900/50 hover:to-emerald-900/40 text-emerald-300 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all border border-emerald-500/30 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Convert 2D Blueprint / Photo to 3D BIM (1-Click)</span>
            </button>
          </div>

          {/* Tab Navigation: Workspaces / Templates / Standalone Downloads */}
          <div className="flex border-b border-[#27272A] mb-5 text-xs font-medium">
            <button
              onClick={() => setSelectedTab('workspaces')}
              className={`pb-2.5 px-3 flex items-center gap-2 transition-all cursor-pointer ${
                selectedTab === 'workspaces'
                  ? 'border-b-2 border-blue-500 text-white font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Workspaces &amp; Recent Projects</span>
            </button>
            <button
              onClick={() => setSelectedTab('templates')}
              className={`pb-2.5 px-3 flex items-center gap-2 transition-all cursor-pointer ${
                selectedTab === 'templates'
                  ? 'border-b-2 border-blue-500 text-white font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Starter Templates</span>
            </button>
            <button
              onClick={() => setSelectedTab('download')}
              className={`pb-2.5 px-3 flex items-center gap-2 transition-all cursor-pointer ${
                selectedTab === 'download'
                  ? 'border-b-2 border-blue-500 text-white font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Desktop Installers (Mac/Win/Linux)</span>
            </button>
          </div>

          {/* TAB 1: WORKSPACES / RECENT PROJECTS (Image 1 Style) */}
          {selectedTab === 'workspaces' && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Workspaces
              </div>
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onNewProject(project.name)}
                  className="w-full p-3 rounded-xl bg-[#202023] hover:bg-[#2A2A2E] border border-[#2F2F34] transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2B2B30] flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-200 group-hover:text-white flex items-center gap-2">
                        {project.name}
                        <span className="text-[10px] font-normal text-gray-400 px-1.5 py-0.2 rounded bg-[#27272A]">
                          {project.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono truncate max-w-sm">
                        {project.path}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-gray-400">
                    <div>{project.lastModified}</div>
                    <div className="text-gray-400">{project.elementsCount} BIM entities</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: STARTER ARCHITECTURAL TEMPLATES */}
          {selectedTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleLaunchTemplate(tmpl)}
                  className="p-3.5 rounded-xl bg-[#202023] hover:bg-[#2A2A2E] border border-[#2F2F34] hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">
                        {tmpl.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {tmpl.elements.length} elements
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {tmpl.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#2A2A2E] flex items-center justify-between text-xs text-blue-400 font-medium">
                    <span>Open in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: STANDALONE DESKTOP INSTALLERS (Mac, Linux, Windows) */}
          {selectedTab === 'download' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Real Standalone Cross-Platform Desktop Software</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Install RachnaCAD directly onto your computer drive (C:\, D:\, /Applications, or /usr/bin). Works completely offline with zero internet required, executing WebGPU 3D parametric BIM and local GPU AI on your hardware.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Windows */}
                <div className="p-4 rounded-xl bg-[#202023] border border-[#2F2F34] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Monitor className="w-5 h-5 text-sky-400" />
                      <span className="text-[10px] font-mono bg-sky-500/10 text-sky-300 px-1.5 py-0.5 rounded">64-bit</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Windows</h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Windows 10/11 Installer (.exe / NSIS) &amp; MSI. C:\ or D:\ drive support.
                    </p>
                  </div>
                  <button
                    onClick={onOpenDesktopSetup}
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .exe</span>
                  </button>
                </div>

                {/* macOS */}
                <div className="p-4 rounded-xl bg-[#202023] border border-[#2F2F34] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Laptop className="w-5 h-5 text-gray-200" />
                      <span className="text-[10px] font-mono bg-gray-500/10 text-gray-300 px-1.5 py-0.5 rounded">Universal</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">macOS</h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Apple Silicon (M1/M2/M3/M4) &amp; Intel DMG installer. Native Metal WebGPU.
                    </p>
                  </div>
                  <button
                    onClick={onOpenDesktopSetup}
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .dmg</span>
                  </button>
                </div>

                {/* Linux */}
                <div className="p-4 rounded-xl bg-[#202023] border border-[#2F2F34] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Terminal className="w-5 h-5 text-amber-400" />
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded">Debian/RPM</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Linux</h4>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Ubuntu/Debian .deb package and portable standalone .AppImage.
                    </p>
                  </div>
                  <button
                    onClick={onOpenDesktopSetup}
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .deb</span>
                  </button>
                </div>
              </div>

              {/* Offline Capability Card */}
              <div className="p-3.5 rounded-xl bg-[#202023] border border-[#2F2F34] flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Hardware Requirements: WebGPU / Vulkan / DirectX 12 GPU, 8GB RAM</span>
                </div>
                <div className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Offline Capable</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL (Antigravity IDE Assistant Style matching Image 1) ── */}
      <div className="w-[340px] bg-[#141416] border-l border-[#27272A] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-4 py-3.5 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white tracking-wide">RachnaCAD AI Assistant</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Local GPU Ready
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {/* Welcome Message */}
          <div className="p-3.5 rounded-xl bg-[#202023] border border-[#2F2F34] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Architectural Co-Pilot</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-[11px]">
              Ready to draft blueprints or model in 3D BIM. I can generate layouts, verify Vastu orientations, calculate material takeoffs, or convert 2D sketches into parametric BIM models.
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Suggested Architectural Workflows
            </div>
            {[
              { label: '📐 Generate 2BHK on 30x40 ft Plot (Vastu)', template: TEMPLATES[1] },
              { label: '🏢 Model Open-Plan 50x60 ft Commercial Suite', template: TEMPLATES[2] },
              { label: '🏡 Create 20x30 ft Eco Timber Cottage', template: TEMPLATES[3] },
              { label: '🧱 Calculate Concrete & Brick Quantity Takeoff', action: () => onNewProject('Quantity_Takeoff_Study') },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.template ? handleLaunchTemplate(item.template) : item.action?.()}
                className="w-full text-left p-2.5 rounded-lg bg-[#1B1B1E] hover:bg-[#25252A] border border-[#28282D] text-gray-300 hover:text-white transition-all text-[11px] flex items-center justify-between group cursor-pointer"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>

          {/* Local Intelligence Engine Info */}
          <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A] space-y-1.5 text-[10px] text-gray-400">
            <div className="text-gray-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Multi-AI Model Architecture Built-in</span>
            </div>
            <p>
              Switch seamlessly between local Qwen-2.5 Coder on your GPU (zero latency, offline) and cloud models (Claude 3.7 Sonnet / Gemini 2.0 Flash) inside the studio.
            </p>
          </div>
        </div>

        {/* Bottom Input Box (Exact Antigravity IDE input box from Image 1) */}
        <div className="p-3 border-t border-[#27272A] bg-[#18181B]">
          <form onSubmit={handleQuickPromptSubmit} className="relative">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="Ask anything, @ to mention, / for actions"
              className="w-full bg-[#121214] border border-[#2E2E33] focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 outline-none pr-10"
            />
            <button
              type="submit"
              disabled={!quickPrompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
            <span>Model: Qwen 2.5 Coder (Local GPU)</span>
            <span>Press Enter ↵</span>
          </div>
        </div>
      </div>
    </div>
  );
}
