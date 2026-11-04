import { GITHUB, type FAQ, type Lang, type SitePage } from './blocks';

/**
 * /pro (and /tr/pro, /es/pro, …): Xtracticle Pro — license-key based paid tier sold through Gumroad.
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
  /** Success card that replaces the key form once Pro is active in this browser. */
  activeH2: string;
  /** Line under the heading: "{plan} · …"; the plan name is put in front by the script. */
  activeIn: string;
  nowH3: string;
  /** "What you can do now" rows; `href` is this language's page. */
  now: { title: string; text: string; href: string }[];
  signOut: string;
  /** Small tag on the pricing card of the plan in use. */
  yourPlan: string;
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
if(!u){return;}b.href=u;if(!b.parentNode.classList.contains('xt-price-current'))b.removeAttribute('aria-disabled');b.addEventListener('click',function(){g('pro_checkout_click',{plan:p})});});
}).catch(off);
var f=document.getElementById('xt-pro-form');if(!f)return;
var out=f.querySelector('[role=status]'),inp=f.querySelector('input'),btn=f.querySelector('button'),d=f.dataset;
function say(t,good){out.textContent=t;out.className='xt-pro-msg '+(good?'ok':'err');}
var card=document.getElementById('xt-pro-active'),box=document.getElementById('xt-pro-keybox');
function mark(p){btns.forEach(function(b){var c=b.parentNode,t=c.querySelector('.xt-price-tag'),on=b.getAttribute('data-plan')===p;
if(on){c.classList.add('xt-price-current');b.setAttribute('aria-disabled','true');b.setAttribute('tabindex','-1');
if(!t){t=document.createElement('span');t.className='xt-price-tag';t.textContent=card.dataset.your;c.insertBefore(t,c.firstChild);}}
else if(c.classList.contains('xt-price-current')){c.classList.remove('xt-price-current');b.removeAttribute('tabindex');if(t)t.parentNode.removeChild(t);if(b.getAttribute('href')!=='#')b.removeAttribute('aria-disabled');}});}
function show(p,scroll){if(!card)return;var n=card.dataset[p];
card.querySelector('[data-plan-line]').textContent=(n?n+' \\u00b7 ':'')+card.dataset.on;
card.hidden=false;if(box)box.hidden=true;mark(p);
if(scroll){var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
card.scrollIntoView({behavior:still?'auto':'smooth',block:'center'});try{card.focus({preventScroll:true})}catch(e){}}}
function hide(){if(!card)return;card.hidden=true;if(box)box.hidden=false;mark('');say('',true);try{inp.focus()}catch(e){}}
if(card){card.querySelector('[data-signout]').addEventListener('click',function(){var s=this;s.disabled=true;
fetch('/api/pro/logout',{method:'POST',credentials:'same-origin'}).catch(function(){}).then(function(){s.disabled=false;
try{sessionStorage.removeItem('xt_pro_state')}catch(e){}g('pro_signout',{place:'pro_page'});hide();window.dispatchEvent(new Event('xt:pro'));});});}
if(/(^|; )xt_pro_hint=1/.test(document.cookie)){fetch('/api/pro/me',{credentials:'same-origin'}).then(function(r){return r.json()}).then(function(m){if(m&&m.pro)show(m.plan,false)}).catch(function(){});}
f.addEventListener('submit',function(e){e.preventDefault();var k=inp.value.trim();if(!k)return;btn.disabled=true;say(d.working,true);
fetch('/api/pro/activate',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:k})})
.then(function(r){return r.json().then(function(b){return{s:r.status,b:b}},function(){return{s:r.status,b:null}})})
.then(function(x){btn.disabled=false;
if(x.s===200&&x.b&&x.b.pro){say('',true);inp.value='';show(x.b.plan,true);g('pro_activate',{ok:true});try{sessionStorage.removeItem('xt_pro_state')}catch(e){}window.dispatchEvent(new Event('xt:pro'));return;}
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
      <input id="xt-pro-key" name="key" type="text" inputmode="text" spellcheck="false" autocapitalize="characters" placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX" maxlength="200" required dir="ltr" />
      <button type="submit">${esc(c.activate)}</button>
    </div>
    <p class="xt-pro-msg" role="status" aria-live="polite"></p>
  </form>`;

  const active = `<div id="xt-pro-active" class="xt-pro-active" tabindex="-1" role="region" aria-labelledby="xt-pro-active-h" hidden
    data-monthly="${esc(c.monthly)}" data-yearly="${esc(c.yearly)}" data-lifetime="${esc(c.lifetime)}" data-on="${esc(c.activeIn)}" data-your="${esc(c.yourPlan)}">
    <div class="xt-pro-active-head">
      <span class="xt-pro-check" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
      <div>
        <h2 id="xt-pro-active-h">${esc(c.activeH2)}</h2>
        <p class="xt-pro-active-plan" data-plan-line></p>
      </div>
    </div>
    <p class="xt-pro-now-h">${esc(c.nowH3)}</p>
    <ul class="xt-pro-now">${c.now
      .map(r => `<li><a href="${r.href}"><span><strong>${esc(r.title)}</strong><span>${esc(r.text)}</span></span><span class="xt-pro-arrow" aria-hidden="true">→</span></a></li>`)
      .join('')}</ul>
    <button type="button" class="xt-pro-signout" data-signout>${esc(c.signOut)}</button>
  </div>`;

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
  <div id="xt-pro-keybox">
    <h2>${esc(c.keyH2)}</h2>
    <p>${c.keyIntro}</p>
    <p id="xt-pro-success" class="xt-pro-success" role="status" hidden>${esc(c.success)}</p>
    ${form}
  </div>
  ${active}
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
    'Payments are handled by <a href="https://gumroad.com" rel="noopener">Gumroad</a> (card, Apple Pay, Google Pay). Your license key is shown on the receipt page right after paying and also arrives by e-mail from Gumroad — no account on Xtracticle is created.',
  keyH2: 'Already have a key? Enter it here',
  keyIntro: 'Paste the license key from your Gumroad receipt (on the page after checkout or in the e-mail). Pro is then active in this browser; repeat on each device you use.',
  keyLabel: 'License key',
  activate: 'Activate',
  msgWorking: 'Checking your key…',
  msgOk: 'Pro is active in this browser. Enjoy!',
  msgAlready: 'Pro is already active in this browser.',
  msgInvalid: 'This key was not recognized. Check for typos or whether the subscription has ended.',
  msgLimit: 'This key has been activated too many times. If you are the buyer, contact us via GitHub or @DvciAhmet on X and we’ll reset it.',
  msgUpstream: 'The license server did not answer. Please try again in a minute.',
  msgUnavailable: 'Pro is not open yet. Please check back in a few days.',
  msgRate: 'Too many attempts. Please wait a few seconds and try again.',
  msgNetwork: 'Network error — please check your connection and try again.',
  success: 'Payment received — thank you! Your license key is on your Gumroad receipt and in the e-mail from Gumroad. Paste it below to switch Pro on.',
  activeH2: 'Pro is active',
  activeIn: 'active in this browser',
  nowH3: 'What you can do now',
  now: [
    { title: 'Deleted Tweet Finder', text: 'The full archived-post list of any account, with CSV export', href: '/deleted-tweet-finder' },
    { title: 'Batch mode', text: 'Up to 200 links in one ZIP', href: '/?mode=batch' },
    { title: 'MCP / API key', text: 'Use your license key as a Bearer token for higher limits', href: '/mcp-server' },
  ],
  signOut: 'Sign out of Pro',
  yourPlan: 'Your plan',
  faq: [
    { q: 'How do I get my license key?', a: 'Right after checkout Gumroad shows your license key on the receipt page and e-mails it to you (it is also on the product’s download page on Gumroad). Paste it into the form on this page and Pro is active in that browser.' },
    { q: 'Do I need an account?', a: 'No. Xtracticle has no accounts. The key is the only thing we check; it is stored encrypted in a cookie on your device for 30 days at a time and renews itself as long as your plan is active.' },
    { q: 'On how many devices does a key work?', a: 'On every device you use: enter the same key in each browser. The key is checked once a day, so it keeps working as long as your plan is active.' },
    { q: 'Can I cancel?', a: 'Yes, anytime, from the “Manage membership” link in your Gumroad receipt or subscription e-mail. Pro stays active until the end of the period you paid for. The lifetime plan is a single payment with nothing to cancel.' },
    { q: 'Is there a refund?', a: 'Yes: 14 days, no questions asked. Open an issue on GitHub or message @DvciAhmet on X and the payment is refunded.' },
    { q: 'Does Pro change what free users get?', a: 'No. Single posts, threads, Articles, every export format, the first 50 archived posts and batches of 20 stay free, with no ads and no login.' },
    { q: 'Where do I ask questions?', a: `Open an issue on GitHub (${GITHUB.replace('https://', '')}) or send a message to @DvciAhmet on X.` },
  ],
};
