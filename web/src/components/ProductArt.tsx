import type { ReactElement } from 'react';

const SHAPES: Record<string, ReactElement> = {
  skincare: (
    <>
      <rect x="14" y="18" width="32" height="10" rx="3" fill="#ffffff" opacity="0.85" />
      <path
        d="M18 28h24a8 8 0 0 1 0 16H18a8 8 0 0 1 0-16Z"
        fill="#ffffff"
        stroke="#2f4f2a"
        strokeWidth="1.6"
      />
      <path d="M24 44h12" stroke="#2f4f2a" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <path d="M46 22c3 0 5 2 5 5" stroke="#e7b7b2" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  ),
  makeup: (
    <>
      <rect x="22" y="16" width="16" height="8" rx="2.4" fill="#ffffff" opacity="0.9" />
      <path
        d="M24 24h12v18a6 6 0 0 1-6 6 6 6 0 0 1-6-6V24Z"
        fill="#ffffff"
        stroke="#2f4f2a"
        strokeWidth="1.6"
      />
      <path d="M24 33h12" stroke="#e7b7b2" strokeWidth="3" />
    </>
  ),
  hair: (
    <>
      <rect x="20" y="14" width="20" height="8" rx="2.5" fill="#ffffff" opacity="0.9" />
      <path
        d="M18 22h24v20a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8V22Z"
        fill="#ffffff"
        stroke="#2f4f2a"
        strokeWidth="1.6"
      />
      <path d="M25 32h10M25 39h10" stroke="#2f4f2a" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
    </>
  ),
  food: (
    <>
      <path
        d="M20 26h20l-2.5 16a5 5 0 0 1-5 4.3h-5a5 5 0 0 1-5-4.3L20 26Z"
        fill="#ffffff"
        stroke="#2f4f2a"
        strokeWidth="1.6"
      />
      <path d="M24 26v-6a4.5 4.5 0 0 1 9 0v6" stroke="#2f4f2a" strokeWidth="1.6" fill="none" />
      <path d="M20 34h20" stroke="#e7b7b2" strokeWidth="1.6" />
    </>
  ),
  home: (
    <>
      <path
        d="M24 20h12v28a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V20Z"
        fill="#ffffff"
        stroke="#2f4f2a"
        strokeWidth="1.6"
      />
      <path d="M30 20v-6" stroke="#2f4f2a" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M30 16c2-4 5-3 6-6" stroke="#e7b7b2" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </>
  ),
};

export function ProductArt({
  category,
  tint,
  size = 120,
}: {
  category: string;
  tint: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16,
        background: `radial-gradient(circle at 70% 22%, #ffffff 0%, ${tint} 78%)`,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 60 56" fill="none" role="img" aria-label="Изображение товара">
        {SHAPES[category] ?? SHAPES.skincare}
      </svg>
    </div>
  );
}

export function HeroArt() {
  return (
    <svg viewBox="0 0 320 260" fill="none" aria-hidden>
      <ellipse cx="170" cy="232" rx="120" ry="14" fill="#2f4f2a" opacity="0.07" />
      <rect x="96" y="96" width="62" height="132" rx="16" fill="#ffffff" />
      <rect x="108" y="70" width="38" height="30" rx="8" fill="#f3f0ea" />
      <rect x="116" y="140" width="22" height="4" rx="2" fill="#2f4f2a" opacity="0.35" />
      <rect x="116" y="152" width="34" height="3" rx="1.5" fill="#2f4f2a" opacity="0.16" />
      <rect x="176" y="132" width="52" height="96" rx="26" fill="#ffffff" opacity="0.96" />
      <rect x="190" y="112" width="24" height="24" rx="6" fill="#e7b7b2" />
      <circle cx="202" cy="184" r="15" stroke="#2f4f2a" strokeWidth="1.5" opacity="0.35" />
      <path d="M196 184h12M202 178v12" stroke="#2f4f2a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="86" cy="72" r="16" fill="#e7b7b2" opacity="0.55" />
      <circle cx="248" cy="66" r="9" fill="#ffffff" opacity="0.8" />
      <path
        d="M240 108c-6-12 2-22 12-24 4 10 0 20-12 24Z"
        fill="#2f4f2a"
        opacity="0.16"
      />
      <path d="M254 44v14M247 51h14" stroke="#2f4f2a" strokeWidth="1.6" strokeLinecap="round" opacity="0.25" />
    </svg>
  );
}
