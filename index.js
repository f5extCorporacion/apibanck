import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { routeglobal } from "./router/routes.js";
import path from "path";
import { fileURLToPath } from "url";

// Import the cors package
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
// Apply CORS middleware before your routes
app.use(cors({
  origin: '*', // Allow all origins - you may want to restrict this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./views"));
//rutas de la app
app.use("/", routeglobal);

app.listen(port, () => {
  console.log(`esta en puerto ${port}`);
});
