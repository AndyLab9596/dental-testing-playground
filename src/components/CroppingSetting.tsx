import { useEffect, useState } from "react";
import { useImageEditorStore } from "../store/imageEditorStore";
import type {
  FabricObject,
  FabricObjectProps,
  ObjectEvents,
  SerializedObjectProps,
} from "fabric";
import { Button, Select, Tooltip } from "antd";
import { DownCircleOutlined } from "@ant-design/icons";

type FrameType = FabricObject<
  Partial<FabricObjectProps>,
  SerializedObjectProps,
  ObjectEvents
>;

function CroppingSettings() {
  const { canvasRef: canvas, refreshKey } = useImageEditorStore();
  console.log("canvas", canvas);

  const [frames, setFrames] = useState<FrameType[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FrameType | null>(null);

  const updateFrames = () => {
    if (canvas) {
      const framesFromCanvas = canvas.getObjects("rect").filter((obj) => {
        console.log(obj.get('name'));
        return obj.get("name") && obj.get("name").startsWith("Frame");
      });

      setFrames(framesFromCanvas);

      if (framesFromCanvas.length > 0) {
        setSelectedFrame(framesFromCanvas[0]);
      }
    }
  };

  useEffect(() => {
    updateFrames();
  }, [canvas?.toJSON, refreshKey]);

  const handleFrameSelect = (value: string) => {
    console.log('handleFrameSelect', value);
    const selected = frames.find((frame) => frame.get("name") === value);
    console.log("selected", selected);
    if (selected && canvas) {
      setSelectedFrame(selected);
      canvas.setActiveObject(selected);
      canvas.renderAll();
    }
  };

  const exportFrameAsPNG = () => {
    if (!selectedFrame) return;
    console.log("exportFrameAsPNG", selectedFrame);
    frames.forEach((frame) => {
      frame.set("visible", false);
    });

    selectedFrame.set({
      strokeWidth: 0,
      visible: true,
    });

    const dataURL = canvas?.toDataURL({
      left: selectedFrame.left,
      top: selectedFrame.top,
      width: selectedFrame.width + selectedFrame.scaleX,
      height: selectedFrame.height + selectedFrame.scaleY,
      format: "png",
      multiplier: 0,
    });

    selectedFrame.set({
      strokeWidth: 1,
      visible: true,
    });

    frames.forEach((frame) => {
      frame.set("visible", true);
    });

    canvas?.renderAll();
    const link = document.createElement("a");
    link.href = dataURL!;
    link.download = `${selectedFrame.get("name")}.png`;
    link.click();
  };

  const options = frames.map((frame) => ({
    value: frame.get("name"),
    label: frame.get("name"),
  }));

  return (
    <>
      <Select
        defaultValue="lucy"
        style={{ width: 120 }}
        onChange={handleFrameSelect}
        options={options}
      />
      <Tooltip title="Download">
        <Button
          icon={<DownCircleOutlined />}
          onClick={exportFrameAsPNG}
        ></Button>
      </Tooltip>
    </>
  );
}

export default CroppingSettings;
