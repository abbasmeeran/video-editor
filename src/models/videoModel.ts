import mongoose from 'mongoose';

const { Schema } = mongoose;

const videoModel = new Schema({
  id: { type: Number },
  name: { type: Number },
  video: { type: Number },
  labels: [
    {
      id: { type: Number },
      text: { type: String },
      x: { type: Number },
      y: { type: Number },
    },
  ],
  range: { startTime: { type: Number }, endTime: { type: Number } },
});

export const VideoModel = mongoose.model('Video', videoModel);
