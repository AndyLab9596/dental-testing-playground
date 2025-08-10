// import { useImageEditor } from '../../hooks/useImageEditor';
// import { useImageEditorStore } from '../../store/imageEditor.store';

import { Button, Tooltip } from "antd";
import { useImageEditor } from "../hooks/useImageEditor";
import { useImageEditorStore } from "../store/imageEditorStore";
import {
  BlockOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import CroppingSettings from "./CroppingSetting";

const LeftToolBar = () => {
  const { canvasRef, setRefreshKey } = useImageEditorStore();
  const {
    handleZoomIn,
    handleZoomOut,
    handleRotateLeft,
    handleRotateRight,
    addFrameToCanvas,
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
      <Tooltip title="Crop image">
        <Button
          icon={<BlockOutlined />}
          onClick={() => addFrameToCanvas(canvasRef, setRefreshKey)}
        ></Button>
      </Tooltip>
      {/*  */}
      <CroppingSettings />
    </div>
  );
};

export default LeftToolBar;
