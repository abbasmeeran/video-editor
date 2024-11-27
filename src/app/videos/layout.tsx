import { Metadata } from 'next';
import * as React from 'react';

import '@/styles/colors.css';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid';
import { BellIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Components',
  description: 'Pre-built components with awesome default',
};

const navigation = [{ name: 'Home', href: '/videos', current: true }];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=' flex flex-col md:flex-row  '>
      <div className='border-2  flex-1'>
        <div className='flex  flex-col '>
          <Disclosure as='nav' className='bg-gray-800'>
            <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
              <div className='relative flex h-16 items-center justify-between'>
                <div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
                  {/* Mobile menu button*/}
                  <DisclosureButton className='group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'>
                    <span className='absolute -inset-0.5' />
                    <span className='sr-only'>Open main menu</span>
                    <Bars3Icon
                      aria-hidden='true'
                      className='block size-6 group-data-[open]:hidden'
                    />
                    <XMarkIcon
                      aria-hidden='true'
                      className='hidden size-6 group-data-[open]:block'
                    />
                  </DisclosureButton>
                </div>
                <div className='flex flex-1 items-center justify-center sm:items-stretch sm:justify-start'>
                  <div className='flex shrink-0 items-center'>
                    <img
                      alt='Your Company'
                      src='https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500'
                      className='h-8 w-auto'
                    />
                  </div>
                  <div className='hidden sm:ml-6 sm:block'>
                    <div className='flex space-x-4'>
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          aria-current={item.current ? 'page' : undefined}
                          className={classNames(
                            item.current
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
                  <button
                    type='button'
                    className='relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
                  >
                    <span className='absolute -inset-1.5' />
                    <span className='sr-only'>View notifications</span>
                    <BellIcon aria-hidden='true' className='size-6' />
                  </button>
                </div>
              </div>
            </div>
          </Disclosure>
          <div className=''>{children}</div>
        </div>
      </div>
    </div>
  );
}
