# Vexilla

[![Live app](https://img.shields.io/badge/Play%20online-GitHub%20Pages-00c7d9?style=for-the-badge)](https://flyer1.github.io/vexilla/)
![Vanilla JavaScript](https://img.shields.io/badge/Vanilla-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=111)
![No build step](https://img.shields.io/badge/No%20build%20step-just%20open%20and%20learn-10b981?style=for-the-badge)
![Mobile friendly](https://img.shields.io/badge/Mobile-friendly-3772ff?style=for-the-badge)
[![Last commit](https://img.shields.io/github/last-commit/flyer1/vexilla?style=for-the-badge)](https://github.com/flyer1/vexilla)

Learn the flags of the world without turning it into homework.

**Start here:** [https://flyer1.github.io/vexilla/](https://flyer1.github.io/vexilla/)

Vexilla is a browser-based flag learning app with flashcards, quizzes, matching games, a searchable flag atlas, achievements, progress tracking, and an interactive world map. It is designed for people who want to actually recognize flags in the wild, not just grind through a country list once and forget it.

## What You Can Do

- Study **197 country flags** with capitals, continents, difficulty levels, visual features, languages spoken, and memory-friendly facts.
- Build recognition with **progressive learning levels** from iconic flags to harder lookalikes and emblem-heavy designs.
- Use **flashcards** with deck modes for learning new flags, reviewing your queue, or practicing cards due today.
- Take **Flag Challenge** quizzes with continent filters, question-type controls, review-only practice, flag-family drills, and deliberately tricky lookalike rounds.
- Play **Flag Match** to pair flags with country names and track clean matches instead of racing a timer.
- Browse the **Flag Atlas & Encyclopedia** with search, continent grouping, live counts, and filters for colors and design features.
- Explore the **World Map** with flag markers, country highlighting, panning, zooming, hover details, map challenge mode, and a flag finder.
- Track momentum with the dashboard, daily streaks, XP, achievements, recent learning history, and a compact Learning Pulse chart.
- Use **dark/light themes**, optional sound, progress backup/restore, and responsive layouts for desktop and phones.

## Screens And Modes

### Dashboard

Your home base. See flags mastered, best quiz score, explorer level, streak, achievements, today's learning plan, continent progress, learning levels, and the Learning Pulse activity chart.

### Flashcards

Study by deck type:

- **Learn new** returns to the normal level-based study deck.
- **Review queue** focuses on flags you marked as needing review.
- **Due today** uses the spaced-review schedule.

You can narrow the study pool by continent, flip cards for details, see capital/languages/facts/location, and mark each flag as learned or needing review.

<img src="images/flashcards.PNG" alt="Vexilla flashcards screen" width="650">

### Flag Challenge

Multiple-choice quiz mode with:

- Question types: flag to country, country to flag, flag to capital, and capital to flag.
- Practice focus: all flags, review only, flag families, and compare lookalikes.
- Continent pools with Ctrl/Cmd multi-select.
- Feedback cards that help you learn from mistakes.

<img src="images/quiz-mode.PNG" alt="Vexilla quiz mode screen" width="650">

### Flag Match

Match flags to country names and see how many pairs you know cleanly. You can open details for a flag when you need to learn it, but that pair no longer counts as a clean match.

<img src="images/match-game.PNG" alt="Vexilla flag match game screen" width="650">

### Flag Atlas & Encyclopedia

Search every flag by country, capital, color, feature, continent, and learning details. Results are grouped by continent with counts, and filters support the same Ctrl/Cmd multi-select behavior where it helps.

<img src="images/encyclopedia.PNG" alt="Vexilla flag encyclopedia screen" width="650">

### World Map

Explore flags geographically on a Mercator world map. The map supports:

- Wheel zoom and click-drag panning.
- Flag hover popovers with larger flag previews and learning details.
- Country border highlighting.
- A searchable flag finder that can pan the main map to a selected country.
- Small locator maps for country detail views.
- Map challenge practice.

<img src="images/world-map.PNG" alt="Vexilla world map screen" width="650">

### Progress & Achievements

Review your accomplishments, progress stats, continent breakdowns, recent sessions, quiz/match milestones, and achievement totals.

### Settings

Control sound/theme preferences, download or copy a progress backup, restore from a backup file, and reset progress if you want a fresh start.

## Play Online

The easiest way to use Vexilla is the hosted version:

[https://flyer1.github.io/vexilla/](https://flyer1.github.io/vexilla/)

No install, no account, no command line. Open it in a browser and start learning.

Your progress is stored in that browser on that device. If you switch devices or clear browser data, use **Settings -> Download Backup** first so you can restore later.

## Run It Locally

You can also run Vexilla from your own computer. This is useful if you want an offline-ish local copy, want to modify the code, or prefer using `localhost`.

### Download Vexilla

1. Go to the [Vexilla GitHub repository](https://github.com/flyer1/vexilla).
2. Click the green **Code** button.
3. Choose **Download ZIP**.
4. Open your Downloads folder.
5. Right-click the ZIP file and choose **Extract All**.
6. Open the extracted `vexilla` folder.

### Install Node.js

Vexilla does not need a complicated build system, but the local version uses a tiny server powered by Node.js.

1. Go to [https://nodejs.org](https://nodejs.org).
2. Download the version marked **LTS**.
3. Run the installer.
4. Keep the default options.
5. Finish the install.

### Start Vexilla On Windows

1. Open the extracted `vexilla` folder.
2. Double-click `run-game.bat`.
3. When the black command window opens, leave it running.
4. Open your browser and go to:

[http://localhost:8000/](http://localhost:8000/)

To stop the local app, return to the command window and press `Ctrl+C`, or close the window.

### Command-Line Option

If you are already comfortable with terminals:

```bash
node server.js
```

Then open [http://localhost:8000/](http://localhost:8000/).

No `npm install`, no bundler, and no build step are required.

## Progress And Backups

Vexilla stores learning progress in browser `localStorage` under `vexilla_state`.

That keeps the app simple and private, but local browser storage can be lost if you clear site data, switch browser profiles, change devices, or reset your browser. Use the backup tools in **Settings**:

- **Download Backup** saves your progress as a JSON file.
- **Copy Backup** copies the same progress data to your clipboard.
- **Restore Backup** imports a saved progress JSON file.

Progress backup files are ignored by git with:

```text
vexilla-progress-backup-*.json
```

## Project Structure

```text
.
├── index.html      # App markup and views
├── styles.css      # Theme, layout, responsive styling, and map UI
├── app.js          # App controller, state, games, filters, map behavior
├── data.js         # Flag dataset and educational facts
├── server.js       # Tiny local static server
├── run-game.bat    # Windows helper for non-technical local startup
├── favicon.ico     # Browser/app icon
├── images/         # README screenshots
└── README.md
```

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- D3
- TopoJSON
- FlagCDN
- World Atlas TopoJSON
- Node.js standard library for optional local serving

## Data And Map Notes

Flag images are loaded from FlagCDN using each country's two-letter code. The world map uses D3, TopoJSON, and the `world-atlas` country boundary dataset from jsDelivr.

Some small countries, islands, and geographically complex places are hard to represent perfectly on a flat compact map. Vexilla aims for useful learning positions and supplements the main map with searchable navigation, hover details, locator maps, and the encyclopedia.

## Why "Vexilla"?

`Vexillum` is Latin for a flag or military standard. Vexilla is a small love letter to vexillology: the study of flags, their symbols, their patterns, and the histories packed into tiny rectangles.

## License

No license has been selected yet. If you plan to reuse or redistribute the project, add an explicit license first.
