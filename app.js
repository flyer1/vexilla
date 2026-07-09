/**
 * Vexilla App Controller
 * Handles SPA routing, state, interactive games, audio synthesis,
 * local storage progress saving, achievements, search, and themes.
 */

class VexillaApp {
  constructor() {
    this.flags = window.FLAGS_DATA || [];
    this.currentView = 'dashboard';

    // Core state loaded from LocalStorage or initialized
    this.state = this.loadState();

    // Active session variables
    this.currentDeck = [];
    this.currentDeckIndex = 0;
    this.flashcardCompletionTimeout = null;
    this.flashcardAdvanceTimeout = null;
    this.isAdvancingFlashcard = false;
    this.activeLevel = 1;

    // Quiz state variables
    this.quizQuestions = [];
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.quizStreak = 0;
    this.quizMaxStreak = 0;
    this.quizAnswerPool = [];
    this.activeQuizContinents = ['all'];
    this.activeFlashcardContinents = ['all'];
    this.activeMatchContinents = ['all'];

    // Match game state variables
    this.matchCards = [];
    this.firstSelectedCard = null;
    this.pairsLeft = 0;
    this.matchTotalPairs = 0;
    this.matchCleanMatches = 0;
    this.matchMistakes = 0;
    this.matchHelpViews = 0;
    this.matchHelpedIds = new Set();
    this.matchDisqualifiedIds = new Set();

    // Active Atlas filters
    this.activeFilters = {
      continent: ['all'],
      color: ['all'],
      feature: ['all'],
    };

    // Encyclopedia tracking
    this.viewedCountries = new Set();
    this.modalKeyboardReady = false;
    this.lastModalTrigger = null;

    // World map state
    this.mapRendered = false;
    this.mapDataUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    this.flagImageCache = new Map();
    this.mapLocatorContext = null;

    // Web Audio Context (lazy-loaded on user interaction)
    this.audioCtx = null;
  }

  init() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', this.state.theme);

    // Update settings checkboxes
    const soundSwitch = document.getElementById('settings-sound-switch');
    if (soundSwitch) soundSwitch.checked = this.state.soundOn;

    const themeSwitch = document.getElementById('settings-theme-switch');
    if (themeSwitch) themeSwitch.checked = this.state.theme === 'light';

    const themeBtnText = document.getElementById('theme-btn-text');
    if (themeBtnText) themeBtnText.textContent = this.state.theme === 'dark' ? 'Light Theme' : 'Dark Theme';

    const soundBtnText = document.getElementById('sound-btn-text');
    if (soundBtnText) soundBtnText.textContent = this.state.soundOn ? 'Sounds On' : 'Sounds Off';

    // Calculate Streak
    this.updateStreak();
    this.pruneRetiredAchievements();
    this.setupModalKeyboardControls();

    // Setup flashcard click listeners
    const card = document.getElementById('interactive-card');
    if (card) {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        this.playAudioTone(330, 'triangle', 0.05); // Subtle flip sound
      });
    }

    // Refresh UI elements
    this.updateDashboardStats();
    this.renderAtlas();
    this.renderAchievementsList();

    // Check initial achievements
    this.checkAchievements();
  }

  // --- STATE MANAGEMENT ---
  loadState() {
    const defaultState = {
      learnedFlags: [], // List of country codes
      needReviewFlags: [],
      quizHighscore: 0,
      streak: 0,
      lastActiveDate: '',
      unlockedAchievements: [],
      soundOn: true,
      theme: 'dark',
    };

    try {
      const saved = localStorage.getItem('vexilla_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
    return defaultState;
  }

  saveState() {
    try {
      localStorage.setItem('vexilla_state', JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to local storage:', e);
    }
  }

  getSanitizedState(rawState) {
    const defaults = {
      learnedFlags: [],
      needReviewFlags: [],
      quizHighscore: 0,
      streak: 0,
      lastActiveDate: '',
      unlockedAchievements: [],
      soundOn: true,
      theme: 'dark',
    };

    if (!rawState || typeof rawState !== 'object') {
      throw new Error('Backup file does not contain progress data.');
    }

    const validCodes = new Set(this.flags.map((flag) => flag.code));
    const cleanCodeList = (value) => (Array.isArray(value) ? [...new Set(value.filter((code) => typeof code === 'string' && validCodes.has(code)))] : []);
    const cleanStringList = (value) => (Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string'))] : []);
    const highscore = Number(rawState.quizHighscore);
    const streak = Number(rawState.streak);

    return {
      ...defaults,
      learnedFlags: cleanCodeList(rawState.learnedFlags),
      needReviewFlags: cleanCodeList(rawState.needReviewFlags),
      quizHighscore: Number.isFinite(highscore) ? Math.max(0, Math.min(100, Math.round(highscore))) : defaults.quizHighscore,
      streak: Number.isFinite(streak) ? Math.max(0, Math.round(streak)) : defaults.streak,
      lastActiveDate: typeof rawState.lastActiveDate === 'string' ? rawState.lastActiveDate : defaults.lastActiveDate,
      unlockedAchievements: cleanStringList(rawState.unlockedAchievements),
      soundOn: typeof rawState.soundOn === 'boolean' ? rawState.soundOn : defaults.soundOn,
      theme: rawState.theme === 'light' || rawState.theme === 'dark' ? rawState.theme : defaults.theme,
    };
  }

  getProgressBackupPayload() {
    return {
      app: 'Vexilla',
      version: 1,
      exportedAt: new Date().toISOString(),
      state: this.getSanitizedState(this.state),
    };
  }

  exportProgressBackup() {
    const payload = this.getProgressBackupPayload();
    const backup = JSON.stringify(payload, null, 2);
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vexilla-progress-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    this.spawnToast('Backup Downloaded', 'Keep this JSON file somewhere safe.', '💾');
  }

  async copyProgressBackup() {
    const backup = JSON.stringify(this.getProgressBackupPayload(), null, 2);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(backup);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = backup;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      this.spawnToast('Backup Copied', 'Your progress JSON is on the clipboard.', '📋');
    } catch (error) {
      console.error('Failed to copy progress backup:', error);
      this.spawnToast('Copy Failed', 'Use Download Backup instead.', '⚠️');
    }
  }

  importProgressBackup(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importedState = parsed && parsed.state ? parsed.state : parsed;
        const sanitizedState = this.getSanitizedState(importedState);

        if (!confirm('Restore this Vexilla progress backup? This will replace the current progress saved in this browser.')) {
          return;
        }

        this.state = sanitizedState;
        this.saveState();
        this.init();
        this.updateDashboardStats();
        this.renderAchievementsList();
        this.spawnToast('Progress Restored', 'Your backup has been loaded.', '✅');
      } catch (error) {
        console.error('Failed to import progress backup:', error);
        this.spawnToast('Restore Failed', 'That file does not look like a valid Vexilla backup.', '⚠️');
      } finally {
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

  resetProgressData() {
    if (confirm('Are you sure you want to delete all your progress, learned flags, high scores, and achievements? This action is permanent.')) {
      localStorage.removeItem('vexilla_state');
      this.state = this.loadState();
      this.viewedCountries.clear();
      this.saveState();

      this.init();
      this.switchView('dashboard');
      this.spawnToast('Progress Reset', 'All user data has been cleared.', '🗑️');
      this.playAudioTone(150, 'sawtooth', 0.3);
    }
  }

  // --- AUDIO SYNTHESIZER ---
  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playAudioTone(freq, type = 'sine', duration = 0.1, delay = 0) {
    if (!this.state.soundOn) return;
    this.initAudio();

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + delay);

      gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime + delay);
      // Smooth fade-out tail
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + delay);
      osc.stop(this.audioCtx.currentTime + delay + duration);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  }

  playSuccessChime() {
    this.playAudioTone(523.25, 'sine', 0.15, 0); // C5
    this.playAudioTone(659.25, 'sine', 0.15, 0.08); // E5
    this.playAudioTone(783.99, 'sine', 0.15, 0.16); // G5
    this.playAudioTone(1046.5, 'sine', 0.3, 0.24); // C6
  }

  playFailureBuzz() {
    this.playAudioTone(220, 'sawtooth', 0.2, 0); // A3
    this.playAudioTone(196, 'sawtooth', 0.35, 0.1); // G3
  }

  playCorrectChime() {
    this.playAudioTone(587.33, 'sine', 0.1, 0); // D5
    this.playAudioTone(880, 'sine', 0.2, 0.06); // A5
  }

  // --- SPA ROUTER ---
  switchView(viewId) {
    if (this.flashcardCompletionTimeout) {
      clearTimeout(this.flashcardCompletionTimeout);
      this.flashcardCompletionTimeout = null;
    }
    if (this.flashcardAdvanceTimeout) {
      clearTimeout(this.flashcardAdvanceTimeout);
      this.flashcardAdvanceTimeout = null;
      this.isAdvancingFlashcard = false;
    }

    this.initAudio();
    this.playAudioTone(600, 'sine', 0.02); // Short click tap sound

    // Hide all views
    const views = document.querySelectorAll('.view-section');
    views.forEach((v) => {
      v.classList.remove('active');
      v.style.display = 'none';
      v.style.opacity = '0';
    });

    // Deactivate all sidebar items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((n) => n.classList.remove('active'));

    // Activate target view
    const targetView = document.getElementById(`${viewId}-view`);
    if (targetView) {
      targetView.style.display = 'flex';
      targetView.classList.add('active');
      this.currentView = viewId;
    }

    // Activate target sidebar button
    const targetNav = document.getElementById(`nav-${viewId}`);
    if (targetNav) targetNav.classList.add('active');

    // Screen-specific updates
    if (viewId === 'dashboard') {
      this.updateDashboardStats();
    } else if (viewId === 'flashcards') {
      this.updateContinentControls('flashcards');
      if (this.currentDeck.length === 0 || this.currentDeckIndex >= this.currentDeck.length) {
        this.startLevel(this.activeLevel || 1);
        return;
      }
      this.loadNextFlashcard();
    } else if (viewId === 'encyclopedia') {
      this.renderAtlas();
    } else if (viewId === 'map') {
      this.renderWorldMap();
    } else if (viewId === 'match') {
      this.startMatchGame();
    } else if (viewId === 'quiz') {
      this.startQuiz();
    } else if (viewId === 'achievements') {
      this.renderAchievementsList();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- SETTINGS CONTROLS ---
  toggleTheme() {
    const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.state.theme = newTheme;
    this.saveState();

    document.documentElement.setAttribute('data-theme', newTheme);
    const themeBtnText = document.getElementById('theme-btn-text');
    if (themeBtnText) themeBtnText.textContent = newTheme === 'dark' ? 'Light Theme' : 'Dark Theme';

    const themeSwitch = document.getElementById('settings-theme-switch');
    if (themeSwitch) themeSwitch.checked = newTheme === 'light';
  }

  toggleThemeFromSettings(isChecked) {
    const targetTheme = isChecked ? 'light' : 'dark';
    if (this.state.theme !== targetTheme) {
      this.toggleTheme();
    }
  }

  toggleSound() {
    this.state.soundOn = !this.state.soundOn;
    this.saveState();

    const soundBtnText = document.getElementById('sound-btn-text');
    if (soundBtnText) soundBtnText.textContent = this.state.soundOn ? 'Sounds On' : 'Sounds Off';

    const soundSwitch = document.getElementById('settings-sound-switch');
    if (soundSwitch) soundSwitch.checked = this.state.soundOn;

    if (this.state.soundOn) {
      this.playAudioTone(880, 'sine', 0.1);
    }
  }

  toggleSoundFromSettings(isChecked) {
    if (this.state.soundOn !== isChecked) {
      this.toggleSound();
    }
  }

  // --- STREAK CALCULATOR ---
  updateStreak() {
    const today = new Date().toISOString().split('T')[0]; // e.g. "2026-06-21"

    if (this.state.lastActiveDate === today) {
      return; // Already logged active day today
    }

    if (this.state.lastActiveDate === '') {
      // First time loading the app
      this.state.streak = 1;
    } else {
      const lastDate = new Date(this.state.lastActiveDate);
      const currentDate = new Date(today);

      // Calculate day difference
      const timeDiff = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (diffDays === 1) {
        this.state.streak += 1;
        this.spawnToast('Streak Continues!', `You have kept your daily streak for ${this.state.streak} days. Keep it up!`, '🔥');
      } else if (diffDays > 1) {
        // Streak broken
        this.state.streak = 1;
        this.spawnToast('New Streak Started', 'Welcome back! Start your new daily learning streak today.', '🌱');
      }
    }

    this.state.lastActiveDate = today;
    this.saveState();
  }

  // --- DASHBOARD UPDATER ---
  updateDashboardStats() {
    const totalFlagsCount = this.flags.length;
    const learnedFlagsCount = this.state.learnedFlags.length;

    // Stats Grid
    const learnedSpan = document.getElementById('stats-learned');
    if (learnedSpan) learnedSpan.textContent = `${learnedFlagsCount} / ${totalFlagsCount}`;

    const highscoreSpan = document.getElementById('stats-highscore');
    if (highscoreSpan) highscoreSpan.textContent = `${this.state.quizHighscore}%`;

    const streakSpan = document.getElementById('stats-streak');
    if (streakSpan) streakSpan.textContent = `${this.state.streak} day${this.state.streak === 1 ? '' : 's'}`;

    const achievementSpan = document.getElementById('stats-achievements');
    const achievements = this.getAchievementsDefinition();
    const activeUnlockedCount = this.getActiveUnlockedAchievementIds(achievements).length;
    if (achievementSpan) achievementSpan.textContent = `${activeUnlockedCount} / ${achievements.length}`;

    // Level Progress Bars
    const levels = [1, 2, 3];
    levels.forEach((lvl) => {
      const lvlFlags = this.flags.filter((f) => f.difficulty === lvl);
      const lvlFlagsTotal = lvlFlags.length;
      const lvlFlagsLearned = lvlFlags.filter((f) => this.state.learnedFlags.includes(f.code)).length;

      const percent = lvlFlagsTotal > 0 ? Math.round((lvlFlagsLearned / lvlFlagsTotal) * 100) : 0;

      const bar = document.getElementById(`lvl${lvl}-progress-bar`);
      if (bar) bar.style.width = `${percent}%`;

      const progressText = document.getElementById(`lvl${lvl}-progress-text`);
      if (progressText) progressText.textContent = `${percent}% Mastered`;

      const countText = document.getElementById(`lvl${lvl}-count-text`);
      if (countText) countText.textContent = `${lvlFlagsLearned} / ${lvlFlagsTotal} flags`;
    });
  }

  // --- FLASHCARDS MODE ---
  startLevel(lvl) {
    this.activeLevel = lvl;

    // Filter flags for level and selected continents
    const lvlFlags = this.filterBySelectedContinents(
      this.flags.filter((f) => f.difficulty === lvl),
      this.activeFlashcardContinents,
    );

    // Give priority to flags NOT yet learned, or load all if everything is learned
    const unlearned = lvlFlags.filter((f) => !this.state.learnedFlags.includes(f.code));
    this.currentDeck = unlearned.length > 0 ? unlearned : lvlFlags;

    if (this.currentDeck.length === 0) {
      this.spawnToast('Deck Unavailable', 'No flags found for this level and continent selection.', '⚠️');
      return;
    }

    // Shuffle the deck
    this.shuffle(this.currentDeck);

    this.currentDeckIndex = 0;

    // Update Title
    const studyTitle = document.getElementById('study-level-title');
    if (studyTitle) {
      const difficultyNames = ['Iconic Flags', 'Global Colors', 'Vexillologist'];
      studyTitle.textContent = `Study Deck: Level ${lvl} - ${difficultyNames[lvl - 1]}`;
    }
    this.updateContinentControls('flashcards');

    this.switchView('flashcards');
  }

  loadNextFlashcard() {
    if (this.currentDeckIndex >= this.currentDeck.length) {
      // Finished the deck!
      this.playSuccessChime();
      this.spawnToast('Deck Complete!', `You have completed studying all cards in this round!`, '🏆');

      this.checkAchievements();
      this.currentDeck = [];
      this.currentDeckIndex = 0;
      this.flashcardCompletionTimeout = setTimeout(() => {
        this.flashcardCompletionTimeout = null;
        this.switchView('dashboard');
      }, 1500);
      return;
    }

    // Clear flipped state
    const cardContainer = document.getElementById('interactive-card');
    if (cardContainer) cardContainer.classList.remove('flipped');

    const activeFlag = this.currentDeck[this.currentDeckIndex];

    // Set UI elements
    const flagImg = document.getElementById('card-flag-img');
    if (flagImg) {
      flagImg.src = `https://flagcdn.com/w320/${activeFlag.code}.png`;
      flagImg.alt = `Flag of ${activeFlag.name}`;
    }

    const countryName = document.getElementById('card-country-name');
    if (countryName) countryName.textContent = activeFlag.name;

    const metaContinent = document.getElementById('card-meta-continent');
    if (metaContinent) metaContinent.textContent = activeFlag.continent;

    const metaDiff = document.getElementById('card-meta-difficulty');
    if (metaDiff) {
      const difficulties = ['Beginner', 'Intermediate', 'Expert'];
      metaDiff.textContent = `Difficulty: ${difficulties[activeFlag.difficulty - 1]}`;
    }

    const capitalName = document.getElementById('card-capital-name');
    if (capitalName) capitalName.textContent = activeFlag.capital;

    const colorsVal = document.getElementById('card-colors');
    if (colorsVal) {
      // Capitalize first letter of each color
      const capitalizedColors = activeFlag.colors.map((c) => c.charAt(0).toUpperCase() + c.slice(1));
      colorsVal.textContent = capitalizedColors.join(', ');
    }

    const mnemonicVal = document.getElementById('card-mnemonic');
    if (mnemonicVal) mnemonicVal.textContent = activeFlag.fact;

    // Update progress bar
    const totalCount = this.currentDeck.length;
    const progressPercent = Math.round((this.currentDeckIndex / totalCount) * 100);

    const progressText = document.getElementById('study-progress-text');
    if (progressText) progressText.textContent = `Card ${this.currentDeckIndex + 1} of ${totalCount}`;

    const percentText = document.getElementById('study-percent-text');
    if (percentText) percentText.textContent = `${progressPercent}% Done`;

    const progressBar = document.getElementById('study-progress-bar');
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
  }

  cardAction(actionType) {
    if (this.isAdvancingFlashcard) return;

    const activeFlag = this.currentDeck[this.currentDeckIndex];

    if (!activeFlag) {
      this.spawnToast('No active card', 'Start a study level first.', '⚠️');
      this.switchView('dashboard');
      return;
    }

    if (actionType === 'learned') {
      // Add to learned list if not already there
      if (!this.state.learnedFlags.includes(activeFlag.code)) {
        this.state.learnedFlags.push(activeFlag.code);
      }
      // Remove from review list if present
      this.state.needReviewFlags = this.state.needReviewFlags.filter((code) => code !== activeFlag.code);

      this.playCorrectChime();
    } else if (actionType === 'review') {
      // Add to review list if not already there
      if (!this.state.needReviewFlags.includes(activeFlag.code)) {
        this.state.needReviewFlags.push(activeFlag.code);
      }
      // Remove from learned list if present
      this.state.learnedFlags = this.state.learnedFlags.filter((code) => code !== activeFlag.code);

      this.playAudioTone(294, 'triangle', 0.25); // Lower chime tone
    }

    this.saveState();
    this.currentDeckIndex++;
    this.isAdvancingFlashcard = true;

    // Let a revealed card rotate back before replacing it, so the next answer is not exposed mid-flip.
    const cardContainer = document.getElementById('interactive-card');
    if (cardContainer) {
      const wasFlipped = cardContainer.classList.contains('flipped');
      cardContainer.classList.remove('flipped');
      cardContainer.style.transform = 'translateX(-20px) rotateY(0deg)';
      cardContainer.style.opacity = '0.7';

      const nextCardDelay = wasFlipped ? 650 : 250;
      this.flashcardAdvanceTimeout = setTimeout(() => {
        this.flashcardAdvanceTimeout = null;
        cardContainer.style.transform = 'none';
        cardContainer.style.opacity = '1';
        this.loadNextFlashcard();
        this.isAdvancingFlashcard = false;
      }, nextCardDelay);
    } else {
      this.loadNextFlashcard();
      this.isAdvancingFlashcard = false;
    }
  }

  // --- QUIZ ENGINE ---
  getContinentStateKey(mode) {
    return {
      quiz: 'activeQuizContinents',
      flashcards: 'activeFlashcardContinents',
      match: 'activeMatchContinents',
    }[mode];
  }

  updateContinentControls(mode) {
    const stateKey = this.getContinentStateKey(mode);
    if (!stateKey) return;

    document.querySelectorAll(`.${mode}-continent-tag`).forEach((tag) => {
      const value = tag.getAttribute('data-continent');
      tag.classList.toggle('active', this[stateKey].includes(value));
    });
  }

  selectContinentForMode(mode, element, event) {
    const stateKey = this.getContinentStateKey(mode);
    if (!stateKey) return;

    const value = element.getAttribute('data-continent');
    const isMultiSelect = event && (event.ctrlKey || event.metaKey);

    if (value === 'all') {
      this[stateKey] = ['all'];
    } else if (isMultiSelect) {
      const currentSelection = this[stateKey].includes('all') ? [] : [...this[stateKey]];
      const existingIndex = currentSelection.indexOf(value);
      if (existingIndex >= 0) {
        currentSelection.splice(existingIndex, 1);
      } else {
        currentSelection.push(value);
      }
      this[stateKey] = currentSelection.length > 0 ? currentSelection : ['all'];
    } else {
      this[stateKey] = [value];
    }

    this.updateContinentControls(mode);
    this.playAudioTone(800, 'sine', 0.02);

    if (mode === 'quiz') {
      this.startQuiz();
    } else if (mode === 'flashcards') {
      this.startLevel(this.activeLevel || 1);
    } else if (mode === 'match') {
      this.startMatchGame();
    }
  }

  filterBySelectedContinents(flags, continents) {
    return continents.includes('all') ? flags : flags.filter((flag) => continents.includes(flag.continent));
  }

  selectFlashcardContinent(element, event) {
    this.selectContinentForMode('flashcards', element, event);
  }

  selectMatchContinent(element, event) {
    this.selectContinentForMode('match', element, event);
  }

  updateQuizContinentControls() {
    this.updateContinentControls('quiz');
  }

  selectQuizContinent(element, event) {
    this.selectContinentForMode('quiz', element, event);
  }

  startQuiz(customLevel = null, customContinents = null) {
    // Custom levels are supported, but quiz mode defaults to all difficulty levels.
    const quizLevel = customLevel;
    const quizContinents = customContinents || this.activeQuizContinents;

    let filteredFlags = this.flags;
    if (quizLevel) {
      filteredFlags = filteredFlags.filter((f) => f.difficulty === quizLevel);
    }
    if (!quizContinents.includes('all')) {
      filteredFlags = filteredFlags.filter((f) => quizContinents.includes(f.continent));
    }

    if (filteredFlags.length < 4) {
      this.spawnToast('Quiz Setup Failed', 'Select a larger category. Need at least 4 flags.', '⚠️');
      return;
    }

    // Pick 10 random flags (or all if filtered count is less)
    this.shuffle(filteredFlags);
    this.quizQuestions = filteredFlags.slice(0, Math.min(10, filteredFlags.length));
    this.quizAnswerPool = [...filteredFlags];

    // Reset counters
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.quizStreak = 0;
    this.quizMaxStreak = 0;

    // UI Panels toggle
    document.getElementById('quiz-game-panel').style.display = 'flex';
    document.getElementById('quiz-summary-panel').style.display = 'none';
    this.updateQuizContinentControls();

    this.loadQuizQuestion();
  }

  loadQuizQuestion() {
    const questionFlag = this.quizQuestions[this.currentQuizIndex];

    // Generate Options (1 correct, 3 incorrect)
    const options = [questionFlag.name];

    // Get list of all other country names
    const answerPool = this.quizAnswerPool.length >= 4 ? this.quizAnswerPool : this.flags;
    const distractors = answerPool.filter((f) => f.name !== questionFlag.name).map((f) => f.name);

    this.shuffle(distractors);

    // Pick 3 unique distractors
    options.push(distractors[0], distractors[1], distractors[2]);
    this.shuffle(options);

    // Renders flag
    const flagImg = document.getElementById('quiz-flag-img');
    if (flagImg) {
      flagImg.src = `https://flagcdn.com/w320/${questionFlag.code}.png`;
      flagImg.alt = `Flag of a country`;
    }

    // Set Stats headers
    document.getElementById('quiz-q-num').textContent = `${this.currentQuizIndex + 1} / ${this.quizQuestions.length}`;
    document.getElementById('quiz-streak').textContent = `${this.quizStreak} 🔥`;
    document.getElementById('quiz-score').textContent = this.quizScore * 10;

    // Quiz Progress Bar
    const progressPercent = Math.round((this.currentQuizIndex / this.quizQuestions.length) * 100);
    document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;

    // Render options inside buttons
    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = '';

    options.forEach((optText, index) => {
      const letters = ['A', 'B', 'C', 'D'];
      const btn = document.createElement('button');
      btn.className = 'quiz-option glass-panel';
      btn.innerHTML = `
        <span class="quiz-option-letter">${letters[index]}</span>
        <span class="quiz-option-text">${optText}</span>
      `;
      btn.onclick = () => this.checkQuizAnswer(btn, optText, questionFlag.name);
      optionsContainer.appendChild(btn);
    });
  }

  checkQuizAnswer(clickedBtn, selectedText, correctText) {
    // Disable all options
    const optionsButtons = document.querySelectorAll('.quiz-option');
    optionsButtons.forEach((btn) => (btn.disabled = true));

    const isCorrect = selectedText === correctText;

    if (isCorrect) {
      clickedBtn.classList.add('correct');
      this.quizScore++;
      this.quizStreak++;
      if (this.quizStreak > this.quizMaxStreak) {
        this.quizMaxStreak = this.quizStreak;
      }
      this.playCorrectChime();
    } else {
      clickedBtn.classList.add('incorrect');
      // Highlight correct answer in green
      optionsButtons.forEach((btn) => {
        const textSpan = btn.querySelector('.quiz-option-text');
        if (textSpan && textSpan.textContent === correctText) {
          btn.classList.add('correct');
        }
      });
      this.quizStreak = 0;
      this.playFailureBuzz();
    }

    // Wait and progress
    setTimeout(() => {
      this.currentQuizIndex++;
      if (this.currentQuizIndex < this.quizQuestions.length) {
        this.loadQuizQuestion();
      } else {
        this.showQuizSummary();
      }
    }, 1500);
  }

  showQuizSummary() {
    document.getElementById('quiz-game-panel').style.display = 'none';

    const summaryPanel = document.getElementById('quiz-summary-panel');
    summaryPanel.style.display = 'flex';

    const totalCount = this.quizQuestions.length;
    const accuracy = Math.round((this.quizScore / totalCount) * 100);

    // Update labels
    document.getElementById('sum-score').textContent = `${accuracy}%`;
    document.getElementById('sum-subtitle').textContent = `You correctly answered ${this.quizScore} out of ${totalCount} questions.`;

    // Points Gained: 10 XP per correct answer
    const pointsGained = this.quizScore * 10;
    document.getElementById('sum-points').textContent = `+${pointsGained} XP`;
    document.getElementById('sum-max-streak').textContent = `${this.quizMaxStreak} 🔥`;

    // Set title based on success
    const titleSpan = document.getElementById('sum-title');
    if (accuracy === 100) {
      titleSpan.textContent = 'Perfect score! Vexilla God!';
      this.playSuccessChime();
    } else if (accuracy >= 80) {
      titleSpan.textContent = 'Outstanding Work!';
      this.playSuccessChime();
    } else if (accuracy >= 50) {
      titleSpan.textContent = 'Well Done!';
      this.playAudioTone(440, 'sine', 0.2);
    } else {
      titleSpan.textContent = 'Keep Practicing!';
      this.playAudioTone(300, 'sine', 0.2);
    }

    // Update highscore
    if (accuracy > this.state.quizHighscore) {
      this.state.quizHighscore = accuracy;
      this.saveState();
    }

    this.checkAchievements();
  }

  restartQuiz() {
    this.startQuiz();
  }

  // --- MATCHING GAME ---
  startMatchGame() {
    this.initAudio();
    this.firstSelectedCard = null;
    this.updateContinentControls('match');

    // Select 6 random flags
    const pool = this.filterBySelectedContinents([...this.flags], this.activeMatchContinents);

    if (pool.length < 6) {
      this.spawnToast('Match Setup Failed', 'Select a larger continent pool. Need at least 6 flags.', '⚠️');
      return;
    }

    this.shuffle(pool);
    const selected = pool.slice(0, 6);
    this.matchTotalPairs = selected.length;
    this.pairsLeft = selected.length;
    this.matchCleanMatches = 0;
    this.matchMistakes = 0;
    this.matchHelpViews = 0;
    this.matchHelpedIds = new Set();
    this.matchDisqualifiedIds = new Set();

    // Create card structures
    this.matchCards = [];
    selected.forEach((flag) => {
      // 1. Flag Image Card
      this.matchCards.push({
        id: flag.code,
        type: 'flag',
        content: `https://flagcdn.com/w320/${flag.code}.png`,
        name: flag.name,
      });
      // 2. Country Name Card
      this.matchCards.push({
        id: flag.code,
        type: 'country',
        content: flag.name,
        name: flag.name,
      });
    });

    // Shuffle cards
    this.shuffle(this.matchCards);

    // Clear and draw board
    const board = document.getElementById('match-board');
    board.innerHTML = '';

    this.updateMatchStats();
    document.getElementById('match-summary-panel').style.display = 'none';
    board.style.display = 'grid';

    this.matchCards.forEach((cardData) => {
      const card = document.createElement('div');
      card.className = `match-card glass-panel ${cardData.type}-card`;
      card.setAttribute('data-id', cardData.id);
      card.setAttribute('data-type', cardData.type);

      if (cardData.type === 'flag') {
        card.innerHTML = `
          <button class="match-card-info" type="button" aria-label="View details for ${cardData.name}" title="View details">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="12" y1="7" x2="12.01" y2="7"/></svg>
          </button>
          <img src="${cardData.content}" alt="Flag matching" class="no-select">
        `;
        const detailsBtn = card.querySelector('.match-card-info');
        detailsBtn.onclick = (event) => {
          event.stopPropagation();
          this.revealMatchFlagDetails(cardData.id);
        };
      } else {
        card.textContent = cardData.content;
      }

      card.onclick = () => this.handleMatchCardSelect(card);
      board.appendChild(card);
    });
  }

  updateMatchStats() {
    const cleanScoreEl = document.getElementById('match-clean-score');
    if (cleanScoreEl) cleanScoreEl.textContent = `${this.matchCleanMatches} / ${this.matchTotalPairs || 6}`;

    const leftEl = document.getElementById('match-left');
    if (leftEl) leftEl.textContent = `${this.pairsLeft} / ${this.matchTotalPairs || 6}`;

    const helpEl = document.getElementById('match-help-count');
    if (helpEl) helpEl.textContent = this.matchHelpViews;
  }

  celebrateMatchSuccess(cards, isCleanMatch) {
    const particlePositions = [
      ['50%', '50%', '-34px', '-26px'],
      ['50%', '50%', '-10px', '-42px'],
      ['50%', '50%', '26px', '-34px'],
      ['50%', '50%', '42px', '-6px'],
      ['50%', '50%', '30px', '30px'],
      ['50%', '50%', '-6px', '42px'],
      ['50%', '50%', '-38px', '18px'],
    ];

    cards.forEach((card) => {
      card.classList.add('matched', 'match-reward');

      card.querySelectorAll('.match-reward-burst').forEach((burst) => burst.remove());
      const burst = document.createElement('div');
      burst.className = 'match-reward-burst';
      particlePositions.forEach(([x, y, dx, dy], index) => {
        const spark = document.createElement('span');
        spark.style.setProperty('--spark-x', x);
        spark.style.setProperty('--spark-y', y);
        spark.style.setProperty('--spark-dx', dx);
        spark.style.setProperty('--spark-dy', dy);
        spark.style.setProperty('--spark-delay', `${index * 24}ms`);
        burst.appendChild(spark);
      });
      card.appendChild(burst);

      setTimeout(() => {
        card.classList.add('match-removing');
      }, 450);
    });

    const badgeId = isCleanMatch ? 'match-clean-score' : 'match-left';
    const badge = document.getElementById(badgeId)?.closest('.quiz-badge');
    if (badge) {
      badge.classList.remove('match-stat-pop');
      // Restart the animation even when matches happen quickly.
      void badge.offsetWidth;
      badge.classList.add('match-stat-pop');
      setTimeout(() => badge.classList.remove('match-stat-pop'), 700);
    }
  }

  revealMatchFlagDetails(flagCode) {
    const flag = this.flags.find((item) => item.code === flagCode);
    if (!flag) return;

    if (!this.matchHelpedIds.has(flagCode)) {
      this.matchHelpViews++;
      this.matchHelpedIds.add(flagCode);
    }
    this.matchDisqualifiedIds.add(flagCode);
    this.updateMatchStats();
    this.openFlagModal(flag);
  }

  handleMatchCardSelect(cardEl) {
    if (cardEl.classList.contains('matched') || cardEl.classList.contains('selected')) return;

    this.playAudioTone(440, 'triangle', 0.05); // Click tap

    // Case 1: First card selected
    if (!this.firstSelectedCard) {
      this.firstSelectedCard = cardEl;
      cardEl.classList.add('selected');
      return;
    }

    // Case 2: Second card selected
    const firstId = this.firstSelectedCard.getAttribute('data-id');
    const firstType = this.firstSelectedCard.getAttribute('data-type');
    const secondId = cardEl.getAttribute('data-id');
    const secondType = cardEl.getAttribute('data-type');

    // Check if match
    if (firstId === secondId && firstType !== secondType) {
      // MATCH SUCCESS!
      this.firstSelectedCard.classList.remove('selected');

      const isCleanMatch = !this.matchDisqualifiedIds.has(firstId);
      if (isCleanMatch) {
        this.matchCleanMatches++;
      }
      this.pairsLeft--;
      this.updateMatchStats();
      this.celebrateMatchSuccess([this.firstSelectedCard, cardEl], isCleanMatch);

      this.playCorrectChime();
      this.firstSelectedCard = null;

      // Check win condition
      if (this.pairsLeft === 0) {
        setTimeout(() => this.showMatchGameComplete(), 2000);
      }
    } else {
      // MISMATCH
      cardEl.classList.add('selected');
      const prevCard = this.firstSelectedCard;
      this.firstSelectedCard = null;
      this.matchMistakes++;
      this.matchDisqualifiedIds.add(firstId);
      this.matchDisqualifiedIds.add(secondId);
      this.updateMatchStats();

      this.playAudioTone(180, 'sawtooth', 0.2); // Negative buzzer

      // Shake cards briefly, then clear selection outline
      setTimeout(() => {
        prevCard.classList.remove('selected');
        cardEl.classList.remove('selected');
      }, 500);
    }
  }

  showMatchGameComplete() {
    document.getElementById('match-board').style.display = 'none';

    const summary = document.getElementById('match-summary-panel');
    summary.style.display = 'flex';

    const accuracy = this.matchTotalPairs > 0 ? Math.round((this.matchCleanMatches / this.matchTotalPairs) * 100) : 0;
    document.getElementById('match-sum-score').textContent = `${this.matchCleanMatches} / ${this.matchTotalPairs}`;

    const subtitle = document.getElementById('match-sum-subtitle');
    if (this.matchCleanMatches === this.matchTotalPairs) {
      subtitle.textContent = `Perfect accuracy! You matched every pair without mistakes or details help.`;
    } else {
      const helpNote = this.matchHelpViews > 0 ? ` You viewed details for ${this.matchHelpViews} pair${this.matchHelpViews === 1 ? '' : 's'}.` : '';
      subtitle.textContent = `You made ${this.matchCleanMatches} clean match${this.matchCleanMatches === 1 ? '' : 'es'} out of ${this.matchTotalPairs} (${accuracy}%).${helpNote}`;
    }

    this.playSuccessChime();
    this.checkAchievements();
  }

  // --- ENCYCLOPEDIA VIEW (ATLAS) ---
  renderAtlas() {
    const grid = document.getElementById('encyclopedia-grid-container');
    if (!grid) return;
    grid.innerHTML = '';

    const continentOrder = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
    const sortedFlags = [...this.flags].sort((a, b) => {
      const continentDiff = continentOrder.indexOf(a.continent) - continentOrder.indexOf(b.continent);
      if (continentDiff !== 0) return continentDiff;
      return a.name.localeCompare(b.name);
    });

    let activeContinent = '';
    sortedFlags.forEach((flag) => {
      if (flag.continent !== activeContinent) {
        activeContinent = flag.continent;
        const header = document.createElement('div');
        header.className = 'encyclopedia-continent-header';
        header.setAttribute('data-continent', activeContinent);
        header.innerHTML = `
          <span class="encyclopedia-continent-name">${activeContinent}</span>
          <span class="encyclopedia-continent-count" data-count-for="${activeContinent}">0 flags</span>
        `;
        grid.appendChild(header);
      }

      const card = document.createElement('div');
      card.className = 'encyclopedia-card glass-panel';
      card.setAttribute('data-country', flag.name);
      card.setAttribute('data-code', flag.code);
      card.setAttribute('data-continent', flag.continent);
      card.onclick = () => this.openFlagModal(flag);

      card.innerHTML = `
        <div class="encyclopedia-flag-box">
          <img src="https://flagcdn.com/w320/${flag.code}.png" alt="${flag.name} flag" loading="lazy">
        </div>
        <div class="encyclopedia-info">
          <span class="encyclopedia-country-name">${flag.name}</span>
          <span class="encyclopedia-country-sub">Capital: ${flag.capital}</span>
        </div>
      `;
      grid.appendChild(card);
    });

    this.filterAtlas();
  }

  filterAtlas() {
    const searchVal = document.getElementById('atlas-search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.encyclopedia-card');
    const headers = document.querySelectorAll('.encyclopedia-continent-header');
    const visibleContinents = new Set();
    const continentCounts = new Map();
    let resultsCount = 0;

    cards.forEach((card) => {
      const countryName = card.getAttribute('data-country').toLowerCase();
      const code = card.getAttribute('data-code');
      const flagObj = this.flags.find((f) => f.code === code);

      const capital = flagObj.capital.toLowerCase();
      const colors = flagObj.colors.join(' ');
      const features = flagObj.features.join(' ');

      // Match Text Queries
      const matchesSearch = countryName.includes(searchVal) || capital.includes(searchVal) || colors.includes(searchVal) || features.includes(searchVal);

      // Match Tag Filters (Multi-select)
      // Continent Match (OR logic: match any of the selected continents)
      const matchesContinent = this.activeFilters.continent.includes('all') || this.activeFilters.continent.includes(flagObj.continent);

      // Color Match (AND logic: flag must contain ALL selected colors)
      const matchesColor = this.activeFilters.color.includes('all') || this.activeFilters.color.every((c) => flagObj.colors.includes(c));

      // Feature Match (AND logic: flag must contain ALL selected features)
      const matchesFeature = this.activeFilters.feature.includes('all') || this.activeFilters.feature.every((f) => this.flagHasFeature(flagObj, f));

      if (matchesSearch && matchesContinent && matchesColor && matchesFeature) {
        card.style.display = 'flex';
        visibleContinents.add(flagObj.continent);
        continentCounts.set(flagObj.continent, (continentCounts.get(flagObj.continent) || 0) + 1);
        resultsCount++;
      } else {
        card.style.display = 'none';
      }
    });

    headers.forEach((header) => {
      const continent = header.getAttribute('data-continent');
      const count = continentCounts.get(continent) || 0;
      const countEl = header.querySelector('.encyclopedia-continent-count');
      header.style.display = visibleContinents.has(continent) ? 'flex' : 'none';
      if (countEl) countEl.textContent = `${count} flag${count === 1 ? '' : 's'}`;
    });

    const resultSummary = document.getElementById('atlas-result-summary');
    if (resultSummary) {
      resultSummary.textContent = `${resultsCount} of ${this.flags.length} flag${resultsCount === 1 ? '' : 's'} shown`;
    }

    // Show no results banner if count is 0
    let emptyMsg = document.getElementById('atlas-empty-msg');
    if (resultsCount === 0) {
      if (!emptyMsg) {
        emptyMsg = document.createElement('div');
        emptyMsg.id = 'atlas-empty-msg';
        emptyMsg.style.gridColumn = '1 / -1';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '3rem';
        emptyMsg.style.color = 'var(--text-muted)';
        emptyMsg.textContent = 'No country flags match your search or filter tags.';
        document.getElementById('encyclopedia-grid-container').appendChild(emptyMsg);
      }
    } else if (emptyMsg) {
      emptyMsg.remove();
    }
  }

  selectFilter(element, event) {
    const filterType = element.getAttribute('data-filter'); // e.g. "continent"
    const filterValue = element.getAttribute('data-value'); // e.g. "Europe" or "all"
    const isMultiSelect = Boolean(event && (event.ctrlKey || event.metaKey));
    const tags = element.parentNode.querySelectorAll('.filter-tag');

    let currentSelection = this.activeFilters[filterType] || ['all'];

    if (filterValue === 'all') {
      // Clear all other values
      currentSelection = ['all'];
    } else {
      if (isMultiSelect) {
        currentSelection = currentSelection.filter((v) => v !== 'all');

        if (currentSelection.includes(filterValue)) {
          currentSelection = currentSelection.filter((v) => v !== filterValue);
        } else {
          currentSelection.push(filterValue);
        }
      } else {
        currentSelection = [filterValue];
      }

      if (currentSelection.length === 0) {
        currentSelection = ['all'];
      }
    }

    tags.forEach((tag) => {
      const tagValue = tag.getAttribute('data-value');
      tag.classList.toggle('active', currentSelection.includes(tagValue));
    });

    this.activeFilters[filterType] = currentSelection;

    this.playAudioTone(800, 'sine', 0.02);
    this.filterAtlas();
  }

  formatFeatureLabel(feature) {
    return feature
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  flagHasFeature(flag, feature) {
    if (feature === 'stars') {
      return flag.features.includes('stars') || flag.features.includes('star');
    }

    return flag.features.includes(feature);
  }

  getCuratedFlagLearning(flag) {
    const notes = {
      ca: {
        nickname: 'The Maple Leaf',
        adopted: 'February 15, 1965',
        origin: 'The single maple leaf became a clear national symbol after a long flag debate.',
        memory: 'A red maple leaf between two red bars: Canada is the maple leaf flag.',
      },
      jp: {
        nickname: 'Hinomaru, meaning circle of the sun',
        adopted: 'August 13, 1999 as the official national flag; the design is much older.',
        origin: 'The red disc represents the sun, linking Japan to the idea of the rising sun.',
        memory: 'A giant red sun floating in a white sky.',
      },
      np: {
        construction: 'The only non-rectangular national flag.',
        origin: 'Its stacked pennants connect to older South Asian banner traditions.',
        memory: 'Two red mountain pennants with blue edges: Nepal breaks the rectangle rule.',
      },
      ch: {
        construction: 'One of the two square sovereign-state flags, along with Vatican City.',
        origin: 'The white cross on red is tied to Swiss military and confederation symbols.',
        memory: 'A medical-looking white plus on red, but Switzerland came first.',
      },
      va: {
        construction: 'One of the two square sovereign-state flags, along with Switzerland.',
        origin: 'Yellow and white reflect the keys of Saint Peter used in Vatican symbolism.',
      },
      mz: {
        construction: 'The only national flag with a modern firearm, an AK-47.',
        independence: 'The book, hoe, star, and rifle connect education, agriculture, socialism, and defense after liberation.',
      },
      bz: {
        construction: 'One of the most visually detailed national flags, with many colors in the coat of arms.',
        memory: 'Blue and red frame a detailed seal with two people and a mahogany tree.',
      },
      gh: {
        family: 'Pan-African / Ethiopian colors',
        independence: 'Ghana popularized red, yellow, and green in many post-colonial African flags.',
      },
      et: {
        family: 'Ethiopian colors, a major source for Pan-African flag palettes.',
        origin: 'Ethiopia was never colonized in the same way as many African states, so its colors became a symbol of African independence.',
      },
      ml: {
        family: 'Pan-African / Ethiopian colors',
        memory: 'Mali is the vertical green-yellow-red tricolor with no emblem.',
      },
      jo: {
        family: 'Pan-Arab colors',
        origin: 'The black, white, green, and red palette connects to Arab historical dynasties and revolt symbolism.',
      },
      ae: {
        family: 'Pan-Arab colors',
        memory: 'A red hoist bar holding green, white, and black horizontal bands.',
      },
      ps: {
        family: 'Pan-Arab colors',
        memory: 'Like Jordan without the white star in the red triangle.',
      },
      iq: {
        family: 'Pan-Arab colors',
        memory: 'Red-white-black horizontal bands with green script in the center.',
      },
      ru: {
        family: 'Slavic tricolor family',
        memory: 'White-blue-red horizontal bands: Russia sets the order for many Slavic relatives.',
      },
      sk: {
        family: 'Slavic tricolor family',
        memory: 'Like Russia with a shield near the hoist.',
      },
      rs: {
        family: 'Slavic tricolor family',
        memory: 'Red-blue-white horizontal bands with a coat of arms near the hoist.',
      },
      ro: {
        memory: 'Think of Romania as the French flag standing up, but yellow replaces white.',
      },
      td: {
        memory: 'Very close to Romania; Chad uses a deeper blue.',
      },
      nl: {
        memory: 'Red-white-blue horizontal bands; Russia uses white-blue-red instead.',
      },
      fr: {
        origin: 'The French tricolor became a model for many later republican and national tricolors.',
      },
      gb: {
        nickname: 'Union Jack',
        origin: 'It layers the crosses of England, Scotland, and Ireland into one union design.',
      },
      us: {
        nickname: 'Stars and Stripes',
        adopted: 'Original Stars and Stripes adopted June 14, 1777; current 50-star design adopted July 4, 1960.',
        memory: 'Fifty stars for states, thirteen stripes for the original colonies.',
      },
    };

    return notes[flag.code] || {};
  }

  getFlagAdoptionDate(flag) {
    const adoptedDates = {
      dk: '1625',
      nl: '1660',
      gb: '1 January 1801',
      ar: '27 February 1812',
      cl: '18 October 1817',
      pe: '1825',
      uy: '1828',
      fr: '1830',
      tn: '1831',
      be: '1831',
      py: '1842',
      tr: '1844',
      lr: '1847',
      cr: '1848',
      bo: '1851',
      co: '1861',
      sm: '1862',
      jp: '1870',
      gt: '1871',
      to: '1875',
      mc: '1881',
      kr: '1883',
      ch: '1889',
      ph: '12 February 1898',
      no: '1899',
      ec: '1900',
      au: '1 January 1901',
      cu: '1902',
      se: '1906',
      do: '1908',
      ni: '1908',
      pt: '1911',
      al: '1912',
      sv: '17 May 1912',
      ma: '1915',
      th: '1917',
      at: '1918',
      ee: '1918',
      fi: '1918',
      de: '1918',
      ie: '1919',
      pl: '1919',
      lv: '1921',
      pa: '1925',
      jo: '1928',
      tw: '1928',
      va: '1929',
      li: '1937',
      it: '1943',
      lb: '1943',
      is: '1944',
      id: '1945',
      vn: '1945',
      in: '24 July 1947',
      pk: '11 August 1947',
      nz: '1947',
      kp: 'July 1948',
      il: '1948',
      ad: '1949',
      ws: '1949',
      cn: '1 October 1949',
      my: '1950',
      mg: '1958',
      gn: '1958',
      cf: '1958',
      bj: '1959',
      bn: '1959',
      ci: '1959',
      ne: '1959',
      sg: '1959',
      td: '1959',
      cy: '1960',
      ga: '1960',
      ml: '1960',
      ng: '1960',
      sn: '1960',
      so: '1960',
      tg: '27 April 1960',
      us: '4 July 1960',
      kw: '7 September 1961',
      sl: '1961',
      dz: '1962',
      jm: '1962',
      np: '16 December 1962',
      tt: '1962',
      ug: '1962',
      ke: '1963',
      mt: '1964',
      tz: '1964',
      zm: '1964',
      ca: '15 February 1965',
      gm: '1965',
      mv: '25 July 1965',
      bb: '1966',
      bw: '1966',
      gh: '1966',
      gy: '1966',
      ag: '27 February 1967',
      bi: '1967',
      mx: '1968',
      mu: '1968',
      nr: '1968',
      sz: '1968',
      bt: '1969',
      fj: '1970',
      sd: '1970',
      ae: '1971',
      qa: '1971',
      bd: '1972',
      lk: '1972',
      lu: '1972',
      bs: '1973',
      gw: '1973',
      sa: '1973',
      gd: '1974',
      ao: '1975',
      cm: '20 May 1975',
      la: '1975',
      pg: '1975',
      st: '1975',
      sr: '1975',
      dj: '1976',
      sb: '1977',
      gr: '1978',
      fm: '1979',
      gq: '1979',
      ki: '1979',
      lc: '1979',
      mh: '1979',
      ir: '1980',
      vu: '1980',
      zw: '18 April 1980',
      bz: '1981',
      es: '1981',
      pw: '1981',
      kn: '1983',
      mz: '1983',
      bf: '1984',
      eg: '1984',
      vc: '1985',
      ht: '1986',
      lt: '1988',
      ps: '1988',
      ro: '1989',
      am: '1990',
      dm: '1990',
      hr: '1990',
      hu: '1990',
      md: '1990',
      na: '1990',
      ye: '1990',
      az: '1991',
      bg: '1991',
      cg: '10 June 1991',
      ru: '1991',
      si: '25 June 1991',
      uz: '18 November 1991',
      br: '11 May 1992',
      cv: '22 September 1992',
      kz: '4 June 1992',
      mn: '12 January 1992',
      sk: '3 September 1992',
      tj: '24 November 1992',
      tm: '19 February 1992',
      ua: '28 January 1992',
      cz: '1 January 1993',
      er: '24 May 1993',
      kh: 'June 1993',
      za: '27 April 1994',
      by: '7 June 1995',
      mk: '5 October 1995',
      om: '25 April 1995',
      et: '31 October 1996',
      sc: '8 January 1996',
      tv: '11 April 1997',
      ba: '4 February 1998',
      km: '23 December 2001',
      rw: '31 December 2001',
      bh: '14 February 2002',
      tl: '20 May 2002',
      ge: '14 January 2004',
      me: '13 July 2004',
      rs: '2004',
      cd: '20 February 2006',
      ls: '4 October 2006',
      ve: '12 March 2006',
      iq: '22 January 2008',
      xk: '17 February 2008',
      mm: '21 October 2010',
      ly: '17 February 2011',
      ss: '9 July 2011',
      mw: '28 May 2012',
      mr: '15 August 2017',
      af: '15 August 2021',
      kg: '26 December 2023',
      sy: '8 December 2024',
      hn: '27 January 2026',
    };

    return adoptedDates[flag.code] || '';
  }

  getFlagLanguages(flag) {
    const languages = {
      fr: 'French',
      de: 'German',
      it: 'Italian',
      gb: 'English',
      es: 'Spanish',
      nl: 'Dutch',
      be: 'Dutch, French, German',
      ch: 'German, French, Italian, Romansh',
      gr: 'Greek',
      se: 'Swedish',
      dk: 'Danish',
      no: 'Norwegian, Sami',
      fi: 'Finnish, Swedish',
      ie: 'English, Irish',
      pt: 'Portuguese',
      at: 'German',
      pl: 'Polish',
      ua: 'Ukrainian',
      is: 'Icelandic',
      va: 'Italian, Latin',
      mc: 'French',
      ad: 'Catalan',
      hr: 'Croatian',
      cz: 'Czech',
      hu: 'Hungarian',
      ro: 'Romanian',
      bg: 'Bulgarian',
      ee: 'Estonian',
      lv: 'Latvian',
      lt: 'Lithuanian',
      sk: 'Slovak',
      si: 'Slovene',
      al: 'Albanian',
      ba: 'Bosnian, Serbian, Croatian',
      mk: 'Macedonian, Albanian',
      mt: 'Maltese, English',
      sm: 'Italian',
      li: 'German',
      me: 'Montenegrin, Serbian, Bosnian, Albanian, Croatian',
      md: 'Romanian',
      cy: 'Greek, Turkish',
      lu: 'Luxembourgish, French, German',
      by: 'Russian, Belarusian',
      jp: 'Japanese',
      cn: 'Mandarin Chinese',
      in: 'Hindi, English',
      kr: 'Korean',
      kp: 'Korean',
      il: 'Hebrew, Arabic',
      sa: 'Arabic',
      tr: 'Turkish',
      vn: 'Vietnamese',
      id: 'Indonesian',
      sg: 'English, Mandarin, Malay, Tamil',
      my: 'Malay',
      ph: 'Filipino, English',
      th: 'Thai',
      pk: 'Punjabi, Pashto, Sindhi, Saraiki, Urdu, English',
      bd: 'Bengali',
      tw: 'Mandarin Chinese',
      mn: 'Mongolian',
      np: 'Nepali',
      lk: 'Sinhala, Tamil',
      ir: 'Persian',
      iq: 'Arabic, Kurdish',
      jo: 'Arabic',
      lb: 'Arabic, French, English',
      kz: 'Kazakh, Russian',
      ae: 'Arabic',
      qa: 'Arabic',
      bh: 'Arabic',
      om: 'Arabic',
      ye: 'Arabic',
      kw: 'Arabic',
      sy: 'Arabic',
      kh: 'Khmer',
      us: 'English, Spanish',
      ca: 'English, French',
      mx: 'Spanish',
      br: 'Portuguese',
      ar: 'Spanish',
      co: 'Spanish',
      pe: 'Spanish, Quechua, Aymara',
      cl: 'Spanish',
      ve: 'Spanish',
      cu: 'Spanish',
      jm: 'English, Jamaican Patois',
      bs: 'English',
      cr: 'Spanish',
      pa: 'Spanish',
      uy: 'Spanish',
      ec: 'Spanish, Quechua',
      bo: 'Spanish, Quechua, Aymara, Guarani',
      py: 'Spanish, Guarani',
      do: 'Spanish',
      gt: 'Spanish, Mayan languages',
      hn: 'Spanish',
      za: 'Zulu, Xhosa, Afrikaans, English, Northern Sotho, Tswana, Southern Sotho, Tsonga, Swazi, Venda, Southern Ndebele',
      eg: 'Arabic',
      ng: 'English, Hausa, Yoruba, Igbo',
      ke: 'Swahili, English',
      ma: 'Arabic, Berber',
      et: 'Amharic, Oromo, Somali, Tigrinya',
      gh: 'English, Akan, Ewe, Dagbani',
      mg: 'Malagasy, French',
      dz: 'Arabic, Berber',
      tn: 'Arabic',
      sn: 'French, Wolof',
      cm: 'French, English',
      ci: 'French',
      ao: 'Portuguese',
      zw: 'Shona, Ndebele, English',
      tz: 'Swahili, English',
      cd: 'French, Lingala, Swahili, Kikongo, Tshiluba',
      ug: 'English, Swahili',
      au: 'English',
      nz: 'English, Maori, New Zealand Sign Language',
      fj: 'English, Fijian, Fiji Hindi',
      pg: 'Tok Pisin, English, Hiri Motu',
      ws: 'Samoan, English',
      af: 'Dari, Pashto',
      ag: 'English',
      am: 'Armenian',
      az: 'Azerbaijani, Russian',
      bb: 'English',
      bz: 'English, Spanish, Belizean Creole',
      bj: 'French',
      bt: 'Dzongkha',
      bw: 'Tswana, English',
      bn: 'Malay',
      bf: 'French',
      bi: 'Kirundi, French, English',
      cv: 'Portuguese, Cape Verdean Creole',
      cf: 'Sango, French',
      td: 'Arabic, French',
      km: 'Comorian, Arabic, French',
      cg: 'French, Lingala, Kituba',
      dj: 'Somali, Afar, Arabic, French',
      dm: 'English',
      sv: 'Spanish',
      gq: 'Spanish, French, Portuguese',
      er: 'Tigrinya, Arabic, English',
      sz: 'Swazi, English',
      ga: 'French',
      gm: 'English',
      ge: 'Georgian',
      gd: 'English',
      gn: 'French',
      gw: 'Portuguese, Guinea-Bissau Creole',
      gy: 'English',
      ht: 'Haitian Creole, French',
      ki: 'Gilbertese, English',
      xk: 'Albanian, Serbian',
      kg: 'Kyrgyz, Russian',
      la: 'Lao',
      ls: 'Sotho, English',
      lr: 'English',
      ly: 'Arabic',
      mw: 'Chewa, English',
      mv: 'Dhivehi',
      ml: 'Bambara, French',
      mh: 'Marshallese, English',
      mr: 'Arabic',
      mu: 'Mauritian Creole, French, English',
      fm: 'English',
      mz: 'Portuguese',
      mm: 'Burmese',
      na: 'English, Oshiwambo, Afrikaans, German',
      nr: 'Nauruan, English',
      ni: 'Spanish',
      ne: 'French, Hausa, Zarma',
      pw: 'Palauan, English',
      ps: 'Arabic',
      ru: 'Russian',
      rw: 'Kinyarwanda, English, French',
      kn: 'English',
      lc: 'English',
      vc: 'English',
      st: 'Portuguese',
      rs: 'Serbian',
      sc: 'Seychellois Creole, English, French',
      sl: 'English, Krio',
      sb: 'English',
      so: 'Somali, Arabic',
      ss: 'English',
      sd: 'Arabic, English',
      sr: 'Dutch, Sranan Tongo',
      tj: 'Tajik, Russian',
      tl: 'Tetum, Portuguese, Indonesian',
      tg: 'French, Ewe, Kabiye',
      to: 'Tongan, English',
      tt: 'English',
      tm: 'Turkmen, Russian',
      tv: 'Tuvaluan, English',
      uz: 'Uzbek, Russian',
      vu: 'Bislama, English, French',
      zm: 'English, Bemba, Nyanja, Tonga',
    };

    return languages[flag.code] || '';
  }

  getFlagFamily(flag) {
    const colors = new Set(flag.colors);
    const hasAll = (...items) => items.every((item) => colors.has(item));
    const nordicCodes = new Set(['dk', 'fi', 'is', 'no', 'se']);
    const slavicCodes = new Set(['ru', 'sk', 'si', 'rs', 'hr', 'cz']);

    if (nordicCodes.has(flag.code)) return 'Nordic cross family';
    if (slavicCodes.has(flag.code)) return 'Slavic white-blue-red family';
    if (hasAll('black', 'white', 'green', 'red')) return 'Pan-Arab color family';
    if (flag.continent === 'Africa' && hasAll('red', 'yellow', 'green')) return 'Pan-African / Ethiopian color family';
    if (flag.features.includes('vertical-stripes')) return 'Vertical tricolor family';
    if (flag.features.includes('horizontal-stripes')) return 'Horizontal stripe family';
    if (flag.features.includes('cross')) return 'Cross flag family';
    return '';
  }

  getMemoryHook(flag) {
    const curated = this.getCuratedFlagLearning(flag);
    return curated.memory;
  }

  getFlagLearningDetails(flag) {
    const curated = this.getCuratedFlagLearning(flag);
    const details = [];
    const addDetail = (label, value) => {
      if (value) details.push({ label, value });
    };

    addDetail('Nickname', curated.nickname);
    addDetail('Current design adopted', curated.adopted || this.getFlagAdoptionDate(flag));
    addDetail('Languages spoken', this.getFlagLanguages(flag));
    addDetail('Flag family', curated.family || this.getFlagFamily(flag));
    addDetail('Historical origin', curated.origin);
    addDetail('Independence connection', curated.independence);
    addDetail('Construction fact', curated.construction);
    addDetail('Memory hook', this.getMemoryHook(flag));

    return details;
  }

  renderFlagLearningDetails(container, flag) {
    if (!container) return;
    container.textContent = '';
    this.getFlagLearningDetails(flag).forEach((detail) => {
      const item = document.createElement('div');
      item.className = 'flag-learning-item';

      const label = document.createElement('span');
      label.className = 'flag-learning-label';
      label.textContent = detail.label;

      const value = document.createElement('span');
      value.className = 'flag-learning-value';
      value.textContent = detail.value;

      item.append(label, value);
      container.appendChild(item);
    });
  }

  openFlagModal(flag) {
    this.playAudioTone(440, 'sine', 0.05);
    this.lastModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const modalFlagImg = document.getElementById('modal-flag-img');
    modalFlagImg.alt = `${flag.name} flag`;
    modalFlagImg.dataset.flagCode = flag.code;
    this.getCachedFlagImageSrc(flag.code, 320).then((flagSrc) => {
      if (modalFlagImg.dataset.flagCode === flag.code && modalFlagImg.getAttribute('src') !== flagSrc) {
        modalFlagImg.src = flagSrc;
      }
    });
    document.getElementById('modal-country-name').textContent = flag.name;
    document.getElementById('modal-capital').textContent = flag.capital;
    document.getElementById('modal-continent').textContent = flag.continent;

    const difficulties = ['Beginner', 'Intermediate', 'Expert'];
    document.getElementById('modal-difficulty').textContent = difficulties[flag.difficulty - 1];

    const capitalizedColors = flag.colors.map((c) => c.charAt(0).toUpperCase() + c.slice(1));
    document.getElementById('modal-colors').textContent = capitalizedColors.join(', ');
    document.getElementById('modal-mnemonic').textContent = flag.fact;
    this.renderFlagLearningDetails(document.getElementById('modal-learning-details'), flag);
    this.renderCountryLocatorMap(document.getElementById('modal-locator-map'), flag);

    const modal = document.getElementById('flag-detail-modal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();

    // Track encyclopedia clicks for achievements
    this.viewedCountries.add(flag.code);
    if (this.viewedCountries.size >= 10) {
      this.checkAchievements();
    }
  }

  closeModal() {
    const modal = document.getElementById('flag-detail-modal');
    if (!modal || !modal.classList.contains('active')) return;

    this.playAudioTone(300, 'sine', 0.05);
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');

    if (this.lastModalTrigger && document.contains(this.lastModalTrigger)) {
      this.lastModalTrigger.focus();
    }
    this.lastModalTrigger = null;
  }

  setupModalKeyboardControls() {
    if (this.modalKeyboardReady) return;
    this.modalKeyboardReady = true;

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  // --- WORLD MAP ---
  normalizeCountryName(name) {
    return String(name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'and')
      .replace(/\bthe\b/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  getMapMarkerOverrides() {
    return {
      // Multipolygon centroids can land in awkward places; these keep major flags in the expected visual region.
      us: [-98.5, 39.5],
      ca: [-106.3, 56.1],
      gb: [-2.5, 54.2],
      ru: [90, 61],
      no: [8.5, 61],
      nz: [172, -41],
      fj: [178, -17.8],
    };
  }

  getCountryLocatorCoordinates() {
    return {
      ad: [1.52, 42.51],
      af: [67.71, 33.94],
      ag: [-61.8, 17.06],
      am: [45.04, 40.07],
      az: [47.58, 40.14],
      bb: [-59.54, 13.19],
      bj: [2.32, 9.31],
      bh: [50.56, 26.07],
      bt: [90.43, 27.51],
      bw: [24.68, -22.33],
      bs: [-77.4, 25.03],
      bf: [-1.56, 12.24],
      bi: [29.92, -3.37],
      bn: [114.73, 4.54],
      bz: [-88.5, 17.19],
      cf: [20.94, 6.61],
      cv: [-23.61, 15.12],
      cg: [15.83, -0.23],
      td: [18.73, 15.45],
      cy: [33.43, 35.13],
      dj: [42.59, 11.83],
      dm: [-61.37, 15.41],
      er: [39.78, 15.18],
      gq: [10.27, 1.65],
      ga: [11.61, -0.8],
      gm: [-15.31, 13.44],
      ge: [43.36, 42.32],
      fm: [158.16, 6.92],
      gd: [-61.68, 12.12],
      gn: [-9.7, 9.95],
      gw: [-15.18, 11.8],
      gy: [-58.93, 4.86],
      ht: [-72.29, 18.97],
      ki: [-157.36, 1.87],
      km: [43.25, -11.65],
      kn: [-62.78, 17.36],
      kg: [74.77, 41.2],
      la: [102.5, 19.86],
      lc: [-60.98, 13.91],
      li: [9.56, 47.17],
      lr: [-9.43, 6.43],
      ls: [28.23, -29.61],
      ly: [17.23, 26.34],
      lu: [6.13, 49.61],
      mc: [7.42, 43.74],
      ml: [-3.99, 17.57],
      mw: [34.3, -13.25],
      mh: [171.38, 7.13],
      mt: [14.38, 35.94],
      mr: [-10.94, 21.01],
      mv: [73.51, 4.18],
      mu: [57.55, -20.35],
      mm: [95.96, 21.92],
      mz: [35.53, -18.67],
      na: [18.49, -22.96],
      ne: [8.08, 17.61],
      ni: [-85.21, 12.87],
      nr: [166.93, -0.52],
      pw: [134.58, 7.5],
      ps: [35.23, 31.95],
      rw: [29.87, -1.94],
      sc: [55.45, -4.68],
      sg: [103.82, 1.35],
      sl: [-11.78, 8.46],
      sm: [12.46, 43.94],
      sb: [159.97, -9.65],
      so: [46.2, 5.15],
      ss: [31.31, 6.88],
      sd: [30.22, 12.86],
      sr: [-56.03, 3.92],
      st: [6.73, 0.19],
      sv: [-88.9, 13.79],
      sz: [31.47, -26.52],
      tj: [71.28, 38.86],
      tl: [125.73, -8.87],
      tg: [0.82, 8.62],
      to: [-175.2, -21.18],
      tt: [-61.22, 10.69],
      tm: [59.56, 38.97],
      tv: [179.2, -8.52],
      uz: [64.59, 41.38],
      va: [12.45, 41.9],
      vc: [-61.2, 13.25],
      vu: [166.96, -15.38],
      ws: [-171.75, -13.76],
      xk: [20.9, 42.6],
      zm: [27.85, -13.13],
    };
  }

  getMapNameAliases() {
    return {
      'United States of America': 'United States',
      'Czech Republic': 'Czechia',
      'Bosnia and Herz.': 'Bosnia and Herzegovina',
      Macedonia: 'North Macedonia',
      'Dem. Rep. Congo': 'Democratic Republic of the Congo',
      Congo: 'Congo, Republic',
      'Republic of Congo': 'Congo, Republic',
      'Côte d’Ivoire': 'Ivory Coast',
      "Côte d'Ivoire": 'Ivory Coast',
      'Cote dIvoire': 'Ivory Coast',
      'Eq. Guinea': 'Equatorial Guinea',
      eSwatini: 'Eswatini',
      Swaziland: 'Eswatini',
      'S. Sudan': 'South Sudan',
      'Central African Rep.': 'Central African Republic',
      'Dominican Rep.': 'Dominican Republic',
      'Solomon Is.': 'Solomon Islands',
      'East Timor': 'Timor-Leste',
      Burma: 'Myanmar',
      'Lao PDR': 'Laos',
      Korea: 'South Korea',
      'Russian Federation': 'Russia',
      Türkiye: 'Turkey',
      'United Republic of Tanzania': 'Tanzania',
      'W. Sahara': '',
      'Western Sahara': '',
      Somaliland: '',
    };
  }

  getFlagByMapName(mapName, flagLookup, aliases) {
    const alias = aliases[mapName];
    if (alias === '') return null;
    const targetName = alias || mapName;
    return flagLookup.get(this.normalizeCountryName(targetName)) || null;
  }

  getFlagImageCdnSrc(code, width = 320) {
    return `https://flagcdn.com/w${width}/${code}.png`;
  }

  getCachedFlagImageSrc(code, width = 320) {
    const cacheKey = `${width}:${code}`;
    const cached = this.flagImageCache.get(cacheKey);
    if (cached?.objectUrl) return Promise.resolve(cached.objectUrl);
    if (cached?.promise) return cached.promise;

    const cdnSrc = this.getFlagImageCdnSrc(code, width);
    const cacheEntry = {
      objectUrl: '',
      promise: fetch(cdnSrc, { cache: 'force-cache' })
        .then((response) => {
          if (!response.ok) throw new Error(`Unable to cache flag image: ${response.status}`);
          return response.blob();
        })
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          cacheEntry.objectUrl = objectUrl;
          return objectUrl;
        })
        .catch((error) => {
          console.warn('Falling back to CDN flag image:', error);
          cacheEntry.objectUrl = cdnSrc;
          return cdnSrc;
        }),
    };

    this.flagImageCache.set(cacheKey, cacheEntry);
    return cacheEntry.promise;
  }

  preloadFlagImage(code, width = 320) {
    this.getCachedFlagImageSrc(code, width);
  }

  renderCountryLocatorMap(container, flag, options = {}) {
    if (!container) return;
    const { compact = false, popover = false } = options;
    container.textContent = '';
    container.className = ['flag-locator-map', compact ? 'compact' : '', popover ? 'popover' : ''].filter(Boolean).join(' ');

    if (!this.mapLocatorContext) {
      container.hidden = true;
      return;
    }
    container.hidden = false;

    const { countries, width, height, path, projection, markerOverrides, locatorCoordinates, getLocatorViewBox } = this.mapLocatorContext;
    const locatorCoords = locatorCoordinates[flag.code] || markerOverrides[flag.code];
    const marker = this.mapLocatorContext.markerByCode?.get(flag.code);
    const locatorPoint = locatorCoords ? projection(locatorCoords) : marker ? [marker.x, marker.y] : null;
    if (!locatorPoint) {
      container.hidden = true;
      return;
    }

    const [locatorX, locatorY] = locatorPoint;
    const viewBox = getLocatorViewBox(flag, locatorX, locatorY);
    const dotRadius = Math.max(3.5, Math.min(12, viewBox.width * 0.018));

    const locatorSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    locatorSvg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    locatorSvg.setAttribute('role', 'img');
    locatorSvg.setAttribute('aria-label', `Approximate location of ${flag.name} in ${flag.continent}`);
    locatorSvg.classList.add('map-unplaced-locator-svg');

    const locatorOcean = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    locatorOcean.setAttribute('class', 'map-unplaced-locator-ocean');
    locatorOcean.setAttribute('width', width);
    locatorOcean.setAttribute('height', height);
    locatorSvg.appendChild(locatorOcean);

    countries.forEach((country) => {
      const miniPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      miniPath.setAttribute('class', 'map-unplaced-locator-country');
      miniPath.setAttribute('d', path(country));
      locatorSvg.appendChild(miniPath);
    });

    const locatorDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    locatorDot.setAttribute('class', 'map-unplaced-locator-dot');
    locatorDot.setAttribute('cx', locatorX);
    locatorDot.setAttribute('cy', locatorY);
    locatorDot.setAttribute('r', dotRadius);
    locatorSvg.appendChild(locatorDot);

    const locatorRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    locatorRing.setAttribute('class', 'map-unplaced-locator-ring');
    locatorRing.setAttribute('cx', locatorX);
    locatorRing.setAttribute('cy', locatorY);
    locatorRing.setAttribute('r', dotRadius * 2.4);
    locatorSvg.appendChild(locatorRing);

    container.appendChild(locatorSvg);
  }

  async renderWorldMap() {
    const svg = document.getElementById('world-map-svg');
    const loading = document.getElementById('map-loading');
    const countEl = document.getElementById('map-match-count');
    const unplacedToggle = document.getElementById('map-unplaced-toggle');
    const unplacedPanel = document.getElementById('map-unplaced-panel');
    const flagSearch = document.getElementById('map-flag-search');
    const unplacedList = document.getElementById('map-unplaced-list');
    const unplacedDetail = document.getElementById('map-unplaced-detail');
    const mapContainer = document.getElementById('world-map-scroll');
    const popover = document.getElementById('map-flag-popover');
    const popoverFlag = document.getElementById('map-popover-flag');
    const popoverTitle = document.getElementById('map-popover-title');
    const popoverMeta = document.getElementById('map-popover-meta');
    const popoverFact = document.getElementById('map-popover-fact');
    const popoverLearningDetails = document.getElementById('map-popover-learning-details');
    const popoverLocator = document.getElementById('map-popover-locator');
    if (!svg || this.mapRendered) return;

    if (!window.d3 || !window.topojson) {
      if (loading) loading.textContent = 'Map libraries could not be loaded. Check your internet connection and refresh.';
      if (countEl) countEl.textContent = 'Map unavailable';
      return;
    }

    try {
      if (loading) loading.textContent = 'Loading country boundaries...';
      const world = await window.d3.json(this.mapDataUrl);
      const countries = window.topojson.feature(world, world.objects.countries).features;
      const width = 1600;
      const height = 900;
      const projection = window.d3.geoMercator().fitExtent(
        [
          [40, 35],
          [1560, 820],
        ],
        {
          type: 'FeatureCollection',
          features: countries,
        },
      );
      const path = window.d3.geoPath(projection);
      const d3svg = window.d3.select(svg);
      const flagLookup = new Map(this.flags.map((flag) => [this.normalizeCountryName(flag.name), flag]));
      const aliases = this.getMapNameAliases();
      const markerOverrides = this.getMapMarkerOverrides();
      const locatorCoordinates = this.getCountryLocatorCoordinates();
      const getFlagForCountry = (country) => {
        const mapName = country.properties?.name || '';
        return this.getFlagByMapName(mapName, flagLookup, aliases);
      };

      d3svg.selectAll('*').remove();

      d3svg.append('rect').attr('class', 'map-ocean').attr('width', width).attr('height', height);

      const countryLayer = d3svg.append('g').attr('class', 'country-boundaries');

      countryLayer
        .selectAll('path')
        .data(countries)
        .join('path')
        .attr('class', (d) => (getFlagForCountry(d) ? 'map-country has-flag-data' : 'map-country'))
        .attr('data-flag-code', (d) => getFlagForCountry(d)?.code || '')
        .attr('d', path)
        .on('mouseenter', (event, d) => highlightCountry(d))
        .on('mouseleave', () => clearCountryHighlight())
        .append('title')
        .text((d) => d.properties?.name || 'Country');

      let activeHighlightedFlagCode = '';
      let finderHighlightedFlagCode = '';
      const clearCountryHighlight = ({ preserveFinderHighlight = false } = {}) => {
        activeHighlightedFlagCode = '';
        if (!preserveFinderHighlight) finderHighlightedFlagCode = '';
        countryLayer.selectAll('.map-country').classed('is-hovered', (d) => preserveFinderHighlight && getFlagForCountry(d)?.code === finderHighlightedFlagCode);
      };

      const highlightCountry = (country) => {
        clearCountryHighlight();
        countryLayer
          .selectAll('.map-country')
          .filter((d) => d === country)
          .classed('is-hovered', true);
      };

      const highlightCountryByFlagCode = (flagCode) => {
        if (activeHighlightedFlagCode === flagCode) return;
        clearCountryHighlight();
        countryLayer
          .selectAll('.map-country')
          .filter((d) => getFlagForCountry(d)?.code === flagCode)
          .classed('is-hovered', true);
        activeHighlightedFlagCode = flagCode;
      };

      const highlightCountryFromFinder = (flagCode) => {
        finderHighlightedFlagCode = flagCode;
        activeHighlightedFlagCode = flagCode;
        countryLayer.selectAll('.map-country').classed('is-hovered', (d) => getFlagForCountry(d)?.code === flagCode);
      };

      const polygonMarkers = countries
        .map((country) => {
          const flag = getFlagForCountry(country);
          if (!flag) return null;
          const overrideCoords = markerOverrides[flag.code];
          const [x, y] = overrideCoords ? projection(overrideCoords) : path.centroid(country);
          if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
          const bounds = path.bounds(country);
          const countryWidth = bounds[1][0] - bounds[0][0];
          const countryHeight = bounds[1][1] - bounds[0][1];
          const size = Math.max(30, Math.min(42, Math.min(countryWidth, countryHeight) * 0.35));
          return { country, flag, x, y, width: size * 1.45, height: size };
        })
        .filter(Boolean);
      const placedCodes = new Set(polygonMarkers.map((marker) => marker.flag.code));
      const coordinateMarkers = this.flags
        .filter((flag) => !placedCodes.has(flag.code))
        .map((flag) => {
          const coords = locatorCoordinates[flag.code] || markerOverrides[flag.code];
          if (!coords) return null;
          const [x, y] = projection(coords);
          if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
          return { country: null, flag, x, y, width: 44, height: 30, isCoordinateMarker: true };
        })
        .filter(Boolean);
      const markers = [...polygonMarkers, ...coordinateMarkers];
      const markerByCode = new Map(markers.map((marker) => [marker.flag.code, marker]));
      const continentOrder = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
      const sortFlagsForNavigator = (flags) =>
        [...flags].sort((a, b) => {
          const continentA = continentOrder.indexOf(a.continent);
          const continentB = continentOrder.indexOf(b.continent);
          const orderA = continentA === -1 ? continentOrder.length : continentA;
          const orderB = continentB === -1 ? continentOrder.length : continentB;
          return orderA - orderB || a.name.localeCompare(b.name);
        });
      const navigatorFlags = sortFlagsForNavigator(this.flags);
      let focusMainMapOnFlag = () => {};

      let activeUnplacedFlagCode = '';
      let unplacedPreview = null;
      let unplacedLocatorZoomStep = 0;
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
      const fitLocatorViewBox = (centerX, centerY, boxWidth, boxHeight) => {
        const viewWidth = Math.min(width, boxWidth);
        const viewHeight = Math.min(height, boxHeight);
        return {
          x: clamp(centerX - viewWidth / 2, 0, width - viewWidth),
          y: clamp(centerY - viewHeight / 2, 0, height - viewHeight),
          width: viewWidth,
          height: viewHeight,
        };
      };
      const getBoundsViewBox = ([west, north, east, south], padding = 55) => {
        const corners = [projection([west, north]), projection([east, south])];
        const xMin = Math.min(corners[0][0], corners[1][0]);
        const xMax = Math.max(corners[0][0], corners[1][0]);
        const yMin = Math.min(corners[0][1], corners[1][1]);
        const yMax = Math.max(corners[0][1], corners[1][1]);
        const centerX = (xMin + xMax) / 2;
        const centerY = (yMin + yMax) / 2;
        return fitLocatorViewBox(centerX, centerY, xMax - xMin + padding * 2, yMax - yMin + padding * 2);
      };
      const getLocatorViewBox = (flag, locatorX, locatorY) => {
        const islandCodes = new Set(['ag', 'bb', 'bs', 'cv', 'dm', 'fm', 'gd', 'ht', 'ki', 'km', 'kn', 'lc', 'mh', 'mt', 'mv', 'mu', 'nr', 'pw', 'sc', 'st', 'to', 'tt', 'tv', 'vc', 'ws']);
        if (flag.continent === 'Oceania' || islandCodes.has(flag.code)) {
          return fitLocatorViewBox(locatorX, locatorY, 260, 146);
        }

        const continentBounds = {
          Africa: [-20, 38, 55, -36],
          Americas: [-170, 72, -30, -56],
          Asia: [25, 82, 150, -12],
          Europe: [-25, 72, 45, 34],
        };

        if (continentBounds[flag.continent]) {
          const continentView = getBoundsViewBox(continentBounds[flag.continent]);
          return fitLocatorViewBox(locatorX, locatorY, continentView.width * 0.42, continentView.height * 0.42);
        }

        return fitLocatorViewBox(locatorX, locatorY, 320, 180);
      };
      this.mapLocatorContext = {
        countries,
        width,
        height,
        path,
        projection,
        markerOverrides,
        locatorCoordinates,
        markerByCode,
        getLocatorViewBox,
      };
      const setLocatorViewBox = (preview, centerX, centerY, viewWidth, viewHeight) => {
        const viewBox = fitLocatorViewBox(centerX, centerY, viewWidth, viewHeight);
        const dotRadius = Math.max(3.5, Math.min(12, viewBox.width * 0.018));

        preview.locatorViewCenter = {
          x: viewBox.x + viewBox.width / 2,
          y: viewBox.y + viewBox.height / 2,
        };
        preview.locatorCurrentViewBox = viewBox;
        preview.locatorSvg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
        preview.locatorDot.setAttribute('r', dotRadius);
        preview.locatorRing.setAttribute('r', dotRadius * 2.4);
      };
      const applyLocatorZoom = (preview, zoomStep = preview.locatorZoomStep || 0) => {
        if (!preview.locatorBaseViewBox || !preview.locatorViewCenter) return;
        preview.locatorZoomStep = clamp(zoomStep, -3, 5);
        unplacedLocatorZoomStep = preview.locatorZoomStep;
        const zoomFactor = Math.pow(1.45, preview.locatorZoomStep);
        const targetWidth = preview.locatorBaseViewBox.width / zoomFactor;
        const targetHeight = preview.locatorBaseViewBox.height / zoomFactor;

        setLocatorViewBox(preview, preview.locatorViewCenter.x, preview.locatorViewCenter.y, targetWidth, targetHeight);
        preview.locatorZoomValue.textContent = `${Math.round(zoomFactor * 100)}%`;
      };
      const getUnplacedPreview = () => {
        if (!unplacedDetail) return null;
        if (unplacedPreview) return unplacedPreview;

        unplacedDetail.textContent = '';

        const flagBox = document.createElement('div');
        flagBox.className = 'map-unplaced-detail-flag-box';

        const flagImg = document.createElement('img');
        flagImg.className = 'map-unplaced-detail-flag';
        flagImg.loading = 'eager';
        flagImg.decoding = 'async';
        flagBox.appendChild(flagImg);

        const title = document.createElement('h3');
        const meta = document.createElement('div');
        meta.className = 'map-unplaced-detail-meta';

        const continent = document.createElement('span');
        const capital = document.createElement('span');
        const difficulty = document.createElement('span');
        meta.append(continent, capital, difficulty);

        const fact = document.createElement('p');

        const learningDetails = document.createElement('div');
        learningDetails.className = 'flag-learning-details compact';

        const locator = document.createElement('div');
        locator.className = 'map-unplaced-locator';

        const locatorHeader = document.createElement('div');
        locatorHeader.className = 'map-unplaced-locator-header';

        const locatorControls = document.createElement('div');
        locatorControls.className = 'map-unplaced-locator-controls';

        const zoomOutButton = document.createElement('button');
        zoomOutButton.type = 'button';
        zoomOutButton.className = 'map-unplaced-locator-btn';
        zoomOutButton.setAttribute('aria-label', 'Zoom locator map out');
        zoomOutButton.textContent = '-';

        const zoomResetButton = document.createElement('button');
        zoomResetButton.type = 'button';
        zoomResetButton.className = 'map-unplaced-locator-btn';
        zoomResetButton.setAttribute('aria-label', 'Reset locator map zoom');
        zoomResetButton.textContent = 'Reset';

        const zoomInButton = document.createElement('button');
        zoomInButton.type = 'button';
        zoomInButton.className = 'map-unplaced-locator-btn';
        zoomInButton.setAttribute('aria-label', 'Zoom locator map in');
        zoomInButton.textContent = '+';

        const locatorZoomValue = document.createElement('span');
        locatorZoomValue.className = 'map-unplaced-locator-zoom';
        locatorZoomValue.textContent = '100%';

        locatorControls.append(zoomOutButton, zoomResetButton, zoomInButton, locatorZoomValue);
        locatorHeader.appendChild(locatorControls);

        const locatorSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        locatorSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        locatorSvg.setAttribute('role', 'img');
        locatorSvg.classList.add('map-unplaced-locator-svg');

        const locatorOcean = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        locatorOcean.setAttribute('class', 'map-unplaced-locator-ocean');
        locatorOcean.setAttribute('width', width);
        locatorOcean.setAttribute('height', height);
        locatorSvg.appendChild(locatorOcean);

        countries.forEach((country) => {
          const miniPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          miniPath.setAttribute('class', 'map-unplaced-locator-country');
          miniPath.setAttribute('d', path(country));
          locatorSvg.appendChild(miniPath);
        });

        const locatorDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        locatorDot.setAttribute('class', 'map-unplaced-locator-dot');
        locatorDot.setAttribute('r', 15);
        locatorSvg.appendChild(locatorDot);

        const locatorRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        locatorRing.setAttribute('class', 'map-unplaced-locator-ring');
        locatorRing.setAttribute('r', 34);
        locatorSvg.appendChild(locatorRing);

        zoomOutButton.addEventListener('click', (event) => {
          event.stopPropagation();
          applyLocatorZoom(unplacedPreview, (unplacedPreview?.locatorZoomStep || 0) - 1);
        });
        zoomResetButton.addEventListener('click', (event) => {
          event.stopPropagation();
          applyLocatorZoom(unplacedPreview, 0);
        });
        zoomInButton.addEventListener('click', (event) => {
          event.stopPropagation();
          applyLocatorZoom(unplacedPreview, (unplacedPreview?.locatorZoomStep || 0) + 1);
        });
        locatorSvg.addEventListener(
          'wheel',
          (event) => {
            event.preventDefault();
            event.stopPropagation();
            const zoomDirection = event.deltaY < 0 ? 1 : -1;
            applyLocatorZoom(unplacedPreview, (unplacedPreview?.locatorZoomStep || 0) + zoomDirection);
          },
          { passive: false },
        );
        locatorSvg.addEventListener('pointerdown', (event) => {
          if (event.button !== 0 || !unplacedPreview?.locatorCurrentViewBox) return;
          event.preventDefault();
          event.stopPropagation();
          const bounds = locatorSvg.getBoundingClientRect();
          unplacedPreview.locatorDrag = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            viewBox: { ...unplacedPreview.locatorCurrentViewBox },
            boundsWidth: bounds.width,
            boundsHeight: bounds.height,
          };
          locatorSvg.setPointerCapture(event.pointerId);
          locatorSvg.classList.add('is-panning');
        });
        locatorSvg.addEventListener('pointermove', (event) => {
          const drag = unplacedPreview?.locatorDrag;
          if (!drag || drag.pointerId !== event.pointerId) return;
          event.preventDefault();
          event.stopPropagation();
          const svgDx = ((event.clientX - drag.clientX) / drag.boundsWidth) * drag.viewBox.width;
          const svgDy = ((event.clientY - drag.clientY) / drag.boundsHeight) * drag.viewBox.height;
          setLocatorViewBox(unplacedPreview, drag.viewBox.x + drag.viewBox.width / 2 - svgDx, drag.viewBox.y + drag.viewBox.height / 2 - svgDy, drag.viewBox.width, drag.viewBox.height);
        });
        const endLocatorDrag = (event) => {
          const drag = unplacedPreview?.locatorDrag;
          if (!drag || drag.pointerId !== event.pointerId) return;
          unplacedPreview.locatorDrag = null;
          locatorSvg.classList.remove('is-panning');
          if (locatorSvg.hasPointerCapture(event.pointerId)) {
            locatorSvg.releasePointerCapture(event.pointerId);
          }
        };
        locatorSvg.addEventListener('pointerup', endLocatorDrag);
        locatorSvg.addEventListener('pointercancel', endLocatorDrag);

        locator.append(locatorHeader, locatorSvg);
        unplacedDetail.append(flagBox, title, meta, fact, learningDetails, locator);
        unplacedPreview = {
          flagImg,
          title,
          continent,
          capital,
          difficulty,
          fact,
          learningDetails,
          locator,
          locatorSvg,
          locatorDot,
          locatorRing,
          locatorZoomValue,
          locatorBaseViewBox: null,
          locatorViewCenter: null,
          locatorCurrentViewBox: null,
          locatorDrag: null,
          locatorZoomStep: unplacedLocatorZoomStep,
        };
        return unplacedPreview;
      };

      const renderUnplacedDetail = (flag) => {
        if (!flag) return;
        if (activeUnplacedFlagCode === flag.code) return;
        const preview = getUnplacedPreview();
        if (!preview) return;

        preview.flagImg.alt = `${flag.name} flag`;
        preview.title.textContent = flag.name;
        preview.continent.textContent = flag.continent;
        preview.capital.textContent = `Capital: ${flag.capital}`;
        preview.difficulty.textContent = `Level ${flag.difficulty}`;
        preview.fact.textContent = flag.fact;
        this.renderFlagLearningDetails(preview.learningDetails, flag);
        const locatorCoords = locatorCoordinates[flag.code] || markerOverrides[flag.code];
        const markerLocation = markerByCode.get(flag.code);
        const locatorPoint = locatorCoords ? projection(locatorCoords) : markerLocation ? [markerLocation.x, markerLocation.y] : null;
        if (locatorPoint) {
          const [locatorX, locatorY] = locatorPoint;
          const locatorViewBox = getLocatorViewBox(flag, locatorX, locatorY);
          preview.locator.hidden = false;
          preview.locatorSvg.setAttribute('aria-label', `Approximate location of ${flag.name} in ${flag.continent}`);
          preview.locatorBaseViewBox = locatorViewBox;
          preview.locatorViewCenter = { x: locatorX, y: locatorY };
          preview.locatorDrag = null;
          preview.locatorSvg.classList.remove('is-panning');
          preview.locatorZoomStep = unplacedLocatorZoomStep;
          preview.locatorDot.setAttribute('cx', locatorX);
          preview.locatorDot.setAttribute('cy', locatorY);
          preview.locatorRing.setAttribute('cx', locatorX);
          preview.locatorRing.setAttribute('cy', locatorY);
          applyLocatorZoom(preview, unplacedLocatorZoomStep);
        } else {
          preview.locator.hidden = true;
        }
        activeUnplacedFlagCode = flag.code;

        this.getCachedFlagImageSrc(flag.code, 320).then((flagSrc) => {
          if (activeUnplacedFlagCode !== flag.code) return;
          if (preview.flagImg.getAttribute('src') !== flagSrc) {
            preview.flagImg.src = flagSrc;
          }
        });
      };

      const getNavigatorSearchText = (flag) =>
        `${flag.name} ${flag.capital} ${flag.continent} ${flag.colors.join(' ')} ${flag.features.join(' ')} ${this.getFlagLearningDetails(flag)
          .map((detail) => `${detail.label} ${detail.value}`)
          .join(' ')}`.toLowerCase();

      const selectUnplacedFlag = (flag, shouldFocusMap = false) => {
        renderUnplacedDetail(flag);
        if (shouldFocusMap) focusMainMapOnFlag(flag);
      };

      if (unplacedToggle && unplacedPanel && unplacedList && unplacedDetail) {
        const closeUnplacedPanel = () => {
          unplacedPanel.classList.remove('active');
          unplacedPanel.setAttribute('aria-hidden', 'true');
          unplacedToggle.setAttribute('aria-expanded', 'false');
        };

        unplacedDetail.textContent = '';

        const renderNavigatorList = (query = '') => {
          const normalizedQuery = query.trim().toLowerCase();
          const visibleFlags = normalizedQuery ? navigatorFlags.filter((flag) => getNavigatorSearchText(flag).includes(normalizedQuery)) : navigatorFlags;

          unplacedList.textContent = '';
          if (!visibleFlags.length) {
            const empty = document.createElement('p');
            empty.className = 'map-unplaced-empty';
            empty.textContent = 'No flags match that search.';
            unplacedList.appendChild(empty);
            return;
          }

          let activeContinent = '';
          visibleFlags.forEach((flag) => {
            if (flag.continent !== activeContinent) {
              activeContinent = flag.continent;
              const continentHeader = document.createElement('div');
              continentHeader.className = 'map-unplaced-continent-header';
              continentHeader.textContent = activeContinent;
              unplacedList.appendChild(continentHeader);
            }

            const item = document.createElement('button');
            item.className = 'map-unplaced-item';
            item.type = 'button';
            if (!markerByCode.has(flag.code)) {
              item.classList.add('is-unlocated');
              item.title = 'This flag does not have a map location yet.';
            }

            const thumb = document.createElement('img');
            thumb.src = `https://flagcdn.com/w80/${flag.code}.png`;
            thumb.alt = '';
            thumb.loading = 'lazy';

            const copy = document.createElement('span');
            copy.className = 'map-unplaced-item-copy';

            const name = document.createElement('strong');
            name.textContent = flag.name;

            const meta = document.createElement('span');
            meta.textContent = markerByCode.has(flag.code) ? `${flag.continent} • Click to locate` : `${flag.continent} • Location needed`;

            copy.append(name, meta);
            item.append(thumb, copy);

            item.addEventListener('mouseenter', () => selectUnplacedFlag(flag));
            item.addEventListener('focus', () => selectUnplacedFlag(flag));
            item.addEventListener('click', () => selectUnplacedFlag(flag, true));

            unplacedList.appendChild(item);
          });
        };

        if (flagSearch) {
          flagSearch.value = '';
          flagSearch.addEventListener('input', () => renderNavigatorList(flagSearch.value));
        }

        renderNavigatorList();
        if (navigatorFlags.length > 0) selectUnplacedFlag(navigatorFlags[0]);

        unplacedToggle.addEventListener('click', (event) => {
          event.stopPropagation();
          const isOpen = unplacedPanel.classList.toggle('active');
          unplacedPanel.setAttribute('aria-hidden', String(!isOpen));
          unplacedToggle.setAttribute('aria-expanded', String(isOpen));
          if (isOpen) {
            flagSearch?.focus();
            navigatorFlags.forEach((flag) => this.preloadFlagImage(flag.code, 320));
          }
        });

        unplacedPanel.addEventListener('click', (event) => event.stopPropagation());
        unplacedPanel.addEventListener('wheel', (event) => event.stopPropagation(), { passive: true });

        document.addEventListener('click', closeUnplacedPanel);
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') closeUnplacedPanel();
        });
      }

      const hidePopover = () => {
        if (!popover) return;
        popover.classList.remove('active');
        popover.setAttribute('aria-hidden', 'true');
      };

      let activePopoverFlagCode = '';
      const blankPopoverFlagSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"%3E%3Crect width="3" height="2" fill="%23111827"/%3E%3C/svg%3E';
      const showPopover = (flag, clientX, clientY) => {
        if (!mapContainer || !popover || !popoverFlag || !popoverTitle || !popoverMeta || !popoverFact || !popoverLearningDetails || !popoverLocator) return;

        if (activePopoverFlagCode !== flag.code) {
          activePopoverFlagCode = flag.code;
          popover.classList.add('is-loading');
          popoverFlag.alt = `${flag.name} flag`;
          popoverFlag.src = blankPopoverFlagSrc;
          popoverTitle.textContent = '';
          popoverMeta.textContent = '';
          popoverFact.textContent = '';
          popoverLearningDetails.textContent = '';
          popoverLocator.textContent = '';

          this.getCachedFlagImageSrc(flag.code, 320).then((flagSrc) => {
            if (activePopoverFlagCode !== flag.code) return;
            popoverFlag.src = flagSrc;
            popoverTitle.textContent = flag.name;
            popoverMeta.textContent = '';
            [flag.continent, `Capital: ${flag.capital}`, `Level ${flag.difficulty}`].forEach((label) => {
              const pill = document.createElement('span');
              pill.textContent = label;
              popoverMeta.appendChild(pill);
            });
            popoverFact.textContent = flag.fact;
            this.renderFlagLearningDetails(popoverLearningDetails, flag);
            this.renderCountryLocatorMap(popoverLocator, flag, { compact: true, popover: true });
            popover.classList.remove('is-loading');
          });
        }

        popover.classList.add('active');
        popover.setAttribute('aria-hidden', 'false');

        const containerRect = mapContainer.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const gap = 14;
        let left = clientX - containerRect.left + gap;
        let top = clientY - containerRect.top + gap;

        if (left + popoverRect.width > containerRect.width - 10) {
          left = clientX - containerRect.left - popoverRect.width - gap;
        }
        if (top + popoverRect.height > containerRect.height - 10) {
          top = clientY - containerRect.top - popoverRect.height - gap;
        }

        popover.style.left = `${Math.max(10, left)}px`;
        popover.style.top = `${Math.max(10, top)}px`;
      };

      const showPopoverForMarker = (event, d) => {
        highlightCountryByFlagCode(d.flag.code);
        showPopover(d.flag, event.clientX, event.clientY);
      };

      const markerGroups = d3svg
        .append('g')
        .attr('class', 'flag-markers')
        .selectAll('g')
        .data(markers)
        .join('g')
        .attr('class', 'flag-marker')
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', (d) => `${d.flag.name} flag`)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .on('click', (event, d) => {
          if (d3svg.node().classList.contains('is-dragging')) return;
          this.openFlagModal(d.flag);
        })
        .on('mouseenter', showPopoverForMarker)
        .on('mousemove', showPopoverForMarker)
        .on('mouseleave', () => {
          hidePopover();
          clearCountryHighlight();
        })
        .on('focus', (event, d) => {
          const rect = event.currentTarget.getBoundingClientRect();
          highlightCountryByFlagCode(d.flag.code);
          showPopover(d.flag, rect.left + rect.width / 2, rect.top + rect.height / 2);
        })
        .on('blur', () => {
          hidePopover();
          clearCountryHighlight();
        })
        .on('keydown', (event, d) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.openFlagModal(d.flag);
          }
        });

      markerGroups
        .append('rect')
        .attr('class', 'flag-marker-hit')
        .attr('x', (d) => -Math.max(d.width + 26, 72) / 2)
        .attr('y', (d) => -Math.max(d.height + 24, 54) / 2)
        .attr('width', (d) => Math.max(d.width + 26, 72))
        .attr('height', (d) => Math.max(d.height + 24, 54))
        .attr('rx', 5);

      markerGroups
        .append('rect')
        .attr('class', 'flag-marker-shadow')
        .attr('x', (d) => -d.width / 2 - 2)
        .attr('y', (d) => -d.height / 2 - 2)
        .attr('width', (d) => d.width + 4)
        .attr('height', (d) => d.height + 4)
        .attr('rx', 3);

      markerGroups
        .append('image')
        .attr('href', (d) => `https://flagcdn.com/w40/${d.flag.code}.png`)
        .attr('x', (d) => -d.width / 2)
        .attr('y', (d) => -d.height / 2)
        .attr('width', (d) => d.width)
        .attr('height', (d) => d.height)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const zoomValue = document.getElementById('map-zoom-value');
      const renderZoomedMarkers = (transform) => {
        const svgScale = svg.clientWidth ? width / svg.clientWidth : 1;
        const zoomBoost = Math.min(1.2, 0.9 + Math.log2(transform.k) * 0.1);
        const markerScale = svgScale * zoomBoost;
        markerGroups.attr('transform', (d) => {
          const [x, y] = transform.apply([d.x, d.y]);
          return `translate(${x}, ${y}) scale(${markerScale})`;
        });
        if (zoomValue) zoomValue.textContent = `${Math.round(transform.k * 100)}%`;
      };

      const zoom = window.d3
        .zoom()
        .filter((event) => {
          if (event.type === 'wheel') return true;
          if (event.type === 'mousedown') return event.button === 0 || event.button === 1;
          if (event.type === 'dblclick') return false;
          return !event.ctrlKey && !event.button;
        })
        .scaleExtent([1, 100])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .extent([
          [0, 0],
          [width, height],
        ])
        .on('start', () => {
          d3svg.classed('is-panning', true);
          d3svg.node().classList.remove('is-dragging');
        })
        .on('zoom', (event) => {
          countryLayer.attr('transform', event.transform);
          renderZoomedMarkers(event.transform);
          hidePopover();
          clearCountryHighlight({ preserveFinderHighlight: true });
          if (event.sourceEvent && event.sourceEvent.type === 'mousemove') {
            d3svg.node().classList.add('is-dragging');
          }
        })
        .on('end', () => {
          d3svg.classed('is-panning', false);
          window.setTimeout(() => d3svg.node().classList.remove('is-dragging'), 0);
        });

      d3svg.call(zoom);
      d3svg.on('dblclick.zoom', null);
      d3svg.on('mousemove.map-popover-bg', (event) => {
        if (!event.target.closest || !event.target.closest('.flag-marker')) hidePopover();
      });
      d3svg.on('mouseleave.map-popover', () => {
        hidePopover();
        clearCountryHighlight();
      });
      d3svg.on('auxclick.prevent-middle-pan', (event) => {
        if (event.button === 1) event.preventDefault();
      });
      d3svg.on('mousedown.prevent-middle-pan', (event) => {
        if (event.button === 1) event.preventDefault();
      });
      if (mapContainer)
        mapContainer.addEventListener('mouseleave', () => {
          hidePopover();
          clearCountryHighlight();
        });
      const getDefaultMapTransform = () => {
        const isMobileMap = window.matchMedia('(max-width: 768px)').matches;
        const defaultScale = isMobileMap ? 4.2 : 3;
        const focusLngLat = isMobileMap ? [-87, 16] : [12, 24];
        const [focusX, focusY] = projection(focusLngLat);
        return window.d3.zoomIdentity.translate(width / 2 - focusX * defaultScale, height / 2 - focusY * defaultScale).scale(defaultScale);
      };
      const defaultMapTransform = getDefaultMapTransform();
      focusMainMapOnFlag = (flag) => {
        const marker = markerByCode.get(flag.code);
        if (!marker) {
          this.spawnToast('Location Needed', `${flag.name} does not have a map location yet.`, '!');
          return;
        }

        hidePopover();
        clearCountryHighlight();
        highlightCountryFromFinder(flag.code);
        const currentTransform = window.d3.zoomTransform(svg);
        const isMobileMap = window.matchMedia('(max-width: 768px)').matches;
        const focusScale = Math.max(currentTransform.k, isMobileMap ? 12 : 9);
        const targetTransform = window.d3.zoomIdentity.translate(width / 2 - marker.x * focusScale, height / 2 - marker.y * focusScale).scale(focusScale);
        d3svg.transition().duration(650).ease(window.d3.easeCubicOut).call(zoom.transform, targetTransform);
      };

      const zoomInBtn = document.getElementById('map-zoom-in');
      const zoomOutBtn = document.getElementById('map-zoom-out');
      const resetBtn = document.getElementById('map-zoom-reset');
      if (zoomInBtn) zoomInBtn.addEventListener('click', () => d3svg.transition().duration(180).call(zoom.scaleBy, 1.6));
      if (zoomOutBtn)
        zoomOutBtn.addEventListener('click', () =>
          d3svg
            .transition()
            .duration(180)
            .call(zoom.scaleBy, 1 / 1.6),
        );
      if (resetBtn) resetBtn.addEventListener('click', () => d3svg.transition().duration(220).call(zoom.transform, defaultMapTransform));

      d3svg.call(zoom.transform, defaultMapTransform);

      this.mapRendered = true;
      if (loading) loading.remove();
      if (countEl) countEl.textContent = 'Flag Finder';
    } catch (error) {
      console.error('Failed to render world map:', error);
      if (loading) loading.textContent = 'Unable to load the map data right now. Check your connection and refresh.';
      if (countEl) countEl.textContent = 'Map unavailable';
    }
  }

  // --- PROGRESS & ACHIEVEMENTS SYSTEM ---
  renderAchievementsList() {
    const list = document.getElementById('achievements-list');
    if (!list) return;
    list.innerHTML = '';

    const achievements = this.getAchievementsDefinition();
    this.updateAchievementSummary(achievements);

    let activeGroup = '';
    achievements.forEach((ach) => {
      const group = this.getAchievementGroup(ach.id);
      if (group !== activeGroup) {
        activeGroup = group;
        const groupAchievements = achievements.filter((item) => this.getAchievementGroup(item.id) === group);
        const groupUnlocked = groupAchievements.filter((item) => this.state.unlockedAchievements.includes(item.id)).length;
        const header = document.createElement('div');
        header.className = 'achievement-group-header';
        header.innerHTML = `
          <span>${group}</span>
          <strong>${groupUnlocked} / ${groupAchievements.length}</strong>
        `;
        list.appendChild(header);
      }

      const isUnlocked = this.state.unlockedAchievements.includes(ach.id);

      const card = document.createElement('div');
      card.className = `achievement-card glass-panel ${isUnlocked ? '' : 'locked'}`;
      card.innerHTML = `
        <div class="achievement-icon-box">
          ${isUnlocked ? ach.icon : '🔒'}
        </div>
        <div class="achievement-details">
          <span class="achievement-title">${ach.title}</span>
          <span class="achievement-desc">${ach.desc}</span>
        </div>
        <span class="achievement-status">${isUnlocked ? 'Unlocked' : 'Locked'}</span>
      `;
      list.appendChild(card);
    });
  }

  getAchievementGroup(id) {
    if (id.startsWith('match_')) return 'Flag Match';
    if (id.startsWith('quiz_') || id === 'perfect_quiz') return 'Quiz Milestones';
    if (id.includes('sweep') || id.includes('complete') || id.includes('starter')) return 'Regional Mastery';
    if (id.startsWith('streak_')) return 'Daily Streaks';
    if (id === 'explorer' || id.startsWith('atlas_') || id.startsWith('review_') || id === 'clean_slate') return 'Exploration & Review';
    return 'Learning Milestones';
  }

  updateAchievementSummary(achievements = this.getAchievementsDefinition()) {
    const unlockedCount = this.getActiveUnlockedAchievementIds(achievements).length;
    const totalCount = achievements.length;
    const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    const countEl = document.getElementById('progress-achievements-count');
    if (countEl) countEl.textContent = `${unlockedCount} / ${totalCount}`;

    const percentEl = document.getElementById('progress-achievements-percent');
    if (percentEl) percentEl.textContent = `${percent}% complete`;

    const barEl = document.getElementById('progress-achievements-bar');
    if (barEl) barEl.style.width = `${percent}%`;
  }

  getActiveUnlockedAchievementIds(achievements = this.getAchievementsDefinition()) {
    const activeIds = new Set(achievements.map((achievement) => achievement.id));
    return this.state.unlockedAchievements.filter((id) => activeIds.has(id));
  }

  pruneRetiredAchievements() {
    const activeUnlocked = this.getActiveUnlockedAchievementIds();
    if (activeUnlocked.length !== this.state.unlockedAchievements.length) {
      this.state.unlockedAchievements = activeUnlocked;
      this.saveState();
    }
  }

  getAchievementsDefinition() {
    const learnedSet = new Set(this.state.learnedFlags);
    const totalFlags = this.flags.length;
    const masteredCount = this.state.learnedFlags.length;
    const reviewedCount = this.state.needReviewFlags.length;
    const masteredAtLeast = (count) => masteredCount >= count;
    const masteredAll = (flags) => flags.length > 0 && flags.every((flag) => learnedSet.has(flag.code));
    const masteredDifficulty = (difficulty) => masteredAll(this.flags.filter((flag) => flag.difficulty === difficulty));
    const masteredContinent = (continent) => masteredAll(this.flags.filter((flag) => flag.continent === continent));
    const masteredContinentCount = (continent, count) => this.flags.filter((flag) => flag.continent === continent && learnedSet.has(flag.code)).length >= count;

    return [
      {
        id: 'first_steps',
        title: 'First Steps',
        desc: 'Master at least 5 country flags.',
        icon: '🥉',
        check: () => this.state.learnedFlags.length >= 5,
      },
      {
        id: 'getting_warm',
        title: 'Getting Warm',
        desc: 'Master at least 10 country flags.',
        icon: '🌱',
        check: () => masteredAtLeast(10),
      },
      {
        id: 'globetrotter',
        title: 'Globetrotter',
        desc: 'Master at least 25 country flags.',
        icon: '🥈',
        check: () => masteredAtLeast(25),
      },
      {
        id: 'fifty_flags',
        title: 'Fifty Flags',
        desc: 'Master at least 50 country flags.',
        icon: '🏁',
        check: () => masteredAtLeast(50),
      },
      {
        id: 'century_club',
        title: 'Century Club',
        desc: 'Master at least 100 country flags.',
        icon: '💯',
        check: () => masteredAtLeast(100),
      },
      {
        id: 'nearly_worldly',
        title: 'Nearly Worldly',
        desc: 'Master at least 150 country flags.',
        icon: '🌍',
        check: () => masteredAtLeast(150),
      },
      {
        id: 'vexillology_master',
        title: 'Vexillology Master',
        desc: `Master all ${totalFlags} country flags.`,
        icon: '👑',
        check: () => totalFlags > 0 && masteredCount >= totalFlags,
      },
      {
        id: 'beginner_sweep',
        title: 'Beginner Sweep',
        desc: 'Master every Level 1 flag.',
        icon: '⭐',
        check: () => masteredDifficulty(1),
      },
      {
        id: 'intermediate_sweep',
        title: 'Pattern Reader',
        desc: 'Master every Level 2 flag.',
        icon: '🌟',
        check: () => masteredDifficulty(2),
      },
      {
        id: 'expert_sweep',
        title: 'Expert Vexillologist',
        desc: 'Master every Level 3 flag.',
        icon: '🏆',
        check: () => masteredDifficulty(3),
      },
      {
        id: 'europe_starter',
        title: 'Europe Starter',
        desc: 'Master at least 10 European flags.',
        icon: '🇪🇺',
        check: () => masteredContinentCount('Europe', 10),
      },
      {
        id: 'asia_starter',
        title: 'Asia Starter',
        desc: 'Master at least 10 Asian flags.',
        icon: '🌏',
        check: () => masteredContinentCount('Asia', 10),
      },
      {
        id: 'americas_starter',
        title: 'Americas Starter',
        desc: 'Master at least 10 flags from the Americas.',
        icon: '🌎',
        check: () => masteredContinentCount('Americas', 10),
      },
      {
        id: 'africa_starter',
        title: 'Africa Starter',
        desc: 'Master at least 10 African flags.',
        icon: '🌍',
        check: () => masteredContinentCount('Africa', 10),
      },
      {
        id: 'oceania_starter',
        title: 'Oceania Starter',
        desc: 'Master at least 5 Oceanian flags.',
        icon: '🌊',
        check: () => masteredContinentCount('Oceania', 5),
      },
      {
        id: 'europe_complete',
        title: 'Europe Complete',
        desc: 'Master every European flag.',
        icon: '🏰',
        check: () => masteredContinent('Europe'),
      },
      {
        id: 'asia_complete',
        title: 'Asia Complete',
        desc: 'Master every Asian flag.',
        icon: '🧭',
        check: () => masteredContinent('Asia'),
      },
      {
        id: 'americas_complete',
        title: 'Americas Complete',
        desc: 'Master every flag from the Americas.',
        icon: '🗽',
        check: () => masteredContinent('Americas'),
      },
      {
        id: 'africa_complete',
        title: 'Africa Complete',
        desc: 'Master every African flag.',
        icon: '☀️',
        check: () => masteredContinent('Africa'),
      },
      {
        id: 'oceania_complete',
        title: 'Oceania Complete',
        desc: 'Master every Oceanian flag.',
        icon: '🏝️',
        check: () => masteredContinent('Oceania'),
      },
      {
        id: 'quiz_50',
        title: 'Quiz Competitor',
        desc: 'Score at least 50% on any practice quiz.',
        icon: '🧠',
        check: () => this.state.quizHighscore >= 50,
      },
      {
        id: 'quiz_80',
        title: 'Quiz Ace',
        desc: 'Score at least 80% on any practice quiz.',
        icon: '🎓',
        check: () => this.state.quizHighscore >= 80,
      },
      {
        id: 'perfect_quiz',
        title: 'Vexilla God',
        desc: 'Score 100% on any practice quiz.',
        icon: '🎯',
        check: () => this.state.quizHighscore === 100,
      },
      {
        id: 'quiz_hot_streak',
        title: 'Hot Streak',
        desc: 'Answer 5 quiz questions in a row correctly.',
        icon: '🔥',
        check: () => this.quizMaxStreak >= 5,
      },
      {
        id: 'quiz_flawless_run',
        title: 'Flawless Run',
        desc: 'Answer 10 quiz questions in a row correctly.',
        icon: '💎',
        check: () => this.quizMaxStreak >= 10,
      },
      {
        id: 'match_clean_sweep',
        title: 'Clean Sweep',
        desc: 'Finish Flag Match with every pair counted as a clean match.',
        icon: '🎯',
        check: () => this.matchTotalPairs > 0 && this.pairsLeft === 0 && this.matchCleanMatches === this.matchTotalPairs,
      },
      {
        id: 'match_no_guessing',
        title: 'No Guessing',
        desc: 'Finish Flag Match without any mismatched attempts.',
        icon: '✅',
        check: () => this.matchTotalPairs > 0 && this.pairsLeft === 0 && this.matchMistakes === 0,
      },
      {
        id: 'match_learning_moment',
        title: 'Learning Moment',
        desc: 'Use flag details during Flag Match and still finish the game.',
        icon: '📖',
        check: () => this.matchTotalPairs > 0 && this.pairsLeft === 0 && this.matchHelpViews > 0,
      },
      {
        id: 'match_marathon',
        title: 'Match Finisher',
        desc: 'Complete any Flag Match game.',
        icon: '🧩',
        check: () => this.matchTotalPairs > 0 && this.pairsLeft === 0,
      },
      {
        id: 'streak_3',
        title: 'Dedicated Learner',
        desc: 'Keep a daily learning streak of 3 days or more.',
        icon: '🔥',
        check: () => this.state.streak >= 3,
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        desc: 'Keep a daily learning streak of 7 days or more.',
        icon: '📅',
        check: () => this.state.streak >= 7,
      },
      {
        id: 'streak_14',
        title: 'Two-Week Traveler',
        desc: 'Keep a daily learning streak of 14 days or more.',
        icon: '🧳',
        check: () => this.state.streak >= 14,
      },
      {
        id: 'streak_30',
        title: 'Monthly Master',
        desc: 'Keep a daily learning streak of 30 days or more.',
        icon: '🏅',
        check: () => this.state.streak >= 30,
      },
      {
        id: 'explorer',
        title: 'Atlas Explorer',
        desc: 'Inspect 10 different flags inside the Encyclopedia.',
        icon: '🗺️',
        check: () => this.viewedCountries.size >= 10,
      },
      {
        id: 'atlas_scholar',
        title: 'Atlas Scholar',
        desc: 'Inspect 25 different flags in the Encyclopedia or World Map.',
        icon: '📚',
        check: () => this.viewedCountries.size >= 25,
      },
      {
        id: 'atlas_cartographer',
        title: 'Cartographer',
        desc: 'Inspect 50 different flags in the Encyclopedia or World Map.',
        icon: '🧭',
        check: () => this.viewedCountries.size >= 50,
      },
      {
        id: 'review_master',
        title: 'Detail Oriented',
        desc: 'Flag at least 5 flags for review.',
        icon: '🔍',
        check: () => reviewedCount >= 5,
      },
      {
        id: 'review_stack',
        title: 'Review Stack',
        desc: 'Flag at least 15 flags for review.',
        icon: '📝',
        check: () => reviewedCount >= 15,
      },
      {
        id: 'clean_slate',
        title: 'Clean Slate',
        desc: 'Have at least 25 mastered flags and nothing marked for review.',
        icon: '✅',
        check: () => masteredCount >= 25 && reviewedCount === 0,
      },
    ];
  }

  checkAchievements() {
    const definitions = this.getAchievementsDefinition();

    definitions.forEach((def) => {
      // Skip if already unlocked
      if (this.state.unlockedAchievements.includes(def.id)) return;

      // Perform condition check
      if (def.check()) {
        this.state.unlockedAchievements.push(def.id);
        this.saveState();

        // Triggers popups
        this.spawnToast(`Achievement Unlocked!`, `${def.title}: ${def.desc}`, def.icon, 12000);
        this.playSuccessChime();
        this.renderAchievementsList();
      }
    });
  }

  // --- TOAST SYSTEMS ---
  spawnToast(title, desc, icon = '🎉', durationMs = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast glass-panel';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        <span class="toast-desc">${desc}</span>
      </div>
      <button class="toast-dismiss" type="button" aria-label="Dismiss notification">
        <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    container.appendChild(toast);

    const dismissToast = () => {
      if (!toast.isConnected || toast.classList.contains('fade-out')) return;
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    };

    const dismissBtn = toast.querySelector('.toast-dismiss');
    if (dismissBtn) dismissBtn.addEventListener('click', dismissToast);

    // Automatically trigger slide-out and remove after the requested reading time.
    setTimeout(dismissToast, durationMs);
  }

  // --- AUXILIARY HELPERS ---
  shuffle(array) {
    // Fisher-Yates Shuffling
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// Global App instantiation
window.app = new VexillaApp();

// Wait for DOM to wire events
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();

  // Wire theme toggle click
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      window.app.toggleTheme();
    });
  }

  // Wire sound toggle click
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      window.app.toggleSound();
    });
  }

  // Wire logo link to dashboard click
  const logo = document.getElementById('logo-link');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.app.switchView('dashboard');
    });
  }
});
