import PouchDB from 'pouchdb';

const db = new PouchDB('deepreel');
export const indexDB: any = {
  add: async (videoData: any, file: any) => {
    const video: any = {
      _id: videoData.id,
      file: file,
      videoData,
    };
    const response = await db.put(video);
    return response;
  },
  getAll: async () => {
    const videos: any = await db.allDocs({
      include_docs: true,
      attachments: true,
    });
    const data = await Promise.all(
      videos.rows
        .map(async (v: any) => {
          try {
            return db.get(v.id);
          } catch (err) {}
          return null;
        })
        .filter((v: any) => v !== null)
    );
    return data;
  },
  get: async (id: any) => {
    const video: any = await db.get(id);
    return video;
  },

  update: async (videoData: any, file: any, img: any) => {
    let video: any;
    try {
      video = await db.get(videoData.id);
    } catch (err) {
      video = null;
    }
    video = video == null ? { _id: videoData.id } : video;
    video.file = file;
    video.videoData = videoData;
    video.title = videoData.title;
    video.img = img;
    const response = await db.put(video);
    return response;
  },

  delete: async (id: any) => {
    const video = await db.get(id);
    try {
      const response = await db.remove(video);
      return response;
    } catch (err) {
      console.log(err);
    }
  },
};
