'use client';

import React, { useRef, useState, useEffect } from 'react';
import VideoEditor from '@/app/videoeditor1/VideoEditor';
import { Provider } from 'react-redux';
import { store } from '@/store';

const App: React.FC = () => {
  return (
    <div>
      <Provider store={store}>
        <VideoEditor />
      </Provider>
    </div>
  );
};

export default App;
