// VideoUploader.tsx
import React from 'react';

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
  isExporting: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  onUpload,
  isProcessing,
  isExporting,
}) => {
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <input
      type='file'
      accept='video/*'
      onChange={handleVideoUpload}
      disabled={isProcessing || isExporting}
    />
  );
};

export default VideoUploader;
