"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const plans = [
    {
        name: "Starter",
        price: "₹999",
        period: "/month",
        dishes: "Up to 10 dishes",
        features: ["3D model uploads", "QR code generation", "Basic analytics (30 days)", "Email support", "1 restaurant"],
        cta: "Start Free Trial",
        href: "/register",
        highlight: false,
    },
    {
        name: "Growth",
        price: "₹2,999",
        period: "/month",
        dishes: "Up to 50 dishes",
        features: ["Everything in Starter", "QR Design Studio", "Badge customization", "Advanced analytics (90 days)", "Priority support", "1 restaurant"],
        cta: "Start Free Trial",
        href: "/register?plan=growth",
        highlight: true,
    },
    {
        name: "Pro",
        price: "₹7,999",
        period: "/month",
        dishes: "Unlimited dishes",
        features: ["Everything in Growth", "Multi-restaurant", "Map listing", "Custom branding", "Dedicated manager", "API access", "12-month analytics"],
        cta: "Contact Sales",
        href: "/register?plan=pro",
        highlight: false,
    },
];

function PricingCard({ plan, i }: { plan: typeof plans[0]; i: number }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { damping: 20, stiffness: 200 });
    const mouseYSpring = useSpring(y, { damping: 20, stiffness: 200 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="perspective-1000"
        >
            <div
                style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
className={`relative p-10 h-full border rounded-2xl shadow-xl hover:shadow-2xl ${plan.highlight
                    ? "border-plasma bg-plasma/5 shadow-plasma-glow hover:shadow-plasma/30"
                    : "border-[#1a1714] bg-[#1a1714] hover:shadow-plasma/10"
                } group hover:border-plasma/40 transition-all duration-500`}
            >
                {/* "Popular" badge */}
                {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-plasma text-void px-5 py-1 font-ui text-xs tracking-widest uppercase z-10">
                        Popular
                    </div>
                )}

                {/* Floating glow for highlighted */}
                {plan.highlight && (
                    <div className="absolute -inset-px bg-gradient-to-b from-plasma/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}

                <h3
                    style={{ transform: "translateZ(20px)" }}
                    className="text-body-lg font-ui text-text-accent tracking-widest uppercase"
                >
                    {plan.name}
                </h3>

                <div className="mt-6 mb-2" style={{ transform: "translateZ(30px)" }}>
                    <span className="text-5xl font-display text-plasma">{plan.price}</span>
                    <span className="text-body-sm font-body text-text-tertiary ml-1">{plan.period}</span>
                </div>

                <p className="text-body-sm font-ui text-text-secondary mb-8">{plan.dishes}</p>

                <ul className="space-y-4 mb-10">
                    {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-body-sm font-body text-text-secondary">
                            <span className="text-plasma text-xs">✓</span> {f}
                        </li>
                    ))}
                </ul>

                <a
                    href={plan.href}
                    style={{ transform: "translateZ(15px)" }}
                    className={`block text-center px-6 py-4 font-ui text-sm tracking-widest uppercase transition-all duration-300 ${plan.highlight
                        ? "bg-plasma text-void hover:shadow-plasma-glow"
                        : "border border-[#1a1714] text-text-primary hover:border-plasma/50"
                        }`}
                >
                    {plan.cta}
                </a>
            </div>
        </motion.div>
    );
}

export default function Pricing() {
    return (
        <section id="pricing" className="py-32 relative overflow-hidden">
            {/* Background accents */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-plasma/5 rounded-full blur-[200px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    className="text-center mb-24"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-display-lg font-display text-text-accent tracking-widest uppercase mb-6">Pricing</h2>
                    <p className="text-body-lg font-body text-text-secondary max-w-2xl mx-auto">Start free, scale as you grow. No hidden fees.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <PricingCard key={plan.name} plan={plan} i={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}