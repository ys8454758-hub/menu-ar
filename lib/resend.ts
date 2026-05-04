import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not set - skipping email send");
        return { id: "dev-mode" };
    }
    const { data, error } = await resend.emails.send({
        from: "Livin3D <noreply@livin3d.app>",
        to,
        subject,
        html,
    });
    if (error) {
        console.error("Resend error:", error);
        throw new Error("Failed to send email");
    }
    return data;
}

export async function sendWelcomeEmail(email: string, name: string) {
    return sendEmail({
        to: email,
        subject: "Welcome to Livin3D",
        html: `<div style="font-family:monospace;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e0e0e0;border:1px solid #00ff8833;"><h1 style="color:#00ff88;font-size:20px;letter-spacing:4px;">WELCOME</h1><p style="color:#888;">Hey ${name},</p><p style="color:#888;">Your Livin3D account is ready. Start creating AR menus that wow your customers.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;margin-top:16px;padding:8px 16px;border:1px solid #00ff88;color:#00ff88;text-decoration:none;letter-spacing:2px;">OPEN DASHBOARD</a></div>`,
    });
}

export async function sendScanReport(email: string, restaurantName: string, reportData: { totalScans: number; topDish: string; period: string }) {
    return sendEmail({
        to: email,
        subject: `Livin3D Scan Report - ${reportData.period}`,
        html: `<div style="font-family:monospace;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e0e0e0;border:1px solid #00ff8833;"><h1 style="color:#00ff88;font-size:20px;letter-spacing:4px;">SCAN REPORT</h1><p style="color:#888;">${restaurantName} - ${reportData.period}</p><div style="margin:16px 0;padding:12px;border:1px solid #333;"><p style="color:#e0e0e0;">Total Scans: <strong style="color:#00ff88;">${reportData.totalScans}</strong></p><p style="color:#e0e0e0;">Top Dish: <strong style="color:#ff6b35;">${reportData.topDish}</strong></p></div></div>`,
    });
}