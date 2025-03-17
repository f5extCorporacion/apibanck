import * as dotenv from "dotenv";
import express from "express";
dotenv.config();
import { routeglobal } from "./router/routes.js";
import cors from 'cors';

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
