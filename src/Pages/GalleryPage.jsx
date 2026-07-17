/**
 * src/Pages/GalleryPage.jsx - THE PUBLIC VIEW (ULTIMATE VERSION)
 * 1. 100% Dynamic Database Fetch.
 * 2. Visual-first Loading State.
 * 3. Modern Masonry-style Grid with Safeguards.
 */

import React, { useState, useEffect } from "react";
import { getGallery } from "../lib/cms";
import Nav from "../Header/Nav";
import Footer from "../Footer/Footer";
import { Loader2, ImageIcon, X } from "lucide-react";

const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchItems = async (retryCount = 0) => {
      try {
        if(retryCount === 0) setLoading(true);
        const data = await getGallery();
        
        if ((!data || data.length === 0) && retryCount === 0) {
          console.log('🔄 Data seems empty, retrying to bypass cache/cold start...');
          setTimeout(() => fetchItems(1), 1500); 
          return;
        }

        setItems(data || []);
      } catch (error) {
        console.error("❌ Gallery Fetch Error:", error);
        if (retryCount === 0) {
          setTimeout(() => fetchItems(1), 1500);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Nav />
      
      <header className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tighter">
            Clinical & <span className="text-blue-700">Lab Gallery</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-bold text-sm uppercase tracking-[0.2em]">
            Visual Highlights of our Molecular Endeavors
          </p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-16 w-full">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-700" />
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Processing Visuals...</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="break-inside-avoid group relative rounded-3xl overflow-hidden bg-gray-50 shadow-sm border border-gray-50 transition-all duration-500 hover:shadow-2xl cursor-pointer"
                >
                  <img
                    src={item.src}
                    alt={item.alt || "Clinical Experience"}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.caption && (
                    <div className="bg-blue-50 px-4 py-3 border-t border-blue-200">
                      <p className="text-xs font-semibold text-blue-700 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Popup */}
            {selectedItem && (
              <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedItem(null)}
              >
                <div
                  className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-900" />
                  </button>

                  {/* Image */}
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.alt || "Clinical Experience"}
                    className="w-full h-auto object-cover"
                  />

                  {/* Caption */}
                  {selectedItem.caption && (
                    <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200">
                      <h3 className="text-lg font-black text-blue-900 mb-3">Caption</h3>
                      <p className="text-blue-800 font-medium leading-relaxed">
                        {selectedItem.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32">
            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <ImageIcon className="w-10 h-10 text-blue-200" />
            </div>
            <h3 className="text-3xl font-black text-gray-800">Our gallery is currently empty.</h3>
            <p className="text-gray-400 mt-4 font-bold uppercase text-xs tracking-widest">New Clinical captures coming soon</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;