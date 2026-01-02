import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

export interface BentoCardProps {
    color?: string;
    title?: string;
    description?: React.ReactNode;
    label?: string;
    textAutoHide?: boolean;
    disableAnimations?: boolean;
    icon?: React.ReactNode;
}

export interface BentoProps {
    items?: BentoCardProps[];
    children?: React.ReactNode;
    textAutoHide?: boolean;
    enableStars?: boolean;
    enableSpotlight?: boolean;
    enableBorderGlow?: boolean;
    disableAnimations?: boolean;
    spotlightRadius?: number;
    particleCount?: number;
    enableTilt?: boolean;
    glowColor?: string;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
    gridClassName?: string;
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const defaultCardData: BentoCardProps[] = [
    {
        color: '#060010',
        title: 'Analytics',
        description: 'Track user behavior',
        label: 'Insights'
    },
    {
        color: '#060010',
        title: 'Dashboard',
        description: 'Centralized data view',
        label: 'Overview'
    },
    {
        color: '#060010',
        title: 'Collaboration',
        description: 'Work together seamlessly',
        label: 'Teamwork'
    },
    {
        color: '#060010',
        title: 'Automation',
        description: 'Streamline workflows',
        label: 'Efficiency'
    },
    {
        color: '#060010',
        title: 'Integration',
        description: 'Connect favorite tools',
        label: 'Connectivity'
    },
    {
        color: '#060010',
        title: 'Security',
        description: 'Enterprise-grade protection',
        label: 'Protection'
    }
];

const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
    return el;
};

const calculateSpotlightValues = (radius: number) => ({
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
    const rect = card.getBoundingClientRect();
    const relativeX = ((mouseX - rect.left) / rect.width) * 100;
    const relativeY = ((mouseY - rect.top) / rect.height) * 100;

    card.style.setProperty('--glow-x', `${relativeX}%`);
    card.style.setProperty('--glow-y', `${relativeY}%`);
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', `${radius}px`);
};

// Export ParticleCard for external use
export const ParticleCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    disableAnimations?: boolean;
    style?: React.CSSProperties;
    particleCount?: number;
    glowColor?: string;
    enableTilt?: boolean;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
}> = ({
    children,
    className = '',
    disableAnimations = false,
    style,
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
    enableTilt = true,
    clickEffect = false,
    enableMagnetism = false
}) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const particlesRef = useRef<HTMLDivElement[]>([]);
        const timeoutsRef = useRef<number[]>([]);
        const isHoveredRef = useRef(false);
        const memoizedParticles = useRef<HTMLDivElement[]>([]);
        const particlesInitialized = useRef(false);
        const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

        const initializeParticles = useCallback(() => {
            if (particlesInitialized.current || !cardRef.current) return;

            const { width, height } = cardRef.current.getBoundingClientRect();
            memoizedParticles.current = Array.from({ length: particleCount }, () =>
                createParticleElement(Math.random() * width, Math.random() * height, glowColor)
            );
            particlesInitialized.current = true;
        }, [particleCount, glowColor]);

        const clearAllParticles = useCallback(() => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
            magnetismAnimationRef.current?.kill();

            particlesRef.current.forEach(particle => {
                gsap.to(particle, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'back.in(1.7)',
                    onComplete: () => {
                        particle.parentNode?.removeChild(particle);
                    }
                });
            });
            particlesRef.current = [];
        }, []);

        const animateParticles = useCallback(() => {
            if (!cardRef.current || !isHoveredRef.current) return;

            if (!particlesInitialized.current) {
                initializeParticles();
            }

            memoizedParticles.current.forEach((particle, index) => {
                const timeoutId = setTimeout(() => {
                    if (!isHoveredRef.current || !cardRef.current) return;

                    const clone = particle.cloneNode(true) as HTMLDivElement;
                    cardRef.current.appendChild(clone);
                    particlesRef.current.push(clone);

                    gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

                    gsap.to(clone, {
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100,
                        rotation: Math.random() * 360,
                        duration: 2 + Math.random() * 2,
                        ease: 'none',
                        repeat: -1,
                        yoyo: true
                    });

                    gsap.to(clone, {
                        opacity: 0.3,
                        duration: 1.5,
                        ease: 'power2.inOut',
                        repeat: -1,
                        yoyo: true
                    });
                }, index * 100);

                timeoutsRef.current.push(timeoutId as unknown as number);
            });
        }, [initializeParticles]);

        useEffect(() => {
            if (disableAnimations || !cardRef.current) return;

            const element = cardRef.current;

            // Set custom property for glow color and initial defaults
            element.style.setProperty('--glow-color', glowColor);
            element.style.setProperty('--glow-radius', '300px'); // Default radius
            element.style.setProperty('--glow-intensity', '0');

            const handleMouseEnter = () => {
                isHoveredRef.current = true;
                animateParticles();

                if (enableTilt) {
                    gsap.to(element, {
                        rotateX: 5,
                        rotateY: 5,
                        duration: 0.3,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                }
            };

            const handleMouseLeave = () => {
                isHoveredRef.current = false;
                clearAllParticles();

                // Reset glow intensity
                element.style.setProperty('--glow-intensity', '0');

                if (enableTilt) {
                    gsap.to(element, {
                        rotateX: 0,
                        rotateY: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }

                if (enableMagnetism) {
                    gsap.to(element, {
                        x: 0,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            };

            let rafId: number | null = null;

            const handleMouseMove = (e: MouseEvent) => {
                if (rafId) return;

                rafId = requestAnimationFrame(() => {
                    if (!element) return; // Safety check inside raf
                    const rect = element.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // Update Glow Position for standalone usage
                    const relativeX = (x / rect.width) * 100;
                    const relativeY = (y / rect.height) * 100;
                    element.style.setProperty('--glow-x', `${relativeX}%`);
                    element.style.setProperty('--glow-y', `${relativeY}%`);
                    element.style.setProperty('--glow-intensity', '1');


                    if (!enableTilt && !enableMagnetism) {
                        rafId = null;
                        return;
                    }

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    if (enableTilt) {
                        const rotateX = ((y - centerY) / centerY) * -10;
                        const rotateY = ((x - centerX) / centerX) * 10;

                        gsap.to(element, {
                            rotateX,
                            rotateY,
                            duration: 0.1,
                            ease: 'power2.out',
                            transformPerspective: 1000
                        });
                    }

                    if (enableMagnetism) {
                        const magnetX = (x - centerX) * 0.05;
                        const magnetY = (y - centerY) * 0.05;

                        magnetismAnimationRef.current = gsap.to(element, {
                            x: magnetX,
                            y: magnetY,
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                    }
                    rafId = null;
                });
            };

            const handleClick = (e: MouseEvent) => {
                if (!clickEffect) return;

                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const maxDistance = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(x - rect.width, y),
                    Math.hypot(x, y - rect.height),
                    Math.hypot(x - rect.width, y - rect.height)
                );

                const ripple = document.createElement('div');
                ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

                element.appendChild(ripple);

                gsap.fromTo(
                    ripple,
                    {
                        scale: 0,
                        opacity: 1
                    },
                    {
                        scale: 1,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        onComplete: () => ripple.remove()
                    }
                );
            };

            element.addEventListener('mouseenter', handleMouseEnter);
            element.addEventListener('mouseleave', handleMouseLeave);
            element.addEventListener('mousemove', handleMouseMove);
            element.addEventListener('click', handleClick);

            return () => {
                isHoveredRef.current = false;
                element.removeEventListener('mouseenter', handleMouseEnter);
                element.removeEventListener('mouseleave', handleMouseLeave);
                element.removeEventListener('mousemove', handleMouseMove);
                element.removeEventListener('click', handleClick);
                clearAllParticles();
            };
        }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

        return (
            <div
                ref={cardRef}
                className={`${className} relative overflow-hidden`}
                style={{ ...style, position: 'relative', overflow: 'hidden' }}
            >
                {children}
            </div>
        );
    };

const GlobalSpotlight: React.FC<{
    gridRef: React.RefObject<HTMLDivElement | null>;
    disableAnimations?: boolean;
    enabled?: boolean;
    spotlightRadius?: number;
    glowColor?: string;
}> = ({
    gridRef,
    disableAnimations = false,
    enabled = true,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR
}) => {
        const spotlightRef = useRef<HTMLDivElement | null>(null);
        const isInsideSection = useRef(false);

        useEffect(() => {
            const isMobile = 'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                window.matchMedia('(pointer: coarse)').matches ||
                window.matchMedia('(hover: none)').matches;

            if (disableAnimations || !gridRef?.current || !enabled || isMobile) return;

            const spotlight = document.createElement('div');
            spotlight.className = 'global-spotlight';
            spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
            document.body.appendChild(spotlight);
            spotlightRef.current = spotlight;

            let rafId: number | null = null;

            const handleMouseMove = (e: MouseEvent) => {
                if (rafId) return;

                rafId = requestAnimationFrame(() => {
                    if (!spotlightRef.current || !gridRef.current) {
                        rafId = null;
                        return;
                    }

                    const section = gridRef.current.closest('.bento-section');
                    const rect = section?.getBoundingClientRect();
                    const mouseInside =
                        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

                    isInsideSection.current = mouseInside || false;
                    const cards = gridRef.current.querySelectorAll('.card');

                    if (!mouseInside) {
                        gsap.to(spotlightRef.current, {
                            opacity: 0,
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                        cards.forEach(card => {
                            (card as HTMLElement).style.setProperty('--glow-intensity', '0');
                        });
                        rafId = null;
                        return;
                    }

                    const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
                    let minDistance = Infinity;

                    cards.forEach(card => {
                        const cardElement = card as HTMLElement;
                        const cardRect = cardElement.getBoundingClientRect();
                        const centerX = cardRect.left + cardRect.width / 2;
                        const centerY = cardRect.top + cardRect.height / 2;
                        const distance =
                            Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
                        const effectiveDistance = Math.max(0, distance);

                        minDistance = Math.min(minDistance, effectiveDistance);

                        let glowIntensity = 0;
                        if (effectiveDistance <= proximity) {
                            glowIntensity = 1;
                        } else if (effectiveDistance <= fadeDistance) {
                            glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
                        }

                        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
                    });

                    gsap.to(spotlightRef.current, {
                        left: e.clientX,
                        top: e.clientY,
                        duration: 0.1,
                        ease: 'power2.out'
                    });

                    const targetOpacity =
                        minDistance <= proximity
                            ? 0.8
                            : minDistance <= fadeDistance
                                ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
                                : 0;

                    gsap.to(spotlightRef.current, {
                        opacity: targetOpacity,
                        duration: targetOpacity > 0 ? 0.2 : 0.5,
                        ease: 'power2.out'
                    });

                    rafId = null;
                });
            };

            const handleMouseLeave = () => {
                isInsideSection.current = false;
                gridRef.current?.querySelectorAll('.card').forEach(card => {
                    (card as HTMLElement).style.setProperty('--glow-intensity', '0');
                });
                if (spotlightRef.current) {
                    gsap.to(spotlightRef.current, {
                        opacity: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseleave', handleMouseLeave);
                spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
            };
        }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

        return null;
    };

const BentoCardGrid: React.FC<{
    children: React.ReactNode;
    gridRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => (
    <div
        className="bento-section grid gap-8 p-3 w-full select-none relative"
        style={{ fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.5rem)' }}
        ref={gridRef}
    >
        {children}
    </div>
);

const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

const MagicBento: React.FC<BentoProps> = ({
    items = defaultCardData,
    textAutoHide = true,
    enableStars = true,
    enableSpotlight = true,
    enableBorderGlow = true,
    disableAnimations = false,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    particleCount = DEFAULT_PARTICLE_COUNT,
    enableTilt = false,
    glowColor = DEFAULT_GLOW_COLOR,
    clickEffect = true,
    enableMagnetism = true,
    children,
    gridClassName = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
}) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const isMobile = useMobileDetection();
    // User requested responsive animations, so we allow them on mobile but ensure efficient resizing
    const shouldDisableAnimations = disableAnimations;

    return (
        <>
            {/* Styles removed - moved to globals.css */}

            {enableSpotlight && (
                <GlobalSpotlight
                    gridRef={gridRef}
                    disableAnimations={shouldDisableAnimations}
                    enabled={enableSpotlight}
                    spotlightRadius={spotlightRadius}
                    glowColor={glowColor}
                />
            )}

            <BentoCardGrid gridRef={gridRef}>
                <div className={`grid ${gridClassName} gap-8`} style={{ '--glow-color': glowColor } as React.CSSProperties}>
                    {children ? children : items?.map((card, index) => {
                        const baseClassName = `card flex flex-col justify-between relative min-h-[250px] w-full max-w-full p-8 rounded-[20px] border border-solid font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] bg-card/10 backdrop-blur-sm ${enableBorderGlow ? 'card--border-glow' : ''
                            }`;

                        const cardStyle = {
                            backgroundColor: card.color || 'rgba(6, 0, 16, 0.5)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'var(--white)',
                            '--glow-x': '50%',
                            '--glow-y': '50%',
                            '--glow-intensity': '0',
                            '--glow-radius': '200px'
                        } as React.CSSProperties;

                        if (enableStars) {
                            return (
                                <ParticleCard
                                    key={index}
                                    className={baseClassName}
                                    style={cardStyle}
                                    disableAnimations={shouldDisableAnimations}
                                    particleCount={particleCount}
                                    glowColor={glowColor}
                                    enableTilt={enableTilt}
                                    clickEffect={clickEffect}
                                    enableMagnetism={enableMagnetism}
                                >
                                    {card.label && (
                                        <div className="card__header flex justify-between gap-3 relative text-white">
                                            <span className="card__label text-xl tracking-widest text-primary">{card.label}</span>
                                        </div>
                                    )}
                                    <div className="card__content flex flex-col relative text-white mt-4">
                                        <h3 className={`card__title font-bold text-2xl m-0 mb-3 ${textAutoHide ? 'text-clamp-1' : ''}`}>
                                            {card.title}
                                        </h3>
                                        <div
                                            className={`card__description text-base text-gray-300 leading-relaxed opacity-90`}
                                        >
                                            {card.description}
                                        </div>
                                    </div>
                                </ParticleCard>
                            );
                        }

                        return (
                            <div
                                key={index}
                                className={baseClassName}
                                style={cardStyle}
                            >
                                <div className="card__header flex justify-between gap-3 relative text-white">
                                    <span className="card__label text-xl tracking-widest text-primary">{card.label}</span>
                                </div>
                                <div className="card__content flex flex-col relative text-white mt-4">
                                    <h3 className={`card__title font-bold text-2xl m-0 mb-3 ${textAutoHide ? 'text-clamp-1' : ''}`}>
                                        {card.title}
                                    </h3>
                                    <div
                                        className={`card__description text-base text-gray-300 leading-relaxed opacity-90`}
                                    >
                                        {card.description}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </BentoCardGrid>
        </>
    );
};

export default MagicBento;
