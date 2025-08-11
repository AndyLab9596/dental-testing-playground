import {
  Canvas,
  FabricImage,
  Point,
  Rect,
  filters
} from "fabric";
import {
  MAP_SIDE_DEGREE,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from "../constants/zoom.constant";
import { SIDE } from "../enums/side.enum";

export const useImageEditor = () => {
  /*
    === Image Loading and Removal ===
  */

  /**
   * Load an image from a URL into the Fabric canvas.
   * Sets crossOrigin to "anonymous" to avoid CORS issues.
   * Centers the image and sets it as the active object.
   *
   * @param imageUrl - URL of the image to load.
   * @param canvasRef - Fabric canvas reference.
   */
  const handleLoadImage = async (imageUrl: string, canvasRef: Canvas) => {
    if (!imageUrl || !canvasRef)
      throw new Error("Image URL or canvas is missing");

    const fabricImg = await FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous", // Important for cross-domain image loading
    });

    if (fabricImg) {
      fabricImg.set({
        selectable: true,
        imageUrl,
      });

      canvasRef.centerObject(fabricImg);
      canvasRef.add(fabricImg);
      canvasRef.setActiveObject(fabricImg);
      canvasRef.requestRenderAll();
    }
  };

  /**
   * Remove currently active image(s) matching the specified URL from the canvas.
   *
   * @param currentImageUrl - URL of the image to remove.
   * @param canvasRef - Fabric canvas reference.
   */
  const handleRemoveCurrentImage = async (
    currentImageUrl: string,
    canvasRef: Canvas
  ) => {
    if (!currentImageUrl || !canvasRef)
      throw new Error("Image URL or canvas is missing");

    canvasRef.getActiveObjects().forEach((obj) => {
      if (obj.get("imageUrl") === currentImageUrl) {
        canvasRef.remove(obj);
      }
    });
  };

  /*
    === Zoom Controls ===
  */

  /**
   * Apply zoom to the canvas, centering zoom at the canvas center.
   *
   * @param newZoom - Desired zoom level.
   * @param canvasRef - Fabric canvas reference.
   */
  const applyZoom = (newZoom: number, canvasRef: Canvas) => {
    if (!canvasRef) return;
    const center = new Point(
      canvasRef.getWidth() / 2,
      canvasRef.getHeight() / 2
    );
    canvasRef.zoomToPoint(center, newZoom);
    canvasRef.requestRenderAll();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (canvasRef as any).fire("zoom:changed", { zoom: newZoom });
  };

  /**
   * Zoom in by increasing zoom by a defined step, clamped to MAX_ZOOM.
   *
   * @param canvasRef - Fabric canvas reference.
   */
  const handleZoomIn = (canvasRef: Canvas) => {
    const zoom = canvasRef.getZoom();
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    applyZoom(newZoom, canvasRef);
  };

  /**
   * Zoom out by decreasing zoom by a defined step, clamped to MIN_ZOOM.
   *
   * @param canvasRef - Fabric canvas reference.
   */
  const handleZoomOut = (canvasRef: Canvas) => {
    const zoom = canvasRef.getZoom();
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    applyZoom(newZoom, canvasRef);
  };

  /*
    === Rotation Controls ===
  */

  /**
   * Rotate the currently active object by a fixed degree amount.
   *
   * @param canvasRef - Fabric canvas reference.
   * @param side - Direction to rotate, using SIDE enum.
   */
  const applyRotate = (canvasRef: Canvas, side: SIDE) => {
    const active = canvasRef.getActiveObject();
    if (active) {
      const currentAngle = active.angle || 0;
      active.rotate(currentAngle + MAP_SIDE_DEGREE[side]);
      canvasRef.renderAll();
    }
  };

  /**
   * Rotate active object 90 degrees to the right.
   *
   * @param canvasRef - Fabric canvas reference.
   */
  const handleRotateRight = (canvasRef: Canvas) => {
    applyRotate(canvasRef, SIDE.RIGHT);
  };

  /**
   * Rotate active object 90 degrees to the left.
   *
   * @param canvasRef - Fabric canvas reference.
   */
  const handleRotateLeft = (canvasRef: Canvas) => {
    applyRotate(canvasRef, SIDE.LEFT);
  };

  /*
    === Cropping ===
  */

  /**
   * Starts crop mode by adding a semi-transparent, resizable rectangle to the canvas.
   * User can move/resize this rectangle to define crop area.
   *
   * @param canvasRef - Fabric canvas reference.
   * @param setCropRec - Setter function to hold the cropping rectangle reference.
   */
  const startCropMode = (
    canvasRef: Canvas,
    setCropRec: (canvasOfCropRecRef: Rect | null) => void
  ) => {
    const rect = new Rect({
      left: 100,
      top: 80,
      width: 300,
      height: 200,
      fill: "rgba(0,0,0,0.3)", // semi-transparent overlay
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

  /**
   * Stops crop mode by removing the crop rectangle.
   *
   * @param canvasRef - Fabric canvas reference.
   * @param canvasOfCropRecRef - Crop rectangle object.
   * @param setCropRec - Setter function to clear the cropping rectangle.
   */
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

  /**
   * Applies cropping by drawing the selected crop area from the active image onto a temporary canvas,
   * then loads the cropped image back into the main canvas.
   *
   * @param canvasRef - Fabric canvas reference.
   * @param canvasOfCropRecRef - Crop rectangle object.
   * @param setCropRec - Setter function to clear the cropping rectangle.
   */
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

    // Create temp canvas for cropping
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cropRect.width;
    tempCanvas.height = cropRect.height;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    // Draw cropped part of image on temp canvas
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

    // Convert temp canvas to blob and reload image
    tempCanvas.toBlob(async (blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        await handleLoadImage(imageUrl, canvasRef);
      }
    }, "image/png");

    // Remove original image and crop rectangle
    canvasRef.remove(imgObj);
    if (canvasOfCropRecRef) {
      stopCropMode(canvasRef, canvasOfCropRecRef, setCropRec);
    }
    canvasRef.renderAll();
  };

  /*
    === Downloading Canvas as Image ===
  */

  /**
   * Trigger download of current canvas content as a PNG image.
   *
   * @param canvasRef - Fabric canvas reference.
   */
  const downloadCurrentCanvas = (canvasRef: Canvas) => {
    const dataUrl = canvasRef.toDataURL();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "edited-image.png"; // Better to use meaningful filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /*
    === Filters (Brightness, Averaging, Noise, Contrast, Gamma) ===
  */

  /**
   * Apply brightness filter to the active image.
   * Slider value expected: -100 to 100 (converted internally to -1 to 1).
   * 0 means no brightness adjustment (filter removed).
   *
   * @param canvas - Fabric canvas reference.
   * @param sliderValue - Brightness slider value (-100 to 100).
   */
  const applyBrightness = (canvas: Canvas, sliderValue: number) => {
    const value = Math.max(-100, Math.min(100, sliderValue)) / 100;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;
    const img = activeObject as FabricImage;

    img.filters = img.filters || [];
    const idx = img.filters.findIndex(
      (f) => !!f && f.type === filters.Brightness.type
    );

    if (value === 0) {
      if (idx !== -1) {
        img.filters.splice(idx, 1);
      }
    } else {
      if (idx === -1) {
        img.filters.push(new filters.Brightness({ brightness: value }));
      } else {
        (img.filters[idx] as filters.Brightness).brightness = value;
      }
    }
    img.applyFilters();
    canvas.requestRenderAll();
  };

  /**
   * Apply averaging (box blur) filter with variable kernel size.
   * Kernel size is coerced to an odd integer >= 1.
   * Kernel size 1 means no blur (filter removed).
   *
   * @param canvas - Fabric canvas reference.
   * @param sliderSize - Kernel size (integer), recommended range: 1 to 15.
   */
  const applyAveraging = (canvas: Canvas, sliderSize: number) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;
    const img = activeObject as FabricImage;

    img.filters = img.filters || [];
    const convIndex = img.filters.findIndex(
      (f) => !!f && f.type === filters.Convolute.type
    );

    // Ensure kernel size is odd and >=1
    let k = Math.max(1, Math.round(sliderSize));
    if (k % 2 === 0) k += 1;

    // Remove filter if kernel size is 1 (no blur)
    if (k === 1) {
      if (convIndex !== -1) {
        img.filters.splice(convIndex, 1);
        img.applyFilters();
        canvas.requestRenderAll();
      }
      return;
    }

    // Create normalized box kernel matrix for blur
    const cell = 1 / (k * k);
    const matrix: number[] = new Array(k * k).fill(cell);

    if (convIndex === -1) {
      img.filters.push(new filters.Convolute({ matrix }));
    } else {
      (img.filters[convIndex] as filters.Convolute).matrix = matrix;
    }

    img.applyFilters();
    canvas.requestRenderAll();
  };

  /**
   * Apply noise filter to active image.
   * Slider value expected: 0 to 1000.
   * 0 means no noise (filter removed).
   *
   * @param canvas - Fabric canvas reference.
   * @param sliderValue - Noise intensity.
   */
  const applyNoise = (canvas: Canvas, sliderValue: number) => {
    const value = Math.max(0, Math.min(1000, sliderValue));
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;
    const img = activeObject as FabricImage;

    img.filters = img.filters || [];
    const idx = img.filters.findIndex(
      (f) => !!f && f.type === filters.Noise.type
    );

    if (value === 0) {
      if (idx !== -1) img.filters.splice(idx, 1);
    } else {
      if (idx === -1) {
        img.filters.push(new filters.Noise({ noise: value }));
      } else {
        (img.filters[idx] as filters.Noise).noise = value;
      }
    }
    img.applyFilters();
    canvas.requestRenderAll();
  };

  /**
   * Apply contrast filter to active image.
   * Slider value expected: -100 to 100 (converted internally to -1 to 1).
   * 0 means no contrast adjustment (filter removed).
   *
   * @param canvas - Fabric canvas reference.
   * @param sliderValue - Contrast slider value (-100 to 100).
   */
  const applyContrast = (canvas: Canvas, sliderValue: number) => {
    const value = Math.max(-100, Math.min(100, sliderValue)) / 100;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;
    const img = activeObject as FabricImage;

    img.filters = img.filters || [];
    const idx = img.filters.findIndex(
      (f) => !!f && f.type === filters.Contrast.type
    );

    if (value === 0) {
      if (idx !== -1) img.filters.splice(idx, 1);
    } else {
      if (idx === -1) {
        img.filters.push(new filters.Contrast({ contrast: value }));
      } else {
        (img.filters[idx] as filters.Contrast).contrast = value;
      }
    }
    img.applyFilters();
    canvas.requestRenderAll();
  };

  /**
   * Apply gamma correction filter to active image.
   * Slider value expected: 0.1 to 10.
   * 1 means no gamma change (filter removed).
   *
   * @param canvas - Fabric canvas reference.
   * @param sliderValue - Gamma slider value.
   */
  const applyGamma = (canvas: Canvas, sliderValue: number) => {
    const gammaVal = Math.max(0.1, sliderValue); // Ensure minimum gamma value > 0
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;
    const img = activeObject as FabricImage;

    img.filters = img.filters || [];
    const idx = img.filters.findIndex(
      (f) => !!f && f.type === filters.Gamma.type
    );

    if (gammaVal === 1) {
      if (idx !== -1) img.filters.splice(idx, 1);
    } else {
      if (idx === -1) {
        img.filters.push(
          new filters.Gamma({ gamma: [gammaVal, gammaVal, gammaVal] })
        );
      } else {
        (img.filters[idx] as filters.Gamma).gamma = [
          gammaVal,
          gammaVal,
          gammaVal,
        ];
      }
    }
    img.applyFilters();
    canvas.requestRenderAll();
  };

  /*
    === Return API ===
  */
  return {
    handleLoadImage,
    handleRemoveCurrentImage,
    handleZoomIn,
    handleZoomOut,
    handleRotateRight,
    handleRotateLeft,

    startCropMode,
    stopCropMode,
    downloadCurrentCanvas,
    applyRealCropToActiveImage,

    applyBrightness,
    applyAveraging,
    applyNoise,
    applyContrast,
    applyGamma,
  };
};
