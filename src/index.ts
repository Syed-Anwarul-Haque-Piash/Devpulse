import app from "./app"
import config from "./config/config";
import { initDB } from "./db/db";


const main= async() => {
  await initDB();
  app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`)
})
}
 main();