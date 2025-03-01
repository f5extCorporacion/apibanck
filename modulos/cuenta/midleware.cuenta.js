import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

//GET trae los datos
export const GETcuentas = async (req, res, next) => {
  try {
    const userst = await prisma.cuenta.findMany({
      where: { status: "ACTIVO" },
      include: { usuario: true, transaccionesOrigen: true, transaccionesDestino: true, tarjeta: true },
    });
    return res.status(200).json({ cuentas: userst });
  } catch (error) {
    return res.status(200).json({ mensaje: "Error envio de datos" });
  }
};

export const GETcuenta = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ 
        error: 'ID de cuenta no válido',
        detalle: 'El ID debe ser un número'
      });
    }

    // Buscar la cuenta con sus transacciones y datos relacionados
    const cuenta = await prisma.cuenta.findUnique({
      where: { id: Number(id) },
      include: {
        usuario: {
          select: {
            name: true,
            email: true
          }
        },
        transaccionesOrigen: {
          orderBy: {
            created_at: 'desc'
          },
          take: 10
        },
        transaccionesDestino: {
          orderBy: {
            created_at: 'desc'
          },
          take: 10
        },
        tarjeta: true
      }
    });

    // Si la cuenta no existe
    if (!cuenta) {
      return res.status(404).json({ 
        error: 'Cuenta no encontrada',
        detalle: 'La cuenta especificada no existe en el sistema'
      });
    }

    // Formatear respuesta
    const response = {
      cuenta: {
        id: cuenta.id,
        numeroCuenta: cuenta.numerocuenta,
        saldo: cuenta.dineroCuenta,
        status: cuenta.status,
        fechaCreacion: cuenta.created_at,
        titular: {
          nombre: cuenta.usuario.name,
          email: cuenta.usuario.email
        }
      },
      tarjetas: cuenta.tarjeta,
      ultimasTransacciones: {
        enviadas: cuenta.transaccionesOrigen,
        recibidas: cuenta.transaccionesDestino
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error al obtener cuenta:', error);

    if (error.code === 'P2023') {
      return res.status(400).json({ 
        error: 'Error de formato',
        detalle: 'El formato del ID proporcionado no es válido'
      });
    }

    if (error.code === 'P2021') {
      return res.status(500).json({ 
        error: 'Error de base de datos',
        detalle: 'La tabla o modelo no existe'
      });
    }

    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalle: process.env.NODE_ENV === 'development' ? error.message : 'Contacte al administrador'
    });
  }
};

//POST Crea usuario
export const POSTcuenta = async (req, res, next) => {
  const { usuarioId, dineroCuenta } = req.body;
  // Validación de parámetros obligatorios
  if (!usuarioId || !dineroCuenta) {
    return res.status(400).json({
      mensaje: "Faltan parámetros obligatorios: usuarioId y dineroCuenta",
    });
  }
  // Validar que dineroCuenta sea un número válido
  const montoInicial = parseFloat(dineroCuenta);
  if (isNaN(montoInicial) || montoInicial < 0) {
    return res.status(400).json({
      mensaje: "El monto inicial debe ser un número válido y no negativo",
    });
  }
  try {
    // Verificar que el usuario existe
    const usuarioExistente = await prisma.users.findUnique({
      where: { id: Number(usuarioId) }
    });
    if (!usuarioExistente) {
      return res.status(404).json({
        mensaje: "El usuario especificado no existe"
    });
  }
  
  const datasend = {
    numerocuenta: AccountNumberGenerator.generate(),
    usuarioId: Number(usuarioId),
    dineroCuenta: montoInicial,
    status: "ACTIVO",
  };
  const sendd = await prisma.cuenta.create({
    data: datasend,
    include: {
      usuario: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return res.status(201).json({ 
    mensaje: "Cuenta creada exitosamente", 
    cuenta: {
      id: sendd.id,
      numeroCuenta: sendd.numerocuenta,
      saldo: sendd.dineroCuenta,
      titular: sendd.usuario.name,
      email: sendd.usuario.email,
      status: sendd.status,
      fechaCreacion: sendd.created_at
    }
  });
  } catch (error) {
    console.error("Error al crear cuenta:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ 
        mensaje: "Ya existe una cuenta con ese número" 
      });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ 
        mensaje: "Error de relación: El usuario especificado no existe" 
      });
    }
    return res.status(500).json({ 
      mensaje: "Error interno del servidor", 
      error: error.message 
    });
  };
}

// Account number generator service
const AccountNumberGenerator = {
  generate: () => {
    const length = Math.floor(Math.random() * 9) + 10;
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }
};