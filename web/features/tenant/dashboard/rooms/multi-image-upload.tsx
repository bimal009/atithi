"use client"

import * as React from "react"
import { CloudUploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/features/upload/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MultiImageUpload({
  value,
  onChange,
  className,
}: {
  value: string[]
  onChange: (urls: string[]) => void
  className?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList) {
    const accepted: string[] = []
    for (const file of Array.from(files)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} isn't a supported image type`)
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is over 5 MB`)
        continue
      }
      accepted.push(URL.createObjectURL(file))
    }
    if (accepted.length) onChange([...value, ...accepted])
  }

  function removeAt(index: number) {
    const url = value[index]
    if (url) URL.revokeObjectURL(url)
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-4 gap-2">
        {value.map((url, index) => (
          <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a served asset */}
            <img src={url} alt="" className="size-full object-cover" />
            <Button
              type="button"
              size="icon-xs"
              variant="destructive"
              className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeAt(index)}
            >
              <XIcon />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <CloudUploadIcon className="size-5" aria-hidden />
          <span className="text-[11px]">Add photo</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}
