import type { Canvas } from "fabric";
import { useEffect, useRef, useState } from "react";

export const useCanvasHistory = (canvas: Canvas) => {
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const pauseSaving = useRef(false);
  const previousJson = useRef<string | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Custom JSON serialization to preserve image properties
  const canvasToJSON = () => {
    const canvasJSON = canvas.toJSON();

    return JSON.stringify({
      ...canvasJSON,
      viewportTransform: canvas.viewportTransform,
      zoom: canvas.getZoom(),
    }); // Include custom properties
  };

  // Custom JSON loading with proper image handling
  const loadCanvasFromJSON = async (jsonString: string) => {
    try {
      const jsonData = JSON.parse(jsonString);
      const { viewportTransform, zoom, ...canvasData } = jsonData;
      // Load canvas from JSON with proper image handling
      await canvas.loadFromJSON(canvasData);

      if (viewportTransform) {
        canvas.setViewportTransform(viewportTransform);
      } else if (zoom) {
        canvas.setZoom(zoom);
      }

      // Re-apply crossOrigin to all images after loading
      //   canvas.getObjects().forEach((obj) => {
      //     if (obj.type === 'image' && obj.get('imageUrl')) {
      //       const img = obj as FabricImage;
      //       if (img._element) {
      //         img._element.crossOrigin = 'anonymous';
      //       }
      //     }
      //   });

      canvas.requestRenderAll();
    } catch (error) {
      console.error("Error loading canvas from JSON:", error);
    }
  };

  const saveState = () => {
    if (!canvas || pauseSaving.current) return;

    const json = canvasToJSON();
    if (previousJson.current !== json) {
      undoStack.current.push(json);
      previousJson.current = json;
      redoStack.current = [];

      setCanUndo(undoStack.current.length > 1);
      setCanRedo(false);
    }
  };

  const undo = async () => {
    if (undoStack.current.length <= 1 || !canvas) return;

    pauseSaving.current = true;

    const lastState = undoStack.current.pop();
    const prevState = undoStack.current[undoStack.current.length - 1];

    if (lastState) redoStack.current.push(lastState);

    if (prevState) {
      await loadCanvasFromJSON(prevState);
      previousJson.current = prevState;
      pauseSaving.current = false;
      setCanUndo(undoStack.current.length > 1);
      setCanRedo(true);
    } else {
      pauseSaving.current = false;
    }
  };

  const redo = async () => {
    if (redoStack.current.length === 0 || !canvas) return;

    pauseSaving.current = true;

    const nextState = redoStack.current.pop();
    if (nextState) {
      undoStack.current.push(nextState);
      await loadCanvasFromJSON(nextState);
      previousJson.current = nextState;
      pauseSaving.current = false;
      setCanUndo(true);
      setCanRedo(redoStack.current.length > 0);
    } else {
      pauseSaving.current = false;
    }
  };

  useEffect(() => {
    if (!canvas) return;

    const checkAndSave = () => {
      saveState();
    };

    canvas.on("object:added", checkAndSave);
    canvas.on("object:modified", checkAndSave);
    canvas.on("object:removed", checkAndSave);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (canvas as any).on("zoom:changed", checkAndSave);

    // Add viewport transform events for zoom/pan tracking
    canvas.on("after:render", checkAndSave);
    canvas.on("mouse:wheel", checkAndSave);

    // Debounced save to avoid too frequent saves during zoom
    let saveTimeout: number;
    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(checkAndSave, 300);
    };

    canvas.on("mouse:wheel", debouncedSave);

    // Longer interval to avoid too frequent saves
    const interval = setInterval(() => {
      saveState();
    }, 2000);

    // Save initial state
    setTimeout(() => saveState(), 100);

    return () => {
      canvas.off("object:added", checkAndSave);
      canvas.off("object:modified", checkAndSave);
      canvas.off("object:removed", checkAndSave);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (canvas as any).off("zoom:changed", checkAndSave);
      canvas.off("after:render", checkAndSave);
      canvas.off("mouse:wheel", checkAndSave);
      canvas.off("mouse:wheel", debouncedSave);
      clearInterval(interval);
      clearTimeout(saveTimeout);
    };
  }, [canvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInput) return;

      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey && e.key === "y") ||
        (e.ctrlKey && e.shiftKey && e.key === "Z")
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
  };
};
