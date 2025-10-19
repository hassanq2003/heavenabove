const satellite = require("./src/satellite");
const iridium = require("./src/iridium");

const location = [39.9042, 116.4074, "%E5%8C%97%E4%BA%AC%E5%B8%82", 52, "ChST"];

// Main async runner
async function run() {
  try {
    console.log("Fetching ISS data...");
    await satellite.getTable({
      target: 25544, // ISS
      pages: 4,
      root: "./public/data/"
    });

    console.log("Fetching Iridium flares...");
    await iridium.getTable({
      pages: 4,
      root: "./public/data/"
    });

    console.log("All data fetched and saved successfully!");
  } catch (err) {
    console.error("Error during data fetch:", err);
  }
}

// Execute
run();
