import { Resend } from "resend";

type InviteEmailArgs = {
  to: string;
  companyName: string;
  inviteUrl: string;
};

// Sends the employee-invitation email. Best-effort: if RESEND_API_KEY is not yet
// configured (v1 blocker), it logs the link instead of throwing so the invite still
// gets created and the admin can copy the link from the UI.
export async function sendInviteEmail({
  to,
  companyName,
  inviteUrl,
}: InviteEmailArgs): Promise<{ sent: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `[resend] RESEND_API_KEY not set — invitation email to ${to} skipped. Link: ${inviteUrl}`
    );
    return { sent: false, skipped: true };
  }

  const from = process.env.RESEND_FROM ?? "LMS <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `You've been invited to ${companyName}`,
      html: inviteEmailHtml({ companyName, inviteUrl }),
    });
    if (error) {
      console.error("[resend] failed to send invitation email:", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err) {
    console.error("[resend] threw while sending invitation email:", err);
    return { sent: false, error: err instanceof Error ? err.message : "send failed" };
  }
}

function inviteEmailHtml({
  companyName,
  inviteUrl,
}: {
  companyName: string;
  inviteUrl: string;
}): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2430">
    <h1 style="font-size:20px;font-weight:600;letter-spacing:-0.01em;margin:0 0 12px">
      You've been invited to ${escapeHtml(companyName)}
    </h1>
    <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 24px">
      ${escapeHtml(companyName)} has invited you to join their training on the LMS.
      Click the button below to accept and get started.
    </p>
    <a href="${inviteUrl}"
       style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;
              font-size:14px;font-weight:600;padding:10px 20px;border-radius:6px">
      Accept invitation
    </a>
    <p style="font-size:12px;line-height:1.6;color:#9ca3af;margin:24px 0 0">
      Or paste this link into your browser:<br />
      <a href="${inviteUrl}" style="color:#4f46e5;word-break:break-all">${inviteUrl}</a>
    </p>
    <p style="font-size:12px;line-height:1.6;color:#9ca3af;margin:12px 0 0">
      This invitation expires in 72 hours.
    </p>
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
