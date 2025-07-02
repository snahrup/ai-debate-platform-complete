import React from 'react';

// Dark mode versions of the model logos
export const ChatGPTLogo = ({ size = 32 }: { size?: number }) => (
  <div style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="50" fill="#10A37F" />
      <path d="M27.5 50C27.5 37.5741 37.5741 27.5 50 27.5C62.4259 27.5 72.5 37.5741 72.5 50C72.5 62.4259 62.4259 72.5 50 72.5C37.5741 72.5 27.5 62.4259 27.5 50Z" fill="white" />
      <path d="M50 30C38.402 30 29 39.402 29 51C29 62.598 38.402 72 50 72C61.598 72 71 62.598 71 51C71 39.402 61.598 30 50 30ZM50 65.5C42.5442 65.5 36.5 59.4558 36.5 52C36.5 44.5442 42.5442 38.5 50 38.5C57.4558 38.5 63.5 44.5442 63.5 52C63.5 59.4558 57.4558 65.5 50 65.5Z" fill="#10A37F" />
      <path d="M50 42C46.134 42 43 45.134 43 49C43 52.866 46.134 56 50 56C53.866 56 57 52.866 57 49C57 45.134 53.866 42 50 42Z" fill="#10A37F" />
    </svg>
  </div>
);

export const ClaudeLogo = ({ size = 32 }: { size?: number }) => (
  <div style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="50" fill="#343541" />
      <path d="M50 20C33.458 20 20 33.458 20 50C20 66.542 33.458 80 50 80C66.542 80 80 66.542 80 50C80 33.458 66.542 20 50 20ZM50 75C36.1929 75 25 63.8071 25 50C25 36.1929 36.1929 25 50 25C63.8071 25 75 36.1929 75 50C75 63.8071 63.8071 75 50 75Z" fill="white" />
      <path d="M50 30C38.9543 30 30 38.9543 30 50C30 61.0457 38.9543 70 50 70C61.0457 70 70 61.0457 70 50C70 38.9543 61.0457 30 50 30Z" fill="#343541" />
      <path d="M50 35C42.8203 35 37 40.8203 37 48C37 55.1797 42.8203 61 50 61C57.1797 61 63 55.1797 63 48C63 40.8203 57.1797 35 50 35Z" fill="#F4F4F4" />
    </svg>
  </div>
);

export const GeminiLogo = ({ size = 32 }: { size?: number }) => (
  <div style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="50" fill="#1A1B1E" />
      <path d="M50 25C35.6406 25 24 36.6406 24 51C24 65.3594 35.6406 77 50 77C64.3594 77 76 65.3594 76 51C76 36.6406 64.3594 25 50 25ZM50 72C38.9609 72 30 63.0391 30 52C30 40.9609 38.9609 32 50 32C61.0391 32 70 40.9609 70 52C70 63.0391 61.0391 72 50 72Z" fill="white" />
      <path d="M50 38C43.3711 38 38 43.3711 38 50C38 56.6289 43.3711 62 50 62C56.6289 62 62 56.6289 62 50C62 43.3711 56.6289 38 50 38Z" fill="#1A1B1E" />
      <path d="M50 45C47.2383 45 45 47.2383 45 50C45 52.7617 47.2383 55 50 55C52.7617 55 55 52.7617 55 50C55 47.2383 52.7617 45 50 45Z" fill="white" />
    </svg>
  </div>
);
