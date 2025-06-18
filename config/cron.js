import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/5 * * * * ", function () {
  https
    .get("https://jobnest-backendd.onrender.com/", (res) => {
      if (res.statusCode === 200) console.log("GET request is successfully");
      else console.error("GET request failed", res.statusCode);
    })
    .on("error", (err) =>
      console.error("Error while sending cron job request", err)
    );
});

export default job;
