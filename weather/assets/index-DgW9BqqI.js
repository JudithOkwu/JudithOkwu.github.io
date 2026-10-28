(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://geocoding-api.open-meteo.com/v1/search`,t=`https://api.open-meteo.com/v1/forecast`,n=class extends Error{constructor(e,t){super(t),this.name=`WeatherError`,this.kind=e}},r=(...e)=>globalThis.fetch(...e),i=`We can't reach the weather service. Check your internet connection and try again.`;async function a(e,t){if(globalThis.navigator?.onLine===!1)throw new n(`offline`,i);let r;try{r=await t(e)}catch{throw new n(`offline`,i)}if(!r.ok)throw new n(`server`,`The weather service is having trouble right now. Please try again in a moment.`);return r.json()}function o(e){return{id:e.id,name:e.name,region:e.admin1??``,country:e.country??``,latitude:e.latitude,longitude:e.longitude}}async function s(t,{fetchImpl:i=r,count:s=5}={}){let c=t.trim();if(!c)throw new n(`empty`,`Type a city name to search.`);let l=((await a(`${e}?${new URLSearchParams({name:c,count:s,language:`en`,format:`json`})}`,i)).results??[]).map(o);if(l.length===0)throw new n(`not-found`,`We couldn't find a city called "${c}". Check the spelling or try a nearby larger city.`);return l}function c(e){return e===`imperial`?{temperature_unit:`fahrenheit`,wind_speed_unit:`mph`}:{}}async function l(e,n=`metric`,{fetchImpl:i=r}={}){return d(await a(`${t}?${new URLSearchParams({latitude:e.latitude,longitude:e.longitude,current:`temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m`,daily:`weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max`,timezone:`auto`,forecast_days:6,...c(n)})}`,i))}async function u(e,n=`metric`,{fetchImpl:i=r}={}){let o=await a(`${t}?${new URLSearchParams({latitude:e.latitude,longitude:e.longitude,current:`temperature_2m,is_day,weather_code`,timezone:`auto`,...c(n)})}`,i);return{temperature:o.current.temperature_2m,code:o.current.weather_code,isDay:o.current.is_day===1}}function d(e){let{current:t,daily:n}=e,r=e=>({date:n.time[e],code:n.weather_code[e],max:n.temperature_2m_max[e],min:n.temperature_2m_min[e],precipChance:n.precipitation_probability_max?.[e]??null});return{timezone:e.timezone,localTime:t.time,units:{temperature:e.current_units?.temperature_2m??`°C`,wind:(e.current_units?.wind_speed_10m??`km/h`).replace(`mp/h`,`mph`)},current:{temperature:t.temperature_2m,feelsLike:t.apparent_temperature,humidity:t.relative_humidity_2m,windSpeed:t.wind_speed_10m,code:t.weather_code,isDay:t.is_day===1},today:{...r(0),sunrise:n.sunrise?.[0]??null,sunset:n.sunset?.[0]??null,uvIndex:n.uv_index_max?.[0]??null},days:n.time.slice(1,6).map((e,t)=>r(t+1))}}var f=`weather-dashboard.favourites.v1`,p=`weather-dashboard.last-place.v1`,m=`weather-dashboard.units.v1`;function h(e,t,n){try{let r=e?.getItem(t);return r?JSON.parse(r):n}catch{return n}}function g(e,t,n){try{return e?.setItem(t,JSON.stringify(n)),!0}catch{return!1}}function _({id:e,name:t,region:n=``,country:r=``,latitude:i,longitude:a}){return{id:e,name:t,region:n,country:r,latitude:i,longitude:a}}function ee(e=globalThis.localStorage){let t=h(e,f,[]),n=Array.isArray(t)?t:[],r=()=>g(e,f,n);return{getAll(){return n.map(e=>({...e}))},has(e){return n.some(t=>t.id===e)},add(e){return!this.has(e.id)&&(n.push(_(e)),r(),!0)},remove(e){let t=n.length;return n=n.filter(t=>t.id!==e),n.length!==t&&(r(),!0)},toggle(e){return this.has(e.id)?(this.remove(e.id),!1):(this.add(e),!0)},getLastPlace(){return h(e,p,null)},setLastPlace(t){g(e,p,_(t))},getUnits(){return h(e,m,`metric`)===`imperial`?`imperial`:`metric`},setUnits(t){g(e,m,t)}}}var te={0:[`Clear sky`,`clear`],1:[`Mainly clear`,`clear`],2:[`Partly cloudy`,`partly`],3:[`Overcast`,`cloudy`],45:[`Fog`,`fog`],48:[`Freezing fog`,`fog`],51:[`Light drizzle`,`drizzle`],53:[`Drizzle`,`drizzle`],55:[`Heavy drizzle`,`drizzle`],56:[`Freezing drizzle`,`drizzle`],57:[`Heavy freezing drizzle`,`drizzle`],61:[`Light rain`,`rain`],63:[`Rain`,`rain`],65:[`Heavy rain`,`rain`],66:[`Freezing rain`,`rain`],67:[`Heavy freezing rain`,`rain`],71:[`Light snow`,`snow`],73:[`Snow`,`snow`],75:[`Heavy snow`,`snow`],77:[`Snow grains`,`snow`],80:[`Light showers`,`rain`],81:[`Showers`,`rain`],82:[`Violent showers`,`rain`],85:[`Snow showers`,`snow`],86:[`Heavy snow showers`,`snow`],95:[`Thunderstorm`,`storm`],96:[`Thunderstorm with hail`,`storm`],99:[`Severe thunderstorm with hail`,`storm`]},ne={clear:`sunny`,partly:`sunny`,cloudy:`cloudy`,fog:`cloudy`,drizzle:`rain`,rain:`rain`,snow:`snow`,storm:`storm`},re=new Set([`sunny`,`cloudy`]);function v(e,t=!0){let[n,r]=te[e]??[`Unknown`,`cloudy`],i=ne[r];return{label:n,icon:r,theme:!t&&re.has(i)?`night`:i}}var y=e=>Math.round(e*10)/10;function b(e,t,n){return`
    <g class="i-sun-rays" style="transform-origin:${e}px ${t}px" stroke="#FFC94A" stroke-width="3.5" stroke-linecap="round">${Array.from({length:8},(r,i)=>{let a=i*Math.PI/4,o=n+4,s=n+9;return`<line x1="${y(e+Math.cos(a)*o)}" y1="${y(t+Math.sin(a)*o)}" x2="${y(e+Math.cos(a)*s)}" y2="${y(t+Math.sin(a)*s)}"/>`}).join(``)}</g>
    <circle cx="${e}" cy="${t}" r="${n}" fill="#FFC94A"/>`}function x(e=0,t=0,n=1){return`<path transform="translate(${e} ${t}) scale(${n})" fill="#E9EEFF"
    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`}function S(e=0,t=0,n=`#FFFFFF`){return`<path class="i-cloud" transform="translate(${e} ${t})" fill="${n}"
    d="M20 46h26a10 10 0 0 0 0-20 14 14 0 0 0-26.5 4A8 8 0 0 0 20 46z"/>`}function C(e,t){return[18,30,42].map((n,r)=>`<line class="i-drop" style="animation-delay:${r*.25}s" x1="${n+4}" y1="46" x2="${n+4-t/3}" y2="${46+t}" stroke="${e}" stroke-width="3.5" stroke-linecap="round"/>`).join(``)}var ie=[20,32,44].map((e,t)=>`<circle class="i-flake" style="animation-delay:${t*.35}s" cx="${e+2}" cy="${50+t%2*5}" r="3" fill="#FFFFFF"/>`).join(``),w={clear:e=>e?b(32,32,12):x(4,4,2.4),partly:e=>(e?b(24,24,9):x(0,0,1.9))+S(6,8),cloudy:()=>S(-6,0,`#C9D4E5`)+S(4,8),fog:()=>S(0,-4,`#DDE4EE`)+`<g stroke="#DDE4EE" stroke-width="3.5" stroke-linecap="round" opacity=".85">
      <line x1="12" y1="50" x2="44" y2="50"/><line x1="20" y1="57" x2="52" y2="57"/></g>`,drizzle:()=>S(0,-6)+C(`#7FD0FF`,5),rain:()=>S(0,-6,`#E3EAF4`)+C(`#5BB8FF`,10),snow:()=>S(0,-6)+ie,storm:()=>S(0,-8,`#AEB9CC`)+`<polygon class="i-bolt" fill="#FFD23F" points="33,38 24,52 31,52 27,63 41,46 34,46 38,38"/>`};function T(e,t=!0,n=``){return`<svg class="wx-icon ${n}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${(w[e]??w.cloudy)(t)}</svg>`}function E(e){return[e.region,e.country].filter(t=>t&&t!==e.name).join(`, `)}function D(e){return`${Math.round(e)}°`}function O(e){if(!e)return`—`;let[t,n]=e.split(`T`)[1].split(`:`).map(Number),r=t<12?`AM`:`PM`;return`${t%12||12}:${String(n).padStart(2,`0`)} ${r}`}function ae(e){return new Date(`${e}T12:00:00Z`).toLocaleDateString(`en-GB`,{weekday:`short`,timeZone:`UTC`})}function oe(e){let t=e.split(`T`)[0];return new Date(`${t}T12:00:00Z`).toLocaleDateString(`en-GB`,{weekday:`long`,day:`numeric`,month:`long`,timeZone:`UTC`})}function se(e){if(e==null)return`—`;let t=Math.round(e);return t<=2?`${t} · Low`:t<=5?`${t} · Moderate`:t<=7?`${t} · High`:t<=10?`${t} · Very high`:`${t} · Extreme`}function k(e){return String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}var ce=[`London`,`Lagos`,`New York`,`Tokyo`,`Sydney`];function A(){return`
    <div class="chips">
      ${ce.map(e=>`<button type="button" class="chip" data-action="pick" data-city="${k(e)}">${k(e)}</button>`).join(``)}
    </div>`}function le(){return`
    <article class="panel state state--welcome">
      ${T(`partly`,!0,`state__icon`)}
      <h1>What's the sky doing?</h1>
      <p>Search for any city to see the weather right now and the next five days.</p>
      ${A()}
    </article>`}function ue(){return`
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
    </div>`}var de={"not-found":{title:`We couldn't find that city`,icon:`fog`},offline:{title:`You're offline`,icon:`storm`},server:{title:`The weather service is down`,icon:`rain`}};function fe(e,{backTo:t}={}){let n=de[e.kind]??{title:`Something went wrong`,icon:`cloudy`},r=e.name===`WeatherError`?e.message:`Something unexpected happened while loading the weather. Please try again.`,i=e.kind!==`not-found`;return`
    <article class="panel state state--error" role="alert">
      ${T(n.icon,!0,`state__icon`)}
      <h1>${k(n.title)}</h1>
      <p>${k(r)}</p>
      <div class="state__actions">
        ${i?`<button type="button" class="btn btn--primary" data-action="retry">Try again</button>`:``}
        ${t?`<button type="button" class="btn" data-action="back">Back to ${k(t)}</button>`:``}
      </div>
      ${e.kind===`not-found`?`<p class="state__hint">Or try one of these:</p>${A()}`:``}
    </article>`}function pe(){return`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>`}function j(e,t,n=``){return`
    <div class="detail panel">
      <span class="detail__label">${e}</span>
      <span class="detail__value">${t}</span>
      ${n?`<span class="detail__hint">${n}</span>`:``}
    </div>`}function me(e,t,n){let{label:r,icon:i}=v(e.code,!0),a=n-t||1,o=(e.min-t)/a*100,s=(e.max-e.min)/a*100,c=e.precipChance!=null&&e.precipChance>=20?`<span class="day__rain">${e.precipChance}% rain</span>`:`<span class="day__rain day__rain--none">Dry</span>`;return`
    <li class="day">
      <span class="day__name">${ae(e.date)}</span>
      ${T(i,!0,`day__icon`)}
      <span class="day__label">${k(r)}</span>
      <span class="day__temps">
        <span class="day__min">${D(e.min)}</span>
        <span class="range" aria-hidden="true"><span style="left:${o.toFixed(1)}%;width:${Math.max(s,6).toFixed(1)}%"></span></span>
        <span class="day__max">${D(e.max)}</span>
      </span>
      ${c}
    </li>`}function he({place:e,forecast:t,isFavourite:n,alternatives:r=[]}){let{current:i,today:a,days:o,units:s}=t,{label:c,icon:l}=v(i.code,i.isDay),u=E(e),d=s.temperature.replace(`°`,``),f=Math.min(...o.map(e=>e.min)),p=Math.max(...o.map(e=>e.max)),m=r.length?`
      <div class="alternatives">
        <span>Not the right ${k(e.name)}?</span>
        ${r.map((e,t)=>`<button type="button" class="chip chip--small" data-action="alt" data-index="${t}">${k([e.name,E(e)].filter(Boolean).join(`, `))}</button>`).join(``)}
      </div>`:``;return`
    <article class="panel hero">
      <div class="hero__top">
        <div>
          <h1 class="hero__city">${k(e.name)}</h1>
          <p class="hero__meta">
            ${u?`${k(u)} · `:``}${oe(t.localTime)}, ${O(t.localTime)}
          </p>
        </div>
        <button type="button" class="star${n?` is-on`:``}" data-action="toggle-favourite"
          aria-pressed="${n}" aria-label="${n?`Remove from`:`Add to`} favourites"
          title="${n?`Remove from`:`Add to`} favourites">
          ${pe()}
        </button>
      </div>

      <div class="hero__body">
        ${T(l,i.isDay,`hero__icon`)}
        <div class="hero__temp">
          ${Math.round(i.temperature)}<span class="hero__unit">°${d}</span>
        </div>
        <div class="hero__cond">
          <p class="hero__label">${k(c)}</p>
          <p class="hero__range">H ${D(a.max)} · L ${D(a.min)}</p>
        </div>
      </div>
    </article>

    ${m}

    <div class="details">
      ${j(`Feels like`,D(i.feelsLike))}
      ${j(`Humidity`,`${Math.round(i.humidity)}%`)}
      ${j(`Wind`,`${Math.round(i.windSpeed)} <small>${k(s.wind)}</small>`)}
      ${j(`Chance of rain`,a.precipChance==null?`—`:`${a.precipChance}%`,`today`)}
      ${j(`UV index`,se(a.uvIndex),`max today`)}
      ${j(`Sunrise`,O(a.sunrise),`Sunset ${O(a.sunset)}`)}
    </div>

    <section class="panel forecast" aria-labelledby="forecast-title">
      <h2 id="forecast-title">5-day forecast</h2>
      <ol class="days">${o.map(e=>me(e,f,p)).join(``)}</ol>
    </section>`}function ge(e,{active:t}){let n=E(e);return`
    <li class="fav${t?` is-active`:``}" data-id="${k(e.id)}">
      <button type="button" class="fav__open" data-action="open">
        <span class="fav__icon" data-slot="icon"><span class="skeleton skeleton--dot"></span></span>
        <span class="fav__text">
          <span class="fav__name">${k(e.name)}</span>
          ${n?`<span class="fav__where">${k(n)}</span>`:``}
        </span>
        <span class="fav__temp" data-slot="temp">…</span>
      </button>
      <button type="button" class="fav__remove" data-action="remove"
        aria-label="Remove ${k(e.name)} from favourites" title="Remove">×</button>
    </li>`}function _e(e,t){let n=e.querySelector(`[data-slot="icon"]`),r=e.querySelector(`[data-slot="temp"]`);if(!t){n.innerHTML=``,r.textContent=`—`,r.title=`Couldn't load the weather`;return}let{icon:i,label:a}=v(t.code,t.isDay);n.innerHTML=T(i,t.isDay),n.title=a,r.textContent=D(t.temperature)}var M=ee(),N=e=>document.querySelector(e),P=N(`#main`),F=N(`#search-form`),I=N(`#search-input`),L=N(`#search-btn`),R=N(`#fav-list`),ve=N(`#fav-empty`),ye=N(`#fav-count`),z=document.querySelectorAll(`[data-units]`),B=M.getUnits(),V=null,H=null,U=null,W=0,be=6e5,G=new Map;function K(e){P.setAttribute(`aria-busy`,String(e)),L.classList.toggle(`is-loading`,e),L.disabled=e,e&&(P.innerHTML=ue())}function q(e){document.body.dataset.theme=e}function J(){let{place:e,forecast:t}=V;P.innerHTML=he({...V,isFavourite:M.has(e.id)}),q(v(t.current.code,t.current.isDay).theme),document.title=`${e.name} · ${Math.round(t.current.temperature)}° · Skycast`}function xe(e){U=e,P.innerHTML=fe(e,{backTo:V?.place.name}),document.title=`Skycast · Weather Dashboard`,V||q(e.kind===`offline`?`storm`:`cloudy`)}async function Y(e){let t=++W;U=null,K(!0);try{await e(()=>t===W)}catch(e){if(t!==W)return;e instanceof n||console.error(e),xe(e)}finally{t===W&&K(!1)}}function X(e,t=[]){return H=()=>X(e,t),Y(async n=>{let r=await l(e,B);n()&&(V={place:e,forecast:r,alternatives:t},M.setLastPlace(e),J(),Q())})}function Z(e){return H=()=>Z(e),Y(async t=>{let[n,...r]=await s(e);if(!t())return;let i=await l(n,B);t()&&(V={place:n,forecast:i,alternatives:r},M.setLastPlace(n),H=()=>X(n,r),J(),Q())})}async function Se(e){let t=`${e.id}:${B}`,n=G.get(t);if(n&&Date.now()-n.at<be)return n.weather;let r=await u(e,B);return G.set(t,{weather:r,at:Date.now()}),r}function Q(){let e=M.getAll();ye.textContent=e.length,ve.hidden=e.length>0,R.innerHTML=e.map(e=>ge(e,{active:V?.place.id===e.id})).join(``),e.forEach(e=>{Se(e).catch(()=>null).then(t=>{let n=R.querySelector(`[data-id="${CSS.escape(String(e.id))}"]`);n&&_e(n,t)})})}function Ce(){V&&(M.toggle(V.place),J(),Q())}function we(e){e!==B&&(B=e,M.setUnits(B),Te(),Q(),V&&X(V.place,V.alternatives))}function Te(){z.forEach(e=>{e.setAttribute(`aria-pressed`,String(e.dataset.units===B))})}F.addEventListener(`submit`,e=>{e.preventDefault();let t=I.value.trim();t?(I.blur(),Z(t)):(F.classList.remove(`shake`),F.offsetWidth,F.classList.add(`shake`),I.focus())}),P.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(t)switch(t.dataset.action){case`toggle-favourite`:Ce();break;case`retry`:H?.();break;case`back`:U=null,V&&J();break;case`pick`:I.value=t.dataset.city,Z(t.dataset.city);break;case`alt`:{let{place:e,alternatives:n}=V,r=Number(t.dataset.index),i=n[r];X(i,[e,...n.filter((e,t)=>t!==r)]);break}}}),R.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.closest(`.fav`).dataset.id,r=M.getAll().find(e=>String(e.id)===n);r&&(t.dataset.action===`remove`?(M.remove(r.id),V?.place.id===r.id&&!U&&J(),Q()):(X(r),window.scrollTo({top:0,behavior:`smooth`})))}),z.forEach(e=>{e.addEventListener(`click`,()=>we(e.dataset.units))}),window.addEventListener(`online`,()=>{U?.kind===`offline`&&H?.(),Q()}),Te(),Q();var $=new URLSearchParams(location.search).get(`city`)?.trim(),Ee=M.getLastPlace()??M.getAll()[0];$?(I.value=$,Z($)):Ee?X(Ee):P.innerHTML=le();