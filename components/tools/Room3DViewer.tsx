/**
 * components/tools/Room3DViewer.tsx
 *
 * 🆓 4-SIDED INTERIOR 3D ROOM WALKTHROUGH — Anvitam Studio
 *
 * Architecture:
 *  - Encloses generated interior render inside a 4-sided 3D Room Enclosure (Back Wall, Left Wall, Right Wall, Ceiling, Hardwood Floor).
 *  - AI Depth map displacement for 3D depth.
 *  - WASD & Arrow Key Walkthrough + OrbitControls (rotate, pan, zoom).
 *  - On-screen touch/click Directional Navigation Pad (Forward, Backward, Left, Right).
 *  - MediaRecorder API: records WebGL canvas → downloads .webm video flythrough.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Room3DViewerProps {
  imageUrl: string;
  onClose: () => void;
}

const Room3DViewer: React.FC<Room3DViewerProps> = ({ imageUrl, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [status, setStatus] = useState<'loading' | 'generating-depth' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [depthLoaded, setDepthLoaded] = useState(false);

  // ── Helper to create procedural wood floor canvas ──────────────────────────
  const createWoodTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#2d1b0e';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#3a2414';
      for (let i = 0; i < 512; i += 64) {
        ctx.fillRect(0, i, 512, 60);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, i + 60, 512, 4);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };

  // ── Fetch depth map from HF API ───────────────────────────────────────────
  const fetchDepthMap = useCallback(async (): Promise<string | null> => {
    try {
      setStatus('generating-depth');
      const res = await fetch('/api/hf-image-gen?action=depth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.depthMap || null;
    } catch {
      return null;
    }
  }, [imageUrl]);

  // ── Directional Walkthrough Controls ─────────────────────────────────────
  const moveCamera = useCallback((direction: 'forward' | 'backward' | 'left' | 'right') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const step = 0.4;
    const forwardVec = new THREE.Vector3();
    camera.getWorldDirection(forwardVec);
    forwardVec.y = 0; // keep horizontal
    forwardVec.normalize();

    const sideVec = new THREE.Vector3();
    sideVec.crossVectors(camera.up, forwardVec).normalize();

    if (direction === 'forward') {
      camera.position.addScaledVector(forwardVec, step);
      controls.target.addScaledVector(forwardVec, step);
    } else if (direction === 'backward') {
      camera.position.addScaledVector(forwardVec, -step);
      controls.target.addScaledVector(forwardVec, -step);
    } else if (direction === 'left') {
      camera.position.addScaledVector(sideVec, step);
      controls.target.addScaledVector(sideVec, step);
    } else if (direction === 'right') {
      camera.position.addScaledVector(sideVec, -step);
      controls.target.addScaledVector(sideVec, -step);
    }
    controls.update();
  }, []);

  // ── Keyboard Listener (WASD + Arrows) ─────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'W', 'ArrowUp'].includes(e.key)) moveCamera('forward');
      if (['s', 'S', 'ArrowDown'].includes(e.key)) moveCamera('backward');
      if (['a', 'A', 'ArrowLeft'].includes(e.key)) moveCamera('left');
      if (['d', 'D', 'ArrowRight'].includes(e.key)) moveCamera('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveCamera]);

  // ── Initialize Three.js 3D Room Scene ─────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        if (!isMounted || !mountRef.current) return;

        // ── Fetch Depth Map ────────────────────────────────────────────────
        const depthMapB64 = await fetchDepthMap();
        if (!isMounted) return;

        // ── Scene Setup ────────────────────────────────────────────────────
        const container = mountRef.current;
        const W = container.clientWidth || window.innerWidth;
        const H = container.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111116);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 100);
        camera.position.set(0, 0, 1.8);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // ── OrbitControls ──────────────────────────────────────────────────
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 0.2;
        controls.maxDistance = 4.5;
        controls.target.set(0, 0, -2);
        controls.maxPolarAngle = Math.PI * 0.85;
        controlsRef.current = controls;

        // ── Lighting ───────────────────────────────────────────────────────
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);
        const warmPoint = new THREE.PointLight(0xffeedd, 1.2, 10);
        warmPoint.position.set(0, 1.5, 0);
        scene.add(warmPoint);

        // ── Texture Loader ─────────────────────────────────────────────────
        const textureLoader = new THREE.TextureLoader();
        const loadTex = (src: string): Promise<any> =>
          new Promise((res) => textureLoader.load(src, res, undefined, () => res(null)));

        const [colorTex, depthTex] = await Promise.all([
          loadTex(imageUrl),
          depthMapB64 ? loadTex(depthMapB64) : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        if (colorTex) {
          colorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        }

        // ── 4-SIDED 3D ROOM ENCLOSURE ──────────────────────────────────────
        const roomGroup = new THREE.Group();

        // 1. Back Main Wall (Main Render Image with Depth Displacement)
        const segments = depthTex ? 256 : 64;
        const backWallGeo = new THREE.PlaneGeometry(6, 4, segments, segments);
        const backWallMat = new THREE.MeshStandardMaterial({
          map: colorTex,
          displacementMap: depthTex,
          displacementScale: depthTex ? 0.6 : 0,
          displacementBias: depthTex ? -0.3 : 0,
          roughness: 0.4,
        });
        const backWall = new THREE.Mesh(backWallGeo, backWallMat);
        backWall.position.set(0, 0, -3);
        roomGroup.add(backWall);

        // 2. Floor (Hardwood Texture)
        const floorGeo = new THREE.PlaneGeometry(6, 6);
        const woodTex = createWoodTexture();
        const floorMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.5 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, -2, 0);
        roomGroup.add(floor);

        // 3. Ceiling (Soft White)
        const ceilingGeo = new THREE.PlaneGeometry(6, 6);
        const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f7, roughness: 0.9 });
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(0, 2, 0);
        roomGroup.add(ceiling);

        // 4. Left Interior Wall
        const sideWallGeo = new THREE.PlaneGeometry(6, 4);
        const leftWallMat = new THREE.MeshStandardMaterial({ color: 0x22222a, roughness: 0.8 });
        const leftWall = new THREE.Mesh(sideWallGeo, leftWallMat);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-3, 0, 0);
        roomGroup.add(leftWall);

        // 5. Right Interior Wall
        const rightWallMat = new THREE.MeshStandardMaterial({ color: 0x22222a, roughness: 0.8 });
        const rightWall = new THREE.Mesh(sideWallGeo, rightWallMat);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(3, 0, 0);
        roomGroup.add(rightWall);

        scene.add(roomGroup);
        setDepthLoaded(!!depthTex);

        // ── Render Loop ────────────────────────────────────────────────────
        const animate = () => {
          animFrameRef.current = requestAnimationFrame(animate);
          if (controlsRef.current) controlsRef.current.update();
          renderer.render(scene, camera);
        };
        animate();

        // ── Resize Handler ─────────────────────────────────────────────────
        const onResize = () => {
          if (!container || !rendererRef.current) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        setStatus('ready');

        return () => {
          window.removeEventListener('resize', onResize);
        };
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to initialize 3D room walkthrough');
          setStatus('error');
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && mountRef.current) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch { /* already removed */ }
        rendererRef.current.dispose();
      }
    };
  }, [imageUrl, fetchDepthMap]);

  // ── Video Recording ────────────────────────────────────────────────────────
  const startVideoFlythrough = useCallback(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!renderer || !camera) return;

    try {
      const canvas = renderer.domElement;
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
        videoBitsPerSecond: 5_000_000,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anvitam-3d-walkthrough-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      if (controls) controls.enabled = false;
      const startTime = Date.now();
      const flythroughDuration = 8000;

      const cinematicAnimate = () => {
        const elapsed = Date.now() - startTime;
        const t = elapsed / flythroughDuration;

        if (t < 1) {
          camera.position.x = Math.sin(t * Math.PI * 1.2) * 1.2;
          camera.position.y = Math.sin(t * Math.PI * 0.6) * 0.3;
          camera.position.z = 1.8 - t * 1.2;
          camera.lookAt(0, 0, -3);
          requestAnimationFrame(cinematicAnimate);
        } else {
          if (controls) controls.enabled = true;
          camera.position.set(0, 0, 1.8);
          controls.target.set(0, 0, -2);
          recorder.stop();
        }
      };
      requestAnimationFrame(cinematicAnimate);
    } catch (err: any) {
      console.error('MediaRecorder error:', err);
      setError('Video recording not supported in this browser.');
    }
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.96)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏠</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'Inter, sans-serif' }}>
              3D Interior Room Walkthrough
            </div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 1 }}>
              {status === 'loading' && 'Loading 3D Engine…'}
              {status === 'generating-depth' && '⚡ Generating 3D Depth Mesh…'}
              {status === 'ready' && (depthLoaded ? '✅ 4-Sided 3D Interior Mesh Active · Use WASD or On-Screen Pad' : '⚡ 3D Room Box Ready · Depth loading…')}
              {status === 'error' && `❌ ${error}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {status === 'ready' && !isRecording && (
            <button
              onClick={startVideoFlythrough}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              🎬 Record Flythrough
            </button>
          )}
          {isRecording && (
            <div
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ animation: 'pulse 1s infinite' }}>🔴</span> Recording…
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#aaa',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
      >
        {/* Loading overlay */}
        {(status === 'loading' || status === 'generating-depth') && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              background: 'rgba(10,10,15,0.9)',
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: '3px solid rgba(124,58,237,0.3)',
                borderTop: '3px solid #7c3aed',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div style={{ color: '#c4b5fd', fontSize: 14, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
              Building 4-Sided 3D Interior Room Mesh…
            </div>
          </div>
        )}

        {/* Error overlay */}
        {status === 'error' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 40 }}>⚠️</span>
            <div style={{ color: '#f87171', fontSize: 14 }}>{error}</div>
            <button
              onClick={onClose}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                cursor: 'pointer',
              }}
            >
              Go Back
            </button>
          </div>
        )}

        {/* 🎮 Interactive Directional Walkthrough Touch & Button Controls */}
        {status === 'ready' && (
          <div style={{
            position: 'absolute',
            bottom: 30,
            right: 30,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0,0,0,0.85)',
            padding: '12px',
            borderRadius: '20px',
            border: '1px solid rgba(204,255,0,0.3)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <span style={{ color: '#CCFF00', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Walk Controls
            </span>
            <button
              onClick={() => moveCamera('forward')}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#CCFF00',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
              }}
              title="Walk Forward (W / Up Arrow)"
            >
              ▲
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => moveCamera('left')}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#222',
                  color: '#fff',
                  fontWeight: 'bold',
                  border: '1px solid #444',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
                title="Pan Left (A / Left Arrow)"
              >
                ◀
              </button>
              <button
                onClick={() => moveCamera('backward')}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#222',
                  color: '#fff',
                  fontWeight: 'bold',
                  border: '1px solid #444',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
                title="Walk Backward (S / Down Arrow)"
              >
                ▼
              </button>
              <button
                onClick={() => moveCamera('right')}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#222',
                  color: '#fff',
                  fontWeight: 'bold',
                  border: '1px solid #444',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
                title="Pan Right (D / Right Arrow)"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3D Navigation Control Overlay Badge */}
      {status === 'ready' && (
        <div style={{
          position: 'absolute',
          top: 70,
          left: 20,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(204,255,0,0.3)',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: '14px',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ color: '#CCFF00', fontWeight: 'bold' }}>🎮 Keyboard &amp; Touch Controls:</span>
          <span>Press <b>W/A/S/D</b> or <b>Arrow Keys</b> to walk</span>
          <span>•</span>
          <span>Drag mouse to look around</span>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

export default Room3DViewer;
