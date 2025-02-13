import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { routeglobal } from "./router/routes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./views"));
//rutas de la app
app.use("/", routeglobal);

app.listen(port, () => {
  console.log(`esta en puerto ${port}`);
});
