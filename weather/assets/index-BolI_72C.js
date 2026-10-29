(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://geocoding-api.open-meteo.com/v1/search`,t=`https://api.open-meteo.com/v1/forecast`,n=class extends Error{constructor(e,t){super(t),this.name=`WeatherError`,this.kind=e}},r=(...e)=>globalThis.fetch(...e),i=`We can't reach the weather service. Check your internet connection and try again.`;async function a(e,t){if(globalThis.navigator?.onLine===!1)throw new n(`offline`,i);let r;try{r=await t(e)}catch{throw new n(`offline`,i)}if(!r.ok)throw new n(`server`,`The weather service is having trouble right now. Please try again in a moment.`);return r.json()}function o(e){return{id:e.id,name:e.name,region:e.admin1??``,country:e.country??``,latitude:e.latitude,longitude:e.longitude}}var s={AL:`Alabama`,AK:`Alaska`,AZ:`Arizona`,AR:`Arkansas`,CA:`California`,CO:`Colorado`,CT:`Connecticut`,DE:`Delaware`,DC:`District of Columbia`,FL:`Florida`,GA:`Georgia`,HI:`Hawaii`,ID:`Idaho`,IL:`Illinois`,IN:`Indiana`,IA:`Iowa`,KS:`Kansas`,KY:`Kentucky`,LA:`Louisiana`,ME:`Maine`,MD:`Maryland`,MA:`Massachusetts`,MI:`Michigan`,MN:`Minnesota`,MS:`Mississippi`,MO:`Missouri`,MT:`Montana`,NE:`Nebraska`,NV:`Nevada`,NH:`New Hampshire`,NJ:`New Jersey`,NM:`New Mexico`,NY:`New York`,NC:`North Carolina`,ND:`North Dakota`,OH:`Ohio`,OK:`Oklahoma`,OR:`Oregon`,PA:`Pennsylvania`,RI:`Rhode Island`,SC:`South Carolina`,SD:`South Dakota`,TN:`Tennessee`,TX:`Texas`,UT:`Utah`,VT:`Vermont`,VA:`Virginia`,WA:`Washington`,WV:`West Virginia`,WI:`Wisconsin`,WY:`Wyoming`},c={us:`United States`,usa:`United States`,uk:`United Kingdom`,uae:`United Arab Emirates`,netherlands:`The Netherlands`,holland:`The Netherlands`};function ee(e){let[t,...n]=e.split(`,`);return{name:t.trim(),within:n.join(`,`).trim()}}function l(e,t){let n=t.toLowerCase(),r=[n,s[t.toUpperCase()],c[n]].filter(Boolean).map(e=>e.toLowerCase());return[e.region,e.country].some(e=>{let t=e.toLowerCase();return t?r.includes(t)||n.length>=3&&t.startsWith(n):!1})}async function u(t,{fetchImpl:i=r,count:s=10}={}){let{name:c,within:u}=ee(t);if(!c)throw new n(`empty`,`Type a city name to search.`);let d=((await a(`${e}?${new URLSearchParams({name:c,count:u?100:s,language:`en`,format:`json`})}`,i)).results??[]).map(o);if(u&&(d=d.filter(e=>l(e,u)).slice(0,s)),d.length===0)throw new n(`not-found`,u?`We couldn't find "${c}" in ${u}. Check the spelling, or search without the state to see every match.`:`We couldn't find a city called "${c}". Check the spelling or try a nearby larger city.`);return d}function d(e){return e===`imperial`?{temperature_unit:`fahrenheit`,wind_speed_unit:`mph`}:{}}async function f(e,n=`metric`,{fetchImpl:i=r}={}){return ne(await a(`${t}?${new URLSearchParams({latitude:e.latitude,longitude:e.longitude,current:`temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m`,daily:`weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max`,timezone:`auto`,forecast_days:6,...d(n)})}`,i))}async function te(e,n=`metric`,{fetchImpl:i=r}={}){let o=await a(`${t}?${new URLSearchParams({latitude:e.latitude,longitude:e.longitude,current:`temperature_2m,is_day,weather_code`,timezone:`auto`,...d(n)})}`,i);return{temperature:o.current.temperature_2m,code:o.current.weather_code,isDay:o.current.is_day===1}}function ne(e){let{current:t,daily:n}=e,r=e=>({date:n.time[e],code:n.weather_code[e],max:n.temperature_2m_max[e],min:n.temperature_2m_min[e],precipChance:n.precipitation_probability_max?.[e]??null});return{timezone:e.timezone,localTime:t.time,units:{temperature:e.current_units?.temperature_2m??`°C`,wind:(e.current_units?.wind_speed_10m??`km/h`).replace(`mp/h`,`mph`)},current:{temperature:t.temperature_2m,feelsLike:t.apparent_temperature,humidity:t.relative_humidity_2m,windSpeed:t.wind_speed_10m,code:t.weather_code,isDay:t.is_day===1},today:{...r(0),sunrise:n.sunrise?.[0]??null,sunset:n.sunset?.[0]??null,uvIndex:n.uv_index_max?.[0]??null},days:n.time.slice(1,6).map((e,t)=>r(t+1))}}var p=`weather-dashboard.favourites.v1`,m=`weather-dashboard.last-place.v1`,re=`weather-dashboard.units.v1`,ie=`weather-dashboard.mode.v1`;function h(e,t,n){try{let r=e?.getItem(t);return r?JSON.parse(r):n}catch{return n}}function g(e,t,n){try{return e?.setItem(t,JSON.stringify(n)),!0}catch{return!1}}function ae({id:e,name:t,region:n=``,country:r=``,latitude:i,longitude:a}){return{id:e,name:t,region:n,country:r,latitude:i,longitude:a}}function oe(e=globalThis.localStorage){let t=h(e,p,[]),n=Array.isArray(t)?t:[],r=()=>g(e,p,n);return{getAll(){return n.map(e=>({...e}))},has(e){return n.some(t=>t.id===e)},add(e){return!this.has(e.id)&&(n.push(ae(e)),r(),!0)},remove(e){let t=n.length;return n=n.filter(t=>t.id!==e),n.length!==t&&(r(),!0)},toggle(e){return this.has(e.id)?(this.remove(e.id),!1):(this.add(e),!0)},getLastPlace(){return h(e,m,null)},setLastPlace(t){g(e,m,ae(t))},getUnits(){return h(e,re,`metric`)===`imperial`?`imperial`:`metric`},setUnits(t){g(e,re,t)},getMode(){let t=h(e,ie,null);return t===`light`||t===`dark`?t:null},setMode(t){g(e,ie,t)}}}var se={0:[`Clear sky`,`clear`],1:[`Mainly clear`,`clear`],2:[`Partly cloudy`,`partly`],3:[`Overcast`,`cloudy`],45:[`Fog`,`fog`],48:[`Freezing fog`,`fog`],51:[`Light drizzle`,`drizzle`],53:[`Drizzle`,`drizzle`],55:[`Heavy drizzle`,`drizzle`],56:[`Freezing drizzle`,`drizzle`],57:[`Heavy freezing drizzle`,`drizzle`],61:[`Light rain`,`rain`],63:[`Rain`,`rain`],65:[`Heavy rain`,`rain`],66:[`Freezing rain`,`rain`],67:[`Heavy freezing rain`,`rain`],71:[`Light snow`,`snow`],73:[`Snow`,`snow`],75:[`Heavy snow`,`snow`],77:[`Snow grains`,`snow`],80:[`Light showers`,`rain`],81:[`Showers`,`rain`],82:[`Violent showers`,`rain`],85:[`Snow showers`,`snow`],86:[`Heavy snow showers`,`snow`],95:[`Thunderstorm`,`storm`],96:[`Thunderstorm with hail`,`storm`],99:[`Severe thunderstorm with hail`,`storm`]},ce={clear:`sunny`,partly:`sunny`,cloudy:`cloudy`,fog:`cloudy`,drizzle:`rain`,rain:`rain`,snow:`snow`,storm:`storm`},le=new Set([`sunny`,`cloudy`]);function _(e,t=!0){let[n,r]=se[e]??[`Unknown`,`cloudy`],i=ce[r];return{label:n,icon:r,theme:!t&&le.has(i)?`night`:i}}var ue=[{region:`Africa`,cities:[`Lagos, Nigeria`,`Abuja, Nigeria`,`Port Harcourt, Nigeria`,`Ibadan, Nigeria`,`Kano, Nigeria`,`Enugu, Nigeria`,`Benin City, Nigeria`,`Accra, Ghana`,`Kumasi, Ghana`,`Nairobi, Kenya`,`Cairo, Egypt`,`Cape Town, South Africa`,`Johannesburg, South Africa`]},{region:`North America`,cities:[`New York, New York`,`Los Angeles, California`,`Chicago, Illinois`,`Houston, Texas`,`Dallas, Texas`,`Miami, Florida`,`Atlanta, Georgia`,`Washington, DC`,`Boston, Massachusetts`,`San Francisco, California`,`Seattle, Washington`,`Toronto, Ontario`,`Vancouver, British Columbia`,`Montreal, Quebec`,`Mexico City, Mexico`]},{region:`Europe`,cities:[`London, United Kingdom`,`Manchester, United Kingdom`,`Edinburgh, United Kingdom`,`Dublin, Ireland`,`Paris, France`,`Berlin, Germany`,`Amsterdam, Netherlands`,`Madrid, Spain`,`Lisbon, Portugal`,`Rome, Italy`]},{region:`Asia & Middle East`,cities:[`Dubai, United Arab Emirates`,`Mumbai, India`,`Delhi, India`,`Bangkok, Thailand`,`Singapore, Singapore`,`Beijing, China`,`Seoul, South Korea`,`Tokyo, Japan`]},{region:`Oceania`,cities:[`Sydney, Australia`,`Melbourne, Australia`,`Auckland, New Zealand`]},{region:`South America`,cities:[`São Paulo, Brazil`,`Rio de Janeiro, Brazil`,`Buenos Aires, Argentina`,`Lima, Peru`]}],v=e=>Math.round(e*10)/10;function y(e,t,n){return`
    <g class="i-sun-rays" style="transform-origin:${e}px ${t}px" stroke="#FFC94A" stroke-width="3.5" stroke-linecap="round">${Array.from({length:8},(r,i)=>{let a=i*Math.PI/4,o=n+4,s=n+9;return`<line x1="${v(e+Math.cos(a)*o)}" y1="${v(t+Math.sin(a)*o)}" x2="${v(e+Math.cos(a)*s)}" y2="${v(t+Math.sin(a)*s)}"/>`}).join(``)}</g>
    <circle cx="${e}" cy="${t}" r="${n}" fill="#FFC94A"/>`}function b(e=0,t=0,n=1){return`<path transform="translate(${e} ${t}) scale(${n})" fill="#E9EEFF"
    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`}function x(e=0,t=0,n=`#FFFFFF`){return`<path class="i-cloud" transform="translate(${e} ${t})" fill="${n}"
    d="M20 46h26a10 10 0 0 0 0-20 14 14 0 0 0-26.5 4A8 8 0 0 0 20 46z"/>`}function S(e,t){return[18,30,42].map((n,r)=>`<line class="i-drop" style="animation-delay:${r*.25}s" x1="${n+4}" y1="46" x2="${n+4-t/3}" y2="${46+t}" stroke="${e}" stroke-width="3.5" stroke-linecap="round"/>`).join(``)}var de=[20,32,44].map((e,t)=>`<circle class="i-flake" style="animation-delay:${t*.35}s" cx="${e+2}" cy="${50+t%2*5}" r="3" fill="#FFFFFF"/>`).join(``),C={clear:e=>e?y(32,32,12):b(4,4,2.4),partly:e=>(e?y(24,24,9):b(0,0,1.9))+x(6,8),cloudy:()=>x(-6,0,`#C9D4E5`)+x(4,8),fog:()=>x(0,-4,`#DDE4EE`)+`<g stroke="#DDE4EE" stroke-width="3.5" stroke-linecap="round" opacity=".85">
      <line x1="12" y1="50" x2="44" y2="50"/><line x1="20" y1="57" x2="52" y2="57"/></g>`,drizzle:()=>x(0,-6)+S(`#7FD0FF`,5),rain:()=>x(0,-6,`#E3EAF4`)+S(`#5BB8FF`,10),snow:()=>x(0,-6)+de,storm:()=>x(0,-8,`#AEB9CC`)+`<polygon class="i-bolt" fill="#FFD23F" points="33,38 24,52 31,52 27,63 41,46 34,46 38,38"/>`};function w(e,t=!0,n=``){return`<svg class="wx-icon ${n}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${(C[e]??C.cloudy)(t)}</svg>`}function T(e){return[e.region,e.country].filter(t=>t&&t!==e.name).join(`, `)}function E(e){return`${Math.round(e)}°`}function D(e){if(!e)return`—`;let[t,n]=e.split(`T`)[1].split(`:`).map(Number),r=t<12?`AM`:`PM`;return`${t%12||12}:${String(n).padStart(2,`0`)} ${r}`}function fe(e){return new Date(`${e}T12:00:00Z`).toLocaleDateString(`en-GB`,{weekday:`short`,timeZone:`UTC`})}function pe(e){let t=e.split(`T`)[0];return new Date(`${t}T12:00:00Z`).toLocaleDateString(`en-GB`,{weekday:`long`,day:`numeric`,month:`long`,timeZone:`UTC`})}function me(e){if(e==null)return`—`;let t=Math.round(e);return t<=2?`${t} · Low`:t<=5?`${t} · Moderate`:t<=7?`${t} · High`:t<=10?`${t} · Very high`:`${t} · Extreme`}function O(e){return String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function he(){return ue.map(({region:e,cities:t})=>`<optgroup label="${O(e)}">${t.map(e=>`<option value="${O(e)}">${O(e)}</option>`).join(``)}</optgroup>`).join(``)}var ge=[`London`,`Lagos`,`New York`,`Tokyo`,`Sydney`];function k(){return`
    <div class="chips">
      ${ge.map(e=>`<button type="button" class="chip" data-action="pick" data-city="${O(e)}">${O(e)}</button>`).join(``)}
    </div>`}function _e(){return`
    <article class="panel state state--welcome">
      ${w(`partly`,!0,`state__icon`)}
      <h1>What's the sky doing?</h1>
      <p>Search for any city, or choose one from the list, to see the weather right now and the next five days.</p>
      ${k()}
    </article>`}function ve(){return`
    <div class="loading" role="status">
      <span class="visually-hidden">Loading weather…</span>
      <div class="panel skeleton-hero">
        <div class="skeleton skeleton--line" style="width:40%"></div>
        <div class="skeleton skeleton--line skeleton--thin" style="width:28%"></div>
        <div class="skeleton-hero__body">
          <div class="skeleton skeleton--circle"></div>
          <div class="skeleton skeleton--big"></div>
        </div>
      </div>
      <div class="details">${`<div class="skeleton skeleton--tile"></div>`.repeat(6)}</div>
      <div class="panel">
        <div class="skeleton skeleton--line" style="width:30%"></div>
        <div class="days">${`<div class="skeleton skeleton--day"></div>`.repeat(5)}</div>
      </div>
    </div>`}var ye={"not-found":{title:`We couldn't find that city`,icon:`fog`},offline:{title:`You're offline`,icon:`storm`},server:{title:`The weather service is down`,icon:`rain`}};function be(e,{backTo:t}={}){let n=ye[e.kind]??{title:`Something went wrong`,icon:`cloudy`},r=e.name===`WeatherError`?e.message:`Something unexpected happened while loading the weather. Please try again.`,i=e.kind!==`not-found`;return`
    <article class="panel state state--error" role="alert">
      ${w(n.icon,!0,`state__icon`)}
      <h1>${O(n.title)}</h1>
      <p>${O(r)}</p>
      <div class="state__actions">
        ${i?`<button type="button" class="btn btn--primary" data-action="retry">Try again</button>`:``}
        ${t?`<button type="button" class="btn" data-action="back">Back to ${O(t)}</button>`:``}
      </div>
      ${e.kind===`not-found`?`<p class="state__hint">Or try one of these:</p>${k()}`:``}
    </article>`}function xe(){return`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>`}function A(e,t,n=``){return`
    <div class="detail panel">
      <span class="detail__label">${e}</span>
      <span class="detail__value">${t}</span>
      ${n?`<span class="detail__hint">${n}</span>`:``}
    </div>`}function Se(e,t,n){let{label:r,icon:i}=_(e.code,!0),a=n-t||1,o=(e.min-t)/a*100,s=(e.max-e.min)/a*100,c=e.precipChance!=null&&e.precipChance>=20?`<span class="day__rain">${e.precipChance}% rain</span>`:`<span class="day__rain day__rain--none">Dry</span>`;return`
    <li class="day">
      <span class="day__name">${fe(e.date)}</span>
      ${w(i,!0,`day__icon`)}
      <span class="day__label">${O(r)}</span>
      <span class="day__temps">
        <span class="day__min">${E(e.min)}</span>
        <span class="range" aria-hidden="true"><span style="left:${o.toFixed(1)}%;width:${Math.max(s,6).toFixed(1)}%"></span></span>
        <span class="day__max">${E(e.max)}</span>
      </span>
      ${c}
    </li>`}function Ce(e,t){return t.length<2?``:`
    <div class="region-pick">
      <label for="region-select">State or region</label>
      <span class="select">
        <select id="region-select" data-action="pick-region">${t.map((t,n)=>{let r=T(t)||t.name,i=t.name===e.name?r:`${t.name} · ${r}`;return`<option value="${n}"${t.id===e.id?` selected`:``}>${O(i)}</option>`}).join(``)}</select>
      </span>
      <span class="region-pick__count">${t.length} places match</span>
    </div>`}function we({place:e,forecast:t,isFavourite:n,matches:r=[]}){let{current:i,today:a,days:o,units:s}=t,{label:c,icon:ee}=_(i.code,i.isDay),l=T(e),u=s.temperature.replace(`°`,``),d=Math.min(...o.map(e=>e.min)),f=Math.max(...o.map(e=>e.max)),te=Ce(e,r);return`
    <article class="panel hero">
      <div class="hero__top">
        <div>
          <h1 class="hero__city">${O(e.name)}</h1>
          <p class="hero__meta">
            ${l?`${O(l)} · `:``}${pe(t.localTime)}, ${D(t.localTime)}
          </p>
        </div>
        <button type="button" class="star${n?` is-on`:``}" data-action="toggle-favourite"
          aria-pressed="${n}" aria-label="${n?`Remove from`:`Add to`} favourites"
          title="${n?`Remove from`:`Add to`} favourites">
          ${xe()}
        </button>
      </div>

      <div class="hero__body">
        ${w(ee,i.isDay,`hero__icon`)}
        <div class="hero__temp">
          ${Math.round(i.temperature)}<span class="hero__unit">°${u}</span>
        </div>
        <div class="hero__cond">
          <p class="hero__label">${O(c)}</p>
          <p class="hero__range">H ${E(a.max)} · L ${E(a.min)}</p>
        </div>
      </div>
    </article>

    ${te}

    <div class="details">
      ${A(`Feels like`,E(i.feelsLike))}
      ${A(`Humidity`,`${Math.round(i.humidity)}%`)}
      ${A(`Wind`,`${Math.round(i.windSpeed)} <small>${O(s.wind)}</small>`)}
      ${A(`Chance of rain`,a.precipChance==null?`—`:`${a.precipChance}%`,`today`)}
      ${A(`UV index`,me(a.uvIndex),`max today`)}
      ${A(`Sunrise`,D(a.sunrise),`Sunset ${D(a.sunset)}`)}
    </div>

    <section class="panel forecast" aria-labelledby="forecast-title">
      <h2 id="forecast-title">5-day forecast</h2>
      <ol class="days">${o.map(e=>Se(e,d,f)).join(``)}</ol>
    </section>`}function Te(e,{active:t}){let n=T(e);return`
    <li class="fav${t?` is-active`:``}" data-id="${O(e.id)}">
      <button type="button" class="fav__open" data-action="open">
        <span class="fav__icon" data-slot="icon"><span class="skeleton skeleton--dot"></span></span>
        <span class="fav__text">
          <span class="fav__name">${O(e.name)}</span>
          ${n?`<span class="fav__where">${O(n)}</span>`:``}
        </span>
        <span class="fav__temp" data-slot="temp">…</span>
      </button>
      <button type="button" class="fav__remove" data-action="remove"
        aria-label="Remove ${O(e.name)} from favourites" title="Remove">×</button>
    </li>`}function Ee(e,t){let n=e.querySelector(`[data-slot="icon"]`),r=e.querySelector(`[data-slot="temp"]`);if(!t){n.innerHTML=``,r.textContent=`—`,r.title=`Couldn't load the weather`;return}let{icon:i,label:a}=_(t.code,t.isDay);n.innerHTML=w(i,t.isDay),n.title=a,r.textContent=E(t.temperature)}var j=oe(),M=e=>document.querySelector(e),N=M(`#main`),P=M(`#search-form`),F=M(`#search-input`),I=M(`#search-btn`),L=M(`#fav-list`),De=M(`#fav-empty`),Oe=M(`#fav-count`),R=document.querySelectorAll(`[data-units]`),z=M(`#mode-btn`),B=M(`#city-select`),V=j.getUnits(),H=null,U=null,W=null,G=0,ke=6e5,Ae=new Map;function K(e){N.setAttribute(`aria-busy`,String(e)),I.classList.toggle(`is-loading`,e),I.disabled=e,e&&(N.innerHTML=ve())}function je(e){document.body.dataset.theme=e}function q(){let{place:e,forecast:t}=H;N.innerHTML=we({...H,isFavourite:j.has(e.id)}),je(_(t.current.code,t.current.isDay).theme),document.title=`${e.name} · ${Math.round(t.current.temperature)}° · Skycast`}function Me(e){W=e,N.innerHTML=be(e,{backTo:H?.place.name}),document.title=`Skycast · Weather Dashboard`,H||je(e.kind===`offline`?`storm`:`cloudy`)}async function Ne(e){let t=++G;W=null,K(!0);try{await e(()=>t===G)}catch(e){if(t!==G)return;e instanceof n||console.error(e),Me(e)}finally{t===G&&K(!1)}}function J(e,t=[]){return U=()=>J(e,t),Ne(async n=>{let r=await f(e,V);n()&&(H={place:e,forecast:r,matches:t},j.setLastPlace(e),q(),X())})}function Y(e){return U=()=>Y(e),Ne(async t=>{let n=await u(e),[r]=n;if(!t())return;let i=await f(r,V);t()&&(H={place:r,forecast:i,matches:n},j.setLastPlace(r),U=()=>J(r,n),q(),X())})}async function Pe(e){let t=`${e.id}:${V}`,n=Ae.get(t);if(n&&Date.now()-n.at<ke)return n.weather;let r=await te(e,V);return Ae.set(t,{weather:r,at:Date.now()}),r}function X(){let e=j.getAll();Oe.textContent=e.length,De.hidden=e.length>0,L.innerHTML=e.map(e=>Te(e,{active:H?.place.id===e.id})).join(``),e.forEach(e=>{Pe(e).catch(()=>null).then(t=>{let n=L.querySelector(`[data-id="${CSS.escape(String(e.id))}"]`);n&&Ee(n,t)})})}function Fe(){H&&(j.toggle(H.place),q(),X())}function Ie(e){e!==V&&(V=e,j.setUnits(V),Le(),X(),H&&J(H.place,H.matches))}function Le(){R.forEach(e=>{e.setAttribute(`aria-pressed`,String(e.dataset.units===V))})}var Re=window.matchMedia(`(prefers-color-scheme: dark)`);function ze(){return j.getMode()??(Re.matches?`dark`:`light`)}function Z(){let e=ze();document.documentElement.dataset.mode=e;let t=e===`dark`?`light`:`dark`;z.setAttribute(`aria-label`,`Switch to ${t} mode`),z.title=`Switch to ${t} mode`}z.addEventListener(`click`,()=>{j.setMode(ze()===`dark`?`light`:`dark`),Z()}),Re.addEventListener(`change`,Z),P.addEventListener(`submit`,e=>{e.preventDefault();let t=F.value.trim();t?(F.blur(),B.value=``,Y(t)):(P.classList.remove(`shake`),P.offsetWidth,P.classList.add(`shake`),F.focus())}),B.insertAdjacentHTML(`beforeend`,he()),B.addEventListener(`change`,()=>{let e=B.value;e&&(F.value=e,Y(e))}),N.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(t)switch(t.dataset.action){case`toggle-favourite`:Fe();break;case`retry`:U?.();break;case`back`:W=null,H&&q();break;case`pick`:B.value=``,F.value=t.dataset.city,Y(t.dataset.city)}}),N.addEventListener(`change`,e=>{if(e.target.dataset.action!==`pick-region`)return;let{matches:t}=H;J(t[Number(e.target.value)],t)}),L.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.closest(`.fav`).dataset.id,r=j.getAll().find(e=>String(e.id)===n);r&&(t.dataset.action===`remove`?(j.remove(r.id),H?.place.id===r.id&&!W&&q(),X()):(B.value=``,J(r),window.scrollTo({top:0,behavior:`smooth`})))}),R.forEach(e=>{e.addEventListener(`click`,()=>Ie(e.dataset.units))}),window.addEventListener(`online`,()=>{W?.kind===`offline`&&U?.(),X()}),Z(),Le(),X();var Q=new URLSearchParams(location.search).get(`city`)?.trim(),$=j.getLastPlace()??j.getAll()[0];Q?(F.value=Q,Y(Q)):$?J($):N.innerHTML=_e();