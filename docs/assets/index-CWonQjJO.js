(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`/Spy-Game/`,t=550,n=600,r={locations:`📍`,items:`📦`,professions:`👔`,animals:`🐾`,food:`🍽️`,plants:`🌿`},i={locations:{},items:{},professions:{},animals:{},food:{},plants:{}},a={themes:[],themesError:null,selectedThemeIndex:0,words:[],wordsLoaded:!1,wordsLoading:!1,wordsError:null,secretWord:null,players:[],roundPlayers:[],spyIndex:null,currentPlayerIndex:0,rolePhase:`handoff`,screen:`setup`},o=document.querySelector(`#app`),s=document.querySelector(`#overlay`),c=`spy-game-players`;function l(){try{let e=localStorage.getItem(c);if(!e)return;let t=JSON.parse(e);if(!Array.isArray(t))return;a.players=t.filter(e=>typeof e==`string`).map(e=>e.trim()).filter(Boolean)}catch{a.players=[]}}function u(){localStorage.setItem(c,JSON.stringify(a.players))}function d(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function f(e){return Math.floor(Math.random()*e)}function p(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=f(e+1);[t[e],t[n]]=[t[n],t[e]]}return t}function m(){let e=a.themes[a.selectedThemeIndex];return e?e.file.replace(`.json`,``):`locations`}function h(e){let t=m();return(i[t]||{})[e]||r[t]||`📍`}function g(){return a.themes[a.selectedThemeIndex]?.name??``}function _(){s.classList.add(`overlay--active`),s.setAttribute(`aria-hidden`,`false`)}function v(){s.classList.remove(`overlay--active`),s.setAttribute(`aria-hidden`,`true`)}async function y(){try{let t=await fetch(`${e}db.json`);if(!t.ok)throw Error(`Не удалось загрузить каталог тем`);a.themes=await t.json(),a.themesError=null}catch(e){a.themesError=e.message||`Ошибка загрузки данных`,a.themes=[]}}async function b(){let t=a.themes[a.selectedThemeIndex];if(!t)throw Error(`Тема не выбрана`);a.wordsLoading=!0,a.wordsError=null;try{let n=await fetch(`${e}${t.file}`);if(!n.ok)throw Error(`Не удалось загрузить слова темы`);let r=await n.json();if(!Array.isArray(r)||r.length===0)throw Error(`В теме пока нет слов`);a.words=p(p(p(r))),a.wordsLoaded=!0,a.wordsError=null}catch(e){throw a.words=[],a.wordsLoaded=!1,a.wordsError=e.message||`Ошибка загрузки слов`,e}finally{a.wordsLoading=!1}}function x(){a.words=[],a.wordsLoaded=!1,a.wordsError=null,a.secretWord=null,a.roundPlayers=[],a.spyIndex=null,a.currentPlayerIndex=0,a.rolePhase=`handoff`}function S(){return a.themes.length>0&&!a.themesError&&a.players.length>=3&&!a.wordsLoading}function C(){a.screen===`setup`?w():a.screen===`roles`?D():a.screen===`complete`&&k()}function w(){let e=a.themes.map((e,t)=>`
        <button
          type="button"
          class="theme-option${t===a.selectedThemeIndex?` theme-option--active`:``}"
          data-theme-index="${t}"
        >
          ${d(e.name)}
        </button>
      `).join(``),t=a.players.map((e,t)=>`
        <li class="player-item">
          <span class="player-name">${d(e)}</span>
          <button type="button" class="btn-icon" data-remove-player="${t}" aria-label="Удалить ${d(e)}">×</button>
        </li>
      `).join(``),n=a.themesError?`<p class="error-msg">${d(a.themesError)}</p>`:a.wordsError?`<p class="error-msg">${d(a.wordsError)}</p>`:``;o.innerHTML=`
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
        <h2 class="section-title">Игроки <span class="badge">${a.players.length}</span></h2>
        <form class="player-form" id="add-player-form">
          <input
            type="text"
            id="player-name-input"
            class="input"
            placeholder="Имя игрока"
            maxlength="24"
            autocomplete="off"
            ${a.themesError?`disabled`:``}
          />
          <button type="submit" class="btn btn--secondary" ${a.themesError?`disabled`:``}>Добавить</button>
        </form>
        <ul class="player-list">${t||`<li class="player-empty muted">Добавьте минимум 3 игроков</li>`}</ul>
      </section>

      ${n}

      <button
        type="button"
        id="start-game-btn"
        class="btn btn--primary btn--large"
        ${S()?``:`disabled`}
      >
        ${a.wordsLoading?`Загрузка…`:`Начать игру`}
      </button>
    </main>
  `,T()}function T(){document.querySelectorAll(`[data-theme-index]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.themeIndex);t!==a.selectedThemeIndex&&(a.selectedThemeIndex=t,a.words=[],a.wordsLoaded=!1,a.wordsError=null,C())})});let e=document.querySelector(`#add-player-form`),t=document.querySelector(`#player-name-input`);e?.addEventListener(`submit`,e=>{e.preventDefault();let n=t.value.trim();if(n){if(a.players.some(e=>e.toLowerCase()===n.toLowerCase())){t.value=``,t.focus();return}a.players.push(n),u(),t.value=``,C(),t.focus()}}),document.querySelectorAll(`[data-remove-player]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.removePlayer);a.players.splice(t,1),u(),C()})}),document.querySelector(`#start-game-btn`)?.addEventListener(`click`,async()=>{if(S())try{a.wordsLoaded||await b(),a.secretWord=a.words[f(a.words.length)],a.roundPlayers=p(a.players),a.spyIndex=f(a.roundPlayers.length),a.currentPlayerIndex=0,a.rolePhase=`transition`,a.screen=`roles`,C(),E()}catch{C()}})}function E(){_(),setTimeout(()=>{a.rolePhase=`handoff`,C(),requestAnimationFrame(()=>{setTimeout(v,50)})},t)}function D(){let e=a.roundPlayers[a.currentPlayerIndex],t=a.currentPlayerIndex===a.spyIndex,n=a.rolePhase===`transition`,r=``;n?r=`
      <div class="role-content role-content--hidden">
        <p class="handoff-label">Передайте телефон</p>
      </div>
    `:a.rolePhase===`handoff`?r=`
      <div class="role-content fade-in">
        <p class="handoff-label">Передайте телефон игроку:</p>
        <p class="player-highlight">${d(e)}</p>
        <button type="button" id="reveal-role-btn" class="btn btn--reveal">Узнать роль</button>
      </div>
    `:a.rolePhase===`revealed`&&(r=t?`
        <div class="role-content fade-in">
          <p class="spy-text">Вы шпион!</p>
          <p class="spy-hint">Не выдавайте себя — угадайте слово по вопросам</p>
          <button type="button" id="confirm-role-btn" class="btn btn--primary btn--large">Понятно, передать дальше</button>
        </div>
      `:`
        <div class="role-content fade-in">
          <p class="word-emoji word-reveal">${h(a.secretWord)}</p>
          <p class="secret-word word-reveal">${d(a.secretWord)}</p>
          <button type="button" id="confirm-role-btn" class="btn btn--primary btn--large">Понятно, передать дальше</button>
        </div>
      `),o.innerHTML=`
    <main class="screen screen--roles">
      <div class="progress">
        <span class="progress-text">Игрок ${a.currentPlayerIndex+1} из ${a.roundPlayers.length}</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(a.currentPlayerIndex+1)/a.roundPlayers.length*100}%"></div>
        </div>
      </div>
      ${r}
    </main>
  `,O()}function O(){document.querySelector(`#reveal-role-btn`)?.addEventListener(`click`,()=>{a.rolePhase=`revealed`,C()}),document.querySelector(`#confirm-role-btn`)?.addEventListener(`click`,()=>{a.rolePhase=`transition`,C(),_(),setTimeout(()=>{let e=a.currentPlayerIndex+1;if(e>=a.roundPlayers.length){a.screen=`complete`,C(),setTimeout(v,50);return}a.currentPlayerIndex=e,a.rolePhase=`handoff`,C(),requestAnimationFrame(()=>{setTimeout(v,50)})},n)})}function k(){o.innerHTML=`
    <main class="screen screen--complete fade-in">
      <div class="complete-icon">🕵️</div>
      <h2 class="complete-title">Все узнали роли</h2>
      <p class="complete-subtitle">Приятной игры!</p>
      <p class="complete-theme">Тема: ${d(g())}</p>
      <button type="button" id="new-game-btn" class="btn btn--primary btn--large">Начать новую игру</button>
    </main>
  `,document.querySelector(`#new-game-btn`)?.addEventListener(`click`,()=>{a.screen=`setup`,x(),C()})}async function A(){_(),l(),await y(),C(),setTimeout(v,t)}A();