// Vercel Serverless Function — POST /api/subscribe
// Adds email to Beehiiv list via the publication's public form endpoint.
// Avoids the API+identity-verification path by scraping a fresh visit_token
// from the publication's subscribe page and replaying its session cookies.

const PUBLICATION_HOST = 'joshuas-newsletter-85f4fd.beehiiv.com';
const SUBSCRIBE_PAGE_URL = `https://${PUBLICATION_HOST}/`;
const SUBSCRIBE_POST_URL = `https://${PUBLICATION_HOST}/create`;

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}

// Pull the visit_token out of the rendered subscribe page HTML.
function extractVisitToken(html) {
  const m = html.match(/name="visit_token"[^>]*value="([^"]+)"/i)
    || html.match(/value="([^"]+)"[^>]*name="visit_token"/i);
  return m ? m[1] : '';
}

// Concatenate Set-Cookie headers from initial GET into a Cookie header for replay.
function cookiesFromResponse(resp) {
  const raw = resp.headers.raw?.()['set-cookie'] || [];
  if (raw.length) {
    return raw.map(c => c.split(';')[0]).join('; ');
  }
  // Node 18 fetch returns a single comma-joined string from .get('set-cookie').
  // We split conservatively on `, ` only when followed by another cookie-name=.
  const single = resp.headers.get('set-cookie');
  if (!single) return '';
  return single
    .split(/,(?=\s*[A-Za-z0-9_\-]+=)/)
    .map(c => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
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
    // 1) Fetch the subscribe page to get a fresh visit_token + session cookies.
    const pageResp = await fetch(SUBSCRIBE_PAGE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!pageResp.ok) {
      console.error('Beehiiv page fetch failed', pageResp.status);
      return res.status(502).json({ error: 'Subscribe service unavailable' });
    }

    const html = await pageResp.text();
    const visitToken = extractVisitToken(html);
    const cookieHeader = cookiesFromResponse(pageResp);

    // 2) POST the subscription with the harvested token + cookies.
    const formData = new URLSearchParams({
      email,
      subscribe_error_message: 'Oops, something went wrong.',
      subscribe_success_message: 'Subscribed!',
      ref: ref || '',
      bhba: '',
      visit_token: visitToken,
      premium_offer_id: '',
      fallback_path: '/',
      is_js_enabled: 'true',
      sent_from_orchid: 'true',
      signup_flow_id: '',
      automation_ids: '',
      double_opt: 'false',
    });

    const subResp = await fetch(SUBSCRIBE_POST_URL, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml',
        'Origin': `https://${PUBLICATION_HOST}`,
        'Referer': SUBSCRIBE_PAGE_URL,
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: formData.toString(),
    });

    // Beehiiv typically responds with a 302 redirect on success (to a thank-you
    // path) or a 4xx/redirect-with-error on failure. Anything in [200,400) is OK.
    if (subResp.status >= 200 && subResp.status < 400) {
      return res.status(200).json({ ok: true });
    }

    const detail = await subResp.text().catch(() => '');
    console.error('Beehiiv subscribe failed', subResp.status, detail.slice(0, 400));
    return res.status(502).json({ error: 'Subscription failed' });
  } catch (err) {
    console.error('Subscribe handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
