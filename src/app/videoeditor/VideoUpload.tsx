import { PhotoIcon, UserCircleIcon } from '@heroicons/react/20/solid';

import React, { useState } from 'react';

type Props = {
  isProcessing: boolean;
  isExporting: boolean;
  onChange: any;
  videoTitle: string;
};

function VideoUpload({
  isProcessing,
  isExporting,
  onChange,
  videoTitle,
}: Props) {
  const [title, setTitle] = useState(videoTitle);

  const onTitleChange = (e: any) => {
    const { value } = e.target;
    setTitle(value);
    onChange({
      title: value,
    });
  };

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
          title,
        });
      };
    }
  };
  return (
    <>
      <div className='sm:col-span-4'>
        <label
          htmlFor='title'
          className='block text-sm/6 font-medium text-gray-900'
        >
          Title
        </label>
        <div className='mt-2'>
          <input
            id='title'
            name='title'
            type='title'
            value={videoTitle}
            onChange={onTitleChange}
            className='pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6'
          />
        </div>
      </div>
      <div className='col-span-4'>
        <label
          htmlFor='cover-photo'
          className='block text-sm/6 font-medium text-gray-900'
        >
          Video
        </label>
        <div className='mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-5'>
          <div className='text-center'>
            <div className='mt-4 flex text-sm/6 text-gray-600'>
              <label
                htmlFor='file-upload'
                className='relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500'
              >
                <span>Upload a video</span>
                <input
                  id='file-upload'
                  name='file-upload'
                  type='file'
                  className='sr-only'
                  accept='video/*'
                  onChange={handleVideoUpload}
                  disabled={isProcessing || isExporting}
                />
              </label>
              <p className='pl-1'>or drag and drop</p>
            </div>
            <p className='text-xs/5 text-gray-600'>MP4 up to 10MB</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoUpload;
