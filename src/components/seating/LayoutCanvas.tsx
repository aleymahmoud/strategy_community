"use client";

import { useState, useRef, useCallback } from "react";

interface Seat {
  id: string;
  label: string;
  positionX: number;
  positionY: number;
  status: string;
}

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

interface Layout {
  id: string;
  width: number;
  height: number;
}

interface LayoutCanvasProps {
  layout: Layout;
  sections: Section[];
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onSelectSection?: (sectionId: string | null) => void;
  selectedSection?: string | null;
  showGrid?: boolean;
  gridSize?: number;
}

export default function LayoutCanvas({
  layout,
  sections,
  onUpdateSection,
  onSelectSection,
  selectedSection,
  showGrid = true,
  gridSize = 50,
}: LayoutCanvasProps) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const innerCanvasRef = useRef<HTMLDivElement>(null);

  // Snap position to grid
  const snapToGrid = useCallback((value: number) => {
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !innerCanvasRef.current) return;

    const rect = innerCanvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDragging(sectionId);
    setOffset({
      x: mouseX - section.positionX,
      y: mouseY - section.positionY,
    });
    setDragPosition({ x: section.positionX, y: section.positionY });
    onSelectSection?.(sectionId);
  }, [sections, onSelectSection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !innerCanvasRef.current) return;

    const rect = innerCanvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const section = sections.find((s) => s.id === dragging);
    if (!section) return;

    let newX = mouseX - offset.x;
    let newY = mouseY - offset.y;

    // Snap to grid while dragging
    if (showGrid) {
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
    }

    // Clamp to canvas bounds
    newX = Math.max(0, Math.min(newX, layout.width - section.width));
    newY = Math.max(0, Math.min(newY, layout.height - section.height));

    setDragPosition({ x: newX, y: newY });
  }, [dragging, offset, layout.width, layout.height, sections, showGrid, snapToGrid]);

  const handleMouseUp = useCallback(() => {
    if (dragging && dragPosition) {
      onUpdateSection(dragging, {
        positionX: Math.round(dragPosition.x),
        positionY: Math.round(dragPosition.y),
      });
    }
    setDragging(null);
    setDragPosition(null);
  }, [dragging, dragPosition, onUpdateSection]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === innerCanvasRef.current || e.target === canvasRef.current) {
      onSelectSection?.(null);
    }
  }, [onSelectSection]);

  function renderSection(section: Section) {
    const posX = dragging === section.id && dragPosition ? dragPosition.x : section.positionX;
    const posY = dragging === section.id && dragPosition ? dragPosition.y : section.positionY;
    const isSelected = selectedSection === section.id;

    const baseStyle = {
      left: posX,
      top: posY,
      width: section.width,
      height: section.height,
      transform: `rotate(${section.rotation}deg)`,
      zIndex: dragging === section.id ? 100 : isSelected ? 50 : 1,
    };

    const selectionRing = isSelected ? "ring-2 ring-purple-500 ring-offset-2" : "";

    if (section.type === "ROUND_TABLE") {
      return (
        <div
          key={section.id}
          className={`absolute cursor-move select-none ${dragging === section.id ? 'opacity-80' : ''}`}
          style={baseStyle}
          onMouseDown={(e) => handleMouseDown(e, section.id)}
        >
          <div className={`w-full h-full rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center shadow-md pointer-events-none ${selectionRing}`}>
            <span className="text-xs text-amber-800 font-medium text-center px-2">
              {section.name}
              <br />
              <span className="text-amber-600">({section.capacity})</span>
            </span>
          </div>
          {Array.from({ length: section.capacity }).map((_, i) => {
            const angle = (i / section.capacity) * 2 * Math.PI - Math.PI / 2;
            const seatX = section.width / 2 + (section.width / 2 + 15) * Math.cos(angle) - 12;
            const seatY = section.height / 2 + (section.height / 2 + 15) * Math.sin(angle) - 12;
            return (
              <div
                key={i}
                className="absolute w-6 h-6 rounded-full bg-gray-200 border border-gray-400 flex items-center justify-center text-xs pointer-events-none"
                style={{ left: seatX, top: seatY }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      );
    }

    if (section.type === "RECTANGULAR_TABLE") {
      return (
        <div
          key={section.id}
          className={`absolute cursor-move select-none ${dragging === section.id ? 'opacity-80' : ''}`}
          style={baseStyle}
          onMouseDown={(e) => handleMouseDown(e, section.id)}
        >
          <div className={`w-full h-full rounded-lg bg-amber-100 border-2 border-amber-400 flex items-center justify-center shadow-md pointer-events-none ${selectionRing}`}>
            <span className="text-xs text-amber-800 font-medium text-center">
              {section.name}
              <br />
              <span className="text-amber-600">({section.capacity})</span>
            </span>
          </div>
          {Array.from({ length: Math.ceil(section.capacity / 2) }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="absolute w-6 h-6 rounded-full bg-gray-200 border border-gray-400 flex items-center justify-center text-xs pointer-events-none"
              style={{
                left: 10 + i * ((section.width - 20) / Math.ceil(section.capacity / 2)),
                top: -20,
              }}
            >
              {i + 1}
            </div>
          ))}
          {Array.from({ length: Math.floor(section.capacity / 2) }).map((_, i) => (
            <div
              key={`bottom-${i}`}
              className="absolute w-6 h-6 rounded-full bg-gray-200 border border-gray-400 flex items-center justify-center text-xs pointer-events-none"
              style={{
                left: 10 + i * ((section.width - 20) / Math.max(1, Math.floor(section.capacity / 2))),
                top: section.height + 4,
              }}
            >
              {Math.ceil(section.capacity / 2) + i + 1}
            </div>
          ))}
        </div>
      );
    }

    if (section.type === "ROW") {
      return (
        <div
          key={section.id}
          className={`absolute cursor-move select-none ${dragging === section.id ? 'opacity-80' : ''}`}
          style={baseStyle}
          onMouseDown={(e) => handleMouseDown(e, section.id)}
        >
          <div className={`w-full h-full bg-blue-50 border-2 border-blue-300 rounded flex items-center justify-center shadow-md pointer-events-none ${selectionRing}`}>
            <span className="text-xs text-blue-800 font-medium">{section.name}</span>
          </div>
          {Array.from({ length: section.capacity }).map((_, i) => (
            <div
              key={i}
              className="absolute w-6 h-6 rounded-full bg-gray-200 border border-gray-400 flex items-center justify-center text-xs pointer-events-none"
              style={{
                left: 5 + i * ((section.width - 30) / Math.max(1, section.capacity - 1)),
                top: section.height + 4,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        key={section.id}
        className={`absolute cursor-move select-none ${dragging === section.id ? 'opacity-80' : ''}`}
        style={baseStyle}
        onMouseDown={(e) => handleMouseDown(e, section.id)}
      >
        <div className={`w-full h-full bg-gray-100 border-2 border-gray-400 rounded flex items-center justify-center shadow-md pointer-events-none ${selectionRing}`}>
          <span className="text-xs text-gray-800 font-medium text-center">
            {section.name}
            <br />
            <span className="text-gray-600">({section.capacity})</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="relative bg-gray-100 overflow-auto"
      style={{ width: "100%", height: "100%" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      <div
        ref={innerCanvasRef}
        className="relative bg-white"
        style={{
          width: layout.width,
          height: layout.height,
          minWidth: layout.width,
          minHeight: layout.height,
        }}
      >
        {/* Grid lines */}
        {showGrid && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={layout.width}
            height={layout.height}
          >
            {/* Vertical lines */}
            {Array.from({ length: Math.floor(layout.width / gridSize) + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * gridSize}
                y1={0}
                x2={i * gridSize}
                y2={layout.height}
                stroke="#e5e7eb"
                strokeWidth={i % 2 === 0 ? 1 : 0.5}
              />
            ))}
            {/* Horizontal lines */}
            {Array.from({ length: Math.floor(layout.height / gridSize) + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * gridSize}
                x2={layout.width}
                y2={i * gridSize}
                stroke="#e5e7eb"
                strokeWidth={i % 2 === 0 ? 1 : 0.5}
              />
            ))}
          </svg>
        )}

        {/* Sections */}
        {sections.map(renderSection)}

        {/* Instructions */}
        {sections.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-lg">
              Click &quot;Add Section&quot; to start building your layout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
