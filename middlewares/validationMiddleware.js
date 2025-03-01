import { AccountValidator } from './validators/accountValidator.js';
import { CardValidator } from './validators/cardValidator.js';

export const validateAccountCreation = (req, res, next) => {
  const { usuarioId, dineroCuenta } = req.body;
  const validation = AccountValidator.validateCreateAccountData(usuarioId, dineroCuenta);
  
  if (!validation.isValid) {
    return res.status(400).json({
      error: "Error de validación",
      detalles: validation.errors
    });
  }
  
  req.validatedData = {
    ...req.body,
    dineroCuenta: validation.parsedAmount
  };
  next();
};

export const validateCardCreation = (req, res, next) => {
  const { numeroTarjeta, pin, dineroTarjeta, cv, cuentaId } = req.body;
  const validation = CardValidator.validateCreateCardData(
    numeroTarjeta, 
    pin, 
    dineroTarjeta, 
    cv, 
    cuentaId
  );
  
  if (!validation.isValid) {
    return res.status(400).json({
      error: "Error de validación",
      detalles: validation.errors
    });
  }
  
  req.validatedData = {
    ...req.body,
    dineroTarjeta: validation.parsedAmount
  };
  next();
};