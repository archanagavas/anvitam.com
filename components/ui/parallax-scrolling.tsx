'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tickHandler = (time: number) => { lenis.raf(time * 1000); };
    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Clean up GSAP and ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill());
      if (triggerElement) {
        gsap.killTweensOf(triggerElement);
      }
      gsap.ticker.remove(tickHandler);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax relative overflow-hidden" ref={parallaxRef}>
      <section className="parallax__header relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="parallax__visuals relative w-full h-full">
          <div className="parallax__black-line-overflow absolute inset-0 z-0"></div>
          <div data-parallax-layers className="parallax__layers relative w-full h-full flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80" 
              loading="eager" 
              data-parallax-layer="1" 
              alt="Nature landscape layer 1" 
              className="parallax__layer-img absolute inset-0 w-full h-full object-cover opacity-60" 
            />
            <img 
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80" 
              loading="eager" 
              data-parallax-layer="2" 
              alt="Nature landscape layer 2" 
              className="parallax__layer-img absolute inset-0 w-full h-full object-cover opacity-80" 
            />
            <div data-parallax-layer="3" className="parallax__layer-title relative z-10 text-center px-4">
              <h2 className="parallax__title text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
                Regenerative Architecture
              </h2>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80" 
              loading="eager" 
              data-parallax-layer="4" 
              alt="Nature landscape layer 3" 
              className="parallax__layer-img absolute inset-0 w-full h-full object-cover mix-blend-overlay" 
            />
          </div>
          <div className="parallax__fade absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </div>
      </section>
    </div>
  );
}

export default ParallaxComponent;
