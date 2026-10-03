import React, { useState, useEffect } from 'react';
import {
  Monitor, HardDrive, CheckCircle2, ArrowRight, Download, Sparkles,
  Lock, Key, ShieldCheck, X, Check, Laptop, RefreshCw, Cpu
} from 'lucide-react';

interface SetupAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: (email: string) => void;
  onDownloadExe?: () => void;
}

export default function SetupAuthModal({
  isOpen,
  onClose,
  onAuthenticated,
  onDownloadExe
}: SetupAuthModalProps) {
  // Wizard Steps: 'drive-select' | 'installing' | 'complete' | 'auth-gate' | 'unlocked'
  const [step, setStep] = useState<'drive-select' | 'installing' | 'complete' | 'auth-gate' | 'unlocked'>('drive-select');
  const [selectedDrive, setSelectedDrive] = useState<'C' | 'D' | 'custom'>('D');
  const [customPath, setCustomPath] = useState<string>('D:\\RachnaCAD');
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [createStartMenuShortcut, setCreateStartMenuShortcut] = useState(true);

  // Progress State
  const [progress, setProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState('Extracting CAD kernel...');
  const [completedItems, setCompletedItems] = useState<number[]>([]);

  // Auth State
  const [email, setEmail] = useState('architect@studio.com');
  const [otp, setOtp] = useState('123456');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Drive paths
  const drivePaths = {
    C: 'C:\\Program Files\\RachnaCAD',
    D: 'D:\\RachnaCAD',
    custom: customPath
  };

  const driveFreeSpace = {
    C: '6.4 GB free',
    D: '92.6 GB free',
    custom: 'Available'
  };

  const handleSelectDrive = (drive: 'C' | 'D') => {
    setSelectedDrive(drive);
    setCustomPath(drivePaths[drive]);
  };

  // Start installation simulation
  const startInstallation = () => {
    setStep('installing');
    setProgress(0);
    setCompletedItems([]);

    const steps = [
      { p: 20, status: 'Copying 2D Vector Precision CAD Kernel...', item: 1 },
      { p: 45, status: 'Configuring Three.js WebGPU 3D Parametric BIM...', item: 2 },
      { p: 70, status: 'Setting up Multi-AI Model Engine (Qwen & Llama Local GPU)...', item: 3 },
      { p: 88, status: 'Registering DXF / DWG / IFC native parsers...', item: 4 },
      { p: 100, status: 'Creating Desktop (RachnaCAD.lnk) & Start Menu shortcuts...', item: 5 },
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setProgress(s.p);
        setInstallStatus(s.status);
        setCompletedItems(prev => [...prev, s.item]);

        if (idx === steps.length - 1) {
          setTimeout(() => {
            setStep('complete');
          }, 600);
        }
      }, (idx + 1) * 700);
    });
  };

  // Verify Auth
  const handleVerifyAuth = () => {
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid architect email.');
      return;
    }
    if (!otp || otp.length < 6) {
      setAuthError('Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setAuthError('');

    setTimeout(() => {
      setIsVerifying(false);
      setStep('unlocked');
      if (onAuthenticated) {
        onAuthenticated(email);
      }
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#CCFF00] text-black font-extrabold flex items-center justify-center text-sm shadow-xs">
              📐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm">RachnaCAD Setup Wizard</span>
                <span className="text-[10px] font-mono bg-black text-[#CCFF00] px-2 py-0.5 rounded-full font-bold">
                  x64 NATIVE
                </span>
              </div>
              <div className="text-[11px] text-gray-500">AutoCAD Precision • Archicad BIM • Local GPU AI</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* ── STEP 1: DRIVE & DESTINATION SELECTION ──────────────────────── */}
          {step === 'drive-select' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Select Installation Drive & Directory</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choose which drive RachnaCAD should be installed to on your computer:
                </p>
              </div>

              {/* Drive Selection Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Drive C */}
                <button
                  type="button"
                  onClick={() => handleSelectDrive('C')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedDrive === 'C'
                      ? 'border-black bg-gray-50 ring-2 ring-black/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-gray-700" /> Drive C: (Primary)
                    </span>
                    {selectedDrive === 'C' && <Check className="w-4 h-4 text-black font-bold" />}
                  </div>
                  <div className="text-[11px] font-mono text-gray-600 mt-1.5 truncate">
                    C:\Program Files\RachnaCAD
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                    {driveFreeSpace.C}
                  </div>
                </button>

                {/* Drive D */}
                <button
                  type="button"
                  onClick={() => handleSelectDrive('D')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedDrive === 'D'
                      ? 'border-black bg-gray-50 ring-2 ring-black/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-gray-700" /> Drive D: (Secondary)
                    </span>
                    {selectedDrive === 'D' && <Check className="w-4 h-4 text-black font-bold" />}
                  </div>
                  <div className="text-[11px] font-mono text-gray-600 mt-1.5 truncate">
                    D:\RachnaCAD
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                    {driveFreeSpace.D}
                  </div>
                </button>
              </div>

              {/* Destination Path Input */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Destination Folder:
                </label>
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-black"
                />
              </div>

              {/* Space Requirement Badge */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500">Space Required: </span>
                  <span className="font-bold text-gray-900">260 MB</span>
                </div>
                <div className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Install
                </div>
              </div>

              {/* Shortcuts */}
              <div className="space-y-2 pt-1 text-xs text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createDesktopShortcut}
                    onChange={(e) => setCreateDesktopShortcut(e.target.checked)}
                    className="rounded text-black focus:ring-0"
                  />
                  <span>Create Desktop Shortcut (<code>RachnaCAD.lnk</code>)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createStartMenuShortcut}
                    onChange={(e) => setCreateStartMenuShortcut(e.target.checked)}
                    className="rounded text-black focus:ring-0"
                  />
                  <span>Create Start Menu Shortcut</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    if (onDownloadExe) onDownloadExe();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .exe (162 MB)</span>
                </button>

                <button
                  type="button"
                  onClick={startInstallation}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Install to {selectedDrive === 'C' ? 'C:\\' : 'D:\\'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: INSTALLATION PROGRESS ──────────────────────────────── */}
          {step === 'installing' && (
            <div className="space-y-5 py-2">
              <div>
                <h3 className="text-base font-bold text-gray-900">Installing RachnaCAD...</h3>
                <p className="text-xs text-gray-500 mt-1">{installStatus}</p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-black h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-gray-500 mt-1.5">
                  <span>Target: {customPath}</span>
                  <span className="font-bold text-gray-900">{progress}%</span>
                </div>
              </div>

              {/* Modules Checklist */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className={`flex items-center gap-2 ${completedItems.includes(1) ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                  {completedItems.includes(1) ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5">⏳</span>}
                  <span>2D Vector Drafting Precision Kernel (AutoCAD LT Precision)</span>
                </div>
                <div className={`flex items-center gap-2 ${completedItems.includes(2) ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                  {completedItems.includes(2) ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5">⏳</span>}
                  <span>Three.js WebGPU 3D Parametric BIM (Archicad Core)</span>
                </div>
                <div className={`flex items-center gap-2 ${completedItems.includes(3) ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                  {completedItems.includes(3) ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5">⏳</span>}
                  <span>Multi-AI Model Engine (Qwen-2.5-Coder & Llama-3.2 Local GPU)</span>
                </div>
                <div className={`flex items-center gap-2 ${completedItems.includes(4) ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                  {completedItems.includes(4) ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5">⏳</span>}
                  <span>DXF, DWG & IFC 4x3 Native Parsers</span>
                </div>
                <div className={`flex items-center gap-2 ${completedItems.includes(5) ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                  {completedItems.includes(5) ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5">⏳</span>}
                  <span>Desktop & Start Menu Shortcuts</span>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: INSTALLATION COMPLETE ──────────────────────────────── */}
          {step === 'complete' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Installation Completed Successfully!</h3>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  RachnaCAD is installed to {customPath}\RachnaCAD.exe
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-600 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Desktop Shortcut created on Desktop
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Lock className="w-3.5 h-3.5 text-gray-400" /> Next: Authenticate your workstation license to unlock full studio access.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('auth-gate')}
                className="w-full py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b5e600] text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🚀 Launch RachnaCAD & Authenticate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 4: AUTHENTICATION GATE ────────────────────────────────── */}
          {step === 'auth-gate' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#CCFF00] text-black font-extrabold text-base mb-2">
                  📐
                </div>
                <h3 className="text-base font-bold text-gray-900">RachnaCAD Workstation Activation</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sign in to authenticate your studio workstation and unlock local GPU AI models.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Architect Email Address:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black"
                    placeholder="architect@studio.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Verification Code (OTP):
                    </label>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      Dev Code: 123456
                    </span>
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono tracking-widest text-gray-900 focus:outline-none focus:border-black"
                    placeholder="123456"
                  />
                </div>

                {/* Quick Auto-Fill Test Button */}
                <button
                  type="button"
                  onClick={() => {
                    setOtp('123456');
                    setAuthError('');
                  }}
                  className="w-full py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#CCFF00]" />
                  <span>⚡ 1-Click Auto-Fill Demo Code (123456)</span>
                </button>

                {authError && (
                  <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 text-center">
                    {authError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyAuth}
                  disabled={isVerifying}
                  className="w-full py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating License...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
                      <span>Verify & Unlock RachnaCAD Studio</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[11px] text-gray-400">
                  🔒 60% Free Forever • $10/mo Pro Tier • Anvitam Secure Gate
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 5: STUDIO UNLOCKED ────────────────────────────────────── */}
          {step === 'unlocked' && (
            <div className="text-center py-5 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#CCFF00] text-black flex items-center justify-center mx-auto text-2xl font-bold shadow-md">
                🎉
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Workstation Authenticated & Unlocked!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Signed in as <strong className="text-black">{email}</strong> • RachnaCAD Pro ($10/mo)
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> 2D AutoCAD precision drafting activated
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> 3D Parametric BIM dual-synchronizer live
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> All 4 AI Models (Qwen, Llama, Gemini, Claude) enabled
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-black hover:bg-gray-800 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enter CAD Studio Now</span>
                <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
