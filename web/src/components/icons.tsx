type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

function base({ size = 20, className, strokeWidth = 1.7 }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
}

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.8 20c.7-3.4 3.6-5.4 7.2-5.4s6.5 2 7.2 5.4" />
  </svg>
);

export const CartIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 4.5h2l2.2 10.4a1.6 1.6 0 0 0 1.6 1.3h8.3a1.6 1.6 0 0 0 1.6-1.2l1.4-6.4H6" />
    <circle cx="9.5" cy="19.5" r="1.2" />
    <circle cx="17.5" cy="19.5" r="1.2" />
  </svg>
);

export const HeartIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20s-7.2-4.4-8.8-8.6A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 5C19.2 15.6 12 20 12 20Z" />
  </svg>
);

export const StarIcon = ({ size = 13, filled = true }: { size?: number; filled?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const MinusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5.5 12h13" />
  </svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 7h15M9 7V5.4A1.4 1.4 0 0 1 10.4 4h3.2A1.4 1.4 0 0 1 15 5.4V7M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const BoxIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 8.2 12 4l8.5 4.2v7.6L12 20l-8.5-4.2V8.2Z" />
    <path d="M3.5 8.2 12 12.4l8.5-4.2M12 12.4V20" />
  </svg>
);

export const CycleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 10a8 8 0 0 1 13.6-4.3L20 8" />
    <path d="M20 4.5V8h-3.5" />
    <path d="M20 14a8 8 0 0 1-13.6 4.3L4 16" />
    <path d="M4 19.5V16h3.5" />
  </svg>
);

export const LockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
);

export const HeadsetIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" />
    <rect x="3.5" y="13" width="4" height="6" rx="1.6" />
    <rect x="16.5" y="13" width="4" height="6" rx="1.6" />
    <path d="M18.5 19v.5a2 2 0 0 1-2 2H13" />
  </svg>
);

export const SparkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5Z" />
    <path d="M18 16.5c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" />
  </svg>
);

export const ICONS = {
  box: BoxIcon,
  cycle: CycleIcon,
  lock: LockIcon,
  headset: HeadsetIcon,
};
