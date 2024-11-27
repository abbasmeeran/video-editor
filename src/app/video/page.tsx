'use client';
import NewVideoEditor from '@/components/NewVideoEditor';
import VideoEditor from '@/components/VideoEditor';
import { VideoPlayer } from '@/components/VideoPlayer';
import VideoUpload from '@/components/VideoUpload';
import React, { useState } from 'react';

type Props = {};

const Video = (props: Props) => {
  const [file, setFile] = useState<any>();

  const onFileChange = (file: any) => {
    setFile(file);
  };
  return (
    <div>
      <NewVideoEditor />
    </div>
  );
};

export default Video;
