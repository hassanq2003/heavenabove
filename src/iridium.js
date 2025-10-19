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

// Unified request helper for mocking
function request(options, callback) {
  if (!options || !options.url) return callback(new Error("Invalid URL"));
  axios
    .get(options.url)
    .then((res) => callback(null, { statusCode: res.status }, res.data))
    .catch((err) => callback(err));
}

function getTable(config) {
  let database = config.database || [];
  let counter = config.counter || 0;
  const opt = config.opt || 0;
  const basedir = config.root + "IridiumFlares/";

  let options;
  if (counter === 0) {
    options = utils.get_options("IridiumFlares.aspx?");
    if (!fs.existsSync(basedir)) {
      fs.mkdir(basedir, (err) => err && console.log(err));
    }
  } else {
    options = utils.post_options("IridiumFlares.aspx?", opt);
  }

  try {
    request(options, (error, response, body) => {
      if (error || response.statusCode !== 200) return;

      const $ = cheerio.load(body, { decodeEntities: false });
      const tbody = $("form").find("table.standardTable tbody");
      const queue = [];

      tbody.find("tr").each((i, o) => {
        const temp = {};

        for (let j = 0; j < 6; j++) {
          temp[eventsIridium[j]] = $(o).find("td").eq(j + 1).text().trim();
        }

        const href = $(o).find("td").eq(0).find("a").attr("href");
        if (href && href.includes("type=")) {
          temp.url =
            "https://www.heavens-above.com/" + href.replace("type=V", "type=A");
        } else {
          temp.url = "https://www.heavens-above.com/IridiumFlares.aspx"; // fallback
        }

        queue.push(temp);
      });

      function factory(temp) {
        return new Promise((resolve) => {
          request(utils.iridium_options(temp.url), (error, response, body) => {
            if (error || response.statusCode !== 200) {
              resolve(temp);
              return;
            }

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
            if (imgSrc) {
              temp[eventsIridium[13]] = "https://www.heavens-above.com/" + imgSrc;
            }

            const id = utils.md5(Math.random().toString());
            temp[eventsIridium[14]] = id;

            fs.appendFile(basedir + id + ".html", table.html(), (err) => err && console.log(err));

            if (temp[eventsIridium[13]]) {
              const imgOpts = utils.image_options(temp[eventsIridium[13]]);
              axios
                .get(imgOpts.url, { responseType: "stream" })
                .then((res) => {
                  res.data
                    .pipe(fs.createWriteStream(basedir + id + ".png", { flags: "a" }))
                    .on("error", console.error);
                })
                .catch(console.error);
            }

            resolve(temp);
          });
        });
      }

      Promise.allSettled(queue.map((temp) => factory(temp))).then((results) => {
        results = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
        database = database.concat(results);
      });
    });
  } catch (err) {
    console.error("Error fetching page:", err.message);
  }
}

exports.getTable = getTable;
exports.eventsIridium = eventsIridium;
exports.request = request;
