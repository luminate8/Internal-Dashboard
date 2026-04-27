"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileUpload({ onChange }: { onChange: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const arr = Array.from(incoming);
    setFiles(arr);
    onChange(arr);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-3 transition-colors",
        dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/40"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <motion.div
        animate={{ y: dragging ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md border border-gray-100"
      >
        <Upload size={24} className="text-indigo-500" />
      </motion.div>

      {files.length === 0 ? (
        <>
          <p className="text-sm font-medium text-gray-700">Drag or drop your files here or click to upload</p>
          <p className="text-xs text-gray-400">PDF, DOCX, TXT supported</p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1">
          {files.map((f, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-indigo-600"
            >
              {f.name}
            </motion.p>
          ))}
          <p className="text-xs text-gray-400 mt-1">Click to change file</p>
        </div>
      )}
    </div>
  );
}
