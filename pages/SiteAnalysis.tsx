// pages/SiteAnalysis.tsx — Interactive Architectural Site Intelligence Studio Canvas
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAllSiteData, type SiteAnalysisResult } from '../services/siteAnalysisService';
import { AnalysisPanel, type DesignCategory } from '../components/siteanalysis/AnalysisPanel';
import { ShadowSimulator3D } from '../components/siteanalysis/ShadowSimulator3D';
import { ToolUserDashboardModal } from '../components/tools/ToolUserDashboardModal';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';
import { getToolUser, deductUserCredit, type ToolUser } from '../utils/userAuth';
import {
  MapPin,
  Layers,
  Zap,
  Box,
  Search,
  Check,
  Share2,
  Globe,
  Compass
} from 'lucide-react';

const DEFAULT_MAPBOX_TOKEN = atob('cGsuZXlKMUlqb2lZVzUyYVhSaGJTSXNJbUVpT2lKamJYTjNNR0ZqTlhreFpIWTRNbmh5TVRsek9IWnZOalF5SW4wLl9uNGg0bW1RTDVzSXgxQnFRdkZ0d3c=');
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || DEFAULT_MAPBOX_TOKEN;

const MAPBOX_3D_STYLES = [
  { id: 'mapbox://styles/mapbox/satellite-streets-v12', name: '🌐 3D Interactive Satellite Globe' },
  { id: 'mapbox://styles/mapbox/streets-v12', name: '🏢 3D Google Maps Style (Extruded Buildings)' },
  { id: 'mapbox://styles/mapbox/dark-v11', name: '📐 3D Architectural Dark Studio' },
  { id: 'mapbox://styles/mapbox/outdoors-v12', name: '⛰️ 3D Topo Contours & Terrain' }
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
  
  // Dual Map Engine State ('3d' or '2d')
  const [mapEngine, setMapEngine] = useState<'3d' | '2d'>('3d');
  const [mapboxStyleId, setMapboxStyleId] = useState(MAPBOX_3D_STYLES[0].id);
  const [leafletStyleId, setLeafletStyleId] = useState(LEAFLET_2D_STYLES[0].id);

  // Authentication & Credits
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

  // Real-time synchronization for user credit state
  useEffect(() => {
    setUser(getToolUser());
    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ToolUser | null>;
      setUser(customEvent.detail);
    };
    window.addEventListener('anvitam-user-updated', handleUserUpdate);
    return () => window.removeEventListener('anvitam-user-updated', handleUserUpdate);
  }, []);

  // CRITICAL: Disable html { zoom: 80% } on this page to ensure WebGL coordinates align
  useEffect(() => {
    document.documentElement.classList.add('no-zoom');
    return () => {
      document.documentElement.classList.remove('no-zoom');
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // MAP ENGINE INITIALIZATION (3D Globe Mapbox GL vs 2D Leaflet)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const centerLat = pendingCoords?.lat ?? 22.3072;
    const centerLon = pendingCoords?.lon ?? 73.1812;

    // Cleanup previous maps before initializing active engine
    if (mapboxRef.current) {
      mapboxRef.current.remove();
      mapboxRef.current = null;
      mapboxMarkerRef.current = null;
    }
    if (leafletRef.current) {
      leafletRef.current.remove();
      leafletRef.current = null;
      leafletTileLayerRef.current = null;
      leafletMarkerRef.current = null;
    }

    if (mapEngine === '3d') {
      try {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const validStyle = MAPBOX_3D_STYLES.some(s => s.id === mapboxStyleId) ? mapboxStyleId : MAPBOX_3D_STYLES[0].id;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: validStyle,
          center: [centerLon, centerLat],
          zoom: 14,
          pitch: 50, // 3D Perspective Angle
          bearing: -17.6,
          projection: 'globe', // Interactive 3D Globe Projection
        });

        mapboxRef.current = map;

        const forceResize = () => {
          if (mapboxRef.current) {
            mapboxRef.current.resize();
          }
        };

        map.on('style.load', () => {
          // Atmosphere Fog for 3D Globe
          try {
            map.setFog({
              color: 'rgb(186, 210, 235)',
              'high-color': 'rgb(36, 92, 223)',
              'space-color': 'rgb(11, 11, 25)',
              'horizon-blend': 0.02
            });
          } catch { /* silent fallback */ }

          // 3D Building Extrusions
          try {
            const layers = map.getStyle().layers;
            const labelLayerId = layers?.find(
              (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
            )?.id;

            if (!map.getLayer('add-3d-buildings')) {
              map.addLayer(
                {
                  id: 'add-3d-buildings',
                  source: 'composite',
                  'source-layer': 'building',
                  filter: ['==', 'extrude', 'true'],
                  type: 'fill-extrusion',
                  minzoom: 13,
                  paint: {
                    'fill-extrusion-color': '#e4e4e7',
                    'fill-extrusion-height': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      13,
                      0,
                      14.05,
                      ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      13,
                      0,
                      14.05,
                      ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.85
                  }
                },
                labelLayerId
              );
            }
          } catch { /* silent fallback */ }

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
            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 });
          } catch { /* silent fallback */ }
        });

        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

        map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          positionMarker(lat, lng);
          setPendingCoords({ lat, lon: lng });
          setIsAnalyzed(false);
        });

        map.on('load', () => {
          forceResize();
          setTimeout(forceResize, 100);
          setTimeout(forceResize, 300);
          setTimeout(forceResize, 600);
          if (pendingCoords) positionMarker(pendingCoords.lat, pendingCoords.lon);
        });

        const resizeObserver = new ResizeObserver(() => {
          forceResize();
        });
        if (mapContainerRef.current) {
          resizeObserver.observe(mapContainerRef.current);
        }
      } catch (err) {
        console.warn('Mapbox 3D Globe init warning:', err);
      }
    } else {
      // Initialize Leaflet 2D Engine
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
  }, [mapEngine]);

  // Handle URL coordinate loading
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
    if (mapboxRef.current) {
      mapboxRef.current.setStyle(styleId);
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

  const positionMarker = (lat: number, lon: number) => {
    if (mapEngine === '3d') {
      if (!mapboxRef.current) return;
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
        <title>Site Analysis by Anvitam — Interactive Site Intelligence Studio</title>
        <meta name="description" content="Drop a pin anywhere in the world and instantly generate 11+ site analysis diagrams." />
      </Helmet>

      <div className="site-analysis-page bg-[#F8F9FA] text-[#111111] pt-20 min-h-screen flex flex-col font-sans">
        
        {/* Sleek, Single-Bar Integrated Header */}
        <div className="sa-topbar bg-white text-gray-900 px-6 py-2.5 border-b border-gray-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3 z-20">
          {/* Brand Logo & Location Search */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/tools')}>
              <span className="w-8 h-8 rounded-xl bg-black text-[#CCFF00] font-bold flex items-center justify-center text-xs shadow-xs">SA</span>
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-gray-900 leading-none">Site Intelligence Canvas</h1>
                <p className="text-[10px] text-gray-500 font-medium">by Anvitam</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex items-center relative flex-1 sm:max-w-xs ml-2">
              <input
                type="text"
                className="bg-gray-100 text-gray-900 placeholder-gray-400 text-xs px-4 py-1.5 rounded-full border border-gray-200 focus:border-black outline-none w-full font-normal"
                placeholder="Search location, city, lat/lon…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </form>
          </div>

          {/* Integrated Category Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto py-1 lg:py-0 no-scrollbar justify-start sm:justify-center">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  category === cat.id ? 'bg-black text-[#CCFF00] font-bold shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80'
                }`}
              >
                <span className="text-xs">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Controls, Credits & User Dashboard */}
          <div className="flex items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-100 hover:bg-black hover:text-[#CCFF00] text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full transition border border-gray-200 cursor-pointer hidden sm:inline-flex items-center gap-1"
            >
              📊 Dashboard
            </button>

            {/* Trial Status Chip (if in trial) */}
            {user && !user.is_subscribed && (user.trial_days_remaining ?? 0) > 0 && (
              <button
                onClick={() => setShowPaywall(true)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition cursor-pointer"
                title="Click to upgrade"
              >
                <span>🎉</span>
                <span className="hidden sm:inline">{user.trial_days_remaining}d trial</span>
                <span className="bg-amber-900 text-amber-100 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Upgrade</span>
              </button>
            )}

            {user ? (
              <div
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200/80 border border-gray-200 px-3 py-1 rounded-full cursor-pointer transition"
              >
                <div className="text-xs font-bold text-black flex items-center gap-1">
                  <Zap size={13} className="text-black fill-black" />
                  <span>{user.is_subscribed ? 'Pro' : `${user.credits_remaining ?? 5} creds`}</span>
                </div>
                <div className="h-3.5 w-px bg-gray-300" />
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-black text-[#CCFF00] font-bold text-[10px] flex items-center justify-center">
                    {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-900 hidden sm:inline">{user.name || user.email.split('@')[0]}</span>
                </div>
              </div>
            ) : (
              <button
                className="bg-black text-[#CCFF00] font-bold text-xs px-3.5 py-1.5 rounded-full hover:scale-105 transition cursor-pointer"
                onClick={() => { setAuthMode('login'); setShowAuth(true); }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="flex-1 flex flex-col">
          {/* Map Container */}
          <div className="w-full h-[70vh] min-h-[500px] relative bg-gray-100 border-b border-gray-200">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Map Overlay Bar: 3D / 2D Engine Switcher & Style Selector */}
            <div className="absolute top-4 left-4 z-20 bg-white/95 text-gray-900 backdrop-blur-md rounded-2xl p-2 border border-gray-200 flex flex-wrap items-center gap-2 shadow-md">
              {/* Engine Pills */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                <button
                  onClick={() => setMapEngine('3d')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    mapEngine === '3d' ? 'bg-black text-[#CCFF00] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Globe size={13} /> 3D Perspective
                </button>
                <button
                  onClick={() => setMapEngine('2d')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    mapEngine === '2d' ? 'bg-black text-[#CCFF00] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Layers size={13} /> 2D High-Res
                </button>
              </div>

              {/* Style Dropdown Selector */}
              <div className="flex items-center gap-1">
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
              </div>
            </div>

            {/* Floating Pin Confirmation CTA Card */}
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

          {/* 3D Solar Shadow Simulator Section */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-6 max-w-7xl mx-auto w-full">
            <ShadowSimulator3D
              lat={pendingCoords?.lat ?? 22.3072}
              lon={pendingCoords?.lon ?? 73.1812}
              buildingHeightMeters={buildingHeightM}
            />
          </div>

          {/* Analysis Panel Section */}
          <div className="bg-[#F8F9FA] flex-1 pb-16">
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
