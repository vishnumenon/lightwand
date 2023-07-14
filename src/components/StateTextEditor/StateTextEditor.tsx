import { File, FileStateItem } from "@/util/storage";
import React, { useEffect, useState } from "react";
import InlineCodeInput from "../InlineCodeInput/InlineCodeInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

export interface StateTextEditorProps {
  states: FileStateItem[];
  onChange: (states: FileStateItem[]) => void;
}

function StateTextEditor({ states, onChange }: StateTextEditorProps) {
  if (!states) {
    return null;
  }
  return (
    <>
      {states.map((s, i) => (
        <div key={i} className="flex items-center">
          const [
          <InlineCodeInput
            value={s.name}
            onChange={(v) =>
              onChange(states.map((s, j) => (i === j ? { ...s, name: v } : s)))
            }
          />
          , set
          {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
          ] = React.useState(
          <InlineCodeInput
            value={s.initial}
            onChange={(v) =>
              onChange(
                states.map((s, j) => (i === j ? { ...s, initial: v } : s))
              )
            }
          />
          )
          <button
            className="text-red-500 cursor-pointer hint--right hint--rounded opacity-30 hover:opacity-100 pl-2"
            aria-label="Delete State Item"
            onClick={() => onChange(states.filter((_, j) => i !== j))}
          >
            <FontAwesomeIcon icon={faXmarkCircle} />
          </button>
        </div>
      ))}
      <div
        className="flex items-center opacity-40 hover-opacity cursor-pointer hover:opacity-60"
        onClick={() => {
          onChange([...states, { name: "", initial: "" }]);
        }}
      >
        const [ ..., set... ] = React.useState( ...){" "}
        <span className="text-gray-400 pl-2">
          {"// Click to Add State Item"}
        </span>
      </div>
    </>
  );
}

export default StateTextEditor;
