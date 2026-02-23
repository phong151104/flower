"use client";

// Cute chibi-style SVG avatars for team members
// Each avatar has a unique look matching their role

export function ChibiFlorist() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Background */}
            <circle cx="100" cy="100" r="100" fill="url(#grad1)" />
            {/* Body */}
            <ellipse cx="100" cy="175" rx="35" ry="20" fill="#F8B4C8" />
            <rect x="75" y="130" width="50" height="50" rx="10" fill="#FFF0F5" />
            {/* Apron */}
            <path d="M80 140 L100 135 L120 140 L115 170 L85 170 Z" fill="#F8B4C8" />
            <rect x="95" y="135" width="10" height="3" rx="1.5" fill="#E91E63" />
            {/* Neck */}
            <rect x="93" y="122" width="14" height="12" rx="3" fill="#FDDCB5" />
            {/* Head */}
            <ellipse cx="100" cy="95" rx="32" ry="34" fill="#FDDCB5" />
            {/* Hair - long flowing */}
            <ellipse cx="100" cy="78" rx="35" ry="25" fill="#3D2317" />
            <ellipse cx="72" cy="95" rx="10" ry="35" fill="#3D2317" />
            <ellipse cx="128" cy="95" rx="10" ry="35" fill="#3D2317" />
            <ellipse cx="100" cy="68" rx="30" ry="15" fill="#4A2D20" />
            {/* Bangs */}
            <path d="M70 82 Q85 65 100 75 Q90 60 80 80 Z" fill="#4A2D20" />
            <path d="M130 82 Q115 65 100 75 Q110 60 120 80 Z" fill="#4A2D20" />
            {/* Eyes */}
            <ellipse cx="88" cy="98" rx="5" ry="6" fill="#2D1B14" />
            <ellipse cx="112" cy="98" rx="5" ry="6" fill="#2D1B14" />
            <circle cx="86" cy="96" r="2" fill="white" />
            <circle cx="110" cy="96" r="2" fill="white" />
            {/* Blush */}
            <ellipse cx="80" cy="106" rx="6" ry="3" fill="#FFB6C1" opacity="0.5" />
            <ellipse cx="120" cy="106" rx="6" ry="3" fill="#FFB6C1" opacity="0.5" />
            {/* Smile */}
            <path d="M93 108 Q100 115 107 108" stroke="#C0756B" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Flower in hair */}
            <circle cx="125" cy="75" r="8" fill="#FF69B4" />
            <circle cx="125" cy="75" r="4" fill="#FFD700" />
            {/* Small bouquet in hand */}
            <rect x="55" y="140" width="4" height="20" rx="2" fill="#558B2F" />
            <circle cx="55" cy="135" r="6" fill="#FF69B4" />
            <circle cx="50" cy="138" r="5" fill="#FFB6C1" />
            <circle cx="60" cy="138" r="5" fill="#FF1493" />
            <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="200" y2="200">
                    <stop offset="0%" stopColor="#FFF0F5" />
                    <stop offset="100%" stopColor="#FFD1DC" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export function ChibiCreativeDirector() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="100" cy="100" r="100" fill="url(#grad2)" />
            {/* Body */}
            <ellipse cx="100" cy="175" rx="35" ry="20" fill="#D8B4FE" />
            <rect x="75" y="130" width="50" height="50" rx="10" fill="#F3E8FF" />
            {/* Scarf/collar */}
            <path d="M80 135 Q100 145 120 135 L118 142 Q100 150 82 142 Z" fill="#A855F7" />
            {/* Neck */}
            <rect x="93" y="122" width="14" height="12" rx="3" fill="#FDDCB5" />
            {/* Head */}
            <ellipse cx="100" cy="95" rx="32" ry="34" fill="#FDDCB5" />
            {/* Hair - stylish bob */}
            <ellipse cx="100" cy="78" rx="35" ry="25" fill="#1A1A2E" />
            <ellipse cx="75" cy="90" rx="12" ry="25" fill="#1A1A2E" />
            <ellipse cx="125" cy="90" rx="12" ry="25" fill="#1A1A2E" />
            <ellipse cx="100" cy="68" rx="30" ry="15" fill="#16162A" />
            {/* Side bangs */}
            <path d="M68 78 Q80 68 92 78 Q82 72 75 82 Z" fill="#16162A" />
            {/* Eyes - artistic lashes */}
            <ellipse cx="88" cy="98" rx="5" ry="6" fill="#2D1B14" />
            <ellipse cx="112" cy="98" rx="5" ry="6" fill="#2D1B14" />
            <circle cx="86" cy="96" r="2" fill="white" />
            <circle cx="110" cy="96" r="2" fill="white" />
            {/* Eyelashes */}
            <line x1="83" y1="93" x2="80" y2="90" stroke="#2D1B14" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="117" y1="93" x2="120" y2="90" stroke="#2D1B14" strokeWidth="1.5" strokeLinecap="round" />
            {/* Blush */}
            <ellipse cx="80" cy="106" rx="6" ry="3" fill="#E9B8FF" opacity="0.5" />
            <ellipse cx="120" cy="106" rx="6" ry="3" fill="#E9B8FF" opacity="0.5" />
            {/* Smile */}
            <path d="M93 108 Q100 115 107 108" stroke="#C0756B" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Beret */}
            <ellipse cx="100" cy="68" rx="28" ry="10" fill="#7C3AED" />
            <ellipse cx="100" cy="62" rx="22" ry="12" fill="#8B5CF6" />
            <circle cx="100" cy="52" r="4" fill="#A78BFA" />
            {/* Paintbrush in hand */}
            <rect x="130" y="130" width="3" height="30" rx="1.5" fill="#D4A574" transform="rotate(15 130 130)" />
            <rect x="128" y="127" width="7" height="8" rx="2" fill="#7C3AED" transform="rotate(15 130 130)" />
            <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="200" y2="200">
                    <stop offset="0%" stopColor="#F3E8FF" />
                    <stop offset="100%" stopColor="#E9D5FF" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export function ChibiOperations() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="100" cy="100" r="100" fill="url(#grad3)" />
            {/* Body */}
            <ellipse cx="100" cy="175" rx="35" ry="20" fill="#FDE68A" />
            <rect x="75" y="130" width="50" height="50" rx="10" fill="#FFF7ED" />
            {/* Blazer */}
            <path d="M75 135 L85 130 L100 133 L115 130 L125 135 L125 165 L75 165 Z" fill="#F59E0B" />
            <path d="M95 133 L100 170 L105 133" fill="#FFF7ED" />
            {/* Neck */}
            <rect x="93" y="122" width="14" height="12" rx="3" fill="#FDDCB5" />
            {/* Head */}
            <ellipse cx="100" cy="95" rx="32" ry="34" fill="#FDDCB5" />
            {/* Hair - neat ponytail */}
            <ellipse cx="100" cy="78" rx="35" ry="25" fill="#5B3A1A" />
            <ellipse cx="100" cy="68" rx="30" ry="15" fill="#6B4423" />
            {/* Ponytail */}
            <ellipse cx="130" cy="80" rx="8" ry="20" fill="#5B3A1A" transform="rotate(15 130 80)" />
            {/* Bangs */}
            <path d="M72 80 Q85 68 98 78 L75 85 Z" fill="#6B4423" />
            <path d="M128 80 Q115 72 105 78 L125 85 Z" fill="#6B4423" />
            {/* Eyes */}
            <ellipse cx="88" cy="98" rx="5" ry="6" fill="#2D1B14" />
            <ellipse cx="112" cy="98" rx="5" ry="6" fill="#2D1B14" />
            <circle cx="86" cy="96" r="2" fill="white" />
            <circle cx="110" cy="96" r="2" fill="white" />
            {/* Blush */}
            <ellipse cx="80" cy="106" rx="6" ry="3" fill="#FBBF24" opacity="0.3" />
            <ellipse cx="120" cy="106" rx="6" ry="3" fill="#FBBF24" opacity="0.3" />
            {/* Confident smile */}
            <path d="M91 108 Q100 117 109 108" stroke="#C0756B" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Clipboard in hand */}
            <rect x="52" y="135" width="18" height="24" rx="2" fill="#D4A574" />
            <rect x="55" y="138" width="12" height="2" rx="1" fill="white" />
            <rect x="55" y="143" width="12" height="2" rx="1" fill="white" />
            <rect x="55" y="148" width="8" height="2" rx="1" fill="white" />
            <rect x="56" y="133" width="10" height="4" rx="1" fill="#92400E" />
            {/* Earring */}
            <circle cx="68" cy="100" r="2.5" fill="#F59E0B" />
            <defs>
                <linearGradient id="grad3" x1="0" y1="0" x2="200" y2="200">
                    <stop offset="0%" stopColor="#FFF7ED" />
                    <stop offset="100%" stopColor="#FEF3C7" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export function ChibiTechLead() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="100" cy="100" r="100" fill="url(#grad4)" />
            {/* Body */}
            <ellipse cx="100" cy="175" rx="35" ry="20" fill="#93C5FD" />
            <rect x="75" y="130" width="50" height="50" rx="10" fill="#1E3A5F" />
            {/* Hoodie details */}
            <path d="M90 130 Q100 138 110 130" fill="#1E3A5F" stroke="#2D4A6F" strokeWidth="1" />
            <rect x="92" y="145" width="16" height="3" rx="1.5" fill="#60A5FA" />
            {/* Neck */}
            <rect x="93" y="122" width="14" height="12" rx="3" fill="#F0D0A0" />
            {/* Head */}
            <ellipse cx="100" cy="95" rx="32" ry="34" fill="#F0D0A0" />
            {/* Hair - neat short */}
            <ellipse cx="100" cy="78" rx="34" ry="22" fill="#1A1A2E" />
            <ellipse cx="100" cy="68" rx="28" ry="14" fill="#16162A" />
            {/* Side hair */}
            <rect x="68" y="75" width="8" height="15" rx="4" fill="#1A1A2E" />
            <rect x="124" y="75" width="8" height="15" rx="4" fill="#1A1A2E" />
            {/* Glasses */}
            <rect x="78" y="91" rx="4" width="18" height="14" stroke="#374151" strokeWidth="2.5" fill="none" />
            <rect x="104" y="91" rx="4" width="18" height="14" stroke="#374151" strokeWidth="2.5" fill="none" />
            <line x1="96" y1="98" x2="104" y2="98" stroke="#374151" strokeWidth="2.5" />
            <line x1="78" y1="98" x2="72" y2="95" stroke="#374151" strokeWidth="2" />
            <line x1="122" y1="98" x2="128" y2="95" stroke="#374151" strokeWidth="2" />
            {/* Eyes behind glasses */}
            <ellipse cx="87" cy="98" rx="4" ry="5" fill="#2D1B14" />
            <ellipse cx="113" cy="98" rx="4" ry="5" fill="#2D1B14" />
            <circle cx="85" cy="96" r="1.5" fill="white" />
            <circle cx="111" cy="96" r="1.5" fill="white" />
            {/* Smile */}
            <path d="M93 110 Q100 116 107 110" stroke="#B8755E" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Laptop */}
            <rect x="52" y="148" width="22" height="14" rx="2" fill="#374151" />
            <rect x="54" y="150" width="18" height="10" rx="1" fill="#60A5FA" />
            {/* Code on screen */}
            <line x1="56" y1="153" x2="62" y2="153" stroke="#34D399" strokeWidth="1" />
            <line x1="56" y1="156" x2="66" y2="156" stroke="#FCD34D" strokeWidth="1" />
            <rect x="48" y="162" width="30" height="2" rx="1" fill="#6B7280" />
            {/* Coffee */}
            <rect x="135" y="148" width="12" height="14" rx="2" fill="white" stroke="#D1D5DB" strokeWidth="1" />
            <path d="M147 153 Q153 155 147 158" stroke="#D1D5DB" strokeWidth="1.5" fill="none" />
            <ellipse cx="141" cy="148" rx="6" ry="2" fill="#D1D5DB" />
            {/* Steam */}
            <path d="M139 143 Q140 139 141 143" stroke="#D1D5DB" strokeWidth="1" fill="none" />
            <path d="M143 141 Q144 137 145 141" stroke="#D1D5DB" strokeWidth="1" fill="none" />
            <defs>
                <linearGradient id="grad4" x1="0" y1="0" x2="200" y2="200">
                    <stop offset="0%" stopColor="#EFF6FF" />
                    <stop offset="100%" stopColor="#DBEAFE" />
                </linearGradient>
            </defs>
        </svg>
    );
}
