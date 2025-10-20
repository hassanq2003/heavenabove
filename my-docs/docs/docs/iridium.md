# iridium.js

This module (`iridium.js`) is designed to fetch and process **Iridium satellite flare prediction data** from the [Heavens Above](https://www.heavens-above.com) website. It scrapes flare events, downloads related HTML tables and sky chart images, and stores them locally in structured format.

---

## 📦 Dependencies

This script uses the following Node.js packages:

- **axios** — for making HTTP requests.
- **cheerio** — for parsing and traversing HTML (similar to jQuery).
- **fs** — for file system operations (built-in in Node.js).
- **utils.js** — local helper module providing reusable request configurations and utilities such as `md5`, `get_options`, and `image_options`.

Install dependencies using:
```bash
npm install axios cheerio
```

---

## ⚙️ Overview

The module scrapes Iridium flare event data from `heavens-above.com`, extracts event details, downloads sky chart images, and saves everything locally.

### Data Pipeline

1. **Send Request** — Uses `axios` with options built by `utils.js`.
2. **Parse Table** — Extracts flare info (brightness, altitude, azimuth, etc.) from an HTML table using `cheerio`.
3. **Fetch Details** — Visits each flare’s detail page to collect additional data and a sky chart image.
4. **Store Data** — Saves each flare’s HTML and image locally under `IridiumFlares/`.
5. **Generate ID** — Each flare entry is given a unique ID via an MD5 hash.

---

## 🧩 Key Components

### 1. `eventsIridium`
An array defining the attributes collected for each flare event:
```js
const eventsIridium = [
  "brightness", "altitude", "azimuth", "satellite",
  "distanceToFlareCentre", "brightnessAtFlareCentre",
  "date", "time", "distanceToSatellite", "AngleOffFlareCentreLine",
  "flareProducingAntenna", "sunAltitude", "angularSeparationFromSun",
  "image", "id"
];
```

---

### 2. `request(options, callback)`
A wrapper around `axios.get` to maintain a callback-based interface similar to the Node.js `request` library (deprecated).  
Used internally by the module for all web requests.

---

### 3. `getTable(config)`
The **main function** of the module.

#### Parameters
| Parameter | Type | Description |
|------------|------|-------------|
| `config.target` | `String` | Satellite target ID or name |
| `config.root` | `String` | Root path for saving output files |
| `config.counter` | `Number` | Page counter for multi-page scraping |
| `config.opt` | `String` | POST request parameters |
| `config.database` | `Array` | Accumulated results from previous calls |

#### Behavior
- Initializes the output directory (`IridiumFlares/`).
- Loads flare listings from `IridiumFlares.aspx`.
- Iterates through table rows to collect data.
- Visits each flare’s detail page for extended data.
- Saves each entry’s HTML and image using a unique ID.

Example output directory:
```
IridiumFlares/
├── d41d8cd98f.html
├── d41d8cd98f.png
└── ...
```

#### Example Use
```js
const { getTable } = require('./iridium');
getTable({
  root: './data/',
  target: 'Iridium',
  counter: 0,
  pages: 1
}).then(data => console.log('Flare Data:', data));
```

---

## 📁 File Output

Each Iridium flare event produces:
- `HTML` file — raw table content.
- `PNG` image — sky chart view.
- `index.json` (optional) — compiled list of flare data if extended.

---

## 🧠 Notes
- The `utils.js` module must exist in the same directory.
- The script assumes consistent HTML structure on the `heavens-above.com` website.
- Network or HTML structure changes may break scraping logic.

---

## 🧾 License
This script is for **educational and research purposes only**.  
Data is sourced from [Heavens Above](https://www.heavens-above.com).