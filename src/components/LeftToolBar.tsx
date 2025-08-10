import { Button, Tooltip } from "antd";
import { useImageEditor } from "../hooks/useImageEditor";
import { useImageEditorStore } from "../store/imageEditorStore";
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";

const LeftToolBar = () => {
  const { canvasRef, setCropRec, canvasOfCropRecRef } = useImageEditorStore();
  const {
    handleZoomIn,
    handleZoomOut,
    handleRotateLeft,
    handleRotateRight,
    startCropMode,
    downloadCroppedImage,
    applyRealCropToActiveImage,
    stopCropMode,
  } = useImageEditor();

  if (!canvasRef) return null;

  return (
    <div className="flex flex-wrap bg-ColorToken-secondaryToken-300">
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

        <Button onClick={() => downloadCroppedImage(canvasRef)}>
          Download
        </Button>
      </div>
    </div>
  );
};

export default LeftToolBar;
