/**
 * Validação de campos do checkout
 */

export const validateCustomerName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Nome é obrigatório' };
  }
  if (name.trim().length < 3) {
    return { valid: false, error: 'Nome deve ter no mínimo 3 caracteres' };
  }
  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'Telefone é obrigatório' };
  }
  
  // Remove non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 9 || digitsOnly.length > 15) {
    return { valid: false, error: 'Telefone inválido (9-15 dígitos)' };
  }
  
  return { valid: true };
};

export const validateEmail = (email: string, required: boolean = false): { valid: boolean; error?: string } => {
  if (!required && (!email || email.trim().length === 0)) {
    return { valid: true }; // Optional field
  }
  
  if (required && (!email || email.trim().length === 0)) {
    return { valid: false, error: 'Email é obrigatório' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Email inválido' };
  }
  
  return { valid: true };
};

export const validateDeliveryAddress = (address: string, orderType: 'delivery' | 'pickup'): { valid: boolean; error?: string } => {
  if (orderType === 'pickup') {
    return { valid: true }; // Not required for pickup
  }
  
  if (!address || address.trim().length === 0) {
    return { valid: false, error: 'Endereço de entrega é obrigatório' };
  }
  
  if (address.trim().length < 10) {
    return { valid: false, error: 'Endereço deve ser mais detalhado (mín. 10 caracteres)' };
  }
  
  return { valid: true };
};

export const validatePaymentMethod = (method: string): { valid: boolean; error?: string } => {
  if (!method || method.trim().length === 0) {
    return { valid: false, error: 'Forma de pagamento é obrigatória' };
  }
  
  const validMethods = ['cash', 'card', 'pix', 'mbway', 'multicaixa'];
  if (!validMethods.includes(method)) {
    return { valid: false, error: 'Forma de pagamento inválida' };
  }
  
  return { valid: true };
};

/**
 * Valida todos os campos do checkout de uma vez
 */
export const validateCheckoutForm = (data: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  orderType: 'delivery' | 'pickup';
  paymentMethod: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const nameValidation = validateCustomerName(data.customerName);
  if (!nameValidation.valid) errors.customerName = nameValidation.error!;
  
  const phoneValidation = validatePhone(data.customerPhone);
  if (!phoneValidation.valid) errors.customerPhone = phoneValidation.error!;
  
  if (data.customerEmail) {
    const emailValidation = validateEmail(data.customerEmail, false);
    if (!emailValidation.valid) errors.customerEmail = emailValidation.error!;
  }
  
  const addressValidation = validateDeliveryAddress(data.deliveryAddress || '', data.orderType);
  if (!addressValidation.valid) errors.deliveryAddress = addressValidation.error!;
  
  const paymentValidation = validatePaymentMethod(data.paymentMethod);
  if (!paymentValidation.valid) errors.paymentMethod = paymentValidation.error!;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
