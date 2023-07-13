import React from "react";
import BrowserMockup from "../BrowserMockup/BrowserMockup";
import ComponentEditorPanel from "../ComponentEditorPanel/ComponentEditorPanel";

import classNames from "classnames";
import ComponentsListPanel from "../ComponentsListPanel/ComponentsListPanel";
import ComponentPreviewDressing from "../ComponentPreviewDressing/ComponentPreviewDressing";
import ComponentInfoPanel from "../ComponentInfoPanel/ComponentInfoPanel";
import { ProjectWithFiles } from "@/util/storage";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";
import PreviewFrame from "../PreviewFrame/PreviewFrame";
import { type UpdateProposal } from "../UpdateProposalModal";
import { Panel, PanelGroup } from "react-resizable-panels";
import PanelResizer from "@/PanelResizer/PanelResizer";

export interface ProjectInterfaceEditorProps {
  project: ProjectWithFiles;
  rendering: boolean;
  renderCount: number;
  setIsShowingComponentList: (isShowingComponentList: boolean) => void;
  isShowingComponentList: boolean;
  setPreparingFrame: (preparingFrame: boolean) => void;
  setCreatingComponent: (creatingComponent: string) => void;
  setOnComponentCreated: (
    onComponentCreated: ComponentCreationCallback
  ) => void;
  onProjectRefresh: () => void;
  onUpdate: () => void;
  onProposal: (proposal: UpdateProposal) => void;
}

function ProjectInterfaceEditor({
  project,
  rendering,
  renderCount,
  setIsShowingComponentList,
  isShowingComponentList,
  setPreparingFrame,
  setCreatingComponent,
  setOnComponentCreated,
  onProjectRefresh,
  onUpdate,
  onProposal,
}: ProjectInterfaceEditorProps) {
  return (
    <PanelGroup direction="vertical" autoSaveId="lightrail-1">
      <Panel order={1}>
        <PanelGroup direction="horizontal" autoSaveId="lightrail-2">
          {project && (
            <ComponentInfoPanel
              project={project}
              onProposal={onProposal}
              onProjectRefresh={onProjectRefresh}
              onUpdateComponentTree={onUpdate}
            />
          )}
          <PanelResizer vertical />
          <Panel
            order={2}
            className={classNames("flex flex-row min-h-0", {
              "opacity-50": rendering,
            })}
          >
            {project?.type === "component" ? (
              <ComponentPreviewDressing>
                <PreviewFrame
                  transparent
                  project={project}
                  renderCount={renderCount}
                  onOpenComponentList={() => setIsShowingComponentList(true)}
                  onRenderComplete={() => setPreparingFrame(false)}
                />
              </ComponentPreviewDressing>
            ) : (
              <BrowserMockup>
                {project && (
                  <PreviewFrame
                    project={project}
                    renderCount={renderCount}
                    onOpenComponentList={() => setIsShowingComponentList(true)}
                    onRenderComplete={() => setPreparingFrame(false)}
                  />
                )}
              </BrowserMockup>
            )}
          </Panel>
          <PanelResizer vertical />
          {project && (
            <ComponentsListPanel
              project={project}
              isOpen={isShowingComponentList}
              onToggleOpen={() =>
                setIsShowingComponentList(!isShowingComponentList)
              }
              onCreateComponent={() => {
                setCreatingComponent("");
                setOnComponentCreated(() => onProjectRefresh);
              }}
              onComponentDeleted={onUpdate}
            />
          )}
        </PanelGroup>
      </Panel>
      <PanelResizer />
      <ComponentEditorPanel
        project={project}
        onUpdate={onUpdate}
        onProposal={onProposal}
        onCreateComponent={(name, callback) => {
          setCreatingComponent(name);
          setOnComponentCreated(() => callback);
        }}
      />
    </PanelGroup>
  );
}

export default ProjectInterfaceEditor;
