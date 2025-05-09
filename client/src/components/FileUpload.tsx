import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";

type FileUploadProps = {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSize: number; // in MB
  icon: string;
  fileType: string;
  supportedFormats: string;
};

export default function FileUpload({
  onFileSelect,
  accept,
  maxSize,
  icon,
  fileType,
  supportedFormats,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the maximum allowed size of ${maxSize}MB`);
      return false;
    }
    
    // Check file type
    const fileType = file.type.split('/')[0];
    const expectedType = accept.split('/')[0];
    
    if (fileType !== expectedType) {
      setError(`Please upload a valid ${expectedType} file`);
      return false;
    }
    
    return true;
  };

  const processFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`upload-area rounded-xl ${
        isDragging ? "border-primary bg-primary/5" : "bg-neutral-50"
      } p-8 text-center mb-6`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <i className={`fas ${icon} text-3xl text-neutral-400 mb-4`}></i>
      <h4 className="font-medium mb-2">Drag & drop your {fileType} file here</h4>
      <p className="text-neutral-500 text-sm mb-4">or</p>
      <Button 
        className="bg-primary hover:bg-primary-light text-white font-medium" 
        onClick={handleBrowseClick}
      >
        Browse Files
      </Button>
      <input
        type="file"
        className="hidden"
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <p className="text-xs text-neutral-500 mt-4">
        Maximum file size: {maxSize}MB
        <br />
        <span className="text-primary/80">{supportedFormats}</span>
      </p>
      {error && (
        <div className="mt-4 text-sm text-red-500 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
