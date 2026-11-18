"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavItem {
    label: string;
    href: string;
}

export interface SpotlightNavbarProps {
    items?: NavItem[];
    className?: string;
    /** Right-aligned actions, e.g. sign-in / get-started buttons. */
    actions?: ReactNode;
    onItemClick?: (item: NavItem, index: number) => void;
    defaultActiveIndex?: number;
}

export function SpotlightNavbar({
    items = [
        { label: "Home", href: "#home" },
        { label: "About", href: "#about" },
    ],
    className,
    actions,
    onItemClick,
    defaultActiveIndex = 0,
}: SpotlightNavbarProps) {
    const navRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
    const [hoverX, setHoverX] = useState<number | null>(null);

    // Refs for the "light" positions so we can animate them imperatively.
    const spotlightX = useRef(0);
    const ambienceX = useRef(0);

    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = nav.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHoverX(x);
            spotlightX.current = x;
            nav.style.setProperty("--spotlight-x", `${x}px`);
        };

        const handleMouseLeave = () => {
            setHoverX(null);
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                animate(spotlightX.current, targetX, {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    onUpdate: (v) => {
                        spotlightX.current = v;
                        nav.style.setProperty("--spotlight-x", `${v}px`);
                    },
                });
            }
        };

        nav.addEventListener("mousemove", handleMouseMove);
        nav.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            nav.removeEventListener("mousemove", handleMouseMove);
            nav.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [activeIndex]);

    // The ambience stays on the active item.
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;
        const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            const targetX = itemRect.left - navRect.left + itemRect.width / 2;

            animate(ambienceX.current, targetX, {
                type: "spring",
                stiffness: 200,
                damping: 20,
                onUpdate: (v) => {
                    ambienceX.current = v;
                    nav.style.setProperty("--ambience-x", `${v}px`);
                },
            });
        }
    }, [activeIndex]);

    const handleItemClick = (item: NavItem, index: number) => {
        setActiveIndex(index);
        if (item.href.startsWith("#")) {
            document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
            window.history.replaceState(null, "", item.href);
        }
        onItemClick?.(item, index);
    };

    return (
        <div className={cn("relative flex justify-center pt-6 sm:pt-8", className)}>
            <nav
                ref={navRef}
                aria-label="Main navigation"
                className={cn(
                    "spotlight-nav spotlight-nav-bg glass-border spotlight-nav-shadow",
                    "relative flex h-12 items-center rounded-full transition-all duration-300 overflow-hidden"
                )}
            >
                <ul className="relative flex h-full items-center px-2 z-[10]">
                    {items.map((item, idx) => (
                        <li key={idx} className="relative flex h-full items-center justify-center">
                            <a
                                href={item.href}
                                data-index={idx}
                                onClick={(e) => {
                                    if (item.href.startsWith("#")) e.preventDefault();
                                    handleItemClick(item, idx);
                                }}
                                className={cn(
                                    "px-3.5 py-2 text-sm font-medium transition-colors duration-200 rounded-full sm:px-4",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                                    activeIndex === idx
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {actions && (
                    <div className="relative z-[10] ml-1 flex items-center gap-2 border-l border-border/70 pl-3 pr-1.5">
                        {actions}
                    </div>
                )}

                {/* Moving spotlight that follows the cursor. */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 h-full w-full z-[1] transition-opacity duration-300"
                    style={{
                        opacity: hoverX !== null ? 1 : 0,
                        background: `radial-gradient(120px circle at var(--spotlight-x) 100%, var(--spotlight-color) 0%, transparent 50%)`,
                    }}
                />

                {/* Active-item ambience line. */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full z-[2]"
                    style={{
                        background: `radial-gradient(60px circle at var(--ambience-x) 0%, var(--ambience-color) 0%, transparent 100%)`,
                    }}
                />
            </nav>
        </div>
    );
}
