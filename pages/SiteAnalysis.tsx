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
import { getToolUser, getOrCreateDefaultToolUser, logoutToolUser, deductUserCredit, isUserAdmin, type ToolUser } from '../utils/userAuth';
import { TOOLS_SUITE } from '../constants/toolsData';
import StickyConsultationBar from '../components/StickyConsultationBar';
import * as SunCalc from 'suncalc';
import {
  MapPin, Layers, Zap, Box, Search, Check, Share2, Globe,
  Menu, ArrowLeft, Home, Building, Trees, Wand2, Trash2, Sliders, LogOut, Settings,
  Maximize2, Minimize2, Navigation, ChevronDown, ChevronUp, X, Loader2,
  Sun, Play, Pause, RefreshCw, Clock, Calendar
} from 'lucide-react';

const FALLBACK_MAPBOX_TOKEN = typeof window !== 'undefined' ? atob('cGsuZXlKMUlqb2lZVzUyYVhSaGJTSXNJbUVpT2lKamJYUTBaR1Z0YjJFd1kySTJNbnB6T1dZeWVYUm9NV0Z4SW4wLmZoUXY1SFdHR0FNdktucHljY0R2dHc=') : '';
const MAPBOX_TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN && import.meta.env.VITE_MAPBOX_TOKEN.trim().length > 10)
  ? import.meta.env.VITE_MAPBOX_TOKEN.trim()
  : FALLBACK_MAPBOX_TOKEN;

// Mapbox GL JS v3 Standard 3D Styles
const MAPBOX_3D_STYLES = [
  {
    id: 'standard-3d',
    name: '🏙️ 3D Photorealistic City (Mapbox Standard)',
    style: 'mapbox://styles/mapbox/standard'
  },
  {
    id: 'satellite-3d',
    name: '🌐 3D High-Res Satellite Globe (Mapbox Satellite)',
    style: 'mapbox://styles/mapbox/satellite-streets-v12'
  },
  {
    id: 'streets-3d',
    name: '🏢 3D Google/Mapbox Style (3D Extruded Streets)',
    style: 'mapbox://styles/mapbox/streets-v12'
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

// Clean 2D Tile Layers (Free, No API Key Required)
const LEAFLET_2D_STYLES = [
  { id: 'satellite-2d', name: '🛰️ 2D High-Res Satellite (Esri)', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', maxZoom: 19, attribution: 'Tiles &copy; Esri' },
  { id: 'streets-2d', name: '🏢 2D OpenStreetMap Streets', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19, attribution: '&copy; OpenStreetMap' }
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

  // Mobile, Fullscreen & Card State
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [isCardCollapsed, setIsCardCollapsed] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Unified Settings Card Tabs ('typology' | 'solar')
  const [activeCardTab, setActiveCardTab] = useState<'typology' | 'solar'>('typology');

  // Integrated 3D Solar Shadow Simulator Telemetry State
  const [solarHour, setSolarHour] = useState<number>(14);
  const [solarSeason, setSolarSeason] = useState<'summer' | 'equinox' | 'winter'>('summer');
  const [isSolarPlaying, setIsSolarPlaying] = useState<boolean>(false);
  const [solarData, setSolarData] = useState<{
    azimuthDeg: number;
    altitudeDeg: number;
    shadowLengthMultiplier: number;
    solarRadiationKwh: number;
  }>({ azimuthDeg: 176, altitudeDeg: 90, shadowLengthMultiplier: 1, solarRadiationKwh: 6.5 });

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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchFormRef = useRef<HTMLFormElement>(null);

  // Detect Mobile Viewport
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive Map Resize Trigger on Fullscreen or Drawer Toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapboxRef.current) {
        try { mapboxRef.current.resize(); } catch { /* silent */ }
      }
      if (leafletRef.current) {
        try { leafletRef.current.invalidateSize(); } catch { /* silent */ }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullscreenMap, isCardCollapsed]);

  // Unified Multi-Tier Geocoding Engine (Coordinates -> Mapbox POI -> Nominatim Fallback)
  const executeGeocoding = async (query: string): Promise<Array<{ lat: number; lon: number; display_name: string; short_name: string }>> => {
    const clean = query.trim();
    if (!clean) return [];

    // 1. Direct coordinate regex: "22.3072, 73.1812" or "22.3072 73.1812"
    const coordRegex = /^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/;
    const coordMatch = clean.match(coordRegex);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        return [{
          lat,
          lon,
          display_name: `Coordinates: ${lat.toFixed(5)}°, ${lon.toFixed(5)}°`,
          short_name: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
        }];
      }
    }

    // 2. High-precision Mapbox Geocoding (fast, global POIs, cities, landmarks)
    if (MAPBOX_TOKEN) {
      try {
        const mbRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(clean)}.json?access_token=${MAPBOX_TOKEN}&types=country,region,postcode,district,place,locality,neighborhood,address,poi&limit=5`);
        if (mbRes.ok) {
          const mbData = await mbRes.json();
          if (mbData.features && mbData.features.length > 0) {
            return mbData.features.map((f: any) => ({
              lat: f.center[1],
              lon: f.center[0],
              display_name: f.place_name,
              short_name: f.text || f.place_name.split(',')[0]
            }));
          }
        }
      } catch (err) {
        console.warn('[Mapbox Geocoding notice]', err);
      }
    }

    // 3. OpenStreetMap Nominatim Fallback
    try {
      const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&limit=5`);
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (nomData && nomData.length > 0) {
          return nomData.map((d: any) => ({
            lat: parseFloat(d.lat),
            lon: parseFloat(d.lon),
            display_name: d.display_name,
            short_name: d.display_name.split(',')[0]
          }));
        }
      }
    } catch (err) {
      console.warn('[Nominatim Geocoding error]', err);
    }

    return [];
  };

  // Live location autocomplete debouncer
  useEffect(() => {
    if (!searchInput.trim() || searchInput.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const results = await executeGeocoding(searchInput);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.warn('[Autocomplete error]', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchFormRef.current && !searchFormRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3D Shadow Simulation state
  const [buildingHeightM, setBuildingHeightM] = useState(12);

  // Dynamic Solar Shadow Telemetry & Mapbox Light Sync
  useEffect(() => {
    const numLat = pendingCoords?.lat ?? 22.3072;
    const numLon = pendingCoords?.lon ?? 73.1812;

    const year = new Date().getFullYear();
    let date = new Date(year, 5, 21); // summer solstice
    if (solarSeason === 'winter') date = new Date(year, 11, 21);
    if (solarSeason === 'equinox') date = new Date(year, 2, 21);

    date.setHours(Math.floor(solarHour), (solarHour % 1) * 60, 0, 0);

    const sunPos = SunCalc.getPosition(date, numLat, numLon);
    const azimuthDeg = Math.round(((sunPos.azimuth * 180) / Math.PI + 180) % 360);
    const rawAlt = (sunPos.altitude * 180) / Math.PI;
    const altitudeDeg = Math.max(0, Math.min(90, Math.round(rawAlt)));

    const radAlt = Math.max(0.05, Math.min(Math.PI / 2, sunPos.altitude));
    const shadowMult = Math.min(10, Math.max(0.1, 1 / Math.tan(radAlt)));
    const radKwh = altitudeDeg > 0 ? parseFloat((Math.sin(radAlt) * 6.5).toFixed(1)) : 0;

    setSolarData({
      azimuthDeg,
      altitudeDeg,
      shadowLengthMultiplier: parseFloat(shadowMult.toFixed(2)),
      solarRadiationKwh: radKwh,
    });

    if (mapEngine === '3d' && mapboxRef.current) {
      try {
        const lightPreset = altitudeDeg < 15 ? 'dusk' : altitudeDeg > 60 ? 'day' : 'dawn';
        (mapboxRef.current as any).setConfigProperty('basemap', 'lightPreset', lightPreset);
      } catch { /* silent */ }
    }
  }, [solarHour, solarSeason, pendingCoords, mapEngine]);

  // Solar Time-lapse animation loop
  useEffect(() => {
    let timer: any;
    if (isSolarPlaying) {
      timer = setInterval(() => {
        setSolarHour(prev => {
          if (prev >= 18.5) {
            setIsSolarPlaying(false);
            return 6;
          }
          return parseFloat((prev + 0.25).toFixed(2));
        });
      }, 250);
    }
    return () => clearInterval(timer);
  }, [isSolarPlaying]);

  const formatSolarTime = (h: number) => {
    const fullHours = Math.floor(h);
    const minutes = Math.round((h % 1) * 60);
    const period = fullHours >= 12 ? 'PM' : 'AM';
    const displayHours = fullHours % 12 === 0 ? 12 : fullHours % 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

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
        const mb = (mapboxgl as any).default || mapboxgl;
        if (mb && mb.supported && !mb.supported()) {
          console.warn('[Mapbox GL] WebGL context is not supported or disabled on this device/browser. Switching to 2D Leaflet engine.');
          setMapEngine('2d');
          return;
        }

        if (mb) mb.accessToken = MAPBOX_TOKEN;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const selectedObj = MAPBOX_3D_STYLES.find(s => s.id === mapboxStyleId) || MAPBOX_3D_STYLES[0];

        const MapConstructor = mb.Map || mapboxgl.Map;
        const map = new MapConstructor({
          container: mapContainerRef.current,
          style: selectedObj.style,
          center: [centerLon, centerLat],
          zoom: 15,
          pitch: 55,
          bearing: -15,
        });

        mapboxRef.current = map;

        const forceResize = () => {
          if (mapboxRef.current) {
            try { mapboxRef.current.resize(); } catch { /* silent */ }
          }
        };

        map.on('style.load', () => {
          forceResize();

          // Configure Mapbox Standard 3D features or 3D extrusions
          if (selectedObj.id === 'standard-3d') {
            try {
              (map as any).setConfigProperty('basemap', 'show3dObjects', true);
              (map as any).setConfigProperty('basemap', 'lightPreset', 'day');
            } catch { /* silent */ }
          } else {
            // Set sky/space fog atmosphere for non-standard styles
            try {
              map.setFog({
                'range': [0.8, 8],
                'color': '#dc4c4e',
                'horizon-blend': 0.05,
                'high-color': '#245b78',
                'space-color': '#0b0e14',
                'star-intensity': 0.15
              });
            } catch { /* silent */ }

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
          const NavControl = mb.NavigationControl || mapboxgl.NavigationControl;
          map.addControl(new NavControl({ visualizePitch: true }), 'top-right');
        } catch { /* silent */ }

        map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          positionMarker(lat, lng);
          setPendingCoords({ lat, lon: lng });
          setIsAnalyzed(false);
        });

        let isMapLoaded = false;
        let tokenRetryAttempted = false;
        let styleFallbackAttempted = false;

        map.on('load', () => {
          isMapLoaded = true;
          forceResize();
          requestAnimationFrame(forceResize);
          setTimeout(forceResize, 100);
          setTimeout(forceResize, 300);
          setTimeout(forceResize, 800);
          if (pendingCoords) positionMarker(pendingCoords.lat, pendingCoords.lon);
        });

        map.on('idle', () => {
          isMapLoaded = true;
          forceResize();
        });

        map.on('error', (e: any) => {
          console.warn('[Mapbox GL] Event notice:', e);
          const errMsg = String(e?.error?.message || e?.error || '');
          const status = e?.error?.status || e?.status;

          // Token auto-recovery: If Vercel environment variable token returned 401/403, retry with fallback token
          if (!tokenRetryAttempted && (status === 401 || status === 403 || errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('Forbidden') || errMsg.includes('Unauthorized'))) {
            tokenRetryAttempted = true;
            console.warn('[Mapbox GL] Authorization error. Retrying with production fallback token...');
            if (mb) mb.accessToken = FALLBACK_MAPBOX_TOKEN;
            mapboxgl.accessToken = FALLBACK_MAPBOX_TOKEN;
            try {
              map.setStyle(selectedObj.style);
            } catch { /* keep existing style */ }
            return;
          }

          // Style fallback: If Mapbox Standard fails to load, try streets-v12
          if (!styleFallbackAttempted && selectedObj.id === 'standard-3d') {
            styleFallbackAttempted = true;
            console.warn('[Mapbox GL] Standard 3D engine failed. Switching to 3D Streets style...');
            try {
              map.setStyle('mapbox://styles/mapbox/streets-v12');
              return;
            } catch { /* silent */ }
          }
        });

        resizeObserver = new ResizeObserver(() => {
          forceResize();
        });
        if (mapContainerRef.current) {
          resizeObserver.observe(mapContainerRef.current);
        }
      } catch (err) {
        console.warn('Mapbox 3D init error:', err);
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
        if (mapboxRef.current.setProjection) {
          mapboxRef.current.setProjection('globe');
        }
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
        if (mapboxRef.current.setProjection) {
          mapboxRef.current.setProjection('mercator');
        }
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

  const positionMarker = (lat: number, lon: number, placeName?: string) => {
    const isMobileView = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

    if (mapEngine === '3d' && mapboxRef.current) {
      const map = mapboxRef.current;

      if (mapboxMarkerRef.current) {
        mapboxMarkerRef.current.remove();
      }

      const el = document.createElement('div');
      el.className = 'map-pin';
      el.innerHTML = `<div class="pin-dot"></div><div class="pin-pulse"></div>`;

      const mb = (mapboxgl as any).default || mapboxgl;
      const MarkerConstructor = mb.Marker || mapboxgl.Marker;
      const marker = new MarkerConstructor({ element: el, anchor: 'bottom' })
        .setLngLat([lon, lat])
        .addTo(map);

      if (placeName) {
        const PopupConstructor = mb.Popup || mapboxgl.Popup;
        const popup = new PopupConstructor({ offset: 25, closeButton: false, className: 'site-pin-popup' })
          .setHTML(`<div style="font-family:sans-serif;font-size:11px;font-weight:700;color:#111;padding:2px 4px;">📍 ${placeName.split(',')[0]}</div>`);
        marker.setPopup(popup);
        popup.addTo(map);
      }

      mapboxMarkerRef.current = marker;

      // Crucial: offset camera center so the target marker is clearly visible in the upper visible area above the bottom UI
      map.flyTo({
        center: [lon, lat],
        zoom: 16.5,
        pitch: 55,
        bearing: -15,
        offset: [0, isMobileView ? -90 : -50],
        duration: 1200
      });
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
      if (placeName) {
        marker.bindPopup(`<div style="font-family:sans-serif;font-size:11px;font-weight:700;color:#111;">📍 ${placeName.split(',')[0]}</div>`).openPopup();
      }
      leafletMarkerRef.current = marker;

      leafletRef.current.setView([lat, lon], 16, { animate: true });
      setTimeout(() => {
        if (leafletRef.current) {
          leafletRef.current.panBy([0, isMobileView ? 90 : 50], { animate: true });
        }
      }, 250);
    }
  };

  const selectLocation = (lat: number, lon: number, placeName?: string) => {
    positionMarker(lat, lon, placeName);
    setPendingCoords({ lat, lon, placeName });
    setIsAnalyzed(false);
    if (placeName) {
      setSearchInput(placeName.split(',')[0]);
    }
    setShowSuggestions(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        selectLocation(lat, lon, 'My Current Location');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not retrieve your location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const executeSiteAnalysis = async () => {
    if (!pendingCoords) return;
    const { lat, lon } = pendingCoords;

    const deduction = deductUserCredit();
    if (!deduction.success) {
      setShowPaywall(true);
      return;
    }
    if (deduction.user) {
      setUser(deduction.user);
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
      const result = await fetchAllSiteData(lat, lon, MAPBOX_TOKEN, category);
      setAnalysisResult(result);
      setIsAnalyzed(true);
    } catch (err) {
      console.error('Site analysis fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPresetLocation = (lat: number, lon: number, name: string) => {
    selectLocation(lat, lon, name);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setIsSearchingSuggestions(true);
    try {
      const results = await executeGeocoding(searchInput);
      if (results.length > 0) {
        const first = results[0];
        selectLocation(first.lat, first.lon, first.display_name);
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    } finally {
      setIsSearchingSuggestions(false);
    }
  };

  const handleCategoryChange = async (cat: DesignCategory) => {
    setCategory(cat);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('category', cat);
      return p;
    }, { replace: true });

    // If already analyzed and coords present, immediately re-tune analysis for new typology
    if (isAnalyzed && pendingCoords) {
      setLoading(true);
      try {
        const result = await fetchAllSiteData(pendingCoords.lat, pendingCoords.lon, MAPBOX_TOKEN, cat);
        setAnalysisResult(result);
      } catch (err) {
        console.error('Category re-fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
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

      <div className="site-analysis-page bg-white text-[#111111] pt-20 min-h-screen flex flex-col font-sans antialiased">
        
        <div className="flex-1 flex flex-col overflow-visible">

          {/* ── MAIN STUDIO CANVAS ── */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Unified Topbar inside canvas with Hamburger, Title, Credit Pill, Settings & Logout */}
            <div className="sa-topbar no-print bg-white text-gray-900 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-gray-200/80 shadow-2xs flex flex-row items-center justify-between gap-2 z-20 relative">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowToolsDrawer(true)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-black text-[#CCFF00] hover:bg-gray-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs shrink-0"
                  title="Open All 21+ Tools Drawer"
                  aria-label="Open All 21+ Tools Drawer"
                >
                  <Menu size={15} />
                  <span className="hidden xs:inline">All Tools</span>
                </button>

                <div
                  className="flex items-center gap-2 cursor-pointer min-w-0"
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
                  <span className="w-7 h-7 rounded-lg bg-black text-[#CCFF00] font-semibold flex items-center justify-center text-xs shadow-2xs shrink-0">SA</span>
                  <div className="min-w-0">
                    <h1 className="text-xs sm:text-sm font-semibold text-gray-900 leading-none truncate">Site Intelligence Canvas</h1>
                    <p className="text-[10px] text-gray-500 font-medium hidden sm:block">Anvitam Studio</p>
                  </div>
                </div>
              </div>

              {/* Controls: Credit Pill, Settings, Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (user.is_admin || isUserAdmin()) {
                        setShowDashboardModal(true);
                      } else {
                        setShowPaywall(true);
                      }
                    }}
                    aria-label="View or top up available studio credits"
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#111111] text-[#CCFF00] border border-black text-xs font-semibold flex items-center gap-1 hover:bg-black transition cursor-pointer shadow-2xs"
                  >
                    {user.is_admin || isUserAdmin() ? (
                      <span className="truncate">👑 Admin</span>
                    ) : (
                      <>
                        <Zap size={13} className="fill-[#CCFF00] text-[#CCFF00]" />
                        <span>{user.credits_remaining} Cr</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAuth(true)}
                    aria-label="Sign in to Anvitam Studio"
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#CCFF00] text-black border border-black/10 text-xs font-semibold hover:bg-black hover:text-[#CCFF00] transition cursor-pointer shadow-2xs"
                  >
                    Sign In
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200/80 hover:border-gray-400 text-gray-700 hover:text-black transition cursor-pointer shadow-2xs"
                  title="Studio & Account Settings"
                  aria-label="Studio & Account Settings"
                >
                  <Settings size={16} />
                </button>

                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      logoutToolUser();
                      setUser(null);
                    }}
                    className="p-1.5 sm:p-2 rounded-xl bg-white border border-gray-200/80 hover:border-red-400 text-gray-600 hover:text-red-600 transition cursor-pointer shadow-2xs"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* 3D Map Container (Hidden during PDF print export) */}
            <div className={`no-print relative bg-gray-950 border-b border-gray-200 overflow-hidden transition-all duration-300 ${
              isFullscreenMap
                ? 'fixed inset-0 z-50 h-[100dvh] w-screen'
                : 'w-full h-[76vh] sm:h-[72vh] min-h-[520px] sm:min-h-[500px]'
            }`}>
              <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

              {/* Map Overlay Controls Header Bar */}
              <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
                <div className="bg-white/95 text-gray-900 backdrop-blur-md rounded-2xl p-1 sm:p-1.5 border border-gray-200 flex items-center gap-1.5 shadow-lg max-w-full overflow-x-auto no-scrollbar">
                  {/* 3D vs 2D Switcher */}
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 shrink-0">
                    <button
                      onClick={() => setMapEngine('3d')}
                      className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        mapEngine === '3d' ? 'bg-black text-[#CCFF00] shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="3D Globe & Extruded Buildings"
                    >
                      <Globe size={13} />
                      <span className="hidden xs:inline">{isMobile ? '3D City' : '3D Buildings'}</span>
                      <span className="xs:hidden">3D</span>
                    </button>
                    <button
                      onClick={() => setMapEngine('2d')}
                      className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        mapEngine === '2d' ? 'bg-black text-[#CCFF00] shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="2D High-Res Flat"
                    >
                      <Layers size={13} />
                      <span className="hidden xs:inline">{isMobile ? '2D Flat' : '2D High-Res'}</span>
                      <span className="xs:hidden">2D</span>
                    </button>
                  </div>

                  {/* Map Style Dropdown (Filtered, Cleaned of broken Positron layer) */}
                  <select
                    value={mapEngine === '3d' ? mapboxStyleId : leafletStyleId}
                    onChange={(e) => mapEngine === '3d' ? change3DStyle(e.target.value) : change2DStyle(e.target.value)}
                    className="bg-gray-100 text-gray-900 text-xs font-semibold rounded-xl px-2 py-1 border border-gray-200 outline-none cursor-pointer hover:bg-gray-200 max-w-[125px] sm:max-w-[180px] truncate shrink-0"
                    title="Select Map Style"
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

                  {/* 3D Quick View Shortcuts */}
                  {mapEngine === '3d' && (
                    <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-200 shrink-0">
                      <button
                        onClick={flyToGlobeSpaceView}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-200 transition cursor-pointer flex items-center gap-1"
                        title="Orbit / Earth Globe"
                      >
                        <span>🚀 Globe</span>
                      </button>
                      <button
                        onClick={flyTo3DBuildingSiteView}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-200 transition cursor-pointer flex items-center gap-1"
                        title="3D Building Site"
                      >
                        <span>🏢 3D Site</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Utility Buttons: Locate Me & Full Screen Toggle */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl bg-white/95 backdrop-blur-md text-gray-900 border border-gray-200/90 hover:bg-gray-100 transition shadow-lg cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Zoom to my GPS location"
                    aria-label="Zoom to my GPS location"
                  >
                    {isLocating ? <Loader2 size={14} className="animate-spin text-emerald-600" /> : <Navigation size={14} className="text-emerald-600" />}
                    <span className="hidden sm:inline">Locate Me</span>
                  </button>

                  <button
                    onClick={() => setIsFullscreenMap(prev => !prev)}
                    className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl backdrop-blur-md transition shadow-lg cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                      isFullscreenMap
                        ? 'bg-black text-[#CCFF00] border border-black'
                        : 'bg-white/95 text-gray-900 border border-gray-200/90 hover:bg-gray-100'
                    }`}
                    title={isFullscreenMap ? 'Exit Full Screen' : 'Full Screen Map'}
                    aria-label={isFullscreenMap ? 'Exit Full Screen' : 'Full Screen Map'}
                  >
                    {isFullscreenMap ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    <span className="hidden sm:inline">{isFullscreenMap ? 'Exit' : 'Full Screen'}</span>
                  </button>
                </div>
              </div>

              {/* Floating Confirmation & Typology Selection Card */}
              {isCardCollapsed ? (
                /* Minimized Collapsed Bar (Matches Image 2: Clean search bar, click anywhere or focus to re-open) */
                <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[94%] sm:w-11/12 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div 
                    onClick={() => setIsCardCollapsed(false)}
                    className="bg-white/95 backdrop-blur-md text-gray-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-gray-900 shadow-2xl flex items-center justify-between gap-2 cursor-pointer hover:bg-white hover:border-black transition group"
                  >
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setIsCardCollapsed(false);
                        handleSearch(e);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="relative flex-1 flex items-center min-w-0"
                    >
                      <input
                        type="text"
                        className="bg-transparent text-gray-900 placeholder-gray-500 text-xs sm:text-sm pl-2 pr-10 py-1 outline-none w-full font-normal"
                        placeholder="Search location or coordinates (lat, lon)..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onFocus={() => {
                          setIsCardCollapsed(false);
                          if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        aria-label="Search location or coordinates"
                      />
                      {searchInput && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchInput('');
                            setSuggestions([]);
                          }}
                          className="p-1 text-gray-400 hover:text-black transition mr-1"
                          title="Clear search"
                        >
                          <X size={13} />
                        </button>
                      )}
                      <button
                        type="submit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCardCollapsed(false);
                          handleSearch(e);
                        }}
                        aria-label="Execute search"
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-black text-[#CCFF00] hover:bg-gray-800 rounded-full transition cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                      >
                        <Search size={13} />
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCardCollapsed(false);
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition cursor-pointer flex items-center shrink-0"
                      title="Open Settings & Typology"
                      aria-label="Open Settings & Typology"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Expanded Studio HUD Card (Combined Image 3 & Image 4 Settings) */
                <div className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md text-gray-900 p-3 sm:p-4 rounded-3xl border border-gray-900 shadow-2xl flex flex-col gap-2.5 max-w-xl w-[94%] sm:w-11/12 animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Top Bar inside Card: Search Bar + Minimize Button */}
                  <div className="flex items-center gap-2">
                    <form onSubmit={handleSearch} ref={searchFormRef} className="relative flex-1">
                      <div className="relative w-full flex items-center">
                        <input
                          type="text"
                          className="bg-gray-100 text-gray-900 placeholder-gray-500 text-xs pl-3.5 pr-14 py-2 rounded-2xl border border-gray-200 focus:border-black focus:bg-white outline-none w-full font-normal transition"
                          placeholder="Search location or coordinates (lat, lon)..."
                          value={searchInput}
                          onChange={e => setSearchInput(e.target.value)}
                          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                          aria-label="Search location or coordinates"
                        />
                        <div className="absolute right-1 flex items-center gap-0.5">
                          {searchInput && (
                            <button
                              type="button"
                              onClick={() => { setSearchInput(''); setSuggestions([]); }}
                              className="p-1 text-gray-400 hover:text-black transition"
                              title="Clear search"
                            >
                              <X size={12} />
                            </button>
                          )}
                          <button
                            type="submit"
                            aria-label="Execute search"
                            className="p-1.5 bg-black text-[#CCFF00] hover:bg-gray-800 rounded-xl transition cursor-pointer flex items-center justify-center"
                          >
                            <Search size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Location Autocomplete Suggestions Dropdown (Floats Upwards) */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-left max-h-52 overflow-y-auto">
                          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Matching Locations</span>
                            {isSearchingSuggestions && <span className="animate-pulse text-amber-500">Searching…</span>}
                          </div>
                          {suggestions.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                selectLocation(item.lat, item.lon, item.display_name);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-gray-800 hover:bg-gray-100 flex items-start gap-2 border-b border-gray-100 last:border-0 transition cursor-pointer"
                            >
                              <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                              <div className="truncate">
                                <p className="font-semibold truncate text-gray-900">{item.short_name || item.display_name.split(',')[0]}</p>
                                <p className="text-[10px] text-gray-500 truncate">{item.display_name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </form>

                    {/* Minimize Card Button */}
                    <button
                      type="button"
                      onClick={() => setIsCardCollapsed(true)}
                      className="p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black transition shrink-0 cursor-pointer"
                      title="Minimize to search bar"
                      aria-label="Minimize to search bar"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {/* Combined Settings Tab Switcher (Image 3 & Image 4 Combined) */}
                  <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActiveCardTab('typology')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        activeCardTab === 'typology'
                          ? 'bg-black text-[#CCFF00] shadow-sm'
                          : 'text-gray-600 hover:text-black hover:bg-white/60'
                      }`}
                    >
                      <Building size={13} />
                      <span>Typology & Site</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCardTab('solar')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        activeCardTab === 'solar'
                          ? 'bg-black text-[#CCFF00] shadow-sm'
                          : 'text-gray-600 hover:text-black hover:bg-white/60'
                      }`}
                    >
                      <Sun size={13} className={activeCardTab === 'solar' ? 'text-[#CCFF00]' : ''} />
                      <span>3D Solar Simulator</span>
                    </button>
                  </div>

                  {/* TAB 1: Image 4 - Typology & Site Settings */}
                  {activeCardTab === 'typology' && (
                    <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
                      {/* Location Info Header */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-black text-[#CCFF00] flex items-center justify-center font-bold shrink-0 shadow-xs">
                            <MapPin size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {pendingCoords?.placeName || (pendingCoords ? `Site: ${pendingCoords.lat.toFixed(4)}°, ${pendingCoords.lon.toFixed(4)}°` : 'Click anywhere on 3D map or search above')}
                            </p>
                            <p className="text-[10px] text-gray-500 font-normal truncate">
                              {isAnalyzed ? '✅ Site analysis active · Select typology to recalculate' : 'Choose typology & run 14+ diagnostic site engines'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[9px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-2 py-0.5 rounded-full shrink-0">
                          {category}
                        </span>
                      </div>

                      {/* Typology Selector Pills */}
                      <div className="space-y-1 pt-1 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Select Typology:
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleCategoryChange(cat.id)}
                              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer whitespace-nowrap ${
                                category === cat.id
                                  ? 'bg-black text-[#CCFF00] shadow-xs'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <span className="text-xs">{cat.icon}</span>
                              <span>{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Trigger Button */}
                      <button
                        onClick={executeSiteAnalysis}
                        disabled={loading || !pendingCoords}
                        className={`w-full font-bold text-xs py-2.5 sm:py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                          !pendingCoords
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-black text-[#CCFF00] hover:bg-gray-800'
                        }`}
                      >
                        <Zap size={14} className={pendingCoords ? "fill-[#CCFF00]" : ""} />
                        <span>
                          {loading
                            ? 'Synthesizing 14+ Site Diagnostics...'
                            : !pendingCoords
                              ? 'Drop a Pin on 3D Map or Search to Analyze'
                              : isAnalyzed
                                ? `Re-Analyze for ${category.toUpperCase()} (1 Credit)`
                                : `Run Site Analysis for ${category.toUpperCase()} (${user?.is_admin || isUserAdmin() ? 'Free Admin' : '1 Credit'})`}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* TAB 2: Image 3 - 3D Solar Shadow Simulator */}
                  {activeCardTab === 'solar' && (
                    <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-black text-[#CCFF00] flex items-center justify-center font-bold shrink-0 shadow-xs">
                            <Sun size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-900 truncate">Phase 2: 3D Solar Shadow Simulator</span>
                              <span className="text-[9px] bg-black text-[#CCFF00] font-bold px-1.5 py-0.2 rounded-full">Interactive</span>
                            </div>
                            <p className="text-[10px] text-gray-500 truncate">Simulates solar rays, shadow casting & roof solar heat gain in real-time.</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsSolarPlaying(!isSolarPlaying)}
                          className="px-2.5 py-1 rounded-xl bg-black text-[#CCFF00] hover:bg-gray-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                        >
                          {isSolarPlaying ? <Pause size={12} /> : <Play size={12} className="fill-[#CCFF00]" />}
                          <span>{isSolarPlaying ? 'Pause' : 'Play Time-Lapse'}</span>
                        </button>
                      </div>

                      {/* Slider & Presets Box */}
                      <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
                        {/* Time of Day */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-medium text-gray-600 mb-1">
                            <span className="flex items-center gap-1 font-semibold text-gray-800">
                              <Clock size={12} /> Time of Day
                            </span>
                            <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-lg font-bold text-gray-900">
                              {formatSolarTime(solarHour)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="6"
                            max="19"
                            step="0.25"
                            value={solarHour}
                            onChange={(e) => setSolarHour(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                          />
                          <div className="flex justify-between text-[9px] text-gray-400 mt-1 font-medium">
                            <span>6:00 AM (Sunrise)</span>
                            <span>12:00 PM (Noon)</span>
                            <span>7:00 PM (Sunset)</span>
                          </div>
                        </div>

                        {/* Seasonal Presets */}
                        <div className="pt-1.5 border-t border-gray-200/60">
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-600 mb-1.5">
                            <Calendar size={11} /> Seasonal Preset:
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSolarSeason('summer')}
                              className={`py-1 px-1.5 rounded-xl text-[10px] font-bold transition truncate text-center cursor-pointer ${
                                solarSeason === 'summer'
                                  ? 'bg-black text-[#CCFF00] shadow-xs'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              Summer Solstice
                            </button>
                            <button
                              type="button"
                              onClick={() => setSolarSeason('equinox')}
                              className={`py-1 px-1.5 rounded-xl text-[10px] font-bold transition truncate text-center cursor-pointer ${
                                solarSeason === 'equinox'
                                  ? 'bg-black text-[#CCFF00] shadow-xs'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              Equinox
                            </button>
                            <button
                              type="button"
                              onClick={() => setSolarSeason('winter')}
                              className={`py-1 px-1.5 rounded-xl text-[10px] font-bold transition truncate text-center cursor-pointer ${
                                solarSeason === 'winter'
                                  ? 'bg-black text-[#CCFF00] shadow-xs'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              Winter Solstice
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4 Telemetry Metrics (Matching Image 3) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                        <div className="bg-gray-50 border border-gray-100 p-1.5 sm:p-2 rounded-xl">
                          <p className="text-[9px] uppercase font-bold text-gray-400">Sun Altitude</p>
                          <p className="text-sm font-extrabold text-gray-900">{solarData.altitudeDeg}°</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 p-1.5 sm:p-2 rounded-xl">
                          <p className="text-[9px] uppercase font-bold text-gray-400">Sun Azimuth</p>
                          <p className="text-sm font-extrabold text-gray-900">{solarData.azimuthDeg}°</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 p-1.5 sm:p-2 rounded-xl">
                          <p className="text-[9px] uppercase font-bold text-gray-400">Shadow Projection</p>
                          <p className="text-sm font-extrabold text-gray-900">~{solarData.shadowLengthMultiplier >= 10 ? '>10' : solarData.shadowLengthMultiplier}m</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 p-1.5 sm:p-2 rounded-xl">
                          <p className="text-[9px] uppercase font-bold text-gray-400">Solar Radiation</p>
                          <p className="text-sm font-extrabold text-emerald-600">{solarData.solarRadiationKwh} kWh/m²</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* 3D Solar Shadow Simulator (Hidden during PDF print export) */}
            <div className="no-print bg-gray-50 border-b border-gray-200 px-6 py-6 max-w-7xl mx-auto w-full">
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

        {/* Sticky CRO Consultation Dock */}
        <StickyConsultationBar
          title="Analyzed your plot? Review your solar & wind data with an expert."
          subtitle="Ar. Archana Gavas reviews your micro-climate report to optimize building orientation and water harvesting."
          ctaText="Book Site Review →"
        />
      </div>
    </>
  );
}
