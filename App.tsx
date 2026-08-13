import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Process from './pages/Process';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Why from './pages/Why';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Services from './pages/Services'; // New
import ServiceDetail from './pages/ServiceDetail'; // New
import Shop from './pages/Shop'; // New
import Workshops from './pages/Workshops'; // New
import WorkshopDetail from './pages/WorkshopDetail'; // New
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
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

const DefaultSeo = () => {
  const location = useLocation();
  const isDetailsPage = location.pathname.startsWith('/blog/') || 
                        location.pathname.startsWith('/projects/') || 
                        location.pathname.startsWith('/services/') ||
                        location.pathname.startsWith('/workshops/');

  if (isDetailsPage) return null;

  return (
    <Helmet>
      <title>Anvitam | Sustainable Architecture & Eco Design</title>
      <meta name="description" content="ANVITAM Architects Vadodara, Gujarat blending Sustainability with Nature. Eco retreats, farm stays, permaculture design." />
      <meta name="keywords" content="architecture, sustainable architecture, permaculture design, eco retreats, farm stays, biophilic design, green building, Vadodara, Gujarat" />
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in React tree:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#03160E] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-[#052A1A] border border-[#CCFF00]/30 rounded-3xl p-8 max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-[#CCFF00] mb-3">Anvitam Application Error</h2>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                sessionStorage.clear();
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-[#CCFF00] text-[#111] font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Reset Cache &amp; Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  // Render main layout immediately to maximize Web Vitals (FCP, LCP, CLS)
  const [isLoading, setIsLoading] = useState(false);


  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ContentProvider>
          {isLoading ? (
            <Loader />
          ) : (
            <BrowserRouter>
              <DefaultSeo />
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
                          <Route path="/team" element={<Navigate to="/why" replace />} />
                          <Route path="/services" element={<Services />} />
                          <Route path="/services/:id" element={<ServiceDetail />} />
                          <Route path="/workshops" element={<Workshops />} />
                          <Route path="/workshops/:id" element={<WorkshopDetail />} />
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
                          <Route path="*" element={<NotFound />} />
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
    </ErrorBoundary>
  );
};

export default App;