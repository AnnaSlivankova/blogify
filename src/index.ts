import {app, SETTINGS} from "./app";
import {runDB} from "./db/db";

app.listen(SETTINGS.PORT, async () => {
  await runDB()
})