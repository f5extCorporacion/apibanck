import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

//GET trae los datos
export const GETcuenta = async (req, res, next) => {
  try {
    const userst = await prisma.cuenta.findMany({
      where: { status: "ACTIVO" },
      include: { usuario: true, transaccion: true, tarjeta: true },
    });
    return res.status(200).json({ cuentas: userst });
  } catch (error) {
    return res.status(200).json({ mensaje: "Error envio de datos" });
  }
};

//POST Crea usuario
export const POSTcuenta = async (req, res, next) => {
  const { numerocuenta, usuarioId, dineroCuenta } = req.body;

  // Validación de parámetros (más robusta)
  if (!numerocuenta || !usuarioId || !dineroCuenta) {
    return res.status(400).json({
      mensaje: "Faltan parámetros obligatorios ",
    }); // Código 400 para Bad Request
  }

  // Validación de longitud de la cédula (puedes adaptarla al formato de tu país)
  if (numerocuenta && numerocuenta.length !== 10) {
    // Verifica si cedula existe antes de acceder a su longitud
    return res.status(400).json({ mensaje: "Longitud de cédula inválida" });
  }

  try {
    const datasend = {
      numerocuenta,
      usuarioId,
      dineroCuenta,
      status: "ACTIVO",
    };

    const sendd = await prisma.cuenta.create({
      data: datasend,
    });

    return res
      .status(201)
      .json({ mensaje: "Usuario creado exitosamente", respuesta: sendd }); // Código 201 para Created
  } catch (error) {
    console.error("Error al crear usuario:", error); // Log del error para depuración

    if (error.code === "P2002") {
      // Código de error de Prisma para Unique Constraint Violation
      return res
        .status(400)
        .json({ mensaje: "Ya existe un usuario con esa cédula o email" });
    }

    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message }); // Código 500 para Internal Server Error, mensaje del error para el log
  }
};
