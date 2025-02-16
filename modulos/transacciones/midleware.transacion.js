import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Transferencia entre cuentas
export const POSTtransaccion = async (req, res) => {
    try {
        const { numeroTarjetaOrigen, numeroTarjetaDestino, monto } = req.body;
        
        if(monto <= 0) return res.status(400).json({ error: "Monto inválido" });

        const result = await prisma.$transaction(async (tx) => {
            // Validar y bloquear cuentas
            const tarjetaOrigen = await tx.tarjeta.findUnique({
                where: { numeroTarjeta: numeroTarjetaOrigen },
                select: {
                  id: true,
                  dineroTarjeta: true, // Campo correcto en Tarjeta
                  cuentaId: true,
                  cuenta: { // Acceder a la relación con Cuenta
                    select: {
                      dineroCuenta: true // Campo correcto en Cuenta
                    }
                  }
                }
              });
            
            const tarjetaDestino = await tx.tarjeta.findUnique({
                where: { numeroTarjeta: numeroTarjetaDestino },
                select: {
                  id: true,
                  dineroTarjeta: true, // Campo correcto en Tarjeta
                  cuentaId: true,
                  cuenta: { // Acceder a la relación con Cuenta
                    select: {
                      dineroCuenta: true // Campo correcto en Cuenta
                    }
                  }
                }
              });

            if(!tarjetaOrigen || !tarjetaDestino) throw new Error('Tarjeta no encontrada');
            if(tarjetaOrigen.dineroTarjeta < monto) throw new Error('Fondos insuficientes');


            // Actualizar saldos
            await tx.cuenta.update({
                where: { id: tarjetaOrigen.cuentaId },
                data: { dineroCuenta: { decrement: monto } }
            });

            await tx.cuenta.update({
                where: { id: tarjetaDestino.cuentaId },
                data: { dineroCuenta: { increment: monto } }
            });

            await tx.tarjeta.update({
                where: { numeroTarjeta: numeroTarjetaOrigen },
                data: { dineroTarjeta: { decrement: monto } }
            });

            await tx.tarjeta.update({
                where: { numeroTarjeta: numeroTarjetaDestino },
                data: { dineroTarjeta: { increment: monto } }
            });

            // Registrar transacción
            return tx.transaccion.create({
                data: {
                monto,
                cuentaOrigenId: tarjetaOrigen.cuentaId,
                cuentaDestinoId: tarjetaDestino.cuentaId,
                tipo: 'TRANSFERENCIA',
                estado: 'COMPLETADA'
                }
            });
        });

        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    ;
}



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
