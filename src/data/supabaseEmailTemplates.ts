export interface SupabaseEmailTemplate {
  id: string;
  name: string;
  category: 'authentication' | 'security';
  description: string;
  supabasePath: string;
  defaultSubject: string;
  supportedVariables: {
    variable: string;
    description: string;
    example: string;
  }[];
  htmlBody: string;
  plainTextBody: string;
  previewMockData: Record<string, string>;
}

export const SUPABASE_EMAIL_VARIABLES_SPEC = [
  { name: '{{ .ConfirmationURL }}', description: 'Contains the confirmation URL (e.g. https://project-ref.supabase.co/auth/v1/verify?token=...)' },
  { name: '{{ .Token }}', description: 'Contains a 6-digit One-Time-Password (OTP) code that can be used instead of the link' },
  { name: '{{ .TokenHash }}', description: 'Contains a hashed version of the token for constructing custom URLs' },
  { name: '{{ .SiteURL }}', description: "Contains your application's configured Site URL" },
  { name: '{{ .RedirectTo }}', description: 'Contains the redirect URL passed when auth function is called' },
  { name: '{{ .Data }}', description: 'Contains metadata from auth.users.user_metadata (e.g., {{ .Data.name }})' },
  { name: '{{ .Email }}', description: 'Contains the original/current email address of the user' },
  { name: '{{ .NewEmail }}', description: 'Contains the new email address (Change email address template only)' },
  { name: '{{ .OldEmail }}', description: 'Contains the old email address (Email address changed notification only)' },
  { name: '{{ .Phone }}', description: 'Contains the new phone number (Phone number changed notification only)' },
  { name: '{{ .OldPhone }}', description: 'Contains the old phone number (Phone number changed notification only)' },
  { name: '{{ .Provider }}', description: 'Contains the identity provider name (Google, GitHub, etc.)' },
  { name: '{{ .FactorType }}', description: 'Contains the factor type (totp, sms, phone) for MFA notifications' },
];

export const SUPABASE_EMAIL_TEMPLATES: SupabaseEmailTemplate[] = [
  // 1. Confirm sign up
  {
    id: 'confirm-signup',
    name: 'Confirm sign up',
    category: 'authentication',
    description: 'Sent when a student or staff member registers to verify their institutional email address.',
    supabasePath: 'Authentication → Email Templates → Confirm sign up',
    defaultSubject: 'Confirm Your SHOV Digital Identity Account',
    supportedVariables: [
      { variable: '{{ .ConfirmationURL }}', description: 'Action verification link', example: 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=pk_729481&type=signup' },
      { variable: '{{ .Token }}', description: '6-digit OTP passcode', example: '729481' },
      { variable: '{{ .TokenHash }}', description: 'Hashed verification token', example: 'd41d8cd98f00b204e9800998ecf8427e' },
      { variable: '{{ .SiteURL }}', description: 'Campus portal origin URL', example: 'https://shov.college.edu' },
      { variable: '{{ .Email }}', description: 'User registered email', example: 'aarav.23cs001@student.shov.college.edu' },
      { variable: '{{ .Data.name }}', description: 'User full display name', example: 'Aarav Sharma' },
      { variable: '{{ .Data.departmentCode }}', description: 'Engineering department', example: 'CSE' }
    ],
    previewMockData: {
      'ConfirmationURL': 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=pk_729481&type=signup&redirect_to=https://shov.college.edu',
      'Token': '729481',
      'TokenHash': 'd41d8cd98f00b204e9800998ecf8427e',
      'SiteURL': 'https://shov.college.edu',
      'Email': 'aarav.23cs001@student.shov.college.edu',
      'Data.name': 'Aarav Sharma',
      'Data.departmentCode': 'CSE',
      'Data.role': 'STUDENT'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your SHOV Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-scale(#1e40af, #2563eb); text-align: center; border-bottom: 1px solid #3b82f6;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 900; font-size: 18px; letter-spacing: 2px; padding: 8px 18px; border-radius: 12px; border: 1px solid #60a5fa;">
                      SHOV • DIGITAL ID
                    </div>
                    <p style="margin: 8px 0 0; color: #93c5fd; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                      Campus Identity & Academic Portal
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Confirm Your Email Registration
              </h1>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Welcome to SHOV! Please verify your email address (<strong style="color: #cbd5e1;">{{ .Email }}</strong>) to activate your digital student ID card, access campus gates, and enter academic services.
              </p>

              <!-- Primary Action CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); text-align: center;">
                      Verify Email Address →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 6-Digit OTP Fallback Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; border-radius: 14px; border: 1px solid #334155; margin: 20px 0; padding: 16px;">
                <tr>
                  <td align="center">
                    <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                      Or Enter This 6-Digit Verification Code:
                    </span>
                    <span style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #38bdf8; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;">
                      {{ .Token }}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL -->
              <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                If the button above does not work, copy and paste this link into your web browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #60a5fa; word-break: break-all; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Security Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">
                If you did not register for an account on SHOV, please disregard this email.
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569; font-weight: 600;">
                © 2026 SHOV Institutional Digital ID System • IT • CSE • AIDS
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    plainTextBody: `Confirm Your SHOV Digital Identity Account

Welcome to SHOV!
Please confirm your email address ({{ .Email }}) to activate your campus ID and access academic portals.

Click the link below to verify:
{{ .ConfirmationURL }}

Or enter your 6-digit confirmation code:
{{ .Token }}

If you didn't create an account, you can safely ignore this email.
© 2026 SHOV College Digital Identity System`
  },

  // 2. Invite user
  {
    id: 'invite-user',
    name: 'Invite user',
    category: 'authentication',
    description: 'Sent when an administrator or proctor invites a new student, faculty member, or council officer to the SHOV platform.',
    supabasePath: 'Authentication → Email Templates → Invite user',
    defaultSubject: "You've been invited to join SHOV Campus Network",
    supportedVariables: [
      { variable: '{{ .ConfirmationURL }}', description: 'Acceptance & password creation link', example: 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=inv_938102&type=invite' },
      { variable: '{{ .Token }}', description: '6-digit invitation code', example: '938102' },
      { variable: '{{ .SiteURL }}', description: 'Campus portal origin URL', example: 'https://shov.college.edu' },
      { variable: '{{ .Email }}', description: 'Invited user email', example: 'officer.marcus@shov.college.edu' },
      { variable: '{{ .Data.role }}', description: 'Assigned institutional role', example: 'STAFF' }
    ],
    previewMockData: {
      'ConfirmationURL': 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=inv_938102&type=invite&redirect_to=https://shov.college.edu',
      'Token': '938102',
      'TokenHash': 'e99a18c428cb38d5f260853678922e03',
      'SiteURL': 'https://shov.college.edu',
      'Email': 'officer.marcus@shov.college.edu',
      'Data.role': 'STAFF',
      'Data.name': 'Officer Marcus Vance'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to SHOV</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);" cellspacing="0" cellpadding="0" border="0">
          
          <tr>
            <td style="padding: 32px 32px 24px; background: #312e81; text-align: center; border-bottom: 1px solid #6366f1;">
              <div style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 900; font-size: 18px; letter-spacing: 2px; padding: 8px 18px; border-radius: 12px; border: 1px solid #818cf8;">
                SHOV INVITATION
              </div>
              <p style="margin: 8px 0 0; color: #c7d2fe; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                Institutional Access Authorization
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #ffffff;">
                You're Invited to Access SHOV
              </h1>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                You have been authorized to join the SHOV College Digital Ecosystem for <strong style="color: #cbd5e1;">{{ .Email }}</strong>. Click below to accept the invitation and set up your secure credentials.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); text-align: center;">
                      Accept Invitation & Join →
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; border-radius: 14px; border: 1px solid #334155; margin: 20px 0; padding: 16px;">
                <tr>
                  <td align="center">
                    <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                      Alternative Invitation Code:
                    </span>
                    <span style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #a5b4fc; font-family: monospace;">
                      {{ .Token }}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                Direct URL:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #818cf8; word-break: break-all; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #475569; font-weight: 600;">
                © 2026 SHOV Institutional Digital ID System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    plainTextBody: `You've been invited to join SHOV

You have been authorized to join the SHOV Campus Network for {{ .Email }}.
Accept your invite and set up your password:
{{ .ConfirmationURL }}

Invitation Code: {{ .Token }}
© 2026 SHOV College Digital Identity System`
  },

  // 3. Magic link or OTP
  {
    id: 'magic-link',
    name: 'Magic link or OTP',
    category: 'authentication',
    description: 'Sent when a user requests a passwordless one-time login link or 6-digit OTP code to enter the dashboard.',
    supabasePath: 'Authentication → Email Templates → Magic link or OTP',
    defaultSubject: 'Your SHOV One-Time Login Code & Magic Link',
    supportedVariables: [
      { variable: '{{ .ConfirmationURL }}', description: '1-click sign in magic link', example: 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=ml_883019&type=magiclink' },
      { variable: '{{ .Token }}', description: '6-digit OTP passcode', example: '883019' },
      { variable: '{{ .SiteURL }}', description: 'Application Site URL', example: 'https://shov.college.edu' },
      { variable: '{{ .Email }}', description: 'Recipient email address', example: 'aarav.23cs001@student.shov.college.edu' }
    ],
    previewMockData: {
      'ConfirmationURL': 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=ml_883019&type=magiclink&redirect_to=https://shov.college.edu',
      'Token': '883019',
      'TokenHash': 'c4ca4238a0b923820dcc509a6f75849b',
      'SiteURL': 'https://shov.college.edu',
      'Email': 'aarav.23cs001@student.shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SHOV Login Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);" cellspacing="0" cellpadding="0" border="0">
          
          <tr>
            <td style="padding: 32px 32px 24px; background: #065f46; text-align: center; border-bottom: 1px solid #10b981;">
              <div style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 900; font-size: 18px; letter-spacing: 2px; padding: 8px 18px; border-radius: 12px; border: 1px solid #34d399;">
                SHOV PASSCODE
              </div>
              <p style="margin: 8px 0 0; color: #a7f3d0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                Instant Passwordless Authentication
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #ffffff;">
                Your One-Time Login Code
              </h1>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Use the 6-digit OTP code below to sign in to your SHOV portal account, or click the direct magic login link. This code expires in 10 minutes.
              </p>

              <!-- Big Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; border-radius: 16px; border: 2px solid #10b981; margin: 24px 0; padding: 20px;">
                <tr>
                  <td align="center">
                    <span style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">
                      Verification Code (OTP)
                    </span>
                    <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ffffff; font-family: monospace;">
                      {{ .Token }}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4); text-align: center;">
                      Sign In Instantly with Magic Link →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                Direct URL:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #34d399; word-break: break-all; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #475569; font-weight: 600;">
                If you did not request this login code, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    plainTextBody: `Your SHOV One-Time Login Code & Magic Link

Use this 6-digit OTP code to sign in to SHOV:
{{ .Token }}

Or sign in directly using this Magic Link:
{{ .ConfirmationURL }}

This code expires in 10 minutes.
© 2026 SHOV College Digital Identity System`
  },

  // 4. Change email address
  {
    id: 'change-email',
    name: 'Change email address',
    category: 'authentication',
    description: 'Sent to verify the newly submitted email address before completing an email update.',
    supabasePath: 'Authentication → Email Templates → Change email address',
    defaultSubject: 'Confirm Your New Email Address for SHOV',
    supportedVariables: [
      { variable: '{{ .ConfirmationURL }}', description: 'Email update confirmation link', example: 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=ce_501923&type=email_change' },
      { variable: '{{ .Token }}', description: '6-digit confirmation token', example: '501923' },
      { variable: '{{ .Email }}', description: 'Current email address', example: 'old.student@shov.college.edu' },
      { variable: '{{ .NewEmail }}', description: 'New email address being confirmed', example: 'aarav.sharma.cse@shov.college.edu' }
    ],
    previewMockData: {
      'ConfirmationURL': 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=ce_501923&type=email_change&redirect_to=https://shov.college.edu',
      'Token': '501923',
      'Email': 'old.student@shov.college.edu',
      'NewEmail': 'aarav.sharma.cse@shov.college.edu',
      'SiteURL': 'https://shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 28px; background: #0284c7; text-align: center;">
              <div style="display: inline-block; background-color: #0369a1; color: #ffffff; font-weight: 900; font-size: 16px; padding: 6px 16px; border-radius: 10px;">
                SHOV ACCOUNT SECURITY
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #ffffff;">Confirm Your Email Update</h1>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                You requested to change your email from <strong style="color: #cbd5e1;">{{ .Email }}</strong> to <strong style="color: #38bdf8;">{{ .NewEmail }}</strong>.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #0284c7; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
                  Confirm Change to {{ .NewEmail }} →
                </a>
              </div>
              <div style="background: #0f172a; border-radius: 12px; padding: 14px; text-align: center; border: 1px solid #334155;">
                <span style="font-size: 11px; color: #64748b; font-weight: 700; display: block;">Or enter OTP:</span>
                <span style="font-size: 26px; font-weight: 900; color: #38bdf8; font-family: monospace; letter-spacing: 4px;">{{ .Token }}</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    plainTextBody: `Confirm Your New Email Address for SHOV

You requested to change your email address to {{ .NewEmail }}.
Confirm the change by clicking the link:
{{ .ConfirmationURL }}

Or enter this confirmation code:
{{ .Token }}

© 2026 SHOV College Digital Identity System`
  },

  // 5. Reset password
  {
    id: 'reset-password',
    name: 'Reset password',
    category: 'authentication',
    description: 'Sent when a user requests to reset their forgotten password.',
    supabasePath: 'Authentication → Email Templates → Reset password',
    defaultSubject: 'Reset Your SHOV Account Password',
    supportedVariables: [
      { variable: '{{ .ConfirmationURL }}', description: 'Password reset link', example: 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=rp_294810&type=recovery' },
      { variable: '{{ .Token }}', description: '6-digit recovery code', example: '294810' },
      { variable: '{{ .TokenHash }}', description: 'Recovery token hash', example: '8f14e45fceea167a5a36dedd4bea2543' },
      { variable: '{{ .Email }}', description: 'User account email', example: 'aarav.23cs001@student.shov.college.edu' }
    ],
    previewMockData: {
      'ConfirmationURL': 'https://eviprapchoufgatgvcwk.supabase.co/auth/v1/verify?token=rp_294810&type=recovery&redirect_to=https://shov.college.edu',
      'Token': '294810',
      'TokenHash': '8f14e45fceea167a5a36dedd4bea2543',
      'Email': 'aarav.23cs001@student.shov.college.edu',
      'SiteURL': 'https://shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 28px; background: #dc2626; text-align: center;">
              <div style="display: inline-block; background-color: #b91c1c; color: #ffffff; font-weight: 900; font-size: 16px; padding: 6px 16px; border-radius: 10px;">
                SHOV SECURITY • PASSWORD RESET
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #ffffff;">Reset Your Password</h1>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                We received a request to reset the password for your account (<strong style="color: #cbd5e1;">{{ .Email }}</strong>). Click the button below to choose a new password.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #dc2626; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);">
                  Reset My Password →
                </a>
              </div>
              <div style="background: #0f172a; border-radius: 12px; padding: 14px; text-align: center; border: 1px solid #334155;">
                <span style="font-size: 11px; color: #64748b; font-weight: 700; display: block;">Or enter Recovery Code:</span>
                <span style="font-size: 26px; font-weight: 900; color: #f87171; font-family: monospace; letter-spacing: 4px;">{{ .Token }}</span>
              </div>
              <p style="margin: 20px 0 0; font-size: 11px; color: #64748b;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    plainTextBody: `Reset Your SHOV Account Password

Click the link below to reset the password for {{ .Email }}:
{{ .ConfirmationURL }}

Or enter this 6-digit recovery code:
{{ .Token }}

If you didn't request this reset, ignore this email.
© 2026 SHOV College Digital Identity System`
  },

  // 6. Reauthentication
  {
    id: 'reauthentication',
    name: 'Reauthentication',
    category: 'authentication',
    description: 'Sent when a user performs a sensitive operation (like changing credentials) requiring a fresh OTP confirmation.',
    supabasePath: 'Authentication → Email Templates → Reauthentication',
    defaultSubject: 'Your SHOV Reauthentication Code',
    supportedVariables: [
      { variable: '{{ .Token }}', description: '6-digit reauth OTP code', example: '614928' },
      { variable: '{{ .Email }}', description: 'User account email', example: 'aarav.23cs001@student.shov.college.edu' }
    ],
    previewMockData: {
      'Token': '614928',
      'Email': 'aarav.23cs001@student.shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reauthentication Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 28px;">
          <tr>
            <td>
              <h2 style="margin: 0 0 10px; color: #ffffff; font-size: 18px;">Confirm High-Security Action</h2>
              <p style="margin: 0 0 16px; font-size: 13px; color: #94a3b8;">
                Enter this 6-digit reauthentication code on SHOV to confirm your identity for <strong style="color: #cbd5e1;">{{ .Email }}</strong>:
              </p>
              <div style="background: #0f172a; border-radius: 12px; padding: 18px; text-align: center; border: 1px solid #475569; margin: 16px 0;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #38bdf8; font-family: monospace;">{{ .Token }}</span>
              </div>
              <p style="margin: 0; font-size: 11px; color: #64748b;">This code expires in 5 minutes.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    plainTextBody: `Your SHOV Reauthentication Code: {{ .Token }}

Enter this code to complete your high-security action.
Expires in 5 minutes.
© 2026 SHOV College Digital Identity System`
  },

  // 7. Password changed (Security Notification)
  {
    id: 'security-password-changed',
    name: 'Password changed',
    category: 'security',
    description: 'Security notification sent to the user immediately after their password has been changed.',
    supabasePath: 'Authentication → Email Templates → Security: Password changed',
    defaultSubject: 'Security Alert: Your SHOV Password Was Changed',
    supportedVariables: [
      { variable: '{{ .Email }}', description: 'User account email', example: 'aarav.23cs001@student.shov.college.edu' },
      { variable: '{{ .SiteURL }}', description: 'Campus portal origin URL', example: 'https://shov.college.edu' }
    ],
    previewMockData: {
      'Email': 'aarav.23cs001@student.shov.college.edu',
      'SiteURL': 'https://shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Security Alert: Password Changed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden;">
          <tr>
            <td style="padding: 24px; background: #7c2d12; text-align: center;">
              <span style="font-weight: 900; color: #fed7aa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                SECURITY NOTIFICATION
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; color: #ffffff;">Your Password Has Been Changed</h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                The password for your SHOV account (<strong style="color: #cbd5e1;">{{ .Email }}</strong>) was recently modified.
              </p>
              <div style="background: #0f172a; border-left: 4px solid #f97316; padding: 14px; border-radius: 8px; margin: 18px 0; font-size: 12px; color: #fed7aa;">
                <strong>Did you make this change?</strong><br>
                If you did this, you can safely disregard this message. If you did NOT change your password, please contact the campus cybersecurity administrator immediately.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    plainTextBody: `Security Notification: Your SHOV Password Was Changed

The password for {{ .Email }} was successfully updated.
If you did not make this change, please report it immediately to your campus administrator.
© 2026 SHOV College Digital Identity System`
  },

  // 8. Email address changed (Security Notification)
  {
    id: 'security-email-changed',
    name: 'Email address changed',
    category: 'security',
    description: 'Security notification sent to the previous email address when an email change has occurred.',
    supabasePath: 'Authentication → Email Templates → Security: Email address changed',
    defaultSubject: 'Security Alert: Your SHOV Account Email Was Changed',
    supportedVariables: [
      { variable: '{{ .Email }}', description: 'New active email address', example: 'aarav.new@shov.college.edu' },
      { variable: '{{ .OldEmail }}', description: 'Old previous email address', example: 'aarav.old@shov.college.edu' }
    ],
    previewMockData: {
      'Email': 'aarav.new@shov.college.edu',
      'OldEmail': 'aarav.old@shov.college.edu',
      'SiteURL': 'https://shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Email Changed Notification</title></head>
<body style="background: #0f172a; font-family: sans-serif; color: #f8fafc; padding: 24px;">
  <div style="max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 28px;">
    <h2 style="color: #ffffff; margin-top: 0;">Account Email Address Changed</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      Your SHOV account email has been changed from <strong style="color: #f87171;">{{ .OldEmail }}</strong> to <strong style="color: #34d399;">{{ .Email }}</strong>.
    </p>
    <p style="color: #64748b; font-size: 12px;">If you did not authorize this modification, contact campus proctor staff immediately.</p>
  </div>
</body>
</html>`,
    plainTextBody: `Security Alert: Your SHOV email was changed from {{ .OldEmail }} to {{ .Email }}.
If you did not authorize this, contact support immediately.`
  },

  // 9. Phone number changed (Security Notification)
  {
    id: 'security-phone-changed',
    name: 'Phone number changed',
    category: 'security',
    description: 'Security notification sent when the phone number tied to the account is modified.',
    supabasePath: 'Authentication → Email Templates → Security: Phone number changed',
    defaultSubject: 'Security Alert: Phone Number Updated on SHOV',
    supportedVariables: [
      { variable: '{{ .Phone }}', description: 'New phone number', example: '+91 98765 43210' },
      { variable: '{{ .OldPhone }}', description: 'Previous phone number', example: '+91 91234 56789' },
      { variable: '{{ .Email }}', description: 'User account email', example: 'aarav.23cs001@student.shov.college.edu' }
    ],
    previewMockData: {
      'Phone': '+91 98765 43210',
      'OldPhone': '+91 91234 56789',
      'Email': 'aarav.23cs001@student.shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Phone Changed</title></head>
<body style="background: #0f172a; font-family: sans-serif; color: #f8fafc; padding: 24px;">
  <div style="max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 28px;">
    <h2 style="color: #ffffff; margin-top: 0;">Phone Number Updated</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      The phone number associated with <strong style="color: #cbd5e1;">{{ .Email }}</strong> was updated from <strong style="color: #cbd5e1;">{{ .OldPhone }}</strong> to <strong style="color: #38bdf8;">{{ .Phone }}</strong>.
    </p>
  </div>
</body>
</html>`,
    plainTextBody: `Security Alert: Phone number for {{ .Email }} was changed from {{ .OldPhone }} to {{ .Phone }}.`
  },

  // 10. Sign-in method linked (Security Notification)
  {
    id: 'security-provider-linked',
    name: 'Sign-in method linked',
    category: 'security',
    description: 'Security notification sent when a new third-party sign-in provider (e.g. Google OAuth) is connected.',
    supabasePath: 'Authentication → Email Templates → Security: Sign-in method linked',
    defaultSubject: 'Security Notice: Sign-in method linked to SHOV',
    supportedVariables: [
      { variable: '{{ .Provider }}', description: 'Provider name (Google, GitHub, Apple, etc.)', example: 'google' },
      { variable: '{{ .Email }}', description: 'User account email', example: 'aarav.23cs001@student.shov.college.edu' }
    ],
    previewMockData: {
      'Provider': 'Google Workspace (OAuth)',
      'Email': 'aarav.23cs001@student.shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Sign-in Method Linked</title></head>
<body style="background: #0f172a; font-family: sans-serif; color: #f8fafc; padding: 24px;">
  <div style="max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 28px;">
    <h2 style="color: #ffffff; margin-top: 0;">New Sign-In Method Connected</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      The provider <strong style="color: #38bdf8; text-transform: capitalize;">{{ .Provider }}</strong> has been linked to your SHOV account (<strong style="color: #cbd5e1;">{{ .Email }}</strong>).
    </p>
  </div>
</body></html>`,
    plainTextBody: `Security Notice: {{ .Provider }} has been linked as a sign-in method for {{ .Email }}.`
  },

  // 11. Sign-in method removed (Security Notification)
  {
    id: 'security-provider-removed',
    name: 'Sign-in method removed',
    category: 'security',
    description: 'Security notification sent when an authentication provider is disconnected from the account.',
    supabasePath: 'Authentication → Email Templates → Security: Sign-in method removed',
    defaultSubject: 'Security Notice: Sign-in method removed from SHOV',
    supportedVariables: [
      { variable: '{{ .Provider }}', description: 'Removed provider name', example: 'google' },
      { variable: '{{ .Email }}', description: 'User account email', example: 'aarav.23cs001@student.shov.college.edu' }
    ],
    previewMockData: {
      'Provider': 'Google Workspace (OAuth)',
      'Email': 'aarav.23cs001@student.shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Sign-in Method Removed</title></head>
<body style="background: #0f172a; font-family: sans-serif; color: #f8fafc; padding: 24px;">
  <div style="max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 28px;">
    <h2 style="color: #ffffff; margin-top: 0;">Sign-In Method Disconnected</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      The provider <strong style="color: #f87171; text-transform: capitalize;">{{ .Provider }}</strong> was unlinked from your SHOV account (<strong style="color: #cbd5e1;">{{ .Email }}</strong>).
    </p>
  </div>
</body></html>`,
    plainTextBody: `Security Notice: {{ .Provider }} was removed as a sign-in method for {{ .Email }}.`
  },

  // 12. Verification method added (Security Notification)
  {
    id: 'security-mfa-added',
    name: 'Verification method added',
    category: 'security',
    description: 'Security notification sent when an MFA factor (Authenticator App / TOTP or SMS) is configured.',
    supabasePath: 'Authentication → Email Templates → Security: Verification method added',
    defaultSubject: 'Security Notice: Multi-Factor Authentication Method Added',
    supportedVariables: [
      { variable: '{{ .FactorType }}', description: 'Factor type (totp, phone, sms)', example: 'totp' },
      { variable: '{{ .Email }}', description: 'User account email', example: 'aarav.23cs001@student.shov.college.edu' }
    ],
    previewMockData: {
      'FactorType': 'TOTP Authenticator App (Google/Microsoft Auth)',
      'Email': 'aarav.23cs001@student.shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>MFA Method Added</title></head>
<body style="background: #0f172a; font-family: sans-serif; color: #f8fafc; padding: 24px;">
  <div style="max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 28px;">
    <h2 style="color: #ffffff; margin-top: 0;">Two-Factor Verification Added</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      A new multi-factor authentication method (<strong style="color: #34d399;">{{ .FactorType }}</strong>) was added to your SHOV account (<strong style="color: #cbd5e1;">{{ .Email }}</strong>).
    </p>
  </div>
</body></html>`,
    plainTextBody: `Security Notice: MFA verification factor ({{ .FactorType }}) was added to your SHOV account ({{ .Email }}).`
  },

  // 13. Verification method removed (Security Notification)
  {
    id: 'security-mfa-removed',
    name: 'Verification method removed',
    category: 'security',
    description: 'Security alert sent when a multi-factor authentication method is removed from the user account.',
    supabasePath: 'Authentication → Email Templates → Security: Verification method removed',
    defaultSubject: 'Security Alert: Multi-Factor Authentication Removed',
    supportedVariables: [
      { variable: '{{ .FactorType }}', description: 'Removed factor type', example: 'totp' },
      { variable: '{{ .Email }}', description: 'User account email', example: 'aarav.23cs001@student.shov.college.edu' }
    ],
    previewMockData: {
      'FactorType': 'TOTP Authenticator App (Google/Microsoft Auth)',
      'Email': 'aarav.23cs001@student.shov.college.edu'
    },
    htmlBody: `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>MFA Method Removed</title></head>
<body style="background: #0f172a; font-family: sans-serif; color: #f8fafc; padding: 24px;">
  <div style="max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 28px;">
    <h2 style="color: #ffffff; margin-top: 0;">Two-Factor Verification Removed</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      The authentication factor <strong style="color: #f87171;">{{ .FactorType }}</strong> was removed from your SHOV account (<strong style="color: #cbd5e1;">{{ .Email }}</strong>).
    </p>
  </div>
</body></html>`,
    plainTextBody: `Security Alert: MFA verification factor ({{ .FactorType }}) was removed from your SHOV account ({{ .Email }}).`
  }
];

// Helper to interpolate template variables for live rendering
export function renderEmailPreview(
  templateContent: string,
  variables: Record<string, string>
): string {
  let output = templateContent;
  Object.entries(variables).forEach(([key, val]) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\{\\{\\s*\\.${escapedKey}\\s*\\}\\}`, 'g');
    output = output.replace(regex, val);
  });
  return output;
}
