"use client";

import dynamic from "next/dynamic";

export const TextEditor = dynamic(() => import("./text-editor"), {
  ssr: false,
});
