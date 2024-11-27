import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge classes with tailwind-merge with clsx full feature */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sliderValueToVideoTime(duration: number, sliderValue: number) {
  return Math.round((duration * sliderValue) / 100);
}

// export function debounce(fn: any, timeout = 300) {
//   let id: any;
//   return (...args: any) => {
//     if (id) {
//       clearTimeout(id);
//     }
//     id = setTimeout(() => {
//       fn.apply(this, args);
//     }, timeout);
//   };
// }

export const videoToImage = (
  videoFile: File | null,
  options: {
    frameTimeInSeconds?: number;
    filename?: string;
    extension?: string;
  } = {
    frameTimeInSeconds: 0.5,
    extension: 'png',
  }
): Promise<File | null> => {
  if (videoFile === null) return Promise.resolve(null);
  return new Promise<File>((resolve) => {
    const canvas = document.createElement('canvas');
    const video = document.createElement('video');
    const source = document.createElement('source');
    const context = canvas.getContext('2d');
    const urlRef = URL.createObjectURL(videoFile);

    video.style.display = 'none';
    canvas.style.display = 'none';

    source.setAttribute('src', urlRef);
    video.setAttribute('crossorigin', 'anonymous');
    video.setAttribute('preload', 'metadata');

    video.appendChild(source);
    document.body.appendChild(canvas);
    document.body.appendChild(video);

    if (!context) {
      return;
    }

    video.currentTime = options.frameTimeInSeconds || 0;
    video.load();

    video.addEventListener('loadedmetadata', function () {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    });

    video.addEventListener('loadeddata', function () {
      setTimeout(() => {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        canvas.toBlob((blob) => {
          if (!blob) return;
          resolve(
            new File(
              [blob],
              (options.filename || videoFile.name) +
                '_preview.' +
                options.extension,
              {
                type: 'image/' + options.extension,
              }
            )
          );
          URL.revokeObjectURL(urlRef);

          video.remove();
          canvas.remove();
        }, 'image/' + options.extension);
      }, 2000);
    });
  });
};
