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
                select: { id: true, dineroCuenta: true, cuentaId: true }
            });

            console.log(tarjetaOrigen)
            
            const tarjetaDestino = await tx.tarjeta.findUnique({
                where: { numeroTarjeta: numeroTarjetaDestino },
                select: { id: true, dineroCuenta: true, cuentaId: true }
            });

            console.log(tarjetaDestino)

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
};



// Historial de transacciones
export const GEThistorialTransacciones = async (req, res) => {
    try {
        const usuarioId = req.user.id; // Asumiendo autenticación
        const { fechaInicio, fechaFin, limite = 10, pagina = 1 } = req.query;
        
        const where = {
            OR: [
                { cuentaOrigen: { usuarioId } },
                { cuentaDestino: { usuarioId } }
            ],
            fecha: {
                gte: fechaInicio ? new Date(fechaInicio) : undefined,
                lte: fechaFin ? new Date(fechaFin) : undefined
            }
        };

        const transacciones = await prisma.transaccion.findMany({
            where,
            orderBy: { fecha: 'desc' },
            skip: (pagina - 1) * limite,
            take: parseInt(limite),
            include: {
                cuentaOrigen: { select: { numeroTarjeta: true } },
                cuentaDestino: { select: { numeroTarjeta: true } }
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
        res.status(500).json({ error: error.message });
    }
};
