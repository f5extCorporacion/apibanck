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
import { GEThistorialTransacciones, POSTtransaccion } from "../modulos/transacciones/midleware.transacion.js";
import { GETHome } from "../modulos/home/index.js";
export const routeglobal = express.Router();

routeglobal.route("/").get(GETHome);
//Routes de users
routeglobal.route("/users").get(GETusers).post(POSTusers);
//actualizar users  ACTIVO | INACTIVO
routeglobal.route("/users/:id").put(Actualizaestado).delete(EliminarUsuario);
//LOgin usuario
routeglobal.route("/userLog").post(POSTusersLogin);
//
routeglobal.route("/protected").get(verifyToken, protegida);
//Routes de cuenta
routeglobal.route("/cuenta").get(GETcuentas).post(POSTcuenta);

//treaer cuenta por id
routeglobal.route("/cuenta/:id").get(GETcuenta)
//traer historial de transacciones
routeglobal.route("/cuenta/:id/transacciones").get(GEThistorialTransacciones)
//Routes tarjetas
routeglobal.route("/tarjetas").get(GETtarjetas).get(GETTitularTarjeta).post(POSTtarjetas);
//Routes Transaccion
routeglobal.route("/transaccion").get(GEThistorialTransacciones).post(POSTtransaccion);