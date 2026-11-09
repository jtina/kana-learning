# Kana Pocket かなポケット

An offline-friendly web app for learning hiragana and katakana on an iPad.

- **Chart**: hiragana and katakana (basic, dakuten, combos). Tap a character to hear it and see its stroke count and your accuracy, or quiz yourself on that row.
- **Quiz**: multiple choice (either direction), type the romaji, or write the kana with your finger or Apple Pencil and mark yourself. Characters you miss come up more often.
  **Staff asks → You respond** plays something a shop, restaurant or hotel worker would say and has you pick a natural reply.
- **Phrases**: travel phrases in 8 categories with furigana, romaji (can be hidden), English, audio and favourites.
- **Words**: ~100 everyday words (food, places, transit, money, time, question words, adjectives, signs) with furigana, audio and favourites.
- **Progress**: accuracy heatmap and a quiz of your weakest characters.

Progress, starred phrases and settings are saved in the browser (`localStorage`) on the device.

## Run it

It's a static site with no build step. Serve the folder with any static server:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Put it on your iPad or phone (offline)

1. Host it on GitHub Pages: repo **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `/ (root)` → Save**. It will be at https://jtina.github.io/kana-learning/.
2. Open the Pages URL in Safari on the iPad, then **Share → Add to Home Screen**.
3. Open it once while online. A service worker (`sw.js`) saves the app and the fonts on the device, so after that it works fully offline, and on weak signal it opens instantly from the saved copy.

Updates: when you're online the app checks for a newer version in the background; it shows up the next time you open the app.

Audio uses the iPad's built-in Japanese text-to-speech voice (Settings → Accessibility → Spoken Content → Voices → Japanese).

## Files

- `index.html`: page shell, PWA metadata, mobile layout tweaks
- `app.js`: the app (Preact + htm, vendored in `vendor/`, no build step)
- `kana-data.js`, `phrases-data.js`, `vocab-data.js`: character, phrase and vocabulary data
- `sw.js`, `manifest.webmanifest`, `icons/`: offline support and home-screen icon

When you change files, bump `VERSION` in `sw.js` so devices pick up the new version.
