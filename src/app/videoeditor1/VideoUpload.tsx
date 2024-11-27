import React from 'react';

type Props = {
  isProcessing: boolean;
  isExporting: boolean;
  onChange: any;
};

function VideoUpload({ isProcessing, isExporting, onChange }: Props) {
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.src = videoUrl;
      tempVideo.onloadedmetadata = () => {
        onChange({
          file,
          duration: tempVideo.duration,
          videoUrl,
        });
      };
    }
  };
  return (
    <div>
      <input
        type='file'
        accept='video/*'
        onChange={handleVideoUpload}
        disabled={isProcessing || isExporting}
      />
    </div>
  );
}

export default VideoUpload;
