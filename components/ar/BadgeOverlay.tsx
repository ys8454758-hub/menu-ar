"use client";

interface BadgeOverlayProps {
    isVeg?: boolean;
    isNonVeg?: boolean;
    isJain?: boolean;
    isVegan?: boolean;
    visible: boolean;
}

const badgeConfig = {
    veg: { label: "VEG", color: "bg-success", border: "border-success" },
    nonVeg: { label: "NON-VEG", color: "bg-ember", border: "border-ember" },
    jain: { label: "JAIN", color: "bg-solar", border: "border-solar" },
    vegan: { label: "VEGAN", color: "bg-plasma", border: "border-plasma" },
};

export default function BadgeOverlay({ isVeg, isNonVeg, isJain, isVegan, visible }: BadgeOverlayProps) {
    if (!visible) return null;
    const badges = [];
    if (isVeg) badges.push(badgeConfig.veg);
    if (isNonVeg) badges.push(badgeConfig.nonVeg);
    if (isJain) badges.push(badgeConfig.jain);
    if (isVegan) badges.push(badgeConfig.vegan);
    if (badges.length === 0) return null;
    return (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 animate-materialize">
            {badges.map((badge) => (
                <div key={badge.label} className={`${badge.color} ${badge.border} border px-3 py-1.5 rounded-none backdrop-blur-sm`}>
                    <span className="text-body-xs font-mono text-void tracking-widest font-bold">{badge.label}</span>
                </div>
            ))}
        </div>
    );
}