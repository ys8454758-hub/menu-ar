"use client";

import { Building2, MapPin, Phone, MessageSquare, Save } from "lucide-react";

interface ProfileSettingsProps {
    form: { name: string; address: string; phone: string; whatsapp: string };
    setForm: (form: { name: string; address: string; phone: string; whatsapp: string }) => void;
    onSave: (e: React.FormEvent) => void;
    saving: boolean;
}

export default function ProfileSettings({ form, setForm, onSave, saving }: ProfileSettingsProps) {
    return (
        <form onSubmit={onSave} className="space-y-5">
            <div className="border border-border bg-terminal p-6 space-y-5 rounded-lg shadow-sm">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-body-xs font-ui text-text-secondary tracking-widest uppercase">
                        <Building2 className="w-3.5 h-3.5" /> Restaurant Name
                    </label>
                    <input 
                        type="text" 
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                        required
                        className="w-full border border-border bg-surface px-4 py-3 text-text-primary focus:border-plasma focus:outline-none transition-colors rounded-md"
                        placeholder="e.g. Spice Garden" 
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-body-xs font-ui text-text-secondary tracking-widest uppercase">
                        <MapPin className="w-3.5 h-3.5" /> Address
                    </label>
                    <input 
                        type="text" 
                        value={form.address} 
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full border border-border bg-surface px-4 py-3 text-text-primary focus:border-plasma focus:outline-none transition-colors rounded-md"
                        placeholder="e.g. 42 MG Road, Bengaluru" 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-body-xs font-ui text-text-secondary tracking-widest uppercase">
                            <Phone className="w-3.5 h-3.5" /> Phone
                        </label>
                        <input 
                            type="tel" 
                            value={form.phone} 
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full border border-border bg-surface px-4 py-3 text-text-primary focus:border-plasma focus:outline-none transition-colors rounded-md"
                            placeholder="+91 98765 43210" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-body-xs font-ui text-text-secondary tracking-widest uppercase">
                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </label>
                        <input 
                            type="tel" 
                            value={form.whatsapp} 
                            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                            className="w-full border border-border bg-surface px-4 py-3 text-text-primary focus:border-plasma focus:outline-none transition-colors rounded-md"
                            placeholder="+91 98765 43210" 
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2 bg-plasma text-void px-8 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 hover:shadow-plasma-glow transition-all disabled:opacity-50 rounded-lg font-bold"
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
