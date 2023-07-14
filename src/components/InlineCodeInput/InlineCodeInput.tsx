import React from "react";
import ContentEditable from "react-contenteditable";

export interface InlineCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

function InlineCodeInput({ value, onChange }: InlineCodeInputProps) {
  return (
    <ContentEditable
      className="inline-block text-center min-w-[2rem] border-b-2 bg-sky-500 bg-opacity-10 border-sky-500 focus:bg-opacity-20 hover:bg-opacity-20"
      html={value}
      onChange={(e) => onChange(e.target.value)}
      tagName="span"
    />
  );
}

export default InlineCodeInput;
