(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=550,t=600,n={locations:`📍`,items:`📦`,professions:`👔`,animals:`🐾`,food:`🍽️`,plants:`🌿`},r={locations:{},items:{},professions:{},animals:{},food:{},plants:{}},i={themes:[],themesError:null,selectedThemeIndex:0,words:[],wordsLoaded:!1,wordsLoading:!1,wordsError:null,secretWord:null,players:[],roundPlayers:[],spyIndex:null,currentPlayerIndex:0,rolePhase:`handoff`,screen:`setup`},a=document.querySelector(`#app`),o=document.querySelector(`#overlay`),s=`spy-game-players`;function c(){try{let e=localStorage.getItem(s);if(!e)return;let t=JSON.parse(e);if(!Array.isArray(t))return;i.players=t.filter(e=>typeof e==`string`).map(e=>e.trim()).filter(Boolean)}catch{i.players=[]}}function l(){localStorage.setItem(s,JSON.stringify(i.players))}function u(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function d(e){return Math.floor(Math.random()*e)}function f(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=d(e+1);[t[e],t[n]]=[t[n],t[e]]}return t}function p(){let e=i.themes[i.selectedThemeIndex];return e?e.file.replace(`.json`,``):`locations`}function m(e){let t=p();return(r[t]||{})[e]||n[t]||`📍`}function h(){return i.themes[i.selectedThemeIndex]?.name??``}function g(){o.classList.add(`overlay--active`),o.setAttribute(`aria-hidden`,`false`)}function _(){o.classList.remove(`overlay--active`),o.setAttribute(`aria-hidden`,`true`)}async function v(){try{let e=await fetch(`/db.json`);if(!e.ok)throw Error(`Не удалось загрузить каталог тем`);i.themes=await e.json(),i.themesError=null}catch(e){i.themesError=e.message||`Ошибка загрузки данных`,i.themes=[]}}async function y(){let e=i.themes[i.selectedThemeIndex];if(!e)throw Error(`Тема не выбрана`);i.wordsLoading=!0,i.wordsError=null;try{let t=await fetch(`/${e.file}`);if(!t.ok)throw Error(`Не удалось загрузить слова темы`);let n=await t.json();if(!Array.isArray(n)||n.length===0)throw Error(`В теме пока нет слов`);i.words=f(f(f(n))),i.wordsLoaded=!0,i.wordsError=null}catch(e){throw i.words=[],i.wordsLoaded=!1,i.wordsError=e.message||`Ошибка загрузки слов`,e}finally{i.wordsLoading=!1}}function b(){i.words=[],i.wordsLoaded=!1,i.wordsError=null,i.secretWord=null,i.roundPlayers=[],i.spyIndex=null,i.currentPlayerIndex=0,i.rolePhase=`handoff`}function x(){return i.themes.length>0&&!i.themesError&&i.players.length>=3&&!i.wordsLoading}function S(){i.screen===`setup`?C():i.screen===`roles`?E():i.screen===`complete`&&O()}function C(){let e=i.themes.map((e,t)=>`
        <button
          type="button"
          class="theme-option${t===i.selectedThemeIndex?` theme-option--active`:``}"
          data-theme-index="${t}"
        >
          ${u(e.name)}
        </button>
      `).join(``),t=i.players.map((e,t)=>`
        <li class="player-item">
          <span class="player-name">${u(e)}</span>
          <button type="button" class="btn-icon" data-remove-player="${t}" aria-label="Удалить ${u(e)}">×</button>
        </li>
      `).join(``),n=i.themesError?`<p class="error-msg">${u(i.themesError)}</p>`:i.wordsError?`<p class="error-msg">${u(i.wordsError)}</p>`:``;a.innerHTML=`
    <main class="screen screen--setup fade-in">
      <header class="header">
        <p class="eyebrow">Pass &amp; Play</p>
        <h1 class="title">Шпион</h1>
        <p class="subtitle">Один телефон — все роли по очереди</p>
      </header>

      <section class="card">
        <h2 class="section-title">Тематика</h2>
        <div class="theme-picker">${e||`<p class="muted">Загрузка тем…</p>`}</div>
      </section>

      <section class="card">
        <h2 class="section-title">Игроки <span class="badge">${i.players.length}</span></h2>
        <form class="player-form" id="add-player-form">
          <input
            type="text"
            id="player-name-input"
            class="input"
            placeholder="Имя игрока"
            maxlength="24"
            autocomplete="off"
            ${i.themesError?`disabled`:``}
          />
          <button type="submit" class="btn btn--secondary" ${i.themesError?`disabled`:``}>Добавить</button>
        </form>
        <ul class="player-list">${t||`<li class="player-empty muted">Добавьте минимум 3 игроков</li>`}</ul>
      </section>

      ${n}

      <button
        type="button"
        id="start-game-btn"
        class="btn btn--primary btn--large"
        ${x()?``:`disabled`}
      >
        ${i.wordsLoading?`Загрузка…`:`Начать игру`}
      </button>
    </main>
  `,w()}function w(){document.querySelectorAll(`[data-theme-index]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.themeIndex);t!==i.selectedThemeIndex&&(i.selectedThemeIndex=t,i.words=[],i.wordsLoaded=!1,i.wordsError=null,S())})});let e=document.querySelector(`#add-player-form`),t=document.querySelector(`#player-name-input`);e?.addEventListener(`submit`,e=>{e.preventDefault();let n=t.value.trim();if(n){if(i.players.some(e=>e.toLowerCase()===n.toLowerCase())){t.value=``,t.focus();return}i.players.push(n),l(),t.value=``,S(),t.focus()}}),document.querySelectorAll(`[data-remove-player]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.removePlayer);i.players.splice(t,1),l(),S()})}),document.querySelector(`#start-game-btn`)?.addEventListener(`click`,async()=>{if(x())try{i.wordsLoaded||await y(),i.secretWord=i.words[d(i.words.length)],i.roundPlayers=f(i.players),i.spyIndex=d(i.roundPlayers.length),i.currentPlayerIndex=0,i.rolePhase=`transition`,i.screen=`roles`,S(),T()}catch{S()}})}function T(){g(),setTimeout(()=>{i.rolePhase=`handoff`,S(),requestAnimationFrame(()=>{setTimeout(_,50)})},e)}function E(){let e=i.roundPlayers[i.currentPlayerIndex],t=i.currentPlayerIndex===i.spyIndex,n=i.rolePhase===`transition`,r=``;n?r=`
      <div class="role-content role-content--hidden">
        <p class="handoff-label">Передайте телефон</p>
      </div>
    `:i.rolePhase===`handoff`?r=`
      <div class="role-content fade-in">
        <p class="handoff-label">Передайте телефон игроку:</p>
        <p class="player-highlight">${u(e)}</p>
        <button type="button" id="reveal-role-btn" class="btn btn--reveal">Узнать роль</button>
      </div>
    `:i.rolePhase===`revealed`&&(r=t?`
        <div class="role-content fade-in">
          <p class="spy-text">Вы шпион!</p>
          <p class="spy-hint">Не выдавайте себя — угадайте слово по вопросам</p>
          <button type="button" id="confirm-role-btn" class="btn btn--primary btn--large">Понятно, передать дальше</button>
        </div>
      `:`
        <div class="role-content fade-in">
          <p class="word-emoji word-reveal">${m(i.secretWord)}</p>
          <p class="secret-word word-reveal">${u(i.secretWord)}</p>
          <button type="button" id="confirm-role-btn" class="btn btn--primary btn--large">Понятно, передать дальше</button>
        </div>
      `),a.innerHTML=`
    <main class="screen screen--roles">
      <div class="progress">
        <span class="progress-text">Игрок ${i.currentPlayerIndex+1} из ${i.roundPlayers.length}</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(i.currentPlayerIndex+1)/i.roundPlayers.length*100}%"></div>
        </div>
      </div>
      ${r}
    </main>
  `,D()}function D(){document.querySelector(`#reveal-role-btn`)?.addEventListener(`click`,()=>{i.rolePhase=`revealed`,S()}),document.querySelector(`#confirm-role-btn`)?.addEventListener(`click`,()=>{i.rolePhase=`transition`,S(),g(),setTimeout(()=>{let e=i.currentPlayerIndex+1;if(e>=i.roundPlayers.length){i.screen=`complete`,S(),setTimeout(_,50);return}i.currentPlayerIndex=e,i.rolePhase=`handoff`,S(),requestAnimationFrame(()=>{setTimeout(_,50)})},t)})}function O(){a.innerHTML=`
    <main class="screen screen--complete fade-in">
      <div class="complete-icon">🕵️</div>
      <h2 class="complete-title">Все узнали роли</h2>
      <p class="complete-subtitle">Приятной игры!</p>
      <p class="complete-theme">Тема: ${u(h())}</p>
      <button type="button" id="new-game-btn" class="btn btn--primary btn--large">Начать новую игру</button>
    </main>
  `,document.querySelector(`#new-game-btn`)?.addEventListener(`click`,()=>{i.screen=`setup`,b(),S()})}async function k(){g(),c(),await v(),S(),setTimeout(_,e)}k();