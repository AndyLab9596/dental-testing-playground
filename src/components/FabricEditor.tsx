import { Canvas, Rect } from "fabric";
import { useEffect, useRef, useState } from "react";
import { useCanvasHistory } from "../hooks/useCanvasHistory";

export default function FabricEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const c = new Canvas(canvasRef.current, {
        backgroundColor: "#fff",
        selection: true,
      });

      c.set({
        width: 800,
        height: 500,
      });

      // thêm object mẫu
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "red",
        width: 80,
        height: 80,
      });
      c.add(rect);

      setCanvas(c);
      return () => {
        c.dispose();
      }
    }
  }, []);

  const { undo, redo, canUndo, canRedo } = useCanvasHistory(canvas);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button onClick={undo} disabled={!canUndo()}>
          Undo
        </button>
        <button onClick={redo} disabled={!canRedo()}>
          Redo
        </button>
        <button
          onClick={() => {
            const r = new Rect({
              left: Math.random() * 400,
              top: Math.random() * 300,
              fill: "blue",
              width: 50,
              height: 50,
            });
            canvas?.add(r);
          }}
        >
          Add Rect
        </button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
