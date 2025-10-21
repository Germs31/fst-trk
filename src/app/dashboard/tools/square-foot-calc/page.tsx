"use client";

import React, { useState } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import { Box, Typography, Paper, Button } from "@mui/material";

// Helper function for area calculation (shoelace formula)
function calculateArea(points: { x: number; y: number }[], scale = 1): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(area / 2) * scale;
}

export default function SquareFootageTool() {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [isClosed, setIsClosed] = useState(false);
  const scale = 0.04; // Adjust to your grid (1 pixel = 0.04 sq ft)

  const handleStageClick = (e: any) => {
    if (isClosed) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    // Check if near the first point (close shape)
    if (points.length > 2) {
      const dx = pos.x - points[0].x;
      const dy = pos.y - points[0].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 10) {
        setIsClosed(true);
        return;
      }
    }

    setPoints([...points, { x: pos.x, y: pos.y }]);
  };

  const handleDrag = (index: number, e: any) => {
    const updated = [...points];
    updated[index] = { x: e.target.x(), y: e.target.y() };
    setPoints(updated);
  };

  const resetDrawing = () => {
    setPoints([]);
    setIsClosed(false);
  };

  const area = calculateArea(points, scale);

  return (
    <Box component={Paper} sx={{ p: 3, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>
        Square Footage Tool
      </Typography>

      <Typography variant="body1" gutterBottom>
        Click on the grid to add points. Connect them to form your layout.
        When you click near the first point, the shape will close and the area will be calculated.
      </Typography>

      <Box
        sx={{
          border: "1px solid #ccc",
          mt: 2,
          mb: 2,
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#fafafa",
        }}
      >
        <Stage
          width={700}
          height={500}
          onClick={handleStageClick}
          style={{ cursor: isClosed ? "default" : "crosshair" }}
        >
          <Layer>
            {/* Grid background */}
            {Array.from({ length: 70 }).map((_, i) => (
              <Line
                key={`v${i}`}
                points={[i * 10, 0, i * 10, 500]}
                stroke="#eee"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: 50 }).map((_, i) => (
              <Line
                key={`h${i}`}
                points={[0, i * 10, 700, i * 10]}
                stroke="#eee"
                strokeWidth={0.5}
              />
            ))}

            {/* Draw shape lines */}
            {points.length > 1 && (
              <Line
                points={points.flatMap((p) => [p.x, p.y])}
                stroke="#1976d2"
                strokeWidth={2}
                closed={isClosed}
                fill={isClosed ? "rgba(25, 118, 210, 0.1)" : undefined}
              />
            )}

            {/* Dots */}
            {points.map((p, i) => (
              <Circle
                key={i}
                x={p.x}
                y={p.y}
                radius={6}
                fill={i === 0 ? "#d32f2f" : "#1976d2"}
                draggable={!isClosed}
                onDragMove={(e) => handleDrag(i, e)}
              />
            ))}
          </Layer>
        </Stage>
      </Box>

      <Typography variant="h6">
        Area: {area.toFixed(2)} sq ft
      </Typography>

      <Box display="flex" gap={2} mt={2}>
        <Button variant="outlined" color="primary" onClick={resetDrawing}>
          Clear Drawing
        </Button>
        {isClosed && (
          <Button
            variant="contained"
            color="success"
            onClick={() => alert(`Total area: ${area.toFixed(2)} sq ft`)}
          >
            Save Layout
          </Button>
        )}
      </Box>
    </Box>
  );
}
