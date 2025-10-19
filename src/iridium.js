const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const utils = require("./utils");

const eventsIridium = [
  "brightness",
  "altitude",
  "azimuth",
  "satellite",
  "distanceToFlareCentre",
  "brightnessAtFlareCentre",
  "date",
  "time",
  "distanceToSatellite",
  "AngleOffFlareCentreLine",
  "flareProducingAntenna",
  "sunAltitude",
  "angularSeparationFromSun",
  "image",
  "id",
];

// Unified request helper
function request(options, callback) {
  if (!options || !options.url) return callback(new Error("Invalid URL"));
  axios
    .get(options.url)
    .then((res) => callback(null, { statusCode: res.status }, res.data))
    .catch((err) => callback(err));
}

// Main function to get Iridium flares
function getTable(config) {
  return new Promise((resolve, reject) => {
    let database = config.database || [];
    const basedir = config.root + "IridiumFlares/";
    const counter = config.counter || 0;
    const opt = config.opt || 0;

    if (!fs.existsSync(basedir)) fs.mkdirSync(basedir, { recursive: true });

    const options = counter === 0
      ? utils.get_options("IridiumFlares.aspx?")
      : utils.post_options("IridiumFlares.aspx?", opt);

    request(options, async (error, response, body) => {
      if (error || response.statusCode !== 200) return reject(error);

      const $ = cheerio.load(body, { decodeEntities: false });
      const tbody = $("form").find("table.standardTable tbody");
      const queue = [];

      tbody.find("tr").each((i, o) => {
        const temp = {};
        for (let j = 0; j < 6; j++) {
          temp[eventsIridium[j]] = $(o).find("td").eq(j + 1).text().trim();
        }
        const href = $(o).find("td").eq(0).find("a").attr("href");
        temp.url = href
          ? "https://www.heavens-above.com/" + href.replace("type=V", "type=A")
          : "https://www.heavens-above.com/IridiumFlares.aspx";

        queue.push(temp);
      });

      // Fetch detailed flare data
      async function factory(temp) {
        return new Promise((res) => {
          request(utils.iridium_options(temp.url), (err, resp, body) => {
            if (err || resp.statusCode !== 200) return res(temp);

            const $ = cheerio.load(body, { decodeEntities: false });
            const table = $("form").find("table.standardTable");
            const tr = table.find("tbody tr");

            [
              [6, 0],
              [7, 1],
              [8, 6],
              [9, 7],
              [10, 9],
              [11, 10],
              [12, 11],
            ].forEach(([index, row]) => {
              temp[eventsIridium[index]] = tr.eq(row).find("td").eq(1).text().trim();
            });

            const imgSrc = $("#ctl00_cph1_imgSkyChart").attr("src");
            if (imgSrc) temp[eventsIridium[13]] = "https://www.heavens-above.com/" + imgSrc;

            const id = utils.md5(Math.random().toString());
            temp[eventsIridium[14]] = id;

            fs.appendFileSync(basedir + id + ".html", table.html());

            if (temp[eventsIridium[13]]) {
              const imgOpts = utils.image_options(temp[eventsIridium[13]]);
              axios
                .get(imgOpts.url, { responseType: "stream" })
                .then((resStream) => {
                  resStream.data.pipe(fs.createWriteStream(basedir + id + ".png", { flags: "a" }));
                })
                .catch(console.error);
            }

            res(temp);
          });
        });
      }

      await Promise.all(queue.map(factory));
      database = database.concat(queue);
      resolve(database);
    });
  });
}

module.exports = {
  getTable,
  eventsIridium,
  request,
};
