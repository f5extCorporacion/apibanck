import express from "express";
import {
  Actualizaestado,
  EliminarUsuario,
  GETusers,
  POSTusers,
  POSTusersLogin,
  protegida,
  verifyToken,
} from "../modulos/usuarios/midleware.usuario.js";
import { GETcuentas, GETcuenta, POSTcuenta } from "../modulos/cuenta/midleware.cuenta.js";
import {
  GETtarjetas,
  POSTtarjetas,
  GETTitularTarjeta
} from "../modulos/tarjetas/midleware.tarjeta.js";
import { GETallTransacciones, GEThistorialTransacciones, POSTtransaccion } from "../modulos/transacciones/midleware.transaccion.js";
import { GETHome } from "../modulos/home/index.js";
import { validateAccountCreation, validateCardCreation } from '../middlewares/validationMiddleware.js';

export const routeglobal = express.Router();

routeglobal.route("/").get(GETHome);
//Routes de users
routeglobal.route("/users").get(GETusers).post(POSTusers);
routeglobal.route("/users/:id").put(Actualizaestado).delete(EliminarUsuario);
routeglobal.route("/userLog").post(POSTusersLogin);
routeglobal.route("/protected").get(verifyToken, protegida);

//Routes with validation
routeglobal.route("/cuenta").get(GETcuentas).post(validateAccountCreation, POSTcuenta);
routeglobal.route("/cuenta/:id").get(GETcuenta);
routeglobal.route("/cuenta/:id/transacciones").get(GEThistorialTransacciones);

routeglobal.route("/tarjetas").get(GETtarjetas).post(validateCardCreation, POSTtarjetas);
routeglobal.route("/tarjetas/:numeroTarjeta").get(GETTitularTarjeta);

routeglobal.route("/transaccion").get(GETallTransacciones).post(POSTtransaccion);