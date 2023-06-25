import React, { useEffect, useMemo, useRef } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
} from "@codemirror/view";

import { bracketMatching } from "@codemirror/language";

import { defaultKeymap, historyKeymap, history } from "@codemirror/commands";
import { solarizedLight } from "thememirror";
import "./custom-styles.css";
import classNames from "classnames";
import { langs } from "@uiw/codemirror-extensions-langs";
import { autocompletion } from "@codemirror/autocomplete";
import { ProjectWithFiles } from "@/util/storage";
import { componentAutocompletion } from "./component-autocomplete";
import { ComponentCreationCallback } from "../ProjectEditor/editor-types";

export interface CodeEditorProps {
  value: string;
  className?: string;
  onValueChange: (value: string) => void;
  project?: ProjectWithFiles;
  type: "jsx" | "sql";
  onCreateComponent?: (
    name: string,
    callback: ComponentCreationCallback
  ) => void;
  readonly?: boolean;
}

function CodeEditor({
  value,
  className,
  onValueChange,
  project,
  type,
  onCreateComponent,
  readonly,
}: CodeEditorProps) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onValueChange(update.state.doc.toString());
          }
        }),
        history(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        drawSelection(),
        bracketMatching(),
        // highlightActiveLine(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        type === "jsx" ? langs.jsx() : type === "sql" ? langs.sql() : [],
        solarizedLight,
        onCreateComponent
          ? componentAutocompletion(project, onCreateComponent)
          : autocompletion(),
        readonly ? [EditorState.readOnly.of(true)] : [],
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });

    return () => {
      view.destroy();
    };
  }, [value, project, readonly]);

  const editorDom = useMemo(
    () => <div className="w-full h-full" ref={editorRef} />,
    []
  );

  return (
    <div className={classNames("overflow-clip", className)}>{editorDom}</div>
  );
}

export default CodeEditor;
