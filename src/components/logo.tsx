'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  animated?: boolean;
}

export function Logo({
  className,
  compact = false,
  size = 'md',
  showTagline = false,
  animated = true,
}: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Size variations
  const sizeMap = {
    sm: {
      box: 'h-7 w-7 rounded-lg',
      svg: 'h-4 w-4',
      textMain: 'text-sm font-extrabold',
      textHindi: 'text-sm font-black',
      tag: 'text-[8px]',
      gap: 'gap-1.5',
    },
    md: {
      box: 'h-9 w-9 sm:h-10 sm:w-10 rounded-2xl',
      svg: 'h-5 w-5 sm:h-6 sm:w-6',
      textMain: 'text-base sm:text-lg font-black',
      textHindi: 'text-base sm:text-lg font-black',
      tag: 'text-[9px]',
      gap: 'gap-2.5',
    },
    lg: {
      box: 'h-12 w-12 sm:h-14 sm:w-14 rounded-2xl',
      svg: 'h-7 w-7 sm:h-8 sm:w-8',
      textMain: 'text-xl sm:text-2xl font-black',
      textHindi: 'text-xl sm:text-2xl font-black',
      tag: 'text-[10px]',
      gap: 'gap-3',
    },
    xl: {
      box: 'h-16 w-16 sm:h-20 sm:w-20 rounded-3xl',
      svg: 'h-10 w-10 sm:h-12 sm:w-12',
      textMain: 'text-3xl sm:text-4xl font-black',
      textHindi: 'text-3xl sm:text-4xl font-black',
      tag: 'text-xs',
      gap: 'gap-3.5',
    },
  }[size];

  return (
    <div
      className={cn(
        'group inline-flex items-center select-none cursor-pointer shrink-0 transition-transform duration-200',
        sizeMap.gap,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Animated Logo Badge */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Ambient Neon Back-Glow */}
        <motion.div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 opacity-40 blur-md pointer-events-none"
          animate={
            animated
              ? {
                  scale: isHovered ? 1.25 : [1, 1.12, 1],
                  opacity: isHovered ? 0.8 : [0.35, 0.55, 0.35],
                }
              : undefined
          }
          transition={{
            repeat: Infinity,
            duration: isHovered ? 0.3 : 3,
            ease: 'easeInOut',
          }}
        />

        {/* Main Emblem Container */}
        <motion.div
          className={cn(
            'relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 shadow-lg shadow-amber-500/25 border border-amber-300/80 dark:border-amber-300/40',
            sizeMap.box
          )}
          whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {/* Continuous Shimmer Light Beam */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none"
              initial={{ x: '-150%' }}
              animate={{ x: ['150%', '-150%'] }}
              transition={{
                repeat: Infinity,
                duration: 2.8,
                ease: 'easeInOut',
                repeatDelay: 1.2,
              }}
            />
          )}

          {/* Kinetic Speed Road Lines in Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden flex flex-col justify-between py-1">
            <motion.div
              className="h-[1px] bg-black w-full"
              animate={animated ? { x: ['-100%', '100%'] } : undefined}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            />
            <motion.div
              className="h-[1px] bg-black w-full"
              animate={animated ? { x: ['100%', '-100%'] } : undefined}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
            />
            <motion.div
              className="h-[1px] bg-black w-full"
              animate={animated ? { x: ['-100%', '100%'] } : undefined}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            />
          </div>

          {/* Precision Stylized Vehicle Vector (Bike / Fast Ride) */}
          <svg
            viewBox="0 0 44 44"
            className={cn('relative z-10 text-neutral-950 fill-current drop-shadow-xs', sizeMap.svg)}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Aerodynamic Wind Trails */}
            <motion.path
              d="M3 17 L12 17 M2 22 L9 22 M5 27 L11 27"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              animate={
                animated
                  ? {
                      opacity: isHovered ? [0.4, 1, 0.4] : [0.3, 0.9, 0.3],
                      x: isHovered ? [-3, 4, -3] : [-1, 2, -1],
                    }
                  : undefined
              }
              transition={{ repeat: Infinity, duration: isHovered ? 0.4 : 0.8, ease: 'easeInOut' }}
            />

            {/* Rear Wheel (Animated Spoke Rotation) */}
            <g transform="translate(13, 29)">
              <circle cx="0" cy="0" r="6" stroke="currentColor" strokeWidth="2.6" fill="none" />
              <motion.circle
                cx="0"
                cy="0"
                r="2.5"
                fill="currentColor"
                animate={animated ? { rotate: 360 } : undefined}
                transition={{
                  repeat: Infinity,
                  duration: isHovered ? 0.4 : 1.2,
                  ease: 'linear',
                }}
              />
              <motion.path
                d="M -5 0 L 5 0 M 0 -5 L 0 5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                animate={animated ? { rotate: 360 } : undefined}
                transition={{
                  repeat: Infinity,
                  duration: isHovered ? 0.4 : 1.2,
                  ease: 'linear',
                }}
              />
            </g>

            {/* Front Wheel (Animated Spoke Rotation) */}
            <g transform="translate(32, 29)">
              <circle cx="0" cy="0" r="6" stroke="currentColor" strokeWidth="2.6" fill="none" />
              <motion.circle
                cx="0"
                cy="0"
                r="2.5"
                fill="currentColor"
                animate={animated ? { rotate: 360 } : undefined}
                transition={{
                  repeat: Infinity,
                  duration: isHovered ? 0.4 : 1.2,
                  ease: 'linear',
                }}
              />
              <motion.path
                d="M -5 0 L 5 0 M 0 -5 L 0 5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                animate={animated ? { rotate: 360 } : undefined}
                transition={{
                  repeat: Infinity,
                  duration: isHovered ? 0.4 : 1.2,
                  ease: 'linear',
                }}
              />
            </g>

            {/* Kinetic Chassis / Frame */}
            <path
              d="M13 29 L21 21 L27 21 L32 29 M21 21 L19 14 L24 14 M27 21 L23 29"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Driver Profile / Helmet */}
            <circle cx="21" cy="10.5" r="3" fill="currentColor" />

            {/* Dynamic Headlight Beam */}
            <motion.path
              d="M33 24 L39 22 L39 27 Z"
              fill="currentColor"
              opacity={0.8}
              animate={animated ? { opacity: [0.4, 0.9, 0.4] } : undefined}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
            />
          </svg>

          {/* Live GPS Radar Pulse Beacon */}
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 ring-1 ring-white"></span>
          </span>
        </motion.div>
      </div>

      {/* Typography & Brand Identity */}
      {!compact && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Mithila (Latin Typography) */}
            <span
              className={cn(
                'font-headline tracking-tight text-foreground transition-colors group-hover:text-amber-500 dark:group-hover:text-amber-400',
                sizeMap.textMain
              )}
            >
              Mithila
            </span>

            {/* गाड़ी (Hindi Devanagari in vibrant Mithila Amber gradient) */}
            <span
              className={cn(
                'font-headline bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 bg-clip-text text-transparent font-black tracking-wide drop-shadow-2xs',
                sizeMap.textHindi
              )}
            >
              गाड़ी
            </span>

            {/* Live Micro Fast Badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-black tracking-wider uppercase bg-amber-400 text-neutral-950 shadow-xs border border-amber-300/60 leading-none',
                sizeMap.tag
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Fast
            </span>
          </div>

          {/* Optional Tagline or Sub-header */}
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground font-medium">
              <span>Bike</span>
              <span className="text-amber-500 font-bold">•</span>
              <span>Auto</span>
              <span className="text-amber-500 font-bold">•</span>
              <span>Cab</span>
              <span className="text-amber-500 font-bold">•</span>
              <span>Parcel</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;
