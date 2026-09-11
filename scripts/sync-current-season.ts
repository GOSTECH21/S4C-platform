import { ensureCurrentSeasonRoster } from "../app/services/season-roster.service";

ensureCurrentSeasonRoster()
  .then(() => {
    console.log("Current-season club roster synced.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
