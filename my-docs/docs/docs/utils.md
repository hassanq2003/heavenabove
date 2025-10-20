# 🧰 util.js — Utility Functions for Heavens-Above Requests

This file (`util.js`) contains a collection of helpful functions used to create HTTP requests and perform basic operations such as time conversion and hashing.  
It is designed to interact with the [Heavens-Above](https://www.heavens-above.com) website — a site that provides real-time information about satellites, the ISS, and Iridium flares.

---

## 📖 What This File Does

This module helps you:
- Create **GET** and **POST** request objects with the correct headers for Heavens-Above.
- Prepare requests to fetch **images** and **Iridium flare** data.
- Convert **time strings** into **seconds** (useful for timing or scheduling).
- Generate an **MD5 hash** from a given string.

You can easily use these utilities in your Node.js project to interact with Heavens-Above without manually setting headers or formatting data.

---

## ⚙️ How to Use

### 1. Import the module

```js
const {
  getTimestamp,
  post_options,
  get_options,
  image_options,
  iridium_options,
  md5
} = require('./util');
```

### 2. Example usage

```js
// Convert time to seconds
console.log(getTimestamp('01:30:45')); // Output: 5445

// Create a GET request object
const getReq = get_options('iss.aspx?');
console.log(getReq.url);

// Create a POST request object
const postReq = post_options('satellite.aspx?', { id: 25544 });
console.log(postReq.method); // Output: POST

// Generate an MD5 hash
console.log(md5('hello world')); // Output: 5eb63bbbe01eeed093cb22bb8f5acdc3
```

---

## 🧩 Function Descriptions

### 🕒 1. `getTimestamp(time)`
Converts a time string (in `HH:MM` or `HH:MM:SS` format) into the total number of seconds.

### 🌐 2. `get_options(target)`
Creates a `GET` request configuration for Heavens-Above endpoints.

### 📤 3. `post_options(target, opt)`
Creates a `POST` request configuration to send data to Heavens-Above.

### 🖼️ 4. `image_options(target)`
Prepares a GET request for downloading or fetching images from Heavens-Above.

### 🛰️ 5. `iridium_options(target)`
Prepares headers for fetching Iridium flare data.

### 🔒 6. `md5(str)`
Generates an MD5 hash from a string.

---

## 🌍 Default Request Settings

| Parameter | Value | Description |
|------------|--------|-------------|
| Latitude | 39.9042 | Default location: Beijing |
| Longitude | 116.4074 | Default location: Beijing |
| Altitude | 52 | Meters above sea level |
| Timezone | ChST | Chamorro Standard Time |
| Location (encoded) | %E5%8C%97%E4%BA%AC%E5%B8%82 | URL-encoded “Beijing” |

All requests include cookies and headers that simulate a Safari browser for compatibility.

---

## 🧠 Example (Using node-fetch)

```js
import fetch from 'node-fetch';
import { get_options, md5 } from './util.js';

async function getISSPage() {
  const opts = get_options('iss.aspx?');
  const response = await fetch(opts.url, { method: opts.method, headers: opts.headers });
  const html = await response.text();
  console.log('Page length:', html.length);
}

getISSPage();
console.log('Hash of ISS:', md5('iss'));
```

---

## 🧾 License

This code is provided **as-is** for educational and research purposes.  
It is **not affiliated** with or endorsed by *Heavens-Above.com*.

---

## ✨ Summary

This file helps you quickly build correct requests for Heavens-Above data, convert times, and create MD5 hashes — all with simple and reusable code.
