// pages/SiteAnalysis.tsx — Interactive Architectural Site Intelligence Studio Canvas
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { fetchAllSiteData, type SiteAnalysisResult } from '../services/siteAnalysisService';
import { AnalysisPanel, type DesignCategory } from '../components/siteanalysis/AnalysisPanel';
import { ShadowSimulator3D } from '../components/siteanalysis/ShadowSimulator3D';
import { TrialBanner } from '../components/tools/TrialBanner';
import { ToolUserDashboardModal } from '../components/tools/ToolUserDashboardModal';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';
import { getToolUser, deductUserCredit, type ToolUser } from '../utils/userAuth';
import {
  MapPin,
  Layers,
  LayoutGrid,
  Columns,
  Zap,
  Box,
  Compass
} from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MAP_STYLES = [
  { id: 'streets', name: 'Streets (Google Maps Style)', url: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite', name: 'Satellite High-Res', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { id: 'dark', name: 'Dark Studio (Architectural)', url: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'outdoors', name: 'Outdoors & Topo Contours', url: 'mapbox://styles/mapbox/outdoors-v12' }
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

  const [layoutMode, setLayoutMode] = useState<'bento' | 'split'>('bento');
  const [panelWidth, setPanelWidth] = useState(480);
  const [isDraggingResizer, setIsDraggingResizer] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES[0].url);

  // Authentication & Credits
  const [user, setUser] = useState<ToolUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);

  // Mapbox refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // Location & Massing State
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lon: number; placeName?: string } | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // 3D Shadow Simulation state
  const [buildingHeightM, setBuildingHeightM] = useState(12); // Default 12m (~4 stories)
  const [timeHour, setTimeHour] = useState(12); // Noon
  const [selectedSeason, setSelectedSeason] = useState<'equinox' | 'summer' | 'winter'>('equinox');
  const [isDrawMode, setIsDrawMode] = useState(false);

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

  // Initialize Mapbox 3D Globe & Polygons
  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN) return;
    if (mapRef.current) return; // Prevent duplicate init

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: currentMapStyle,
      center: [73.1812, 22.3072], // Default Vadodara, Gujarat
      zoom: 3,
      pitch: 40,
      bearing: 0,
      projection: 'globe',
    });

    mapRef.current = map;

    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(186, 210, 240)',
        'high-color': 'rgb(36, 92, 223)',
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      // Enable terrain 3D if available
      try {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        });
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      } catch { /* silent */ }
    });

    // Add Draw Controls for 3D massing
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: 'simple_select'
    });
    map.addControl(draw, 'top-right');
    drawRef.current = draw;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle Map Click to Pin Location
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      positionMarker(lat, lng);
      setPendingCoords({ lat, lon: lng });
      setIsAnalyzed(false);
    });

    map.on('load', () => {
      map.resize();
    });

    const handleWindowResize = () => {
      if (mapRef.current) mapRef.current.resize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      map.remove();
      mapRef.current = null;
    };
  }, [currentMapStyle]);

  // Handle URL coordinate loading
  useEffect(() => {
    if (latParam && lonParam && MAPBOX_TOKEN) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!isNaN(lat) && !isNaN(lon)) {
        setPendingCoords({ lat, lon });
        positionMarker(lat, lon);
      }
    }
  }, [latParam, lonParam]);

  const changeMapStyle = (newUrl: string) => {
    setCurrentMapStyle(newUrl);
    if (mapRef.current) {
      mapRef.current.setStyle(newUrl);
    }
  };

  const positionMarker = (lat: number, lon: number) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'map-pin';
    el.innerHTML = `<div class="pin-dot"></div><div class="pin-pulse"></div>`;

    markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lon, lat])
      .addTo(map);

    map.flyTo({ center: [lon, lat], zoom: 15, pitch: 50, duration: 1000 });
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
    if (!searchInput.trim() || !MAPBOX_TOKEN) return;
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
      const data = await res.json();
      if (data.features?.[0]) {
        const feat = data.features[0];
        const [lon, lat] = feat.center;
        positionMarker(lat, lon);
        setPendingCoords({ lat, lon, placeName: feat.place_name });
        setIsAnalyzed(false);
      }
      setSearchInput('');
    } catch { /* silent */ }
  };

  const handleMouseDownResizer = () => {
    setIsDraggingResizer(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingResizer) return;
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.max(320, Math.min(800, newWidth)));
    };

    const handleMouseUp = () => {
      setIsDraggingResizer(false);
    };

    if (isDraggingResizer) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingResizer]);

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

  const toggleDrawMode = () => {
    setIsDrawMode(prev => !prev);
    if (!isDrawMode && drawRef.current) {
      drawRef.current.changeMode('draw_polygon');
    }
  };

  const noMapbox = !MAPBOX_TOKEN;

  return (
    <>
      <Helmet>
        <title>Site Analysis by Anvitam — Interactive 3D Site Intelligence</title>
        <meta name="description" content="Drop a pin anywhere in the world and instantly generate 11+ site analysis diagrams." />
      </Helmet>

      <div className="site-analysis-page bg-[#111111] text-white pt-24 min-h-screen flex flex-col font-sans">
        {user && !user.is_subscribed && user.trial_days_remaining > 0 && (
          <TrialBanner daysRemaining={user.trial_days_remaining} onUpgrade={() => setShowPaywall(true)} />
        )}

        {/* Top Header Bar */}
        <div className="sa-topbar bg-[#0D0D0D] text-white flex flex-wrap items-center justify-between px-6 py-3 border-b border-white/10 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/tools')}>
              <span className="w-8 h-8 rounded-xl bg-[#CCFF00] text-black font-black flex items-center justify-center text-xs shadow-sm">SA</span>
              <div>
                <h1 className="text-sm font-extrabold text-white leading-none">Site Intelligence Canvas</h1>
                <p className="text-[10px] text-[#CCFF00] font-bold">by Anvitam</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex items-center relative">
              <input
                type="text"
                className="bg-white/10 text-white placeholder-gray-400 text-xs px-4 py-2 rounded-full border border-white/15 focus:border-[#CCFF00] outline-none w-64 sm:w-80"
                placeholder="Search location, address, city…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Draw 3D Polygon Control */}
            <button
              onClick={toggleDrawMode}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isDrawMode
                  ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                  : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
              }`}
            >
              <Box size={14} /> Draw 3D Footprint
            </button>

            {/* View Layout Toggle (Bento vs Split) */}
            <div className="bg-white/10 p-1 rounded-full border border-white/15 flex items-center gap-1">
              <button
                onClick={() => setLayoutMode('bento')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === 'bento' ? 'bg-[#CCFF00] text-black' : 'text-gray-300 hover:text-white'
                }`}
              >
                <LayoutGrid size={13} /> Bento View
              </button>
              <button
                onClick={() => setLayoutMode('split')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === 'split' ? 'bg-[#CCFF00] text-black' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Columns size={13} /> Split View
              </button>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 hover:bg-[#CCFF00] hover:text-black text-white text-xs font-bold px-4 py-2 rounded-full transition border border-white/15 cursor-pointer"
            >
              📊 Studio Dashboard
            </button>

            {user ? (
              <div
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-1.5 rounded-full cursor-pointer transition"
              >
                <div className="text-xs font-bold text-[#CCFF00] flex items-center gap-1">
                  <Zap size={14} />
                  <span>{user.is_subscribed ? 'Pro Member (250/mo)' : `${user.credits_remaining ?? 5} credits`}</span>
                </div>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#CCFF00] text-black font-extrabold text-xs flex items-center justify-center">
                    {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-white hidden sm:inline">{user.name || user.email.split('@')[0]}</span>
                </div>
              </div>
            ) : (
              <button
                className="bg-[#CCFF00] text-black font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition cursor-pointer"
                onClick={() => { setAuthMode('login'); setShowAuth(true); }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Category Selector Bar */}
        <div className="bg-[#141414] border-b border-white/10 px-6 py-2 flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                category === cat.id ? 'bg-[#CCFF00] text-black shadow-sm' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* WORKSPACE LAYOUT (BENTO MODE: Globe on top + Bento grid below) */}
        {layoutMode === 'bento' ? (
          <div className="flex-1 flex flex-col">
            {/* Top Globe Section */}
            <div className="w-full h-[55vh] relative bg-[#0A0A0A] border-b border-white/10">
              {noMapbox ? (
                <div className="h-full flex flex-col items-center justify-center text-white">
                  <p>Mapbox Token Required</p>
                </div>
              ) : (
                <div ref={mapContainerRef} className="w-full h-full" />
              )}

              {/* Map Style Selector Overlay */}
              <div className="absolute top-4 left-4 z-20 bg-black/80 text-white backdrop-blur-md rounded-2xl p-1.5 border border-white/20 flex items-center gap-1 shadow-lg">
                <span className="text-[10px] font-bold text-gray-400 px-2 flex items-center gap-1">
                  <Layers size={12} /> Map Style:
                </span>
                <select
                  value={currentMapStyle}
                  onChange={(e) => changeMapStyle(e.target.value)}
                  className="bg-white/10 text-white text-xs font-bold rounded-xl px-2.5 py-1 border border-white/20 outline-none cursor-pointer hover:bg-white/20"
                >
                  {MAP_STYLES.map(st => (
                    <option key={st.id} value={st.url} className="bg-[#111111] text-white">
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Floating Pin Confirmation CTA Card */}
              {pendingCoords && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#111111] text-white p-4 rounded-3xl border border-[#CCFF00]/40 shadow-2xl flex flex-col sm:flex-row items-center gap-4 max-w-lg w-11/12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center font-bold shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">
                        {pendingCoords.placeName || `Site Lat: ${pendingCoords.lat.toFixed(4)}°, Lon: ${pendingCoords.lon.toFixed(4)}°`}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {isAnalyzed ? '✅ Site analysis report active below' : 'Click below to generate 11+ site diagrams'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={executeSiteAnalysis}
                    disabled={loading}
                    className="bg-[#CCFF00] text-black hover:bg-white font-extrabold text-xs px-5 py-3 rounded-2xl transition shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Zap size={14} className="fill-black" />
                    {loading ? 'Analyzing Site...' : 'Run Analysis (1 Credit)'}
                  </button>
                </div>
              )}
            </div>

            {/* 3D Solar Shadow Simulator Controls bar */}
            <div className="bg-[#141414] border-b border-white/10 px-6 py-4">
              <ShadowSimulator3D
                lat={pendingCoords?.lat ?? 22.3072}
                lon={pendingCoords?.lon ?? 73.1812}
                buildingHeightMeters={buildingHeightM}
              />
            </div>

            {/* Bottom Bento Analysis Grid Section */}
            <div className="bg-[#111111] flex-1 pb-16">
              <AnalysisPanel
                result={analysisResult}
                loading={loading}
                category={category}
                onShare={handleShare}
                layoutMode="bento"
                activeToolFilter={toolParam}
                onSelectPresetLocation={handleSelectPresetLocation}
              />
            </div>
          </div>
        ) : (
          /* SPLIT MODE */
          <div className="flex-1 flex overflow-hidden relative h-[calc(100vh-8rem)]">
            <div className="flex-1 relative h-full">
              <div ref={mapContainerRef} className="w-full h-full" />
              {pendingCoords && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#111111] text-white p-4 rounded-3xl border border-[#CCFF00]/40 shadow-2xl flex items-center gap-4">
                  <button
                    onClick={executeSiteAnalysis}
                    disabled={loading}
                    className="bg-[#CCFF00] text-black font-black text-xs px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Zap size={14} className="fill-black" />
                    {loading ? 'Analyzing...' : 'Run Analysis (1 Credit)'}
                  </button>
                </div>
              )}
            </div>

            <div
              onMouseDown={handleMouseDownResizer}
              className={`w-2 bg-gray-700 hover:bg-[#CCFF00] cursor-col-resize z-30 transition ${isDraggingResizer ? 'bg-[#CCFF00]' : ''}`}
            />

            <div className="h-full bg-[#111111] border-l border-white/10 overflow-y-auto" style={{ width: `${panelWidth}px` }}>
              <AnalysisPanel
                result={analysisResult}
                loading={loading}
                category={category}
                onShare={handleShare}
                layoutMode="split"
                activeToolFilter={toolParam}
                onSelectPresetLocation={handleSelectPresetLocation}
              />
            </div>
          </div>
        )}

        {copied && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-[#CCFF00] border border-[#CCFF00]/40 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl animate-bounce">
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
          creditsRemaining={user?.credits_remaining ?? 5}
          onClose={() => setShowPaywall(false)}
          onUseFreeTrial={() => setShowPaywall(false)}
          onSubscribe={(plan) => {
            const checkoutUrl = plan === 'monthly' 
              ? 'https://checkout.dodopayments.com/buy/pdt_0NlZ5wDhqx68MxeHE06JE?quantity=1'
              : 'https://checkout.dodopayments.com/buy/pdt_0NlZ5UEJiErzLixmkxbda?quantity=1';
            window.open(`${checkoutUrl}&email=${encodeURIComponent(user?.email || '')}`, '_blank');
          }}
          onLogin={() => { setShowPaywall(false); setAuthMode('register'); setShowAuth(true); }}
        />
      </div>
    </>
  );
}
