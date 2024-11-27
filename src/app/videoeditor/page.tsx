'use client';

import React, { useRef, useState, useEffect } from 'react';
import VideoEditor from './VideoEditor';
import { Provider } from 'react-redux';
import { store } from '@/store';

const App: React.FC = () => {
  return (
    <div>
      <Provider store={store}>
        <VideoEditor videoId='' />
      </Provider>
    </div>
  );
};

export default App;
