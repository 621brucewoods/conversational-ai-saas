import { useState, useLayoutEffect, RefObject } from "react";
import { RichTextareaHandle } from "rich-textarea";

export const useTextareaResize = (
  textareaRef: RefObject<RichTextareaHandle>,
  inputValue: string
) => {
  const [textareaHeight, setTextareaHeight] = useState("150px");

  useLayoutEffect(() => {
    if (textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 300;
      const newHeight = Math.min(scrollHeight, maxHeight);
      setTextareaHeight(`${newHeight}px`);
    }
  }, [inputValue]);

  return textareaHeight;
};
