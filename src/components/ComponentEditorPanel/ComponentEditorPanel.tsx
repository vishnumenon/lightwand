import { ProjectWithFiles } from "@/util/storage";
import React from "react";
import ComponentEditingPane from "../ComponentEditingPane/ComponentEditingPane";
import { useRecoilValue } from "recoil";
import { editingComponent } from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";
import { type UpdateProposal } from "../UpdateProposalModal";
import { Panel } from "react-resizable-panels";

export interface ComponentEditorPanelProps {
  project: ProjectWithFiles | undefined;
  onUpdate: () => void;
  onProposal: (proposal: UpdateProposal) => void;
  onCreateComponent: (
    name: string,
    callback: ComponentCreationCallback
  ) => void;
}

function ComponentEditorPanel({
  project,
  onUpdate,
  onProposal,
  onCreateComponent,
}: ComponentEditorPanelProps) {
  const editingComponentValue = useRecoilValue(editingComponent);

  return editingComponentValue ? (
    <Panel
      className={classNames(
        "bg-slate-100 text-slate-800 flex flex-col min-h-0",
        {
          "p-4": editingComponentValue,
        }
      )}
      defaultSize={40}
      minSize={20}
      order={2}
    >
      {project && (
        <ComponentEditingPane
          project={project}
          onUpdate={onUpdate}
          onProposal={onProposal}
          onCreateComponent={onCreateComponent}
        />
      )}
    </Panel>
  ) : null;
}

export default ComponentEditorPanel;
