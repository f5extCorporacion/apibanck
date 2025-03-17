import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Transferencia entre cuentas
// Transaction validator service
const TransactionValidator = {
  validateTransactionData: (numeroTarjetaOrigen, numeroTarjetaDestino, monto) => {
    const errors = [];

    if (!numeroTarjetaOrigen) errors.push("Tarjeta origen es requerida");
    if (!numeroTarjetaDestino) errors.push("Tarjeta destino es requerida");
    if (!monto) errors.push("Monto es requerido");

    const montoValue = parseFloat(monto);
    if (isNaN(montoValue) || montoValue <= 0) {
      errors.push("El monto debe ser un número válido mayor a 0");
    }

    if (numeroTarjetaOrigen === numeroTarjetaDestino) {
      errors.push("No se puede transferir a la misma tarjeta");
    }

    return {
      isValid: errors.length === 0,
      errors,
      parsedAmount: montoValue
    };
  }
};

// Transaction repository service
const TransactionRepository = {
  async findCard(tx, numeroTarjeta) {
    return await tx.tarjeta.findUnique({
      where: { numeroTarjeta },
      select: {
        id: true,
        numeroTarjeta: true, // Add this line to include the card number
        dineroTarjeta: true,
        cuentaId: true,
        status: true,
        cuenta: {
          select: {
            dineroCuenta: true,
            status: true
          }
        }
      }
    });
  },

  async updateBalances(tx, { origen, destino, monto }) {
    // Update account balances
    await tx.cuenta.update({
      where: { id: origen.cuentaId },
      data: { dineroCuenta: { decrement: monto } }
    });

    await tx.cuenta.update({
      where: { id: destino.cuentaId },
      data: { dineroCuenta: { increment: monto } }
    });

    // Update card balances - ensure numeroTarjeta is available
    await tx.tarjeta.update({
      where: { numeroTarjeta: origen.numeroTarjeta },
      data: { dineroTarjeta: { decrement: monto } }
    });

    await tx.tarjeta.update({
      where: { numeroTarjeta: destino.numeroTarjeta },
      data: { dineroTarjeta: { increment: monto } }
    });
  },

  async createTransactionRecord(tx, { origen, destino, monto }) {
    return await tx.transaccion.create({
      data: {
        monto,
        cuentaOrigenId: origen.cuentaId,
        cuentaDestinoId: destino.cuentaId,
        tipo: 'TRANSFERENCIA',
        estado: 'COMPLETADA',
        fecha: new Date()
      },
      include: {
        cuentaOrigen: {
          select: { numerocuenta: true }
        },
        cuentaDestino: {
          select: { numerocuenta: true }
        }
      }
    });
  }
};

export const POSTtransaccion = async (req, res) => {
  try {
    const { numeroTarjetaOrigen, numeroTarjetaDestino, monto } = req.body;

    // Validate input data
    const validation = TransactionValidator.validateTransactionData(
      numeroTarjetaOrigen, 
      numeroTarjetaDestino, 
      monto
    );

    if (!validation.isValid) {
      return res.status(400).json({
        error: "Error de validación",
        detalles: validation.errors
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get cards information
      const tarjetaOrigen = await TransactionRepository.findCard(tx, numeroTarjetaOrigen);
      const tarjetaDestino = await TransactionRepository.findCard(tx, numeroTarjetaDestino);

      // Validate cards existence and status
      if (!tarjetaOrigen || !tarjetaDestino) {
        throw new Error('Una o ambas tarjetas no fueron encontradas');
      }

      if (tarjetaOrigen.status !== 'ACTIVO' || tarjetaDestino.status !== 'ACTIVO') {
        throw new Error('Una o ambas tarjetas están inactivas');
      }

      if (tarjetaOrigen.cuenta.status !== 'ACTIVO' || tarjetaDestino.cuenta.status !== 'ACTIVO') {
        throw new Error('Una o ambas cuentas están inactivas');
      }

      // Validate sufficient funds
      if (tarjetaOrigen.dineroTarjeta < validation.parsedAmount) {
        throw new Error('Fondos insuficientes en la tarjeta');
      }

      // Process transaction
      await TransactionRepository.updateBalances(tx, {
        origen: tarjetaOrigen,
        destino: tarjetaDestino,
        monto: validation.parsedAmount
      });

      // Create transaction record
      return await TransactionRepository.createTransactionRecord(tx, {
        origen: tarjetaOrigen,
        destino: tarjetaDestino,
        monto: validation.parsedAmount
      });
    });

    // Format successful response
    res.status(200).json({
      mensaje: "Transferencia realizada exitosamente",
      transaccion: {
        id: result.id,
        monto: result.monto,
        fecha: result.fecha,
        tipo: result.tipo,
        estado: result.estado,
        cuentaOrigen: result.cuentaOrigen.numerocuenta,
        cuentaDestino: result.cuentaDestino.numerocuenta
      }
    });

  } catch (error) {
    console.error("Error en la transacción:", error);
    
    // Handle specific error cases
    const errorResponse = {
      status: 400,
      mensaje: error.message
    };

    if (error.code === 'P2025') {
      errorResponse.status = 404;
      errorResponse.mensaje = 'Recurso no encontrado';
    } else if (error.code === 'P2002') {
      errorResponse.status = 409;
      errorResponse.mensaje = 'Conflicto en la operación';
    } else if (!error.code) {
      errorResponse.status = 400;
    } else {
      errorResponse.status = 500;
      errorResponse.mensaje = 'Error interno del servidor';
    }

    res.status(errorResponse.status).json({ 
      error: errorResponse.mensaje,
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// Historial de transacciones
export const GEThistorialTransacciones = async (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);
        const { fechaInicio, fechaFin, limite = 10, pagina = 1 } = req.query;

        // Establecer fechas predeterminadas si no se proporcionan
        const hoy = new Date();
        const dosMesesAtras = new Date();
        dosMesesAtras.setMonth(hoy.getMonth() - 2);

        const fechaInicioDefault = fechaInicio ? new Date(fechaInicio) : dosMesesAtras;
        const fechaFinDefault = fechaFin ? new Date(fechaFin) : hoy;

        console.log('Parámetros recibidos:', { usuarioId, fechaInicio, fechaFin, limite, pagina });

        const where = {
            OR: [
                { cuentaOrigen: { usuarioId } },
                { cuentaDestino: { usuarioId } }
            ],
            fecha: {
                gte: fechaInicioDefault,
                lte: fechaFinDefault
            }
        };

        console.log('Consulta generada:', { where, skip: (pagina - 1) * limite, take: parseInt(limite) });

        // Simplificar la consulta para depurar
        const transacciones = await prisma.transaccion.findMany({
            where: {
                OR: [
                    { cuentaOrigen: { usuarioId } },
                    { cuentaDestino: { usuarioId } }
                ]
            },
            orderBy: { fecha: 'desc' },
            skip: (pagina - 1) * limite,
            take: parseInt(limite),
            include: {
                cuentaOrigen: { select: { numerocuenta: true } },
                cuentaDestino: { select: { numerocuenta: true } }
            }
        });

        console.log('Transacciones encontradas:', transacciones);

        const total = await prisma.transaccion.count({ where });

        res.json({
            total,
            paginas: Math.ceil(total / limite),
            actual: parseInt(pagina),
            transacciones
        });
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).json({ error: error.message });
    }
}

// Obtener todas las transacciones del sistema
export const GETallTransacciones = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, limite = 10, pagina = 1 } = req.query;

        // Establecer fechas predeterminadas si no se proporcionan
        const hoy = new Date();
        const dosMesesAtras = new Date();
        dosMesesAtras.setMonth(hoy.getMonth() - 2);

        const fechaInicioDefault = fechaInicio ? new Date(fechaInicio) : dosMesesAtras;
        const fechaFinDefault = fechaFin ? new Date(fechaFin) : hoy;

        const where = {
            fecha: {
                gte: fechaInicioDefault,
                lte: fechaFinDefault
            }
        };

        // Obtener todas las transacciones con paginación
        const transacciones = await prisma.transaccion.findMany({
            where,
            orderBy: { fecha: 'desc' },
            skip: (pagina - 1) * parseInt(limite),
            take: parseInt(limite),
            include: {
                cuentaOrigen: { 
                    select: { 
                        numerocuenta: true,
                        usuario: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    } 
                },
                cuentaDestino: { 
                    select: { 
                        numerocuenta: true,
                        usuario: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    } 
                }
            }
        });

        const total = await prisma.transaccion.count({ where });

        res.json({
            total,
            paginas: Math.ceil(total / limite),
            actual: parseInt(pagina),
            transacciones
        });
    } catch (error) {
        console.error('Error al obtener todas las transacciones:', error);
        res.status(500).json({ 
            error: 'Error al obtener las transacciones',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
