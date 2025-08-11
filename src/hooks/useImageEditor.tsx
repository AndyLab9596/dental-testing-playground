import { Canvas, FabricImage, Point, Rect, filters } from "fabric";
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
        imageUrl,
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
      if (obj.get("imageUrl") === currentImageUrl) {
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
      stopCropMode(canvasRef, canvasOfCropRecRef, setCropRec);
    }
    canvasRef.renderAll();
  };

  const downloadCurrentCanvas = (canvasRef: Canvas) => {
    const dataUrl = canvasRef.toDataURL();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "Hello World";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /*
    For slider: min = -100, max = 100, defaultValue = 0
  */
  const applyBrightness = (canvas: Canvas, sliderValue: number) => {
    const value = Math.max(-100, Math.min(100, sliderValue)) / 100;

    const activeObject = canvas.getActiveObject();
    console.log(activeObject);
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
        const bf = new filters.Brightness({ brightness: value });
        img.filters.push(bf);
      } else {
        const bf = img.filters[idx] as filters.Brightness;
        bf.brightness = value;
      }
    }
    img.applyFilters();
    canvas.requestRenderAll();
  };

  /**
   * Apply averaging (box blur) by kernel size.
   * sliderSize: integer >= 1. We'll coerce to an odd integer (1,3,5,7,...).
   */
  const applyAveraging = (canvas: Canvas, sliderSize: number) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") return;
    const img = activeObject as FabricImage;

    img.filters = img.filters || [];
    const convIndex = img.filters.findIndex(
      (f) => !!f && f.type === filters.Convolute.type
    );

    // ensure integer >=1
    let k = Math.max(1, Math.round(sliderSize));
    // make it odd: 1,3,5,...
    if (k % 2 === 0) k += 1;

    // kernel size 1 => no blur => remove filter if exists
    if (k === 1) {
      if (convIndex !== -1) {
        img.filters.splice(convIndex, 1);
        img.applyFilters();
        canvas.requestRenderAll();
      }
      return;
    }

    // build normalized box kernel of size k x k
    const cell = 1 / (k * k);
    const matrix: number[] = new Array(k * k).fill(cell);

    if (convIndex === -1) {
      img.filters.push(new filters.Convolute({ matrix }));
    } else {
      // update existing filter's matrix
      (img.filters[convIndex] as filters.Convolute).matrix = matrix;
    }

    img.applyFilters();
    canvas.requestRenderAll();
  };

  const applyNoise = (canvas: Canvas, sliderValue: number) => {
    const value = Math.max(0, Math.min(1000, sliderValue)); // Fabric noise dùng 0 -> 1000
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

  const applyContrast = (canvas: Canvas, sliderValue: number) => {
    const value = Math.max(-100, Math.min(100, sliderValue)) / 100; // -1 -> 1
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

  const applyGamma = (canvas: Canvas, sliderValue: number) => {
    // gamma expects array [r, g, b] with each > 0, default [1, 1, 1]
    const gammaVal = Math.max(0.1, sliderValue); // tránh 0
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
