// components/siteanalysis/AnalysisPanel.tsx — Master Architectural Analysis Grid with 14+ Analytical Cards
import React, { useState } from 'react';
import type { SiteAnalysisResult, DesignCategory } from '../../services/siteAnalysisService';
import { SolarCard } from './cards/SolarCard';
import { WindRoseCard } from './cards/WindRoseCard';
import { ClimateCard } from './cards/ClimateCard';
import { RainfallCard } from './cards/RainfallCard';
import { ThermalCard } from './cards/ThermalCard';
import { UrbanFabricCard } from './cards/UrbanFabricCard';
import { SoilCard } from './cards/SoilCard';
import { OrientationCard } from './cards/OrientationCard';
import { BioclimateCard } from './cards/BioclimateCard';
import { TopographyCard } from './cards/TopographyCard';
import { DirectionCard } from './cards/DirectionCard';
import { PlinthHydrologyCard } from './cards/PlinthHydrologyCard';
import { SwotCard } from './cards/SwotCard';
import { ContextualCard } from './cards/ContextualCard';
import { MapPin, Share2, Sparkles, SlidersHorizontal, Eye, Download, Printer, FileText, Check, Database, PenTool, Layers, Compass, Navigation } from 'lucide-react';

export type { DesignCategory };

interface Props {
  result: SiteAnalysisResult | null;
  loading: boolean;
  category: DesignCategory;
  onShare: () => void;
  layoutMode?: 'bento' | 'split';
  activeToolFilter?: string | null;
  onSelectPresetLocation?: (lat: number, lon: number, name: string) => void;
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 sm:p-10 max-w-7xl mx-auto">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200/80 animate-pulse space-y-4 shadow-xs">
        <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-36 bg-gray-100 rounded-2xl" />
        <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
      </div>
    ))}
  </div>
);

export const AnalysisPanel: React.FC<Props> = ({
  result,
  loading,
  category,
  onShare,
  activeToolFilter,
  onSelectPresetLocation,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(activeToolFilter || 'all');
  const [prdExported, setPrdExported] = useState(false);

  if (!result && !loading) {
    return (
      <div className="p-4 sm:p-10 bg-white text-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs max-w-4xl mx-auto my-3 sm:my-8 text-center">
        <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-black text-[#CCFF00] font-bold text-xl sm:text-2xl flex items-center justify-center mx-auto mb-3 sm:mb-5 shadow-xs">
          <MapPin size={22} className="sm:w-8 sm:h-8" />
        </div>
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full inline-block mb-2 sm:mb-3">
          Interactive Site Intelligence
        </span>
        <h3 className="text-lg sm:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2 tracking-tight">
          Drop a Pin on 3D Map to Begin Analysis
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto mb-4 sm:mb-8 leading-relaxed font-normal">
          Click anywhere on the 3D map above or search an address to generate 14+ high-precision architectural site diagrams tailored for {category} development.
        </p>

        {/* Preset Locations Quick Buttons */}
        <div className="mb-4 sm:mb-8 pt-4 sm:pt-6 border-t border-gray-100">
          <p className="text-[11px] sm:text-xs font-bold text-gray-500 mb-2.5 sm:mb-3 uppercase tracking-wider">Try Sample Global Locations:</p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5">
            {[
              { name: 'Vadodara, India', lat: 22.3072, lon: 73.1812 },
              { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
              { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
              { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
              { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 }
            ].map(loc => (
              <button
                key={loc.name}
                onClick={() => onSelectPresetLocation && onSelectPresetLocation(loc.lat, loc.lon, loc.name)}
                className="bg-gray-100 hover:bg-black hover:text-[#CCFF00] text-gray-800 text-xs font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-gray-200 transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
              >
                <MapPin size={12} /> {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Available Modules Badges */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 pt-1 sm:pt-2">
          {['🧭 Direction & Space Zoning', '🌊 Plinth Level & Hydrology', '📊 SWOT Matrix', '🗺️ Spatial Neighborhood POIs', '☀️ Solar Path 3D', '💨 Wind Rose', '🧱 SoilGrids', '🏢 Urban Fabric', '🌡️ Thermal Comfort'].map(f => (
            <span key={f} className="text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-gray-200/60">
              {f}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;
  if (!result) return null;

  const r = result;

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportPRDDossier = () => {
    const prdContent = `# Architectural & Ecological Site Intelligence PRD Dossier
**Project Location**: ${r.place_name}
**Coordinates**: ${r.location.lat.toFixed(4)}° N, ${r.location.lon.toFixed(4)}° E
**Elevation**: ${r.elevation_m}m AMSL (SRTM DEM Regional Model)
**Target Typology**: ${category.toUpperCase()}
**Lead Architect**: Ar. Archana Gavas (Founder & Principal Architect, Anvitam Studio)
**Studio URL**: https://www.anvitam.com
**Date Generated**: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

## 0. Spatial Intelligence Methodology: 4-Step GIS Workflow (Data to Decisions)
*Authoritative geographic, bioclimatic & topological workflow applied to this parcel:*

1. **Step 1: Load Spatial Data**
   - **DEM Elevation Model**: NASA SRTM 90m Digital Elevation Model (Terrain contours & hypsometry)
   - **Atmospheric Reanalysis**: ECMWF ERA5 5-Year Climatological Archive & Hourly Solar Irradiance
   - **SoilGrids Geotechnical**: ISRIC World Soil Information (250m global soil texture & permeability)
   - **Vector Base Layers**: OpenStreetMap Road Networks, parcel polygons & civic spatial layers

2. **Step 2: Digitizing & Feature Extraction**
   - **GPS Datum Point**: ${r.location.lat.toFixed(4)}° N, ${r.location.lon.toFixed(4)}° E
   - **Access Road Alignment**: Primary & secondary access corridors (${r.contextual?.road_connectivity?.access_road_type || 'Local Access'})
   - **Canopy Polygons**: Vegetative green cover & tree density (${r.contextual?.green_cover_pct}% canopy)
   - **Civic POI Buffers**: Civic, transit, and social infrastructure within 1km radius

3. **Step 3: Spatial & Bioclimatic Analysis**
   - **Solar Vault Ephemeris**: SunCalc Solar Altitude (${r.solar.sun_altitude_noon}°) & Solstice Arcs
   - **16-Sector Polar Wind Rose**: Prevailing Vector (${r.wind_rose.dominant_direction} at ${r.wind_rose.dominant_speed} km/h)
   - **Hydrological Sizing**: 50mm Design Storm Detention (~${r.plinth_hydrology?.storm_detention_m3_per_100m2 || 4.3} m³/100m²)
   - **Slope & Earthwork Grading**: Hypsometric contour profiling & natural gravity drainage vectors

4. **Step 4: Layout Design & Cartography**
   - **Cartographic Elements**: True North Arrow (0° Azimuth), Metric Scale Bar, Symbology Legend
   - **Masterplanning Synthesis**: Typology-specific zoning for ${category.toUpperCase()} development
   - **Architectural Certification**: Reviewed by Ar. Archana Gavas (Founder & Principal Architect)
   - *"Better Spatial Data · Resilient Ecological Architecture"*

---

## 1. 7-Layer Site Intelligence Matrix & Data Provenance

| Layer | Domain | Key Metric / Parameter | Confidence Level & Provenance | Field Verification Required |
|---|---|---|---|---|
| **Layer 1** | Location & Boundary | ${r.location.lat.toFixed(4)}° N, ${r.location.lon.toFixed(4)}° E | 🟢 **High** (Authoritative GPS) | Plot boundary / cadastral check |
| **Layer 2** | Climate & Normals | ${r.climate?.koppen_zone} (${r.climate?.koppen_label}) · ~${r.climate?.annual_rain_total}mm normal | 🟡 **Medium** (ERA5 5-yr gridded archive) | IMD station cross-check |
| **Layer 3** | Solar Vault Geometry | Today Noon Alt: ${r.solar.sun_altitude_noon}° · Summer: ${r.solar.summer_solstice_noon_alt}° · Winter: ${r.solar.winter_solstice_noon_alt}° | 🟢 **High** (Astronomical SunCalc ±0.1°) | Obstruction survey (trees/walls) |
| **Layer 4** | Terrain & Topography | ${r.elevation_m}m AMSL Regional Gradient | 🟡 **Medium** (SRTM 90m DEM) | **Mandatory DGPS Total Station Survey** |
| **Layer 5** | Hydrology & Drainage | 50mm storm detention: ~${r.plinth_hydrology?.storm_detention_m3_per_100m2 || 4.3} m³/100m² · Peak Rain: ${r.plinth_hydrology?.peak_monthly_rain_mm}mm | 🔴 **Provisional Estimate** (Regional model) | **Percolation / Infiltration Field Test** |
| **Layer 6** | Soil & Geotechnical | ${r.soil.soil_texture} · pH ~${r.soil.ph} · BD ~${r.soil.bulk_density} kg/m³ · Organic Carbon ~${r.soil.organic_carbon} g/kg | 🔴 **Provisional Estimate** (ISRIC SoilGrids 250m) | **Geotechnical Borehole & Soil Lab Test** |
| **Layer 7** | Landscape & Zoning | ET₀ Summer: ${r.climate.et_rate_summer_mm_day} mm/d · Agro Zone: ${r.climate.agro_climatic_zone} | 🟡 **Inferred Architectural Guidance** | Native planting selection & water budget |

---

## 2. Solar Orientation & Tropic of Cancer Analysis
- **Optimal Building Axis**: ${r.direction?.optimal_facade}
- **Summer Solstice (June 21)**: Sunrise Azimuth ${r.solar.solstice_summer.rise_az}° · Noon Sun Altitude ${r.solar.summer_solstice_noon_alt}° · Sunset Azimuth ${r.solar.solstice_summer.set_az}°
- **Winter Solstice (Dec 21)**: Sunrise Azimuth ${r.solar.solstice_winter.rise_az}° · Noon Sun Altitude ${r.solar.winter_solstice_noon_alt}° · Sunset Azimuth ${r.solar.solstice_winter.set_az}°
- **Equinox (March 21 / Sept 21)**: Noon Sun Altitude ${r.solar.equinox_noon_alt}°
- **Solar Geometry Guidance**: ${r.solar.is_sub_tropical_north ? 'Sub-Tropic of Cancer latitude: Midday sun crosses into northern sky during May-July. North facades require horizontal overhangs as well as South.' : 'Standard northern hemisphere solar geometry. Primary glazing facing South with horizontal overhangs.'}

---

## 3. Hydrology, Plinth Benchmark & Storm Sizing
- **Suggested Plinth Benchmark**: +${r.plinth_hydrology?.recommended_plinth_mm} mm (${r.plinth_hydrology?.recommended_plinth_inches}) above adjacent road crown (Provisional)
- **Rainwater Capture Potential**: ~${r.plinth_hydrology?.harvest_liters_per_m2_annual} L/m² of roof area annually (assuming 85% runoff coefficient)
- **Design Storm Detention Volume**: ~${r.plinth_hydrology?.storm_detention_m3_per_100m2} m³ per 100m² catchment area for a 50mm downpour
- **Damp Proof Course (DPC) Specification**: ${r.plinth_hydrology?.dpc_specification}
- **Runoff Management**: Sizing based on peak monthly rainfall (${r.plinth_hydrology?.peak_monthly_rain_mm}mm). Detailed drainage paths require topographic flow accumulation modeling.

---

## 4. Architectural SWOT Synthesis (${category.toUpperCase()})

### Strengths (Site Advantages)
${r.swot?.strengths?.map(s => `- **${s.title}** (${s.tag}): ${s.desc}`).join('\n')}

### Weaknesses (Microclimate Constraints)
${r.swot?.weaknesses?.map(w => `- **${w.title}** (${w.tag}): ${w.desc}`).join('\n')}

### Opportunities (Passive Design Interventions)
${r.swot?.opportunities?.map(o => `- **${o.title}** (${o.tag}): ${o.desc}`).join('\n')}

### Threats (Environmental & Structural Risks)
${r.swot?.threats?.map(t => `- **${t.title}** (${t.tag}): ${t.desc}`).join('\n')}

---

## 5. Contextual Spatial Neighborhood
- **Green Cover**: ${r.contextual?.green_cover_pct}% (${r.contextual?.tree_canopy_density})
- **Road Access**: ${r.contextual?.road_connectivity?.access_road_type} (${r.contextual?.road_connectivity?.rating})
- **Nearby POIs / Civic Amenities**: ${r.contextual?.amenities?.map(a => `${a.name} (${a.distance_m}m)`).join(', ') || 'Local markets and services within 1km'}
- **Transit Connectivity**: ${r.contextual?.railway_transit?.name} (~${r.contextual?.railway_transit?.distance_km} km)

---

## 6. Ground Truth Verification & Architectural Consultation
> **Important Disclaimer**: This dossier provides preliminary AI-assisted bioclimatic & spatial intelligence. Final structural levels, plinth FFL, foundation design, and planting palette must be cross-verified against a certified DGPS contour survey and on-site soil lab tests before construction.

**Consultation & Masterplanning Review**:
- **Lead Architect**: Ar. Archana Gavas
- **Studio**: Anvitam Ecological Design & Architecture Studio
- **Website**: https://www.anvitam.com
- **Booking**: https://topmate.io/archanagavas
- **Email**: archana@anvitam.com
`;

    const blob = new Blob([prdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (r.place_name || 'Site').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${cleanName}_Architectural_PRD_Report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPrdExported(true);
    setTimeout(() => setPrdExported(false), 2500);
  };

  // Harmoniously ordered Bento Grid cards to eliminate all column whitespace voids
  const allCardsMap: Record<string, { title: string; element: React.ReactNode }> = {
    'direction': { title: 'Cardinal Direction & Space Layout', element: <DirectionCard key="direction" data={r.direction} category={category} /> },
    'plinth': { title: 'Plinth Level & Flood Hydrology', element: <PlinthHydrologyCard key="plinth" data={r.plinth_hydrology} /> },
    'solar': { title: '3D Solar Path & SunCalc', element: <SolarCard key="solar" data={r.solar} lat={r.location.lat} /> },
    'swot': { title: 'Architectural SWOT Matrix', element: <SwotCard key="swot" data={r.swot} category={category} /> },
    'wind': { title: 'Wind Rose & Airflow Vectors', element: <WindRoseCard key="wind" data={r.wind_rose} /> },
    'contextual': { title: 'Contextual Neighborhood Ecosystem', element: <ContextualCard key="contextual" data={r.contextual} /> },
    'climate': { title: 'Köppen Climate Classification', element: <ClimateCard key="climate" data={r.climate} /> },
    'soil': { title: 'SoilGrids Geotechnical Profile', element: <SoilCard key="soil" data={r.soil} /> },
    'thermal': { title: 'Thermal Comfort & Degree Days', element: <ThermalCard key="thermal" data={r.thermal} /> },
    'rain': { title: 'Hydrology & Rainwater Catchment', element: <RainfallCard key="rain" data={r.climate} /> },
    'urban': { title: 'Urban Fabric & Density', element: <UrbanFabricCard key="urban" data={r.urban} /> },
    'orientation': { title: 'Optimal Building Orientation', element: <OrientationCard key="orientation" data={r.solar} lat={r.location.lat} /> },
    'bioclimate': { title: 'Bioclimatic Passive Matrix', element: <BioclimateCard key="bioclimate" data={r.climate} /> },
    'topo': { title: 'Topography Elevation & Slopes', element: <TopographyCard key="topo" elevation={r.elevation_m} lat={r.location.lat} lon={r.location.lon} /> },
  };

  const renderBentoGrid = () => {
    if (selectedFilter !== 'all') {
      return (
        <div className="max-w-2xl mx-auto w-full">
          {allCardsMap[selectedFilter]?.element || Object.values(allCardsMap)[0]?.element}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {/* Column 1: Solar Vault & Orientation */}
        <div className="flex flex-col gap-5 w-full">
          {allCardsMap['solar']?.element}
          {allCardsMap['orientation']?.element}
          {allCardsMap['direction']?.element}
          {allCardsMap['bioclimate']?.element}
        </div>

        {/* Column 2: Wind, Microclimate & Urban Density */}
        <div className="flex flex-col gap-5 w-full">
          {allCardsMap['wind']?.element}
          {allCardsMap['climate']?.element}
          {allCardsMap['thermal']?.element}
          {allCardsMap['urban']?.element}
          {allCardsMap['contextual']?.element}
        </div>

        {/* Column 3: Topography, Hydrology & Geotechnical Strategy */}
        <div className="flex flex-col gap-5 w-full">
          {allCardsMap['plinth']?.element}
          {allCardsMap['topo']?.element}
          {allCardsMap['rain']?.element}
          {allCardsMap['soil']?.element}
          {allCardsMap['swot']?.element}
        </div>
      </div>
    );
  };

  return (
    <div className="analysis-panel p-6 sm:p-10 space-y-8 max-w-7xl mx-auto relative">

      {/* ── SUBTLE ELEGANT STUDIO MANDALA EMBLEM WATERMARK FOR PRINT/PDF DOSSIER ── */}
      <div className="hidden print:flex print-page-watermark" aria-hidden="true">
        <img src="/watermark.png" alt="Anvitam Watermark" className="w-[440px] h-[440px] object-contain opacity-10" />
      </div>

      {/* ── PRINT-ONLY CLIENT DOSSIER COVER HEADER (Visible exclusively in Print / PDF) ── */}
      <div className="hidden print:block mb-8 border-b-2 border-black pb-6 space-y-4">
        {/* Studio Branding & Lead Architect Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Anvitam Studio Logo"
              className="w-11 h-11 object-contain rounded-xl p-0.5 bg-white border border-gray-200 shadow-2xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-gray-900">ANVITAM STUDIO</span>
                <span className="text-[10px] bg-black text-[#CCFF00] font-bold px-2 py-0.5 rounded uppercase">
                  Bioclimatic &amp; Ecological Architecture
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5 font-normal leading-relaxed">
                Regenerative Masterplanning · Microclimate Modeling · Landscape Intelligence · anvitam.com
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end shrink-0 pl-4">
            <p className="text-sm font-bold text-gray-900 leading-tight">Ar. Archana Gavas</p>
            <p className="text-[11px] text-gray-600 font-medium leading-tight mt-0.5">Founder &amp; Principal Architect</p>
            <p className="text-[11px] text-gray-700 font-normal leading-tight mt-0.5">ar.archanagavas@gmail.com</p>
            <p className="text-[10px] text-gray-400 font-normal leading-tight mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Project & Typology Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-gray-100 border border-gray-300 px-2.5 py-0.5 rounded-full">
              Typology: {category.toUpperCase()}
            </span>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
              Site Intelligence Dossier
            </span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight">{r.place_name}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-1 pt-1 border-t border-gray-200">
            <p className="text-xs font-mono text-gray-700">
              Coordinates: {r.location.lat.toFixed(4)}° N, {r.location.lon.toFixed(4)}° E · Elevation: {r.elevation_m}m AMSL · Climate: {r.climate?.koppen_zone} ({r.climate?.koppen_label})
            </p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-gray-800 bg-gray-50 px-3 py-1 rounded-xl border border-gray-300">
              <span className="font-bold flex items-center gap-1 text-red-700">▲ TRUE NORTH (0°)</span>
              <span>|</span>
              <span>SCALE 1:1000 (0 — 50m — 100m)</span>
              <span>|</span>
              <span>DATUM: WGS 84 / EPSG:3857</span>
            </div>
          </div>
        </div>

        {/* 7-Layer Provenance & Confidence Key */}
        <div className="pt-3 border-t border-gray-300 grid grid-cols-3 gap-2.5 text-[10px]">
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <p className="font-bold text-emerald-900">🟢 High Confidence</p>
            <p className="text-emerald-800 leading-tight mt-0.5">Astronomical sun path, exact GPS coordinates, solstice/equinox angles (±0.1°)</p>
          </div>
          <div className="p-2.5 bg-sky-50/70 border border-sky-200 rounded-xl">
            <p className="font-bold text-sky-900">🟡 Medium Confidence</p>
            <p className="text-sky-800 leading-tight mt-0.5">ERA5 climate archive (5-yr seasonal mean), SRTM DEM elevation, OpenStreetMap context</p>
          </div>
          <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
            <p className="font-bold text-amber-900">🔴 Provisional (Field Survey Required)</p>
            <p className="text-amber-800 leading-tight mt-0.5">SoilGrids pH, infiltration rate, plinth datum, structural foundation sizing</p>
          </div>
        </div>
      </div>

      {/* Location Header Banner with 1-Click Client Export & Share (Web UI - Hidden in Print to avoid duplicate) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-6 text-gray-900 print:hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-[#CCFF00] px-3 py-1 rounded-full shadow-2xs">
                Site Intelligence Active
              </span>
              <span className="text-[10px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Typology: {category}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                14 Live Diagnostic Engines
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{r.place_name}</h2>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {r.location.lat.toFixed(4)}° N, {r.location.lon.toFixed(4)}° E · Elevation: {r.elevation_m}m AMSL (SRTM Satellite DEM)
            </p>
          </div>

          {/* 1-Click Client Export, PRD Download & Share Action Cluster */}
          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              onClick={handlePrintReport}
              className="bg-black hover:bg-gray-800 text-[#CCFF00] font-bold text-xs px-4 py-2.5 rounded-2xl transition-all duration-200 hover:scale-102 active:scale-98 flex items-center gap-2 cursor-pointer shadow-sm shrink-0 border border-black"
              title="Export high-resolution printable PDF report for client presentation"
            >
              <Printer size={15} />
              <span>Download Client PDF Dossier</span>
            </button>

            <button
              onClick={handleExportPRDDossier}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs px-4 py-2.5 rounded-2xl border border-gray-200 transition-all duration-200 hover:scale-102 active:scale-98 flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
              title="Download architectural site PRD specification markdown file"
            >
              {prdExported ? <Check size={15} className="text-emerald-600" /> : <FileText size={15} />}
              <span>{prdExported ? 'PRD Downloaded!' : 'Export PRD Dossier'}</span>
            </button>

            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs px-4 py-2.5 rounded-2xl border border-gray-200 transition-all duration-200 hover:scale-102 active:scale-98 flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
              onClick={onShare}
              title="Copy shareable report link to clipboard"
            >
              <Share2 size={15} />
              <span>Share Dossier</span>
            </button>
          </div>
        </div>

        {/* 6-Metric Executive KPI Strip (Immediate high-level architectural insight) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4 border-t border-gray-100">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/80">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Köppen Zone</span>
            <span className="text-sm font-black text-gray-900 block truncate">{r.climate?.koppen_zone}</span>
            <span className="text-[10px] text-gray-500 font-medium truncate block">{r.climate?.koppen_label.split(' ')[0]}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/80">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Today Noon Alt</span>
            <span className="text-sm font-black text-amber-600 block">{r.solar.sun_altitude_noon}°</span>
            <span className="text-[10px] text-gray-500 font-medium truncate block">Summer {r.solar.summer_solstice_noon_alt}°</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/80">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Dominant Wind</span>
            <span className="text-sm font-black text-gray-900 block">{r.wind_rose.dominant_direction}</span>
            <span className="text-[10px] text-gray-500 font-medium truncate block">{r.wind_rose.dominant_speed} km/h avg</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/80">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Plinth Rec.</span>
            <span className="text-sm font-black text-blue-600 block">+{r.plinth_hydrology.recommended_plinth_mm}mm</span>
            <span className="text-[10px] text-gray-500 font-medium truncate block">{r.plinth_hydrology.waterlogging_risk} Flood Risk</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/80">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Soil Texture</span>
            <span className="text-sm font-black text-gray-900 block truncate">{r.soil.soil_texture}</span>
            <span className="text-[10px] text-gray-500 font-medium truncate block">pH {r.soil.ph} · {r.soil.clay_pct}% Clay</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/80">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Green Canopy</span>
            <span className="text-sm font-black text-emerald-600 block">{r.contextual.green_cover_pct}%</span>
            <span className="text-[10px] text-gray-500 font-medium truncate block">{r.contextual.tree_canopy_density}</span>
          </div>
        </div>
      </div>

      {/* ── QGIS 4-STEP SPATIAL INTELLIGENCE PIPELINE (Data to Decisions) ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200/90 shadow-xs space-y-6 text-gray-900 transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 tracking-wider">
              GIS
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  SPATIAL INTELLIGENCE WORKFLOW
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  From Data to Decisions in 4 Simple Steps
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal">
                Structured GIS pipeline integrating elevation rasters, reanalysis vectors &amp; architectural bioclimatics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono bg-gray-50 px-3.5 py-2 rounded-2xl border border-gray-200/70 shrink-0">
            <span className="flex items-center gap-1 font-bold text-gray-900">
              <Compass size={13} className="text-red-600" /> N ▲ 0°
            </span>
            <span>·</span>
            <span>Scale 1:1000</span>
            <span>·</span>
            <span className="hidden md:inline">EPSG:3857</span>
          </div>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1: Load Data */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-black text-[#CCFF00] font-black text-xs flex items-center justify-center">
                1
              </span>
              <Database size={16} className="text-slate-600" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">LOAD DATA</h4>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">Import raw spatial layers into engine</p>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-slate-200/70">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Shapefiles / OSM Parcels
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SRTM 90m DEM Elevation
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ERA5 5-Yr Climatology
              </div>
            </div>
          </div>

          {/* Step 2: Digitizing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-black text-[#CCFF00] font-black text-xs flex items-center justify-center">
                2
              </span>
              <PenTool size={16} className="text-slate-600" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">DIGITIZING</h4>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">Extract spatial features directly</p>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-slate-200/70">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Points: Site Datum ({r.location.lat.toFixed(2)}°)
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Lines: Road Centerlines &amp; Flow
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Polygons: {r.contextual.green_cover_pct}% Green Canopy
              </div>
            </div>
          </div>

          {/* Step 3: Spatial Analysis */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-black text-[#CCFF00] font-black text-xs flex items-center justify-center">
                3
              </span>
              <Layers size={16} className="text-slate-600" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">SPATIAL ANALYSIS</h4>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">Overlay &amp; extract actionable insights</p>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-slate-200/70">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Buffer: 1km Civic Amenities
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Solar: SunCalc Ephemeris {r.solar.sun_altitude_noon}°
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Hydrology: 50mm Storm Sizing
              </div>
            </div>
          </div>

          {/* Step 4: Layout Design */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-black text-[#CCFF00] font-black text-xs flex items-center justify-center">
                4
              </span>
              <Compass size={16} className="text-slate-600" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">LAYOUT DESIGN</h4>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">Decision-ready client presentation</p>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-slate-200/70">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> True North &amp; Metric Scale Bar
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Bioclimatic Symbology Legend
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Certified Architectural Sign-off
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tagline matching Image 5 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
          <p className="text-gray-600 font-normal">
            QGIS &amp; Anvitam Engine empower you to visualize, analyze, and communicate spatial data effectively.
          </p>
          <span className="font-extrabold text-emerald-800 shrink-0">
            Better Maps · Better Decisions · Ecological Architecture
          </span>
        </div>
      </div>

      {/* MODULAR TOOL FILTER BAR (Hidden during Print) */}
      <div className="no-print bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 px-2 flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={14} className="text-black" /> Focus Filter:
          </span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all' ? 'bg-black text-[#CCFF00] shadow-xs' : 'text-gray-600 hover:text-black bg-gray-100 font-normal'
            }`}
          >
            All 14+ Site Engines
          </button>
          {[
            { id: 'direction', label: '🧭 Direction & Space' },
            { id: 'plinth', label: '🌊 Plinth & Flood' },
            { id: 'swot', label: '📊 SWOT Matrix' },
            { id: 'contextual', label: '🗺️ Neighborhood Context' },
            { id: 'solar', label: '☀️ Solar Path' },
            { id: 'wind', label: '💨 Wind Rose' },
            { id: 'soil', label: '🧱 SoilGrids' },
            { id: 'urban', label: '🏢 Urban Fabric' },
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => setSelectedFilter(tool.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer whitespace-nowrap ${
                selectedFilter === tool.id ? 'bg-black text-[#CCFF00] font-bold shadow-xs' : 'text-gray-600 hover:text-black bg-gray-100 font-normal'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        {selectedFilter !== 'all' && (
          <button
            onClick={() => setSelectedFilter('all')}
            className="text-xs font-bold text-black hover:underline flex items-center gap-1 shrink-0 px-2 cursor-pointer"
          >
            <Eye size={13} /> View All 14+ Diagrams
          </button>
        )}
      </div>

      {/* True Bento Grid Layout with zero whitespace voids */}
      {renderBentoGrid()}

      {/* ── GROUND TRUTH VERIFICATION & ARCHANA GAVAS CONSULTATION SECTION ── */}
      <div className="bg-gradient-to-br from-[#03160E] via-[#052A1A] to-[#03160E] text-white p-8 rounded-3xl border border-[#CCFF00]/30 shadow-xl mt-12 break-inside-avoid">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#CCFF00] text-[#03160E] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Expert Verification
              </span>
              <span className="text-xs text-[#CCFF00] font-semibold">
                Ar. Archana Gavas · Anvitam Studio
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ready to verify on-site contours, soil &amp; water engineering?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              This dossier provides preliminary AI-assisted bioclimatic &amp; spatial intelligence. For construction-ready masterplanning, finished floor level benchmarks, soil testing, and drainage grading, connect directly with Ar. Archana Gavas.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-gray-300">
              <span>✉️ ar.archanagavas@gmail.com</span>
              <span>🌐 www.anvitam.com</span>
              <span>📍 Halol / Vadodara / Pan-India Masterplanning</span>
            </div>
          </div>

          <div className="shrink-0 no-print">
            <a
              href="https://topmate.io/archanagavas"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#CCFF00] hover:bg-[#b8e600] text-[#03160E] font-black text-sm px-6 py-3.5 rounded-2xl transition-all shadow-lg inline-flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>Book Masterplanning Review →</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
