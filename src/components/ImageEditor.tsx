import { Canvas } from 'fabric';
import { useEffect, useRef } from 'react';
import { useImageEditorStore } from '../store/imageEditorStore';

const ImageEditor = () => {
    const canvasElRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRef = useRef<Canvas | null>(null);
    const { setCanvasRef } = useImageEditorStore();

    useEffect(() => {
        if (canvasElRef.current) {
            const canvasContainerElement = document.getElementById('canvas-container');

            const containerHeight = canvasContainerElement?.clientHeight;
            const containerWidth = canvasContainerElement?.clientWidth;

            canvasRef.current = new Canvas(canvasElRef.current, {
                width: containerWidth,
                height: containerHeight
            });
            setCanvasRef(canvasRef.current);

            return () => {
                canvasRef.current?.dispose();
                setCanvasRef(null);
            };
        }
    }, [setCanvasRef]);

    return (
        <div
            id="canvas-container"
            className="h-full w-full place-items-center"
        >
            <canvas
                className="m-auto border-2 border-dashed border-red-900"
                ref={canvasElRef}
            ></canvas>
        </div>
    );
};

export default ImageEditor;
 