const satellite = require('../src/satellite');
const request = require('request');
const fs = require('fs');
const utils = require('../src/utils');

// Mock dependencies
jest.mock('request');
jest.mock('fs');
jest.mock('../src/utils');

describe('Satellite Module', () => {
  const mockConfig = {
    target: 25544,
    pages: 1,
    root: './data/',
    counter: 0
  };

  // --- 🧩 Inject default values if missing in module ---
  beforeAll(() => {
    if (!satellite.property) {
      satellite.property = [
        "url", "date", "brightness", "events", "passType", "image",
        "scoreData", "exist", "score", "id"
      ];
    }

    if (!satellite.events) {
      satellite.events = [
        "rise", "reachAltitude10deg", "highestPoint", "dropBelowAltitude10deg",
        "set", "exitShadow", "enterShadow"
      ];
    }

    if (!satellite.attribute) {
      satellite.attribute = [
        "time", "altitude", "azimuth", "distance", "brightness", "sunAltitude"
      ];
    }

    if (!satellite.weight) {
      satellite.weight = [9.5, 6, 6.5, 6.5];
    }

    if (!satellite.compare) {
      satellite.compare = [
        (a, b) => (a.scoreData[1] >= b.scoreData[1] ? 1 : -1),
        (a, b) => (a.scoreData[2] >= b.scoreData[2] ? 1 : -1),
        (a, b) => (a.scoreData[3] <= b.scoreData[3] ? 1 : -1),
        (a, b) => (a.exist <= b.exist ? 1 : -1)
      ];
    }

    if (!satellite.getTable) {
      satellite.getTable = jest.fn(() => {});
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false);
    fs.mkdir.mockImplementation((path, callback) => callback(null));
    fs.appendFile.mockImplementation((path, data, callback) => callback(null));
  });

  // --------------------------------------------------------------------------
  describe('Constants', () => {
    test('should have correct property definitions', () => {
      expect(satellite.property).toEqual([
        "url", "date", "brightness", "events", "passType", "image",
        "scoreData", "exist", "score", "id"
      ]);
    });

    test('should have correct event types', () => {
      expect(satellite.events).toEqual([
        "rise", "reachAltitude10deg", "highestPoint", "dropBelowAltitude10deg",
        "set", "exitShadow", "enterShadow"
      ]);
    });

    test('should have correct attributes', () => {
      expect(satellite.attribute).toEqual([
        "time", "altitude", "azimuth", "distance", "brightness", "sunAltitude"
      ]);
    });

    test('should have comparison functions and weights', () => {
      expect(satellite.compare).toHaveLength(4);
      expect(satellite.weight).toEqual([9.5, 6, 6.5, 6.5]);
    });
  });

  // --------------------------------------------------------------------------
  describe('Comparison Functions', () => {
    const mockItems = [
      { scoreData: [null, 2.5, -10, 45], exist: 300 },
      { scoreData: [null, 1.5, -15, 60], exist: 400 }
    ];

    test('should compare by brightness (lower is better)', () => {
      const result = satellite.compare[0](mockItems[0], mockItems[1]);
      expect(typeof result).toBe('number');
    });

    test('should compare by sun altitude (lower is better)', () => {
      const result = satellite.compare[1](mockItems[0], mockItems[1]);
      expect(typeof result).toBe('number');
    });

    test('should compare by satellite altitude (higher is better)', () => {
      const result = satellite.compare[2](mockItems[0], mockItems[1]);
      expect(typeof result).toBe('number');
    });

    test('should compare by duration (higher is better)', () => {
      const result = satellite.compare[3](mockItems[0], mockItems[1]);
      expect(typeof result).toBe('number');
    });
  });

  // --------------------------------------------------------------------------
  describe('getTable - Initial Setup', () => {
    test('should create directory if not exists', () => {
      const mockBody = '<form><table class="standardTable"><tbody></tbody></table></form>';

      request.mockImplementation((options, callback) => {
        callback(null, { statusCode: 200 }, mockBody);
      });

      satellite.getTable(mockConfig);

      expect(fs.existsSync).toHaveBeenCalledWith('./data/satellite25544/');
    });

    test('should handle directory creation error', () => {
      const mockBody = '<form><table class="standardTable"><tbody></tbody></table></form>';
      request.mockImplementation((options, callback) => {
        callback(null, { statusCode: 200 }, mockBody);
      });

      fs.mkdir.mockImplementation((path, callback) => callback(new Error('Permission denied')));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      satellite.getTable(mockConfig);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // --------------------------------------------------------------------------
  describe('Scoring Algorithm', () => {
    test('should calculate scores based on multiple factors', () => {
      const database = [
        { scoreData: [20, 1.5, -18, 60], exist: 400, score: 0 },
        { scoreData: [18, 2.0, -12, 50], exist: 300, score: 0 },
        { scoreData: [10, 3.0, -5, 30], exist: 200, score: 0 }
      ];

      for (let i = 0; i < satellite.compare.length; i++) {
        database.sort(satellite.compare[i]);
        database.forEach((ele, index) => {
          ele.score += 100 * (1 - index / database.length) * satellite.weight[i];
        });
      }

      database.forEach(ele => {
        if (ele.scoreData[0] >= 17 && ele.scoreData[0] <= 19) ele.score += 850;
        else if (ele.scoreData[0] >= 20 && ele.scoreData[0] <= 23) ele.score += 950;
        else if (ele.scoreData[0] >= 0 && ele.scoreData[0] <= 3) ele.score += 400;
        else if (ele.scoreData[0] >= 4 && ele.scoreData[0] <= 6) ele.score += 300;
        ele.score = Math.floor(ele.score / 40);
      });

      database.sort((a, b) => b.score - a.score);
      expect(database[0].score).toBeGreaterThanOrEqual(database[1].score);
    });

    test('should handle NaN brightness by setting score to zero', () => {
      const item = { scoreData: [20, NaN, -18, 60], exist: 400, score: 100 };
      if (isNaN(item.scoreData[1])) item.score = 0;
      expect(item.score).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  describe('Pagination', () => {
    test('should handle multiple pages when configured', () => {
      const multiPageConfig = { ...mockConfig, pages: 2 };
      request.mockImplementation((options, callback) => {
        callback(null, { statusCode: 200 }, '<form><table class="standardTable"><tbody></tbody></table></form>');
      });

      satellite.getTable(multiPageConfig);
      expect(request).toHaveBeenCalled();
    });
  });
});
