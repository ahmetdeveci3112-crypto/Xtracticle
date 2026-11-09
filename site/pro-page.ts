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
  /** "Watch" manager inside the Pro-active card (serialized into a data attribute for the inline script). */
  watch: WatchCopy;
  /** Free Watch trial: start form for non-Pro visitors and the "Your free trial" card (#t=<manage token>). */
  trial: TrialCopy;
  faqH2?: string;
  faq: FAQ[];
}

/**
 * Text of the Watch manager on /pro. Placeholders: {n}, {limit}, {handle} (with the @), {email}, {date}.
 * Plain text only: the script writes it with textContent.
 */
export interface WatchCopy {
  h: string;
  intro: string;
  count: string;
  full: string;
  loading: string;
  empty: string;
  failed: string;
  unavailable: string;
  handleLabel: string;
  modeLabel: string;
  modes: { deleted: string; new: string; both: string };
  add: string;
  adding: string;
  added: string;
  removed: string;
  err: {
    exists: string;
    bad_handle: string;
    not_found: string;
    protected: string;
    blocklisted: string;
    limit_reached: string;
    upstream: string;
    pro_required: string;
    rate: string;
    network: string;
    generic: string;
  };
  status: { active: string; paused: string; protected: string; gone: string };
  statusNote: { paused: string; protected: string; gone: string };
  lastCheck: string;
  notChecked: string;
  emailNone: string;
  emailPending: string;
  emailOk: string;
  feed: string;
  feedNote: string;
  copy: string;
  copied: string;
  recent: string;
  noEvents: string;
  events: { deleted: string; new: string; protected: string; gone: string; renamed: string };
  onX: string;
  archived: string;
  markdown: string;
  modeSaved: string;
  emailBtn: string;
  emailLabel: string;
  emailSave: string;
  emailClear: string;
  emailHint: string;
  emailSent: string;
  emailConfirmed: string;
  emailWaiting: string;
  emailNoSend: string;
  emailCleared: string;
  emailBad: string;
  remove: string;
  confirmRemove: string;
  removeYes: string;
  cancel: string;
  /** Notices for /pro?watch=verified and /pro?watch=verify_failed (the e-mail confirmation link redirects there). */
  verified: string;
  verifyFailed: string;
}

/**
 * Text of the free Watch trial on /pro (docs/watch-api.md, "Trial"). Placeholders: {handle} (with the @),
 * {email}, {date}, {n}, {days}. Plain text only (textContent / confirm()); startH, startIntro, startNote are HTML-escaped.
 */
export interface TrialCopy {
  /** Notices for /pro?trial=… (the verification link in the e-mail redirects there). */
  notice: { verified: string; verify_failed: string; full: string; disabled: string };
  h: string;
  loading: string;
  failed: string;
  invalid: string;
  status: { pending: string; active: string; ended: string };
  pending: string;
  daysLeft: string;
  lastDay: string;
  endedOn: string;
  endedNote: string;
  noEventsEnded: string;
  keep: string;
  keepNote: string;
  end: string;
  cancelRequest: string;
  confirmEnd: string;
  confirmCancel: string;
  ended: string;
  cancelled: string;
  startH: string;
  startIntro: string;
  handleLabel: string;
  emailLabel: string;
  start: string;
  starting: string;
  sent: string;
  sentHint: string;
  startNote: string;
  err: {
    trial_used: string;
    trial_pending: string;
    trial_full: string;
    trial_disabled: string;
    trial_ended: string;
    mail_failed: string;
    bad_email: string;
    bad_handle: string;
    not_found: string;
    protected: string;
    blocklisted: string;
    upstream: string;
    rate: string;
    network: string;
    generic: string;
  };
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
var wn=document.getElementById('xt-watch-notice'),wv=q.get('watch');
if(wn&&(wv==='verified'||wv==='verify_failed')){wn.textContent=wn.getAttribute(wv==='verified'?'data-ok':'data-fail');wn.hidden=false;
try{q['delete']('watch');var qs=q.toString();history.replaceState(null,'',location.pathname+(qs?'?'+qs:'')+location.hash)}catch(e){}}
var tcd=document.getElementById('xt-trial-card'),TC=null,tv=q.get('trial'),ts=document.getElementById('xt-trial-start'),tok='',tbody,tviewed=false;
if(tcd){try{TC=JSON.parse(tcd.getAttribute('data-copy'))}catch(e){tcd=null}}
if(wn&&TC&&tv&&TC.notice.hasOwnProperty(tv)){wn.textContent=TC.notice[tv];wn.hidden=false;g('trial_notice',{kind:tv});
try{q['delete']('trial');var tq=q.toString();history.replaceState(null,'',location.pathname+(tq?'?'+tq:'')+location.hash)}catch(e){}}
var wb=document.getElementById('xt-watch'),WC=null,wlim=0,wcount=0,wviewed=false,wl,wcnt,wst,wun,wf,wfi,wfm,wfb,wfo,wfull;
if(wb){try{WC=JSON.parse(wb.getAttribute('data-copy'))}catch(e){wb=null}}
if(wb){wl=wb.querySelector('[data-watch-list]');wcnt=wb.querySelector('[data-watch-count]');wst=wb.querySelector('[data-watch-state]');wun=wb.querySelector('[data-watch-unavail]');
wf=wb.querySelector('form');wfi=wf.querySelector('input');wfm=wf.querySelector('select');wfb=wf.querySelector('button');wfo=wf.querySelector('[role=status]');wfull=wf.querySelector('[data-watch-full]');}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function iso(s){return String.fromCharCode(8294)+s+String.fromCharCode(8297);}
function tpl(s,o){for(var k in o)if(o.hasOwnProperty(k))s=s.split('{'+k+'}').join(o[k]);return s;}
function wsay(o,t,good){o.textContent=t||'';o.className='xt-pro-msg '+(good?'ok':'err');}
function api(m,u,b){var h={'X-Xt-Client':'web'};if(b)h['Content-Type']='application/json';
return fetch(u,{method:m,credentials:'same-origin',headers:h,body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().then(function(j){return{s:r.status,b:j}},function(){return{s:r.status,b:null}})});}
function fmt(s){var d=new Date(s||'');if(!s||isNaN(d.getTime()))return '';
try{return d.toLocaleString(document.documentElement.lang,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){return d.toISOString().slice(0,16).replace('T',' ')}}
function clean(v){v=(v||'').trim();var i=v.toLowerCase().indexOf('.com/');if(i>=0)v=v.slice(i+5);v=v.split('/')[0].split('?')[0].split('#')[0];while(v.charAt(0)==='@')v=v.slice(1);return v;}
function errText(x,add){var e=x.b&&x.b.error;if(x.s===503)return WC.unavailable;if(x.s===402||x.s===401)return WC.err.pro_required;if(x.s===429)return WC.err.rate;
if(!add&&e==='not_found')return WC.err.generic;var t=e&&WC.err.hasOwnProperty(e)?WC.err[e]:WC.err.generic;return e==='limit_reached'?tpl(t,{limit:(x.b.limit||wlim)}):t;}
function wcountUp(){var full=wlim>0&&wcount>=wlim;wcnt.textContent=wlim?tpl(WC.count,{n:wcount,limit:wlim}):'';
wfull.hidden=!full;wfull.textContent=full?tpl(WC.full,{limit:wlim}):'';wfb.disabled=full;wfi.disabled=full;wfm.disabled=full;
wst.hidden=wcount>0;if(!wcount)wst.textContent=WC.empty;}
function wunavail(){wun.hidden=false;wst.hidden=true;wf.hidden=true;wcnt.textContent='';wl.innerHTML='';}
function wclear(){if(!wb)return;wl.innerHTML='';wcount=0;wlim=0;wcnt.textContent='';wsay(wfo,'',true);wf.hidden=true;wst.hidden=false;wst.textContent=WC.loading;}
function wload(){if(!wb)return;wun.hidden=true;wst.hidden=false;wst.textContent=WC.loading;
api('GET','/api/watch').then(function(x){
if(x.s===503&&x.b&&x.b.error==='watch_unavailable'){wunavail();return;}
if(x.s!==200||!x.b||!x.b.watches){wst.textContent=x.s===402||x.s===401?WC.err.pro_required:WC.failed;return;}
wlim=x.b.limit||0;wl.innerHTML='';wcount=0;x.b.watches.forEach(function(w){wl.appendChild(item(w));wcount++;});wf.hidden=false;wcountUp();
if(!wviewed){wviewed=true;g('watch_view',{count:wcount,limit:wlim});}
}).catch(function(){wst.textContent=WC.failed;});}
function copy(t,b,k){function done(){b.textContent=WC.copied;setTimeout(function(){b.textContent=WC.copy},2000);g('watch_feed_copy',{kind:k});}
function old(){var i=document.createElement('textarea');i.value=t;i.setAttribute('readonly','');i.style.position='fixed';i.style.opacity='0';document.body.appendChild(i);i.select();
var ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(i);if(ok)done();}
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,old);else old();}
function md(u,name,msg){fetch(u,{credentials:'same-origin',headers:{'X-Xt-Client':'web'}}).then(function(r){if(!r.ok)throw r.status;return r.blob()}).then(function(b){
var o=URL.createObjectURL(b),a=document.createElement('a');a.href=o;a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(o)},4000);
}).catch(function(){wsay(msg,WC.err.generic,false)});}
function link(t,u,c){var a=el('a',c||null,t);a.href=u;a.target='_blank';a.rel='noopener noreferrer nofollow';return a;}
function mini(t,c){var b=el('button','xt-watch-mini'+(c?' '+c:''),t);b.type='button';return b;}
function feeds(rss,jf){var fd=el('p','xt-watch-feeds');fd.appendChild(el('span','xt-watch-label',WC.feed));
[['rss',rss,'RSS'],['json',jf,'JSON Feed']].forEach(function(f){if(!f[1])return;var s=el('span','xt-watch-feed'),cb=mini(WC.copy);
cb.setAttribute('aria-label',WC.copy+': '+f[2]);cb.addEventListener('click',function(){copy(f[1],cb,f[0])});s.appendChild(link(f[2],f[1]));s.appendChild(cb);fd.appendChild(s);});return fd;}
function evs(list,hd,msg){var ul=el('ul','xt-watch-events');list.forEach(function(e){var r=el('li'),h=el('p','xt-watch-ev-h');h.appendChild(el('strong',null,WC.events[e.type]||e.type));h.appendChild(el('span',null,fmt(e.detectedAt)));r.appendChild(h);
if(e.text){var tx=e.text.length>160?e.text.slice(0,159)+String.fromCharCode(8230):e.text,tp=el('p','xt-watch-ev-t',tx);tp.setAttribute('dir','auto');r.appendChild(tp);}
var lk=el('p','xt-watch-ev-l');if(e.url)lk.appendChild(link(WC.onX,e.url));if(e.wayback)lk.appendChild(link(WC.archived,e.wayback));
if(e.markdownUrl){var ma=el('a',null,WC.markdown);ma.href=e.markdownUrl;ma.addEventListener('click',function(x){x.preventDefault();md(e.markdownUrl,hd+'-'+(e.postId||e.id)+'.md',msg)});lk.appendChild(ma);}
if(lk.firstChild)r.appendChild(lk);ul.appendChild(r);});return ul;}
function item(w,after){var li=el('li','xt-watch-item'),at='@'+w.handle,u='/api/watch/'+encodeURIComponent(w.id);
var top=el('div','xt-watch-top'),ha=link(at,'https://x.com/'+encodeURIComponent(w.handle),'xt-watch-handle');ha.setAttribute('dir','ltr');top.appendChild(ha);
top.appendChild(el('span','xt-watch-badge'+(w.status==='active'?' on':''),WC.status[w.status]||w.status));li.appendChild(top);
if(w.status!=='active'&&WC.statusNote[w.status])li.appendChild(el('p','xt-watch-note',WC.statusNote[w.status]));
var meta=el('p','xt-watch-meta');meta.appendChild(el('span',null,WC.modes[w.mode]||w.mode));
meta.appendChild(el('span',null,w.lastPolledAt?tpl(WC.lastCheck,{date:fmt(w.lastPolledAt)}):WC.notChecked));
meta.appendChild(el('span',null,!w.email?WC.emailNone:tpl(w.emailVerified?WC.emailOk:WC.emailPending,{email:iso(w.email)})));li.appendChild(meta);
li.appendChild(feeds(w.feedUrl,w.jsonFeedUrl));li.appendChild(el('p','xt-watch-hint',WC.feedNote));
var msg=el('p','xt-pro-msg');msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');
var ev=(w.recent||[]).slice(0,5);li.appendChild(el('p','xt-watch-sub',WC.recent));
if(!ev.length)li.appendChild(el('p','xt-watch-hint',WC.noEvents));
else li.appendChild(evs(ev,w.handle,msg));
var ct=el('div','xt-watch-ctrl'),ml=el('label','xt-watch-mode'),sel=el('select');ml.appendChild(el('span',null,WC.modeLabel));
['deleted','new','both'].forEach(function(m){var o=el('option',null,WC.modes[m]);o.value=m;if(m===w.mode)o.selected=true;sel.appendChild(o);});ml.appendChild(sel);ct.appendChild(ml);
var eb=mini(WC.emailBtn),rb=mini(WC.remove,'xt-watch-del');eb.setAttribute('aria-expanded','false');ct.appendChild(eb);ct.appendChild(rb);li.appendChild(ct);
var cf=el('div','xt-watch-confirm'),cy=mini(WC.removeYes,'xt-watch-del'),cn=mini(WC.cancel);cf.hidden=true;cf.appendChild(el('span',null,tpl(WC.confirmRemove,{handle:iso(at)})));cf.appendChild(cy);cf.appendChild(cn);li.appendChild(cf);
var ef=el('form','xt-watch-email'),eid='xt-we-'+w.id,lb=el('label',null,WC.emailLabel),row=el('div','xt-pro-row'),ei=el('input'),es=el('button',null,WC.emailSave),ec=mini(WC.emailClear);
ef.hidden=true;lb.htmlFor=eid;ei.type='email';ei.id=eid;ei.autocomplete='email';ei.maxLength=254;ei.placeholder='you@example.com';ei.value=w.email||'';ei.setAttribute('dir','ltr');es.type='submit';ec.hidden=!w.email;
row.appendChild(ei);row.appendChild(es);ef.appendChild(lb);ef.appendChild(row);ef.appendChild(el('p','xt-watch-hint',WC.emailHint));ef.appendChild(ec);li.appendChild(ef);li.appendChild(msg);
function redo(x,t,good,focus){var n=item(x.b,{t:t,good:good,focus:focus});if(li.parentNode)li.parentNode.replaceChild(n,li);}
sel.addEventListener('change',function(){var nv=sel.value,ov=w.mode;sel.disabled=true;
api('PATCH',u,{mode:nv}).then(function(x){sel.disabled=false;if(x.s===200&&x.b&&x.b.id){redo(x,WC.modeSaved,true,'mode');return;}sel.value=ov;wsay(msg,errText(x),false);})
.catch(function(){sel.disabled=false;sel.value=ov;wsay(msg,WC.err.network,false);});});
eb.addEventListener('click',function(){ef.hidden=!ef.hidden;eb.setAttribute('aria-expanded',ef.hidden?'false':'true');if(!ef.hidden)try{ei.focus()}catch(e){}});
function setEmail(v){es.disabled=true;ec.disabled=true;api('PATCH',u,{email:v}).then(function(x){es.disabled=false;ec.disabled=false;
if(x.s===200&&x.b&&x.b.id){var b=x.b,o={email:iso(b.email||'')};if(!v){redo(x,WC.emailCleared,true,'email');return;}g('watch_email_set',{verified:!!b.emailVerified});
redo(x,tpl(b.emailVerified?WC.emailConfirmed:b.verificationSent===true?WC.emailSent:b.verificationSent===false?WC.emailNoSend:WC.emailWaiting,o),true,'email');return;}
wsay(msg,x.b&&x.b.error==='bad_email'?WC.emailBad:errText(x),false);}).catch(function(){es.disabled=false;ec.disabled=false;wsay(msg,WC.err.network,false);});}
ef.addEventListener('submit',function(e){e.preventDefault();var v=ei.value.trim();if(!v){wsay(msg,WC.emailBad,false);return;}setEmail(v);});
ec.addEventListener('click',function(){setEmail('');});
rb.addEventListener('click',function(){ct.hidden=true;ef.hidden=true;cf.hidden=false;try{cn.focus()}catch(e){}});
cn.addEventListener('click',function(){cf.hidden=true;ct.hidden=false;try{rb.focus()}catch(e){}});
cy.addEventListener('click',function(){cy.disabled=true;cn.disabled=true;api('DELETE',u).then(function(x){
if(x.s===200||x.s===404){if(li.parentNode)li.parentNode.removeChild(li);wcount=Math.max(0,wcount-1);wcountUp();g('watch_delete');wsay(wfo,tpl(WC.removed,{handle:iso(at)}),true);try{wfi.focus()}catch(e){}return;}
cy.disabled=false;cn.disabled=false;wsay(msg,errText(x),false);}).catch(function(){cy.disabled=false;cn.disabled=false;wsay(msg,WC.err.network,false);});});
if(after){wsay(msg,after.t,after.good);setTimeout(function(){try{(after.focus==='mode'?sel:eb).focus()}catch(e){}},0);}
return li;}
if(wf)wf.addEventListener('submit',function(e){e.preventDefault();var h=clean(wfi.value),mode=wfm.value;if(!h){wsay(wfo,WC.err.bad_handle,false);return;}
wfb.disabled=true;wsay(wfo,WC.adding,true);
api('POST','/api/watch',{handle:h,mode:mode}).then(function(x){wfb.disabled=false;
if(x.s===201&&x.b&&x.b.id){wfi.value='';wl.appendChild(item(x.b));wcount++;wcountUp();wsay(wfo,tpl(WC.added,{handle:iso('@'+x.b.handle)}),true);g('watch_add',{mode:mode,place:'pro_page'});return;}
var er=(x.b&&x.b.error)||String(x.s);if(x.s===503&&er==='watch_unavailable'){wunavail();}
if(er==='limit_reached'&&x.b.limit){wlim=x.b.limit;wcountUp();}
wsay(wfo,tpl(errText(x,true),{handle:iso('@'+h)}),false);g('watch_add_error',{error:er});
}).catch(function(){wfb.disabled=false;wsay(wfo,WC.err.network,false);g('watch_add_error',{error:'network'});});});
function terr(x){var e=x.b&&x.b.error;if(e&&TC.err.hasOwnProperty(e))return TC.err[e];return x.s===429?TC.err.rate:TC.err.generic;}
function tstate(t){tbody.innerHTML='';var p=el('p','xt-watch-state',t);p.setAttribute('role','status');tbody.appendChild(p);}
function tforget(){tok='';try{sessionStorage.removeItem('xt_trial_t')}catch(e){}}
function tload(after){tcd.hidden=false;if(!after)tstate(TC.loading);
api('GET','/api/watch/trial/'+encodeURIComponent(tok)).then(function(x){
if(x.s===404){tforget();tstate(TC.invalid);tstart();return;}
if(x.s!==200||!x.b||!x.b.status){tstate(TC.failed);return;}
trender(x.b,after);if(!tviewed){tviewed=true;g('trial_view',{status:x.b.status});}
}).catch(function(){tstate(TC.failed);});}
function trender(t,after){tbody.innerHTML='';var at='@'+t.handle,w=t.watch,on=t.status==='active';
var top=el('div','xt-watch-top'),ha=link(at,'https://x.com/'+encodeURIComponent(t.handle),'xt-watch-handle');ha.setAttribute('dir','ltr');top.appendChild(ha);
top.appendChild(el('span','xt-watch-badge'+(on?' on':''),TC.status[t.status]||t.status));tbody.appendChild(top);
var wh=t.status==='pending'?tpl(TC.pending,{email:iso(t.email||''),days:t.days||14}):on?(t.daysLeft>1?tpl(TC.daysLeft,{n:t.daysLeft,date:fmt(t.expiresAt)}):tpl(TC.lastDay,{date:fmt(t.expiresAt)})):tpl(TC.endedOn,{date:fmt(t.endedAt)});
tbody.appendChild(el('p','xt-trial-when',wh));
if(on&&w&&w.status!=='active'&&WC.statusNote[w.status])tbody.appendChild(el('p','xt-watch-note',WC.statusNote[w.status]));
if(t.status==='ended')tbody.appendChild(el('p','xt-watch-hint',TC.endedNote));
var msg=el('p','xt-pro-msg');msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');var sel=null;
if(on){var meta=el('p','xt-watch-meta');meta.appendChild(el('span',null,WC.modes[t.mode]||t.mode));
meta.appendChild(el('span',null,w&&w.lastPolledAt?tpl(WC.lastCheck,{date:fmt(w.lastPolledAt)}):WC.notChecked));
meta.appendChild(el('span',null,t.email?tpl(WC.emailOk,{email:iso(t.email)}):WC.emailNone));tbody.appendChild(meta);
if(w){tbody.appendChild(feeds(w.feedUrl,w.jsonFeedUrl));tbody.appendChild(el('p','xt-watch-hint',WC.feedNote));}}
if(t.status!=='pending'){var ev=(t.recent||[]).slice(0,10);tbody.appendChild(el('p','xt-watch-sub',WC.recent));
if(!ev.length)tbody.appendChild(el('p','xt-watch-hint',on?WC.noEvents:TC.noEventsEnded));else tbody.appendChild(evs(ev,t.handle,msg));}
var ct=el('div','xt-watch-ctrl');
if(on){var ml=el('label','xt-watch-mode');sel=el('select');ml.appendChild(el('span',null,WC.modeLabel));
['deleted','new','both'].forEach(function(m){var o=el('option',null,WC.modes[m]);o.value=m;if(m===t.mode)o.selected=true;sel.appendChild(o);});ml.appendChild(sel);ct.appendChild(ml);
sel.addEventListener('change',function(){var nv=sel.value,ov=t.mode;sel.disabled=true;
api('PATCH','/api/watch/trial/'+encodeURIComponent(tok),{mode:nv}).then(function(x){sel.disabled=false;
if(x.s===200&&x.b&&x.b.status){g('trial_mode',{mode:nv});trender(x.b,{t:WC.modeSaved,good:true,focus:'mode'});return;}
sel.value=ov;if(x.b&&x.b.error==='trial_ended'){tload({t:TC.err.trial_ended,good:false});return;}wsay(msg,terr(x),false);})
.catch(function(){sel.disabled=false;sel.value=ov;wsay(msg,TC.err.network,false);});});}
if(t.status!=='ended'){var eb=mini(on?TC.end:TC.cancelRequest,'xt-watch-del');ct.appendChild(eb);
eb.addEventListener('click',function(){if(!window.confirm(on?tpl(TC.confirmEnd,{handle:at}):TC.confirmCancel))return;eb.disabled=true;
api('DELETE','/api/watch/trial/'+encodeURIComponent(tok)).then(function(x){eb.disabled=false;
if(x.s===200&&x.b&&x.b.ok){g('trial_end',{from:t.status});if(x.b.status==='cancelled'){tforget();tstate(TC.cancelled);tstart();return;}tload({t:TC.ended,good:true});return;}
if(x.s===404){tforget();tstate(TC.invalid);tstart();return;}wsay(msg,terr(x),false);})
.catch(function(){eb.disabled=false;wsay(msg,TC.err.network,false);});});}
if(ct.firstChild)tbody.appendChild(ct);
if(t.status!=='pending'){var kp=el('div','xt-trial-keep'),ka=el('a','xt-btn',TC.keep);ka.href='#pricing';ka.addEventListener('click',function(){g('trial_keep_click',{status:t.status})});
kp.appendChild(ka);kp.appendChild(el('p','xt-watch-hint',tpl(TC.keepNote,{handle:iso(at)})));tbody.appendChild(kp);}
tbody.appendChild(msg);
if(after){wsay(msg,after.t,after.good);if(after.focus==='mode'&&sel)setTimeout(function(){try{sel.focus()}catch(e){}},0);}}
function tstart(){if(!ts||!TC||tok)return;
fetch('/api/watch/trial/config').then(function(r){return r.json()}).then(function(c){
if(!c||!c.available||c.full||c.disabled||tok)return;if(document.documentElement.classList.contains('xt-has-pro'))return;
var pa=document.getElementById('xt-pro-active');if(pa&&!pa.hidden)return;ts.hidden=false;g('trial_cta',{action:'view',place:'pro_page'});}).catch(function(){});}
if(tcd&&TC&&WC){tbody=tcd.querySelector('[data-trial-body]');
function thash(ev){var hm=/^#t=([A-Za-z0-9_-]{16,128})$/.exec(location.hash);if(!hm)return false;tok=hm[1];try{sessionStorage.setItem('xt_trial_t',tok)}catch(e){}
try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}if(ts)ts.hidden=true;tviewed=false;tload();
if(ev)try{tcd.scrollIntoView({block:'start'})}catch(e){}return true;}
if(!thash()){try{tok=sessionStorage.getItem('xt_trial_t')||''}catch(e){}if(!/^[A-Za-z0-9_-]{16,128}$/.test(tok))tok='';if(tok)tload();}
window.addEventListener('hashchange',thash);
if(ts){var tf=ts.querySelector('form'),thi=tf.querySelector('input[name=handle]'),tem=tf.querySelector('input[name=email]'),tbt=tf.querySelector('button'),tmo=tf.querySelector('[role=status]');
tf.addEventListener('submit',function(e){e.preventDefault();var h=clean(thi.value),m=tem.value.trim();
if(!h){wsay(tmo,TC.err.bad_handle,false);try{thi.focus()}catch(x){}return;}if(!m){wsay(tmo,TC.err.bad_email,false);try{tem.focus()}catch(x){}return;}
tbt.disabled=true;wsay(tmo,TC.starting,true);
api('POST','/api/watch/trial',{handle:h,email:m,mode:'both'}).then(function(x){tbt.disabled=false;
if(x.s===201&&x.b&&x.b.status){g('trial_start',{ok:true,place:'pro_page'});var dn=el('div','xt-trial-sent');dn.setAttribute('role','status');
dn.appendChild(el('p','xt-trial-when',tpl(TC.sent,{email:iso(x.b.email||m),handle:iso('@'+(x.b.handle||h))})));dn.appendChild(el('p','xt-watch-hint',TC.sentHint));
tf.parentNode.replaceChild(dn,tf);return;}
var er=(x.b&&x.b.error)||String(x.s);g('trial_start',{ok:false,error:er,place:'pro_page'});wsay(tmo,terr(x),false);})
.catch(function(){tbt.disabled=false;wsay(tmo,TC.err.network,false);g('trial_start',{ok:false,error:'network',place:'pro_page'});});});
tstart();}}
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
card.hidden=false;if(box)box.hidden=true;if(ts)ts.hidden=true;mark(p);wload();
if(!scroll&&location.hash==='#watch'&&wb){try{wb.scrollIntoView({block:'start'})}catch(e){}}
if(scroll){var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
card.scrollIntoView({behavior:still?'auto':'smooth',block:'center'});try{card.focus({preventScroll:true})}catch(e){}}}
function hide(){if(!card)return;card.hidden=true;if(box)box.hidden=false;mark('');say('',true);wclear();try{inp.focus()}catch(e){}}
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

/** Watch manager (filled by the inline script from GET /api/watch once Pro is active). */
function watchBox(w: WatchCopy): string {
  const opt = (m: keyof WatchCopy['modes']) => `<option value="${m}"${m === 'deleted' ? ' selected' : ''}>${esc(w.modes[m])}</option>`;
  return `<div id="xt-watch" class="xt-watch" role="region" aria-labelledby="xt-watch-h" data-copy="${esc(JSON.stringify(w))}">
      <p class="xt-pro-now-h" id="xt-watch-h">${esc(w.h)}</p>
      <p class="xt-watch-intro">${esc(w.intro)}</p>
      <p class="xt-watch-count" data-watch-count></p>
      <p class="xt-watch-state" data-watch-state>${esc(w.loading)}</p>
      <p class="xt-watch-unavail" data-watch-unavail hidden>${esc(w.unavailable)}</p>
      <ul class="xt-watch-list" data-watch-list></ul>
      <form class="xt-watch-add" autocomplete="off" hidden>
        <label for="xt-watch-handle">${esc(w.handleLabel)}</label>
        <div class="xt-pro-row">
          <input id="xt-watch-handle" name="handle" type="text" spellcheck="false" autocapitalize="none" placeholder="@username" maxlength="100" required dir="ltr" />
          <select id="xt-watch-mode" name="mode" aria-label="${esc(w.modeLabel)}">${opt('deleted')}${opt('new')}${opt('both')}</select>
          <button type="submit">${esc(w.add)}</button>
        </div>
        <p class="xt-watch-full" data-watch-full hidden></p>
        <p class="xt-pro-msg" role="status" aria-live="polite"></p>
      </form>
    </div>`;
}

/** "Your free trial" card (filled by the inline script when the URL carries #t=<manage token>). */
function trialCard(c: ProCopy): string {
  const copy = { ...c.trial, startH: undefined, startIntro: undefined, startNote: undefined, handleLabel: undefined, emailLabel: undefined, start: undefined };
  return `<div id="xt-trial-card" class="xt-watch xt-trial-card" role="region" aria-labelledby="xt-trial-h" hidden data-copy="${esc(JSON.stringify(copy))}">
    <p class="xt-pro-now-h" id="xt-trial-h">${esc(c.trial.h)}</p>
    <div data-trial-body></div>
  </div>`;
}

/** Free-trial start form in the Watch feature area; shown by the script only when GET /api/watch/trial/config says available. */
function trialStart(t: TrialCopy): string {
  return `<div id="xt-trial-start" class="xt-watch xt-trial-start" role="region" aria-labelledby="xt-trial-start-h" hidden>
    <h3 id="xt-trial-start-h">${esc(t.startH)}</h3>
    <p>${esc(t.startIntro)}</p>
    <form class="xt-watch-add" autocomplete="on" novalidate>
      <label for="xt-trial-handle">${esc(t.handleLabel)}</label>
      <div class="xt-pro-row"><input id="xt-trial-handle" name="handle" type="text" spellcheck="false" autocapitalize="none" autocomplete="off" placeholder="@username" maxlength="100" required dir="ltr" /></div>
      <label for="xt-trial-email">${esc(t.emailLabel)}</label>
      <div class="xt-pro-row">
        <input id="xt-trial-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" maxlength="254" required dir="ltr" />
        <button type="submit">${esc(t.start)}</button>
      </div>
      <p class="xt-watch-hint">${esc(t.startNote)}</p>
      <p class="xt-pro-msg" role="status" aria-live="polite"></p>
    </form>
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
    ${watchBox(c.watch)}
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
  <p id="xt-watch-notice" class="xt-pro-success" role="status" hidden data-ok="${esc(c.watch.verified)}" data-fail="${esc(c.watch.verifyFailed)}"></p>
  ${trialCard(c)}
  <p>${c.pitch}</p>
  <h2>${esc(c.featuresH2)}</h2>
  <ul class="xt-pro-features">${c.features.map(f => `<li>${f}</li>`).join('')}</ul>
  ${trialStart(c.trial)}
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
    '<strong id="watch">Watch: never miss a deleted post.</strong> Add up to 5 public X accounts (2 on the lifetime plan) and Xtracticle checks them every hour. When a post disappears you get its text, date and media links (plus a Wayback copy when one exists) in a private RSS / JSON feed and, if you want, a daily e-mail digest. New posts can be reported too. No login to X, nothing to connect.',
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
  watch: {
    h: 'Watch',
    intro: 'Xtracticle checks these public accounts every hour and keeps the text of posts that get deleted. Read the results here, in your private feed or in a daily e-mail.',
    count: '{n} of {limit} accounts',
    full: 'All {limit} accounts are in use. Remove one to add another.',
    loading: 'Loading your watch list…',
    empty: 'You are not watching any account yet. Add one below.',
    failed: 'Your watch list could not be loaded. Please reload the page in a minute.',
    unavailable: 'Watch is not available yet. It will appear here as soon as it opens.',
    handleLabel: 'Add an account',
    modeLabel: 'Report',
    modes: { deleted: 'Deleted posts', new: 'New posts', both: 'Deleted and new posts' },
    add: 'Watch',
    adding: 'Checking the account…',
    added: 'Now watching {handle}. Its latest posts are saved as the starting point; changes show up after the next hourly check.',
    removed: 'Stopped watching {handle}.',
    err: {
      exists: 'You are already watching {handle}.',
      bad_handle: 'That does not look like an X username.',
      not_found: 'No X account with this name was found.',
      protected: 'This account is protected. Watch only works with public accounts.',
      blocklisted: 'The owner of this account asked not to be watched, so it cannot be added.',
      limit_reached: 'Your plan watches up to {limit} accounts. Remove one to add another.',
      upstream: 'X could not be reached just now. Please try again in a minute.',
      pro_required: 'Pro is no longer active in this browser. Reload the page and enter your license key again.',
      rate: 'Too many requests. Please wait a few seconds and try again.',
      network: 'Network error — please check your connection and try again.',
      generic: 'Something went wrong. Please try again.',
    },
    status: { active: 'Active', paused: 'Paused', protected: 'Protected', gone: 'Account gone' },
    statusNote: {
      paused: 'Paused at the account owner’s request. Nothing new is collected.',
      protected: 'The account became protected, so checks are paused.',
      gone: 'The account no longer exists on X, so checks are paused.',
    },
    lastCheck: 'checked {date}',
    notChecked: 'first check within an hour',
    emailNone: 'no e-mail',
    emailPending: '{email} (waiting for confirmation)',
    emailOk: 'daily e-mail to {email}',
    feed: 'Private feed',
    feedNote: 'Keep these links to yourself: anyone who has them can read this feed.',
    copy: 'Copy',
    copied: 'Copied',
    recent: 'Recent',
    noEvents: 'Nothing detected yet.',
    events: { deleted: 'Deleted', new: 'New post', protected: 'Became protected', gone: 'Account gone', renamed: 'Renamed' },
    onX: 'On X',
    archived: 'Archived copy',
    markdown: 'Markdown',
    modeSaved: 'Saved.',
    emailBtn: 'E-mail digest',
    emailLabel: 'Send the daily digest to',
    emailSave: 'Save',
    emailClear: 'Remove address',
    emailHint: 'We first send a confirmation link (valid for 24 hours). Nothing else is mailed until you click it, and every digest has an unsubscribe link.',
    emailSent: 'Confirmation link sent to {email}. Click it within 24 hours to start the daily digest.',
    emailConfirmed: '{email} is confirmed. The daily digest goes there.',
    emailWaiting: 'Still waiting for you to confirm {email}. For a new link, remove the address and add it again.',
    emailNoSend: 'Address saved, but e-mail delivery is not switched on yet, so no confirmation link was sent. Use the feed for now.',
    emailCleared: 'E-mail address removed.',
    emailBad: 'Please enter a valid e-mail address.',
    remove: 'Stop watching',
    confirmRemove: 'Stop watching {handle}? Its feed links stop working.',
    removeYes: 'Yes, stop',
    cancel: 'Cancel',
    verified: 'Your e-mail address is confirmed. The daily Watch digest will arrive there.',
    verifyFailed: 'This confirmation link no longer works (each link works once, for 24 hours). Set the address again on the watch to get a new one.',
  },
  trial: {
    notice: {
      verified: 'Your e-mail address is confirmed and the free trial has started. From now on the account is checked about every hour.',
      verify_failed: 'This trial link no longer works (each link works once, for 24 hours). Start the trial again to get a new one.',
      full: 'All free trial places are taken right now, so your trial could not start yet. Your request stays open for 24 hours: open the link in the e-mail again later.',
      disabled: 'Free trials are paused right now, so your trial could not start yet. Your request stays open for 24 hours: open the link in the e-mail again later.',
    },
    h: 'Your free trial',
    loading: 'Loading your trial…',
    failed: 'Your trial could not be loaded. Please reload the page in a minute.',
    invalid: 'This trial link is not valid. Open the newest link from your Xtracticle e-mail.',
    status: { pending: 'Waiting for confirmation', active: 'Free trial', ended: 'Ended' },
    pending: 'Click the link we sent to {email} to start the {days} days. The link works for 24 hours.',
    daysLeft: '{n} days left · ends {date}',
    lastDay: 'Last day · ends {date}',
    endedOn: 'Ended {date}.',
    endedNote: 'The watch has stopped and its feed links no longer work. Events found during the trial are kept for 90 days after they were detected.',
    noEventsEnded: 'Nothing was detected during the trial.',
    keep: 'Keep watching with Pro',
    keepNote: 'Pro watches up to 5 accounts, from $3/month. Add {handle} there and the events found during the trial show up in its list.',
    end: 'End trial',
    cancelRequest: 'Cancel request',
    confirmEnd: 'End the free trial for {handle} now? The watch stops, its feed links stop working, and this e-mail address cannot start another trial.',
    confirmCancel: 'Cancel this trial request? Nothing has been watched yet, and you can start again.',
    ended: 'Your trial has ended. Nothing more is checked or mailed.',
    cancelled: 'Request cancelled. You can start a new trial with this address.',
    startH: 'Try Watch free for 14 days',
    startIntro: 'Watch one public account for 14 days. No card, no license key: enter the account and your e-mail address, click the link we send you, and the trial starts.',
    handleLabel: 'Account to watch',
    emailLabel: 'Your e-mail address',
    start: 'Start free trial',
    starting: 'Checking the account…',
    sent: 'Check your inbox at {email} — confirm to start watching {handle}.',
    sentHint: 'The link works for 24 hours. Nothing is watched or mailed until you click it.',
    startNote: 'One trial per e-mail address. Nothing is charged: when the 14 days are over, the watch simply stops.',
    err: {
      trial_used: 'This address has already had its free trial (one per address). To keep watching, pick a plan under Pricing.',
      trial_pending: 'We already sent a confirmation link to this address. Check your inbox and spam folder; the link works for 24 hours.',
      trial_full: 'All free trial places are taken right now. Please try again in a few days.',
      trial_disabled: 'Free trials are paused right now. Please try again later.',
      trial_ended: 'This trial has already ended.',
      mail_failed: 'The confirmation e-mail could not be sent. Check the address and try again.',
      bad_email: 'Please enter a valid e-mail address.',
      bad_handle: 'That does not look like an X username.',
      not_found: 'No X account with this name was found.',
      protected: 'This account is protected. Watch only works with public accounts.',
      blocklisted: 'The owner of this account asked not to be watched, so it cannot be added.',
      upstream: 'X could not be reached just now. Please try again in a minute.',
      rate: 'Too many attempts. Please wait a minute and try again.',
      network: 'Network error — please check your connection and try again.',
      generic: 'Something went wrong. Please try again.',
    },
  },
  faq: [
    { q: 'How do I get my license key?', a: 'Right after checkout Gumroad shows your license key on the receipt page and e-mails it to you (it is also on the product’s download page on Gumroad). Paste it into the form on this page and Pro is active in that browser.' },
    { q: 'Do I need an account?', a: 'No. Xtracticle has no accounts. The key is the only thing we check; it is stored encrypted in a cookie on your device for 30 days at a time and renews itself as long as your plan is active.' },
    { q: 'On how many devices does a key work?', a: 'On every device you use: enter the same key in each browser. The key is checked once a day, so it keeps working as long as your plan is active.' },
    { q: 'Can I cancel?', a: 'Yes, anytime, from the “Manage membership” link in your Gumroad receipt or subscription e-mail. Pro stays active until the end of the period you paid for. The lifetime plan is a single payment with nothing to cancel.' },
    { q: 'Is there a refund?', a: 'Yes: 14 days, no questions asked. Open an issue on GitHub or message @DvciAhmet on X and the payment is refunded.' },
    { q: 'Is there a free trial?', a: 'Yes, for Watch: one public account for 14 days, free. Enter the account and your e-mail address on this page or under an account’s archived posts in the Deleted Tweet Tracker, then click the confirmation link we send; the 14 days start with that click. No card and no license key are needed, and nothing is charged: when the trial is over the watch simply stops (you get one e-mail two days before and one at the end). There is one trial per e-mail address. To keep watching, or to watch up to 5 accounts, get Pro.' },
    { q: 'How does Watch notice a deleted post, and how quickly?', a: 'Once an hour Xtracticle reads the latest ~40 public posts of each watched account and compares them with the previous check. A post that is missing is looked up again, and only when X confirms it no longer exists is it reported as deleted, with the text saved earlier. So a deletion shows up within about an hour. A post that is published and deleted between two checks, or one older than the latest ~40, cannot be caught.' },
    { q: 'What does “public accounts only” mean? Can an account owner opt out?', a: 'Watch reads only what anyone can see on X without logging in. Protected accounts cannot be added, and if a watched account becomes protected, its checks stop. Saved post text is kept for 90 days. If you own an account and do not want it watched, write to us through the contact on the privacy page (xtracticle.com/privacy): the account is blocked from Watch and everything saved about it is deleted.' },
    { q: 'Is Watch included in the lifetime plan?', a: 'Yes. The lifetime plan watches 2 accounts; the monthly and yearly plans watch 5. You can swap accounts at any time.' },
    { q: 'Does Pro change what free users get?', a: 'No. Single posts, threads, Articles, every export format, the first 50 archived posts and batches of 20 stay free, with no ads and no login.' },
    { q: 'Where do I ask questions?', a: `Open an issue on GitHub (${GITHUB.replace('https://', '')}) or send a message to @DvciAhmet on X.` },
  ],
};
