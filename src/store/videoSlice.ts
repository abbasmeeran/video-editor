import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Label {
  x: number;
  y: number;
  text: string;
  id: string;
}

export interface Range {
  startTime: number;
  endTime: number;
}
interface VideoDetail {
  url: string | null;
  file: File | null;
  duration: number;
}

export interface Video {
  video: VideoDetail;
  labels: Label[];
  range: Range;
  id: string;
  title: string;
  img: File | null;
}

export interface VideoState {
  videos: Video[];
}

export interface RangePayload {
  videoId: string;
  range: Range;
}

export interface LabelPayload {
  videoId: string;
  labels: Label[];
}

const initialState: Video[] = [];

export const counterSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    updateVideo: (state, action: PayloadAction<Video>) => {
      const videoToUpdate = action.payload;
      const index = state.findIndex((v) => v.id === videoToUpdate.id);
      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...videoToUpdate,
        };
      } else {
        state.push(videoToUpdate);
      }
    },
    updateRange: (state, action: PayloadAction<RangePayload>) => {
      const {
        range: { startTime, endTime },
        videoId,
      } = action.payload;
      const index = state.findIndex((video) => video.id === videoId);
      state[index].range = {
        startTime,
        endTime,
      };
    },
    updateLabels: (state, action: PayloadAction<LabelPayload>) => {
      const { labels, videoId } = action.payload;
      const index = state.findIndex((video) => video.id === videoId);
      if (index !== -1) {
        state[index].labels = labels;
      }
    },
    removeVideo: (state, action: PayloadAction<any>) => {
      state.splice(0, 1);
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateVideo, updateLabels, updateRange, removeVideo } =
  counterSlice.actions;

export default counterSlice.reducer;
