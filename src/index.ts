import {app} from "./app";
import {SETTINGS} from "./settings";

app.listen(SETTINGS.PORT, () => {
  console.log(`App listening on port ${SETTINGS.PORT}`)
})