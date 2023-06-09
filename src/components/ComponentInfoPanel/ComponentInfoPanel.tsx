import {
  Db,
  FileQueryItem,
  FileStateItem,
  ProjectWithFiles,
} from "@/util/storage";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { editingComponent } from "../PreviewRenderer/preview-renderer-state";
import { ReflexElement } from "react-reflex";
import VariableToken from "../VariableToken/VariableToken";
import ComponentQueryEditingModal from "../ComponentQueryEditingModal/ComponentQueryEditingModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { SERVER_URL } from "@/util/constants";
import { Table } from "../ProjectEditor/editor-types";
import UpdateComponentTreeModal from "../UpdateComponentTreeModal/UpdateComponentTreeModal";
import StateModificationModal from "../StateModificationModal/StateModificationModal";
import { type UpdateProposal } from "../UpdateProposalModal";
import { getInitialStateValueString } from "@/util/util";

export interface ComponentInfoPanelProps {
  project: ProjectWithFiles;
  onProjectRefresh: () => void;
  onUpdateComponentTree: () => void;
  onProposal: (proposal: UpdateProposal) => void;
}

function ComponentInfoPanel({
  project,
  onProjectRefresh,
  onUpdateComponentTree,
  onProposal,
}: ComponentInfoPanelProps) {
  const [databases, setDatabases] = useState<Db[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [updateComponentTreeModalOpen, setUpdateComponentTreeModalOpen] =
    useState(false);
  const [editingState, setEditingState] = useState<FileStateItem | null>(null);

  async function fetchDatabases() {
    const result = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/databases`
    );
    const { databases } = await result.json();
    setDatabases(databases);
  }

  async function fetchTables() {
    if (databases.length === 0) return;
    const result = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/databases/${databases[0].id}/tables`
    );
    const { tables } = await result.json();
    setTables(tables);
  }

  useEffect(() => {
    fetchDatabases();
  }, [project.id]);

  useEffect(() => {
    fetchTables();
  }, [databases]);

  const editingComponentValue = useRecoilValue(editingComponent);
  const editingComponentFile = project.files.find(
    (f) => f.path === editingComponentValue?.name
  );

  const state = editingComponentFile?.state as unknown as FileStateItem[];
  const queries = editingComponentFile?.queries as unknown as FileQueryItem[];
  const props = Array.from(
    new Set(
      Array.from(
        editingComponentFile?.contents?.matchAll(/props\.(\w+)/g) || []
      ).map((m) => m[1])
    ).values()
  );

  const isOpen = !!editingComponentFile;

  return (
    <ReflexElement flex={isOpen ? 0.5 : 0}>
      <div className="flex flex-col min-h-full bg-slate-50 text-slate-800 px-4 py-2">
        <div className="text-sm font-semibold">State</div>
        <div className="flex flex-row flex-wrap gap-2 my-2">
          {state?.map((s) => (
            <VariableToken
              name={s.name}
              key={s.name}
              subName={
                "set" + s.name.charAt(0).toUpperCase() + s.name.substring(1)
              }
              value={getInitialStateValueString(s.initial)}
              onClick={() => {
                setEditingState(s);
                setStateModalOpen(true);
              }}
            />
          ))}
          <button
            className="rounded-md py-1 px-2 text-sm bg-slate-100 text-slate-800 border-2"
            onClick={() => setStateModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        {props && props.length > 0 && (
          <>
            <div className="text-sm font-semibold">Props</div>
            <div className="flex flex-row flex-wrap gap-2 my-2">
              {props.map((s) => (
                <VariableToken key={s} name={s} />
              ))}
            </div>
          </>
        )}
        {editingComponentValue && databases && databases.length > 0 && (
          <>
            <div className="text-sm font-semibold">Queries</div>
            <div className="flex flex-row flex-wrap gap-2 my-2">
              {queries?.map((s) => (
                <VariableToken key={s.name} name={s.name} />
              ))}
              <button
                className="rounded-md py-1 px-2 text-sm bg-slate-100 text-slate-800 border-2"
                onClick={() => setQueryModalOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <ComponentQueryEditingModal
              visible={queryModalOpen}
              onClose={() => setQueryModalOpen(false)}
              onQueryCreated={() => {
                onProjectRefresh();
                setUpdateComponentTreeModalOpen(true);
              }}
              project={project}
              databases={databases}
              componentName={editingComponentValue.name}
              tables={tables}
              queries={queries || []}
            />

            <UpdateComponentTreeModal
              component={editingComponentFile}
              project={project}
              onProposal={onProposal}
              onClose={() => setUpdateComponentTreeModalOpen(false)}
              onUpdateComponentTree={onUpdateComponentTree}
              visible={updateComponentTreeModalOpen}
            />
          </>
        )}
        {editingComponentValue && (
          <StateModificationModal
            editingState={editingState}
            visible={stateModalOpen}
            onClose={() => {
              setEditingState(null);
              setStateModalOpen(false);
            }}
            onStateModified={() => {
              onUpdateComponentTree();
            }}
            project={project}
            componentName={editingComponentValue.name}
            state={state || []}
          />
        )}
      </div>
    </ReflexElement>
  );
}

export default ComponentInfoPanel;
