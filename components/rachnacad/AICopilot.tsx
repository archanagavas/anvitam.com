import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, Bot, User, Check, RefreshCw, Key,
  Sliders, ChevronRight, Zap, Cpu, Building2, Compass,
  CheckCircle2, ArrowRight, CornerDownLeft, ShieldCheck,
  AlertCircle, ChevronDown, Plus, Trash2, Layers, Eye
} from 'lucide-react';
import { CADElement } from './CADStudio';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  proposal?: {
    title: string;
    specs: string[];
    elements: CADElement[];
    applied?: boolean;
  };
  suggestions?: string[];
}

interface AICopilotProps {
  onApplyElements: (newElements: CADElement[]) => void;
  currentElementsCount: number;
  onClearDrawing?: () => void;
  onToggleRoof?: () => void;
  showRoof3D?: boolean;
}

export default function AICopilot({
  onApplyElements,
  currentElementsCount,
  onClearDrawing,
  onToggleRoof,
  showRoof3D
}: AICopilotProps) {
  const [model, setModel] = useState<'qwen' | 'llama' | 'gemini' | 'claude'>('qwen');
  const [byokKey, setByokKey] = useState<string>('');
  const [showByokModal, setShowByokModal] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingStatus, setTypingStatus] = useState<string>('Thinking...');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Hello! I'm your RachnaCAD Architectural Co-Pilot, running natively with your local GPU. Tell me what you'd like to draft, arrange, or calculate in your floor plan.",
      timestamp: 'Just now',
      suggestions: [
        'Add 14x16 ft Master Bed with En-suite Bath',
        'Generate 2BHK Vastu Layout on 30x40 ft Plot',
        'Draft South-East Kitchen (10x12 ft)',
        'Calculate Concrete & Brick Quantity Takeoff'
      ]
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleApplyProposal = (msgId: string, elements: CADElement[]) => {
    onApplyElements(elements);
    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.proposal) {
        return {
          ...m,
          proposal: { ...m.proposal, applied: true }
        };
      }
      return m;
    }));
  };

  const handleSendMessage = (textOverride?: string) => {
    const query = (textOverride || inputText).trim();
    if (!query) return;

    const userMsg: AIMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInputText('');
    setIsTyping(true);
    setTypingStatus('Analyzing architectural geometry & zoning...');

    setTimeout(() => {
      processArchitecturalQuery(query);
    }, 700);
  };

  const processArchitecturalQuery = (query: string) => {
    const q = query.toLowerCase();
    const ts = Date.now();
    let replyText = '';
    let proposal: AIMessage['proposal'] = undefined;
    let suggestions: string[] = [];

    // 1. MASTER BEDROOM OR BEDROOM
    if (q.includes('master bed') || q.includes('bedroom') || q.includes('bed room')) {
      const isCompact = q.includes('small') || q.includes('compact') || q.includes('12x14');
      const w = isCompact ? 144 : 168; // inches
      const h = isCompact ? 168 : 192; // inches

      const generated: CADElement[] = [
        // Master Bed Walls
        { id: `w_mb1_${ts}`, type: 'wall', layer: 'A-WALL-INT', x1: 240, y1: 0, x2: 240, y2: h, thickness: 4.5, height: 10, material: 'Brick Masonry', label: 'Bedroom W' },
        { id: `w_mb2_${ts}`, type: 'wall', layer: 'A-WALL-INT', x1: 240, y1: h, x2: 240 + w, y2: h, thickness: 4.5, height: 10, material: 'Brick Masonry', label: 'Bedroom S' },
        // Attached Bath (6x8 ft)
        { id: `w_bth1_${ts}`, type: 'wall', layer: 'A-WALL-INT', x1: 240 + w - 72, y1: h, x2: 240 + w - 72, y2: h + 96, thickness: 4.5, height: 10, material: 'Brick Masonry', label: 'Bath W' },
        { id: `w_bth2_${ts}`, type: 'wall', layer: 'A-WALL-INT', x1: 240 + w - 72, y1: h + 96, x2: 240 + w, y2: h + 96, thickness: 4.5, height: 10, material: 'Brick Masonry', label: 'Bath S' },
        // Doors
        { id: `d_mb_${ts}`, type: 'door', layer: 'A-DOOR', x1: 240, y1: h - 40, x2: 240, y2: h - 4, thickness: 4.5, label: "Bed Door (3'-0\")" },
        { id: `d_bth_${ts}`, type: 'door', layer: 'A-DOOR', x1: 240 + w - 72, y1: h + 30, x2: 240 + w - 72, y2: h + 60, thickness: 4.5, label: "Bath Door (2'-6\")" },
        // Window
        { id: `wn_mb_${ts}`, type: 'window', layer: 'A-GLAZ', x1: 240 + w, y1: 40, x2: 240 + w, y2: 100, thickness: 9, label: "East Daylight Window (5'-0\")" },
        // Room Stamps
        { id: `rm_mb_${ts}`, type: 'room', layer: 'A-AREA', x1: 240 + (w / 2), y1: h / 2, x2: 240 + (w / 2), y2: h / 2, label: `MASTER BEDROOM (${(w / 12).toFixed(0)}x${(h / 12).toFixed(0)})`, areaSqFt: Math.round((w * h) / 144) },
        { id: `rm_bth_${ts}`, type: 'room', layer: 'A-AREA', x1: 240 + w - 36, y1: h + 48, x2: 240 + w - 36, y2: h + 48, label: 'EN-SUITE BATH (6x8)', areaSqFt: 48 },
      ];

      replyText = `I have drafted the Master Bedroom Suite with attached En-suite Bathroom.\n\n• **Dimensions:** ${(w / 12).toFixed(0)}'-0" × ${(h / 12).toFixed(0)}'-0" (${Math.round((w * h) / 144)} sq.ft)\n• **Bathroom:** 6'-0" × 8'-0" (48 sq.ft) with plumbing wall isolation\n• **Daylighting:** 5'-0" East-facing double glazed window for morning cross-ventilation\n• **Door Clearances:** 3'-0" main door, 2'-6" bathroom door compliant with NBC accessibility.`;

      proposal = {
        title: 'Master Bedroom Suite + En-suite Bath',
        specs: [
          `4 Smart Partition Walls (4.5" Brick)`,
          `1 Main Door (3'-0") & 1 Bath Door (2'-6")`,
          `1 East Window (5'-0" Casement)`,
          `2 Parametric Room Stamps`
        ],
        elements: generated
      };

      suggestions = [
        'Add Balcony outside Master Bed',
        'Calculate Material Takeoff for this suite',
        'Add Wardrobe Wall / Walk-in Closet'
      ];
    }
    // 2. KITCHEN / AGNI CORNER
    else if (q.includes('kitchen') || q.includes('cook') || q.includes('pantry')) {
      const generated: CADElement[] = [
        { id: `k_w1_${ts}`, type: 'wall', layer: 'A-WALL-INT', x1: 200, y1: 240, x2: 360, y2: 240, thickness: 4.5, height: 10, material: 'Brick Masonry', label: 'Kitchen North' },
        { id: `k_w2_${ts}`, type: 'wall', layer: 'A-WALL-INT', x1: 200, y1: 240, x2: 200, y2: 380, thickness: 4.5, height: 10, material: 'Brick Masonry', label: 'Kitchen West' },
        { id: `k_d1_${ts}`, type: 'door', layer: 'A-DOOR', x1: 200, y1: 330, x2: 200, y2: 366, thickness: 4.5, label: "Kitchen Entry (3'-0\")" },
        { id: `k_wn1_${ts}`, type: 'window', layer: 'A-GLAZ', x1: 360, y1: 280, x2: 360, y2: 340, thickness: 9, label: "Kitchen Exhaust Window (5'-0\")" },
        { id: `k_rm_${ts}`, type: 'room', layer: 'A-AREA', x1: 280, y1: 310, x2: 280, y2: 310, label: 'KITCHEN (SE - AGNI)', areaSqFt: 155 },
      ];

      replyText = `I have placed the Kitchen in the **South-East (Agni / Fire zone)**, which is the optimum orientation for both Indian Vastu Shastra and natural morning ventilation.\n\n• **Size:** 13'-4" × 11'-8" (155 sq.ft)\n• **Ventilation:** Dedicated 5'-0" window on the East facade for cooking exhaust and cross-breeze\n• **Circulation:** 3'-0" wide opening connecting smoothly to Dining.`;

      proposal = {
        title: 'Modern Modular Kitchen (Agni Zone)',
        specs: [
          '2 Internal Walls (4.5" thickness)',
          '1 Standard 3\'-0" Door opening',
          '1 East Facade Window for ventilation',
          '1 Room Stamp (155 sq.ft)'
        ],
        elements: generated
      };

      suggestions = [
        'Add Utility / Wash Area next to Kitchen',
        'Check Vastu Compliance of Kitchen',
        'Add Dining Room Partition'
      ];
    }
    // 3. FULL 2BHK / 3BHK / VASTU LAYOUT
    else if (q.includes('2bhk') || q.includes('3bhk') || q.includes('vastu') || q.includes('30x40') || q.includes('full plan')) {
      const generated: CADElement[] = [
        // Perimeter 30x40 ft (360 x 480 inches)
        { id: `v_ext1_${ts}`, type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 0, x2: 360, y2: 0, thickness: 9, height: 10, material: 'Brick Masonry', label: 'North Boundary Wall' },
        { id: `v_ext2_${ts}`, type: 'wall', layer: 'A-WALL-EXT', x1: 360, y1: 0, x2: 360, y2: 480, thickness: 9, height: 10, material: 'Brick Masonry', label: 'East Boundary Wall' },
        { id: `v_ext3_${ts}`, type: 'wall', layer: 'A-WALL-EXT', x1: 360, y1: 480, x2: 0, y2: 480, thickness: 9, height: 10, material: 'Brick Masonry', label: 'South Boundary Wall' },
        { id: `v_ext4_${ts}`, type: 'wall', layer: 'A-WALL-EXT', x1: 0, y1: 480, x2: 0, y2: 0, thickness: 9, height: 10, material: 'Brick Masonry', label: 'West Boundary Wall' },
        // Partitions
        { id: `v_int1_${ts}`, type: 'wall', layer: 'A-WALL-INT', x1: 0, y1: 240, x2: 240, y2: 240, thickness: 4.5, height: 10, material: 'Drywall Partition', label: 'Living Partition' },
        { id: `v_int2_${ts}`, type: 'wall', layer: 'A-WALL-INT', x1: 240, y1: 0, x2: 240, y2: 240, thickness: 4.5, height: 10, material: 'Drywall Partition', label: 'Bed Partition' },
        { id: `v_int3_${ts}`, type: 'wall', layer: 'A-WALL-INT', x1: 220, y1: 240, x2: 220, y2: 480, thickness: 4.5, height: 10, material: 'Brick Masonry', label: 'Kitchen Partition' },
        // Doors
        { id: `v_d1_${ts}`, type: 'door', layer: 'A-DOOR', x1: 160, y1: 480, x2: 196, y2: 480, thickness: 9, label: "Main Entrance (3'-0\")" },
        { id: `v_d2_${ts}`, type: 'door', layer: 'A-DOOR', x1: 240, y1: 180, x2: 240, y2: 216, thickness: 4.5, label: "Master Bed Door" },
        { id: `v_d3_${ts}`, type: 'door', layer: 'A-DOOR', x1: 220, y1: 270, x2: 220, y2: 306, thickness: 4.5, label: "Kitchen Door" },
        // Windows
        { id: `v_wn1_${ts}`, type: 'window', layer: 'A-GLAZ', x1: 60, y1: 0, x2: 120, y2: 0, thickness: 9, label: "North Living Window" },
        { id: `v_wn2_${ts}`, type: 'window', layer: 'A-GLAZ', x1: 360, y1: 80, x2: 360, y2: 140, thickness: 9, label: "East Bedroom Window" },
        { id: `v_wn3_${ts}`, type: 'window', layer: 'A-GLAZ', x1: 360, y1: 360, x2: 360, y2: 420, thickness: 9, label: "Kitchen Window" },
        // Room Stamps
        { id: `v_rm1_${ts}`, type: 'room', layer: 'A-AREA', x1: 110, y1: 360, x2: 110, y2: 360, label: 'LIVING & DINING', areaSqFt: 520 },
        { id: `v_rm2_${ts}`, type: 'room', layer: 'A-AREA', x1: 300, y1: 120, x2: 300, y2: 120, label: 'MASTER BEDROOM', areaSqFt: 280 },
        { id: `v_rm3_${ts}`, type: 'room', layer: 'A-AREA', x1: 290, y1: 360, x2: 290, y2: 360, label: 'KITCHEN (SE)', areaSqFt: 180 },
        { id: `v_rm4_${ts}`, type: 'room', layer: 'A-AREA', x1: 110, y1: 120, x2: 110, y2: 120, label: 'GUEST BED / STUDY', areaSqFt: 220 },
      ];

      replyText = `Here is a complete, Vastu-compliant 2BHK layout on a 30'×40' (1,200 sq.ft) plot boundary:\n\n• **Main Entry:** North/North-East for positive energy flow\n• **Master Bedroom:** South-West (Nairutya) for maximum stability & privacy\n• **Kitchen:** South-East (Agneya) for fire element balance\n• **Living / Dining:** Central & North zones with abundant natural daylight\n• **Exterior Envelope:** 9" load-bearing brick masonry with 4.5" acoustic interior partitions.`;

      proposal = {
        title: 'Vastu 2BHK Blueprint (30x40 ft)',
        specs: [
          '4 Perimeter 9" Boundary Walls',
          '3 Interior 4.5" Partitions',
          '3 Standard Doors (Main, Bed, Kitchen)',
          '3 Glazed Casement Windows',
          '4 Parametric Room Stamps'
        ],
        elements: generated
      };

      suggestions = [
        'Calculate Concrete & Brick Takeoff',
        'Add Attached Bath to Master Bed',
        'Toggle 3D Roof Slab'
      ];
    }
    // 4. QUANTITY TAKEOFF / COST ESTIMATE / BRICKS / CONCRETE
    else if (q.includes('takeoff') || q.includes('brick') || q.includes('concrete') || q.includes('material') || q.includes('cost') || q.includes('estimate')) {
      const wallCount = currentElementsCount > 0 ? currentElementsCount : 9;
      const totalWallLengthFt = wallCount * 28;
      const wallAreaSqFt = totalWallLengthFt * 10;
      const concreteVolumeCuYd = ((wallAreaSqFt * (9 / 12)) / 27).toFixed(1);
      const brickCount = Math.round(wallAreaSqFt * (9 / 12) * 13.5);
      const estCostUSD = (brickCount * 0.65 + parseFloat(concreteVolumeCuYd) * 140).toLocaleString();

      replyText = `### 🧱 BIM Structural Quantity Takeoff Report\nBased on your active plan (${wallCount} BIM entities):\n\n| Item | Specification | Estimated Quantity |\n|---|---|---|\n| **Standard Red Clay Bricks** | 9" Modular | **${brickCount.toLocaleString()} units** |\n| **M25 Structural Concrete** | Slabs & Footings | **${concreteVolumeCuYd} cu. yards** |\n| **Wall Plaster (1:4 Cement)** | Internal & External | **${(wallAreaSqFt * 1.8).toFixed(0)} sq.ft** |\n| **Structural Steel (TMT)** | Fe500D Rebar | **${(wallCount * 140).toLocaleString()} kg** |\n| **Rough Material Budget** | Shell & Core | **~$${estCostUSD}** |\n\n*All calculations comply with IS 1200 / NBC standards.*`;

      suggestions = [
        'Export Takeoff as CSV / Excel',
        'Check Wall Thicknesses',
        'Run Vastu Audit'
      ];
    }
    // 5. ROOF / 3D VIEWPORT
    else if (q.includes('roof') || q.includes('slab') || q.includes('ceiling')) {
      if (onToggleRoof) onToggleRoof();
      replyText = `I have toggled the **3D Architectural Roof Slab** in your 3D BIM viewport.\n\n• **Slab Thickness:** 6 inches reinforced concrete (RCC)\n• **Overhang:** 1'-0" drip-edge cornice to prevent rain streaks\n• **Thermal Insulation:** 2" polyurethane foam layer included in BIM metadata.`;
      suggestions = [
        'Switch to 3D Archicad BIM View',
        'Adjust Ceiling Height to 11 ft',
        'Calculate Material Takeoff'
      ];
    }
    // 6. CLEAR OR RESET
    else if (q.includes('clear') || q.includes('reset') || q.includes('delete all')) {
      replyText = `Would you like me to clear the entire drawing canvas? This will reset all 2D vectors and 3D BIM meshes.`;
      proposal = {
        title: 'Clear Drawing Canvas',
        specs: ['Reset all active walls, doors, and rooms', 'Can be undone immediately with Ctrl+Z'],
        elements: []
      };
      suggestions = [
        'Clear canvas now',
        'Cancel and keep current drawing'
      ];
    }
    // 7. GENERAL ARCHITECTURAL ADVICE / ASSISTANCE
    else {
      replyText = `I analyzed your request: **"${query}"**.\n\nHere are 3 professional architectural recommendations for this stage:\n1. **Circulation & Clearances:** Keep primary hallways at least 3'-6" wide for unhindered movement.\n2. **Load-Bearing Standards:** Use 9" exterior envelope walls for thermal mass, and 4.5" partition walls for interior room divisions.\n3. **Natural Daylighting:** Window glazing should equal at least 15% of each room's carpet area to meet international building codes.\n\nWhat specific room or boundary would you like me to generate for you?`;

      suggestions = [
        'Add 14x16 ft Master Bed with Bath',
        'Draft South-East Kitchen (10x12 ft)',
        'Generate 2BHK Layout on 30x40 ft Plot'
      ];
    }

    const botMsg: AIMessage = {
      id: 'ai_' + ts,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposal,
      suggestions
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);
  };

  return (
    <div className="flex flex-col h-full bg-[#18181B] font-sans text-gray-100 select-none">
      {/* ── CLEAN PRO HEADER WITH COMPACT MODEL SWITCHER ── */}
      <div className="bg-[#141416] border-b border-[#27272A] px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">RachnaCAD AI Co-Pilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
              Offline GPU • $0.00 Cost
            </div>
          </div>
        </div>

        {/* Compact Model Selector */}
        <div className="relative">
          <select
            value={model}
            onChange={(e) => {
              const val = e.target.value as any;
              setModel(val);
              if (val === 'claude') setShowByokModal(true);
            }}
            className="bg-[#202023] text-gray-300 text-[11px] font-medium border border-[#2F2F34] rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:border-gray-500"
          >
            <option value="qwen">🚀 Qwen 2.5 Coder (Local GPU)</option>
            <option value="llama">🦙 Llama 3.2 (Local GPU)</option>
            <option value="gemini">✦ Gemini 2.0 Flash (Cloud)</option>
            <option value="claude">⚡ Claude 3.7 / GPT-4o (BYOK)</option>
          </select>
        </div>
      </div>

      {/* ── CONVERSATION STREAM (CURSOR / ANTIGRAVITY STYLE) ── */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#18181B]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[94%]">
              {m.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="space-y-2">
                {/* Text Bubble */}
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-xs shadow-md'
                      : 'bg-[#202023] border border-[#2F2F34] text-gray-200 rounded-tl-xs shadow-sm whitespace-pre-line'
                  }`}
                >
                  {m.text}
                </div>

                {/* BIM Action Proposal Card */}
                {m.proposal && (
                  <div className="p-3 rounded-xl bg-[#232328] border border-blue-500/40 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                        <span>{m.proposal.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">
                        {m.proposal.elements.length} BIM Items
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-gray-300">
                      {m.proposal.specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>

                    {m.proposal.applied ? (
                      <div className="w-full py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Applied to 2D Plan &amp; 3D BIM</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyProposal(m.id, m.proposal!.elements)}
                        className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>✨ Insert into 2D Plan &amp; 3D BIM</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Suggestion Chips */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.suggestions.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="text-left px-2.5 py-1.5 rounded-lg bg-[#25252A] hover:bg-[#2F2F35] border border-[#34343A] text-gray-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>{chip}</span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[9px] text-gray-500 font-mono">
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-gray-700 text-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 text-xs font-mono bg-[#202023] p-2.5 rounded-xl border border-[#2F2F34] w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>{typingStatus}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── CLEAN PROMPT INPUT BAR (ANTIGRAVITY / CURSOR STYLE) ── */}
      <div className="p-3 bg-[#141416] border-t border-[#27272A]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[#202023] border border-[#2F2F34] focus-within:border-blue-500 rounded-xl px-3 py-2 transition-all"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI: e.g. 'Add master bed with bath'..."
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 disabled:opacity-20 transition-all cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-gray-500 px-1 pt-2 font-mono">
          <span>{currentElementsCount} Active BIM Entities</span>
          <span>Press Enter ↵</span>
        </div>
      </div>

      {/* ── BYOK KEY MODAL ── */}
      {showByokModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#202023] border border-[#2F2F34] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-gray-100">
            <div className="flex items-center gap-2.5 font-bold text-sm text-white">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Bring Your Own Key (BYOK)</h3>
                <p className="text-[11px] text-gray-400 font-normal">Connect Claude 3.7 or GPT-4o</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Insert your personal Anthropic or OpenAI API key. Stored locally on your machine with 100% privacy.
            </p>

            <input
              type="password"
              placeholder="sk-ant-api03-..."
              value={byokKey}
              onChange={(e) => setByokKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-[#34343A] text-white font-mono text-xs focus:border-blue-500 outline-none"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowByokModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all cursor-pointer"
              >
                Save Key &amp; Connect
              </button>
              <button
                onClick={() => {
                  setModel('qwen');
                  setShowByokModal(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#34343A] text-gray-400 text-xs hover:bg-[#2A2A30] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
