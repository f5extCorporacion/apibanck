export const AccountValidator = {
  validateCreateAccountData: (usuarioId, dineroCuenta) => {
    const errors = [];

    if (!usuarioId) errors.push("ID de usuario es requerido");
    
    if (!dineroCuenta) {
      errors.push("Monto inicial es requerido");
    } else {
      const montoInicial = parseFloat(dineroCuenta);
      if (isNaN(montoInicial) || montoInicial < 0) {
        errors.push("El monto inicial debe ser un número válido y no negativo");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      parsedAmount: parseFloat(dineroCuenta)
    };
  }
};