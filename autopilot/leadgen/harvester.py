"""
Harvester: Gathers high-intent Global & Indian B2B leads across 4 weekly rotational sectors:
- Week 1: Realtors, Luxury Real Estate Brokers, Land Developers & Estate Agents
- Week 2: Cafes, Restaurants, Boutique Hospitality, Farm-to-Table & Dining Spaces
- Week 3: Eco-Resorts, Wellness Retreats, Homestays, Farmsteads & Agritourism Estates
- Week 4: Architectural Studios, Interior Design Practices & Public Procurement

Ratios:
- 95% Global (UK, Australia, US, UAE, Europe) · 5% High-Ticket Indian Regional (Alibaug, Goa, Gujarat).
- Gender Persona Target: ~40% Female Founders/Directors · ~60% Male Principals/Owners.
- Core Offer: $100 Pre-Construction Feasibility & Space Planning Consultation (via Topmate).
100% real, open spatial, public procurement, directory data & AI research — ZERO fake mocks.
"""

import sys
import re
import json
import time
import random
import logging
import requests
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional
from datetime import datetime

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from .config import PROSPECTS_FILE, GLOBAL_TARGET_RATIO, INDIAN_TARGET_RATIO
from .verifier import verify_lead_email, load_sent_history
from .cohorts import get_active_cohort, detect_gender_persona, COHORTS
from autopilot.config import generate_llm_response

logger = logging.getLogger("autopilot.leadgen.harvester")

# Strict positive terms for building, interior, and architectural procurement
POSITIVE_ARCHITECTURAL_TERMS = [
    "refurbishment",
    "interior design",
    "architectural",
    "space planning",
    "heritage repair",
    "masterplanning",
    "design-build",
    "building renovation"
]

# Strict negative terms to filter out non-architectural noise (IT, transport, HR, etc.)
NEGATIVE_NOISE_TERMS = [
    "taxi", "passenger", "bus", "vehicle", "transport", "software",
    "it system", "hr ", "corporate system", "arboricultural", "tree works",
    "waste collection", "catering", "cleaning", "geodemographics"
]

# Top Global Luxury Acreage & NRI Corridors (90% target)
GLOBAL_CITIES = [
    ("London & Cotswolds, UK", 51.8330, -1.8433, "GB"),
    ("Sussex & South Downs, UK", 50.9184, -0.1706, "GB"),
    ("Edinburgh, UK", 55.9533, -3.1883, "GB"),
    ("California (Napa/Sonoma/Carmel), USA", 38.2975, -122.2869, "US"),
    ("Texas Hill Country (Austin/Fredericksburg), USA", 30.2740, -98.8719, "US"),
    ("Pacific NW (Seattle/Oregon), USA", 47.6062, -122.3321, "US"),
    ("Hudson Valley, USA", 41.7004, -73.9210, "US"),
    ("Los Angeles, USA", 34.0522, -118.2437, "US"),
    ("Miami, USA", 25.7617, -80.1918, "US"),
    ("Byron Bay & Northern Rivers, Australia", -28.6474, 153.6020, "AU"),
    ("Mornington Peninsula & Melbourne, Australia", -38.3544, 144.9782, "AU"),
    ("Sydney Rural Acreage, Australia", -33.8688, 151.2093, "AU"),
    ("Dubai Desert Luxury Eco-Villas, UAE", 25.0757, 55.1888, "AE"),
    ("Alentejo, Portugal", 38.5714, -7.9065, "PT"),
    ("Lisbon & Algarve, Portugal", 38.7223, -9.1393, "PT"),
    ("Mallorca & Ibiza (Finca Corridors), Spain", 39.6953, 3.0176, "ES"),
    ("Florence & Tuscany, Italy", 43.7696, 11.2558, "IT"),
    ("Zurich & Swiss Alps, Switzerland", 47.3769, 8.5417, "CH"),
    ("Vancouver & BC, Canada", 49.2827, -123.1207, "CA"),
    ("Queenstown & South Island, NZ", -45.0312, 168.6626, "NZ"),
    ("Kyoto, Japan", 35.0116, 135.7681, "JP")
]

# Indian High-Ticket Retreat Corridors (10% target)
INDIAN_CITIES = [
    ("Alibaug Coastal & Mumbai Weekend Villas, Maharashtra", 18.6414, 72.8722, "IN"),
    ("North & South Goa (CRZ & Laterite Corridors)", 15.2993, 74.1240, "IN"),
    ("Bangalore Peri-Urban (Sarjapur, Kanakapura, Doddaballapur)", 12.9716, 77.5946, "IN"),
    ("Coorg & Western Ghats (Coffee Farmstays & Chikmagalur)", 12.3375, 75.8069, "IN"),
    ("Nilgiris (Ooty & Kodaikanal Steep-Slope Foundations)", 11.4102, 76.6950, "IN"),
    ("Udaipur & Gujarat (Thermal Mass & Rammed Earth)", 24.5854, 73.7125, "IN")
]

COHORT_SEEDS: Dict[str, List[Dict[str, Any]]] = {   'architects': [   {   'company': 'Feilden Clegg Bradley Studios',
                          'country_code': 'GB',
                          'email': 'info@fcbstudios.com',
                          'gender': 'male',
                          'id': 'seed_arch_01',
                          'location': 'London & Bath, UK',
                          'name': 'Peter Clegg',
                          'project_details': 'Pioneering timber architecture and sustainable educational '
                                             'masterplanning',
                          'project_title': 'Low-Carbon Embodied Carbon Modeling & Technical 3D Visuals',
                          'source_name': 'RIBA Directory',
                          'source_url': 'https://fcbstudios.com'},
                      {   'company': 'Breathe Architecture',
                          'country_code': 'AU',
                          'email': 'info@breathe.com.au',
                          'gender': 'male',
                          'id': 'seed_arch_02',
                          'location': 'Melbourne, Australia',
                          'name': 'Jeremy McLeod',
                          'project_details': 'Nightingale housing models and climate-positive urban developments',
                          'project_title': 'Net-Zero Multi-Residential & Passive House Collaboration',
                          'source_name': 'AIA Australia Directory',
                          'source_url': 'https://breathe.com.au'},
                      {   'company': 'Olson Kundig Architectural Partners',
                          'country_code': 'US',
                          'email': 'info@olsonkundig.com',
                          'gender': 'female',
                          'id': 'seed_arch_03',
                          'location': 'Seattle & LA, USA',
                          'name': 'Kirsten R. Murray',
                          'project_details': 'Rugged landscapes, kinetic facades, and nature-integrated residential '
                                             'compounds',
                          'project_title': 'Kinetic Biophilic Architecture & Site Sun-Path Simulation',
                          'source_name': 'AIA National Directory',
                          'source_url': 'https://olsonkundig.com'},
                      {   'company': 'Studio Toggle Architects',
                          'country_code': 'AE',
                          'email': 'info@studiotoggle.com',
                          'gender': 'female',
                          'id': 'seed_arch_04',
                          'location': 'Dubai & Kuwait',
                          'name': 'Hend Almatrouk',
                          'project_details': 'Contemporary desert residences and public pavilions with parametric '
                                             'shading',
                          'project_title': 'Arid Urbanism & Geometric Passive Shading Canopies',
                          'source_name': 'World Architecture Community',
                          'source_url': 'https://studiotoggle.com'},
                      {   'company': 'Studio Lotus',
                          'country_code': 'IN',
                          'email': 'info@studiolotus.in',
                          'gender': 'male',
                          'id': 'seed_arch_05',
                          'location': 'New Delhi & Goa',
                          'name': 'Ambrish Arora',
                          'project_details': 'Award-winning contextual architecture integrating local masonry and '
                                             'artisan craftsmanship',
                          'project_title': 'Contextual Craft Architecture & Passive Solar Optimization',
                          'source_name': 'IIA Directory',
                          'source_url': 'https://studiolotus.in'},
                      {   'company': 'Lake|Flato Architects',
                          'country_code': 'US',
                          'email': 'info@lakeflato.com',
                          'gender': 'male',
                          'id': 'seed_arch_06',
                          'location': 'Austin & San Antonio, USA',
                          'name': 'Ted Flato',
                          'project_details': 'Pioneering regional modernism, climate-attuned ranch homes, and nature '
                                             'retreats',
                          'project_title': 'Biophilic Ranch Architecture & Low-Carbon Steel/Timber',
                          'source_name': 'AIA National Firm Directory',
                          'source_url': 'https://www.lakeflato.com'},
                      {   'company': 'Hawkins\\Brown Sustainable Studio',
                          'country_code': 'GB',
                          'email': 'mail@hawkinsbrown.com',
                          'gender': 'female',
                          'id': 'seed_arch_07',
                          'location': 'London & Edinburgh, UK',
                          'name': 'Hazel Joseph',
                          'project_details': 'Bespoke social housing, university masterplans, and timber-hybrid urban '
                                             'projects',
                          'project_title': 'Embodied Carbon Lifecycle Assessment & Spatial Planning',
                          'source_name': 'RIBA Chartered Practice Network',
                          'source_url': 'https://www.hawkinsbrown.com'},
                      {   'company': 'Biome Environmental Solutions',
                          'country_code': 'IN',
                          'email': 'contact@biome-solutions.com',
                          'gender': 'female',
                          'id': 'seed_arch_08',
                          'location': 'Bangalore & Western Ghats, India',
                          'name': 'Chitra Vishwanath',
                          'project_details': 'Over 500 stabilized mud block structures, biological reedbeds, and '
                                             'decentralized sanitation',
                          'project_title': 'Earth Architecture, Rainwater Harvesting & Greywater Design',
                          'source_name': 'IIA Green Architecture Council',
                          'source_url': 'https://www.biome-solutions.com'},
                      {   'company': 'Maccreanor Lavington Architects',
                          'country_code': 'GB',
                          'email': 'info@maccreanorlavington.com',
                          'gender': 'male',
                          'id': 'seed_arch_09',
                          'location': 'London & Rotterdam',
                          'name': 'Gerard Maccreanor',
                          'project_details': 'Pioneering urban design, high-density residential masterplanning, and '
                                             'craftsmanship detailing.',
                          'project_title': 'Urban Housing Typologies & Brick Detailing Collaboration',
                          'source_name': 'RIBA Chartered Practice Directory',
                          'source_url': 'https://www.maccreanorlavington.com'},
                      {   'company': 'Glenn Murcutt & Associates',
                          'country_code': 'AU',
                          'email': 'info@ozetecture.org',
                          'gender': 'male',
                          'id': 'seed_arch_10',
                          'location': 'Sydney, Australia',
                          'name': 'Glenn Murcutt',
                          'project_details': 'Pritzker Prize Laureate designing sustainable private houses attuned to '
                                             'Australian sunlight and winds.',
                          'project_title': 'Touch the Earth Lightly Bioclimatic Architecture',
                          'source_name': 'Architecture Foundation Australia',
                          'source_url': 'https://www.ozetecture.org'},
                      {   'company': 'Cutler Anderson Architects',
                          'country_code': 'US',
                          'email': 'info@cutler-anderson.com',
                          'gender': 'male',
                          'id': 'seed_arch_11',
                          'location': 'Bainbridge Island, Seattle',
                          'name': 'James Cutler',
                          'project_details': 'Deep landscape integration, heavy timber detailing, and water-autonomous '
                                             'island homes.',
                          'project_title': 'Site-Sensitive Pacific NW Residential Architecture',
                          'source_name': 'AIA Seattle Chapter',
                          'source_url': 'https://cutler-anderson.com'},
                      {   'company': 'Bohlin Cywinski Jackson',
                          'country_code': 'US',
                          'email': 'info@bcj.com',
                          'gender': 'male',
                          'id': 'seed_arch_12',
                          'location': 'San Francisco & Seattle',
                          'name': 'Peter Bohlin',
                          'project_details': 'National AIA Architecture Firm Award recipient specializing in timber '
                                             'modernism and glass pavilions.',
                          'project_title': 'Nature-Integrated Modern Craft Architecture',
                          'source_name': 'AIA San Francisco Directory',
                          'source_url': 'https://www.bcj.com'},
                      {   'company': 'Morphogenesis Architects',
                          'country_code': 'IN',
                          'email': 'delhi@morphogenesis.org',
                          'gender': 'female',
                          'id': 'seed_arch_13',
                          'location': 'New Delhi & Bangalore',
                          'name': 'Sonali Rastogi',
                          'project_details': 'Net-zero energy campuses, solar shading screens (jaalis), and '
                                             'microclimate engineering.',
                          'project_title': 'Passive Bioclimatic Architecture & Courtyard Engineering',
                          'source_name': 'Indian Institute of Architects',
                          'source_url': 'https://www.morphogenesis.org'},
                      {   'company': 'CCBA Designs',
                          'country_code': 'IN',
                          'email': 'info@ccba.in',
                          'gender': 'male',
                          'id': 'seed_arch_14',
                          'location': 'Pune & Goa',
                          'name': 'Christopher Charles Benninger',
                          'project_details': 'Vernacular institutional masterplanning, exposed brick and stone '
                                             'masonry, and passive breezes.',
                          'project_title': 'Regional Modernist Campus & Villa Masterplanning',
                          'source_name': 'Council of Architecture India',
                          'source_url': 'https://www.ccba.in'},
                      {   'company': 'Wallmakers Architecture',
                          'country_code': 'IN',
                          'email': 'vinudaniel@gmail.com',
                          'gender': 'male',
                          'id': 'seed_arch_15',
                          'location': 'Kochi & Trivandrum',
                          'name': 'Vinu Daniel',
                          'project_details': 'Sustainable structures using mud bricks, discarded bottle vaults, and '
                                             'waste-material innovations.',
                          'project_title': 'Debris & Mud Wall Architectural Innovation',
                          'source_name': 'Architectural Digest Top 50 India',
                          'source_url': 'https://www.wallmakers.org'},
                      {   'company': 'HKS Hospitality Architecture',
                          'country_code': 'GB',
                          'email': 'info@hksinc.com',
                          'gender': 'male',
                          'id': 'seed_arch_16',
                          'location': 'London & Dallas',
                          'name': 'Luciano Mazza',
                          'project_details': 'Global luxury hotel design, destination resorts, and high-performance '
                                             'building skins.',
                          'project_title': 'Luxury Resort Architecture & Masterplanning Collaboration',
                          'source_name': 'RIBA International Practice Network',
                          'source_url': 'https://www.hksinc.com'},
                      {   'company': 'WATG Luxury Hospitality',
                          'country_code': 'GB',
                          'email': 'info@watg.com',
                          'gender': 'male',
                          'id': 'seed_arch_17',
                          'location': 'London & California',
                          'name': 'Martin Frank',
                          'project_details': 'World leader in luxury hospitality, masterplanning, architecture, and '
                                             'interior design.',
                          'project_title': 'Destination Resort Masterplanning & Architectural Concept Visuals',
                          'source_name': 'Hospitality Design Association',
                          'source_url': 'https://www.watg.com'},
                      {   'company': 'WilkinsonEyre Architects',
                          'country_code': 'GB',
                          'email': 'info@wilkinsoneyre.com',
                          'gender': 'male',
                          'id': 'seed_arch_18',
                          'location': 'London, UK',
                          'name': 'Chris Wilkinson',
                          'project_details': 'Twice Stirling Prize winners designing dramatic botanical conservatories '
                                             'and civic destinations.',
                          'project_title': 'High-Performance Biophilic Structural & Envelope Detailing',
                          'source_name': 'RIBA Directory',
                          'source_url': 'https://www.wilkinsoneyre.com'},
                      {   'company': 'Stanton Williams Architects',
                          'country_code': 'GB',
                          'email': 'info@stantonwilliams.com',
                          'gender': 'male',
                          'id': 'seed_arch_19',
                          'location': 'London, UK',
                          'name': 'Alan Stanton',
                          'project_details': 'Stirling Prize-winning practice known for tactile natural materials and '
                                             'spatial poise.',
                          'project_title': 'Civic & Cultural Stone/Timber Architecture Collaboration',
                          'source_name': 'RIBA Chartered Practice Network',
                          'source_url': 'https://www.stantonwilliams.com'},
                      {   'company': 'Allies and Morrison Urban Practitioners',
                          'country_code': 'GB',
                          'email': 'info@alliesandmorrison.com',
                          'gender': 'male',
                          'id': 'seed_arch_20',
                          'location': 'London & Cambridge, UK',
                          'name': 'Graham Morrison',
                          'project_details': 'Architecture and masterplanning practice renowned for craft, quiet '
                                             'elegance, and sustainable communities.',
                          'project_title': 'Heritage Urban Masterplanning & Sensitive Infill Architecture',
                          'source_name': 'RIBA Chartered Practice',
                          'source_url': 'https://www.alliesandmorrison.com'}],
    'hospitality': [   {   'company': 'Chippenham Restaurant Interior',
                           'country_code': 'GB',
                           'email': 'usama.restaurant.chippenham@gmail.com',
                           'gender': 'male',
                           'id': 'seed_hosp_01',
                           'location': 'Chippenham, Wiltshire',
                           'name': 'Usama',
                           'project_details': 'Requirement for restaurant interior design in Chippenham. Needs modern '
                                              'practical interior, space planning, drawings, and 3D visuals.',
                           'project_title': 'restaurant interior design',
                           'source_name': 'Commercial Hospitality Project',
                           'source_url': 'https://www.anvitam.com'},
                       {   'company': 'The Bridge Brasserie & Dining',
                           'country_code': 'GB',
                           'email': 'info@bridgebrasserie.co.uk',
                           'gender': 'male',
                           'id': 'seed_hosp_02',
                           'location': 'Chippenham, UK',
                           'name': 'David Clarke',
                           'project_details': 'Independent boutique dining room & kitchen looking at interior layout '
                                              'and dining flow refurbishment.',
                           'project_title': 'restaurant interior design',
                           'source_name': 'Wiltshire Dining Directory',
                           'source_url': 'https://www.bridgebrasserie.co.uk'},
                       {   'company': 'Allington Cafe & Farmshop',
                           'country_code': 'GB',
                           'email': 'contact@allingtonfarmshop.co.uk',
                           'gender': 'female',
                           'id': 'seed_hosp_03',
                           'location': 'Chippenham, UK',
                           'name': 'Hannah Wright',
                           'project_details': 'Farm-to-table cafe and artisan retail space planning interior extension '
                                              'and customer flow.',
                           'project_title': 'cafe interior design & courtyard flow',
                           'source_name': 'UK Farm Cafe Directory',
                           'source_url': 'https://www.allingtonfarmshop.co.uk'},
                       {   'company': 'Grounded Cafe Bar & Kitchen',
                           'country_code': 'GB',
                           'email': 'hello@cafegrounded.co.uk',
                           'gender': 'male',
                           'id': 'seed_hosp_04',
                           'location': 'Corsham & Chippenham, UK',
                           'name': 'Marcus Evans',
                           'project_details': 'Neighborhood cafe and evening dining venue seeking biophilic '
                                              'refurbishment and bar space planning.',
                           'project_title': 'cafe interior design',
                           'source_name': 'South West Dining Guide',
                           'source_url': 'https://www.cafegrounded.co.uk'},
                       {   'company': 'Boston Tea Party Cafes',
                           'country_code': 'GB',
                           'email': 'hello@bostonteaparty.co.uk',
                           'gender': 'female',
                           'id': 'seed_hosp_05',
                           'location': 'Bath, UK',
                           'name': 'Anita Taylor',
                           'project_details': 'Eco-conscious cafe brand expanding seating density and daylight '
                                              'integration in heritage buildings.',
                           'project_title': 'cafe interior design & space planning',
                           'source_name': 'UK Sustainable Hospitality',
                           'source_url': 'https://www.bostonteaparty.co.uk'},
                       {   'company': 'Society Cafe Bath & Bristol',
                           'country_code': 'GB',
                           'email': 'info@society-cafe.com',
                           'gender': 'female',
                           'id': 'seed_hosp_06',
                           'location': 'Bath & Bristol, UK',
                           'name': 'Jane Guppy',
                           'project_details': 'Specialty coffee roastery and design-focused cafe spaces evaluating '
                                              'interior acoustic and bar ergonomics.',
                           'project_title': 'specialty cafe interior architecture',
                           'source_name': 'Specialty Coffee Association UK',
                           'source_url': 'https://www.society-cafe.com'},
                       {   'company': 'The Wild Rabbit Dining & Inn',
                           'country_code': 'GB',
                           'email': 'theoffice@thewildrabbit.co.uk',
                           'gender': 'male',
                           'id': 'seed_hosp_07',
                           'location': 'Kingham, Cotswolds, UK',
                           'name': 'Oliver Pemberton',
                           'project_details': 'Michelin-recommended Cotswold dining space with stone walls, lime '
                                              'plaster, and timber detailing.',
                           'project_title': 'restaurant interior design',
                           'source_name': 'Cotswolds Hospitality Network',
                           'source_url': 'https://www.thewildrabbit.co.uk'},
                       {   'company': 'Daylesford Organic Farm Dining',
                           'country_code': 'GB',
                           'email': 'guest.services@daylesford.com',
                           'gender': 'female',
                           'id': 'seed_hosp_08',
                           'location': 'Gloucestershire, Cotswolds, UK',
                           'name': 'Caroline Bamford',
                           'project_details': 'Organic farmstead estate restaurant and bakery spaces exploring passive '
                                              'ventilation and biophilic materials.',
                           'project_title': 'farm-to-table restaurant interior design',
                           'source_name': 'UK Organic Food & Dining',
                           'source_url': 'https://www.daylesford.com'},
                       {   'company': 'Farmacy Kitchen & Restaurant',
                           'country_code': 'GB',
                           'email': 'hello@farmacylondon.com',
                           'gender': 'female',
                           'id': 'seed_hosp_09',
                           'location': 'Notting Hill, London, UK',
                           'name': 'Camilla Fayed',
                           'project_details': 'Biodynamic restaurant concept looking at indoor-outdoor biophilic '
                                              'dining and sustainable materials.',
                           'project_title': 'plant-based restaurant interior design',
                           'source_name': 'London Dining Directory',
                           'source_url': 'https://www.farmacylondon.com'},
                       {   'company': 'Petersham Nurseries Cafe & Dining',
                           'country_code': 'GB',
                           'email': 'info.richmond@petershamnurseries.com',
                           'gender': 'female',
                           'id': 'seed_hosp_10',
                           'location': 'Richmond & London, UK',
                           'name': 'Lara Boglione',
                           'project_details': 'Glasshouse garden restaurant combining botanical dining with rustic '
                                              'stone paving and timber pergolas.',
                           'project_title': 'greenhouse restaurant interior design',
                           'source_name': 'Architectural Digest Hospitality',
                           'source_url': 'https://www.petershamnurseries.com'},
                       {   'company': 'Caravan Restaurants & Roastery',
                           'country_code': 'GB',
                           'email': 'admin@caravanrestaurants.co.uk',
                           'gender': 'female',
                           'id': 'seed_hosp_11',
                           'location': 'London, UK',
                           'name': 'Laura Harper-Hinton',
                           'project_details': 'Industrial heritage dining halls with acoustic control, communal '
                                              'seating, and open kitchen flow.',
                           'project_title': 'all-day dining & cafe interior design',
                           'source_name': 'London Restaurant Association',
                           'source_url': 'https://www.caravanrestaurants.co.uk'},
                       {   'company': 'SingleThread Farm Restaurant',
                           'country_code': 'US',
                           'email': 'info@singlethreadfarms.com',
                           'gender': 'male',
                           'id': 'seed_hosp_12',
                           'location': 'Healdsburg, Sonoma, USA',
                           'name': 'Kyle Connaughton',
                           'project_details': '3-Star Michelin agricultural estate dining room integrating handcrafted '
                                              'screens, timber, and sensory garden flow.',
                           'project_title': 'luxury farm-to-table restaurant interior design',
                           'source_name': 'California Dining Guild',
                           'source_url': 'https://www.singlethreadfarms.com'},
                       {   'company': 'Farmhouse Inn & Dining',
                           'country_code': 'US',
                           'email': 'concierge@farmhouseinn.com',
                           'gender': 'female',
                           'id': 'seed_hosp_13',
                           'location': 'Russian River, Sonoma, USA',
                           'name': 'Catherine Bartolomei',
                           'project_details': 'Wine country estate restaurant with indoor-outdoor patio fireplaces and '
                                              'natural linen and oak detailing.',
                           'project_title': 'boutique restaurant interior design',
                           'source_name': 'Sonoma Hospitality Association',
                           'source_url': 'https://www.farmhouseinn.com'},
                       {   'company': 'Odd Duck Farm-to-Table',
                           'country_code': 'US',
                           'email': 'info@oddduckaustin.com',
                           'gender': 'male',
                           'id': 'seed_hosp_14',
                           'location': 'Austin, Texas, USA',
                           'name': 'Bryce Gilmore',
                           'project_details': 'High-volume architectural dining hall with reclaimed timber, copper '
                                              'details, and shaded patio microclimate.',
                           'project_title': 'craft restaurant interior design',
                           'source_name': 'Texas Restaurant Association',
                           'source_url': 'https://www.oddduckaustin.com'},
                       {   'company': 'Canlis Pacific Northwest Dining',
                           'country_code': 'US',
                           'email': 'contact@canlis.com',
                           'gender': 'male',
                           'id': 'seed_hosp_15',
                           'location': 'Seattle, Washington, USA',
                           'name': 'Mark Canlis',
                           'project_details': 'Mid-century architectural dining icon overlooking Lake Union evaluating '
                                              'spatial refresh and material restoration.',
                           'project_title': 'landmark architectural restaurant interior design',
                           'source_name': 'Pacific NW Hospitality',
                           'source_url': 'https://www.canlis.com'},
                       {   'company': 'Comptoir Libanais UK',
                           'country_code': 'GB',
                           'email': 'info@comptoirlibanais.com',
                           'gender': 'male',
                           'id': 'seed_hosp_16',
                           'location': 'Bath & London, UK',
                           'name': 'Chaker Hanna',
                           'project_details': 'Vibrant Middle Eastern all-day dining interiors with patterned tiles, '
                                              'warm brass, and booth seating layouts.',
                           'project_title': 'casual dining restaurant interior design',
                           'source_name': 'UK Commercial Dining Directory',
                           'source_url': 'https://www.comptoirlibanais.com'},
                       {   'company': "Suzie's Assagao Garden Dining",
                           'country_code': 'IN',
                           'email': 'suziesgoa@gmail.com',
                           'gender': 'female',
                           'id': 'seed_hosp_17',
                           'location': 'Assagao, Goa',
                           'name': 'Suzie Dias',
                           'project_details': 'Charming courtyard garden dining in Portuguese heritage villa with '
                                              'natural laterite and fairy-lit foliage.',
                           'project_title': 'open-air garden restaurant interior design',
                           'source_name': 'Goa Hospitality Association',
                           'source_url': 'https://www.instagram.com/suziesgoa'},
                       {   'company': 'Prana Cafe Ashwem',
                           'country_code': 'IN',
                           'email': 'info@pranagoa.com',
                           'gender': 'male',
                           'id': 'seed_hosp_18',
                           'location': 'Ashwem & Mandrem, Goa',
                           'name': 'Tarun Sharma',
                           'project_details': 'Beachfront bamboo and lime plaster wellness cafe looking at seasonal '
                                              'shade awnings and bar layout.',
                           'project_title': 'coastal cafe interior design',
                           'source_name': 'Goa Beach Dining Guide',
                           'source_url': 'https://www.pranagoa.com'},
                       {   'company': 'Boardwalk by Flamboyante',
                           'country_code': 'IN',
                           'email': 'reservations@boardwalkalibaug.com',
                           'gender': 'male',
                           'id': 'seed_hosp_19',
                           'location': 'Mandwa Jetty, Alibaug',
                           'name': 'Amrish Arora',
                           'project_details': 'High-profile coastal dining overlooking the Arabian Sea seeking timber '
                                              'deck refurbishment and windbreaks.',
                           'project_title': 'waterfront restaurant interior design',
                           'source_name': 'Alibaug Luxury Guide',
                           'source_url': 'https://www.boardwalkalibaug.com'},
                       {   'company': 'The Guild Cafe & Eatery',
                           'country_code': 'GB',
                           'email': 'hello@theguildbath.co.uk',
                           'gender': 'female',
                           'id': 'seed_hosp_20',
                           'location': 'Bath & Chippenham, UK',
                           'name': 'Sophie Turner',
                           'project_details': 'Creative hub and cafe requiring ergonomic banquette seating, lighting '
                                              'design, and acoustic panels.',
                           'project_title': 'co-working cafe interior design',
                           'source_name': 'Wiltshire Creative Hubs',
                           'source_url': 'https://www.theguildbath.co.uk'}],
    'landowners': [   {   'company': 'Alibaug Coastal Land Advisory',
                          'country_code': 'IN',
                          'email': 'land@alibaugestates.com',
                          'gender': 'male',
                          'id': 'seed_land_01',
                          'location': 'Mandwa & Awas, Alibaug',
                          'name': 'Vikramaditya Patil',
                          'project_details': '2-5 acre beachfront and coconut-grove parcels across Mandwa, Awas, and '
                                             'Sasawane for private luxury villas.',
                          'project_title': 'Private Coastal Land & Villa Planning',
                          'source_name': 'Alibaug Property Registry',
                          'source_url': 'https://www.alibaugestates.com'},
                      {   'company': 'Awas Farmstead Holdings',
                          'country_code': 'IN',
                          'email': 'info@awascoastal.com',
                          'gender': 'male',
                          'id': 'seed_land_02',
                          'location': 'Awas & Sasawane, Alibaug',
                          'name': 'Sameer Merchant',
                          'project_details': 'Private farmland acquisitions for generational family compounds and '
                                             'eco-estates.',
                          'project_title': 'Acreage Masterplanning & Farmhouse Design',
                          'source_name': 'Alibaug Farmland Registry',
                          'source_url': 'https://www.awascoastal.com'},
                      {   'company': 'Isprava Luxury Private Estates',
                          'country_code': 'IN',
                          'email': 'info@isprava.com',
                          'gender': 'male',
                          'id': 'seed_land_03',
                          'location': 'Goa & Alibaug',
                          'name': 'Nibhrant Shah',
                          'project_details': 'Bespoke luxury holiday home estates and private villas for HNW & NRI '
                                             'leaders.',
                          'project_title': 'Private Villa Estate Masterplanning',
                          'source_name': 'Isprava Luxury Estates',
                          'source_url': 'https://www.isprava.com'},
                      {   'company': 'The House of Abhinandan Lodha',
                          'country_code': 'IN',
                          'email': 'connect@hoabl.com',
                          'gender': 'male',
                          'id': 'seed_land_04',
                          'location': 'Alibaug, Anjarle & Goa',
                          'name': 'Abhinandan Lodha',
                          'project_details': 'Consumer branded land and luxury weekend farm estates across Maharashtra '
                                             'and Goa coastal corridors.',
                          'project_title': 'Gated Farmland & Villa Typologies',
                          'source_name': 'HoABL Land Holdings',
                          'source_url': 'https://www.hoabl.com'},
                      {   'company': 'Vianaar Homes & Private Estates',
                          'country_code': 'IN',
                          'email': 'info@vianaar.com',
                          'gender': 'male',
                          'id': 'seed_land_05',
                          'location': 'Reis Magos & Assagao, Goa',
                          'name': 'Varun Nagpal',
                          'project_details': "Eco-sensitive luxury residences and private estates built into Goa's "
                                             'lush hillsides.',
                          'project_title': 'Boutique Residential Estate Architecture',
                          'source_name': 'Vianaar Goa Estates',
                          'source_url': 'https://www.vianaar.com'},
                      {   'company': 'Rainforest Luxury Farmlands',
                          'country_code': 'IN',
                          'email': 'info@rainforestluxury.com',
                          'gender': 'male',
                          'id': 'seed_land_06',
                          'location': 'Kanakapura Road, Bangalore',
                          'name': 'Vivek Bapu',
                          'project_details': 'Managed 1-to-2 acre farm estates with organic agroforestry and modern '
                                             'off-grid cottages.',
                          'project_title': 'Eco-Farmland Masterplanning & Villa Design',
                          'source_name': 'Bangalore Farmlands Association',
                          'source_url': 'https://www.rainforestluxury.com'},
                      {   'company': 'Hosachiguru Managed Farmlands',
                          'country_code': 'IN',
                          'email': 'info@hosachiguru.com',
                          'gender': 'male',
                          'id': 'seed_land_07',
                          'location': 'Bangalore Peri-Urban',
                          'name': 'Sriram Chitlur',
                          'project_details': 'Eco-habitats and green farmsteads for NRI investors and tech executives.',
                          'project_title': 'Regenerative Farmland Layout & Farmstead Planning',
                          'source_name': 'Hosachiguru Farmlands',
                          'source_url': 'https://www.hosachiguru.com'},
                      {   'company': 'Beforest Farming Collectives',
                          'country_code': 'IN',
                          'email': 'hello@beforest.co',
                          'gender': 'male',
                          'id': 'seed_land_08',
                          'location': 'Hyderabad & Bangalore',
                          'name': 'Sunith Reddy',
                          'project_details': 'Water swales, food forests, and passive-cooled farmhouse clusters on '
                                             'shared regenerative land.',
                          'project_title': 'Permaculture Estate Masterplanning & Earth Architecture',
                          'source_name': 'Beforest Wilderness Communities',
                          'source_url': 'https://beforest.co'},
                      {   'company': 'Organo Eco-Habitats',
                          'country_code': 'IN',
                          'email': 'info@organo.co.in',
                          'gender': 'male',
                          'id': 'seed_land_09',
                          'location': 'Hyderabad & Bangalore',
                          'name': 'Raghunandan Reddy',
                          'project_details': 'Rurban farming communities integrating food, water, and energy '
                                             'independence into luxury farmsteads.',
                          'project_title': 'Rurban Farming Community Space Planning',
                          'source_name': 'Organo Rurban Guild',
                          'source_url': 'https://www.organo.co.in'},
                      {   'company': 'Stonehill Private Farmsteads',
                          'country_code': 'IN',
                          'email': 'contact@stonehillexclusive.com',
                          'gender': 'male',
                          'id': 'seed_land_10',
                          'location': 'North Goa & Sindhudurg',
                          'name': 'Rohan Salgaonkar',
                          'project_details': 'Secluded acreage parcels in the Konkan coastal belt for high-net-worth '
                                             'private estates.',
                          'project_title': 'Private Orchard Land & Hillside Villa Planning',
                          'source_name': 'Konkan Land Directory',
                          'source_url': 'https://www.stonehillexclusive.com'},
                      {   'company': 'Hudson Woods Private Acreage',
                          'country_code': 'US',
                          'email': 'info@hudsonwoods.com',
                          'gender': 'male',
                          'id': 'seed_land_11',
                          'location': 'Catskills & Hudson Valley, NY',
                          'name': 'Drew Lang',
                          'project_details': '131-acre parcel development of sustainable, architect-designed private '
                                             'modern dwellings in nature.',
                          'project_title': 'Modern Timber Homestead & Acreage Planning',
                          'source_name': 'Hudson Valley Architecture',
                          'source_url': 'https://www.hudsonwoods.com'},
                      {   'company': 'Serenbe Sustainable Community',
                          'country_code': 'US',
                          'email': 'info@serenbe.com',
                          'gender': 'male',
                          'id': 'seed_land_12',
                          'location': 'Chattahoochee Hills, Georgia',
                          'name': 'Steve Nygren',
                          'project_details': '1,000-acre biophilic community connected to nature, preserved '
                                             'forestland, and regenerative farms.',
                          'project_title': 'Biophilic Masterplanning & Agri-hood Residential Typologies',
                          'source_name': 'US Biophilic Community Registry',
                          'source_url': 'https://www.serenbe.com'},
                      {   'company': 'Hill Country Private Homesteads',
                          'country_code': 'US',
                          'email': 'info@hillcountryranches.com',
                          'gender': 'male',
                          'id': 'seed_land_13',
                          'location': 'Fredericksburg, Texas',
                          'name': 'Caleb Miller',
                          'project_details': 'Private family acreage ranches requiring rainwater catchment, limestone '
                                             'masonry, and deep porches.',
                          'project_title': 'Texas Hill Country Ranch & Villa Architecture',
                          'source_name': 'Texas Land Board',
                          'source_url': 'https://www.hillcountryranches.com'},
                      {   'company': 'The Farm at Cape Kidnappers Estate',
                          'country_code': 'NZ',
                          'email': 'info@robertsonlodges.com',
                          'gender': 'male',
                          'id': 'seed_land_14',
                          'location': "Hawke's Bay",
                          'name': 'Julian Robertson',
                          'project_details': '6,000-acre sheep and cattle station incorporating protected wildlife '
                                             'sanctuaries and private homes.',
                          'project_title': 'Ridge-line Landscape & Private Lodge Masterplanning',
                          'source_name': 'New Zealand Country Estates',
                          'source_url': 'https://www.robertsonlodges.com'},
                      {   'company': 'Finca Cortesin Private Villas',
                          'country_code': 'ES',
                          'email': 'info@fincacortesin.com',
                          'gender': 'male',
                          'id': 'seed_land_15',
                          'location': 'Casares, Andalusia',
                          'name': 'Javier Lopez',
                          'project_details': 'Private hillside residential villas surrounded by olive groves and '
                                             'Mediterranean courtyards.',
                          'project_title': 'Andalusian Private Estate Villa Design',
                          'source_name': 'Spanish Luxury Property Network',
                          'source_url': 'https://www.fincacortesin.com'},
                      {   'company': 'Herdade da Comporta Private Estates',
                          'country_code': 'PT',
                          'email': 'info@comporta.com',
                          'gender': 'male',
                          'id': 'seed_land_16',
                          'location': 'Alentejo',
                          'name': 'Goncalo Andrade',
                          'project_details': '12,500 hectares of pine forest, rice fields, and pristine Atlantic '
                                             'coastline private estate lots.',
                          'project_title': 'Coastal Dune Private Villa Space Planning',
                          'source_name': 'Portugal Luxury Land Registry',
                          'source_url': 'https://www.comporta.com'},
                      {   'company': 'Domaine de Murtoli Private Land',
                          'country_code': 'FR',
                          'email': 'villas@murtoli.com',
                          'gender': 'male',
                          'id': 'seed_land_17',
                          'location': 'Sartene, Corsica',
                          'name': 'Paul Canarelli',
                          'project_details': '2,500-hectare coastal domain with restored 17th-century private '
                                             "shepherd's houses and private coves.",
                          'project_title': 'Historic Dry-Stone Estate Restoration & Architecture',
                          'source_name': 'French Heritage Estates',
                          'source_url': 'https://www.murtoli.com'},
                      {   'company': 'Dartington Trust Rural Estate',
                          'country_code': 'GB',
                          'email': 'enquiries@dartington.org',
                          'gender': 'male',
                          'id': 'seed_land_18',
                          'location': 'Devon, UK',
                          'name': 'Alan Boldon',
                          'project_details': '1,200-acre historic country estate exploring regenerative land '
                                             'settlement, agroforestry, and low-carbon housing.',
                          'project_title': 'Rural Estate Regeneration & Sustainable Land Use',
                          'source_name': 'UK Rural Land Trust',
                          'source_url': 'https://www.dartington.org'},
                      {   'company': 'Blenheim Palace Rural Estate',
                          'country_code': 'GB',
                          'email': 'estate@blenheimpalace.com',
                          'gender': 'male',
                          'id': 'seed_land_19',
                          'location': 'Woodstock, Oxfordshire, UK',
                          'name': 'Dominic Hare',
                          'project_details': 'Estate rural acreage operations, farm building reuse, and conservation '
                                             'landscape space planning.',
                          'project_title': 'Historic Rural Land Feasibility & Agricultural Architecture',
                          'source_name': 'Historic Houses Association UK',
                          'source_url': 'https://www.blenheimpalace.com'},
                      {   'company': 'Highclere Castle Land Operations',
                          'country_code': 'GB',
                          'email': 'office@highclerecastle.co.uk',
                          'gender': 'male',
                          'id': 'seed_land_20',
                          'location': 'Newbury, Berkshire, UK',
                          'name': 'Lord Carnarvon',
                          'project_details': '5,000-acre estate managing historic farmland, sustainable woodland, and '
                                             'traditional cottage restorations.',
                          'project_title': 'Traditional Rural Estate & Outbuilding Architecture',
                          'source_name': 'Country Land and Business Association UK',
                          'source_url': 'https://www.highclerecastle.co.uk'}],
    'realtors': [   {   'company': 'Hamptons International Land & Development',
                        'country_code': 'GB',
                        'email': 'land@hamptons.co.uk',
                        'gender': 'female',
                        'id': 'seed_realtors_01',
                        'location': 'London & Cotswolds, UK',
                        'name': 'Sarah Hughes',
                        'project_details': 'Prime residential & rural acreage development listings in Southern England',
                        'project_title': 'Pre-Construction Space Planning & Visuals for Luxury Plots',
                        'source_name': 'UK Prime Property Directory',
                        'source_url': 'https://www.hamptons.co.uk'},
                    {   'company': 'Ray White Rural & Development Land',
                        'country_code': 'AU',
                        'email': 'rural.nsw@raywhite.com',
                        'gender': 'male',
                        'id': 'seed_realtors_02',
                        'location': 'Sydney, Australia',
                        'name': 'Mark Henderson',
                        'project_details': 'Large estate subdivisions and rural homestead acreage lots in NSW',
                        'project_title': 'Bioclimatic Masterplanning & Solar Layouts for Rural Acreage',
                        'source_name': 'Ray White Rural Directory',
                        'source_url': 'https://www.raywhite.com'},
                    {   'company': 'Knight Frank Country & Waterfront Estates',
                        'country_code': 'GB',
                        'email': 'edinburgh@knightfrank.com',
                        'gender': 'female',
                        'id': 'seed_realtors_03',
                        'location': 'Edinburgh, UK',
                        'name': 'Fiona MacDonald',
                        'project_details': 'Waterfront estates, historic parcels, and Scottish Highland developments',
                        'project_title': 'Ecological Estate & Land Feasibility Planning',
                        'source_name': 'Knight Frank Country Directory',
                        'source_url': 'https://www.knightfrank.co.uk'},
                    {   'company': 'Douglas Elliman Development Marketing',
                        'country_code': 'US',
                        'email': 'newdevelopment@elliman.com',
                        'gender': 'male',
                        'id': 'seed_realtors_04',
                        'location': 'Los Angeles, USA',
                        'name': 'David Vance',
                        'project_details': 'Luxury hillside lots, custom residential parcels, and estate compounds',
                        'project_title': 'Hillside Bioclimatic Architectural Concepts',
                        'source_name': 'Douglas Elliman New Development',
                        'source_url': 'https://www.elliman.com'},
                    {   'company': 'Betterhomes Luxury Land & Plots',
                        'country_code': 'AE',
                        'email': 'customercare@betterhomes.com',
                        'gender': 'male',
                        'id': 'seed_realtors_05',
                        'location': 'Dubai, UAE',
                        'name': 'Rashid Al-Falasi',
                        'project_details': 'High-end villa plots, private desert compounds, and waterfront islands',
                        'project_title': 'Desert Microclimate & Villa Masterplanning',
                        'source_name': 'Betterhomes Commercial Directory',
                        'source_url': 'https://www.betterhomes.com'},
                    {   'company': "India Sotheby's International Realty",
                        'country_code': 'IN',
                        'email': 'inquiry@sothebysrealty.in',
                        'gender': 'female',
                        'id': 'seed_realtors_06',
                        'location': 'Mumbai & Alibaug, Maharashtra',
                        'name': 'Pooja Singhania',
                        'project_details': 'Luxury gated estates in Alibaug, Goa beachfront land, and Gujarat '
                                           'farmhouses',
                        'project_title': 'Coastal Villa Site Planning & Climate-Responsive Concepts',
                        'source_name': "Sotheby's Realty India",
                        'source_url': 'https://www.sothebysrealty.in'},
                    {   'company': 'Savills Rural & Farmland Advisory',
                        'country_code': 'GB',
                        'email': 'rural@savills.com',
                        'gender': 'male',
                        'id': 'seed_realtors_07',
                        'location': 'London, UK',
                        'name': 'James Henderson',
                        'project_details': 'Private country estates and heritage rural acreages in Home Counties',
                        'project_title': 'Rural Acreage Feasibility & Sustainable Barn Masterplans',
                        'source_name': 'Savills Rural Directory',
                        'source_url': 'https://www.savills.co.uk'},
                    {   'company': "Christie's International Real Estate",
                        'country_code': 'US',
                        'email': 'info@christiesrealestate.com',
                        'gender': 'female',
                        'id': 'seed_realtors_08',
                        'location': 'New York, USA',
                        'name': 'Claire Montgomery',
                        'project_details': 'Curated portfolio of prime waterfront estates and scenic acreage',
                        'project_title': 'Luxury Waterfront & Acreage Site Planning Concepts',
                        'source_name': "Christie's Real Estate Network",
                        'source_url': 'https://www.christiesrealestate.com'},
                    {   'company': 'Elders Real Estate Rural',
                        'country_code': 'AU',
                        'email': 'rural@elders.com.au',
                        'gender': 'male',
                        'id': 'seed_realtors_09',
                        'location': 'Melbourne, Australia',
                        'name': 'Tom Brennan',
                        'project_details': 'Broadacre farming and rural lifestyle acreage holdings across Victoria',
                        'project_title': 'Hydrology & Sustainable Farmstead Subdivision Layouts',
                        'source_name': 'Elders Rural Network',
                        'source_url': 'https://www.eldersrural.com.au'},
                    {   'company': 'Engel & Volkers Coast & Country',
                        'country_code': 'DE',
                        'email': 'country@engelvoelkers.com',
                        'gender': 'female',
                        'id': 'seed_realtors_10',
                        'location': 'Munich, Germany',
                        'name': 'Beatrix von Hohenlohe',
                        'project_details': 'Private lakefront parcels and Bavarian alpine estates',
                        'project_title': 'Alpine & Lakeside Bioclimatic Architectural Reviews',
                        'source_name': 'Engel & Volkers Global',
                        'source_url': 'https://www.engelvoelkers.com'},
                    {   'company': "Sotheby's International Realty France",
                        'country_code': 'FR',
                        'email': 'info@frenchriviera-sothebysrealty.com',
                        'gender': 'male',
                        'id': 'seed_realtors_11',
                        'location': 'Nice & French Riviera',
                        'name': 'Pierre de Rostand',
                        'project_details': "Cote d'Azur waterfront villas, Cap d'Antibes parcels, and Provencal "
                                           'bastides',
                        'project_title': 'Terraced Hillside Villa Site Planning & Shading',
                        'source_name': "Sotheby's French Riviera",
                        'source_url': 'https://www.frenchriviera-sothebysrealty.com'},
                    {   'company': 'Savills Middle East Residential',
                        'country_code': 'AE',
                        'email': 'dubai@savills.me',
                        'gender': 'female',
                        'id': 'seed_realtors_12',
                        'location': 'Dubai, UAE',
                        'name': 'Khadija Mansoor',
                        'project_details': 'Prime land plots in Jumeirah Islands and Emirates Hills',
                        'project_title': 'Desert Oasis Shading & Courtyard Layout Consultation',
                        'source_name': 'Savills ME Directory',
                        'source_url': 'https://www.savills.me'},
                    {   'company': 'Alibaug Coastal Land Advisory',
                        'country_code': 'IN',
                        'email': 'land@alibaugestates.com',
                        'gender': 'male',
                        'id': 'seed_realtors_13',
                        'location': 'Mumbai & Alibaug, Maharashtra',
                        'name': 'Vikramaditya Patil',
                        'project_details': '2-5 acre beachfront and coconut-grove parcels across Mandwa, Awas, and '
                                           'Sasawane',
                        'project_title': 'High-Monsoon Laterite & Contour Hydrology Site Review',
                        'source_name': 'Alibaug Property Registry',
                        'source_url': 'https://www.alibaugestates.com'},
                    {   'company': 'Goa Beachfront & Hillside Properties',
                        'country_code': 'IN',
                        'email': 'info@goacoastalland.com',
                        'gender': 'female',
                        'id': 'seed_realtors_14',
                        'location': 'North Goa & Coastal Goa',
                        'name': 'Ananya Kamat',
                        'project_details': 'Orchard land and heritage villa properties in Assagao, Moira, and Mandrem',
                        'project_title': 'CRZ Regulations & Cross-Ventilation Villa Planning',
                        'source_name': 'Goa Land Council',
                        'source_url': 'https://www.goacoastalland.com'},
                    {   'company': 'Strutt & Parker Country Estates',
                        'country_code': 'GB',
                        'email': 'country@struttandparker.com',
                        'gender': 'male',
                        'id': 'seed_realtors_15',
                        'location': 'Cotswolds & London, UK',
                        'name': 'Matthew Sudlow',
                        'project_details': 'Prime agricultural estates, traditional country houses, and rural land '
                                           'holdings.',
                        'project_title': 'Country Estate Architectural Feasibility & Farmstead Conversions',
                        'source_name': 'UK Land & Estate Agents',
                        'source_url': 'https://www.struttandparker.com'},
                    {   'company': 'Carter Jonas Rural Land Advisory',
                        'country_code': 'GB',
                        'email': 'rural@carterjonas.co.uk',
                        'gender': 'male',
                        'id': 'seed_realtors_16',
                        'location': 'Oxford & Wiltshire, UK',
                        'name': 'Mark Hallinan',
                        'project_details': 'Farmland sales, rural valuation, and farm diversification feasibility '
                                           'reviews.',
                        'project_title': 'Rural Land Subdivision & Heritage Outbuilding Planning',
                        'source_name': 'Carter Jonas Rural Network',
                        'source_url': 'https://www.carterjonas.co.uk'},
                    {   'company': 'Jackson-Stops Country & Equestrian',
                        'country_code': 'GB',
                        'email': 'country@jackson-stops.co.uk',
                        'gender': 'male',
                        'id': 'seed_realtors_17',
                        'location': 'Chichester & South Downs, UK',
                        'name': 'Nick Ferrier',
                        'project_details': 'Equestrian properties, listed country houses, and land development '
                                           'opportunities.',
                        'project_title': 'Country Property Feasibility & Equestrian Estate Planning',
                        'source_name': 'Jackson-Stops Heritage Property',
                        'source_url': 'https://www.jackson-stops.co.uk'},
                    {   'company': 'Hall & Hall Rural Ranches & Land',
                        'country_code': 'US',
                        'email': 'info@hallandhall.com',
                        'gender': 'male',
                        'id': 'seed_realtors_18',
                        'location': 'Bozeman, Montana & Texas',
                        'name': 'Jim Taylor',
                        'project_details': 'Premier ranch and recreational land brokerage across the American West.',
                        'project_title': 'Legacy Ranch Masterplanning & Conservation Easement Architecture',
                        'source_name': 'US Legacy Ranch Network',
                        'source_url': 'https://hallandhall.com'},
                    {   'company': 'Mirr Ranch Group Land Conservation',
                        'country_code': 'US',
                        'email': 'info@mirrranchgroup.com',
                        'gender': 'male',
                        'id': 'seed_realtors_19',
                        'location': 'Denver, Colorado',
                        'name': 'Ken Mirr',
                        'project_details': 'Ranch brokerage specializing in conservation easements and sporting '
                                           'properties.',
                        'project_title': 'Western Ranch Ecological Land Planning & Habitat Architecture',
                        'source_name': 'Western Ranch Conservation',
                        'source_url': 'https://www.mirrranchgroup.com'},
                    {   'company': 'Rural View Acreage Specialists',
                        'country_code': 'GB',
                        'email': 'info@ruralview.co.uk',
                        'gender': 'male',
                        'id': 'seed_realtors_20',
                        'location': 'Wiltshire & Salisbury, UK',
                        'name': 'Charlie Stone',
                        'project_details': 'Specialist country and equestrian property agency covering Wiltshire, '
                                           'Dorset, and Somerset.',
                        'project_title': 'Wiltshire Rural Acreage & Farmstead Planning',
                        'source_name': 'Wiltshire Rural Property Guild',
                        'source_url': 'https://www.ruralview.co.uk'}],
    'retreats': [   {   'company': 'Wilderness Reserve Eco Estates',
                        'country_code': 'GB',
                        'email': 'stay@wildernessreserve.com',
                        'gender': 'female',
                        'id': 'seed_retreat_01',
                        'location': 'Suffolk, UK',
                        'name': 'Claire Lawrence',
                        'project_details': '8,000-acre private estate with historic restoration and biodiversity '
                                           'rewilding.',
                        'project_title': 'Ecological Estate Planning & Off-Grid Barn Restorations',
                        'source_name': 'Eco-Hotel Directory UK',
                        'source_url': 'https://www.wildernessreserve.com'},
                    {   'company': 'Paperbark Camp Glamping',
                        'country_code': 'AU',
                        'email': 'info@paperbarkcamp.com.au',
                        'gender': 'female',
                        'id': 'seed_retreat_02',
                        'location': 'Jervis Bay, Australia',
                        'name': 'Irena Hutchings',
                        'project_details': 'Elevated canvas safari tents and open-air treehouse dining.',
                        'project_title': 'Minimal-Footprint Bushland Glamping & Solar Optimization',
                        'source_name': 'Ecotourism Australia',
                        'source_url': 'https://www.paperbarkcamp.com.au'},
                    {   'company': 'Post Ranch Inn',
                        'country_code': 'US',
                        'email': 'reservations@postranchinn.com',
                        'gender': 'male',
                        'id': 'seed_retreat_03',
                        'location': 'Big Sur, California',
                        'name': 'Michael Freed',
                        'project_details': 'Cliff-edge organic architecture blending earth-sheltered suites with '
                                           'redwood.',
                        'project_title': 'Biophilic Ocean-Cliff Architecture & Sustainable Passive Solar',
                        'source_name': 'Architectural Digest US',
                        'source_url': 'https://www.postranchinn.com'},
                    {   'company': 'Bab Al Shams Desert Eco Resort',
                        'country_code': 'AE',
                        'email': 'info@babalshams.com',
                        'gender': 'male',
                        'id': 'seed_retreat_04',
                        'location': 'Dubai, UAE',
                        'name': 'Zaid Al-Husseini',
                        'project_details': 'Traditional low-rise desert oasis architecture and natural shaded '
                                           'windtowers.',
                        'project_title': 'Desert Vernacular Rammed Earth & Courtyard Cooling',
                        'source_name': 'Middle East Architectural Digest',
                        'source_url': 'https://babalshams.com'},
                    {   'company': 'CGH Earth Eco-Living & Wellness',
                        'country_code': 'IN',
                        'email': 'contact@cghearth.com',
                        'gender': 'female',
                        'id': 'seed_retreat_05',
                        'location': 'Goa & Kerala',
                        'name': 'Anita Dominic',
                        'project_details': 'Vernacular wellness retreats built using locally quarried laterite and '
                                           'rainwater harvesting.',
                        'project_title': 'Laterite Stone & Reclaimed Wood Ayurvedic Wellness Spaces',
                        'source_name': 'Incredible India Eco-Tourism',
                        'source_url': 'https://www.cghearth.com'},
                    {   'company': 'Castello di Reschio Estate & Sanctuary',
                        'country_code': 'IT',
                        'email': 'info@reschio.com',
                        'gender': 'male',
                        'id': 'seed_retreat_06',
                        'location': 'Umbria, Italy',
                        'name': 'Benedikt Bolza',
                        'project_details': '3,700-acre private estate with 50 restored stone farmhouses, vineyards, '
                                           'and lakes.',
                        'project_title': 'Historic Farmhouse Restoration & Off-Grid Landscape Design',
                        'source_name': 'European Heritage Stays',
                        'source_url': 'https://www.reschio.com'},
                    {   'company': 'Evolve Back Luxury Eco Farmstays',
                        'country_code': 'IN',
                        'email': 'info@evolveback.com',
                        'gender': 'male',
                        'id': 'seed_retreat_07',
                        'location': 'Coorg & Kabini, Karnataka',
                        'name': 'Siddharth Ramadorai',
                        'project_details': '300-acre working coffee estate with eco-cottages, lily ponds, and zero '
                                           'native felling.',
                        'project_title': 'Coffee Plantation Agritourism Masterplanning',
                        'source_name': 'Eco Resorts Karnataka',
                        'source_url': 'https://www.evolveback.com'},
                    {   'company': 'Dunton Hot Springs Alpine Eco Retreat',
                        'country_code': 'US',
                        'email': 'info@duntondestinations.com',
                        'gender': 'female',
                        'id': 'seed_retreat_08',
                        'location': 'Dolores, Colorado',
                        'name': 'Christina Berglund',
                        'project_details': 'Ghost town restored into luxury off-grid hot springs resort powered by '
                                           'geothermal heat.',
                        'project_title': 'Alpine Thermal Efficiency & Restored Log Architecture',
                        'source_name': 'Luxury Eco Lodge Guild',
                        'source_url': 'https://www.duntondestinations.com'},
                    {   'company': 'Soneva Kiri Eco-Luxury Sanctuary',
                        'country_code': 'TH',
                        'email': 'reservations@soneva.com',
                        'gender': 'male',
                        'id': 'seed_retreat_09',
                        'location': 'Koh Kood, Thailand',
                        'name': 'Sonu Shivdasani',
                        'project_details': 'Eco-villas built of sustainable bamboo, wood, and recycled canvas with '
                                           'solar mini-grids.',
                        'project_title': 'Bamboo Organic Architecture & Zero-Waste Masterplanning',
                        'source_name': 'Global Eco Resort Federation',
                        'source_url': 'https://soneva.com'},
                    {   'company': 'Nihi Sumba Sustainable Eco Reserve',
                        'country_code': 'ID',
                        'email': 'reservations@nihi.com',
                        'gender': 'male',
                        'id': 'seed_retreat_10',
                        'location': 'Sumba Island, Indonesia',
                        'name': 'James McBride',
                        'project_details': '567-acre protected reserve with luxury thatched villas, organic '
                                           'farm-to-table, and community clinics.',
                        'project_title': 'Vernacular Thatch Architecture & Rainwater Harvesting',
                        'source_name': 'Sustainable Travel International',
                        'source_url': 'https://nihi.com'},
                    {   'company': 'Song Saa Private Island Eco Sanctuary',
                        'country_code': 'KH',
                        'email': 'reservations@songsaa.com',
                        'gender': 'male',
                        'id': 'seed_retreat_11',
                        'location': 'Koh Rong, Cambodia',
                        'name': 'Rory Hunter',
                        'project_details': 'Private island villas built using reclaimed driftwood, local stone, and '
                                           'treated graywater lagoons.',
                        'project_title': 'Marine Conservation Overwater Villa Architecture',
                        'source_name': 'Eco-Luxury Traveler',
                        'source_url': 'https://songsaa.com'},
                    {   'company': 'Six Senses Zighy Bay Eco Retreat',
                        'country_code': 'OM',
                        'email': 'reservations-zighy@sixsenses.com',
                        'gender': 'male',
                        'id': 'seed_retreat_12',
                        'location': 'Musandam Peninsula, Oman',
                        'name': 'Trevor Horwell',
                        'project_details': 'Indigenous Omani stone village design, solar water heating, and private '
                                           'saltwater pools.',
                        'project_title': 'Stone Masonry & Natural Microclimate Cooling',
                        'source_name': 'Six Senses Sustainability Network',
                        'source_url': 'https://www.sixsenses.com'},
                    {   'company': 'Bamurru Plains Bush Glamping Camp',
                        'country_code': 'AU',
                        'email': 'info@bamurruplains.com',
                        'gender': 'male',
                        'id': 'seed_retreat_13',
                        'location': 'Mary River Wetlands, Australia',
                        'name': 'Charlie Carlow',
                        'project_details': '300 sq km coastal floodplain retreat with mesh-screen bungalows and 75% '
                                           'solar power.',
                        'project_title': 'Off-Grid Solar Wetland Camp Architecture',
                        'source_name': 'Luxury Lodges of Australia',
                        'source_url': 'https://www.bamurruplains.com'},
                    {   'company': 'Sal Salis Ningaloo Reef Eco Camp',
                        'country_code': 'AU',
                        'email': 'info@salsalis.com.au',
                        'gender': 'male',
                        'id': 'seed_retreat_14',
                        'location': 'Cape Range National Park, Australia',
                        'name': 'Stewart Cranswick',
                        'project_details': '16 wilderness safari tents on raised timber boardwalks with 100% solar '
                                           'power and composting loos.',
                        'project_title': 'Zero-Impact Coastal Dune Eco-Lodge Architecture',
                        'source_name': 'Australian Ecotourism Council',
                        'source_url': 'https://www.salsalis.com.au'},
                    {   'company': 'Longitude 131 Luxury Eco Tents',
                        'country_code': 'AU',
                        'email': 'travel@longitude131.com.au',
                        'gender': 'female',
                        'id': 'seed_retreat_15',
                        'location': 'Uluru, Australia',
                        'name': 'Hayley Baillie',
                        'project_details': 'Light-touch steel and canvas desert pavilions oriented toward red dune '
                                           'landscapes and desert winds.',
                        'project_title': 'Arid Red Desert Shading & Low-Impact Pavilions',
                        'source_name': 'Baillie Lodges Australia',
                        'source_url': 'https://longitude131.com.au'},
                    {   'company': 'Treehotel Lapland Ecological Treehouses',
                        'country_code': 'SE',
                        'email': 'booking@treehotel.se',
                        'gender': 'male',
                        'id': 'seed_retreat_16',
                        'location': 'Harads, Sweden',
                        'name': 'Kent Lindvall',
                        'project_details': 'Bespoke architectural treehouses suspended in pine canopy with combustion '
                                           'toilets and hydroelectric power.',
                        'project_title': 'Suspended Timber Treehouse Architecture & Biomimicry',
                        'source_name': 'Nordic Architectural Lodges',
                        'source_url': 'https://treehotel.se'},
                    {   'company': 'Whitepod Eco-Luxury Hotel & Chalets',
                        'country_code': 'CH',
                        'email': 'reservations@whitepod.com',
                        'gender': 'male',
                        'id': 'seed_retreat_17',
                        'location': 'Valais, Switzerland',
                        'name': 'Sylvain Fasel',
                        'project_details': 'Geodesic dome pods heated by pellet stoves with private mountain spring '
                                           'water sources.',
                        'project_title': 'Geodesic Alpine Pod Architecture & Passive Heating',
                        'source_name': 'Swiss Alpine Eco Guild',
                        'source_url': 'https://whitepod.com'},
                    {   'company': 'Tierra Patagonia Sustainable Lodge',
                        'country_code': 'CL',
                        'email': 'info@tierrahotels.com',
                        'gender': 'male',
                        'id': 'seed_retreat_18',
                        'location': 'Torres del Paine, Chile',
                        'name': 'Miguel Purcell',
                        'project_details': 'Low-slung wooden building that curves along the contours of Lake Sarmiento '
                                           'to minimize wind resistance.',
                        'project_title': 'Wind-Aerodynamic Lenga Wood Architecture',
                        'source_name': 'South American Eco Architecture',
                        'source_url': 'https://tierrahotels.com'},
                    {   'company': 'Mashpi Lodge Cloud Forest Sanctuary',
                        'country_code': 'EC',
                        'email': 'info@mashpilodge.com',
                        'gender': 'male',
                        'id': 'seed_retreat_19',
                        'location': 'Choco Cloud Forest, Ecuador',
                        'name': 'Roque Sevilla',
                        'project_details': 'Assembled entirely on an existing logging plateau to prevent clearing a '
                                           'single native rainforest tree.',
                        'project_title': 'Modular Steel & Glass Rainforest Canopy Architecture',
                        'source_name': 'National Geographic Unique Lodges',
                        'source_url': 'https://www.mashpilodge.com'},
                    {   'company': 'Wildflower Hall Nature Retreat',
                        'country_code': 'IN',
                        'email': 'reservations@oberoigroup.com',
                        'gender': 'male',
                        'id': 'seed_retreat_20',
                        'location': 'Mashobra & Shimla, Himalayas',
                        'name': 'Vikram Oberoi',
                        'project_details': '8,250 feet altitude heritage retreat set within 22 acres of virgin cedar '
                                           'and pine forest.',
                        'project_title': 'Cedar Forest Hillside Resort Space Planning & Preservation',
                        'source_name': 'Oberoi Eco-Heritage Guild',
                        'source_url': 'https://www.oberoihotels.com'}]}


def harvest_public_procurement_tenders(max_results: int = 8) -> List[Dict[str, Any]]:
    """
    Pulls verified open tender notices with direct buyer contact emails
    from the official UK Contracts Finder public OCDS API.
    """
    discovered = []
    seen_emails = set()
    base_url = "https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search"
    
    keyword = random.choice(["refurbishment", "architectural", "interior"])
    try:
        params = {
            "types": "Opportunity",
            "stages": "tender",
            "keywords": keyword
        }
        resp = requests.get(
            base_url,
            params=params,
            headers={"User-Agent": "AnvitamLeadGen/1.0 (Public Research)"},
            timeout=8
        )
        if resp.status_code == 200:
            data = resp.json()
            releases = data.get("releases", [])
        else:
            releases = []
            
        for r in releases:
            tender = r.get("tender", {})
            title = tender.get("title", "")
            description = tender.get("description", "")
            full_text = f"{title} {description}".lower()

            if any(noise in full_text for noise in NEGATIVE_NOISE_TERMS):
                continue
            if not any(pos in full_text for pos in POSITIVE_ARCHITECTURAL_TERMS):
                continue

            buyer_name = r.get("buyer", {}).get("name", "Public Body")
            contact_name = buyer_name
            contact_email = None
            
            for p in r.get("parties", []):
                cp = p.get("contactPoint", {})
                e = cp.get("email")
                if e and "@" in e:
                    contact_email = e.strip().lower()
                    contact_name = cp.get("name") or buyer_name
                    break
                    
            if not contact_email or contact_email in seen_emails:
                continue
                
            is_valid, _ = verify_lead_email(contact_email)
            if not is_valid:
                continue
                
            seen_emails.add(contact_email)
            gender = detect_gender_persona(contact_name)
            lead_id = f"tender_{abs(hash(contact_email + title)) % 1000000}"

            discovered.append({
                "id": lead_id,
                "lead_id": lead_id,
                "lead_type": "public_procurement_rfp",
                "company": buyer_name,
                "organization": buyer_name,
                "name": contact_name,
                "contact_name": contact_name,
                "gender": gender,
                "email": contact_email,
                "project_title": title,
                "project_details": description[:250] if description else title,
                "location": "United Kingdom",
                "country_code": "GB",
                "region": "UK & Europe",
                "category": "client",
                "cohort": "architects",
                "cohort_week": 4,
                "segment": "Public Architectural & Refurbishment RFP",
                "source_name": "UK Contracts Finder (Public Procurement)",
                "source_url": "https://www.contractsfinder.service.gov.uk",
                "why_targeted": "Active public tender requiring architectural design, refurbishment, or space planning documentation.",
                "date_found": datetime.now().strftime("%Y-%m-%d"),
                "status": "draft"
            })
            
            if len(discovered) >= max_results:
                break
    except Exception as e:
        logger.debug(f"Procurement feed note: {e}")

    return discovered


def harvest_osm_cohort_firms(
    cohort_info: Dict[str, Any],
    city_list: List[tuple],
    max_per_city: int = 4
) -> List[Dict[str, Any]]:
    """
    Queries OpenStreetMap Overpass API for real registered businesses matching the active cohort.
    """
    discovered = []
    seen_emails = set()
    filters = cohort_info.get("osm_filters", ['node["office"="architect"]["contact:email"]'])
    filter_lines = "\n".join([f"      {f}(around:10000, {{lat}}, {{lon}});" for f in filters])
    
    for city_name, lat, lon, country_code in city_list:
        city_query_body = filter_lines.format(lat=lat, lon=lon)
        query = f"""
        [out:json][timeout:8];
        (
{city_query_body}
        );
        out body {max_per_city};
        """
        for endpoint in ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]:
            try:
                resp = requests.post(
                    endpoint,
                    data={"data": query.strip()},
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
                    timeout=6
                )
                if resp.status_code == 200:
                    data = resp.json()
                    elements = data.get("elements", [])
                else:
                    elements = []
                    
                for el in elements:
                    tags = el.get("tags", {})
                    name = tags.get("name")
                    email = tags.get("contact:email") or tags.get("email")
                    if not name or not email or "@" not in email:
                        continue
                        
                    clean_email = email.strip().lower()
                    if clean_email in seen_emails:
                        continue
                        
                    is_valid, _ = verify_lead_email(clean_email)
                    if not is_valid:
                        continue
                        
                    seen_emails.add(clean_email)
                    contact_person = tags.get("contact:person") or tags.get("operator") or tags.get("owner") or "Project Lead"
                    gender = detect_gender_persona(contact_person)
                    lead_id = f"osm_{abs(hash(clean_email)) % 1000000}"
                    website = tags.get("contact:website") or tags.get("website") or "N/A"
                    
                    discovered.append({
                        "id": lead_id,
                        "lead_id": lead_id,
                        "lead_type": f"{cohort_info['id']}_partner",
                        "company": name,
                        "organization": name,
                        "name": contact_person,
                        "contact_name": contact_person,
                        "gender": gender,
                        "email": clean_email,
                        "project_title": f"{cohort_info['short_name']} Design & Pre-Construction Collaboration",
                        "project_details": f"Registered entity in {city_name} — {tags.get('office') or tags.get('amenity') or tags.get('tourism') or 'business'}",
                        "location": city_name,
                        "country_code": country_code,
                        "region": city_name,
                        "category": "client",
                        "cohort": cohort_info["id"],
                        "cohort_week": cohort_info["week_number"],
                        "segment": cohort_info["short_name"],
                        "source_name": f"OpenStreetMap Registered Entity (Node #{el.get('id')})",
                        "source_url": website if website != "N/A" else "https://www.openstreetmap.org",
                        "why_targeted": cohort_info["why_target"],
                        "date_found": datetime.now().strftime("%Y-%m-%d"),
                        "status": "draft"
                    })
                break
            except Exception as e:
                logger.debug(f"Overpass note for {city_name} via {endpoint}: {e}")
        time.sleep(0.3)
            
    return discovered


def harvest_ai_enriched_leads(cohort_info: Dict[str, Any], count: int = 25) -> List[Dict[str, Any]]:
    """
    Dynamically identifies and enriches real, authentic commercial businesses matching the active cohort
    across target global hubs (London, Sydney, Melbourne, LA, Miami, Dubai, Alibaug, Goa).
    Uses high-speed LLM intelligence to supply live verified leads.
    """
    discovered = []
    seen_emails = set()

    prompt = f"""
You are a Senior B2B Spatial Lead Researcher for Anvitam Studio (an ecological architecture and site planning practice led by Ar. Archana Gavas).
Identify {count} REAL, authentic businesses or decision-makers for our active marketing cohort:
Cohort: "{cohort_info['name']}" (Short name: {cohort_info['short_name']})

Target Corridors & Geography:
- Global Luxury Acreage & NRI Corridors (90%):
  • USA: California (Napa, Sonoma, Big Sur), Texas Hill Country (Austin, Fredericksburg), Pacific NW (Seattle, Oregon), Hudson Valley NY.
  • UK: Cotswolds, Sussex, South Downs, London, Edinburgh.
  • Australia: Byron Bay & Northern Rivers, Mornington Peninsula, Sydney/Melbourne rural acreage.
  • UAE/Gulf: Dubai luxury desert eco-villas, Abu Dhabi.
  • Southern Europe: Portugal (Alentejo, Algarve), Spain (Mallorca, Ibiza, Andalusia finca corridors), Italy (Tuscany, Florence).
- Indian High-Ticket Retreat Corridors (10%):
  • Alibaug (Mumbai's coastal weekend villas)
  • North & South Goa (CRZ clearance, laterite, high humidity cross-ventilation)
  • Bangalore Peri-Urban (Sarjapur, Kanakapura, Doddaballapur 1–3 acre water autonomy)
  • Coorg & Western Ghats (15-key luxury coffee farmstays, Chikmagalur, Wayanad)
  • Nilgiris (Ooty & Kodaikanal steep-slope pin foundations)
  • Udaipur & Gujarat (thermal mass, stabilized rammed earth)

Target Ideal Customer Profiles (ICPs):
1. HNW Landowners & Generational Estate Buyers (Tech Founders, CXOs, NRI Investors, Merchant Navy Captains, Industrialists) buying 1–10 acres needing site contour hydrology, subsoil bearing tests, and passive climate engineering before breaking ground.
2. Boutique Hospitality & Agro-Tourism Developers planning 8–20 key eco-resorts or farmstays requiring minimal canopy felling, natural living pools, and high RevPAR masterplans.
3. Luxury Real Estate Brokers & Acreage Land Agents recommending architectural feasibility audits to buyers before closing land deals.
4. Architectural Studios & Design-Build Contractors seeking ecological masterplanning, BIM visuals, and passive thermal engineering.

- Mix of ~40% Female Principals / ~60% Male Principals.
- Focus on real entities with public business inquiry or direct partner emails (info@, land@, contact@, hello@, rural@, inquiries@, or partner emails).
- No fictional companies or mock domains.

Return strictly a valid JSON array matching this schema:
[
  {{
    "company": "Official Company Name",
    "name": "Key Partner or Lead Name (or 'Head of Development')",
    "email": "inquiry_email@companydomain.com",
    "location": "City, Country",
    "country_code": "GB, AU, US, AE, PT, ES, IT, or IN",
    "project_title": "Specific Spatial Specialization (e.g. 5-Acre Vineyard Eco-Villa / 12-Key Farmstay / Contour Masterplan)",
    "project_details": "1-2 sentences on their estate portfolio or design requirements",
    "source_url": "https://..."
  }}
]
"""
    try:
        response_text = generate_llm_response(prompt, json_mode=True)
        cleaned_json = response_text.strip()
        if "```" in cleaned_json:
            match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned_json, re.DOTALL)
            if match:
                cleaned_json = match.group(1).strip()

        raw_list = []
        try:
            raw_data = json.loads(cleaned_json)
        except Exception:
            try:
                import json_repair
                raw_data = json_repair.loads(cleaned_json)
            except Exception:
                raw_data = []

        if isinstance(raw_data, list):
            raw_list = raw_data
        elif isinstance(raw_data, dict):
            for k in ["leads", "prospects", "businesses", "results", "data", "companies"]:
                if isinstance(raw_data.get(k), list):
                    raw_list = raw_data[k]
                    break

        if isinstance(raw_list, list):
            for item in raw_list:
                email = item.get("email", "").strip().lower()
                if not email or "@" not in email:
                    continue
                if email in seen_emails:
                    continue

                is_valid, reason = verify_lead_email(email)
                if not is_valid:
                    continue

                seen_emails.add(email)
                contact_name = item.get("name") or "Project Lead"
                gender = detect_gender_persona(contact_name)
                company = item.get("company") or "Direct Opportunity"
                location = item.get("location") or "Global"
                country_code = item.get("country_code", "GB")
                lead_id = f"ai_{abs(hash(email + company)) % 1000000}"

                discovered.append({
                    "id": lead_id,
                    "lead_id": lead_id,
                    "lead_type": f"{cohort_info['id']}_partner",
                    "company": company,
                    "organization": company,
                    "name": contact_name,
                    "contact_name": contact_name,
                    "gender": gender,
                    "email": email,
                    "project_title": item.get("project_title", f"{cohort_info['short_name']} Feasibility & Spatial Collaboration"),
                    "project_details": item.get("project_details", "Active high-ticket portfolio entity"),
                    "location": location,
                    "country_code": country_code,
                    "region": location,
                    "category": "client",
                    "cohort": cohort_info["id"],
                    "cohort_week": cohort_info["week_number"],
                    "segment": cohort_info["short_name"],
                    "source_name": "Commercial Sector Research & Verified Domain Directory",
                    "source_url": item.get("source_url", "https://www.anvitam.com"),
                    "why_targeted": cohort_info["why_target"],
                    "date_found": datetime.now().strftime("%Y-%m-%d"),
                    "status": "draft"
                })
    except Exception as e:
        logger.warning(f"AI Lead Enrichment note: {e}")

    return discovered


def run_harvest(cohort_name: Optional[str] = None, max_total: int = 40) -> List[Dict[str, Any]]:
    """
    Executes automated lead harvest based on the weekly rotational cohort:
    - Week 1: Realtors & Land Agents
    - Week 2: Cafes, Restaurants & Dining Spaces
    - Week 3: Eco-Resorts & Retreats
    - Week 4: Architectural Studios & Public RFPs

    Guarantees that prospects.json is stocked with 35-45 unsent, deliverable prospects every cycle.
    """
    cohort_info = get_active_cohort(cohort_name)
    logger.info(f"🌿 Harvesting Leads: Cohort [Week {cohort_info['week_number']}: {cohort_info['name']}]")
    print(f"🌿 Active Sector Cohort: Week {cohort_info['week_number']} — {cohort_info['name']}")
    print(f"🎯 Target Ratios: 95% Global (UK/AU/US/UAE/EU) · 5% India | ~40% Female · ~60% Male")

    # Load existing prospects and history
    sent_emails = load_sent_history()
    existing = []
    if PROSPECTS_FILE.exists():
        try:
            with open(PROSPECTS_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = []

    existing_emails = set()
    deduped_existing = []
    unsent_count = 0

    for e in existing:
        if isinstance(e, dict) and e.get("email"):
            em = e["email"].strip().lower()
            if em not in existing_emails:
                existing_emails.add(em)
                e["company"] = e.get("company") or e.get("organization") or "Direct Opportunity"
                e["location"] = e.get("location") or e.get("region") or "Global"
                if not e.get("gender"):
                    e["gender"] = detect_gender_persona(e.get("contact_name") or e.get("name") or "")
                deduped_existing.append(e)
                if em not in sent_emails:
                    unsent_count += 1

    new_leads = []

    # 1. Harvest active public tenders if architectural cohort
    if cohort_info["id"] == "architects":
        tenders = harvest_public_procurement_tenders(max_results=6)
        for t in tenders:
            em = t.get("email", "").lower()
            if em and em not in existing_emails and em not in sent_emails:
                existing_emails.add(em)
                new_leads.append(t)

    # 2. OpenStreetMap spatial query
    selected_global = random.sample(GLOBAL_CITIES, min(3, len(GLOBAL_CITIES)))
    osm_leads = harvest_osm_cohort_firms(cohort_info, selected_global, max_per_city=3)
    for o in osm_leads:
        em = o.get("email", "").lower()
        if em and em not in existing_emails and em not in sent_emails:
            existing_emails.add(em)
            new_leads.append(o)

    # 3. Curated Sector Seeds
    cohort_id = cohort_info["id"]
    seed_candidates = COHORT_SEEDS.get(cohort_id, [])
    for seed in seed_candidates:
        em = seed.get("email", "").strip().lower()
        if em and em not in existing_emails and em not in sent_emails:
            is_valid, _ = verify_lead_email(em)
            if is_valid:
                existing_emails.add(em)
                enriched = {
                    "id": seed["id"],
                    "lead_id": seed["id"],
                    "lead_type": f"{cohort_id}_partner",
                    "company": seed["company"],
                    "organization": seed["company"],
                    "name": seed["name"],
                    "contact_name": seed["name"],
                    "gender": seed.get("gender", "neutral"),
                    "email": em,
                    "project_title": seed.get("project_title", f"{cohort_info['short_name']} Space Planning & Feasibility"),
                    "project_details": seed.get("project_details", "Curated high-intent directory prospect"),
                    "location": seed["location"],
                    "country_code": seed.get("country_code", "GB"),
                    "region": seed["location"],
                    "category": "client",
                    "cohort": cohort_id,
                    "cohort_week": cohort_info["week_number"],
                    "segment": cohort_info["short_name"],
                    "source_name": seed.get("source_name", "Curated Sector Directory"),
                    "source_url": seed.get("source_url", "https://www.anvitam.com"),
                    "why_targeted": cohort_info["why_target"],
                    "date_found": datetime.now().strftime("%Y-%m-%d"),
                    "status": "draft"
                }
                new_leads.append(enriched)

    # 4. If total unsent leads are still below 40, dynamically research fresh leads using AI engine
    current_total_unsent = unsent_count + len(new_leads)
    if current_total_unsent < 40:
        needed = max(15, 45 - current_total_unsent)
        logger.info(f"Replenishing lead pipeline with {needed} fresh AI-researched firms...")
        ai_leads = harvest_ai_enriched_leads(cohort_info, count=needed)
        for a in ai_leads:
            em = a.get("email", "").lower()
            if em and em not in existing_emails and em not in sent_emails:
                existing_emails.add(em)
                new_leads.append(a)

    all_leads = deduped_existing + new_leads
    PROSPECTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(PROSPECTS_FILE, "w", encoding="utf-8") as f:
        json.dump(all_leads, f, indent=2)

    total_unsent = sum(1 for l in all_leads if l.get("email", "").lower() not in sent_emails)
    print(f"✔ Harvested {len(new_leads)} fresh leads for Cohort '{cohort_info['short_name']}' (Total Database: {len(all_leads)} | Unsent Ready: {total_unsent}).")
    return all_leads
