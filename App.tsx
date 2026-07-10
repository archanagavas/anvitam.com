import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Process from './pages/Process';
import Team from './pages/Team';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Why from './pages/Why';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Services from './pages/Services'; // New
import ServiceDetail from './pages/ServiceDetail'; // New
import Shop from './pages/Shop'; // New
import Admin from './pages/Admin';
import PageTransition from './components/PageTransition';
import { AnimatePresence } from 'motion/react';
import FarmRetreats from './pages/seo/FarmRetreats';
import WeekendVillas from './pages/seo/WeekendVillas';
import AirbnbHomestay from './pages/seo/AirbnbHomestay';
import WellnessRetreat from './pages/seo/WellnessRetreat';
import Permaculture from './pages/seo/Permaculture';
import TerraceGarden from './pages/seo/TerraceGarden';
import YardLandscape from './pages/seo/YardLandscape';
import CommunityCentre from './pages/seo/CommunityCentre';
import Loader from './components/Loader';
import { ContentProvider } from './context/ContentContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
      if (isBot) return false;
      return !sessionStorage.getItem('anvitam_loaded');
    }
    return true;
  });

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
      try {
        sessionStorage.setItem('anvitam_loaded', 'true');
      } catch (e) {}
    }, 1100);
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <HelmetProvider>
      <Helmet>
        <title>Anvitam | Sustainable Architecture & Eco Design</title>
        <meta name="description" content="ANVITAM Architects Vadodara, Gujarat blending Sustainability with Nature. Eco retreats, farm stays, permaculture design." />
        <meta name="keywords" content="architecture, sustainable architecture, permaculture design, eco retreats, farm stays, biophilic design, green building, Vadodara, Gujarat" />
        <meta name="robots" content="index, follow" />
        <meta name="X-Robots-Tag" content="index, follow" />
        <meta name="publisher" content="Anvitam" />
        <link rel="publisher" href="https://www.anvitam.com/" />
      </Helmet>
      <ContentProvider>
        {isLoading ? (
          <Loader />
        ) : (
          <BrowserRouter>
            <ScrollToTop />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={
                  <Layout>
                    <PageTransition>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/why" element={<Why />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/process/:phase" element={<Process />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/services/:id" element={<ServiceDetail />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:id" element={<BlogDetail />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/seo/farm-retreat-architecture" element={<FarmRetreats />} />
                        <Route path="/seo/weekend-villas" element={<WeekendVillas />} />
                        <Route path="/seo/airbnb-homestay" element={<AirbnbHomestay />} />
                        <Route path="/seo/wellness-retreat" element={<WellnessRetreat />} />
                        <Route path="/seo/permaculture" element={<Permaculture />} />
                        <Route path="/seo/terrace-garden" element={<TerraceGarden />} />
                        <Route path="/seo/yard-landscape" element={<YardLandscape />} />
                        <Route path="/seo/community-centre" element={<CommunityCentre />} />
                      </Routes>
                    </PageTransition>
                  </Layout>
                } />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        )}
      </ContentProvider>
    </HelmetProvider>
  );
};

export default App;