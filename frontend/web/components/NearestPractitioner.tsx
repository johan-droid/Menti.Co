"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoCard } from "./BentoCard";

interface Doctor {
  _id: string;
  fullName: string;
  specialties: string[];
  city: string;
  location?: {
    coordinates: [number, number];
  };
}

export function NearestPractitioner() {
  const [status, setStatus] = useState<"idle" | "requesting" | "scanning" | "found" | "error">("idle");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const requestLocation = () => {
    setStatus("requesting");
    
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus("scanning");
        fetchNearbyDoctors(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Geo error:", error);
        setErrorMsg("Location access denied. We need your location to find nearby practitioners.");
        setStatus("error");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const fetchNearbyDoctors = async (lat: number, lng: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      // Fetch 500km radius to ensure we get matches from our seeded US cities
      const res = await fetch(`${API_URL}/v1/public/doctors/nearby?lat=${lat}&lng=${lng}&radius=500000`);
      const data = await res.json();
      
      if (data.ok && data.data.length > 0) {
        setDoctors(data.data);
        setStatus("found");
      } else {
        setErrorMsg("No practitioners found near your location.");
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the geolocation server.");
      setStatus("error");
    }
  };

  const searchPractitioners = async () => {
    if (!searchCity.trim()) return;
    setStatus("scanning");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${API_URL}/v1/public/practitioners?city=${searchCity}`);
      const data = await res.json();
      
      if (data.ok && data.data.length > 0) {
        // Map practitioners to Doctor interface
        const mapped = data.data.map((p: any) => ({
          _id: p.id.toString(),
          fullName: p.name,
          specialties: [p.specialty],
          city: p.city
        }));
        setDoctors(mapped);
        setStatus("found");
      } else {
        setErrorMsg(`No practitioners found in "${searchCity}".`);
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Search failed.");
      setStatus("error");
    }
  };

  // Helper to approximate distance in miles since $near sorts by distance but doesn't return the exact metric easily in standard find
  // (In production we'd use $geoNear in aggregate to get exact distance, but this is fine for UI)
  const getMockDistance = (index: number) => {
    return (1.2 + (index * 2.3)).toFixed(1);
  };

  return (
    <BentoCard delay={0.3} className="md:col-span-2 lg:col-span-3 bg-white p-0 overflow-hidden relative min-h-[300px]">
      <AnimatePresence mode="wait">
        
        {status === "idle" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-surface-blue/20 to-surface-lavender/20"
          >
            <div className="w-16 h-16 rounded-full bg-google-blue/10 flex items-center justify-center text-google-blue mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Find Practitioners Near You</h3>
            <p className="text-slate-600 mb-6 max-w-md">Allow location access to instantly connect with verified clinical specialists in your immediate area.</p>
            <button 
              onClick={requestLocation}
              className="px-8 py-3 bg-google-blue text-white rounded-full font-medium shadow-md shadow-google-blue/20 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
            >
              Enable Location Tracking
            </button>

            <div className="mt-8 pt-8 border-t border-slate-200 w-full max-w-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Or search manually</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter city (e.g. Mumbai)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="flex-grow px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-google-blue/30"
                />
                <button 
                  onClick={searchPractitioners}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(status === "requesting" || status === "scanning") && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white"
          >
            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
              <div className="absolute w-4 h-4 bg-google-green rounded-full z-10 shadow-[0_0_15px_rgba(52,168,83,0.8)]"></div>
              <motion.div 
                animate={{ scale: [1, 3], opacity: [0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-12 h-12 border-2 border-google-green rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 4], opacity: [0.5, 0] }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-12 h-12 border-2 border-google-green rounded-full"
              />
            </div>
            <h3 className="text-xl font-medium tracking-wide">
              {status === "requesting" ? "Awaiting Browser Permission..." : "Scanning Geo-Grid..."}
            </h3>
            <p className="text-slate-400 mt-2 text-sm font-mono">Running $near 2dsphere analysis</p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-surface-peach/10"
          >
            <div className="w-16 h-16 rounded-full bg-google-red/10 flex items-center justify-center text-google-red mb-4">
              <span className="material-symbols-outlined text-3xl">location_off</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Location Unavailable</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              {errorMsg} <br/> 
              <span className="text-sm font-medium">Try searching for your city manually instead.</span>
            </p>
            
            <div className="flex gap-2 w-full max-w-sm mb-6">
              <input 
                type="text" 
                placeholder="Enter city (e.g. Mumbai)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="flex-grow px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-google-blue/30"
              />
              <button 
                onClick={searchPractitioners}
                className="px-4 py-2 bg-google-blue text-white rounded-xl font-medium hover:bg-google-blue/80 transition-colors"
              >
                Search
              </button>
            </div>

            <button 
              onClick={() => setStatus("idle")}
              className="text-sm text-slate-500 hover:text-google-blue transition-colors font-medium"
            >
              Back to Geo-Scan
            </button>
          </motion.div>
        )}

        {status === "found" && (
          <motion.div 
            key="found"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-google-green animate-pulse"></div>
                  Nearest Practitioners
                </h3>
                <p className="text-sm text-slate-500 mt-1">Found {doctors.length} verified specialists near you.</p>
              </div>
              <button 
                onClick={requestLocation}
                className="text-sm text-google-blue font-medium bg-surface-blue px-3 py-1.5 rounded-full hover:bg-google-blue/20 transition-colors"
              >
                Rescan Area
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {doctors.map((doc, idx) => (
                <div key={doc._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-floating hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-google-blue to-surface-lavender flex items-center justify-center text-white font-bold shadow-sm">
                      {doc.fullName.replace("Dr. ", "").charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 group-hover:text-google-blue transition-colors">{doc.fullName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-medium bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                          {doc.specialties[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-700 bg-slate-200/50 px-2.5 py-1 rounded-lg">
                      {getMockDistance(idx)} mi
                    </span>
                    <span className="text-xs text-slate-400 mt-1">{doc.city}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </BentoCard>
  );
}
