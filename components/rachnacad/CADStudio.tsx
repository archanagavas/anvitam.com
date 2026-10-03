import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Square, Move, Minus, Ruler,
  Download, ZoomIn, ZoomOut, Maximize2, Trash2,
  Sparkles, Check,
  Building2, Box, Sliders,
  Eye, Undo2, Redo2, RefreshCw,
  Columns, EyeOff, Wand2,
  FolderOpen, FilePlus, Camera,
  Keyboard, ShieldCheck, X,
  LayoutGrid, PenLine, DoorOpen, Save,
  Home, HardDrive, Laptop
} from 'lucide-react';
import AICopilot from './AICopilot';
import FloorplanVectorizer from './FloorplanVectorizer';
import WelcomeHub from './WelcomeHub';
import SetupAuthModal from './SetupAuthModal';

export type CADTool = 'select' | 'line' | 'wall' | 'rect' | 'circle' | 'door' | 'window' | 'dim' | 'room' | 'offset' | 'trim';

export interface CADElement {
  id: string;
  type: 'line' | 'wall' | 'rect' | 'circle' | 'door' | 'window' | 'dim' | 'room';
  layer: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  radius?: number;
  thickness?: number; // inches
  height?: number; // feet
  material?: string;
  label?: string;
  areaSqFt?: number;
  color?: string;
}

interface CADStudioProps {
  onExportDXF?: (dxfContent: string) => void;
  onElementsChange?: (elements: CADElement[]) => void;
  fullScreen?: boolean;
}

const INITIAL_ELEMENTS: CADElement[] = [
  { id: 'w1', type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 0, x2: 360, y2: 0, thickness: 9, height: 10, material: 'Brick Masonry', label: 'North Wall' },
  { id: 'w2', type: 'wall', layer: 'A-WALL-EXT', x1: 360, y1: 0, x2: 360, y2: 480, thickness: 9, height: 10, material: 'Brick Masonry', label: 'East Wall' },
  { id: 'w3', type: 'wall', layer: 'A-WALL-EXT', x1: 360, y1: 480, x2: 0, y2: 480, thickness: 9, height: 10, material: 'Brick Masonry', label: 'South Wall' },
  { id: 'w4', type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 480, x2: 0, y2: 0, thickness: 9, height: 10, material: 'Brick Masonry', label: 'West Wall' },
  { id: 'w5', type: 'wall', layer: 'A-WALL-INT', x1: 0, y1: 240, x2: 240, y2: 240, thickness: 4.5, height: 10, material: 'Drywall Partition', label: 'Living Partition' },
  { id: 'd1', type: 'door', layer: 'A-DOOR', x1: 180, y1: 480, x2: 216, y2: 480, thickness: 9, label: "Main Entrance Door (3'-0\")" },
  { id: 'wn1', type: 'window', layer: 'A-GLAZ', x1: 60, y1: 0, x2: 120, y2: 0, thickness: 9, label: "North Window (5'-0\")" },
  { id: 'rm1', type: 'room', layer: 'A-AREA', x1: 120, y1: 360, x2: 120, y2: 360, label: 'LIVING ROOM', areaSqFt: 540 },
  { id: 'rm2', type: 'room', layer: 'A-AREA', x1: 120, y1: 120, x2: 120, y2: 120, label: 'MASTER BEDROOM', areaSqFt: 360 },
];

export default function CADStudio({ onExportDXF, onElementsChange, fullScreen = true }: CADStudioProps) {
  // ── Layout & View Modes ──────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'split' | '2d-only' | '3d-only'>('split');
  const [showRoof3D, setShowRoof3D] = useState(false);
  const [showCopilot, setShowCopilot] = useState(true);
  const [showVectorizer, setShowVectorizer] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'inspector' | 'copilot'>('copilot');
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'draw' | 'bim' | 'ai' | 'view' | 'export' | 'help' | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showWelcomeHub, setShowWelcomeHub] = useState(true);
  const [showDesktopSetup, setShowDesktopSetup] = useState(false);

  // ── 3D Camera Preset Switcher ──────────────────────────────────────────
  const setCameraPreset = (preset: 'iso' | 'top' | 'front') => {
    const cam = threeCameraRef.current;
    const ctrl = threeControlsRef.current;
    if (!cam || !ctrl) return;
    if (preset === 'iso') {
      cam.position.set(40, 42, 50);
      ctrl.target.set(2, 5, 3);
    } else if (preset === 'top') {
      cam.position.set(2, 70, 3);
      ctrl.target.set(2, 0, 3);
    } else if (preset === 'front') {
      cam.position.set(2, 12, 60);
      ctrl.target.set(2, 5, 3);
    }
    ctrl.update();
  };

  // ── Project State ────────────────────────────────────────────────────────
  const [projectName, setProjectName] = useState('Modern_Residence_Plot_A');
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);

  // ── 2D Canvas & Transform State ──────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 260, y: 200 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // ── 3D Viewport Refs ─────────────────────────────────────────────────────
  const threeMountRef = useRef<HTMLDivElement>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const threeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const threeControlsRef = useRef<OrbitControls | null>(null);
  const threeBIMGroupRef = useRef<THREE.Group | null>(null);

  // ── Tool & Drafting State ────────────────────────────────────────────────
  const [activeTool, setActiveTool] = useState<CADTool>('wall');
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [orthoMode, setOrthoMode] = useState<boolean>(false);
  const [wallThickness, setWallThickness] = useState<number>(9); // 9" default
  const [wallHeight, setWallHeight] = useState<number>(10); // 10 ft default
  const [wallMaterial, setWallMaterial] = useState<string>('Modern Plaster');

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Geometric Entities + Undo/Redo History ───────────────────────────────
  const [elements, setElements] = useState<CADElement[]>(INITIAL_ELEMENTS);
  const [history, setHistory] = useState<CADElement[][]>([INITIAL_ELEMENTS]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // ── Inspector edit state for selected element ────────────────────────────
  const [inspectorLabel, setInspectorLabel] = useState('');
  const [inspectorThickness, setInspectorThickness] = useState('');
  const [inspectorHeight, setInspectorHeight] = useState('');
  const [inspectorMaterial, setInspectorMaterial] = useState('');

  // ── AutoCAD Command Line Prompt ──────────────────────────────────────────
  const [commandInput, setCommandInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'RachnaCAD 2D/3D BIM Architecture Workstation v1.0.0 initialized.',
    'Ready. Select tool or type command (W, DR, WN, L, REC, RM, CLEAR, DXF, IFC).',
  ]);

  // ── Layer Visibility ─────────────────────────────────────────────────────
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());

  // ── Push to history helper ───────────────────────────────────────────────
  const pushHistory = useCallback((newElements: CADElement[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newElements];
    });
    setHistoryIndex(prev => prev + 1);
    setElements(newElements);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    setElements(history[newIdx]);
    setSelectedElementId(null);
    setCommandHistory(prev => [...prev, 'Undo.']);
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    setElements(history[newIdx]);
    setCommandHistory(prev => [...prev, 'Redo.']);
  }, [historyIndex, history]);

  // Sync elements upward
  useEffect(() => {
    if (onElementsChange) onElementsChange(elements);
  }, [elements, onElementsChange]);

  // Update inspector fields when selection changes
  useEffect(() => {
    const el = elements.find(e => e.id === selectedElementId);
    if (el) {
      setInspectorLabel(el.label || '');
      setInspectorThickness(String(el.thickness ?? ''));
      setInspectorHeight(String(el.height ?? ''));
      setInspectorMaterial(el.material || '');
      setActiveRightTab('inspector');
    }
  }, [selectedElementId, elements]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleGlobalClick = () => setActiveMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // ── Global Keyboard Shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const key = e.key.toUpperCase();
      if (e.ctrlKey || e.metaKey) {
        if (key === 'Z') { e.preventDefault(); undo(); return; }
        if (key === 'Y') { e.preventDefault(); redo(); return; }
        if (key === 'S') { e.preventDefault(); saveProject(); return; }
        if (key === 'N') { e.preventDefault(); if (window.confirm('New project? Unsaved changes lost.')) { pushHistory([]); setProjectName('New_Project'); } return; }
        if (key === 'O') { e.preventDefault(); fileInputRef.current?.click(); return; }
      }
      if (key === 'ESCAPE') { setDrawingStart(null); setActiveTool('select'); return; }
      if (key === 'DELETE' || key === 'BACKSPACE') {
        setSelectedElementId(prev => { if (prev) { pushHistory(elements.filter(el => el.id !== prev)); setCommandHistory(h => [...h, 'Element deleted.']); return null; } return prev; });
        return;
      }
      if (!e.ctrlKey && !e.metaKey) {
        if (key === 'W') { setActiveTool('wall'); return; }
        if (key === 'L') { setActiveTool('line'); return; }
        if (key === 'V') { setActiveTool('select'); return; }
        if (key === 'F8') { e.preventDefault(); setOrthoMode(o => !o); return; }
        if (key === 'F3') { e.preventDefault(); setGridSnap(s => !s); return; }
        if (e.key === '+' || e.key === '=') { setZoom(z => Math.min(4, z * 1.15)); return; }
        if (e.key === '-') { setZoom(z => Math.max(0.15, z * 0.87)); return; }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedElementId, elements, pushHistory]);

  // ── Coordinate Transforms ────────────────────────────────────────────────
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: worldX * zoom + pan.x,
      y: worldY * zoom + pan.y,
    };
  }, [pan, zoom]);

  const applySnapping = useCallback((coord: { x: number; y: number }, startPt?: { x: number; y: number } | null) => {
    let snappedX = coord.x;
    let snappedY = coord.y;
    if (gridSnap) {
      const snapSize = 12;
      snappedX = Math.round(coord.x / snapSize) * snapSize;
      snappedY = Math.round(coord.y / snapSize) * snapSize;
    }
    const start = startPt !== undefined ? startPt : drawingStart;
    if (orthoMode && start) {
      const dx = Math.abs(coord.x - start.x);
      const dy = Math.abs(coord.y - start.y);
      if (dx > dy) snappedY = start.y;
      else snappedX = start.x;
    }
    return { x: snappedX, y: snappedY };
  }, [gridSnap, orthoMode, drawingStart]);

  // ── Hit-test elements via point-to-segment distance ──────────────────────
  const hitTestElements = useCallback((worldX: number, worldY: number): string | null => {
    const HR = 10 / zoom;
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (hiddenLayers.has(el.layer)) continue;
      if (el.type === 'room') {
        if (Math.abs(worldX - el.x1) < 52 / zoom && Math.abs(worldY - el.y1) < 26 / zoom) return el.id;
      } else {
        const dx = el.x2 - el.x1, dy = el.y2 - el.y1;
        const lenSq = dx * dx + dy * dy;
        let d: number;
        if (lenSq === 0) {
          d = Math.hypot(worldX - el.x1, worldY - el.y1);
        } else {
          const t = Math.max(0, Math.min(1, ((worldX - el.x1) * dx + (worldY - el.y1) * dy) / lenSq));
          d = Math.hypot(worldX - el.x1 - t * dx, worldY - el.y1 - t * dy);
        }
        if (d < HR) return el.id;
      }
    }
    return null;
  }, [elements, zoom, hiddenLayers]);

  // Layer color map
  const LAYER_COLORS: Record<string, string> = {
    'A-WALL-EXT': '#0F172A', 'A-WALL-INT': '#475569', 'A-DOOR': '#B45309',
    'A-GLAZ': '#0284C7', 'A-AREA': '#64748B', 'A-DIMS': '#6D28D9', 'A-MISC': '#374151',
  };

  // ── 2D Vector Rendering Canvas ───────────────────────────────────────────
  const render2DCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clean White Drawing Board
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 2. Architectural Coordinate Grid
    ctx.save();
    ctx.lineWidth = 1;

    // Minor Grid Lines (1 foot = 12 inches)
    const gridSize = 12 * zoom;
    if (gridSize > 5) {
      ctx.strokeStyle = '#F1F5F9';
      const startX = pan.x % gridSize;
      for (let x = startX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      const startY = pan.y % gridSize;
      for (let y = startY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Major Grid Lines (10 feet = 120 inches)
    const majorGridSize = 120 * zoom;
    if (majorGridSize > 15) {
      ctx.strokeStyle = '#E2E8F0';
      const startMajorX = pan.x % majorGridSize;
      for (let x = startMajorX; x < width; x += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      const startMajorY = pan.y % majorGridSize;
      for (let y = startMajorY; y < height; y += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // World Origin Crosshair (0,0)
    const origin = worldToScreen(0, 0);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(origin.x - 14, origin.y);
    ctx.lineTo(origin.x + 14, origin.y);
    ctx.moveTo(origin.x, origin.y - 14);
    ctx.lineTo(origin.x, origin.y + 14);
    ctx.stroke();
    ctx.restore();

    // 3. Render CAD Elements (skip hidden layers)
    elements.forEach((el) => {
      if (hiddenLayers.has(el.layer)) return;
      const p1 = worldToScreen(el.x1, el.y1);
      const p2 = worldToScreen(el.x2, el.y2);
      const isSelected = el.id === selectedElementId;

      ctx.save();

      if (el.type === 'wall') {
        const wallThick = (el.thickness || 9) * zoom;
        ctx.strokeStyle = isSelected ? '#2563EB' : '#0F172A';
        ctx.lineWidth = Math.max(3, wallThick);
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        // Centerline
        ctx.strokeStyle = isSelected ? '#93C5FD' : '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        // Dim tag
        if (zoom > 0.4) {
          const lengthInches = Math.hypot(el.x2 - el.x1, el.y2 - el.y1);
          const feet = Math.floor(lengthInches / 12);
          const inches = Math.round(lengthInches % 12);
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.fillStyle = isSelected ? '#2563EB' : '#0F172A';
          ctx.font = '10px monospace';
          ctx.fillText(`${feet}'-${inches}"`, midX + 6, midY - 6);
        }
        // Selection handle dots
        if (isSelected) {
          [[p1.x, p1.y], [p2.x, p2.y]].forEach(([px, py]) => {
            ctx.fillStyle = '#2563EB';
            ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
          });
        }
      } else if (el.type === 'door') {
        // Parametric Door Swing Arc
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Door Swing Arc
        const doorWidth = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, doorWidth, 0, Math.PI / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (el.type === 'window') {
        // Parametric Glazed Window
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Double Glazing inner line
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y - 2);
        ctx.lineTo(p2.x, p2.y - 2);
        ctx.stroke();
      } else if (el.type === 'room') {
        // Room Stamp
        ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
        ctx.fillRect(p1.x - 50, p1.y - 24, 100, 48);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(p1.x - 50, p1.y - 24, 100, 48);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(el.label || 'ROOM', p1.x, p1.y - 4);

        ctx.fillStyle = '#64748B';
        ctx.font = '9px monospace';
        ctx.fillText(`${el.areaSqFt || 120} SQ FT`, p1.x, p1.y + 12);
        ctx.textAlign = 'left';
      } else {
        // Generic Lines / Polylines
        ctx.strokeStyle = isSelected ? '#2563EB' : '#0F172A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      ctx.restore();
    });

    // 4. Active Preview while drawing
    if (drawingStart) {
      const p1 = worldToScreen(drawingStart.x, drawingStart.y);
      const p2 = worldToScreen(currentMousePos.x, currentMousePos.y);
      ctx.save();
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = activeTool === 'wall' ? Math.max(3, wallThickness * zoom) : 2;
      ctx.setLineDash([5, 4]);
      if (activeTool === 'rect') {
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
      ctx.setLineDash([]);
      // Start point
      ctx.fillStyle = '#2563EB';
      ctx.beginPath(); ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2); ctx.fill();
      // Live measurement
      const distInches = Math.hypot(currentMousePos.x - drawingStart.x, currentMousePos.y - drawingStart.y);
      const ft = Math.floor(distInches / 12);
      const inch = Math.round(distInches % 12);
      ctx.fillStyle = '#1E40AF';
      ctx.fillRect((p1.x + p2.x) / 2 + 4, (p1.y + p2.y) / 2 - 20, 56, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${ft}'-${inch}"`, (p1.x + p2.x) / 2 + 8, (p1.y + p2.y) / 2 - 8);
      ctx.restore();
    }
    // 5. Cursor crosshair
    const cursor = worldToScreen(currentMousePos.x, currentMousePos.y);
    ctx.save();
    ctx.strokeStyle = 'rgba(37,99,235,0.4)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cursor.x, 0); ctx.lineTo(cursor.x, height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cursor.y); ctx.lineTo(width, cursor.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }, [elements, pan, zoom, drawingStart, currentMousePos, selectedElementId, activeTool, wallThickness, worldToScreen, hiddenLayers]);

  // Keep 2D canvas rendered
  useEffect(() => {
    render2DCanvas();
  }, [render2DCanvas]);

  // ── 3D THREE.JS PARAMETRIC BIM VIEWPORT INITIALIZATION ───────────────────
  useEffect(() => {
    if (!threeMountRef.current) return;

    const width = threeMountRef.current.clientWidth || 600;
    const height = threeMountRef.current.clientHeight || 600;

    // Scene with Crisp Architectural Studio Lighting
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8FAFC);
    threeSceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(45, 45, 55);
    threeCameraRef.current = camera;

    // WebGL / WebGPU Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    threeMountRef.current.innerHTML = '';
    threeMountRef.current.appendChild(renderer.domElement);
    threeRendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going below ground
    controls.target.set(0, 5, 0);
    threeControlsRef.current = controls;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    sunLight.position.set(35, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    const d = 40;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Architectural Ground Plane
    const gridHelper = new THREE.GridHelper(80, 80, 0xCBD5E1, 0xE2E8F0);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // BIM Group Holder
    const bimGroup = new THREE.Group();
    scene.add(bimGroup);
    threeBIMGroupRef.current = bimGroup;

    // Immediately trigger 3D rebuild so viewport is not blank!
    setTimeout(() => {
      rebuild3DBIM();
    }, 40);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!threeMountRef.current) return;
      const w = threeMountRef.current.clientWidth;
      const h = threeMountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (threeMountRef.current) threeMountRef.current.innerHTML = '';
    };
  }, []);

  // ── REBUILD 3D PARAMETRIC BIM MESHES FROM 2D ELEMENTS ────────────────────
  const rebuild3DBIM = useCallback(() => {
    const group = threeBIMGroupRef.current;
    if (!group) return;

    // Clear previous meshes
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as any).geometry) (obj as any).geometry.dispose();
    }

    const scale = 0.08; // 12 inches in 2D = ~1 meter in 3D
    const wallH = wallHeight * 0.8; // 10 ft height
    const thickness = (wallThickness / 12) * 0.8;

    // High quality architectural materials
    let wallColor = 0xF8FAFC;
    let edgeColor = 0x334155;
    if (wallMaterial === 'Brick Masonry') { wallColor = 0xC2410C; edgeColor = 0x7C2D12; }
    if (wallMaterial === 'Reinforced Concrete') { wallColor = 0x64748B; edgeColor = 0x1E293B; }
    if (wallMaterial === 'Timber Frame') { wallColor = 0xD97706; edgeColor = 0x78350F; }

    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.7,
      metalness: 0.08,
    });

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.5,
      metalness: 0.1,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.75,
      ior: 1.5,
    });

    // Extrude walls
    elements.filter((el) => el.type === 'wall').forEach((w) => {
      const dx = (w.x2 - w.x1) * scale;
      const dz = (w.y2 - w.y1) * scale;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);

      const wallGeo = new THREE.BoxGeometry(length, wallH, thickness);
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;

      // Add crisp architectural edge outlines so walls POP like Archicad
      const edges = new THREE.EdgesGeometry(wallGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: edgeColor, linewidth: 1 }));
      wallMesh.add(line);

      wallMesh.position.set(
        ((w.x1 + w.x2) / 2) * scale - 12,
        wallH / 2,
        ((w.y1 + w.y2) / 2) * scale - 16
      );
      wallMesh.rotation.y = -angle;
      group.add(wallMesh);
    });

    // Doors 3D representation
    elements.filter((el) => el.type === 'door').forEach((d) => {
      const dx = (d.x2 - d.x1) * scale;
      const dz = (d.y2 - d.y1) * scale;
      const doorW = Math.hypot(dx, dz);
      const doorAngle = Math.atan2(dz, dx);

      const doorGeo = new THREE.BoxGeometry(doorW * 0.95, wallH * 0.72, 0.2);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.5 });
      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(
        ((d.x1 + d.x2) / 2) * scale - 12,
        (wallH * 0.72) / 2,
        ((d.y1 + d.y2) / 2) * scale - 16
      );
      doorMesh.rotation.y = -doorAngle;
      group.add(doorMesh);
    });

    // Windows 3D Insertion
    elements.filter((el) => el.type === 'window').forEach((wn) => {
      const dx = (wn.x2 - wn.x1) * scale;
      const dz = (wn.y2 - wn.y1) * scale;
      const winW = Math.hypot(dx, dz);
      const winAngle = Math.atan2(dz, dx);

      const winGeo = new THREE.BoxGeometry(winW, wallH * 0.45, 0.35);
      const winMesh = new THREE.Mesh(winGeo, glassMat);
      winMesh.position.set(
        ((wn.x1 + wn.x2) / 2) * scale - 12,
        wallH * 0.55,
        ((wn.y1 + wn.y2) / 2) * scale - 16
      );
      winMesh.rotation.y = -winAngle;
      group.add(winMesh);
    });

    // 3D Ground Floor Slab
    const floorGeo = new THREE.BoxGeometry(38, 0.4, 46);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(2, 0.2, 3);
    floorMesh.receiveShadow = true;
    const floorEdges = new THREE.EdgesGeometry(floorGeo);
    floorMesh.add(new THREE.LineSegments(floorEdges, new THREE.LineBasicMaterial({ color: 0x94A3B8 })));
    group.add(floorMesh);

    // Optional Architectural Roof Slab
    if (showRoof3D) {
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.3, roughness: 0.6 });
      const roofGeo = new THREE.BoxGeometry(40, 0.4, 48);
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.set(2, wallH + 0.4, 3);
    }
  }, [elements, wallHeight, wallThickness, wallMaterial, showRoof3D]);

  // Sync 3D whenever elements or settings change
  useEffect(() => {
    rebuild3DBIM();
  }, [rebuild3DBIM]);

  // ── MOUSE & DRAWING HANDLERS ─────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (e.button === 1 || (e.altKey && e.button === 0)) {
      setIsPanning(true);
      setPanStart({ x: screenX - pan.x, y: screenY - pan.y });
      return;
    }

    const worldCoord = screenToWorld(screenX, screenY);
    const snapped = applySnapping(worldCoord, drawingStart);

    if (activeTool === 'select') {
      const hitId = hitTestElements(worldCoord.x, worldCoord.y);
      setSelectedElementId(hitId);
      if (!hitId) setActiveRightTab('copilot');
      return;
    }

    if (activeTool === 'room') {
      const newRoom: CADElement = {
        id: `rm_${Date.now()}`,
        type: 'room', layer: 'A-AREA',
        x1: snapped.x, y1: snapped.y, x2: snapped.x, y2: snapped.y,
        label: 'ROOM', areaSqFt: 0,
      };
      pushHistory([...elements, newRoom]);
      setSelectedElementId(newRoom.id);
      setCommandHistory(prev => [...prev, 'Room stamp placed. Edit label in Inspector.']);
      return;
    }

    if (!drawingStart) {
      setDrawingStart(snapped);
      setCommandHistory(prev => [...prev, `${activeTool.toUpperCase()} started at (${(snapped.x/12).toFixed(1)}\', ${(snapped.y/12).toFixed(1)}\')`]);
    } else {
      let newElements = [...elements];
      if (activeTool === 'rect') {
        const x1 = drawingStart.x, y1 = drawingStart.y, x2 = snapped.x, y2 = snapped.y;
        const ts = Date.now();
        newElements = [...newElements,
          { id: `rw_n${ts}`, type: 'wall', layer: 'A-WALL-EXT', x1, y1, x2, y2: y1, thickness: wallThickness, height: wallHeight, material: wallMaterial, label: 'N' },
          { id: `rw_e${ts}`, type: 'wall', layer: 'A-WALL-EXT', x1: x2, y1, x2, y2, thickness: wallThickness, height: wallHeight, material: wallMaterial, label: 'E' },
          { id: `rw_s${ts}`, type: 'wall', layer: 'A-WALL-EXT', x1: x2, y1: y2, x2: x1, y2, thickness: wallThickness, height: wallHeight, material: wallMaterial, label: 'S' },
          { id: `rw_w${ts}`, type: 'wall', layer: 'A-WALL-EXT', x1, y1: y2, x2: x1, y2: y1, thickness: wallThickness, height: wallHeight, material: wallMaterial, label: 'W' },
        ];
        const wFt = Math.abs(x2-x1)/12, hFt = Math.abs(y2-y1)/12;
        setCommandHistory(prev => [...prev, `Rectangle: ${wFt.toFixed(1)}\' x ${hFt.toFixed(1)}\' (${(wFt*hFt).toFixed(0)} sq ft)`]);
      } else {
        const typeMap: Record<string, CADElement['type']> = { door:'door', window:'window', line:'line', dim:'dim' };
        const layerMap: Record<string, string> = { door:'A-DOOR', window:'A-GLAZ', line:'A-MISC', dim:'A-DIMS' };
        const newElem: CADElement = {
          id: `el_${Date.now()}`,
          type: typeMap[activeTool] ?? 'wall',
          layer: layerMap[activeTool] ?? 'A-WALL-EXT',
          x1: drawingStart.x, y1: drawingStart.y, x2: snapped.x, y2: snapped.y,
          thickness: wallThickness, height: wallHeight, material: wallMaterial,
          label: `${activeTool.toUpperCase()} ${elements.length + 1}`,
        };
        newElements = [...newElements, newElem];
        setSelectedElementId(newElem.id);
        const len = Math.hypot(newElem.x2 - newElem.x1, newElem.y2 - newElem.y1) / 12;
        setCommandHistory(prev => [...prev, `Created ${newElem.type.toUpperCase()}: ${len.toFixed(1)}\' long`]);
      }
      pushHistory(newElements);
      setDrawingStart(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    if (isPanning) {
      setPan({ x: screenX - panStart.x, y: screenY - panStart.y });
      return;
    }
    const worldCoord = screenToWorld(screenX, screenY);
    const snapped = applySnapping(worldCoord, drawingStart);
    setCurrentMousePos(snapped);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.91;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setZoom(prev => {
        const newZoom = Math.min(Math.max(0.15, prev * zoomFactor), 5.0);
        const ratio = newZoom / prev;
        setPan(p => ({ x: mx - (mx - p.x) * ratio, y: my - (my - p.y) * ratio }));
        return newZoom;
      });
    }
  };

  // ── INSPECTOR: Apply changes to selected element ─────────────────────────
  const applyInspectorChanges = () => {
    if (!selectedElementId) return;
    const newElems = elements.map(el => {
      if (el.id !== selectedElementId) return el;
      return { ...el,
        label: inspectorLabel || el.label,
        thickness: inspectorThickness ? Number(inspectorThickness) : el.thickness,
        height: inspectorHeight ? Number(inspectorHeight) : el.height,
        material: inspectorMaterial || el.material,
      };
    });
    pushHistory(newElems);
    setCommandHistory(prev => [...prev, 'Element properties updated.']);
  };

  // ── Toggle layer visibility ───────────────────────────────────────────────
  const toggleLayer = (layer: string) => {
    setHiddenLayers(prev => { const next = new Set(prev); if (next.has(layer)) next.delete(layer); else next.add(layer); return next; });
  };

  // ── AUTOCAD CLI COMMAND DISPATCHER ───────────────────────────────────────
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toUpperCase();
    if (!cmd) return;
    if (cmd === 'L' || cmd === 'LINE') setActiveTool('line');
    else if (cmd === 'W' || cmd === 'WALL') setActiveTool('wall');
    else if (cmd === 'DR' || cmd === 'DOOR') setActiveTool('door');
    else if (cmd === 'WN' || cmd === 'WINDOW') setActiveTool('window');
    else if (cmd === 'REC' || cmd === 'RECTANG') setActiveTool('rect');
    else if (cmd === 'RM' || cmd === 'ROOM') setActiveTool('room');
    else if (cmd === 'DIM') setActiveTool('dim');
    else if (cmd === 'V' || cmd === 'SELECT') setActiveTool('select');
    else if (cmd === 'ORTHO' || cmd === 'F8') setOrthoMode(o => !o);
    else if (cmd === 'SNAP' || cmd === 'F3') setGridSnap(s => !s);
    else if (cmd === 'U' || cmd === 'UNDO') undo();
    else if (cmd === 'REDO') redo();
    else if (cmd === 'CLEAR') { pushHistory([]); setCommandHistory(prev => [...prev, 'Cleared.']); }
    else if (cmd === 'DXF') exportDXF();
    else if (cmd === 'IFC') exportIFC();
    else if (cmd === 'PNG') exportPNG();
    else if (cmd === 'ZE' || cmd === 'ZOOM EXTENTS') { setPan({ x: 260, y: 200 }); setZoom(0.9); }
    else setCommandHistory(prev => [...prev, `Unknown: '${cmd}'. Commands: W, DR, WN, L, REC, RM, V, ORTHO, SNAP, UNDO, REDO, CLEAR, DXF, IFC, PNG, ZE`]);
    setCommandInput('');
  };

  // ── EXPORTERS & FILE MANAGEMENT ──────────────────────────────────────────
  const exportDXF = () => {
    let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n`;
    const layers = [...new Set(elements.map(e => e.layer))];
    layers.forEach(l => { dxf += `0\nLAYER\n2\n${l}\n70\n0\n62\n7\n6\nCONTINUOUS\n`; });
    dxf += `0\nENDTAB\n0\nENDSEC\n`;
    dxf += `0\nSECTION\n2\nENTITIES\n`;

    elements.forEach((el) => {
      dxf += `0\nLINE\n8\n${el.layer}\n`;
      dxf += `10\n${el.x1}\n20\n${el.y1}\n30\n0.0\n`;
      dxf += `11\n${el.x2}\n21\n${el.y2}\n31\n0.0\n`;
    });

    dxf += `0\nENDSEC\n0\nEOF\n`;
    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_${Date.now()}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
    if (onExportDXF) onExportDXF(dxf);
    setCommandHistory(prev => [...prev, `Exported DXF: ${elements.length} entities.`]);
  };

  const exportIFC = () => {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    let ifc = `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('RachnaCAD Architectural BIM Model'),'2;1');\nFILE_NAME('RachnaCAD_${timestamp}.ifc','${new Date().toISOString()}',('Architect'),('Anvitam Studios'),'RachnaCAD v1.0 BIM Kernel','RachnaCAD','');\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n#1=IFCPROJECT('14kL6V$R57b8Jm$x5X8B2Y',#2,'RachnaCAD Project',$,$,$,$,(#3),#4);\n#2=IFCOWNERHISTORY(#5,#6,$,.ADDED.,$,$,$,${Math.floor(Date.now() / 1000)});\n#3=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#7,$);\n#4=IFCUNITASSIGNMENT((#8,#9));\n#8=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);\n#9=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);\n#10=IFCSITE('2K8XjL$R57b8Jm$x5X8B2Z',#2,'Building Site',$,$,#11,$,$,.ELEMENT.,$,$,$,$,$);\n#12=IFCBUILDING('3M9YkM$R57b8Jm$x5X8B2A',#2,'Architectural Villa',$,$,#13,$,$,.ELEMENT.,$,$,$);\n#14=IFCBUILDINGSTOREY('4N0ZlN$R57b8Jm$x5X8B2B',#2,'Ground Floor',$,$,#15,$,$,.ELEMENT.,0.0);\n`;

    let entityId = 20;
    elements.filter((el) => el.type === 'wall').forEach((w, i) => {
      const len = (Math.hypot(w.x2 - w.x1, w.y2 - w.y1) / 12 * 0.3048).toFixed(3);
      ifc += `#${entityId}=IFCWALLSTANDARDCASE('W${i}_${timestamp}',#2,'${w.label || 'Wall'}',$,$,#${entityId + 1},#${entityId + 2},'${w.material || 'Masonry'}');\n`;
      entityId += 3;
    });

    ifc += `ENDSEC;\nEND-ISO-10303-21;\n`;
    const blob = new Blob([ifc], { type: 'application/x-step' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RachnaCAD_BIM_${Date.now()}.ifc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveProject = () => {
    const data = {
      app: 'RachnaCAD', version: '1.0.0',
      savedAt: new Date().toISOString(),
      projectName, elements,
      settings: { wallHeight, wallThickness, wallMaterial, gridSnap, orthoMode }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.rcad`;
    a.click();
    URL.revokeObjectURL(url);
    setCommandHistory(prev => [...prev, `Saved: ${projectName}.rcad`]);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.elements && Array.isArray(parsed.elements)) {
          pushHistory(parsed.elements);
          if (parsed.projectName) setProjectName(parsed.projectName);
          if (parsed.settings) {
            if (parsed.settings.wallHeight) setWallHeight(parsed.settings.wallHeight);
            if (parsed.settings.wallThickness) setWallThickness(parsed.settings.wallThickness);
            if (parsed.settings.wallMaterial) setWallMaterial(parsed.settings.wallMaterial);
          }
          setCommandHistory(prev => [...prev, `Opened: ${file.name} — ${parsed.elements.length} elements`]);
        }
      } catch { alert('Invalid .rcad or .json project file.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_Blueprint_${Date.now()}.png`;
    a.click();
    setCommandHistory(prev => [...prev, 'Blueprint exported as PNG.']);
  };

  // Live schedule calculations
  const wallElements = elements.filter(el => el.type === 'wall');
  const doorElements = elements.filter(el => el.type === 'door');
  const windowElements = elements.filter(el => el.type === 'window');
  const roomElements = elements.filter(el => el.type === 'room');
  const totalWallLengthFt = Math.round(wallElements.reduce((sum, el) => sum + Math.hypot(el.x2 - el.x1, el.y2 - el.y1) / 12, 0));
  const totalAreaSqFt = roomElements.reduce((sum, el) => sum + (el.areaSqFt || 0), 0) || 900;
  const estimatedCost = (totalAreaSqFt * 55).toLocaleString();
  const selectedElement = elements.find(e => e.id === selectedElementId);
  const allLayers = [...new Set(elements.map(e => e.layer))];

  if (showWelcomeHub) {
    return (
      <div className="w-full h-full flex flex-col">
        <WelcomeHub
          onNewProject={(name, initialElements) => {
            setProjectName(name || 'Untitled_Drawing');
            const newElems = initialElements || [];
            setElements(newElems);
            setHistory([newElems]);
            setHistoryIndex(0);
            setSelectedElementId(null);
            setShowWelcomeHub(false);
          }}
          onOpenProject={() => {
            fileInputRef.current?.click();
            setShowWelcomeHub(false);
          }}
          onOpenVectorizer={() => {
            setShowWelcomeHub(false);
            setShowVectorizer(true);
          }}
          onOpenDesktopSetup={() => setShowDesktopSetup(true)}
        />
        {showDesktopSetup && (
          <SetupAuthModal
            isOpen={showDesktopSetup}
            onClose={() => setShowDesktopSetup(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${fullScreen ? 'h-screen w-screen' : 'h-[850px] rounded-3xl border border-gray-200'} bg-white overflow-hidden font-sans text-gray-900 select-none`}>
      <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".rcad,.json" className="hidden" />

      {/* ── MENU BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-[#0F172A] text-white px-3 py-1.5 flex items-center justify-between text-xs z-30">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2 mr-3 font-bold">
            <span className="w-5 h-5 rounded bg-blue-600 text-white font-black flex items-center justify-center text-xs">📐</span>
            <span className="font-extrabold tracking-tight text-white">RachnaCAD Studio</span>
            <span className="bg-white/10 text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-mono">v1.0 BIM</span>
          </div>

          {/* Menus */}
          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2.5 py-1 rounded hover:bg-white/10 ${activeMenu === 'file' ? 'bg-white/20' : ''}`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50 text-xs">
                <button onClick={() => { setShowWelcomeHub(true); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 flex items-center justify-between text-blue-600 font-semibold">
                  <span>Welcome Screen / Hub</span> <span className="text-gray-400 text-[10px]">Home</span>
                </button>
                <button onClick={() => { setShowDesktopSetup(true); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-emerald-50 flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Desktop Installer (Mac/Win/Linux)</span>
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button onClick={() => { setElements([]); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>New Blueprint</span> <span className="text-gray-400 text-[10px]">Ctrl+N</span>
                </button>
                <button onClick={() => { fileInputRef.current?.click(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Open Project (.rcad)</span> <span className="text-gray-400 text-[10px]">Ctrl+O</span>
                </button>
                <button onClick={() => { saveProject(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between font-bold">
                  <span>Save Project</span> <span className="text-gray-400 text-[10px]">Ctrl+S</span>
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button onClick={() => { exportDXF(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Export AutoCAD (.dxf)</span>
                </button>
                <button onClick={() => { exportIFC(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between font-bold text-gray-900">
                  <span>Export Archicad BIM (.ifc)</span>
                </button>
                <button onClick={() => { exportPNG(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Export PNG Render</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveMenu(activeMenu === 'draw' ? null : 'draw')}
              className={`px-2.5 py-1 rounded hover:bg-white/10 ${activeMenu === 'draw' ? 'bg-white/20' : ''}`}
            >
              Draw
            </button>
            {activeMenu === 'draw' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50 text-xs">
                <button onClick={() => { setActiveTool('wall'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Wall</span> <span className="text-gray-400 text-[10px]">W</span>
                </button>
                <button onClick={() => { setActiveTool('door'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Door</span> <span className="text-gray-400 text-[10px]">DR</span>
                </button>
                <button onClick={() => { setActiveTool('window'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Window</span> <span className="text-gray-400 text-[10px]">WN</span>
                </button>
                <button onClick={() => { setActiveTool('line'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Line</span> <span className="text-gray-400 text-[10px]">L</span>
                </button>
                <button onClick={() => { setActiveTool('rect'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Rectangle</span> <span className="text-gray-400 text-[10px]">REC</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveMenu(activeMenu === 'bim' ? null : 'bim')}
              className={`px-2.5 py-1 rounded hover:bg-white/10 ${activeMenu === 'bim' ? 'bg-white/20' : ''}`}
            >
              BIM 3D
            </button>
            {activeMenu === 'bim' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50 text-xs">
                <button onClick={() => { rebuild3DBIM(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100">
                  Sync All 3D Walls
                </button>
                <button onClick={() => { setShowRoof3D(!showRoof3D); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100">
                  Toggle 3D Roof Slab
                </button>
                <button onClick={() => { setShowVectorizer(true); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 font-bold text-black flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-[#CCFF00]" /> <span>2D Blueprint → 3D BIM</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              className={`px-2.5 py-1 rounded hover:bg-white/10 ${activeMenu === 'help' ? 'bg-white/20' : ''}`}
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50 text-xs">
                <button onClick={() => { setShowShortcutsModal(true); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center justify-between">
                  <span>Keyboard Shortcuts</span> <span className="text-gray-400 text-[10px]">?</span>
                </button>
                <div className="px-3 py-1 text-[11px] text-gray-500 font-mono">
                  RachnaCAD Pro v1.0.0
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Project Name + Undo/Redo + Status */}
        <div className="flex items-center gap-3">
          {isEditingProjectName ? (
            <input autoFocus value={projectName} onChange={e => setProjectName(e.target.value)}
              onBlur={() => setIsEditingProjectName(false)}
              onKeyDown={e => { if (e.key === 'Enter') setIsEditingProjectName(false); }}
              className="bg-white/10 text-white text-[11px] font-mono px-2 py-0.5 rounded outline-none border border-white/20 w-48" />
          ) : (
            <button onClick={() => setIsEditingProjectName(true)} className="text-[11px] text-gray-300 font-mono hidden sm:flex items-center gap-1 hover:text-white">
              <span className="text-gray-500">📁</span><strong className="text-white">{projectName}.rcad</strong>
            </button>
          )}
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={historyIndex <= 0} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center disabled:opacity-30" title="Undo (Ctrl+Z)"><Undo2 className="w-3.5 h-3.5" /></button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center disabled:opacity-30" title="Redo (Ctrl+Y)"><Redo2 className="w-3.5 h-3.5" /></button>
          </div>
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" /> PRO
          </span>
        </div>
      </div>

      {/* ── RIBBON BAR ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            {[{m:'split',l:'Split 2D+3D',i:<Columns className="w-3.5 h-3.5"/>},{m:'2d-only',l:'2D Plan',i:<PenLine className="w-3.5 h-3.5"/>},{m:'3d-only',l:'3D BIM',i:<Box className="w-3.5 h-3.5"/>}].map(({m,l,i}) => (
              <button key={m} onClick={() => setViewMode(m as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode===m?'bg-white text-gray-900 shadow-xs':'text-gray-500 hover:text-gray-900'}`}>
                {i}<span>{l}</span>
              </button>
            ))}
          </div>

          {/* Quick Context Parametric Dropdowns */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-gray-600 pl-3 border-l border-gray-200">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-medium">Thickness:</span>
              <select
                value={wallThickness}
                onChange={(e) => setWallThickness(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 text-xs text-gray-900 font-semibold outline-none"
              >
                <option value={4.5}>4.5" (Interior)</option>
                <option value={9}>9" (Exterior Brick)</option>
                <option value={12}>12" (Cavity)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-medium">Ceiling Ht:</span>
              <select
                value={wallHeight}
                onChange={(e) => setWallHeight(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 text-xs text-gray-900 font-semibold outline-none"
              >
                <option value={9}>9'-0"</option>
                <option value={10}>10'-0" (Standard)</option>
                <option value={12}>12'-0" (High)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-medium">Material:</span>
              <select
                value={wallMaterial}
                onChange={(e) => setWallMaterial(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 text-xs text-gray-900 font-semibold outline-none"
              >
                <option value="Modern Plaster">Modern Plaster</option>
                <option value="Brick Masonry">Brick Masonry</option>
                <option value="Reinforced Concrete">Honed Concrete</option>
                <option value="Timber Frame">Cedar Timber</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Module 5: 1-Click 2D Image to 3D BIM */}
          <button
            onClick={() => setShowVectorizer(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer transition-all"
            title="Convert 2D Blueprint Image to 3D BIM"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>2D Image → 3D BIM</span>
          </button>

          {/* Roof Slab Toggle */}
          <button
            onClick={() => setShowRoof3D(!showRoof3D)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer ${
              showRoof3D ? 'bg-gray-900 text-white border-black shadow-xs' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-100'
            }`}
          >
            {showRoof3D ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>3D Roof</span>
          </button>

          {/* Grid Snap & Ortho Mode */}
          <button
            onClick={() => setGridSnap(!gridSnap)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              gridSnap ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' : 'border-gray-200 text-gray-400'
            }`}
          >
            SNAP: {gridSnap ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setOrthoMode(!orthoMode)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              orthoMode ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' : 'border-gray-200 text-gray-400'
            }`}
          >
            ORTHO: {orthoMode ? 'ON' : 'OFF'}
          </button>

          {/* Save .rcad */}
          <button
            onClick={saveProject}
            className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-800 hover:bg-gray-100 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Save Project File (.rcad)"
          >
            <Save className="w-3.5 h-3.5 text-blue-600" />
            <span>Save</span>
          </button>

          {/* Direct Exporters */}
          <button
            onClick={exportDXF}
            className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-800 hover:bg-gray-100 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Export AutoCAD Drawing (.DXF)"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>.DXF</span>
          </button>

          <button
            onClick={exportIFC}
            className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Export Archicad / Revit IFC 4x3 BIM"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export .IFC</span>
          </button>

          {/* Standalone Desktop App Setup */}
          <button
            onClick={() => setShowDesktopSetup(true)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Install Native Desktop Software for Mac, Linux, Windows"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>Desktop</span>
          </button>

          {/* Hub Button */}
          <button
            onClick={() => setShowWelcomeHub(true)}
            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Return to Welcome Hub (Launcher Screen)"
          >
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span>Hub</span>
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT TOOL PALETTE */}
        <div className="w-14 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-2.5 space-y-1 select-none z-10">
          {[
            {tool:'select',label:'SEL',icon:<Move className="w-4 h-4"/>,title:'Select (V)'},
            {tool:'wall',label:'WALL',icon:<Building2 className="w-4 h-4"/>,title:'Smart Wall (W)'},
            {tool:'door',label:'DOOR',icon:<DoorOpen className="w-4 h-4"/>,title:'Door (DR)'},
            {tool:'window',label:'WIND',icon:<Square className="w-4 h-4"/>,title:'Window (WN)'},
            {tool:'line',label:'LINE',icon:<Minus className="w-4 h-4"/>,title:'Line (L)'},
            {tool:'rect',label:'RECT',icon:<Ruler className="w-4 h-4"/>,title:'Rectangle Room (REC)'},
            {tool:'room',label:'ROOM',icon:<LayoutGrid className="w-4 h-4"/>,title:'Room Stamp (RM)'},
            {tool:'dim',label:'DIM',icon:<Ruler className="w-4 h-4"/>,title:'Dimension (DIM)'},
          ].map(({tool,label,icon,title}) => (
            <button key={tool} onClick={() => setActiveTool(tool as CADTool)}
              className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[9px] transition-all cursor-pointer ${activeTool===tool?'bg-black text-white font-bold shadow-xs':'text-gray-600 hover:bg-white hover:border hover:border-gray-200'}`}
              title={title}>
              {icon}<span className="mt-0.5">{label}</span>
            </button>
          ))}
          <div className="w-8 border-t border-gray-200 my-0.5"/>
          <button onClick={() => { if (selectedElementId) { pushHistory(elements.filter(el => el.id !== selectedElementId)); setSelectedElementId(null); setCommandHistory(p=>[...p,'Deleted.']); } }}
            disabled={!selectedElementId}
            className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[9px] text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 transition-all cursor-pointer" title="Delete Selected (Del)">
            <Trash2 className="w-4 h-4"/><span>DEL</span>
          </button>

          <div className="flex-1" />

          {/* Pan & Zoom Quick Controls */}
          <button
            onClick={() => setZoom((z) => Math.min(4, z * 1.2))}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-xs hover:bg-gray-100"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z * 0.8))}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-xs hover:bg-gray-100"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setPan({ x: 260, y: 200 }); setZoom(0.9); }}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-xs hover:bg-gray-100 mb-1"
            title="Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* DUAL SPLIT VIEWPORT CONTAINER */}
        <div className="flex-1 flex overflow-hidden">
          {/* 1. 2D VECTOR CANVAS */}
          {(viewMode === 'split' || viewMode === '2d-only') && (
            <div
              className={`relative overflow-hidden bg-white border-r border-gray-200 ${
                viewMode === 'split' ? 'w-1/2' : 'w-full'
              }`}
            >
              <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono font-bold text-gray-800 border border-gray-200 shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>2D Plan View (AutoCAD Precision)</span>
              </div>
              {drawingStart && (
                <div className="absolute top-3 right-3 z-10 bg-[#1E40AF] text-white px-3 py-1 rounded-xl text-xs font-mono shadow-xs">
                  {activeTool.toUpperCase()} — click to complete, Esc to cancel
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={1400}
                height={1000}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                className="w-full h-full"
                style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
              />
            </div>
          )}

          {/* 2. 3D THREE.JS PARAMETRIC BIM VIEWPORT */}
          {(viewMode === 'split' || viewMode === '3d-only') && (
            <div
              className={`relative overflow-hidden bg-[#F8FAFC] ${
                viewMode === 'split' ? 'w-1/2' : 'w-full'
              }`}
            >
              <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-gray-800 border border-gray-200 shadow-xs flex items-center gap-2">
                <Box className="w-3.5 h-3.5 text-blue-600" />
                <span>3D Parametric BIM (Archicad Studio)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
              </div>

              {/* 3D Camera Presets Toolbar */}
              <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl text-xs font-medium text-gray-700 border border-gray-200 shadow-xs flex items-center gap-1.5">
                <button
                  onClick={() => setCameraPreset('iso')}
                  className="px-2 py-0.5 rounded hover:bg-gray-100 text-[11px] font-mono transition-colors cursor-pointer"
                  title="Isometric 3D View"
                >
                  Isometric
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setCameraPreset('top')}
                  className="px-2 py-0.5 rounded hover:bg-gray-100 text-[11px] font-mono transition-colors cursor-pointer"
                  title="Top-Down 2.5D View"
                >
                  Top (2.5D)
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setCameraPreset('front')}
                  className="px-2 py-0.5 rounded hover:bg-gray-100 text-[11px] font-mono transition-colors cursor-pointer"
                  title="Front Facade View"
                >
                  Front
                </button>
              </div>

              <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-medium text-gray-500 border border-gray-200 shadow-xs">
                🖱️ Left Drag: Orbit • Scroll: Zoom • Right Drag: Pan
              </div>
              <div ref={threeMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        {showCopilot && (
          <div className="w-[340px] bg-[#18181B] border-l border-[#27272A] flex flex-col overflow-hidden shadow-xs z-20">
            <div className="flex border-b border-[#27272A] bg-[#141416] text-xs font-semibold">
              <button onClick={() => setActiveRightTab('copilot')}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeRightTab==='copilot'?'bg-[#18181B] text-white border-b-2 border-blue-500 font-bold':'text-gray-400 hover:text-white'}`}>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /><span>AI Co-Pilot</span>
              </button>
              <button onClick={() => setActiveRightTab('inspector')}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeRightTab==='inspector'?'bg-[#18181B] text-white border-b-2 border-blue-500 font-bold':'text-gray-400 hover:text-white'}`}>
                <Sliders className="w-3.5 h-3.5 text-gray-400" /><span>Inspector</span>
                {selectedElement && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </button>
            </div>

            {activeRightTab === 'copilot' && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <AICopilot
                  currentElementsCount={elements.length}
                  onApplyElements={(newElems) => {
                    if (newElems.length === 0) {
                      pushHistory([]);
                      setCommandHistory(prev => [...prev, 'Canvas cleared.']);
                    } else {
                      pushHistory([...elements, ...newElems]);
                      setCommandHistory(prev => [...prev, `AI generated ${newElems.length} BIM elements.`]);
                    }
                  }}
                  onClearDrawing={() => {
                    pushHistory([]);
                    setCommandHistory(prev => [...prev, 'Canvas cleared.']);
                  }}
                  onToggleRoof={() => setShowRoof3D(prev => !prev)}
                  showRoof3D={showRoof3D}
                />
              </div>
            )}

            {activeRightTab === 'inspector' && (
              <div className="flex-1 overflow-y-auto text-xs text-gray-700">
                {/* Selected Element Editor */}
                {selectedElement ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 text-sm">{selectedElement.type.toUpperCase()} Properties</h4>
                      <button onClick={() => setSelectedElementId(null)} className="text-gray-400 hover:text-gray-700"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">{selectedElement.id}</div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Label</label>
                      <input value={inspectorLabel} onChange={e => setInspectorLabel(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400" />
                    </div>
                    {(selectedElement.type === 'wall' || selectedElement.type === 'door' || selectedElement.type === 'window') && (<>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Thickness (in)</label>
                        <input type="number" value={inspectorThickness} onChange={e => setInspectorThickness(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Height (ft)</label>
                        <input type="number" value={inspectorHeight} onChange={e => setInspectorHeight(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Material</label>
                        <select value={inspectorMaterial} onChange={e => setInspectorMaterial(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400">
                          <option>Modern Plaster</option><option>Brick Masonry</option>
                          <option>Reinforced Concrete</option><option>Timber Frame</option><option>Drywall Partition</option>
                        </select>
                      </div>
                    </>)}
                    {selectedElement.type === 'room' && (
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Area (sq ft)</label>
                        <input type="number" defaultValue={selectedElement.areaSqFt}
                          onChange={e => setElements(prev => prev.map(el => el.id === selectedElementId ? {...el, areaSqFt: Number(e.target.value)} : el))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400" />
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between"><span className="text-gray-400">Start</span><span>{(selectedElement.x1/12).toFixed(1)}\', {(selectedElement.y1/12).toFixed(1)}\'</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">End</span><span>{(selectedElement.x2/12).toFixed(1)}\', {(selectedElement.y2/12).toFixed(1)}\'</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Length</span><span>{(Math.hypot(selectedElement.x2-selectedElement.x1,selectedElement.y2-selectedElement.y1)/12).toFixed(2)}\'</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Layer</span><span>{selectedElement.layer}</span></div>
                    </div>
                    <button onClick={applyInspectorChanges} className="w-full py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                      <Check className="w-3.5 h-3.5" /> Apply Changes
                    </button>
                    <button onClick={() => { pushHistory(elements.filter(el => el.id !== selectedElementId)); setSelectedElementId(null); }}
                      className="w-full py-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50">Delete Element</button>
                  </div>
                ) : (
                  <div className="p-4 text-center py-8 text-gray-400 text-xs">
                    <Sliders className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                    Click any element in 2D view to inspect
                  </div>
                )}

                {/* Project Schedules */}
                <div className="p-4 space-y-2 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm">Project Schedules</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {label:'Built-Up Area', val: `${totalAreaSqFt}`, unit: 'sq ft'},
                      {label:'Wall Run', val: `${totalWallLengthFt}`, unit: 'ft'},
                      {label:'Doors', val: `${doorElements.length}`, unit: ''},
                      {label:'Windows', val: `${windowElements.length}`, unit: ''},
                    ].map(({label,val,unit}) => (
                      <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <span className="text-[10px] text-gray-500 block uppercase">{label}</span>
                        <strong className="text-base text-gray-900 font-mono">{val}</strong>
                        {unit && <span className="text-[10px] text-gray-500 ml-1">{unit}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <span className="text-[10px] text-gray-500 block uppercase">Est. Construction Cost</span>
                    <strong className="text-lg text-emerald-700 font-mono">${estimatedCost}</strong>
                    <span className="text-[10px] text-gray-500 block mt-0.5">@ $55/sq ft build index</span>
                  </div>
                </div>

                {/* Layer Visibility */}
                <div className="p-4 space-y-1.5 border-t border-gray-100">
                  <h5 className="font-bold text-gray-900 mb-2">Layer Visibility</h5>
                  {allLayers.map(layer => (
                    <button key={layer} onClick={() => toggleLayer(layer)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all font-mono text-[11px] ${hiddenLayers.has(layer)?'bg-gray-50 border-gray-200 text-gray-400':'bg-white border-gray-200 text-gray-800 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: hiddenLayers.has(layer)?'#CBD5E1':(LAYER_COLORS[layer]??'#64748B')}} />
                        <span>{layer}</span>
                      </div>
                      <span className={`text-[9px] font-bold ${hiddenLayers.has(layer)?'text-gray-400':'text-emerald-600'}`}>
                        {hiddenLayers.has(layer)?'HIDDEN':'VISIBLE'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── COMMAND LINE & STATUS BAR ─────────────────────────────────────── */}
      <div className="bg-[#0F172A] text-gray-300 px-4 py-1.5 flex items-center gap-3 select-none">
        <span className="text-xs font-mono font-bold text-blue-400">CMD:</span>
        <form onSubmit={handleCommandSubmit} className="flex-1 flex items-center gap-2">
          <input type="text" value={commandInput} onChange={e => setCommandInput(e.target.value)}
            placeholder="Type command… (W, DR, WN, L, REC, RM, UNDO, REDO, DXF, IFC)"
            className="flex-1 bg-transparent text-xs font-mono text-gray-200 outline-none placeholder:text-gray-600" />
          <button type="submit" className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs text-gray-300 font-mono border border-white/10 cursor-pointer">↵</button>
        </form>
        <div className="hidden md:flex items-center gap-3 text-[10px] font-mono border-l border-white/10 pl-3">
          <span className="text-gray-400">X:{(currentMousePos.x/12).toFixed(1)}{"'"} Y:{(currentMousePos.y/12).toFixed(1)}{"'"}</span>
          <span className="text-gray-400">ZOOM:{(zoom*100).toFixed(0)}%</span>
          <span className="text-emerald-400 font-bold">⬤ {elements.length} ENT</span>
          <span className="text-gray-500">SNAP:{gridSnap?'ON':'OFF'} ORTHO:{orthoMode?'ON':'OFF'}</span>
        </div>
      </div>
      {/* Command log */}
      <div className="bg-[#080d14] text-[10px] font-mono text-gray-500 px-4 py-0.5 max-h-9 overflow-hidden">
        {commandHistory.slice(-2).map((msg,i,arr) => (
          <div key={i} className={i===arr.length-1?'text-gray-300':'text-gray-600'}>{'>'} {msg}</div>
        ))}
      </div>

      {/* ── MODULE 5: 1-CLICK 2D IMAGE / BLUEPRINT -> 3D BIM MODAL ─────────── */}
      {showVectorizer && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <FloorplanVectorizer
            onVectorized={(newElements) => {
              setElements(newElements);
              setShowVectorizer(false);
              setPan({ x: 260, y: 200 });
              setZoom(0.85);
              setCommandHistory((prev) => [
                ...prev,
                `Module 5: 2D Blueprint successfully vectorized! Generated ${newElements.length} BIM elements with instant 3D extrusion.`,
              ]);
            }}
            onClose={() => setShowVectorizer(false)}
          />
        </div>
      )}

      {showShortcutsModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Keyboard className="w-4 h-4" />Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcutsModal(false)} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono">
              {[['Smart Wall','W'],['Parametric Door','DR'],['Glazed Window','WN'],['Line','L'],
                ['Rectangle Room','REC'],['Room Stamp','RM'],['Dimension','DIM'],['Select','V'],
                ['Escape','Esc'],['Delete Selected','Del'],['Undo','Ctrl+Z'],['Redo','Ctrl+Y'],
                ['Save Project','Ctrl+S'],['New Project','Ctrl+N'],['Open','Ctrl+O'],
                ['Ortho','F8'],['Grid Snap','F3'],['Zoom','+ / -'],['Pan','Alt+Drag'],['Zoom to cursor','Scroll'],
              ].map(([action,key]) => (
                <div key={action} className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">{action}</span>
                  <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Standalone Desktop Setup & Auth Modal */}
      {showDesktopSetup && (
        <SetupAuthModal
          isOpen={showDesktopSetup}
          onClose={() => setShowDesktopSetup(false)}
        />
      )}
    </div>
  );
}
