import express from "express";
import {
  GETusers,
  POSTusers,
  POSTusersLogin,
  protegida,
  verifyToken,
} from "../modulos/usuarios/midleware.usuario.js";
import { GETcuenta, POSTcuenta } from "../modulos/cuenta/midleware.cuenta.js";
import {
  GETtarjetas,
  POSTtarjetas,
} from "../modulos/tarjetas/midleware.tarjeta.js";
import { GETHome } from "../modulos/home/index.js";
export const routeglobal = express.Router();

routeglobal.route("/").get(GETHome);
//Routes de users
routeglobal.route("/users").get(GETusers).post(POSTusers);
//LOgin usuario
routeglobal.route("/userLog").post(POSTusersLogin);
//
routeglobal.route("/protected").get(verifyToken, protegida);
//Routes de cuenta
routeglobal.route("/cuenta").get(GETcuenta).post(POSTcuenta);
//Routes tarjetas
routeglobal.route("/tarjetas").get(GETtarjetas).post(POSTtarjetas);
//Routes Transaccion
