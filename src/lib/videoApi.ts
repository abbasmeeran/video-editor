import { Video } from '@/store/videoSlice';

export const postData = async (data: Video) => {
  const response = await fetch('/api/video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return result;
};
