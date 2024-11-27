'use client';

import React, { useRef, useState, useEffect } from 'react';
import VideoEditor from '../VideoEditor';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useParams } from 'next/navigation';

const App: React.FC = () => {
  const params = useParams();

  return (
    <div>
      <Provider store={store}>
        <VideoEditor videoId={params.videoId} />
      </Provider>
    </div>
  );
};

export default App;
