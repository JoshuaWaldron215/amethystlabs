// Vercel Serverless Function — POST /api/subscribe
// 1) Adds contact to a Resend Audience (set RESEND_AUDIENCE_ID in Vercel env vars)
// 2) Sends the playbook delivery email to the subscriber

const FROM_EMAIL = 'Josh at Amethyst Labs <support@amethystlabs.ai>';

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}

const PLAYBOOK_EMAIL_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your AI Automation Playbook</title>
</head>
<body style="margin:0;padding:0;background:#1A0E2E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1A0E2E;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- 1. HEADER -->
        <tr>
          <td style="padding-bottom:16px;">
            <span style="font-family:'Georgia',serif;font-style:italic;font-size:18px;color:#F2E8D0;letter-spacing:-0.01em;">Amethyst Labs</span>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.35);"></td></tr>

        <!-- 2. PERSONAL OPENER -->
        <tr>
          <td style="padding:36px 0 0;">
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#F2E8D0;">Hey — you asked for the playbook. Here it is. No paywall, no drip sequence, no upsell hiding at the end.</p>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#C8B89A;">We're Amethyst Labs — three builders in Philadelphia. We make custom CRMs, AI automations, and the internal tools that make small teams run like big ones.</p>
            <p style="margin:0 0 40px;font-size:15px;line-height:1.7;color:#C8B89A;">These five automations are the ones I actually recommend first. They're cheap to run, fast to set up, and the ROI math is easy to defend to anyone who asks.</p>
          </td>
        </tr>

        <!-- 3. SECTION HEADING -->
        <tr>
          <td style="padding-bottom:12px;">
            <span style="font-family:'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#8A7B5C;">The 5 automations:</span>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.2);"></td></tr>

        <!-- 4a. AUTOMATION 01 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">01</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">Inbox triage agent</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">An AI agent that reads every inbound email, categorizes it, and drafts replies for the routine ones. You only see what actually needs you.</p>
            <p style="margin:0 0 10px;font-size:12px;font-family:'Courier New',monospace;color:#C8B89A;"><span style="color:#F2E8D0;font-weight:600;">Stack:</span> Gmail + Make.com + Claude API</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:12px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt seed</p>
                  <p style="margin:0;font-size:13px;line-height:1.65;color:#C8B89A;font-style:italic;">"Categorize this email as: urgent-reply, delegate, archive, or read-later. If routine, draft a reply in my tone. My tone: direct, no filler words, sign off as Josh."</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">ROI:</span> <span style="color:#D4A857;">~6 hrs/week recovered</span> — at $100/hr that's $2,400/mo.</p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.1);"></td></tr>

        <!-- 4b. AUTOMATION 02 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">02</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">Lead enrichment + qualification</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">When a lead fills your form, it auto-pulls their company data, scores them against your ICP, and routes hot ones to you with a one-line brief. Cold ones go to nurture.</p>
            <p style="margin:0 0 10px;font-size:12px;font-family:'Courier New',monospace;color:#C8B89A;"><span style="color:#F2E8D0;font-weight:600;">Stack:</span> Tally + Apollo.io + Make.com + Slack</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:12px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt seed</p>
                  <p style="margin:0;font-size:13px;line-height:1.65;color:#C8B89A;font-style:italic;">"Score this lead 1–10 for fit: boutique dev shop, AI/automation projects, SMB clients, $15k–$80k budgets. Output: score, one reason, one suggested opening line."</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">ROI:</span> <span style="color:#D4A857;">2× pipeline response speed</span> — stops chasing leads who were never going to buy.</p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.1);"></td></tr>

        <!-- 4c. AUTOMATION 03 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">03</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">Meeting notes → CRM updates</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">Every sales call auto-transcribes. An agent pulls out action items, deal stage, and next steps — and writes them directly into your CRM. Nothing gets lost in a notes doc.</p>
            <p style="margin:0 0 10px;font-size:12px;font-family:'Courier New',monospace;color:#C8B89A;"><span style="color:#F2E8D0;font-weight:600;">Stack:</span> Granola or Fathom → Make.com → HubSpot/Pipedrive</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:12px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt seed</p>
                  <p style="margin:0;font-size:13px;line-height:1.65;color:#C8B89A;font-style:italic;">"From this transcript: (1) current deal stage, (2) top 3 action items with owners, (3) next meeting date if mentioned, (4) any budget or timeline signals. Output JSON."</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">ROI:</span> <span style="color:#D4A857;">Zero manual CRM updates</span> — reps stay in the call, not in the dashboard.</p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.1);"></td></tr>

        <!-- 4d. AUTOMATION 04 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">04</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">Customer support deflection</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">A knowledge-base-grounded agent that answers your top 20 support questions before a ticket is opened. Hands off cleanly when it hits the edge of what it knows.</p>
            <p style="margin:0 0 10px;font-size:12px;font-family:'Courier New',monospace;color:#C8B89A;"><span style="color:#F2E8D0;font-weight:600;">Stack:</span> Intercom or Crisp + Claude/OpenAI Assistants + your docs</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:12px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt seed</p>
                  <p style="margin:0;font-size:13px;line-height:1.65;color:#C8B89A;font-style:italic;">"Answer only from the provided documentation. If you can't answer with confidence, say: 'Let me get a human to help — one moment.' Never guess. Never make up a policy."</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">ROI:</span> <span style="color:#D4A857;">−40% ticket volume</span> — one setup, runs indefinitely.</p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.1);"></td></tr>

        <!-- 4e. AUTOMATION 05 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">05</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">Weekly ops digest</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">One agent, scheduled for Monday morning. Pulls from Stripe, Linear, Google Analytics — whatever you care about — and lands a 5-bullet summary in your inbox or Slack.</p>
            <p style="margin:0 0 10px;font-size:12px;font-family:'Courier New',monospace;color:#C8B89A;"><span style="color:#F2E8D0;font-weight:600;">Stack:</span> Make.com (scheduled) → your APIs → Claude → Slack or email</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:12px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt seed</p>
                  <p style="margin:0;font-size:13px;line-height:1.65;color:#C8B89A;font-style:italic;">"Summarize in exactly 5 bullets: [metric]: [number] ([vs last week: +/-X%]). Flag anything that moved more than 20%. Close with one sentence: 'Focus this week: [highest-leverage action].'"</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 32px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">ROI:</span> <span style="color:#D4A857;">5-minute Monday read</span> — replaces the dashboard you keep meaning to check.</p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.2);"></td></tr>

        <!-- 5. HONEST NOTES -->
        <tr>
          <td style="padding:32px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:18px 20px;background:rgba(242,232,208,0.05);">
                  <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">A few honest notes:</p>
                  <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#C8B89A;">· You don't need to be technical. Every automation has a no-code path — Make, n8n, or Zapier. If you can copy-paste, you can ship #1, #3, and #5 this weekend.</p>
                  <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#C8B89A;">· Most of these run on tools you already pay for. Total new cost to run all five is usually under $50/month.</p>
                  <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#C8B89A;">· The prompt seeds are starting points. Every business is different. Tune them — they get sharper fast.</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#C8B89A;">· If any of this makes you think "we should just have someone build this right" — that's exactly what Amethyst Labs does.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 6. WHAT'S NEXT -->
        <tr>
          <td style="padding:40px 0 0;">
            <p style="margin:0 0 16px;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.18em;color:#8A7B5C;">What's next:</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:14px 0;border-bottom:1px solid rgba(212,168,87,0.1);">
                  <span style="font-size:14px;color:#C8B89A;">Got a question or want to nerd out on your stack? </span><a href="mailto:josh@amethystlabs.ai" style="color:#D4A857;text-decoration:none;font-size:14px;">Reply to this email →</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0;border-bottom:1px solid rgba(212,168,87,0.1);">
                  <span style="font-size:14px;color:#C8B89A;">Want to talk through your specific situation? </span><a href="https://calendly.com/sadeq-tryaccelerators/30min" style="color:#D4A857;text-decoration:none;font-size:14px;">Book a 20-min call →</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0;">
                  <span style="font-size:14px;color:#C8B89A;">I share builds and process live as it happens. </span><a href="https://x.com/BuiltByJuice" style="color:#D4A857;text-decoration:none;font-size:14px;">Follow @BuiltByJuice →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 7. SIGN-OFF -->
        <tr>
          <td style="padding:40px 0 0;border-top:1px solid rgba(212,168,87,0.15);margin-top:8px;">
            <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:#F2E8D0;">Now go build something that pays for itself.</p>
            <p style="margin:0 0 24px;font-family:'Georgia',serif;font-style:italic;font-size:16px;color:#D4A857;">— Josh</p>
            <p style="margin:0;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.12em;color:#8A7B5C;line-height:1.9;">Amethyst Labs · Philadelphia<br/><a href="https://amethystlabs.ai" style="color:#8A7B5C;text-decoration:none;">amethystlabs.ai</a></p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;

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
  const { email, ref = '' } = body;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (email.length > 320) {
    return res.status(400).json({ error: 'Email too long' });
  }

  try {
    // 1) Add to Resend account-level Contacts list (single audience model)
    const contactResp = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
      }),
    });

    if (!contactResp.ok) {
      const detail = await contactResp.json().catch(() => ({}));
      // 409 = contact already exists — that's fine, still send the email
      if (contactResp.status !== 409) {
        console.error('Resend contact error', contactResp.status, detail);
      }
    }

    // 2) Send playbook delivery email
    const emailResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        reply_to: 'josh@amethystlabs.ai',
        subject: '5 AI automations that pay for themselves in 30 days',
        html: PLAYBOOK_EMAIL_HTML,
      }),
    });

    if (!emailResp.ok) {
      const detail = await emailResp.json().catch(() => ({}));
      console.error('Resend send error', emailResp.status, detail);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Subscribe handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
