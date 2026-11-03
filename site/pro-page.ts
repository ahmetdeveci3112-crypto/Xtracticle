import { GITHUB, type FAQ, type Lang, type SitePage } from './blocks';

/**
 * /pro (and /tr/pro, /es/pro, …): Xtracticle Pro — license-key based paid tier sold through Polar.sh.
 *
 * The static page cannot read Worker variables, so the price buttons start disabled and a small
 * inline script fills their links from GET /api/pro/config (which also says whether Pro is on sale
 * yet). The same script runs the "enter your license key" form against POST /api/pro/activate and
 * tells the React app (window event `xt:pro`) when a key was accepted. Copy per language lives in
 * site/l10n/<lang>/pro.ts; English is below.
 */

export interface ProCopy {
  title: string;
  description: string;
  h1: string;
  sub: string;
  /** Short footer label. */
  nav: string;
  /** Opening paragraph (HTML allowed). */
  pitch: string;
  featuresH2: string;
  /** Feature list items (HTML allowed). */
  features: string[];
  pricingH2: string;
  monthly: string;
  yearly: string;
  lifetime: string;
  /** Unit suffixes shown after the amount. */
  perMonth: string;
  perYear: string;
  once: string;
  monthlyNote: string;
  yearlyNote: string;
  lifetimeNote: string;
  /** Button label on the three cards. */
  buy: string;
  /** Shown instead of working buttons while Pro is not on sale yet. */
  soon: string;
  /** Under the cards: who handles payment and how the key arrives. */
  checkoutHint: string;
  keyH2: string;
  keyIntro: string;
  keyLabel: string;
  activate: string;
  /** Form messages. */
  msgWorking: string;
  msgOk: string;
  msgAlready: string;
  msgInvalid: string;
  msgLimit: string;
  msgUpstream: string;
  msgUnavailable: string;
  msgRate: string;
  msgNetwork: string;
  /** Notice shown when the visitor returns from checkout (?status=success). */
  success: string;
  faqH2?: string;
  faq: FAQ[];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PATHS: Record<Lang, string> = { en: '/pro', tr: '/tr/pro', es: '/es/pro', pt: '/pt/pro', ja: '/ja/pro', zh: '/zh/pro', ar: '/ar/pro' };
export const proPath = (lang: Lang) => PATHS[lang];

const PRICES = { monthly: 5, yearly: 36, lifetime: 59 };

/**
 * Plain ES5, no template strings, ASCII only: it is inlined into every language's page.
 * All visible text comes from data attributes, so the script itself needs no translation.
 */
const SCRIPT = `(function(){
var g=function(n,p){try{if(window.gtag)window.gtag('event',n,p||{})}catch(e){}};
g('pro_view',{lang:document.documentElement.lang});
var q=new URLSearchParams(location.search),ok=document.getElementById('xt-pro-success');
if(q.get('status')==='success'&&ok){ok.hidden=false;g('pro_checkout_success');}
var btns=document.querySelectorAll('.xt-price a[data-plan]'),soon=document.getElementById('xt-pro-soon');
function off(){if(soon)soon.hidden=false;}
fetch('/api/pro/config').then(function(r){return r.json()}).then(function(c){
if(!c||!c.available){off();return;}
btns.forEach(function(b){var p=b.getAttribute('data-plan'),u=c.checkout&&c.checkout[p];
if(!u){return;}b.href=u;b.removeAttribute('aria-disabled');b.addEventListener('click',function(){g('pro_checkout_click',{plan:p})});});
}).catch(off);
var f=document.getElementById('xt-pro-form');if(!f)return;
var out=f.querySelector('[role=status]'),inp=f.querySelector('input'),btn=f.querySelector('button'),d=f.dataset;
function say(t,good){out.textContent=t;out.className='xt-pro-msg '+(good?'ok':'err');}
if(/(^|; )xt_pro_hint=1/.test(document.cookie)){fetch('/api/pro/me',{credentials:'same-origin'}).then(function(r){return r.json()}).then(function(m){if(m&&m.pro)say(d.already,true)}).catch(function(){});}
f.addEventListener('submit',function(e){e.preventDefault();var k=inp.value.trim();if(!k)return;btn.disabled=true;say(d.working,true);
fetch('/api/pro/activate',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:k})})
.then(function(r){return r.json().then(function(b){return{s:r.status,b:b}},function(){return{s:r.status,b:null}})})
.then(function(x){btn.disabled=false;
if(x.s===200&&x.b&&x.b.pro){say(d.ok,true);inp.value='';g('pro_activate',{ok:true});try{sessionStorage.removeItem('xt_pro_state')}catch(e){}window.dispatchEvent(new Event('xt:pro'));return;}
var err=(x.b&&x.b.error)||String(x.s);
say(x.s===503?d.unavailable:x.s===429?d.rate:err==='activation_limit'?d.limit:x.s===401?d.invalid:d.upstream,false);
g('pro_activate',{ok:false,error:err});})
.catch(function(){btn.disabled=false;say(d.network,false);g('pro_activate',{ok:false,error:'network'});});});
})();`;

function card(name: string, amount: number, unit: string, note: string, plan: keyof typeof PRICES, buy: string, featured = false): string {
  return `<div class="xt-price${featured ? ' xt-price-featured' : ''}">
      <h3>${esc(name)}</h3>
      <p class="xt-price-amount"><bdi>$${amount}</bdi><span>${esc(unit)}</span></p>
      <p class="xt-price-note">${esc(note)}</p>
      <a class="xt-btn" data-plan="${plan}" href="#" aria-disabled="true" rel="noopener">${esc(buy)}</a>
    </div>`;
}

export function proPage(lang: Lang, c: ProCopy): SitePage {
  const path = PATHS[lang];
  const form = `<form id="xt-pro-form" class="xt-pro-form" autocomplete="off"
    data-working="${esc(c.msgWorking)}" data-ok="${esc(c.msgOk)}" data-already="${esc(c.msgAlready)}" data-invalid="${esc(c.msgInvalid)}"
    data-limit="${esc(c.msgLimit)}" data-upstream="${esc(c.msgUpstream)}" data-unavailable="${esc(c.msgUnavailable)}"
    data-rate="${esc(c.msgRate)}" data-network="${esc(c.msgNetwork)}">
    <label for="xt-pro-key">${esc(c.keyLabel)}</label>
    <div class="xt-pro-row">
      <input id="xt-pro-key" name="key" type="text" inputmode="text" spellcheck="false" autocapitalize="characters" placeholder="XTPRO-…" maxlength="200" required dir="ltr" />
      <button type="submit">${esc(c.activate)}</button>
    </div>
    <p class="xt-pro-msg" role="status" aria-live="polite"></p>
  </form>`;

  return {
    id: lang === 'en' ? 'pro' : `${lang}-pro`,
    group: 'pro',
    path,
    file: `${path.replace(/^\//, '')}.html`,
    lang,
    title: c.title,
    description: c.description,
    h1: c.h1,
    sub: c.sub,
    primary: 'md',
    nav: c.nav,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Xtracticle Pro',
        description: c.description,
        brand: { '@type': 'Brand', name: 'Xtracticle' },
        url: `https://xtracticle.com${path}`,
        offers: (['monthly', 'yearly', 'lifetime'] as const).map(plan => ({
          '@type': 'Offer',
          name: `Xtracticle Pro — ${c[plan]}`,
          price: String(PRICES[plan]),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `https://xtracticle.com${path}`,
        })),
      },
    ],
    sections: `
<section>
  <p>${c.pitch}</p>
  <h2>${esc(c.featuresH2)}</h2>
  <ul class="xt-pro-features">${c.features.map(f => `<li>${f}</li>`).join('')}</ul>
</section>

<section id="pricing">
  <h2>${esc(c.pricingH2)}</h2>
  <div class="xt-pricing">
    ${card(c.monthly, PRICES.monthly, c.perMonth, c.monthlyNote, 'monthly', c.buy)}
    ${card(c.yearly, PRICES.yearly, c.perYear, c.yearlyNote, 'yearly', c.buy, true)}
    ${card(c.lifetime, PRICES.lifetime, c.once, c.lifetimeNote, 'lifetime', c.buy)}
  </div>
  <p id="xt-pro-soon" class="xt-pro-soon" hidden>${esc(c.soon)}</p>
  <p class="xt-pro-hint">${c.checkoutHint}</p>
</section>

<section id="activate">
  <h2>${esc(c.keyH2)}</h2>
  <p>${c.keyIntro}</p>
  <p id="xt-pro-success" class="xt-pro-success" role="status" hidden>${esc(c.success)}</p>
  ${form}
</section>
<script>${SCRIPT}</script>`,
    faq: c.faq,
  };
}

export const PRO_EN: ProCopy = {
  title: 'Xtracticle Pro — Full Archives, CSV, 200-Link Batches, API Key | Xtracticle',
  description:
    'Xtracticle Pro: every archived post of an account with CSV export, batches of 200 links, a personal MCP/API key with a higher quota and PDFs without a credit line. $5/month, $36/year or $59 once.',
  h1: 'Xtracticle Pro',
  sub: 'Everything basic stays free. Pro adds the heavy features and pays for the servers — no account, just a license key.',
  nav: 'Pro',
  pitch:
    'Xtracticle is free, has no ads and asks for no login — and that is not changing. Pro is for the few jobs that are expensive to run: ' +
    'whole archives, big batches and AI assistants that read X all day. Buying it keeps the free tool free.',
  featuresH2: 'What Pro adds',
  features: [
    '<strong>The full archived-post list</strong> in the <a href="/deleted-tweet-finder">Deleted Tweet Finder</a> — every post the Wayback Machine holds for an account (up to 1,500), not only the newest 50, with <strong>CSV export</strong>.',
    '<strong>Batch mode with up to 200 links</strong> in one ZIP instead of 20.',
    '<strong>A personal MCP / API key</strong>: send your license key as <code>Authorization: Bearer</code> to the <a href="/mcp-server">MCP server</a> and the Markdown API and the free-tier request limits no longer apply to you.',
    '<strong>No “Saved with Xtracticle” line</strong> in the PDFs and EPUBs you export.',
    '<strong>First access to new features</strong> — Pro users get them first, and their requests set the roadmap.',
  ],
  pricingH2: 'Pricing',
  monthly: 'Monthly',
  yearly: 'Yearly',
  lifetime: 'Lifetime',
  perMonth: '/ month',
  perYear: '/ year',
  once: 'once',
  monthlyNote: 'Cancel anytime.',
  yearlyNote: 'That is $3 a month — 40% off.',
  lifetimeNote: 'Launch price for the first 100 buyers. Pay once, keep it forever.',
  buy: 'Get Pro',
  soon: 'Pro is almost ready. Checkout opens in a few days — everything on this page stays free until then.',
  checkoutHint:
    'Payments are handled by <a href="https://polar.sh" rel="noopener">Polar</a> (card, Apple Pay, Google Pay). Your license key arrives by e-mail within a minute of paying — no account on Xtracticle is created.',
  keyH2: 'Already have a key? Enter it here',
  keyIntro: 'Paste the license key from your Polar e-mail. Pro is then active in this browser; repeat on each device you use.',
  keyLabel: 'License key',
  activate: 'Activate',
  msgWorking: 'Checking your key…',
  msgOk: 'Pro is active in this browser. Enjoy!',
  msgAlready: 'Pro is already active in this browser.',
  msgInvalid: 'This key was not recognized. Check for typos — the key starts with XTPRO — or whether the subscription has ended.',
  msgLimit: 'This key is already active on 3 devices. Remove one in your Polar customer portal (link in your receipt e-mail) and try again.',
  msgUpstream: 'The license server did not answer. Please try again in a minute.',
  msgUnavailable: 'Pro is not open yet. Please check back in a few days.',
  msgRate: 'Too many attempts. Please wait a few seconds and try again.',
  msgNetwork: 'Network error — please check your connection and try again.',
  success: 'Payment received — thank you! Your license key is in the e-mail from Polar. Paste it below to switch Pro on.',
  faq: [
    { q: 'How do I get my license key?', a: 'Right after checkout Polar e-mails you a license key (it also appears on the confirmation page and in Polar’s customer portal). Paste it into the form on this page and Pro is active in that browser.' },
    { q: 'Do I need an account?', a: 'No. Xtracticle has no accounts. The key is the only thing we check; it is stored encrypted in a cookie on your device for 30 days at a time and renews itself as long as your plan is active.' },
    { q: 'On how many devices does a key work?', a: 'Up to 3 at the same time. Enter the same key in each browser you use. You can remove a device in Polar’s customer portal.' },
    { q: 'Can I cancel?', a: 'Yes, anytime, from the customer-portal link in your receipt e-mail. Pro stays active until the end of the period you paid for. The lifetime plan is a single payment with nothing to cancel.' },
    { q: 'Is there a refund?', a: 'Yes: 14 days, no questions asked. Open an issue on GitHub or message @DvciAhmet on X and the payment is refunded.' },
    { q: 'Does Pro change what free users get?', a: 'No. Single posts, threads, Articles, every export format, the first 50 archived posts and batches of 20 stay free, with no ads and no login.' },
    { q: 'Where do I ask questions?', a: `Open an issue on GitHub (${GITHUB.replace('https://', '')}) or send a message to @DvciAhmet on X.` },
  ],
};
