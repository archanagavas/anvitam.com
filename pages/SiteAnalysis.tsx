// pages/SiteAnalysis.tsx — Interactive Architectural Site Intelligence Studio Canvas
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchAllSiteData, type SiteAnalysisResult } from '../services/siteAnalysisService';
import { AnalysisPanel, type DesignCategory } from '../components/siteanalysis/AnalysisPanel';
import { ShadowSimulator3D } from '../components/siteanalysis/ShadowSimulator3D';
import { ToolUserDashboardModal } from '../components/tools/ToolUserDashboardModal';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';
import { AllToolsDrawer } from '../components/tools/AllToolsDrawer';
import { ToolsSettingsModal } from '../components/tools/ToolsSettingsModal';
import { getToolUser, getOrCreateDefaultToolUser, logoutToolUser, deductUserCredit, type ToolUser } from '../utils/userAuth';
import { TOOLS_SUITE } from '../constants/toolsData';
import {
  MapPin, Layers, Zap, Box, Search, Check, Share2, Globe,
  Menu, ArrowLeft, Home, Building, Trees, Wand2, Trash2, Sliders, LogOut, Settings
} from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || (typeof window !== 'undefined' ? atob('cGsuZXlKMUlqb2lZVzUyYVhSaGJTSXNJbUVpT2lKamJYUTBaR1Z0YjJFd1kySTJNbnB6T1dZeWVYUm9NV0Z4SW4wLmZoUXY1SFdHR0FNdktucHljY0R2dHc=') : '');

// Mapbox GL JS v3 Standard 3D Styles
const MAPBOX_3D_STYLES = [
  {
    id: 'streets-3d',
    name: '🏢 3D Google/Mapbox Style (3D Extruded Streets)',
    style: 'mapbox://styles/mapbox/streets-v12'
  },
  {
    id: 'satellite-3d',
    name: '🌐 3D High-Res Satellite Globe (Mapbox Satellite)',
    style: 'mapbox://styles/mapbox/satellite-streets-v12'
  },
  {
    id: 'standard-3d',
    name: '🏙️ 3D Photorealistic City (Mapbox Standard)',
    style: 'mapbox://styles/mapbox/standard'
  },
  {
    id: 'light-3d',
    name: '☀️ 3D Architectural Light Studio (Mapbox Light)',
    style: 'mapbox://styles/mapbox/light-v11'
  },
  {
    id: 'dark-3d',
    name: '📐 3D Architectural Dark Studio (Mapbox Dark)',
    style: 'mapbox://styles/mapbox/dark-v11'
  }
];

const LEAFLET_2D_STYLES = [
  { id: 'satellite-2d', name: '🛰️ 2D High-Res Satellite (Esri)', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', maxZoom: 19, attribution: 'Tiles &copy; Esri' },
  { id: 'streets-2d', name: '🏢 2D OpenStreetMap Streets', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19, attribution: '&copy; OpenStreetMap' },
  { id: 'studio-2d', name: '📐 2D Architectural Studio (Positron)', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', maxZoom: 19, attribution: '&copy; CARTO' }
];

const CATEGORIES: { id: DesignCategory; label: string; icon: string }[] = [
  { id: 'residential', label: 'Residential', icon: '🏡' },
  { id: 'commercial', label: 'Commercial', icon: '🏢' },
  { id: 'landscape', label: 'Landscape', icon: '🌿' },
  { id: 'institutional', label: 'Institutional', icon: '🏛️' },
  { id: 'interior', label: 'Interior', icon: '🛋️' }
];

export default function SiteAnalysis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');
  const catParam = (searchParams.get('category') as DesignCategory) || 'residential';
  const toolParam = searchParams.get('tool');

  const [category, setCategory] = useState<DesignCategory>(catParam);
  const [analysisResult, setAnalysisResult] = useState<SiteAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Dual Map Engine State ('3d' for Mapbox GL 3D Globe or '2d' for Leaflet Flat)
  const [mapEngine, setMapEngine] = useState<'3d' | '2d'>('3d');
  const [mapboxStyleId, setMapboxStyleId] = useState(MAPBOX_3D_STYLES[0].id);
  const [leafletStyleId, setLeafletStyleId] = useState(LEAFLET_2D_STYLES[0].id);

  // Studio UI Navigation & Auth State
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [user, setUser] = useState<ToolUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);

  // Map Container & Instance Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapboxRef = useRef<mapboxgl.Map | null>(null);
  const mapboxMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const leafletRef = useRef<L.Map | null>(null);
  const leafletTileLayerRef = useRef<L.TileLayer | null>(null);
  const leafletMarkerRef = useRef<L.Marker | null>(null);

  // Location & Massing State
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lon: number; placeName?: string } | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // 3D Shadow Simulation state
  const [buildingHeightM, setBuildingHeightM] = useState(12);

  // User credit listener
  useEffect(() => {
    setUser(getOrCreateDefaultToolUser());
    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ToolUser | null>;
      setUser(customEvent.detail);
    };
    window.addEventListener('anvitam-user-updated', handleUserUpdate);
    return () => window.removeEventListener('anvitam-user-updated', handleUserUpdate);
  }, []);

  // Disable CSS zoom on this page — zoom: 80% breaks Mapbox GL WebGL canvas rendering
  useEffect(() => {
    document.documentElement.classList.add('no-zoom');
    return () => {
      document.documentElement.classList.remove('no-zoom');
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // MAP ENGINE INITIALIZATION (Mapbox GL JS v3 3D Globe vs Leaflet 2D Fallback)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const centerLat = pendingCoords?.lat ?? 22.3072;
    const centerLon = pendingCoords?.lon ?? 73.1812;

    let resizeObserver: ResizeObserver | null = null;

    // Cleanup existing map instances
    if (mapboxRef.current) {
      try { mapboxRef.current.remove(); } catch { /* silent */ }
      mapboxRef.current = null;
      mapboxMarkerRef.current = null;
    }
    if (leafletRef.current) {
      try { leafletRef.current.remove(); } catch { /* silent */ }
      leafletRef.current = null;
      leafletTileLayerRef.current = null;
      leafletMarkerRef.current = null;
    }
    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = '';
    }

    if (mapEngine === '3d') {
      try {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const selectedObj = MAPBOX_3D_STYLES.find(s => s.id === mapboxStyleId) || MAPBOX_3D_STYLES[0];

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: selectedObj.style,
          center: [centerLon, centerLat],
          zoom: 15,
          pitch: 55,
          bearing: -15,
          projection: 'globe' as any
        });

        mapboxRef.current = map;

        const forceResize = () => {
          if (mapboxRef.current) {
            try { mapboxRef.current.resize(); } catch { /* silent */ }
          }
        };

        map.on('style.load', () => {
          forceResize();
          
          if (selectedObj.id !== 'standard-3d') {
            // 3D Terrain Elevation DEM
            try {
              if (!map.getSource('mapbox-dem')) {
                map.addSource('mapbox-dem', {
                  type: 'raster-dem',
                  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                  tileSize: 512,
                  maxzoom: 14
                });
              }
              map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
            } catch { /* silent */ }

            // 3D Extruded Building Layer
            try {
              if (!map.getLayer('3d-buildings')) {
                const layers = map.getStyle()?.layers;
                let labelLayerId: string | undefined;
                if (layers) {
                  for (let i = 0; i < layers.length; i++) {
                    if (layers[i].type === 'symbol' && (layers[i] as any).layout?.['text-field']) {
                      labelLayerId = layers[i].id;
                      break;
                    }
                  }
                }
                map.addLayer({
                  'id': '3d-buildings',
                  'source': 'composite',
                  'source-layer': 'building',
                  'filter': ['==', 'extrude', 'true'],
                  'type': 'fill-extrusion',
                  'minzoom': 13,
                  'paint': {
                    'fill-extrusion-color': '#aaa',
                    'fill-extrusion-height': [
                      'interpolate', ['linear'], ['zoom'],
                      13, 0,
                      13.05, ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                      'interpolate', ['linear'], ['zoom'],
                      13, 0,
                      13.05, ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.8
                  }
                }, labelLayerId);
              }
            } catch { /* silent */ }
          }
        });

        try {
          map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
        } catch { /* silent */ }

        map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          positionMarker(lat, lng);
          setPendingCoords({ lat, lon: lng });
          setIsAnalyzed(false);
        });

        map.on('load', () => {
          forceResize();
          requestAnimationFrame(forceResize);
          setTimeout(forceResize, 200);
          setTimeout(forceResize, 500);
          if (pendingCoords) positionMarker(pendingCoords.lat, pendingCoords.lon);
        });

        map.on('idle', () => {
          forceResize();
        });

        map.on('error', (e) => {
          console.warn('[Mapbox GL] Error caught during rendering:', e);
          if (e?.error?.message?.includes('WebGL') || e?.error?.message?.includes('401')) {
            setMapEngine('2d');
          }
        });

        resizeObserver = new ResizeObserver(() => {
          forceResize();
        });
        if (mapContainerRef.current) {
          resizeObserver.observe(mapContainerRef.current);
        }
      } catch (err) {
        console.warn('Mapbox 3D init failed, switching to Leaflet raster engine:', err);
        setMapEngine('2d');
      }
    } else {
      const selectedStyle = LEAFLET_2D_STYLES.find(s => s.id === leafletStyleId) || LEAFLET_2D_STYLES[0];

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: 13,
        zoomControl: true,
      });

      leafletRef.current = map;

      const tileLayer = L.tileLayer(selectedStyle.url, {
        maxZoom: selectedStyle.maxZoom,
        attribution: selectedStyle.attribution,
        subdomains: 'abc',
      }).addTo(map);

      leafletTileLayerRef.current = tileLayer;

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        positionMarker(lat, lng);
        setPendingCoords({ lat, lon: lng });
        setIsAnalyzed(false);
      });

      setTimeout(() => map.invalidateSize(), 150);
      if (pendingCoords) positionMarker(pendingCoords.lat, pendingCoords.lon);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [mapEngine]);

  useEffect(() => {
    if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!isNaN(lat) && !isNaN(lon)) {
        setPendingCoords({ lat, lon });
        positionMarker(lat, lon);
      }
    }
  }, [latParam, lonParam]);

  const change3DStyle = (styleId: string) => {
    setMapboxStyleId(styleId);
    const selectedObj = MAPBOX_3D_STYLES.find(s => s.id === styleId) || MAPBOX_3D_STYLES[0];
    if (mapboxRef.current) {
      mapboxRef.current.setStyle(selectedObj.style);
    }
  };

  const change2DStyle = (styleId: string) => {
    const selected = LEAFLET_2D_STYLES.find(s => s.id === styleId) || LEAFLET_2D_STYLES[0];
    setLeafletStyleId(selected.id);
    if (leafletRef.current && leafletTileLayerRef.current) {
      leafletRef.current.removeLayer(leafletTileLayerRef.current);
      const newLayer = L.tileLayer(selected.url, {
        maxZoom: selected.maxZoom,
        attribution: selected.attribution,
        subdomains: 'abc',
      }).addTo(leafletRef.current);
      leafletTileLayerRef.current = newLayer;
    }
  };

  const flyToGlobeSpaceView = () => {
    setMapEngine('3d');
    if (mapboxRef.current) {
      try {
        mapboxRef.current.flyTo({
          center: [pendingCoords?.lon ?? 73.1812, pendingCoords?.lat ?? 22.3072],
          zoom: 1.8,
          pitch: 0,
          bearing: 0,
          duration: 2500
        });
      } catch { /* silent */ }
    }
  };

  const flyTo3DBuildingSiteView = () => {
    setMapEngine('3d');
    if (mapboxRef.current) {
      try {
        mapboxRef.current.flyTo({
          center: [pendingCoords?.lon ?? 73.1812, pendingCoords?.lat ?? 22.3072],
          zoom: 16,
          pitch: 55,
          bearing: -15,
          duration: 2000
        });
      } catch { /* silent */ }
    }
  };

  const positionMarker = (lat: number, lon: number) => {
    if (mapEngine === '3d' && mapboxRef.current) {
      const map = mapboxRef.current;

      if (mapboxMarkerRef.current) {
        mapboxMarkerRef.current.remove();
      }

      const el = document.createElement('div');
      el.className = 'map-pin';
      el.innerHTML = `<div class="pin-dot"></div><div class="pin-pulse"></div>`;

      mapboxMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lon, lat])
        .addTo(map);

      map.flyTo({ center: [lon, lat], zoom: 16, pitch: 55, bearing: -15, duration: 1000 });
    } else {
      if (!leafletRef.current) return;

      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.remove();
      }

      const customPin = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `<div class="map-pin"><div class="pin-dot"></div><div class="pin-pulse"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lon], { icon: customPin }).addTo(leafletRef.current);
      leafletMarkerRef.current = marker;

      leafletRef.current.setView([lat, lon], 13, { animate: true });
    }
  };

  const executeSiteAnalysis = async () => {
    if (!pendingCoords) return;
    const { lat, lon } = pendingCoords;

    const deduction = deductUserCredit();
    if (!deduction.success) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);

    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('lat', lat.toFixed(6));
      p.set('lon', lon.toFixed(6));
      p.set('category', category);
      return p;
    }, { replace: true });

    try {
      const result = await fetchAllSiteData(lat, lon, MAPBOX_TOKEN);
      setAnalysisResult(result);
      setIsAnalyzed(true);
    } catch (err) {
      console.error('Site analysis fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPresetLocation = (lat: number, lon: number, name: string) => {
    positionMarker(lat, lon);
    setPendingCoords({ lat, lon, placeName: name });
    setIsAnalyzed(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=1`);
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        positionMarker(lat, lon);
        setPendingCoords({ lat, lon, placeName: data[0].display_name });
        setIsAnalyzed(false);
      }
      setSearchInput('');
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    }
  };

  const handleCategoryChange = (cat: DesignCategory) => {
    setCategory(cat);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('category', cat);
      return p;
    }, { replace: true });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <Helmet>
        <title>Site Intelligence Canvas | Anvitam Studio</title>
        <meta name="description" content="Drop a pin anywhere in the world and generate 3D extruded building models, solar shadow paths, wind rose, and geotech site analysis." />
      </Helmet>

      <div className="site-analysis-page bg-[#FAFBFD] text-[#111111] pt-20 min-h-screen flex flex-col font-sans antialiased">
        
        <div className="flex-1 flex flex-col overflow-visible">

          {/* ── MAIN STUDIO CANVAS ── */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Unified Topbar inside canvas with Hamburger, Search, Settings & Logout */}
            <div className="sa-topbar bg-white text-gray-900 px-6 py-3 border-b border-gray-200/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4 z-20 sticky top-20">
              <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
                <button
                  type="button"
                  onClick={() => setShowToolsDrawer(true)}
                  className="px-3 py-2 rounded-xl bg-black text-[#CCFF00] hover:bg-gray-800 transition cursor-pointer flex items-center gap-2 text-xs font-semibold shadow-2xs shrink-0"
                  title="Open All 21+ Tools Drawer"
                  aria-label="Open All 21+ Tools Drawer"
                >
                  <Menu size={16} />
                  <span>All Tools</span>
                </button>

                <div
                  className="flex items-center gap-2 cursor-pointer shrink-0"
                  onClick={() => navigate('/tools')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate('/tools');
                    }
                  }}
                  aria-label="Navigate to site tools directory"
                >
                  <span className="w-7 h-7 rounded-lg bg-black text-[#CCFF00] font-semibold flex items-center justify-center text-xs shadow-2xs">SA</span>
                  <div>
                    <h1 className="text-xs sm:text-sm font-semibold text-gray-900 leading-none">Site Intelligence Canvas</h1>
                    <p className="text-[10px] text-gray-500 font-medium">Anvitam Studio</p>
                  </div>
                </div>

                <form onSubmit={handleSearch} className="flex items-center relative flex-1 sm:max-w-xs ml-2">
                  <input
                    type="text"
                    className="bg-gray-100 text-gray-900 placeholder-gray-400 text-xs px-4 py-1.5 rounded-full border border-gray-200 focus:border-black outline-none w-full font-normal"
                    placeholder="Search location, city, lat/lon…"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    aria-label="Search location, city, latitude or longitude"
                  />
                </form>
              </div>

              {/* Category Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto py-1 lg:py-0 no-scrollbar justify-start sm:justify-center">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    aria-label={`Select ${cat.label} category`}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                      category === cat.id ? 'bg-black text-[#CCFF00] font-semibold shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80'
                    }`}
                  >
                    <span className="text-xs">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Controls: Credit Pill, Settings, Logout */}
              <div className="flex items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">
                {user ? (
                  <button
                    type="button"
                    onClick={() => setShowPaywall(true)}
                    aria-label="View or top up available studio credits"
                    className="px-3.5 py-1.5 rounded-full bg-[#111111] text-[#CCFF00] border border-black text-xs font-semibold flex items-center gap-1.5 hover:bg-black transition cursor-pointer shadow-2xs"
                  >
                    <Zap size={14} className="fill-[#CCFF00] text-[#CCFF00]" />
                    <span>{user.credits_remaining} Credits</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAuth(true)}
                    aria-label="Sign in to Anvitam Studio"
                    className="px-3.5 py-1.5 rounded-full bg-[#CCFF00] text-black border border-black/10 text-xs font-semibold hover:bg-black hover:text-[#CCFF00] transition cursor-pointer shadow-2xs"
                  >
                    Sign In / Register
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-xl bg-white border border-gray-200/80 hover:border-gray-400 text-gray-700 hover:text-black transition cursor-pointer shadow-2xs"
                  title="Studio & Account Settings"
                  aria-label="Studio & Account Settings"
                >
                  <Settings size={17} />
                </button>

                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      logoutToolUser();
                      setUser(null);
                    }}
                    className="p-2 rounded-xl bg-white border border-gray-200/80 hover:border-red-400 text-gray-600 hover:text-red-600 transition cursor-pointer shadow-2xs"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut size={17} />
                  </button>
                )}
              </div>
            </div>

            {/* 3D Map Container */}
            <div className="w-full h-[65vh] min-h-[480px] relative bg-gray-900 border-b border-gray-200 overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

              {/* Map Overlay Controls */}
              <div className="absolute top-4 left-4 z-20 bg-white/95 text-gray-900 backdrop-blur-md rounded-2xl p-2 border border-gray-200 flex flex-wrap items-center gap-2 shadow-md">
                <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setMapEngine('3d')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      mapEngine === '3d' ? 'bg-black text-[#CCFF00] shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Globe size={13} /> 3D Globe & Extruded Buildings
                  </button>
                  <button
                    onClick={() => setMapEngine('2d')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      mapEngine === '2d' ? 'bg-black text-[#CCFF00] shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Layers size={13} /> 2D High-Res Flat
                  </button>
                </div>

                {/* Map Style Dropdown */}
                <select
                  value={mapEngine === '3d' ? mapboxStyleId : leafletStyleId}
                  onChange={(e) => mapEngine === '3d' ? change3DStyle(e.target.value) : change2DStyle(e.target.value)}
                  className="bg-gray-100 text-gray-900 text-xs font-semibold rounded-xl px-2.5 py-1.5 border border-gray-200 outline-none cursor-pointer hover:bg-gray-200"
                >
                  {mapEngine === '3d' ? (
                    MAPBOX_3D_STYLES.map(st => (
                      <option key={st.id} value={st.id} className="bg-white text-gray-900">
                        {st.name}
                      </option>
                    ))
                  ) : (
                    LEAFLET_2D_STYLES.map(st => (
                      <option key={st.id} value={st.id} className="bg-white text-gray-900">
                        {st.name}
                      </option>
                    ))
                  )}
                </select>

                {mapEngine === '3d' && (
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                    <button
                      onClick={flyToGlobeSpaceView}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-200 transition cursor-pointer"
                    >
                      🚀 Earth Globe
                    </button>
                    <button
                      onClick={flyTo3DBuildingSiteView}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-200 transition cursor-pointer"
                    >
                      🏢 3D Building Site
                    </button>
                  </div>
                )}
              </div>

              {/* Floating Confirmation Card */}
              {pendingCoords && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white text-gray-900 p-4 rounded-3xl border border-black shadow-2xl flex flex-col sm:flex-row items-center gap-4 max-w-lg w-11/12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center font-bold shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">
                        {pendingCoords.placeName || `Site Lat: ${pendingCoords.lat.toFixed(4)}°, Lon: ${pendingCoords.lon.toFixed(4)}°`}
                      </p>
                      <p className="text-[10px] text-gray-500 font-normal">
                        {isAnalyzed ? '✅ Site analysis report active below' : 'Click below to generate 11+ site diagrams'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={executeSiteAnalysis}
                    disabled={loading}
                    className="bg-black text-[#CCFF00] hover:bg-gray-800 font-bold text-xs px-5 py-3 rounded-2xl transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Zap size={14} className="fill-[#CCFF00]" />
                    {loading ? 'Analyzing Site...' : 'Run Analysis (1 Credit)'}
                  </button>
                </div>
              )}
            </div>

            {/* 3D Solar Shadow Simulator */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-6 max-w-7xl mx-auto w-full">
              <ShadowSimulator3D
                lat={pendingCoords?.lat ?? 22.3072}
                lon={pendingCoords?.lon ?? 73.1812}
                buildingHeightMeters={buildingHeightM}
              />
            </div>

            {/* Analysis Panel Section */}
            <div className="bg-[#FAFBFD] flex-1 pb-16">
              <AnalysisPanel
                result={analysisResult}
                loading={loading}
                category={category}
                onShare={handleShare}
                activeToolFilter={toolParam}
                onSelectPresetLocation={handleSelectPresetLocation}
              />
            </div>

          </div>

        </div>

        {copied && (
          <div className="fixed bottom-6 right-6 z-50 bg-black text-[#CCFF00] border border-black px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl animate-bounce">
            ✅ Shareable report link copied to clipboard!
          </div>
        )}

        <ToolUserDashboardModal
          isOpen={showDashboardModal}
          onClose={() => setShowDashboardModal(false)}
          user={user}
          onLogout={() => {
            setUser(null);
            setShowDashboardModal(false);
          }}
          onUpdateUser={(updated) => setUser(updated)}
          onUpgrade={() => {
            setShowDashboardModal(false);
            setShowPaywall(true);
          }}
        />

        <AllToolsDrawer
          isOpen={showToolsDrawer}
          onClose={() => setShowToolsDrawer(false)}
          activeToolId={toolParam || 'site-analysis'}
        />

        <ToolsSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          user={user}
          onLogout={() => {
            logoutToolUser();
            setUser(null);
          }}
          onUpgrade={() => setShowPaywall(true)}
        />

        <ToolsAuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={(u) => {
            setUser(u);
            setShowAuth(false);
          }}
          initialMode={authMode}
        />

        <ToolsPaywallOverlay
          isOpen={showPaywall}
          trialDaysRemaining={user?.trial_days_remaining ?? 0}
          creditsRemaining={user ? user.credits_remaining : 0}
          userCountry={user?.country}
          onClose={() => setShowPaywall(false)}
          onUseFreeTrial={() => setShowPaywall(false)}
          onSubscribe={(plan) => {
            const checkoutUrl = plan === 'monthly' 
              ? 'https://checkout.dodopayments.com/buy/pdt_0NlZ5wDhqx68MxeHE06JE?quantity=1'
              : 'https://checkout.dodopayments.com/buy/pdt_0NlZ5UEJiErzLixmkxbda?quantity=1';
            window.open(`${checkoutUrl}&email=${encodeURIComponent(user?.email || '')}`, '_blank', 'noopener,noreferrer');
          }}
          onLogin={() => { setShowPaywall(false); setAuthMode('login'); setShowAuth(true); }}
          onRegister={() => { setShowPaywall(false); setAuthMode('register'); setShowAuth(true); }}
        />
      </div>
    </>
  );
}
