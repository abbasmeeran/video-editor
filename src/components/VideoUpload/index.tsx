'use client';

import React, { ChangeEvent, useState } from 'react';

type Props = {
  videoRef: any;
  onChange: any;
  disabled: boolean;
  onRemove: any;
};

export default function VideoUpload({
  disabled,
  onChange,
  onRemove,
  videoRef,
}: Props) {
  function handleChange(event: any) {
    alert(URL.createObjectURL(event.target.files[0]));
    onChange(event.target.files[0]);
  }

  return (
    <div className='App'>
      <form>
        <input
          ref={videoRef}
          type='file'
          onChange={handleChange}
          accept='video/*'
        />
      </form>
    </div>
  );
}
