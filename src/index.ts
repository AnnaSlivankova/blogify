import {app} from "./app";
import 'dotenv/config'
import {runDB} from "./db/db";

app.listen(process.env.PORT, async () => {
  await runDB()
})