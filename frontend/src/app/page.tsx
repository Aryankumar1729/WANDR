"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function AboutPage() {
  const { isSignedIn } = useAuth();
  const [typedText, setTypedText] = useState("");
  const fullText = "Plan a 3-day trip from Delhi to Bali next week for a couple, budget 50000...";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full relative -mt-[104px] pt-[104px] overflow-hidden bg-background">
      {/* Dynamic Gradient Background for a modern, sleek look */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 z-0"></div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#E67E22]/20 rounded-full blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-20 flex flex-col items-center text-center">
        
        {/* Hero Section */}
        <div className="animate-slide-up max-w-3xl">
          <span className="px-4 py-1.5 bg-[#E67E22]/10 text-[#E67E22] font-bold rounded-full text-sm tracking-widest uppercase mb-6 inline-block border border-[#E67E22]/20">Welcome to Wandr</span>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-tight tracking-tight mb-8">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E67E22] to-orange-400">Travel Planning.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
            Wandr is an intelligent multi-agent AI system. We don't just give you a list of links—we autonomously research flights, verify hotel ratings, check the weather, and weave it all into a perfect daily itinerary.
          </p>
          <div className="flex gap-4 justify-center">
            {isSignedIn && (
              <Link href="/trips" className="px-8 py-4 bg-white text-[#E67E22] border-2 border-[#E67E22] font-bold rounded-full text-lg shadow-[0_8px_20px_rgba(230,126,34,0.1)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(230,126,34,0.2)] transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">arrow_back</span> Back to My Trips
              </Link>
            )}
            <Link href="/plan" className="px-8 py-4 bg-[#E67E22] text-white font-bold rounded-full text-lg shadow-[0_8px_20px_rgba(230,126,34,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(230,126,34,0.4)] transition-all flex items-center gap-2">
              Start Planning Now <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* 3D Features Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full perspective-1000">
          
          <div className="group relative h-[320px] bg-white/60 backdrop-blur-xl rounded-[32px] p-8 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner">
              <span className="material-symbols-outlined text-3xl">smart_toy</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-left">Multi-Agent AI</h3>
            <p className="text-gray-600 font-medium text-left leading-relaxed">Four specialized AI agents working together in the background to perfectly synchronize your flights, hotels, and schedule seamlessly.</p>
          </div>

          <div className="group relative h-[320px] bg-white/60 backdrop-blur-xl rounded-[32px] p-8 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-4 delay-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-inner">
              <span className="material-symbols-outlined text-3xl">map</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-left">Hyper-Personalized</h3>
            <p className="text-gray-600 font-medium text-left leading-relaxed">Just chat naturally. Whether it's a romantic getaway or a budget backpacking trip, Wandr adapts the itinerary to exactly what you want.</p>
          </div>

          <div className="group relative h-[320px] bg-white/60 backdrop-blur-xl rounded-[32px] p-8 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-4 delay-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner">
              <span className="material-symbols-outlined text-3xl">bolt</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-left">Seamless Flow</h3>
            <p className="text-gray-600 font-medium text-left leading-relaxed">No infinite forms. Just one conversational prompt turns into a beautiful, bookable dashboard in less than 30 seconds.</p>
          </div>

        </div>

        {/* Interactive Prompt Demo */}
        <div className="mt-32 w-full max-w-4xl bg-white/40 backdrop-blur-md rounded-[40px] p-2 shadow-2xl border border-white/60 overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
          <div className="bg-white/80 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-[#E67E22] to-orange-400"></div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Just tell us what you want.</h2>
            
            <div className="w-full bg-white border border-gray-100 rounded-full p-4 md:p-6 flex items-center gap-4 shadow-sm group-hover:shadow-lg transition-shadow duration-500">
              <div className="w-12 h-12 rounded-full bg-[#E67E22] flex items-center justify-center text-white shrink-0 shadow-md">
                <span className="material-symbols-outlined">chat</span>
              </div>
              <p className="font-mono text-gray-600 text-sm md:text-lg flex-1 text-left">
                {typedText}<span className="animate-ping inline-block w-3 h-5 bg-[#E67E22] ml-1 align-middle"></span>
              </p>
            </div>
            
            <p className="mt-8 text-sm text-gray-500 font-bold tracking-widest uppercase">Wandr's intent parser automatically extracts your preferences.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
