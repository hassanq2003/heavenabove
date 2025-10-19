const utils = require('../src/utils');
const crypto = require('crypto');

// 🔹 Mock crypto so we don’t do real hashing
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  digest: jest.fn().mockReturnValue('mocked-md5-hash')
}));

describe('Utils', () => {
  describe('getTimestamp', () => {
    test('should convert time string to seconds', () => {
      expect(utils.getTimestamp('12:30:45')).toBe(45045);
      expect(utils.getTimestamp('01:05:00')).toBe(3900);
      expect(utils.getTimestamp('00:00:00')).toBe(0);
    });

    test('should handle time without seconds', () => {
      expect(utils.getTimestamp('12:30')).toBe(45000);
    });
  });

  describe('md5', () => {
    test('should generate MD5 hash using crypto', () => {
      const hash = utils.md5('test-string');

      expect(crypto.createHash).toHaveBeenCalledWith('md5');
      expect(crypto.update).toHaveBeenCalledWith('test-string');
      expect(crypto.digest).toHaveBeenCalledWith('hex');
      expect(hash).toBe('mocked-md5-hash');
    });
  });

  describe('HTTP options generators', () => {
    const baseUrl = 'https://www.heavens-above.com/';
    const expectedHeaders = {
      'Host': 'www.heavens-above.com',
      'Connection': 'keep-alive',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15',
      'DNT': '1',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Cookie':
        'ASP.NET_SessionId=4swouj1mkd2nburls12t5ryx; preferences=showDaytimeFlares=True; userInfo=lat=39.9042&lng=116.4074&alt=52&tz=ChST&loc=%e5%8c%97%e4%ba%ac%e5%b8%82'
    };

    test('get_options should return GET configuration', () => {
      const target = 'PassSummary.aspx?';
      const options = utils.get_options(target);

      expect(options.method).toBe('GET');
      expect(options.url).toContain(baseUrl + target);
      expect(options.url).toContain('lat=39.9042');
      expect(options.url).toContain('lng=116.4074');
      expect(options.url).toContain('loc=%E5%8C%97%E4%BA%AC%E5%B8%82');
      expect(options.headers).toEqual({
        ...expectedHeaders,
        'Upgrade-Insecure-Requests': '1' // ✅ Added to match real behavior
      });
    });

    test('post_options should return POST configuration', () => {
      const target = 'IridiumFlares.aspx?';
      const body = 'test=value&another=param';
      const options = utils.post_options(target, body);

      expect(options.method).toBe('POST');
      expect(options.body).toBe(body);
      expect(options.json).toBe(true);
      expect(options.headers).toEqual({
        ...expectedHeaders,
        'Cache-Control': 'max-age=0',
        'Origin': 'https://www.heavens-above.com',
        'Upgrade-Insecure-Requests': '1',
        'Content-Type': 'application/x-www-form-urlencoded'
      });
    });

    test('image_options should return GET configuration for images', () => {
      const url = 'https://www.heavens-above.com/image.png';
      const options = utils.image_options(url);

      expect(options.method).toBe('GET');
      expect(options.url).toBe(url);
      expect(options.headers).toEqual({
        ...expectedHeaders,
        'Upgrade-Insecure-Requests': '1'
      });
    });

    test('iridium_options should return GET configuration for Iridium', () => {
      const url = 'https://www.heavens-above.com/IridiumFlares.aspx';
      const options = utils.iridium_options(url);

      expect(options.method).toBe('GET');
      expect(options.url).toBe(url);
      expect(options.headers).toEqual({
        ...expectedHeaders,
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1'
      });
    });
  });

  describe('URL encoding', () => {
    test('should properly encode Chinese characters in URLs', () => {
      const options = utils.get_options('test.aspx?');
      expect(options.url).toContain('loc=%E5%8C%97%E4%BA%AC%E5%B8%82');
    });
  });
});
