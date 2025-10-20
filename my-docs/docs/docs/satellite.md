# satellite.js — Satellite Data Scraper and Analyzer

This file defines the logic for fetching, parsing, scoring, and saving satellite visibility data from **Heavens-Above.com** using web scraping. It uses helper functions from `utils.js` and libraries like `request`, `cheerio`, and `fs`.

---

## 🧩 Dependencies

```js
const request = require("request"); // For making HTTP requests
const cheerio = require("cheerio"); // For parsing HTML (like jQuery for the backend)
const fs = require("fs");           // For file operations
const utils = require("./utils");   // Custom utility functions (see util.md)
```

---

## 🗂️ Overview

The script automates the process of collecting satellite pass data. It:

1. Requests satellite pass tables from Heavens-Above.
2. Parses satellite visibility events (rise, set, shadow entry/exit, etc.).
3. Extracts related details like altitude, azimuth, distance, and brightness.
4. Downloads satellite finder images and stores the data locally.
5. Calculates a “score” for each satellite pass to rank them.

---

## 🔧 Constants

### `property`
An array of keys used to store satellite pass attributes.
```js
["url", "date", "brightness", "events", "passType", "image", "scoreData", "exist", "score", "id"];
```

### `events`
Represents different phases of a satellite’s visibility.
```js
["rise", "reachAltitude10deg", "highestPoint", "dropBelowAltitude10deg", "set", "exitShadow", "enterShadow"];
```

### `attribute`
Describes data points collected for each event.
```js
["time", "altitude", "azimuth", "distance", "brightness", "sunAltitude"];
```

---

## ⚖️ Comparison & Weight System

### `compare`
Contains comparison functions to sort satellite passes based on various factors:
- Brightness (smaller is better)
- Sun altitude (smaller is better)
- Satellite altitude (higher is better)
- Duration (longer is better)

### `weight`
Defines importance for each comparison criterion.
```js
[9.5, 6, 6.5, 6.5];
```

---

## 🛰️ `getTable(config)` — Core Function

### Purpose
Fetches and processes all satellite pass data pages for a given satellite.

### Parameters
| Name | Type | Description |
|------|------|-------------|
| `config.target` | `number` | Satellite ID (used in URL). |
| `config.pages` | `number` | Number of pages to fetch. |
| `config.root` | `string` | Directory root to save data. |
| `config.counter` | `number` | Internal counter for recursion. |
| `config.opt` | `string` | POST data for pagination. |
| `config.database` | `Array` | Accumulated satellite data. |

---

### 🔄 Process Flow

1. **Initial Setup**
   - Builds request options using `utils.get_options()` or `utils.post_options()`.
   - Creates a folder named `satellite<id>/` for output files.

2. **Fetch Data**
   - Uses `request()` to download the satellite summary table.

3. **Parse Table**
   - Extracts all pass links, dates, and brightness values.
   - Creates a queue of pass objects for further processing.

4. **Fetch Details**
   - For each pass, requests the detailed view page.
   - Extracts time, altitude, azimuth, distance, brightness, and sun altitude.
   - Computes start and end timestamps using `utils.getTimestamp()`.

5. **Download Assets**
   - Saves the pass HTML table as `<id>.html`.
   - Downloads and saves the finder image as `<id>.png`.

6. **Compute Score**
   - Each pass gets a “scoreData” array of [hour, brightness, sun altitude, altitude].
   - The total score is computed based on visibility time, brightness, and conditions.
   - Adds bonuses for evening/morning passes.

7. **Generate Output**
   - Creates a ranked JSON file `index.json` with all passes sorted by score.

---

## 📁 Output Files

All results are stored in a folder named like `satellite12345/`:

| File | Description |
|-------|--------------|
| `index.json` | All pass data, sorted by score |
| `<id>.html` | The parsed HTML table for each pass |
| `<id>.png` | The visibility finder image |

---

## ⚙️ Example Usage

```js
const satellite = require("./satellite");

satellite.getTable({
  target: 25544,       // ISS (International Space Station)
  pages: 3,            // Fetch 3 pages of data
  root: "./data/",     // Save results in ./data/
  counter: 0           // Start from page 0
});
```

---

## 🧠 Notes

- The script uses recursion to fetch multiple pages automatically.
- Each request result is processed asynchronously using Promises.
- A scoring system is implemented to rank satellite passes by best visibility.
- Depends on `utils.js` for request options, MD5 hashing, and time parsing.

---

## 🪐 Summary

This module acts as a **satellite visibility scraper and analyzer**.  
It collects, stores, and ranks passes by their visibility and brightness,  
providing both visual (image) and data outputs for astronomy or observation tools.
