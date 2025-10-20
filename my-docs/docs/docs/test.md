# 🧪 Running Jest Tests for the Utils Module

## 📘 Overview

This document explains how to run Jest-based unit tests for the `utils` module.  
It includes environment setup, test execution commands, and troubleshooting notes.

---

## 🛠️ Project Setup

Before running tests, ensure you have:

- **Node.js** (v16 or later)
- **npm** (v8 or later)
- A cloned project folder containing:
  - `src/utils.js`
  - `__tests__/utils.test.js` (or similar test file)
  - `package.json` with Jest configured

---

## 📦 Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

If Jest is not listed in your dependencies, add it manually:

```bash
npm install --save-dev jest
```

---

## ⚙️ Step 2: Add Test Script to package.json

Open your `package.json` and make sure you have a **test** script like this:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

Optionally, you can run Jest in watch mode for active development:

```json
{
  "scripts": {
    "test": "jest --watch"
  }
}
```

---

## 🧩 Step 3: Run Tests

Run the following command in your terminal:

```bash
npm test
```

This will:
- Automatically detect `.test.js` or `.spec.js` files.
- Run all test cases using Jest.
- Display results in the terminal.

---

## 📁 Example Project Structure

```
project/
├── package.json
├── src/
│   └── utils.js
├── __tests__/
│   └── utils.test.js
└── node_modules/
```

---

## 🧠 Example Test Explanation

### ✅ Tested Features

1. **getTimestamp(timeString)**  
   Converts time strings like `"12:30:45"` into total seconds.

2. **md5(string)**  
   Mocks `crypto` to verify hashing behavior without real MD5 computation.

3. **get_options / post_options / image_options / iridium_options**  
   Tests HTTP request configuration generators for correct URL and headers.

4. **URL Encoding**
   Ensures Chinese characters are properly encoded (e.g. `"北京市"` → `%E5%8C%97%E4%BA%AC%E5%B8%82`).

---

## 🧾 Example Test Command Output

A successful run will look like this:

```
 PASS  __tests__/utils.test.js
  Utils
    ✓ should convert time string to seconds (5 ms)
    ✓ should handle time without seconds
    ✓ should generate MD5 hash using crypto
    ✓ should return correct GET/POST configuration
    ✓ should properly encode Chinese characters in URLs

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        1.234 s
```

---

## 🧹 Optional: Clear Jest Cache

If you encounter unexpected behavior, run:

```bash
npx jest --clearCache
```

---

## 🧰 Troubleshooting

| Issue | Solution |
|-------|-----------|
| **`jest: command not found`** | Run `npm install --save-dev jest` |
| **Tests fail due to imports** | Check relative paths in `require('../src/utils')` |
| **Mock not working** | Ensure `jest.mock()` is declared **before** the tests |

---

## 🎉 Done!

After running:

```bash
npm test
```

You’ll see a summary of all passing and failing tests.  
Make sure all are ✅ before pushing to Git or CI/CD pipelines.

---

**Author:** Hassan Qureshi  
**File:** `test.md`  
**Purpose:** Document how to run Jest tests for the utils module.
