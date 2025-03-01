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
export const POSTtarjetas = async (req, res) => {
  try {
    const { numeroTarjeta, pin, dineroTarjeta, cv, cuentaId } = req.body;

    // Validación de parámetros (más robusta)
    if (!numeroTarjeta || !pin || !cv || !cuentaId) {
      return res.status(400).json({
        mensaje: "Faltan parámetros obligatorios: numeroTarjeta, pin, cv, cuentaId",
      });
    }

    // Validar y convertir dineroTarjeta
    const saldoInicial = dineroTarjeta ? parseFloat(dineroTarjeta) : 0;
    if (isNaN(saldoInicial) || saldoInicial < 0) {
      return res.status(400).json({
        mensaje: "El saldo inicial debe ser un número válido y no negativo",
      });
    }

    // Validar existencia de la cuenta y su saldo
    const cuentaExistente = await prisma.cuenta.findUnique({
      where: { id: Number(cuentaId) }
    });

    if (!cuentaExistente) {
      return res.status(400).json({ error: "La cuenta especificada no existe" });
    }

    if (saldoInicial > cuentaExistente.dineroCuenta) {
      return res.status(400).json({ 
        error: "El saldo inicial de la tarjeta no puede ser mayor al saldo de la cuenta" 
      });
    }

    const datasend = {
      numeroTarjeta,
      pin,
      dineroTarjeta: saldoInicial,
      cv,
      cuentaId: Number(cuentaId),
      status: "ACTIVO"
    };

    // Crear tarjeta y actualizar saldo de la cuenta en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const tarjeta = await tx.tarjeta.create({
        data: datasend
      });

      if (saldoInicial > 0) {
        await tx.cuenta.update({
          where: { id: Number(cuentaId) },
          data: {
            dineroCuenta: {
              decrement: saldoInicial
            }
          }
        });
      }

      return tarjeta;
    });

    res.json({ 
      mensaje: "Tarjeta creada exitosamente", 
      tarjeta: result,
      saldoCuenta: cuentaExistente.dineroCuenta - saldoInicial
    });
    
  } catch (error) {
    console.error("Error al crear tarjeta:", error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: "Error de relación: Verifique que la cuenta exista" 
      });
    }
    
    res.status(500).json({ 
      error: "Error interno del servidor", 
      detalle: error.message 
    });
  }
};

// Obtener nombre por tarjeta
export const GETTitularTarjeta = async (req, res) => {
  try {
    const { numeroTarjeta } = req.params;
    
    const tarjeta = await prisma.tarjeta.findUnique({
      where: { 
        numeroTarjeta: numeroTarjeta 
      },
      include: {
        cuenta: {
          include: {
            usuario: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    if (!tarjeta.cuenta || !tarjeta.cuenta.usuario) {
      return res.status(404).json({ error: 'Información del titular no disponible' });
    }

    res.json({ 
      titular: tarjeta.cuenta.usuario.name,
      numeroTarjeta: tarjeta.numeroTarjeta
    });

  } catch (error) {
    console.error('Error al buscar titular:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};