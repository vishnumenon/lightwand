import { File, FileStateItem } from "./storage";
import {
  getInitialStateValueString,
  getUsedComponentNames,
  indent,
} from "./util";

export function getComponentImportFragment(file: File) {
  const componentImports = getUsedComponentNames(file.contents!);
  return componentImports
    .map((comp) => `import ${comp} from "@/components/${comp}";`)
    .join("\n");
}

export function getStateDeclarationFragment(file: File) {
  return file.state
    ? (file.state as unknown as FileStateItem[])
        .map(
          (s) =>
            `const [${s.name}, ${
              "set" + s.name.charAt(0).toUpperCase() + s.name.slice(1)
            }] = React.useState(${getInitialStateValueString(s.initial)});\n`
        )
        .join("")
    : "";
}

export function getComponentDefinitionFragment(file: File) {
  return `export default function ${file.path}(props) {`;
}

export function getPrologueFragment(file: File) {
  return `"use client";
import React from "react";`;
}

export function getEpilogueFragment(file: File) {
  return `}`;
}

export function createExportComponent(file: File) {
  return `${getPrologueFragment(file)}
${getComponentImportFragment(file)}

${getComponentDefinitionFragment(file)}
${indent(getStateDeclarationFragment(file), "  ")}
  return (
    <>
${indent(file.contents!.trim(), "      ")}
    </>
  );
${getEpilogueFragment(file)} `;
}
