import { useState, useRef, useEffect, type MouseEvent, type TouchEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Paintbrush,
  Eraser,
  RotateCcw,
  Download,
  Sparkles,
  Trash2,
  Smile,
  Check,
  Undo2,
  Image as ImageIcon,
} from "lucide-react";
import confetti from "canvas-confetti";
import { playPopSound, playSuccessSound, playHeartSound } from "../lib/sound";
import penguinImg from "../assets/images/penguin_avatar_1784920051288.jpg";

const BRUSH_COLORS = [
  "#f43f5e", // Red
  "#fb923c", // Orange
  "#facc15", // Yellow
  "#4ade80", // Green
  "#38bdf8", // Blue
  "#a855f7", // Purple
  "#f472b6", // Pink
  "#0f172a", // Black
  "#ffffff", // White
  "#eab308", // Gold
];

const STAMPS = ["🐧", "🌟", "🎈", "🐶", "👑", "🌈", "🎨", "🚀", "🐥", "🦄"];

const BG_COLORS = [
  { name: "White Canvas", value: "#ffffff" },
  { name: "Sky Blue", value: "#e0f2fe" },
  { name: "Pastel Pink", value: "#fce7f3" },
  { name: "Mint Green", value: "#d1fae5" },
  { name: "Night Sky", value: "#0f172a" },
];

export default function KidsDrawingStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState(BRUSH_COLORS[0]);
  const [brushSize, setBrushSize] = useState(12);
  const [tool, setTool] = useState<"brush" | "eraser" | "stamp">("brush");
  const [selectedStamp, setSelectedStamp] = useState(STAMPS[0]);
  const [canvasBg, setCanvasBg] = useState(BG_COLORS[0].value);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [gallery, setGallery] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sasa-kids-artworks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showGallery, setShowGallery] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high resolution display
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Initial Background Fill
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Save initial state to history
    saveState();
  }, []);

  // Handle canvas background change
  const handleChangeBg = (color: string) => {
    playPopSound();
    setCanvasBg(color);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState();
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), imageData]); // Keep last 10 states
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    playPopSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const getCanvasCoords = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "stamp") {
      playHeartSound();
      ctx.font = `${brushSize * 3.5}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(selectedStamp, x, y);
      saveState();
      confetti({
        particleCount: 15,
        spread: 40,
        origin: {
          x: e.type.includes("touch")
            ? 0.5
            : (e as MouseEvent<HTMLCanvasElement>).clientX / window.innerWidth,
          y: (e as MouseEvent<HTMLCanvasElement>).clientY / window.innerHeight,
        },
      });
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? canvasBg : selectedColor;
    ctx.lineWidth = tool === "eraser" ? brushSize * 2 : brushSize;
  };

  const draw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === "stamp") return;
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const clearCanvas = () => {
    playPopSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState();
  };

  const saveArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    playSuccessSound();
    const imageURL = canvas.toDataURL("image/png");

    // Save to local gallery
    const updatedGallery = [imageURL, ...gallery.slice(0, 11)];
    setGallery(updatedGallery);
    localStorage.setItem("sasa-kids-artworks", JSON.stringify(updatedGallery));

    // Download file
    const link = document.createElement("a");
    link.download = `pippin_drawing_${Date.now()}.png`;
    link.href = imageURL;
    link.click();

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 p-4 sm:p-6 bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 rounded-3xl border-4 border-white shadow-2xl">
      {/* Studio Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-purple-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 bg-sky-200 shadow-md">
            <img src={penguinImg} alt="Pippin" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-black text-purple-900 tracking-tight flex items-center gap-1.5">
              <span>Pippin's Art Studio</span>
              <Sparkles className="text-amber-400" size={18} />
            </h2>
            <p className="text-xs font-bold text-purple-600">
              Draw, paint & place stickers on your canvas!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
            title="Undo"
          >
            <Undo2 size={16} />
            <span className="hidden sm:inline">Undo</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={clearCanvas}
            className="p-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
            title="Clear Canvas"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Clear</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setShowGallery((v) => !v)}
            className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <ImageIcon size={16} />
            <span>Gallery ({gallery.length})</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={saveArtwork}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition"
          >
            <Download size={16} />
            <span>Save Picture</span>
          </motion.button>
        </div>
      </div>

      {/* Main Drawing Canvas Container */}
      <div className="relative w-full h-[380px] sm:h-[460px] rounded-3xl overflow-hidden shadow-inner border-4 border-purple-200 bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full touch-none cursor-crosshair"
        />

        {/* Gallery Overlay */}
        <AnimatePresence>
          {showGallery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-md p-6 text-white overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-amber-300 flex items-center gap-2">
                  <ImageIcon size={22} />
                  <span>My Saved Artworks 🎨</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGallery(false)}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xs"
                >
                  Close Gallery
                </button>
              </div>

              {gallery.length === 0 ? (
                <div className="my-auto text-center text-slate-300">
                  <p className="text-4xl mb-2">🖼️</p>
                  <p className="font-bold text-sm">No drawings saved yet!</p>
                  <p className="text-xs text-slate-400">
                    Draw something and tap "Save Picture" above!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border-2 border-white/20 group"
                    >
                      <img
                        src={img}
                        alt={`Artwork ${idx}`}
                        className="w-full h-32 object-cover bg-white"
                      />
                      <a
                        href={img}
                        download={`pippin_art_${idx}.png`}
                        className="absolute bottom-2 right-2 bg-amber-400 text-amber-950 p-2 rounded-full shadow-lg font-black text-xs"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar (Tools, Colors, Sizes & Backgrounds) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-purple-100 shadow-md">
        {/* Tools Switcher */}
        <div className="md:col-span-4 flex items-center gap-2 bg-purple-50 p-1.5 rounded-2xl border border-purple-100">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setTool("brush");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
              tool === "brush"
                ? "bg-purple-600 text-white shadow-md"
                : "text-purple-900 hover:bg-purple-100"
            }`}
          >
            <Paintbrush size={16} />
            <span>Paint</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPopSound();
              setTool("stamp");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
              tool === "stamp"
                ? "bg-amber-500 text-white shadow-md"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <Smile size={16} />
            <span>Stickers</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPopSound();
              setTool("eraser");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
              tool === "eraser"
                ? "bg-rose-500 text-white shadow-md"
                : "text-rose-900 hover:bg-rose-100"
            }`}
          >
            <Eraser size={16} />
            <span>Eraser</span>
          </button>
        </div>

        {/* Colors / Stickers Palette */}
        <div className="md:col-span-8 flex flex-col justify-center gap-2">
          {tool === "stamp" ? (
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              <span className="text-xs font-black text-amber-900 shrink-0">Sticker:</span>
              {STAMPS.map((stamp) => (
                <button
                  key={stamp}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setSelectedStamp(stamp);
                  }}
                  className={`w-9 h-9 text-2xl rounded-xl flex items-center justify-center shrink-0 transition ${
                    selectedStamp === stamp
                      ? "bg-amber-200 border-2 border-amber-500 scale-110 shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {stamp}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              <span className="text-xs font-black text-purple-900 shrink-0">Colors:</span>
              {BRUSH_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setSelectedColor(color);
                    if (tool === "eraser") setTool("brush");
                  }}
                  style={{ backgroundColor: color }}
                  className={`w-8 h-8 rounded-full shrink-0 transition border-2 ${
                    selectedColor === color && tool === "brush"
                      ? "ring-4 ring-purple-400 scale-110 border-white shadow-md"
                      : "border-slate-300 hover:scale-105"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Brush Size & Background Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Size selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700">Size:</span>
              {[6, 12, 22, 36].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBrushSize(size)}
                  className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center border transition ${
                    brushSize === size
                      ? "bg-purple-600 text-white border-purple-600 scale-110"
                      : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {size < 12 ? "•" : size < 22 ? "●" : "🔴"}
                </button>
              ))}
            </div>

            {/* Paper Background selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-slate-500">Paper:</span>
              {BG_COLORS.map((bg) => (
                <button
                  key={bg.name}
                  type="button"
                  onClick={() => handleChangeBg(bg.value)}
                  style={{ backgroundColor: bg.value }}
                  className={`w-5 h-5 rounded-md border shadow-2xl transition ${
                    canvasBg === bg.value ? "ring-2 ring-purple-600 scale-110" : "border-slate-300"
                  }`}
                  title={bg.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
