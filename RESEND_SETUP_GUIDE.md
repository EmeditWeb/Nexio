# Resend + Supabase Email Authentication Setup Guide

> Complete guide for integrating **Resend** as the SMTP provider for **Supabase Auth** in the **Nexio** chat app. Includes SMTP configuration, 4 branded email templates, and Supabase auth settings.

---

## Part 1: Resend SMTP Setup

### Step 1 — Create a Resend Account

1. Go to [resend.com](https://resend.com) and click **"Get Started"**
2. Sign up with your GitHub account or email
3. Verify your email if prompted

### Step 2 — Get Your API Key

1. In the Resend Dashboard, go to **API Keys** (left sidebar)
2. Click **"Create API Key"**
3. Name it `Nexio Supabase` and select **Sending access** → Full access
4. Copy the API key (starts with `re_...`) — **you'll only see this once**

### Step 3 — Verify a Sender Domain *(Recommended for production)*

> [!TIP]
> For **testing**, you can skip this and use Resend's shared domain: `onboarding@resend.dev`. For **production**, you must verify your own domain.

1. In Resend Dashboard → **Domains** → **Add Domain**
2. Enter your domain (e.g., `nexio.app` or `yourdomain.com`)
3. Resend will show you **DNS records** to add:
   - **MX record** — for receiving bounces
   - **TXT record (SPF)** — authorizes Resend to send on your behalf
   - **CNAME records (DKIM)** — for email authentication
4. Add these DNS records in your domain registrar (Cloudflare, Namecheap, etc.)
5. Click **"Verify"** in Resend — verification typically takes 5–30 minutes

### Step 4 — Configure SMTP in Supabase

1. Go to **Supabase Dashboard** → your project
2. Navigate to **Project Settings** → **Authentication** (left sidebar)
3. Scroll to **SMTP Settings** and toggle **"Enable Custom SMTP"** ON
4. Enter:

| Setting | Value |
|---------|-------|
| **Sender email** | `noreply@yourdomain.com` (or `onboarding@resend.dev` for testing) |
| **Sender name** | `Nexio` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | Your Resend API key (`re_...`) |

5. Click **Save**

> [!IMPORTANT]
> The sender email **must** match a verified domain in Resend, or use `onboarding@resend.dev` for testing.

### Step 5 — Test the Setup

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **"Invite User"** and enter a test email
3. Check if the email arrives in the inbox
4. If it goes to spam, your domain DNS records may need time to propagate

---

## Part 2: Supabase Auth Settings

Navigate to **Supabase Dashboard** → **Authentication** → **Providers** → **Email**

| Setting | Value |
|---------|-------|
| **Enable Email Signup** | ✅ ON |
| **Confirm email** | ✅ ON |
| **Double confirm email changes** | ✅ ON |
| **Secure email change** | ✅ ON |

Navigate to **Authentication** → **URL Configuration**

| Setting | Value |
|---------|-------|
| **Site URL** | `http://localhost:3000` (dev) or `https://nexio.yourdomain.com` (prod) |
| **Redirect URLs** | `http://localhost:3000/auth/callback`, `https://nexio.yourdomain.com/auth/callback` |

Navigate to **Authentication** → **Email Templates** → paste the templates below for each type.

---

## Part 3: Email Templates

> Paste each template into the corresponding section in  **Supabase Dashboard** → **Authentication** → **Email Templates**

---

### Template 1: Confirm Signup

**Subject:** `Verify your Nexio account`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Nexio account</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F2F5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1877F2 0%,#0D5BBF 100%);padding:40px 32px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">nexio</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Connect · Chat · Share</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C1E21;">Welcome to Nexio! 🎉</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#65676B;">
                You're one step away from connecting with friends and the world around you. Verify your email address to activate your account and start messaging.
              </p>

              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;padding:14px 40px;background:#1877F2;color:#FFFFFF;text-decoration:none;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.3px;box-shadow:0 2px 8px rgba(24,119,242,0.35);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0F2F5;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;line-height:1.5;color:#65676B;">
                      🔒 This link expires in <strong style="color:#1C1E21;">24 hours</strong>. For security, only click links from emails you expect.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #E4E6EB;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#65676B;">
                If you didn't create a Nexio account, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:12px;color:#BCC0C4;">
                Nexio · Privacy Policy · Help Center
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Template 2: Magic Link / Login

**Subject:** `Your Nexio login link`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Nexio login link</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F2F5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1877F2 0%,#0D5BBF 100%);padding:40px 32px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">nexio</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Connect · Chat · Share</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C1E21;">Here's your login link 🔑</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#65676B;">
                Click the button below to securely log in to your Nexio account. No password needed — this link does it all.
              </p>

              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;padding:14px 40px;background:#1877F2;color:#FFFFFF;text-decoration:none;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.3px;box-shadow:0 2px 8px rgba(24,119,242,0.35);">
                      Log In to Nexio
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0F2F5;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;line-height:1.5;color:#65676B;">
                      ⏱️ This link expires in <strong style="color:#1C1E21;">1 hour</strong> and can only be used once.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #E4E6EB;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#65676B;">
                If you didn't request this login link, please ignore this email. Your account is safe.
              </p>
              <p style="margin:0;font-size:12px;color:#BCC0C4;">
                Nexio · Privacy Policy · Help Center
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Template 3: Password Reset

**Subject:** `Reset your Nexio password`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Nexio password</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F2F5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#E74C3C 0%,#C0392B 100%);padding:40px 32px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">nexio</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Password Reset Request</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C1E21;">Reset your password 🔐</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#65676B;">
                We received a request to reset the password for your Nexio account. Click the button below to choose a new password.
              </p>

              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;padding:14px 40px;background:#E74C3C;color:#FFFFFF;text-decoration:none;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.3px;box-shadow:0 2px 8px rgba(231,76,60,0.35);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF5F5;border-radius:10px;border:1px solid #FECACA;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;line-height:1.5;color:#65676B;">
                      ⚠️ This link expires in <strong style="color:#1C1E21;">1 hour</strong>. If you didn't request a password reset, your account is safe — simply ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #E4E6EB;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#65676B;">
                If you did not make this request, no action is needed. Your password will remain unchanged.
              </p>
              <p style="margin:0;font-size:12px;color:#BCC0C4;">
                Nexio · Privacy Policy · Help Center
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Template 4: Email Change Confirmation

**Subject:** `Confirm your new Nexio email`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your new Nexio email</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F2F5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1877F2 0%,#0D5BBF 100%);padding:40px 32px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">nexio</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Email Change Confirmation</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1C1E21;">Confirm your new email ✉️</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#65676B;">
                You requested to change the email address associated with your Nexio account. Click the button below to confirm this change.
              </p>

              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;padding:14px 40px;background:#1877F2;color:#FFFFFF;text-decoration:none;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.3px;box-shadow:0 2px 8px rgba(24,119,242,0.35);">
                      Confirm New Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E1;border-radius:10px;border:1px solid #FFE082;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;line-height:1.5;color:#65676B;">
                      🛡️ If you did not request this email change, please <strong style="color:#1C1E21;">secure your account immediately</strong> by resetting your password.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #E4E6EB;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#65676B;">
                If you didn't request this change, ignore this email and your email will remain the same.
              </p>
              <p style="margin:0;font-size:12px;color:#BCC0C4;">
                Nexio · Privacy Policy · Help Center
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Part 4: Testing Checklist

After completing the setup, test each flow:

- [ ] **Signup** → Receive "Verify your Nexio account" email → Click link → Redirected to `/auth/callback` → Auto-login
- [ ] **Magic Link** → Receive login email → Click link → Logged in
- [ ] **Password Reset** → Receive reset email → Click link → Enter new password
- [ ] **Email Change** → Receive confirmation → Click link → Email updated
- [ ] Test that emails arrive in inbox (not spam)
- [ ] Test on mobile email clients
- [ ] Test with expired link → Shows appropriate error

