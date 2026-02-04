"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import LayoutCanvas from "@/components/seating/LayoutCanvas";

interface Section {
  id: string;
  name: string;
  type: string;
  capacity: number;
  positionX: number;
  positionY: number;
  rotation: number;
  width: number;
  height: number;
  seats: Seat[];
}

interface Seat {
  id: string;
  label: string;
  positionX: number;
  positionY: number;
  status: string;
}

interface Layout {
  id: string;
  name: string;
  description: string | null;
  width: number;
  height: number;
  isTemplate: boolean;
  sections: Section[];
}

export default function EditLayoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [layout, setLayout] = useState<Layout | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(50);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [mobileTab, setMobileTab] = useState<"elements" | "properties">("elements");

  // Close mobile panel when a section is added
  const closeMobilePanelAfterAdd = useCallback(() => {
    if (window.innerWidth < 1024) {
      setShowMobilePanel(false);
    }
  }, []);

  useEffect(() => {
    async function fetchLayout() {
      try {
        const res = await fetch(`/api/layouts/${id}`);
        if (!res.ok) throw new Error("Layout not found");
        const data = await res.json();
        setLayout(data);
      } catch {
        setError("Failed to load layout");
      } finally {
        setFetching(false);
      }
    }
    fetchLayout();
  }, [id]);

  async function handleAddSection(type: string) {
    if (!layout) return;

    // Define element properties based on type
    const elementConfig: Record<string, { name: string; capacity: number; width: number; height: number }> = {
      ROUND_TABLE: { name: "Table", capacity: 8, width: 120, height: 120 },
      RECTANGULAR_TABLE: { name: "Table", capacity: 6, width: 150, height: 80 },
      ROW: { name: "Row", capacity: 10, width: 300, height: 50 },
      CATERING: { name: "Catering", capacity: 0, width: 180, height: 80 },
      SOUND_SYSTEM: { name: "Sound System", capacity: 0, width: 100, height: 100 },
      STAGE: { name: "Stage", capacity: 0, width: 300, height: 150 },
      SCREEN: { name: "Screen", capacity: 0, width: 200, height: 30 },
      PHOTO_SPOT: { name: "Photo Spot", capacity: 0, width: 120, height: 120 },
    };

    const config = elementConfig[type] || { name: "Section", capacity: 6, width: 150, height: 100 };

    const sectionData = {
      layoutId: layout.id,
      name: `${config.name} ${layout.sections.filter(s => s.type === type).length + 1}`,
      type,
      capacity: config.capacity,
      positionX: 100 + (layout.sections.length * 50) % 400,
      positionY: 100 + Math.floor(layout.sections.length / 4) * 150,
      width: config.width,
      height: config.height,
    };

    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionData),
      });

      if (!res.ok) throw new Error("Failed to add section");

      const newSection = await res.json();
      setLayout({
        ...layout,
        sections: [...layout.sections, { ...newSection, seats: newSection.seats || [] }],
      });
      setSelectedSection(newSection.id);
      closeMobilePanelAfterAdd();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add section");
    }
  }

  async function handleUpdateSection(sectionId: string, updates: Partial<Section>) {
    if (!layout) return;

    // Update locally first for responsiveness
    setLayout({
      ...layout,
      sections: layout.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });

    try {
      const res = await fetch(`/api/sections/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update section");
    } catch (err) {
      console.error("Failed to update section:", err);
    }
  }

  async function handleDeleteSection(sectionId: string) {
    if (!layout) return;
    if (!confirm("Delete this section and all its seats?")) return;

    try {
      const res = await fetch(`/api/sections/${sectionId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete section");

      setLayout({
        ...layout,
        sections: layout.sections.filter((s) => s.id !== sectionId),
      });
      if (selectedSection === sectionId) {
        setSelectedSection(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete section");
    }
  }

  async function handleSave() {
    if (!layout) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/layouts/${layout.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: layout.name,
          description: layout.description,
          width: layout.width,
          height: layout.height,
          isTemplate: layout.isTemplate,
        }),
      });

      if (!res.ok) throw new Error("Failed to save layout");

      router.push("/layouts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!layout) return;
    if (!confirm("Are you sure you want to delete this layout?")) return;

    try {
      const res = await fetch(`/api/layouts/${layout.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete layout");

      router.push("/layouts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const selectedSectionData = layout?.sections.find((s) => s.id === selectedSection);

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading layout...</p>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Layout not found</p>
        <Link href="/layouts" className="text-[#d4a537] hover:underline">
          Back to layouts
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] lg:h-[calc(100vh-140px)] flex flex-col">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/layouts" className="text-gray-500 hover:text-gray-700 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex flex-col min-w-0">
            <input
              type="text"
              value={layout.name}
              onChange={(e) => setLayout({ ...layout, name: e.target.value })}
              className="text-lg sm:text-2xl font-bold text-[#2d3e50] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#d4a537] focus:outline-none px-1 truncate"
              placeholder="Layout Name"
            />
            <input
              type="text"
              value={layout.description || ""}
              onChange={(e) => setLayout({ ...layout, description: e.target.value || null })}
              className="text-xs sm:text-sm text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#d4a537] focus:outline-none px-1 mt-1 truncate"
              placeholder="Add description..."
            />
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#2d3e50] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-[#3d5068] disabled:opacity-50 font-medium transition-colors shadow-sm text-sm sm:text-base"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-red-600 font-medium transition-colors shadow-sm text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Delete</span>
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0 relative">
        {/* Mobile Floating Action Button */}
        <button
          onClick={() => setShowMobilePanel(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#d4a537] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#c49730] transition-colors"
          aria-label="Add elements"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        {/* Mobile Panel Overlay */}
        {showMobilePanel && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobilePanel(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Panel Header */}
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMobileTab("elements")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      mobileTab === "elements"
                        ? "bg-[#2d3e50] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Add Elements
                  </button>
                  <button
                    onClick={() => setMobileTab("properties")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      mobileTab === "properties"
                        ? "bg-[#2d3e50] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Properties
                  </button>
                </div>
                <button
                  onClick={() => setShowMobilePanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Panel Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {mobileTab === "elements" && (
                  <div className="space-y-4">
                    {/* Tables & Seating */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Tables & Seating</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleAddSection("ROUND_TABLE")}
                          className="px-3 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm flex flex-col items-center gap-2 transition-colors"
                        >
                          <span className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">&#9679;</span>
                          Round Table
                        </button>
                        <button
                          onClick={() => handleAddSection("RECTANGULAR_TABLE")}
                          className="px-3 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm flex flex-col items-center gap-2 transition-colors"
                        >
                          <span className="w-8 h-8 rounded bg-amber-200 flex items-center justify-center text-amber-700">&#9644;</span>
                          Rectangular
                        </button>
                        <button
                          onClick={() => handleAddSection("ROW")}
                          className="px-3 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm flex flex-col items-center gap-2 transition-colors col-span-2"
                        >
                          <span className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center text-blue-700">&#9636;</span>
                          Row of Seats
                        </button>
                      </div>
                    </div>

                    {/* Venue Elements */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Venue Elements</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleAddSection("STAGE")}
                          className="px-3 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm flex flex-col items-center gap-2 transition-colors"
                        >
                          <span className="text-xl">&#127917;</span>
                          Stage
                        </button>
                        <button
                          onClick={() => handleAddSection("SCREEN")}
                          className="px-3 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm flex flex-col items-center gap-2 transition-colors"
                        >
                          <span className="text-xl">&#128250;</span>
                          Screen
                        </button>
                        <button
                          onClick={() => handleAddSection("CATERING")}
                          className="px-3 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm flex flex-col items-center gap-2 transition-colors"
                        >
                          <span className="text-xl">&#127869;</span>
                          Catering
                        </button>
                        <button
                          onClick={() => handleAddSection("SOUND_SYSTEM")}
                          className="px-3 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm flex flex-col items-center gap-2 transition-colors"
                        >
                          <span className="text-xl">&#128266;</span>
                          Sound System
                        </button>
                        <button
                          onClick={() => handleAddSection("PHOTO_SPOT")}
                          className="px-3 py-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg text-sm flex flex-col items-center gap-2 transition-colors col-span-2"
                        >
                          <span className="text-xl">&#128247;</span>
                          Photo Spot
                        </button>
                      </div>
                    </div>

                    {/* Elements List */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Elements ({layout.sections.length})</h3>
                      {layout.sections.length === 0 ? (
                        <p className="text-sm text-gray-500">No elements yet</p>
                      ) : (
                        <ul className="space-y-1 max-h-40 overflow-y-auto">
                          {layout.sections.map((section) => {
                            const typeColors: Record<string, string> = {
                              ROUND_TABLE: "bg-amber-400",
                              RECTANGULAR_TABLE: "bg-amber-400",
                              ROW: "bg-blue-400",
                              STAGE: "bg-purple-400",
                              SCREEN: "bg-slate-600",
                              CATERING: "bg-green-400",
                              SOUND_SYSTEM: "bg-red-400",
                              PHOTO_SPOT: "bg-pink-400",
                            };
                            return (
                              <li
                                key={section.id}
                                className={`flex justify-between items-center p-2 rounded text-sm cursor-pointer ${
                                  selectedSection === section.id
                                    ? "bg-[#d4a537]/10 border border-[#d4a537]"
                                    : "bg-gray-50 hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  setSelectedSection(section.id);
                                  setMobileTab("properties");
                                }}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className={`w-2 h-2 rounded-full ${typeColors[section.type] || "bg-gray-400"}`} />
                                  <span className="truncate">{section.name}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(section.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  &#215;
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {mobileTab === "properties" && (
                  <div className="space-y-4">
                    {selectedSectionData ? (
                      <>
                        <div>
                          <label className="text-gray-600 block mb-1 text-sm">Name</label>
                          <input
                            type="text"
                            value={selectedSectionData.name}
                            onChange={(e) =>
                              handleUpdateSection(selectedSectionData.id, { name: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>

                        {["ROUND_TABLE", "RECTANGULAR_TABLE", "ROW"].includes(selectedSectionData.type) && (
                          <div>
                            <label className="text-gray-600 block mb-1 text-sm">Seats: {selectedSectionData.capacity}</label>
                            <input
                              type="range"
                              min="2"
                              max="20"
                              value={selectedSectionData.capacity}
                              onChange={(e) =>
                                handleUpdateSection(selectedSectionData.id, {
                                  capacity: parseInt(e.target.value),
                                })
                              }
                              className="w-full"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-gray-600 block mb-1 text-sm">Width</label>
                            <input
                              type="number"
                              value={selectedSectionData.width}
                              onChange={(e) =>
                                handleUpdateSection(selectedSectionData.id, {
                                  width: parseInt(e.target.value) || 100,
                                })
                              }
                              min="50"
                              max="500"
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-gray-600 block mb-1 text-sm">Height</label>
                            <input
                              type="number"
                              value={selectedSectionData.height}
                              onChange={(e) =>
                                handleUpdateSection(selectedSectionData.id, {
                                  height: parseInt(e.target.value) || 100,
                                })
                              }
                              min="50"
                              max="500"
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-600 block mb-1 text-sm">Rotation: {selectedSectionData.rotation}deg</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="15"
                            value={selectedSectionData.rotation}
                            onChange={(e) =>
                              handleUpdateSection(selectedSectionData.id, {
                                rotation: parseInt(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>

                        <button
                          onClick={() => handleDeleteSection(selectedSectionData.id)}
                          className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Delete Element
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Select an element to edit its properties</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Left Toolbar */}
        <div className="hidden lg:block w-64 bg-white rounded-lg shadow p-4 space-y-4 overflow-y-auto shrink-0">
          {/* Add Elements */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Tables & Seating</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => handleAddSection("ROUND_TABLE")}
                className="w-full px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-left text-sm flex items-center gap-2 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs">⬤</span>
                Round Table
              </button>
              <button
                onClick={() => handleAddSection("RECTANGULAR_TABLE")}
                className="w-full px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-left text-sm flex items-center gap-2 transition-colors"
              >
                <span className="w-6 h-6 rounded bg-amber-200 flex items-center justify-center text-amber-700 text-xs">▬</span>
                Rectangular Table
              </button>
              <button
                onClick={() => handleAddSection("ROW")}
                className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left text-sm flex items-center gap-2 transition-colors"
              >
                <span className="w-6 h-6 rounded bg-blue-200 flex items-center justify-center text-blue-700 text-xs">▤</span>
                Row of Seats
              </button>
            </div>
          </div>

          {/* Venue Elements */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Venue Elements</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => handleAddSection("STAGE")}
                className="w-full px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left text-sm flex items-center gap-2 transition-colors"
              >
                <span className="w-6 h-6 rounded bg-purple-200 flex items-center justify-center text-purple-700 text-xs">🎭</span>
                Stage
              </button>
              <button
                onClick={() => handleAddSection("SCREEN")}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-sm flex items-center gap-2 transition-colors"
              >
                <span className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-700 text-xs">📺</span>
                Screen
              </button>
              <button
                onClick={() => handleAddSection("CATERING")}
                className="w-full px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-left text-sm flex items-center gap-2 transition-colors"
              >
                <span className="w-6 h-6 rounded bg-green-200 flex items-center justify-center text-green-700 text-xs">🍽️</span>
                Catering
              </button>
              <button
                onClick={() => handleAddSection("SOUND_SYSTEM")}
                className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-left text-sm flex items-center gap-2 transition-colors"
              >
                <span className="w-6 h-6 rounded bg-red-200 flex items-center justify-center text-red-700 text-xs">🔊</span>
                Sound System
              </button>
              <button
                onClick={() => handleAddSection("PHOTO_SPOT")}
                className="w-full px-3 py-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg text-left text-sm flex items-center gap-2 transition-colors"
              >
                <span className="w-6 h-6 rounded bg-pink-200 flex items-center justify-center text-pink-700 text-xs">📷</span>
                Photo Spot
              </button>
            </div>
          </div>

          {/* Grid Settings */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Grid</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4"
                />
                Show Grid Lines
              </label>
              <div>
                <label className="text-sm text-gray-600">Grid Size: {gridSize}px</label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="10"
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Elements ({layout.sections.length})</h3>
            {layout.sections.length === 0 ? (
              <p className="text-sm text-gray-500">No elements yet</p>
            ) : (
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {layout.sections.map((section) => {
                  const typeColors: Record<string, string> = {
                    ROUND_TABLE: "bg-amber-400",
                    RECTANGULAR_TABLE: "bg-amber-400",
                    ROW: "bg-blue-400",
                    STAGE: "bg-purple-400",
                    SCREEN: "bg-slate-600",
                    CATERING: "bg-green-400",
                    SOUND_SYSTEM: "bg-red-400",
                    PHOTO_SPOT: "bg-pink-400",
                  };
                  return (
                    <li
                      key={section.id}
                      className={`flex justify-between items-center p-2 rounded text-sm cursor-pointer ${
                        selectedSection === section.id
                          ? "bg-[#d4a537]/10 border border-[#d4a537]"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full ${typeColors[section.type] || "bg-gray-400"}`} />
                        <span className="truncate">{section.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id);
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Selected Section Properties */}
          {selectedSectionData && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Properties</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-600 block mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedSectionData.name}
                    onChange={(e) =>
                      handleUpdateSection(selectedSectionData.id, { name: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>

                {/* Only show seats slider for seating elements */}
                {["ROUND_TABLE", "RECTANGULAR_TABLE", "ROW"].includes(selectedSectionData.type) && (
                  <div>
                    <label className="text-gray-600 block mb-1">Seats: {selectedSectionData.capacity}</label>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      value={selectedSectionData.capacity}
                      onChange={(e) =>
                        handleUpdateSection(selectedSectionData.id, {
                          capacity: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-600 block mb-1">Width</label>
                    <input
                      type="number"
                      value={selectedSectionData.width}
                      onChange={(e) =>
                        handleUpdateSection(selectedSectionData.id, {
                          width: parseInt(e.target.value) || 100,
                        })
                      }
                      min="50"
                      max="500"
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1">Height</label>
                    <input
                      type="number"
                      value={selectedSectionData.height}
                      onChange={(e) =>
                        handleUpdateSection(selectedSectionData.id, {
                          height: parseInt(e.target.value) || 100,
                        })
                      }
                      min="50"
                      max="500"
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-600 block mb-1">X Position</label>
                    <input
                      type="number"
                      value={Math.round(selectedSectionData.positionX)}
                      onChange={(e) =>
                        handleUpdateSection(selectedSectionData.id, {
                          positionX: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1">Y Position</label>
                    <input
                      type="number"
                      value={Math.round(selectedSectionData.positionY)}
                      onChange={(e) =>
                        handleUpdateSection(selectedSectionData.id, {
                          positionY: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 block mb-1">Rotation: {selectedSectionData.rotation}deg</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={selectedSectionData.rotation}
                    onChange={(e) =>
                      handleUpdateSection(selectedSectionData.id, {
                        rotation: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Layout Info */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Layout Size</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-600 block mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={layout.width}
                    onChange={(e) =>
                      setLayout({ ...layout, width: parseInt(e.target.value) || 800 })
                    }
                    min="400"
                    max="3000"
                    step="100"
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={layout.height}
                    onChange={(e) =>
                      setLayout({ ...layout, height: parseInt(e.target.value) || 600 })
                    }
                    min="300"
                    max="2000"
                    step="100"
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
              <p className="text-gray-500">
                Total seats:{" "}
                {layout.sections
                  .filter(s => ["ROUND_TABLE", "RECTANGULAR_TABLE", "ROW"].includes(s.type))
                  .reduce((sum, s) => sum + s.capacity, 0)}
              </p>
              <p className="text-gray-500 text-xs">
                Elements: {layout.sections.length}
              </p>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden min-h-0">
          <LayoutCanvas
            layout={layout}
            sections={layout.sections}
            onUpdateSection={handleUpdateSection}
            onSelectSection={(id) => {
              setSelectedSection(id);
              if (id && window.innerWidth < 1024) {
                setMobileTab("properties");
                setShowMobilePanel(true);
              }
            }}
            selectedSection={selectedSection}
            showGrid={showGrid}
            gridSize={gridSize}
          />
        </div>
      </div>

      {/* Mobile Element Count Badge */}
      <div className="lg:hidden fixed bottom-6 left-6 z-40 bg-white px-3 py-2 rounded-full shadow-lg text-sm font-medium text-[#2d3e50]">
        {layout.sections.length} elements
      </div>
    </div>
  );
}
