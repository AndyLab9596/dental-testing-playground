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

    const fabricImg = await FabricImage.fromURL(imageUrl);
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
  const addFrameToCanvas = (canvasRef: Canvas, onFrameUpdated: () => void) => {
    const frameName = `Frame ${canvasRef.getObjects("rect").length + 1}`;

    const frame = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 200,
      fill: "transparent",
      stroke: "#07FE3D",
      strokeWidth: 1,
      selectable: true,
      evented: true,
      name: frameName,
    });

    canvasRef.add(frame);
    canvasRef.renderAll();

    const maintainStrokeWidth = (object: Rect) => {
      const scaleX = object.scaleX || 1;
      const scaleY = object.scaleY || 1;

      object.set({
        width: object.width * scaleX,
        height: object.height * scaleY,
        scaleX: 1,
        scaleY: 1,
        strokeWidth: 1,
      });

      object.setCoords();
    };

    frame.on("scaling", () => {
        maintainStrokeWidth(frame);
        canvasRef.renderAll();
    });

    frame.on("modified", () => {
        maintainStrokeWidth(frame);
        canvasRef.renderAll();
    })

    onFrameUpdated();
  };

  return {
    handleLoadImage,
    handleRemoveCurrentImage,
    handleZoomIn,
    handleZoomOut,
    handleRotateRight,
    handleRotateLeft,

    // cropping
    addFrameToCanvas
  };
};
