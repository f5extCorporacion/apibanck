export const CardValidator = {
  validateCreateCardData: (numeroTarjeta, pin, dineroTarjeta, cv, cuentaId) => {
    const errors = [];

    if (!numeroTarjeta) {
      errors.push("Número de tarjeta es requerido");
    } else if (!/^\d{16}$/.test(numeroTarjeta)) {
      errors.push("Número de tarjeta debe tener 16 dígitos");
    }

    if (!pin) {
      errors.push("PIN es requerido");
    } else if (!/^\d{4}$/.test(pin)) {
      errors.push("PIN debe tener 4 dígitos");
    }

    if (!cv) {
      errors.push("CV es requerido");
    } else if (!/^\d{3,4}$/.test(cv)) {
      errors.push("CV debe tener 3 o 4 dígitos");
    }

    if (!cuentaId) {
      errors.push("ID de cuenta es requerido");
    }

    let parsedAmount = 0;
    if (dineroTarjeta) {
      parsedAmount = parseFloat(dineroTarjeta);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        errors.push("El monto inicial debe ser un número válido y no negativo");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      parsedAmount
    };
  }
};