'use client';
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
} from '@heroicons/react/20/solid';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { indexDB } from '@/lib/indexdb';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type Props = {};

export default function VideoPage() {
  const [videos, setVideos] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const removeVideo = (id: any) => {
    setIsRemoving(false);
    indexDB.delete(id);
    setIsRemoving(true);
  };
  useEffect(() => {
    (async () => {
      const videos = await indexDB.getAll();
      setVideos(videos);
    })();
  }, [isRemoving]);
  return (
    <div className='min-h-full'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='lg:flex lg:items-center lg:justify-between'>
          <div className='min-w-0 flex-1'>
            <h2 className='text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>
              Videos
            </h2>
          </div>
          <div className='mt-5 flex lg:ml-4 lg:mt-0'>
            <span className='sm:ml-3'>
              <Link href={`/videoeditor`}>
                <button
                  type='button'
                  className='inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                >
                  Create Video
                </button>
              </Link>
            </span>
          </div>
        </div>
      </div>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='mt-8'>
          <div className='flow-root'>
            <ul role='list' className='-my-6 divide-y divide-gray-200'>
              {videos.map((video: any) => (
                <li key={video._id} className='flex py-6'>
                  <div className='size-24 shrink-0 overflow-hidden rounded-md border border-gray-200'>
                    <img
                      alt={''}
                      src={video.img ? URL.createObjectURL(video.img) : ''}
                      className='size-full object-cover'
                    />
                  </div>

                  <div className='ml-4 flex flex-1 flex-col'>
                    <div>
                      <div className='flex justify-between text-base font-medium text-gray-900'>
                        <h3>{video.title}</h3>
                        <div className='flex'>
                          <Link
                            href={`/videoeditor/${video._id}`}
                            className='pl-10'
                          >
                            <button
                              type='button'
                              className='font-medium text-indigo-600 hover:text-indigo-500'
                            >
                              Edit
                            </button>
                          </Link>
                          <Link
                            href={`#`}
                            className='pl-10'
                            onClick={(e) => {
                              removeVideo(video._id);
                            }}
                          >
                            <button
                              type='button'
                              className='font-medium text-indigo-600 hover:text-indigo-500'
                            >
                              Remove
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
