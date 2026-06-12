import "server-only";

import { Resend } from "resend";

// Dev mode (no verified domain): Resend only delivers from onboarding@resend.dev
// and only to the email the Resend account was registered with.
const FROM = process.env.RESEND_FROM_EMAIL || "LMS <onboarding@resend.dev>";

export async function sendInvitationEmail(input: {
  to: string;
  organizationName: string;
  inviteUrl: string;
}): Promise<{ error: string | null }> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: `You've been invited to join ${input.organizationName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-weight: 600;">Join ${input.organizationName}</h2>
        <p>You've been invited to join <strong>${input.organizationName}</strong> on the learning platform.</p>
        <p>
          <a href="${input.inviteUrl}"
             style="display: inline-block; padding: 10px 20px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Accept invitation
          </a>
        </p>
        <p style="color: #6b7280; font-size: 13px;">
          Or copy this link into your browser:<br />${input.inviteUrl}
        </p>
      </div>
    `,
  });

  return { error: error ? error.message : null };
}
