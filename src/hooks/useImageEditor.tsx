import { Canvas, FabricImage, Point, Rect } from "fabric";
import {
  MAP_SIDE_DEGREE,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from "../constants/zoom.constant";
import { SIDE } from "../enums/side.enum";

export const useImageEditor = () => {
  /*
    Image functionalities
    */
  const handleLoadImage = async (imageUrl: string, canvasRef: Canvas) => {
    if (!imageUrl || !canvasRef) throw new Error();

    const fabricImg = await FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous", // very important
    });
    if (fabricImg) {
      fabricImg.set({
        selectable: true,
        currentImageUrl: imageUrl,
      });
      canvasRef.centerObject(fabricImg);
      canvasRef.add(fabricImg);
      canvasRef.setActiveObject(fabricImg);
    }
  };

  const handleRemoveCurrentImage = async (
    currentImageUrl: string,
    canvasRef: Canvas
  ) => {
    if (!currentImageUrl || !canvasRef) throw new Error();
    canvasRef.getActiveObjects().forEach((obj) => {
      if (obj.get("currentImageUrl") === currentImageUrl) {
        canvasRef.remove(obj);
      }
    });
  };

  /*
    Zoom functionalities
    */
  const applyZoom = (newZoom: number, canvasRef: Canvas) => {
    if (!canvasRef) return;
    const center = new Point(
      canvasRef.getWidth() / 2,
      canvasRef.getHeight() / 2
    );
    canvasRef.zoomToPoint(center, newZoom);
    canvasRef.requestRenderAll();
  };

  const handleZoomIn = (canvasRef: Canvas) => {
    const zoom = canvasRef.getZoom();
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    applyZoom(newZoom, canvasRef);
  };

  const handleZoomOut = (canvasRef: Canvas) => {
    const zoom = canvasRef.getZoom();
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    applyZoom(newZoom, canvasRef);
  };

  /*
    Rotation functionalities
    */
  const applyRotate = (canvasRef: Canvas, side: SIDE) => {
    const active = canvasRef.getActiveObject();
    if (active) {
      const currentAngle = active.angle || 0;
      active.rotate(currentAngle + MAP_SIDE_DEGREE[side]);
      canvasRef.renderAll();
    }
  };

  const handleRotateRight = (canvasRef: Canvas) => {
    applyRotate(canvasRef, SIDE.RIGHT);
  };

  const handleRotateLeft = (canvasRef: Canvas) => {
    applyRotate(canvasRef, SIDE.LEFT);
  };

  /**Cropping */
  const startCropMode = (
    canvasRef: Canvas,
    setCropRec: (canvasOfCropRecRef: Rect | null) => void
  ) => {
    // create a semi-transparent rect user can move/resize as crop area
    const rect = new Rect({
      left: 100,
      top: 80,
      width: 300,
      height: 200,
      fill: "rgba(0,0,0,0.3)",
      stroke: "#fff",
      strokeDashArray: [5, 5],
      selectable: true,
      hasBorders: true,
      cornerStyle: "circle",
      objectCaching: false,
    });
    setCropRec(rect);
    canvasRef.add(rect);
    canvasRef.setActiveObject(rect);
    canvasRef.renderAll();
  };

  const stopCropMode = (
    canvasRef: Canvas,
    canvasOfCropRecRef: Rect | null,
    setCropRec: (canvasOfCropRecRef: Rect | null) => void
  ) => {
    if (canvasOfCropRecRef) {
      canvasRef.remove(canvasOfCropRecRef);
      setCropRec(null);
    }
  };

  const applyRealCropToActiveImage = async (
    canvasRef: Canvas,
    canvasOfCropRecRef: Rect | null,
    setCropRec: (canvasOfCropRecRef: Rect | null) => void
  ) => {
    if (!canvasRef) return;

    const activeObject = canvasRef.getActiveObject();

    const imgObj = canvasRef.getObjects().find((obj) => obj.type === "image");
    if (!imgObj) return;

    const imgObjToObject = imgObj?.toObject();

    const cropRect = activeObject?.getBoundingRect();

    if (!cropRect) return;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cropRect.width;
    tempCanvas.height = cropRect.height;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      imgObj?.toCanvasElement() as HTMLCanvasElement,
      cropRect.left - imgObjToObject.left!,
      cropRect.top - imgObjToObject.top!,
      cropRect.width,
      cropRect.height,
      0,
      0,
      cropRect.width,
      cropRect.height
    );

    tempCanvas.toBlob(async (blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        await handleLoadImage(imageUrl, canvasRef);
      }
    }, "image/png");
    canvasRef.remove(imgObj);

    if (canvasOfCropRecRef) {
      canvasRef.remove(canvasOfCropRecRef);
      setCropRec(null);
    }
    canvasRef.renderAll();
  };

  const downloadCroppedImage = (canvasRef: Canvas) => {
    const dataUrl = canvasRef.toDataURL();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "Hello World";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    handleLoadImage,
    handleRemoveCurrentImage,
    handleZoomIn,
    handleZoomOut,
    handleRotateRight,
    handleRotateLeft,

    startCropMode,
    stopCropMode,
    downloadCroppedImage,
    applyRealCropToActiveImage,
  };
};
