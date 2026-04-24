'use client'

import { useRef, useState } from 'react'

interface Props {
  onImage: (base64: string, mimeType: string) => void
  loading: boolean
}

export default function UploadZone({ onImage, loading }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function processFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      onImage(base64, file.type || 'image/jpeg')
    }
    reader.readAsDataURL(file)
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    processFile(files[0])
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
    >
      <div className="space-y-4">
        <div className="text-5xl">📋</div>
        <p className="text-gray-600 font-medium">
          Drag and drop a photo here, or choose one:
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            className="btn-primary flex items-center justify-center gap-2"
            onClick={() => cameraRef.current?.click()}
            disabled={loading}
          >
            📷 Take Photo
          </button>
          <button
            className="btn-secondary flex items-center justify-center gap-2"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
          >
            🖼️ Upload Image
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Supports JPG, PNG, WEBP — your photo never leaves your device
        </p>
      </div>

      {/* Camera input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {/* File picker */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
