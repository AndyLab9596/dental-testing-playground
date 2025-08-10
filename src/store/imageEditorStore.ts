import { Canvas, Rect } from "fabric";
import { create } from "zustand";
interface ImageEditorPropertiesState {
  imageUrl: string;
  uploadedImages: string[];

  canvasRef: Canvas | null;
  canvasOfCropRecRef: Rect | null;
}

interface ImageEditorActionsState {
  setImageUrl: (imageUrl: string) => void;
  setCanvasRef: (canvasRef: Canvas | null) => void;
  setCropRec: (canvasOfCropRecRef: Rect | null) => void;
}

interface ImageEditorState
  extends ImageEditorPropertiesState,
    ImageEditorActionsState {}

export const useImageEditorStore = create<ImageEditorState>((set) => ({
  imageUrl: "",
  uploadedImages: [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIKeRec-gX3DiQjFyMBjZUHAl5f1-93HF2Sg&s",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/06-10-06smile.jpg/1200px-06-10-06smile.jpg",
  ],

  canvasRef: null,
  canvasOfCropRecRef: null,

  setCanvasRef: (canvasRef: Canvas | null) => set({ canvasRef }),
  setImageUrl: (imageUrl: string) => set({ imageUrl }),
  setCropRec: (canvasOfCropRecRef: Rect | null) =>
    set({ canvasOfCropRecRef }),
}));
