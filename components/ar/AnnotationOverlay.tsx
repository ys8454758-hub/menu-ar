"use client";

import { useState } from "react";

interface Annotation {
    label: string;
    position: { x: number; y: number; z: number };
    description?: string;
}

interface AnnotationOverlayProps {
    annotations: Annotation[];
    visible: boolean;
}

export default function AnnotationOverlay({ annotations, visible }: AnnotationOverlayProps) {
    const [expanded, setExpanded] = useState<number | null>(null);

    if (!visible || annotations.length === 0) return null;

    const getPositionStyle = (pos: { x: number; y: number; z: number }) => {
        const x = 50 + pos.x * 30;
        const y = 50 + pos.y * 30;
        return {
            left: `${x}%`,
            top: `${y}%`,
        };
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-30">
            {annotations.map((ann, index) => {
                const pos = getPositionStyle(ann.position);
                const isExpanded = expanded === index;

                return (
                    <div
                        key={index}
                        className="absolute pointer-events-auto"
                        style={pos}
                    >
                        <button
                            onClick={() => setExpanded(isExpanded ? null : index)}
                            className={`
                                relative flex items-center gap-1
                                bg-terminal/90 backdrop-blur-sm border border-border
                                px-3 py-1.5 rounded-none
                                transition-all duration-200
                                hover:bg-terminal
                                ${isExpanded ? 'border-plasma' : ''}
                            `}
                        >
                            <span
                                className="absolute w-2 h-2 bg-plasma rounded-full"
                                style={{
                                    left: '-6px',
                                    top: '50%',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                }}
                            />
                            <span className="text-body-xs font-mono text-text-primary whitespace-nowrap">
                                {ann.label}
                            </span>
                        </button>

                        {isExpanded && ann.description && (
                            <div
                                className="absolute top-full left-0 mt-2 bg-terminal/95 backdrop-blur-sm border border-plasma p-2 rounded-none min-w-[150px] z-40"
                            >
                                <p className="text-body-xs font-body text-text-secondary">
                                    {ann.description}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}