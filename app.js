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
    this.activeLevel = 1;
    
    // Quiz state variables
    this.quizQuestions = [];
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.quizStreak = 0;
    this.quizMaxStreak = 0;
    
    // Match game state variables
    this.matchCards = [];
    this.firstSelectedCard = null;
    this.pairsLeft = 0;
    this.matchStartTime = 0;
    this.matchTimerInterval = null;
    
    // Active Atlas filters
    this.activeFilters = {
      continent: ['all'],
      color: ['all'],
      feature: ['all']
    };
    
    // Encyclopedia tracking
    this.viewedCountries = new Set();

    // World map state
    this.mapRendered = false;
    this.mapDataUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    
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
      theme: 'dark'
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
      theme: 'dark'
    };

    if (!rawState || typeof rawState !== 'object') {
      throw new Error('Backup file does not contain progress data.');
    }

    const validCodes = new Set(this.flags.map(flag => flag.code));
    const cleanCodeList = value => Array.isArray(value)
      ? [...new Set(value.filter(code => typeof code === 'string' && validCodes.has(code)))]
      : [];
    const cleanStringList = value => Array.isArray(value)
      ? [...new Set(value.filter(item => typeof item === 'string'))]
      : [];
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
      theme: rawState.theme === 'light' || rawState.theme === 'dark' ? rawState.theme : defaults.theme
    };
  }

  getProgressBackupPayload() {
    return {
      app: 'Vexilla',
      version: 1,
      exportedAt: new Date().toISOString(),
      state: this.getSanitizedState(this.state)
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
    this.playAudioTone(523.25, 'sine', 0.15, 0);     // C5
    this.playAudioTone(659.25, 'sine', 0.15, 0.08);  // E5
    this.playAudioTone(783.99, 'sine', 0.15, 0.16);  // G5
    this.playAudioTone(1046.50, 'sine', 0.3, 0.24);  // C6
  }

  playFailureBuzz() {
    this.playAudioTone(220, 'sawtooth', 0.2, 0);     // A3
    this.playAudioTone(196, 'sawtooth', 0.35, 0.1);   // G3
  }

  playCorrectChime() {
    this.playAudioTone(587.33, 'sine', 0.1, 0);      // D5
    this.playAudioTone(880, 'sine', 0.2, 0.06);      // A5
  }

  // --- SPA ROUTER ---
  switchView(viewId) {
    this.initAudio();
    this.playAudioTone(600, 'sine', 0.02); // Short click tap sound
    
    // Hide all views
    const views = document.querySelectorAll('.view-section');
    views.forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
      v.style.opacity = '0';
    });
    
    // Deactivate all sidebar items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(n => n.classList.remove('active'));
    
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
        if (this.currentDeck.length === 0) {
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
    if (achievementSpan) achievementSpan.textContent = `${this.state.unlockedAchievements.length} / 8`;
    
    // Level Progress Bars
    const levels = [1, 2, 3];
    levels.forEach(lvl => {
      const lvlFlags = this.flags.filter(f => f.difficulty === lvl);
      const lvlFlagsTotal = lvlFlags.length;
      const lvlFlagsLearned = lvlFlags.filter(f => this.state.learnedFlags.includes(f.code)).length;
      
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
    
    // Filter flags for level
    const lvlFlags = this.flags.filter(f => f.difficulty === lvl);
    
    // Give priority to flags NOT yet learned, or load all if everything is learned
    const unlearned = lvlFlags.filter(f => !this.state.learnedFlags.includes(f.code));
    this.currentDeck = unlearned.length > 0 ? unlearned : lvlFlags;
    
    if (this.currentDeck.length === 0) {
      this.spawnToast('Error', 'No flags found in this level.', '❌');
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
    
    this.switchView('flashcards');
  }

  loadNextFlashcard() {
    if (this.currentDeckIndex >= this.currentDeck.length) {
      // Finished the deck!
      this.playSuccessChime();
      this.spawnToast('Deck Complete!', `You have completed studying all cards in this round!`, '🏆');
      
      this.checkAchievements();
      setTimeout(() => this.switchView('dashboard'), 1500);
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
      const capitalizedColors = activeFlag.colors.map(c => c.charAt(0).toUpperCase() + c.slice(1));
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
      this.state.needReviewFlags = this.state.needReviewFlags.filter(code => code !== activeFlag.code);
      
      this.playCorrectChime();
    } else if (actionType === 'review') {
      // Add to review list if not already there
      if (!this.state.needReviewFlags.includes(activeFlag.code)) {
        this.state.needReviewFlags.push(activeFlag.code);
      }
      // Remove from learned list if present
      this.state.learnedFlags = this.state.learnedFlags.filter(code => code !== activeFlag.code);
      
      this.playAudioTone(294, 'triangle', 0.25); // Lower chime tone
    }
    
    this.saveState();
    this.currentDeckIndex++;
    
    // Short slide transition delay
    const cardContainer = document.getElementById('interactive-card');
    if (cardContainer) {
      cardContainer.style.transform = 'translateX(-20px) rotateY(0deg)';
      cardContainer.style.opacity = '0.7';
      
      setTimeout(() => {
        cardContainer.style.transform = 'none';
        cardContainer.style.opacity = '1';
        this.loadNextFlashcard();
      }, 250);
    } else {
      this.loadNextFlashcard();
    }
  }

  // --- QUIZ ENGINE ---
  startQuiz(customLevel = null, customContinent = null) {
    // If not supplied, quiz defaults to active level
    const quizLevel = customLevel || this.activeLevel;
    
    let filteredFlags = this.flags;
    if (quizLevel) {
      filteredFlags = filteredFlags.filter(f => f.difficulty === quizLevel);
    }
    if (customContinent) {
      filteredFlags = filteredFlags.filter(f => f.continent === customContinent);
    }
    
    if (filteredFlags.length < 4) {
      this.spawnToast('Quiz Setup Failed', 'Select a larger category. Need at least 4 flags.', '⚠️');
      return;
    }
    
    // Pick 10 random flags (or all if filtered count is less)
    this.shuffle(filteredFlags);
    this.quizQuestions = filteredFlags.slice(0, Math.min(10, filteredFlags.length));
    
    // Reset counters
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.quizStreak = 0;
    this.quizMaxStreak = 0;
    
    // UI Panels toggle
    document.getElementById('quiz-game-panel').style.display = 'flex';
    document.getElementById('quiz-summary-panel').style.display = 'none';
    
    this.loadQuizQuestion();
  }

  loadQuizQuestion() {
    const questionFlag = this.quizQuestions[this.currentQuizIndex];
    
    // Generate Options (1 correct, 3 incorrect)
    const options = [questionFlag.name];
    
    // Get list of all other country names
    const distractors = this.flags
      .filter(f => f.name !== questionFlag.name)
      .map(f => f.name);
      
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
    optionsButtons.forEach(btn => btn.disabled = true);
    
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
      optionsButtons.forEach(btn => {
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
    
    // Select 6 random flags
    const pool = [...this.flags];
    this.shuffle(pool);
    const selected = pool.slice(0, 6);
    this.pairsLeft = 6;
    
    // Create card structures
    this.matchCards = [];
    selected.forEach(flag => {
      // 1. Flag Image Card
      this.matchCards.push({
        id: flag.code,
        type: 'flag',
        content: `https://flagcdn.com/w320/${flag.code}.png`,
        name: flag.name
      });
      // 2. Country Name Card
      this.matchCards.push({
        id: flag.code,
        type: 'country',
        content: flag.name,
        name: flag.name
      });
    });
    
    // Shuffle cards
    this.shuffle(this.matchCards);
    
    // Clear and draw board
    const board = document.getElementById('match-board');
    board.innerHTML = '';
    
    document.getElementById('match-timer').textContent = '00.0s';
    document.getElementById('match-left').textContent = `6 / 6`;
    document.getElementById('match-summary-panel').style.display = 'none';
    board.style.display = 'grid';
    
    this.matchCards.forEach(cardData => {
      const card = document.createElement('div');
      card.className = `match-card glass-panel ${cardData.type}-card`;
      card.setAttribute('data-id', cardData.id);
      card.setAttribute('data-type', cardData.type);
      
      if (cardData.type === 'flag') {
        card.innerHTML = `<img src="${cardData.content}" alt="Flag matching" class="no-select">`;
      } else {
        card.textContent = cardData.content;
      }
      
      card.onclick = () => this.handleMatchCardSelect(card);
      board.appendChild(card);
    });
    
    // Start Timer
    if (this.matchTimerInterval) clearInterval(this.matchTimerInterval);
    this.matchStartTime = Date.now();
    this.matchTimerInterval = setInterval(() => {
      const elapsed = (Date.now() - this.matchStartTime) / 1000;
      document.getElementById('match-timer').textContent = `${elapsed.toFixed(1)}s`;
    }, 100);
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
      this.firstSelectedCard.classList.add('matched');
      cardEl.classList.add('matched');
      
      this.pairsLeft--;
      document.getElementById('match-left').textContent = `${this.pairsLeft} / 6`;
      
      this.playCorrectChime();
      this.firstSelectedCard = null;
      
      // Check win condition
      if (this.pairsLeft === 0) {
        clearInterval(this.matchTimerInterval);
        setTimeout(() => this.showMatchGameComplete(), 500);
      }
    } else {
      // MISMATCH
      cardEl.classList.add('selected');
      const prevCard = this.firstSelectedCard;
      this.firstSelectedCard = null;
      
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
    
    const elapsedSeconds = ((Date.now() - this.matchStartTime) / 1000).toFixed(1);
    document.getElementById('match-sum-time').textContent = `${elapsedSeconds}s`;
    
    const subtitle = document.getElementById('match-sum-subtitle');
    if (parseFloat(elapsedSeconds) < 15) {
      subtitle.textContent = `Speed demon! You matched all pairs in ${elapsedSeconds} seconds. Amazing!`;
    } else {
      subtitle.textContent = `Congratulations! You cleared all pairs in ${elapsedSeconds} seconds.`;
    }
    
    this.playSuccessChime();
    this.checkAchievements();
  }

  // --- ENCYCLOPEDIA VIEW (ATLAS) ---
  renderAtlas() {
    const grid = document.getElementById('encyclopedia-grid-container');
    if (!grid) return;
    grid.innerHTML = '';
    
    this.flags.forEach(flag => {
      const card = document.createElement('div');
      card.className = 'encyclopedia-card glass-panel';
      card.setAttribute('data-country', flag.name);
      card.setAttribute('data-code', flag.code);
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
  }

  filterAtlas() {
    const searchVal = document.getElementById('atlas-search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.encyclopedia-card');
    let resultsCount = 0;
    
    cards.forEach(card => {
      const countryName = card.getAttribute('data-country').toLowerCase();
      const code = card.getAttribute('data-code');
      const flagObj = this.flags.find(f => f.code === code);
      
      const capital = flagObj.capital.toLowerCase();
      const colors = flagObj.colors.join(' ');
      const features = flagObj.features.join(' ');
      
      // Match Text Queries
      const matchesSearch = 
        countryName.includes(searchVal) || 
        capital.includes(searchVal) || 
        colors.includes(searchVal) ||
        features.includes(searchVal);
        
      // Match Tag Filters (Multi-select)
      // Continent Match (OR logic: match any of the selected continents)
      const matchesContinent = this.activeFilters.continent.includes('all') || 
                               this.activeFilters.continent.includes(flagObj.continent);
                               
      // Color Match (AND logic: flag must contain ALL selected colors)
      const matchesColor = this.activeFilters.color.includes('all') || 
                           this.activeFilters.color.every(c => flagObj.colors.includes(c));
                           
      // Feature Match (AND logic: flag must contain ALL selected features)
      const matchesFeature = this.activeFilters.feature.includes('all') || 
                             this.activeFilters.feature.every(f => flagObj.features.includes(f));
      
      if (matchesSearch && matchesContinent && matchesColor && matchesFeature) {
        card.style.display = 'flex';
        resultsCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
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
    const filterValue = element.getAttribute('data-value');   // e.g. "Europe" or "all"
    const isMultiSelect = Boolean(event && (event.ctrlKey || event.metaKey));
    const tags = element.parentNode.querySelectorAll('.filter-tag');
    
    let currentSelection = this.activeFilters[filterType] || ['all'];
    
    if (filterValue === 'all') {
      // Clear all other values
      currentSelection = ['all'];
    } else {
      if (isMultiSelect) {
        currentSelection = currentSelection.filter(v => v !== 'all');

        if (currentSelection.includes(filterValue)) {
          currentSelection = currentSelection.filter(v => v !== filterValue);
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

    tags.forEach(tag => {
      const tagValue = tag.getAttribute('data-value');
      tag.classList.toggle('active', currentSelection.includes(tagValue));
    });
    
    this.activeFilters[filterType] = currentSelection;
    
    this.playAudioTone(800, 'sine', 0.02);
    this.filterAtlas();
  }

  openFlagModal(flag) {
    this.playAudioTone(440, 'sine', 0.05);
    
    document.getElementById('modal-flag-img').src = `https://flagcdn.com/w320/${flag.code}.png`;
    document.getElementById('modal-country-name').textContent = flag.name;
    document.getElementById('modal-capital').textContent = flag.capital;
    document.getElementById('modal-continent').textContent = flag.continent;
    
    const difficulties = ['Beginner', 'Intermediate', 'Expert'];
    document.getElementById('modal-difficulty').textContent = difficulties[flag.difficulty - 1];
    
    const capitalizedColors = flag.colors.map(c => c.charAt(0).toUpperCase() + c.slice(1));
    document.getElementById('modal-colors').textContent = capitalizedColors.join(', ');
    document.getElementById('modal-mnemonic').textContent = flag.fact;
    
    const modal = document.getElementById('flag-detail-modal');
    modal.classList.add('active');
    
    // Track encyclopedia clicks for achievements
    this.viewedCountries.add(flag.code);
    if (this.viewedCountries.size >= 10) {
      this.checkAchievements();
    }
  }

  closeModal() {
    this.playAudioTone(300, 'sine', 0.05);
    document.getElementById('flag-detail-modal').classList.remove('active');
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
      fj: [178, -17.8]
    };
  }

  getMapNameAliases() {
    return {
      'United States of America': 'United States',
      'Czech Republic': 'Czechia',
      'Bosnia and Herz.': 'Bosnia and Herzegovina',
      'Macedonia': 'North Macedonia',
      'Dem. Rep. Congo': 'Democratic Republic of the Congo',
      'Congo': 'Congo, Republic',
      'Republic of Congo': 'Congo, Republic',
      'Côte d’Ivoire': 'Ivory Coast',
      "Côte d'Ivoire": 'Ivory Coast',
      'Cote dIvoire': 'Ivory Coast',
      'Eq. Guinea': 'Equatorial Guinea',
      'eSwatini': 'Eswatini',
      'Swaziland': 'Eswatini',
      'S. Sudan': 'South Sudan',
      'Central African Rep.': 'Central African Republic',
      'Dominican Rep.': 'Dominican Republic',
      'Solomon Is.': 'Solomon Islands',
      'East Timor': 'Timor-Leste',
      'Burma': 'Myanmar',
      'Lao PDR': 'Laos',
      'Korea': 'South Korea',
      'Russian Federation': 'Russia',
      'Türkiye': 'Turkey',
      'United Republic of Tanzania': 'Tanzania',
      'W. Sahara': '',
      'Western Sahara': '',
      'Somaliland': ''
    };
  }

  getFlagByMapName(mapName, flagLookup, aliases) {
    const alias = aliases[mapName];
    if (alias === '') return null;
    const targetName = alias || mapName;
    return flagLookup.get(this.normalizeCountryName(targetName)) || null;
  }

  async renderWorldMap() {
    const svg = document.getElementById('world-map-svg');
    const loading = document.getElementById('map-loading');
    const countEl = document.getElementById('map-match-count');
    const mapContainer = document.getElementById('world-map-scroll');
    const popover = document.getElementById('map-flag-popover');
    const popoverFlag = document.getElementById('map-popover-flag');
    const popoverTitle = document.getElementById('map-popover-title');
    const popoverFact = document.getElementById('map-popover-fact');
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
      const projection = window.d3.geoMercator().fitExtent([[40, 35], [1560, 820]], {
        type: 'FeatureCollection',
        features: countries
      });
      const path = window.d3.geoPath(projection);
      const d3svg = window.d3.select(svg);
      const flagLookup = new Map(this.flags.map(flag => [this.normalizeCountryName(flag.name), flag]));
      const aliases = this.getMapNameAliases();
      const markerOverrides = this.getMapMarkerOverrides();
      const getFlagForCountry = country => {
        const mapName = country.properties?.name || '';
        return this.getFlagByMapName(mapName, flagLookup, aliases);
      };

      d3svg.selectAll('*').remove();

      d3svg.append('rect')
        .attr('class', 'map-ocean')
        .attr('width', width)
        .attr('height', height);

      const countryLayer = d3svg.append('g')
        .attr('class', 'country-boundaries');

      countryLayer
        .selectAll('path')
        .data(countries)
        .join('path')
        .attr('class', d => getFlagForCountry(d) ? 'map-country has-flag-data' : 'map-country')
        .attr('data-flag-code', d => getFlagForCountry(d)?.code || '')
        .attr('d', path)
        .on('mouseenter', (event, d) => highlightCountry(d))
        .on('mouseleave', () => clearCountryHighlight())
        .append('title')
        .text(d => d.properties?.name || 'Country');

      const clearCountryHighlight = () => {
        countryLayer.selectAll('.map-country').classed('is-hovered', false);
      };

      const highlightCountry = country => {
        clearCountryHighlight();
        countryLayer
          .selectAll('.map-country')
          .filter(d => d === country)
          .classed('is-hovered', true);
      };

      const highlightCountryByFlagCode = flagCode => {
        clearCountryHighlight();
        countryLayer
          .selectAll('.map-country')
          .filter(d => getFlagForCountry(d)?.code === flagCode)
          .classed('is-hovered', true);
      };

      const markers = countries
        .map(country => {
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

      const hidePopover = () => {
        if (!popover) return;
        popover.classList.remove('active');
        popover.setAttribute('aria-hidden', 'true');
      };

      const showPopover = (flag, clientX, clientY) => {
        if (!mapContainer || !popover || !popoverFlag || !popoverTitle || !popoverFact) return;
        popoverFlag.src = `https://flagcdn.com/w320/${flag.code}.png`;
        popoverFlag.alt = `${flag.name} flag`;
        popoverTitle.textContent = flag.name;
        popoverFact.textContent = flag.fact;
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

      const markerGroups = d3svg.append('g')
        .attr('class', 'flag-markers')
        .selectAll('g')
        .data(markers)
        .join('g')
        .attr('class', 'flag-marker')
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', d => `${d.flag.name} flag`)
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
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

      markerGroups.append('rect')
        .attr('class', 'flag-marker-hit')
        .attr('x', d => -Math.max(d.width + 26, 72) / 2)
        .attr('y', d => -Math.max(d.height + 24, 54) / 2)
        .attr('width', d => Math.max(d.width + 26, 72))
        .attr('height', d => Math.max(d.height + 24, 54))
        .attr('rx', 5);

      markerGroups.append('rect')
        .attr('class', 'flag-marker-shadow')
        .attr('x', d => -d.width / 2 - 2)
        .attr('y', d => -d.height / 2 - 2)
        .attr('width', d => d.width + 4)
        .attr('height', d => d.height + 4)
        .attr('rx', 3);

      markerGroups.append('image')
        .attr('href', d => `https://flagcdn.com/w40/${d.flag.code}.png`)
        .attr('x', d => -d.width / 2)
        .attr('y', d => -d.height / 2)
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const zoomValue = document.getElementById('map-zoom-value');
      const renderZoomedMarkers = transform => {
        const svgScale = svg.clientWidth ? width / svg.clientWidth : 1;
        const zoomBoost = Math.min(1.2, 0.9 + Math.log2(transform.k) * 0.1);
        const markerScale = svgScale * zoomBoost;
        markerGroups.attr('transform', d => {
          const [x, y] = transform.apply([d.x, d.y]);
          return `translate(${x}, ${y}) scale(${markerScale})`;
        });
        if (zoomValue) zoomValue.textContent = `${Math.round(transform.k * 100)}%`;
      };

      const zoom = window.d3.zoom()
        .filter(event => {
          if (event.type === 'wheel') return true;
          if (event.type === 'mousedown') return event.button === 0 || event.button === 1;
          if (event.type === 'dblclick') return false;
          return !event.ctrlKey && !event.button;
        })
        .scaleExtent([1, 30])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on('start', () => {
          d3svg.classed('is-panning', true);
          d3svg.node().classList.remove('is-dragging');
        })
        .on('zoom', event => {
          countryLayer.attr('transform', event.transform);
          renderZoomedMarkers(event.transform);
          hidePopover();
          clearCountryHighlight();
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
      d3svg.on('mousemove.map-popover-bg', event => {
        if (!event.target.closest || !event.target.closest('.flag-marker')) hidePopover();
      });
      d3svg.on('mouseleave.map-popover', () => {
        hidePopover();
        clearCountryHighlight();
      });
      d3svg.on('auxclick.prevent-middle-pan', event => {
        if (event.button === 1) event.preventDefault();
      });
      d3svg.on('mousedown.prevent-middle-pan', event => {
        if (event.button === 1) event.preventDefault();
      });
      if (mapContainer) mapContainer.addEventListener('mouseleave', () => {
        hidePopover();
        clearCountryHighlight();
      });
      renderZoomedMarkers(window.d3.zoomIdentity);

      const zoomInBtn = document.getElementById('map-zoom-in');
      const zoomOutBtn = document.getElementById('map-zoom-out');
      const resetBtn = document.getElementById('map-zoom-reset');
      if (zoomInBtn) zoomInBtn.addEventListener('click', () => d3svg.transition().duration(180).call(zoom.scaleBy, 1.6));
      if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => d3svg.transition().duration(180).call(zoom.scaleBy, 1 / 1.6));
      if (resetBtn) resetBtn.addEventListener('click', () => d3svg.transition().duration(220).call(zoom.transform, window.d3.zoomIdentity));

      this.mapRendered = true;
      if (loading) loading.remove();
      if (countEl) countEl.textContent = `${markers.length} flag markers placed`;
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
    
    achievements.forEach(ach => {
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

  getAchievementsDefinition() {
    return [
      {
        id: 'first_steps',
        title: 'First Steps',
        desc: 'Master at least 5 country flags.',
        icon: '🥉',
        check: () => this.state.learnedFlags.length >= 5
      },
      {
        id: 'globetrotter',
        title: 'Globetrotter',
        desc: 'Master at least 25 country flags.',
        icon: '🥈',
        check: () => this.state.learnedFlags.length >= 25
      },
      {
        id: 'vexillology_master',
        title: 'Vexillology Master',
        desc: 'Master all 102 country flags.',
        icon: '👑',
        check: () => this.state.learnedFlags.length >= 102
      },
      {
        id: 'perfect_quiz',
        title: 'Vexilla God',
        desc: 'Score 100% on any practice quiz.',
        icon: '🎯',
        check: () => this.state.quizHighscore === 100
      },
      {
        id: 'speed_demon',
        title: 'Speed Demon',
        desc: 'Complete the Speed Match game in under 15 seconds.',
        icon: '⚡',
        check: () => {
          const matchTimeText = document.getElementById('match-sum-time')?.textContent;
          if (matchTimeText) {
            const secs = parseFloat(matchTimeText.replace('s', ''));
            return this.pairsLeft === 0 && secs < 15;
          }
          return false;
        }
      },
      {
        id: 'streak_3',
        title: 'Dedicated Learner',
        desc: 'Keep a daily learning streak of 3 days or more.',
        icon: '🔥',
        check: () => this.state.streak >= 3
      },
      {
        id: 'explorer',
        title: 'Atlas Explorer',
        desc: 'Inspect 10 different flags inside the Encyclopedia.',
        icon: '🗺️',
        check: () => this.viewedCountries.size >= 10
      },
      {
        id: 'review_master',
        title: 'Detail Oriented',
        desc: 'Flag at least 5 flags for review.',
        icon: '🔍',
        check: () => this.state.needReviewFlags.length >= 5
      }
    ];
  }

  checkAchievements() {
    const definitions = this.getAchievementsDefinition();
    
    definitions.forEach(def => {
      // Skip if already unlocked
      if (this.state.unlockedAchievements.includes(def.id)) return;
      
      // Perform condition check
      if (def.check()) {
        this.state.unlockedAchievements.push(def.id);
        this.saveState();
        
        // Triggers popups
        this.spawnToast(`Achievement Unlocked!`, `${def.title}: ${def.desc}`, def.icon);
        this.playSuccessChime();
        this.renderAchievementsList();
      }
    });
  }

  // --- TOAST SYSTEMS ---
  spawnToast(title, desc, icon = '🎉') {
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
    `;
    
    container.appendChild(toast);
    
    // Automatically trigger slide-out and remove after 4 seconds
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
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
