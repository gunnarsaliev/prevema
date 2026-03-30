'use client'

import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

export function Loader({ size = 'md', className }: LoaderProps) {
  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'loader relative',
          sizeClasses[size],
          className
        )}
        style={{
          background: 'linear-gradient(-45deg, #fc00ff 0%, #00dbde 100%)',
          animation: 'spin 3s infinite',
        }}
      >
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(-45deg, #fc00ff 0%, #00dbde 100%)',
            transform: 'translate3d(0, 0, 0) scale(0.95)',
            filter: 'blur(20px)',
          }}
        />
      </div>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(-45deg);
          }
          50% {
            transform: rotate(-360deg);
            border-radius: 50%;
          }
          100% {
            transform: rotate(-45deg);
          }
        }
      `}</style>
    </div>
  );
}

// Centered loader with optional text
interface CenteredLoaderProps extends LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export function CenteredLoader({
  text,
  fullScreen = false,
  size = 'lg',
  className
}: CenteredLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen && 'min-h-screen',
        !fullScreen && 'py-12',
        className
      )}
    >
      <Loader size={size} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
