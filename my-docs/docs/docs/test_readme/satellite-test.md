# 🛰️ Satellite Module Test Suite

## Overview

This file contains **unit tests** for the `Satellite` module, which is responsible for managing satellite data, computing observation scores, and handling data retrieval and storage.  
The tests are written using **Jest**, and they include mocks for all external dependencies to ensure isolated and predictable behavior.

---

## 📁 File Purpose

The test suite validates:
- Initialization of constants and default properties in the `satellite` module.
- Correctness of comparison functions used for sorting satellite passes.
- Proper setup and directory management for storing satellite data.
- The scoring algorithm that evaluates satellite observations.
- Pagination behavior for multiple data pages retrieved from an external source.

---

## 🧩 Dependencies and Mocks

The following modules are **mocked** to avoid real I/O and HTTP requests:
- [`request`](https://www.npmjs.com/package/request): Mocked to simulate HTTP responses.
- `fs` (File System): Mocked for directory creation and file writes.
- `../src/utils`: Mocked to isolate from external helper logic.
- `../src/satellite`: The core module under test.

---

## ⚙️ Test Sections

### 1. **Constants**
Ensures that:
- `property`, `events`, and `attribute` arrays are defined correctly.
- `compare` functions and `weight` values exist and match expected structures.

---

### 2. **Comparison Functions**
Tests four custom comparison functions used to evaluate satellite passes:
1. Brightness comparison  
2. Sun altitude comparison  
3. Satellite altitude comparison  
4. Duration comparison  

Each function is verified to return a numerical value indicating ordering.

---

### 3. **getTable – Initial Setup**
Validates:
- The module correctly checks and creates directories (`./data/satellite25544/`).
- Proper handling of directory creation errors (e.g., permission issues).
- Interaction with mocked `fs` and `request` functions.

---

### 4. **Scoring Algorithm**
Checks that:
- Scores are computed correctly based on multiple weighted factors.
- Bonus scores are added for specific `scoreData` value ranges.
- `NaN` brightness values correctly reset the score to zero.
- Sorting by total score produces expected order (highest score first).

---

### 5. **Pagination**
Ensures that when the configuration specifies multiple pages (`pages > 1`),  
the module makes repeated HTTP requests for each page.

---

## 🧪 Test Behavior Summary

| Test Category | Purpose | Mocked Components |
|----------------|----------|------------------|
| Constants | Validate static module definitions | None |
| Comparison | Ensure sorting functions behave numerically | None |
| Directory Setup | Verify filesystem and HTTP setup | `fs`, `request` |
| Scoring | Test weighted score computation logic | None |
| Pagination | Check page handling | `request` |

---

## 🧰 Tools and Frameworks
- **Jest** – Testing framework  
- **Node.js** built-ins (`fs`) – Mocked  
- **Request** – Mocked for HTTP calls  

---

## 📄 Summary

This test suite ensures that the `Satellite` module:
- Initializes with proper constants and data structures.
- Calculates satellite observation scores accurately.
- Handles filesystem operations safely and predictably.
- Manages pagination and external data retrieval correctly.

It is an essential component for maintaining **robust, isolated, and verifiable** functionality of the satellite data processing system.

---
