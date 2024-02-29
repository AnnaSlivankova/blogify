import {app, SETTINGS} from "./app";
import {runDb} from "./db/db";

// app.listen(SETTINGS.PORT, async () => {
//   await runDB()
// })

const startApp = async () => {
  await runDb()
  app.listen(SETTINGS.PORT, () => {
    console.log(`App listening on port ${SETTINGS.PORT}`)
  })
}

startApp()

app.set('trust proxy', true)