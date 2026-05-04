"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Trash2, Download } from "lucide-react";

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");

  useEffect(() => {
    const canvas = canvasRef.current;
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext("2d");
    context.scale(dpr, dpr);
    context.lineCap = "round";
    context.strokeStyle = "white";
    context.lineWidth = 2;
    contextRef.current = context;

    // Fill background with near black to match theme
    context.fillStyle = "#0f0f0f";
    context.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    
    if (tool === "eraser") {
      contextRef.current.strokeStyle = "#0f0f0f";
      contextRef.current.lineWidth = 20;
    } else {
      contextRef.current.strokeStyle = "white";
      contextRef.current.lineWidth = 2;
    }

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "#0f0f0f";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f] overflow-hidden">
      <div className="flex items-center gap-2 p-2 border-b border-white/5 bg-card/20 shrink-0">
        <Button
          variant={tool === "pencil" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTool("pencil")}
          className="h-8 w-8 p-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === "eraser" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTool("eraser")}
          className="h-8 w-8 p-0"
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 relative cursor-crosshair">
        <canvas
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
