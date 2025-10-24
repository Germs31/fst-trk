"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Stage, Layer, Line, Circle, Text as KText } from "react-konva";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Divider,
  Alert,
} from "@mui/material";

// ---------- geometry helpers ----------
function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function polygonAreaPx(pts: { x: number; y: number }[]) {
  if (pts.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    s += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(s / 2);
}
function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
function angleDeg(a: { x: number; y: number }, b: { x: number; y: number }) {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}
function median(nums: number[]) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
// snap current point to nearest axis relative to a reference point
function snapToNearestAxis(
  reference: { x: number; y: number },
  current: { x: number; y: number }
) {
  const dx = current.x - reference.x;
  const dy = current.y - reference.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { x: current.x, y: reference.y }; // horizontal
  }
  return { x: reference.x, y: current.y }; // vertical
}

// ---------- types ----------
type Edge = {
  feet?: number; // user-entered wall length (ft)
  px: number; // computed pixel length between vertex i and i+1
};

export default function SquareFootageSnapTool() {
  // canvas/grid
  const CANVAS_W = 1000;
  const CANVAS_H = 620;
  const GRID = 20;

  // shape state
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [isClosed, setIsClosed] = useState(false);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // add point (snapped), close when near the first one
  const handleStageClick = (e: any) => {
    if (isClosed) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    let newPt = { x: pos.x, y: pos.y };
    if (points.length >= 1) {
      const ref = points[points.length - 1];
      newPt = snapToNearestAxis(ref, newPt); // ALWAYS snap on create
    }

    // close if near first point and polygon has at least 3 sides
    if (points.length >= 3) {
      const nearStart = dist(newPt, points[0]) < 12;
      if (nearStart) {
        setIsClosed(true);
        // init edges based on current points
        const n = points.length;
        const init: Edge[] = Array.from({ length: n }, (_, i) => {
          const a = points[i],
            b = points[(i + 1) % n];
          return { px: dist(a, b) };
        });
        setEdges(init);
        return;
      }
    }

    setPoints((prev) => [...prev, newPt]);
  };

  // drag vertices (snapped relative to previous vertex by default)
  const handleDrag = (idx: number, e: any) => {
    const raw = { x: e.target.x(), y: e.target.y() };
    const updated = [...points];

    // choose snap reference: prefer previous vertex, otherwise next, else origin
    let ref: { x: number; y: number } | null = null;
    if (updated.length > 1) {
      ref = updated[(idx - 1 + updated.length) % updated.length];
      if (!isClosed && idx === 0 && updated.length > 1) {
        // if dragging the first point before closing, snap to second point direction
        ref = updated[1];
      }
    }
    const snapped = ref ? snapToNearestAxis(ref, raw) : raw;
    updated[idx] = snapped;
    setPoints(updated);
  };

  const reset = () => {
    setPoints([]);
    setIsClosed(false);
    setEdges([]);
    setActiveIdx(null);
  };

  // recompute px lengths as points change (both open + closed states)
  useEffect(() => {
    if (points.length < 2) {
      setEdges([]);
      return;
    }
    if (!isClosed) return; // only keep px in sync after closed
    if (edges.length !== points.length) return;

    const n = points.length;
    const next = edges.map((ed, i) => ({
      ...ed,
      px: dist(points[i], points[(i + 1) % n]),
    }));
    setEdges(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // derived: pixel area
  const pixelArea = useMemo(() => polygonAreaPx(points), [points]);

  // derived: per-edge scales (ft/px) from user-entered feet
  const scales = useMemo(() => {
    return edges
      .map((ed) => (ed.feet && ed.px > 0 ? ed.feet / ed.px : undefined))
      .filter((v): v is number => typeof v === "number" && isFinite(v));
  }, [edges]);

  const scaleFtPerPx = scales.length ? median(scales) : 0;

  // consistency: RMS deviation of scales (percent of mean)
  const consistencyPct = useMemo(() => {
    if (scales.length < 2) return null;
    const mean = scales.reduce((a, b) => a + b, 0) / scales.length;
    const rms =
      Math.sqrt(scales.reduce((s, v) => s + (v - mean) * (v - mean), 0) / scales.length) ||
      0;
    return mean ? (rms / mean) * 100 : 0;
  }, [scales]);

  const areaSqFt = scaleFtPerPx ? pixelArea * scaleFtPerPx * scaleFtPerPx : 0;

  // update a wall's feet input
  const setEdgeFeet = (i: number, val: string) => {
    const v = val.trim() === "" ? undefined : Number(val);
    setEdges((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], feet: isNaN(v as number) ? undefined : (v as number) };
      return copy;
    });
  };

  // ----- rendering helpers -----
  const shapePoints = points.flatMap((p) => [p.x, p.y]);

  return (
    <Box component={Paper} sx={{ p: 3, maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Square Footage (Snapping + Per-Wall Measurements)
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Click to place corners. Each point snaps to the nearest axis (horizontal/vertical) relative to the previous corner.
        Click near the first point to close the shape. Enter each wall length (ft) to derive scale and compute area.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              border: "1px solid #ccc",
              backgroundColor: "#fafafa",
              position: "relative",
              width: CANVAS_W,
              height: CANVAS_H,
              mx: "auto",
            }}
          >
            <Stage
              width={CANVAS_W}
              height={CANVAS_H}
              onClick={handleStageClick}
              style={{ cursor: isClosed ? "default" : "crosshair" }}
            >
              <Layer>
                {/* grid */}
                {Array.from({ length: Math.floor(CANVAS_W / GRID) + 1 }).map((_, i) => (
                  <Line
                    key={`v-${i}`}
                    points={[i * GRID, 0, i * GRID, CANVAS_H]}
                    stroke="#eee"
                    strokeWidth={1}
                  />
                ))}
                {Array.from({ length: Math.floor(CANVAS_H / GRID) + 1 }).map((_, i) => (
                  <Line
                    key={`h-${i}`}
                    points={[0, i * GRID, CANVAS_W, i * GRID]}
                    stroke="#eee"
                    strokeWidth={1}
                  />
                ))}

                {/* polygon */}
                {points.length > 1 && (
                  <Line
                    points={shapePoints}
                    stroke="#1976d2"
                    strokeWidth={2}
                    closed={isClosed}
                    fill={isClosed ? "rgba(25,118,210,0.08)" : undefined}
                  />
                )}

                {/* vertices */}
                {points.map((p, i) => (
                  <Circle
                    key={i}
                    x={p.x}
                    y={p.y}
                    radius={6}
                    fill={i === 0 ? "#d32f2f" : i === activeIdx ? "#ff9800" : "#1976d2"}
                    draggable
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(null)}
                    onDragMove={(e) => handleDrag(i, e)}
                  />
                ))}

                {/* edge labels */}
                {isClosed &&
                  points.map((p, i) => {
                    const j = (i + 1) % points.length;
                    const a = points[i],
                      b = points[j];
                    const mid = midpoint(a, b);
                    const ang = angleDeg(a, b);
                    const ed = edges[i];
                    const label =
                      ed?.feet && !isNaN(ed.feet) ? `${ed.feet.toFixed(2)} ft` : `${(ed?.px ?? dist(a, b)).toFixed(0)} px`;
                    return (
                      <KText
                        key={`lab-${i}`}
                        text={label}
                        x={mid.x}
                        y={mid.y}
                        rotation={ang}
                        offsetX={30}
                        offsetY={-10}
                        fontSize={12}
                        fill="#333"
                      />
                    );
                  })}
              </Layer>
            </Stage>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" mb={1}>
            Wall Measurements
          </Typography>

          {!isClosed && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Place at least 3 points, then click near the first point to close the shape.
            </Alert>
          )}

          {isClosed && edges.length === points.length && (
            <>
              <Grid container spacing={1}>
                {edges.map((ed, i) => {
                  const pxLen = ed.px ?? (points.length ? dist(points[i], points[(i + 1) % points.length]) : 0);
                  return (
                    <Grid item xs={12} key={`edge-${i}`}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ minWidth: 64 }}>Wall {i + 1}</Typography>
                        <TextField
                          size="small"
                          label="Length (ft)"
                          value={ed.feet ?? ""}
                          onChange={(e) => setEdgeFeet(i, e.target.value)}
                          sx={{ width: 160 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({pxLen.toFixed(0)} px)
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2">
                Derived scale (median):{" "}
                <strong>{scaleFtPerPx ? `${scaleFtPerPx.toFixed(4)} ft/px` : "—"}</strong>
              </Typography>
              {consistencyPct !== null && (
                <Typography
                  variant="body2"
                  color={consistencyPct > 8 ? "error" : "text.secondary"}
                >
                  Scale consistency (RMS): {consistencyPct.toFixed(1)}%
                </Typography>
              )}

              <Typography variant="h6" mt={1}>
                Area: {areaSqFt ? `${areaSqFt.toFixed(2)} sq ft` : "—"}
              </Typography>
            </>
          )}

          <Box display="flex" gap={1} mt={2}>
            <Button variant="outlined" onClick={reset}>
              Clear
            </Button>
            {isClosed && (
              <Button
                variant="contained"
                onClick={() => alert(`Saved. Area: ${areaSqFt.toFixed(2)} sq ft`)}
              >
                Save
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
