import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { Input } from "@/components/ui/input";

interface InputTextConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  placeholder?: string;
  initialValue?: string;
}

const InputTextConfirm: React.FC<InputTextConfirmProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = "Enter ROI name...",
  initialValue = "",
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
    }
  }, [isOpen, initialValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(inputValue);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full mb-2 bg-background rounded-lg p-4 w-64 shadow-xl border border-stone-300 dark:border-stone-600"
    >
      <h2 className="text-md font-bold mb-3 text-foreground">{title}</h2>

      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          onClick={onClose}
          variant="ghost"
          size="xs"
          className="text-foreground"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="primary-blue" size="xs">
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default InputTextConfirm;
