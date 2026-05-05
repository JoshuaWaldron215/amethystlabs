// Vercel Serverless Function — POST /api/subscribe-aqeel
// 1) Adds contact to Resend (single-audience model)
// 2) Sends Aqeel's "5 Claude Prompts" delivery email
//
// Uses RESEND_API_KEY_AQEEL (separate key from the main playbook flow)

const FROM_EMAIL = 'Aqeel at Amethyst Labs <support@amethystlabs.ai>';

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}

const PROMPTS_EMAIL_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your 5 Claude Prompts</title>
</head>
<body style="margin:0;padding:0;background:#1A0E2E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1A0E2E;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="padding-bottom:16px;">
            <span style="font-family:'Georgia',serif;font-style:italic;font-size:18px;color:#F2E8D0;letter-spacing:-0.01em;">Amethyst Labs</span>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.35);"></td></tr>

        <!-- OPENER -->
        <tr>
          <td style="padding:36px 0 0;">
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#F2E8D0;">Hey — you asked for the prompts. Here they are. Copy, paste, ship.</p>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#C8B89A;">I'm Aqeel — builder at Amethyst Labs. I write Claude prompts that go straight into client production: lending platforms, CRMs, event ops, realtor tools. These five are the ones I reach for most.</p>
            <p style="margin:0 0 40px;font-size:15px;line-height:1.7;color:#C8B89A;">Each one is structured to give you copy-pasteable output (JSON when useful) and is built around real problems clients pay us to solve. Tune them to your domain — they get sharper fast.</p>
          </td>
        </tr>

        <!-- SECTION HEADING -->
        <tr>
          <td style="padding-bottom:12px;">
            <span style="font-family:'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#8A7B5C;">The 5 prompts:</span>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.2);"></td></tr>

        <!-- PROMPT 01 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">01</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">Deal intake → structured brief</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">Built for a mortgage brokerage. Reads raw deal-intake form data and returns a clean structured brief in under 3 seconds. Replaced ~20 minutes of manual work per deal.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:14px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#C8B89A;font-family:'Courier New',monospace;">Extract structured data from this deal intake. Output JSON with: loan_amount, loan_to_value_pct, dscr, property_type, risk_flags (array of genuine concerns only — don't pad), summary (2 sentences, plain English, what this deal is). Be conservative on risk flags. <br/><br/>Intake: {form_data}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">Result:</span> <span style="color:#D4A857;">~20 min saved per deal.</span></p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.1);"></td></tr>

        <!-- PROMPT 02 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">02</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">Lender / vendor matching with reasoning</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">Most matching is just filters. This one does filters plus reasoning — explains why each candidate fits or doesn't. Pattern works for any "match one record against a database" problem.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:14px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#C8B89A;font-family:'Courier New',monospace;">Score each candidate against this deal. For each, output: name, fit_score (1–10), one-sentence reason it fits or doesn't, confidence (low/med/high). Sort descending by fit_score. Don't include candidates below 4. <br/><br/>Deal: {deal}<br/>Candidates: {candidates}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">Result:</span> <span style="color:#D4A857;">4–5× match accuracy</span> vs. raw filter logic.</p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.1);"></td></tr>

        <!-- PROMPT 03 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">03</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">Lead qualifier from form submission</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">Built for an event production company. Reads raw form data, classifies temperature, drafts a reply. Owner gets a qualified brief in their inbox 60 seconds after submission.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:14px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#C8B89A;font-family:'Courier New',monospace;">Read this contact form. Output: temperature (hot/warm/cold), one-line summary, recommended_action, suggested_reply (3–5 sentences, warm tone, references one specific detail from their submission). No corporate boilerplate. <br/><br/>Form: {form_data}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">Result:</span> <span style="color:#D4A857;">60-second qualified brief</span> from form to inbox.</p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.1);"></td></tr>

        <!-- PROMPT 04 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">04</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">CRM note → follow-up message writer</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">A realtor had months of CRM notes per lead but was writing follow-ups from scratch. This prompt reads the full note history and writes a follow-up that references real specifics. Tested across 3 realtors and 80+ leads — never flagged as AI-written.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:14px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#C8B89A;font-family:'Courier New',monospace;">Read these notes for one contact in chronological order. Write a follow-up that: (1) references one specific detail from the notes, (2) addresses their stated hesitation or timeline if mentioned, (3) sounds human — no AI tells, no "I hope this email finds you well", (4) is under 100 words. <br/><br/>Notes: {notes}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">Result:</span> <span style="color:#D4A857;">80+ leads tested, zero AI flags.</span></p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.1);"></td></tr>

        <!-- PROMPT 05 -->
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-style:italic;font-size:52px;color:#D4A857;line-height:1;">05</p>
            <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">Pre-call client research brief</p>
            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#C8B89A;">I run this before every sales call. 90 seconds of input, walk in knowing more about their problem than they expect anyone to know first meeting.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:14px 16px;background:rgba(242,232,208,0.06);">
                  <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.14em;color:#8A7B5C;">Prompt</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#C8B89A;font-family:'Courier New',monospace;">You're prepping me for a sales call. Given the company info below, output: likely_pain_points (3 bullets, specific to their industry/stage), questions_to_open_with (3, that show I get their world), good_fit_signals (what makes them ideal for our work), red_flags (what to watch for). <br/><br/>Company: {company_info}<br/>Context: {context}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 32px;font-size:13px;font-family:'Courier New',monospace;color:#8A7B5C;"><span style="color:#F2E8D0;">Result:</span> <span style="color:#D4A857;">90-second prep</span> that changes how a first meeting goes.</p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(212,168,87,0.2);"></td></tr>

        <!-- HONEST NOTES -->
        <tr>
          <td style="padding:32px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="3" style="background:#D4A857;border-radius:2px;">&nbsp;</td>
                <td style="padding:18px 20px;background:rgba(242,232,208,0.05);">
                  <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#F2E8D0;letter-spacing:-0.01em;">A few honest notes:</p>
                  <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#C8B89A;">· Prompts #1, #3, #5 you can run in Claude.ai right now — paste in your data, hit go.</p>
                  <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#C8B89A;">· Prompts #2 and #4 work best wired into your app via the Anthropic API. Most are under $0.01 per run.</p>
                  <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#C8B89A;">· The placeholders ({form_data}, {notes}, etc.) are where you paste your inputs. Replace with real data.</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#C8B89A;">· If you want any of this wired into your CRM, app, or workflow properly — that's what Amethyst Labs does.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- WHAT'S NEXT -->
        <tr>
          <td style="padding:40px 0 0;">
            <p style="margin:0 0 16px;font-size:11px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:0.18em;color:#8A7B5C;">What's next:</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:14px 0;border-bottom:1px solid rgba(212,168,87,0.1);">
                  <span style="font-size:14px;color:#C8B89A;">Got a prompt question or want to riff on a use case? </span><a href="mailto:support@amethystlabs.ai" style="color:#D4A857;text-decoration:none;font-size:14px;">Reply to this email →</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0;border-bottom:1px solid rgba(212,168,87,0.1);">
                  <span style="font-size:14px;color:#C8B89A;">Want this wired into your stack? </span><a href="https://calendly.com/sadeq-tryaccelerators/30min" style="color:#D4A857;text-decoration:none;font-size:14px;">Book a 20-min call →</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0;">
                  <span style="font-size:14px;color:#C8B89A;">I post prompt breakdowns and client builds. </span><a href="https://x.com/BuiltByAqeel" style="color:#D4A857;text-decoration:none;font-size:14px;">Follow @BuiltByAqeel →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SIGN-OFF -->
        <tr>
          <td style="padding:40px 0 0;border-top:1px solid rgba(212,168,87,0.15);">
            <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:#F2E8D0;">Now go ship something real.</p>
            <p style="margin:0 0 24px;font-family:'Georgia',serif;font-style:italic;font-size:16px;color:#D4A857;">— Aqeel</p>
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

  const apiKey = process.env.RESEND_API_KEY_AQEEL;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const { email } = body;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (email.length > 320) {
    return res.status(400).json({ error: 'Email too long' });
  }

  try {
    // 1) Add to Resend Contacts (single-audience)
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
      if (contactResp.status !== 409) {
        console.error('Resend contact error', contactResp.status, detail);
      }
    }

    // 2) Send the prompts delivery email
    const emailResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        reply_to: 'support@amethystlabs.ai',
        subject: '5 Claude prompts that run my client projects',
        html: PROMPTS_EMAIL_HTML,
      }),
    });

    if (!emailResp.ok) {
      const detail = await emailResp.json().catch(() => ({}));
      console.error('Resend send error', emailResp.status, detail);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Subscribe-aqeel handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
