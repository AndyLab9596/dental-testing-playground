import { Canvas, FabricImage, Point } from 'fabric';
import { MAP_SIDE_DEGREE, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '../constants/zoom.constant';
import { SIDE } from '../enums/side.enum';

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
                currentImageUrl: imageUrl
            });
            canvasRef.centerObject(fabricImg);
            canvasRef.add(fabricImg);
            canvasRef.setActiveObject(fabricImg);
        }
    };

    const handleRemoveCurrentImage = async (currentImageUrl: string, canvasRef: Canvas) => {
        if (!currentImageUrl || !canvasRef) throw new Error();
        canvasRef.getActiveObjects().forEach((obj) => {
            if (obj.get('currentImageUrl') === currentImageUrl) {
                canvasRef.remove(obj);
            }
        });
    };

    /*
    Zoom functionalities
    */
    const applyZoom = (newZoom: number, canvasRef: Canvas) => {
        if (!canvasRef) return;
        const center = new Point(canvasRef.getWidth() / 2, canvasRef.getHeight() / 2);
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

    return {
        handleLoadImage,
        handleRemoveCurrentImage,
        handleZoomIn,
        handleZoomOut,
        handleRotateRight,
        handleRotateLeft
    };
};
 