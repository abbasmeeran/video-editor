'use client';

import React, { useState } from 'react';
import WebGLVideoEditor from '../../components/WebGLVideoEditor';
import { store } from '@/store';
import { Provider } from 'react-redux';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div>
        <WebGLVideoEditor />
      </div>
    </Provider>
  );
};

export default App;
