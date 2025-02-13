import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

//GET trae los datos
export const GETtarjetas = async (req, res, next) => {
  try {
    const userst = await prisma.tarjeta.findMany({
      where: { status: "ACTIVO" },
      include: { cuenta: true },
    });
    return res.status(200).json({ tarjeta: userst });
  } catch (error) {
    return res.status(200).json({ mensaje: "Error envio de datos" });
  }
};
// POST Crea usuario
export const POSTtarjetas = async (req, res, next) => {
  const { numeroTarjeta, pin, dineroTarjeta, cv, cuentaId } = req.body;

  // Validación de parámetros (más robusta)
  if (!numeroTarjeta || !pin || !dineroTarjeta || !cv || !cuentaId) {
    return res.status(400).json({ mensaje: "Faltan parámetros obligatorios" });
  }

  // Validación de longitud del número de tarjeta
  if (typeof numeroTarjeta !== "string" || numeroTarjeta.length !== 16) {
    return res
      .status(400)
      .json({ mensaje: "El número de tarjeta debe tener 16 dígitos" });
  }

  // Validación de longitud del CVV
  if (typeof cv !== "string" || cv.length !== 4) {
    return res.status(400).json({ mensaje: "El CVV debe tener 4 dígitos" });
  }

  // Validación de longitud del PIN
  if (typeof pin !== "string" || pin.length !== 4) {
    return res.status(400).json({ mensaje: "El PIN debe tener 4 dígitos" });
  }

  try {
    const datasend = {
      numeroTarjeta: numeroTarjeta,
      pin: pin,
      dineroTarjeta: dineroTarjeta, // Convertir a número si es necesario
      cv: cv,
      cuentaId: cuentaId,
      status: "ACTIVO",
    };

    const tarjetaCreada = await prisma.tarjeta.create({
      data: datasend,
    });

    return res.status(201).json({
      mensaje: "Tarjeta creada exitosamente",
      respuesta: tarjetaCreada,
    });
  } catch (error) {
    console.error("Error al crear tarjeta:", error);

    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ mensaje: "Ya existe una tarjeta con ese número" });
    }

    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};
