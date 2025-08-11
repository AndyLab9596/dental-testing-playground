import { Button, Slider, Tooltip } from "antd";
import { useImageEditor } from "../hooks/useImageEditor";
import { useImageEditorStore } from "../store/imageEditorStore";
import {
  RedoOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { useCanvasHistory } from "../hooks/useCanvasHistory";

const LeftToolBar = () => {
  const { canvasRef, setCropRec, canvasOfCropRecRef } = useImageEditorStore();
  const { undo, canUndo, redo, canRedo } = useCanvasHistory(canvasRef!);

  const {
    handleZoomIn,
    handleZoomOut,
    handleRotateLeft,
    handleRotateRight,
    startCropMode,
    downloadCurrentCanvas,
    applyRealCropToActiveImage,
    stopCropMode,
    applyBrightness,
    applyAveraging,
    applyNoise,
    applyContrast,
    applyGamma,
  } = useImageEditor();

  if (!canvasRef) return null;

  return (
    <div className="flex flex-wrap bg-ColorToken-secondaryToken-300">
      <Tooltip title="Undo">
        <Button
          icon={<UndoOutlined />}
          onClick={() => undo()}
          disabled={!canUndo}
        ></Button>
      </Tooltip>

      <Tooltip title="Redo">
        <Button
          icon={<RedoOutlined />}
          onClick={() => redo()}
          disabled={!canRedo}
        ></Button>
      </Tooltip>

      <Tooltip title="Zoom In">
        <Button
          icon={<ZoomInOutlined />}
          onClick={() => handleZoomIn(canvasRef)}
        ></Button>
      </Tooltip>
      <Tooltip title="Zoom Out">
        <Button
          icon={<ZoomOutOutlined />}
          onClick={() => handleZoomOut(canvasRef)}
        ></Button>
      </Tooltip>
      <Tooltip title="Rotate Left">
        <Button
          icon={<RotateLeftOutlined />}
          onClick={() => handleRotateLeft(canvasRef)}
        ></Button>
      </Tooltip>
      <Tooltip title="Rotate right">
        <Button
          icon={<RotateRightOutlined />}
          onClick={() => handleRotateRight(canvasRef)}
        ></Button>
      </Tooltip>
      <div>
        <Button onClick={() => startCropMode(canvasRef, setCropRec)}>
          Start Crop Rect
        </Button>

        <Button
          onClick={() =>
            stopCropMode(canvasRef, canvasOfCropRecRef, setCropRec)
          }
        >
          Stop Crop Rect
        </Button>

        <Button
          onClick={() =>
            applyRealCropToActiveImage(
              canvasRef,
              canvasOfCropRecRef,
              setCropRec
            )
          }
        >
          Apply Real Crop (clip)
        </Button>

        <Button onClick={() => downloadCurrentCanvas(canvasRef)}>
          Download
        </Button>

        <div>
          <p className="text-white">brightness</p>
          <Slider
            min={-100}
            max={100}
            defaultValue={0}
            onChange={(value) => applyBrightness(canvasRef, value)}
          />
        </div>

        <div>
          <p className="text-white">averaging</p>
          <Slider
            min={1}
            max={9}
            step={2} // 1,3,5,7,9
            defaultValue={1}
            onChange={(val) => applyAveraging(canvasRef, val as number)}
          />
        </div>

        <div>
          <p className="text-white">Noise</p>
          <Slider
            min={-100}
            max={100}
            defaultValue={0}
            step={1}
            onChange={(val) => applyNoise(canvasRef, val)}
          />
        </div>

        <div>
          <p className="text-white">Contrast</p>
          <Slider
            min={-100}
            max={100}
            step={1}
            defaultValue={0}
            onChange={(val) => applyContrast(canvasRef, val)}
          />
        </div>

        <div>
          <p className="text-white">Gamma</p>
          <Slider
            min={0.2}
            max={2.2}
            step={0.1}
            defaultValue={1}
            onChange={(val) => applyGamma(canvasRef, val)}
          />
        </div>
      </div>
    </div>
  );
};

export default LeftToolBar;
