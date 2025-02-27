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
    if (!numeroTarjeta || !pin || !dineroTarjeta || !cv || !cuentaId) {
      return res.status(400).json({
        mensaje: "Faltan parámetros obligatorios ",
      }); // Código 400 para Bad Request
    }
    // Validar existencia de la cuenta
    const cuentaExistente = await prisma.cuenta.findUnique({
      where: { id: cuentaId }
    });

    if (!cuentaExistente) {
      return res.status(400).json({ error: "La cuenta especificada no existe" });
    }

    const datasend = {
      numeroTarjeta,
      pin,
      dineroTarjeta: parseFloat(dineroTarjeta),
      cv,
      cuentaId,
      status: "ACTIVO"
    };

    const sendd = await prisma.tarjeta.create({
      data: datasend
    });

    res.json({ mensaje: "Tarjeta creada exitosamente", tarjeta: sendd });
    
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