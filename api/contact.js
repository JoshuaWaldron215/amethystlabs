// Vercel Serverless Function — POST /api/contact
// Sends Project Brief submissions to support@amethystlabs.ai via Resend.

const TO_EMAIL = 'support@amethystlabs.ai';
const FROM_EMAIL = 'Amethyst Labs <onboarding@resend.dev>';

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const { name, email, company, projectType, budget, problem, website } = body;

  // Honeypot — bots fill hidden fields, humans don't
  if (website) return res.status(200).json({ ok: true });

  if (!name || !email || !projectType || !problem) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (name.length > 200 || problem.length > 5000) {
    return res.status(400).json({ error: 'Field too long' });
  }

  const subject = `New brief — ${name}${company ? ` (${company})` : ''}`;
  const html = `
    <h2 style="font-family:system-ui;color:#3F2B66;">New Project Brief</h2>
    <table style="font-family:system-ui;font-size:14px;line-height:1.6;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;color:#666;"><b>Name</b></td><td>${escapeHtml(name)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#666;"><b>Email</b></td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#666;"><b>Company</b></td><td>${escapeHtml(company || '—')}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#666;"><b>Needs</b></td><td>${escapeHtml(projectType)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#666;"><b>Budget</b></td><td>${escapeHtml(budget || '—')}</td></tr>
    </table>
    <h3 style="font-family:system-ui;color:#3F2B66;margin-top:24px;">Problem</h3>
    <p style="font-family:system-ui;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(problem)}</p>
  `;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Resend error', resp.status, detail);
      return res.status(502).json({ error: 'Email send failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
