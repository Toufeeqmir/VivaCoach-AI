const LandingHeroIllustration = ({ className = "" }) => {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 560 420" className="h-full w-full">
        <defs>
          <linearGradient id="bgGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00D4FF" stopOpacity="0.35" />
            <stop offset="1" stopColor="#A78BFA" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="cubeSide" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0B4C7A" />
            <stop offset="1" stopColor="#0A2E4D" />
          </linearGradient>
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* soft background glow */}
        <circle cx="380" cy="190" r="150" fill="url(#bgGlow)" filter="url(#softGlow)" />

        {/* connecting lines / nodes */}
        <g stroke="#7DD3FC" strokeOpacity="0.45" strokeWidth="2" fill="none">
          <path d="M90 160 C170 120, 230 110, 280 130" />
          <path d="M290 270 C240 300, 170 310, 120 290" />
          <path d="M420 110 C470 140, 500 200, 490 250" />
          <path d="M350 310 C420 330, 480 320, 520 290" />
        </g>
        <g fill="#7DD3FC" fillOpacity="0.7">
          {[
            [90, 160],
            [280, 130],
            [120, 290],
            [490, 250],
            [420, 110],
            [520, 290],
            [350, 310],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4" />
          ))}
        </g>

        {/* cube */}
        <g transform="translate(260 120)">
          {/* top */}
          <polygon points="90,0 180,45 90,90 0,45" fill="url(#cubeTop)" opacity="0.95" />
          {/* left */}
          <polygon points="0,45 90,90 90,195 0,150" fill="url(#cubeSide)" opacity="0.95" />
          {/* right */}
          <polygon points="180,45 90,90 90,195 180,150" fill="#073B61" opacity="0.95" />

          {/* inner glow */}
          <circle cx="90" cy="70" r="26" fill="#67E8F9" fillOpacity="0.85" filter="url(#softGlow)" />
          <circle cx="90" cy="70" r="12" fill="#22D3EE" fillOpacity="0.95" />

          {/* AI text */}
          <text
            x="106"
            y="154"
            fontSize="44"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            fill="#7DD3FC"
            fillOpacity="0.7"
          >
            AI
          </text>

          {/* little equalizer on left face */}
          <g transform="translate(34 128)" fill="#22D3EE" fillOpacity="0.9">
            <rect x="0" y="14" width="6" height="18" rx="2" />
            <rect x="10" y="6" width="6" height="26" rx="2" />
            <rect x="20" y="10" width="6" height="22" rx="2" />
            <rect x="30" y="2" width="6" height="30" rx="2" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default LandingHeroIllustration;

