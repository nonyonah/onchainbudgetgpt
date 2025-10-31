import React from 'react';

export const WalletIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 7H3C2.45 7 2 6.55 2 6V4C2 2.9 2.9 2 4 2H20C21.1 2 22 2.9 22 4V6C22 6.55 21.55 7 21 7Z" fill="currentColor"/>
    <path d="M22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8H22ZM16 14C16.55 14 17 13.55 17 13C17 12.45 16.55 12 16 12C15.45 12 15 12.45 15 13C15 13.55 15.45 14 16 14Z" fill="currentColor"/>
  </svg>
);

export const HistoryIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5S20 8.13 20 12S16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C18.97 21 24 16.97 24 12S18.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="currentColor"/>
  </svg>
);

export const SendIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
  </svg>
);

export const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
  </svg>
);

export const ArrowCircleUpIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#000000"/>
    <path d="M8 12L12 8L16 12L14.5 13.5L13 12V16H11V12L9.5 13.5L8 12Z" fill="white"/>
  </svg>
);