import {
  getComponentDefinitionFragment,
  getComponentImportFragment,
  getEpilogueFragment,
  getPrologueFragment,
} from "@/util/file-construction";
import { File, FileStateItem, FileUpdate } from "@/util/storage";
import { getInitialStateValueString, indent } from "@/util/util";
import React, { useEffect, useMemo, useState } from "react";
import CodeEditor from "../CodeEditor/CodeEditor";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { activeProject } from "../ProjectEditor/editor-state";
import StateTextEditor from "../StateTextEditor/StateTextEditor";
import { Json } from "@/supabase";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader/Loader";
import ComponentsListPanel from "../ComponentsListPanel/ComponentsListPanel";
import classNames from "classnames";
import { editingComponent } from "../PreviewRenderer/preview-renderer-state";
import { faFileCode } from "@fortawesome/free-regular-svg-icons";

function ReadOnlyFragment({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={` text-slate-800 ${className}`}>
      <pre>{children}</pre>
    </div>
  );
}

function LabelledSection({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-row group hover:bg-sky-500 hover:bg-opacity-5 ${className}`}
    >
      <div className="flex-1">{children}</div>
      <div
        className="border-t-2 border-b-2 border-r-2 border-dashed border-sky-500 border-r-transparent py-2 px-1 text-slate-800 group-hover:border-r-sky-500 group-hover:text-sky-500"
        style={{ writingMode: "vertical-lr" }}
      >
        {label}
      </div>
    </div>
  );
}

export interface ComponentFileEditorProps {
  file: File | undefined;
  isOpen: boolean;
  onClose: () => void;
  onUpdateFile: (update: FileUpdate) => Promise<void>;
}

function cleanStateForInput(states?: Json[] | null) {
  return (states ?? []).map((p: any) => ({
    name: p.name,
    initial: `${getInitialStateValueString(p.initial)}`,
  }));
}

function ComponentFileEditor({
  file,
  isOpen,
  onClose,
  onUpdateFile,
}: ComponentFileEditorProps) {
  const project = useRecoilValue(activeProject);
  const setEditingComponent = useSetRecoilState(editingComponent);

  const [states, setStates] = useState<FileStateItem[]>(
    cleanStateForInput(file?.state)
  );
  const [componentTree, setComponentTree] = useState<string>(
    file?.contents ?? ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStates(cleanStateForInput(file?.state));
    setComponentTree(file?.contents ?? "");
  }, [file]);

  const statesIsModified = useMemo(
    () =>
      file?.state?.length !== states.length ||
      cleanStateForInput(file?.state).some(
        (s, i) => s.name !== states[i].name || s.initial !== states[i].initial
      ),
    [states, file?.state]
  );

  const componentTreeIsModified = useMemo(
    () => file?.contents !== componentTree,
    [componentTree, file?.contents]
  );

  const fileIsModified = useMemo(
    () => statesIsModified || componentTreeIsModified,
    [statesIsModified, componentTreeIsModified]
  );

  const orderedComponents = useMemo(() => {
    return project?.files.slice().sort((a, b) => {
      if (a.path === "index") return -1;
      if (b.path === "index") return 1;

      return a.path.localeCompare(b.path);
    });
  }, [project?.files]);

  if (!file) {
    return null;
  }
  return (
    <Modal
      wide
      title={
        <div className="w-full flex">
          <div className="flex-1">{file?.path}</div>
          <Button
            onClick={async () => {
              setLoading(true);
              await onUpdateFile({
                state: states as any[],
                contents: componentTree,
              });
              setLoading(false);
              onClose();
            }}
            className="text-xs py-1 flex items-center"
            disabled={!fileIsModified || loading}
          >
            {loading ? (
              <Loader className="text-gray-200 fill-slate-900 h-2 w-2 p-0 m-0 mr-2" />
            ) : (
              <FontAwesomeIcon icon={faSave} className="mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      }
      bg="bg-slate-100"
      sidebar={
        <div className="border-r border-r-slate-300 p-2">
          <div className="font-semibold pb-2">Components</div>
          {orderedComponents?.map((c) => (
            <div
              className="flex flex-row gap-4 items-center px-2 py-1 hover:cursor-pointer hover:opacity-70"
              key={c.path}
            >
              <FontAwesomeIcon icon={faFileCode} className="text-slate-500" />
              <div
                key={c.path}
                className={classNames({
                  "text-sky-500": c.path === file.path,
                  "text-slate-500": c.path !== file.path,
                })}
                onClick={(e) => {
                  setEditingComponent({ name: c.path });
                }}
              >
                {c.path === "index" ? "index (root)" : c.path}
              </div>
            </div>
          ))}
        </div>
      }
      content={
        <div className="text-[0.813rem] font-mono bg-slate-100 p-4">
          <ReadOnlyFragment>{getPrologueFragment(file)}</ReadOnlyFragment>
          <ReadOnlyFragment>
            {getComponentImportFragment(file)}
          </ReadOnlyFragment>
          <ReadOnlyFragment className="pt-4">
            {getComponentDefinitionFragment(file)}
          </ReadOnlyFragment>
          <LabelledSection label="State" className="pl-4 my-2">
            <StateTextEditor states={states} onChange={setStates} />
          </LabelledSection>
          <ReadOnlyFragment>
            {`  return (
    <>`}
          </ReadOnlyFragment>
          <LabelledSection label="Component Tree" className="pl-6">
            <CodeEditor
              value={file.contents!.trim()}
              onValueChange={(newVal) => {
                setComponentTree(newVal);
              }}
              type="jsx"
              project={project}
            />
          </LabelledSection>
          <ReadOnlyFragment>
            {`    </>
      );`}
          </ReadOnlyFragment>
          <ReadOnlyFragment>{getEpilogueFragment(file)}</ReadOnlyFragment>
        </div>
      }
      visible={isOpen}
      onClose={onClose}
    />
  );
}

export default ComponentFileEditor;
