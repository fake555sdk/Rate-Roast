import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Crop } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null, preview: string | null) => void;
  onClose: () => void;
}

export default function ImageUpload({ currentImage, onImageChange, onClose }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a JPEG, PNG, or WebP image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onImageChange(selectedFile, preview);
    onClose();
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    onImageChange(null, null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Profile Picture</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-white/30"
              />
              <button
                onClick={() => setCropMode(!cropMode)}
                className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <Crop size={16} />
              </button>
            </div>
          ) : (
            <div className="w-48 h-48 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center mx-auto">
              <Camera className="text-white/50" size={48} />
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Upload size={20} />
            Choose Image
          </button>

          {preview && (
            <button
              onClick={handleRemove}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Remove Image
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Save
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}