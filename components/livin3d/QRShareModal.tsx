"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, QrCode } from "lucide-react";

interface QRShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrUrl: string | null;
}

export default function QRShareModal({ isOpen, onClose, qrUrl }: QRShareModalProps) {
    if (!qrUrl) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-void/80 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-terminal border-t border-border p-8 rounded-t-3xl shadow-2xl max-w-lg mx-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-body-lg font-display text-text-accent tracking-widest uppercase">Share Menu</h3>
                                <p className="text-body-xs font-mono text-text-tertiary mt-1">Scan or share this QR to access the menu</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-text-tertiary hover:text-plasma transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: "spring", damping: 15 }}
                                className="bg-white p-4 rounded-2xl shadow-lg"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qrUrl} alt="Menu QR Code" className="w-48 h-48" />
                            </motion.div>

                            <div className="w-full flex gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                    }}
                                    className="flex-1 py-3 border border-border text-text-secondary font-ui text-xs tracking-widest uppercase hover:border-plasma hover:text-plasma transition-all flex items-center justify-center gap-2 rounded-lg"
                                >
                                    <Share2 className="w-4 h-4" /> Copy Link
                                </button>
                                <a
                                    href={qrUrl}
                                    download="menu-qr.png"
                                    className="flex-1 py-3 bg-plasma text-void font-ui text-xs tracking-widest uppercase hover:bg-plasma/90 transition-all flex items-center justify-center gap-2 rounded-lg"
                                >
                                    <QrCode className="w-4 h-4" /> Download QR
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
