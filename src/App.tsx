import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import VeilleTechno from "./pages/VeilleTechno";
import Formation from "./pages/Formation";
import Experience from "./pages/Experience";
import Tools from "./pages/Tools";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import GenerateProjectImages from "./pages/GenerateProjectImages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <Routes>
            <Route path="/" element={<main className="flex-1 pb-8"><Home /></main>} />
            <Route path="/projects" element={<main className="flex-1 pb-8"><Projects /></main>} />
            <Route path="/projects/:id" element={<main className="flex-1 pb-8"><ProjectDetail /></main>} />
            <Route path="/veille" element={<main className="flex-1 pb-8"><VeilleTechno /></main>} />
            <Route path="/formation" element={<main className="flex-1 pb-8"><Formation /></main>} />
            <Route path="/experience" element={<main className="flex-1 pb-8"><Experience /></main>} />
            <Route path="/tools" element={<main className="flex-1 pb-8"><Tools /></main>} />
            <Route path="/contact" element={<main className="flex-1 pb-8"><Contact /></main>} />
            <Route path="/admin" element={<main className="flex-1"><Admin /></main>} />
            <Route path="/generate-images" element={<main className="flex-1 pb-8"><GenerateProjectImages /></main>} />
            <Route path="*" element={<main className="flex-1 pb-8"><NotFound /></main>} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
