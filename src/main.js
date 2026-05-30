import './style.css'

const OVERLAY_DURATION = 550
const TRANSITION_DURATION = 600

const THEME_DEFAULTS = {
	locations: '📍',
	items: '📦',
	professions: '👔',
	animals: '🐾',
	food: '🍽️',
	plants: '🌿'
}

const WORD_EMOJI = {
	locations: {},
	items: {},
	professions: {},
	animals: {},
	food: {},
	plants: {}
}

const gameState = {
	themes: [],
	themesError: null,
	selectedThemeIndex: 0,
	words: [],
	wordsLoaded: false,
	wordsLoading: false,
	wordsError: null,
	secretWord: null,
	players: [],
	roundPlayers: [],
	spyIndex: null,
	currentPlayerIndex: 0,
	rolePhase: 'handoff',
	screen: 'setup'
}

const app = document.querySelector('#app')
const overlay = document.querySelector('#overlay')
const PLAYERS_STORAGE_KEY = 'spy-game-players'

function loadPlayers() {
	try {
		const raw = localStorage.getItem(PLAYERS_STORAGE_KEY)
		if (!raw) return
		const parsed = JSON.parse(raw)
		if (!Array.isArray(parsed)) return
		gameState.players = parsed
			.filter((name) => typeof name === 'string')
			.map((name) => name.trim())
			.filter(Boolean)
	} catch {
		gameState.players = []
	}
}

function savePlayers() {
	localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(gameState.players))
}

function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function randomInt(max) {
	return Math.floor(Math.random() * max)
}

function shuffleArray(items) {
	const result = [...items]
	for (let i = result.length - 1; i > 0; i--) {
		const j = randomInt(i + 1)
		;[result[i], result[j]] = [result[j], result[i]]
	}
	return result
}

function getThemeKey() {
	const theme = gameState.themes[gameState.selectedThemeIndex]
	if (!theme) return 'locations'
	const file = theme.file.replace('.json', '')
	return file
}

function getEmojiForWord(word) {
	const key = getThemeKey()
	const map = WORD_EMOJI[key] || {}
	return map[word] || THEME_DEFAULTS[key] || '📍'
}

function getSelectedThemeName() {
	return gameState.themes[gameState.selectedThemeIndex]?.name ?? ''
}

function showOverlay() {
	overlay.classList.add('overlay--active')
	overlay.setAttribute('aria-hidden', 'false')
}

function hideOverlay() {
	overlay.classList.remove('overlay--active')
	overlay.setAttribute('aria-hidden', 'true')
}

async function loadThemes() {
	try {
		const res = await fetch('/db.json')
		if (!res.ok) throw new Error('Не удалось загрузить каталог тем')
		gameState.themes = await res.json()
		gameState.themesError = null
	} catch (err) {
		gameState.themesError = err.message || 'Ошибка загрузки данных'
		gameState.themes = []
	}
}

async function loadThemeWords() {
	const theme = gameState.themes[gameState.selectedThemeIndex]
	if (!theme) throw new Error('Тема не выбрана')

	gameState.wordsLoading = true
	gameState.wordsError = null

	try {
		const res = await fetch(`/${theme.file}`)
		if (!res.ok) throw new Error('Не удалось загрузить слова темы')
		const words = await res.json()
		if (!Array.isArray(words) || words.length === 0) {
			throw new Error('В теме пока нет слов')
		}
		gameState.words = shuffleArray(shuffleArray(shuffleArray(words)))
		gameState.wordsLoaded = true
		gameState.wordsError = null
	} catch (err) {
		gameState.words = []
		gameState.wordsLoaded = false
		gameState.wordsError = err.message || 'Ошибка загрузки слов'
		throw err
	} finally {
		gameState.wordsLoading = false
	}
}

function resetRoundState() {
	gameState.words = []
	gameState.wordsLoaded = false
	gameState.wordsError = null
	gameState.secretWord = null
	gameState.roundPlayers = []
	gameState.spyIndex = null
	gameState.currentPlayerIndex = 0
	gameState.rolePhase = 'handoff'
}

function canStartGame() {
	return (
		gameState.themes.length > 0 &&
		!gameState.themesError &&
		gameState.players.length >= 3 &&
		!gameState.wordsLoading
	)
}

function render() {
	if (gameState.screen === 'setup') renderSetup()
	else if (gameState.screen === 'roles') renderRoleFlow()
	else if (gameState.screen === 'complete') renderComplete()
}

function renderSetup() {
	const themesHtml = gameState.themes
		.map(
			(theme, index) => `
        <button
          type="button"
          class="theme-option${index === gameState.selectedThemeIndex ? ' theme-option--active' : ''}"
          data-theme-index="${index}"
        >
          ${escapeHtml(theme.name)}
        </button>
      `
		)
		.join('')

	const playersHtml = gameState.players
		.map(
			(name, index) => `
        <li class="player-item">
          <span class="player-name">${escapeHtml(name)}</span>
          <button type="button" class="btn-icon" data-remove-player="${index}" aria-label="Удалить ${escapeHtml(name)}">×</button>
        </li>
      `
		)
		.join('')

	const errorHtml = gameState.themesError
		? `<p class="error-msg">${escapeHtml(gameState.themesError)}</p>`
		: gameState.wordsError
			? `<p class="error-msg">${escapeHtml(gameState.wordsError)}</p>`
			: ''

	app.innerHTML = `
    <main class="screen screen--setup fade-in">
      <header class="header">
        <p class="eyebrow">Pass &amp; Play</p>
        <h1 class="title">Шпион</h1>
        <p class="subtitle">Один телефон — все роли по очереди</p>
      </header>

      <section class="card">
        <h2 class="section-title">Тематика</h2>
        <div class="theme-picker">${themesHtml || '<p class="muted">Загрузка тем…</p>'}</div>
      </section>

      <section class="card">
        <h2 class="section-title">Игроки <span class="badge">${gameState.players.length}</span></h2>
        <form class="player-form" id="add-player-form">
          <input
            type="text"
            id="player-name-input"
            class="input"
            placeholder="Имя игрока"
            maxlength="24"
            autocomplete="off"
            ${gameState.themesError ? 'disabled' : ''}
          />
          <button type="submit" class="btn btn--secondary" ${gameState.themesError ? 'disabled' : ''}>Добавить</button>
        </form>
        <ul class="player-list">${playersHtml || '<li class="player-empty muted">Добавьте минимум 3 игроков</li>'}</ul>
      </section>

      ${errorHtml}

      <button
        type="button"
        id="start-game-btn"
        class="btn btn--primary btn--large"
        ${canStartGame() ? '' : 'disabled'}
      >
        ${gameState.wordsLoading ? 'Загрузка…' : 'Начать игру'}
      </button>
    </main>
  `

	bindSetupEvents()
}

function bindSetupEvents() {
	document.querySelectorAll('[data-theme-index]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const index = Number(btn.dataset.themeIndex)
			if (index === gameState.selectedThemeIndex) return
			gameState.selectedThemeIndex = index
			gameState.words = []
			gameState.wordsLoaded = false
			gameState.wordsError = null
			render()
		})
	})

	const form = document.querySelector('#add-player-form')
	const input = document.querySelector('#player-name-input')

	form?.addEventListener('submit', (e) => {
		e.preventDefault()
		const name = input.value.trim()
		if (!name) return
		const exists = gameState.players.some((p) => p.toLowerCase() === name.toLowerCase())
		if (exists) {
			input.value = ''
			input.focus()
			return
		}
		gameState.players.push(name)
		savePlayers()
		input.value = ''
		render()
		input.focus()
	})

	document.querySelectorAll('[data-remove-player]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const index = Number(btn.dataset.removePlayer)
			gameState.players.splice(index, 1)
			savePlayers()
			render()
		})
	})

	document.querySelector('#start-game-btn')?.addEventListener('click', async () => {
		if (!canStartGame()) return

		try {
			if (!gameState.wordsLoaded) {
				await loadThemeWords()
			}
			gameState.secretWord = gameState.words[randomInt(gameState.words.length)]
			gameState.roundPlayers = shuffleArray(gameState.players)
			gameState.spyIndex = randomInt(gameState.roundPlayers.length)
			gameState.currentPlayerIndex = 0
			gameState.rolePhase = 'transition'
			gameState.screen = 'roles'
			render()
			beginHandoffWithOverlay()
		} catch {
			render()
		}
	})
}

function beginHandoffWithOverlay() {
	showOverlay()
	setTimeout(() => {
		gameState.rolePhase = 'handoff'
		render()
		requestAnimationFrame(() => {
			setTimeout(hideOverlay, 50)
		})
	}, OVERLAY_DURATION)
}

function renderRoleFlow() {
	const playerName = gameState.roundPlayers[gameState.currentPlayerIndex]
	const isSpy = gameState.currentPlayerIndex === gameState.spyIndex
	const isTransition = gameState.rolePhase === 'transition'

	let contentHtml = ''

	if (isTransition) {
		contentHtml = `
      <div class="role-content role-content--hidden">
        <p class="handoff-label">Передайте телефон</p>
      </div>
    `
	} else if (gameState.rolePhase === 'handoff') {
		contentHtml = `
      <div class="role-content fade-in">
        <p class="handoff-label">Передайте телефон игроку:</p>
        <p class="player-highlight">${escapeHtml(playerName)}</p>
        <button type="button" id="reveal-role-btn" class="btn btn--reveal">Узнать роль</button>
      </div>
    `
	} else if (gameState.rolePhase === 'revealed') {
		if (isSpy) {
			contentHtml = `
        <div class="role-content fade-in">
          <p class="spy-text">Вы шпион!</p>
          <p class="spy-hint">Не выдавайте себя — угадайте слово по вопросам</p>
          <button type="button" id="confirm-role-btn" class="btn btn--primary btn--large">Понятно, передать дальше</button>
        </div>
      `
		} else {
			const emoji = getEmojiForWord(gameState.secretWord)
			contentHtml = `
        <div class="role-content fade-in">
          <p class="word-emoji word-reveal">${emoji}</p>
          <p class="secret-word word-reveal">${escapeHtml(gameState.secretWord)}</p>
          <button type="button" id="confirm-role-btn" class="btn btn--primary btn--large">Понятно, передать дальше</button>
        </div>
      `
		}
	}

	app.innerHTML = `
    <main class="screen screen--roles">
      <div class="progress">
        <span class="progress-text">Игрок ${gameState.currentPlayerIndex + 1} из ${gameState.roundPlayers.length}</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${((gameState.currentPlayerIndex + 1) / gameState.roundPlayers.length) * 100}%"></div>
        </div>
      </div>
      ${contentHtml}
    </main>
  `

	bindRoleEvents()
}

function bindRoleEvents() {
	document.querySelector('#reveal-role-btn')?.addEventListener('click', () => {
		gameState.rolePhase = 'revealed'
		render()
	})

	document.querySelector('#confirm-role-btn')?.addEventListener('click', () => {
		gameState.rolePhase = 'transition'
		render()
		showOverlay()

		setTimeout(() => {
			const nextIndex = gameState.currentPlayerIndex + 1
			if (nextIndex >= gameState.roundPlayers.length) {
				gameState.screen = 'complete'
				render()
				setTimeout(hideOverlay, 50)
				return
			}

			gameState.currentPlayerIndex = nextIndex
			gameState.rolePhase = 'handoff'
			render()

			requestAnimationFrame(() => {
				setTimeout(hideOverlay, 50)
			})
		}, TRANSITION_DURATION)
	})
}

function renderComplete() {
	app.innerHTML = `
    <main class="screen screen--complete fade-in">
      <div class="complete-icon">🕵️</div>
      <h2 class="complete-title">Все узнали роли</h2>
      <p class="complete-subtitle">Приятной игры!</p>
      <p class="complete-theme">Тема: ${escapeHtml(getSelectedThemeName())}</p>
      <button type="button" id="new-game-btn" class="btn btn--primary btn--large">Начать новую игру</button>
    </main>
  `

	document.querySelector('#new-game-btn')?.addEventListener('click', () => {
		gameState.screen = 'setup'
		resetRoundState()
		render()
	})
}

async function init() {
	showOverlay()
	loadPlayers()
	await loadThemes()
	render()
	setTimeout(hideOverlay, OVERLAY_DURATION)
}

init()
