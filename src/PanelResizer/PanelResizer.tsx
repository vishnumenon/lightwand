import {
  faGripHorizontal,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { PanelResizeHandle } from "react-resizable-panels";

export interface PanelResizerProps {
  vertical?: boolean;
}

function PanelResizer({ vertical }: PanelResizerProps) {
  return <PanelResizeHandle className="bg-slate-200 p-0.5 hover:bg-sky-500" />;
}

export default PanelResizer;
