import React, { useEffect, useRef } from "react";

interface IndeterminateCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  // ...any other props
}

export function IndeterminateCheckbox(props: IndeterminateCheckboxProps) {
  const { checked, indeterminate, onChange, ...rest } = props;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      // This is the native DOM property, not an HTML attribute
      ref.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      {...rest}
    />
  );
}
