"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
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
    <div className="h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Link href="/layouts" className="text-gray-500 hover:text-gray-700">
            &larr; Back
          </Link>
          <div className="flex flex-col">
            <input
              type="text"
              value={layout.name}
              onChange={(e) => setLayout({ ...layout, name: e.target.value })}
              className="text-2xl font-bold text-[#2d3e50] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#d4a537] focus:outline-none px-1"
              placeholder="Layout Name"
            />
            <input
              type="text"
              value={layout.description || ""}
              onChange={(e) => setLayout({ ...layout, description: e.target.value || null })}
              className="text-sm text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#d4a537] focus:outline-none px-1 mt-1"
              placeholder="Add description..."
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#2d3e50] text-white px-5 py-2.5 rounded-xl hover:bg-[#3d5068] disabled:opacity-50 font-medium transition-colors shadow-sm"
          >
            {loading ? "Saving..." : "Save Layout"}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 font-medium transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-4 h-full">
        {/* Left Toolbar */}
        <div className="w-64 bg-white rounded-lg shadow p-4 space-y-4 overflow-y-auto">
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
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
          <LayoutCanvas
            layout={layout}
            sections={layout.sections}
            onUpdateSection={handleUpdateSection}
            onSelectSection={setSelectedSection}
            selectedSection={selectedSection}
            showGrid={showGrid}
            gridSize={gridSize}
          />
        </div>
      </div>
    </div>
  );
}
