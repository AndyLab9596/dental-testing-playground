// import { useImageEditor } from '../../hooks/useImageEditor';
// import { useImageEditorStore } from '../../store/imageEditor.store';

import { Button, Tooltip } from "antd";
import { useImageEditor } from "../hooks/useImageEditor";
import { useImageEditorStore } from "../store/imageEditorStore";
import { RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";

const LeftToolBar = () => {
    const { canvasRef } = useImageEditorStore();
    const { handleZoomIn, handleZoomOut, handleRotateLeft, handleRotateRight } = useImageEditor();

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
        </div>
    );
};

export default LeftToolBar;
 