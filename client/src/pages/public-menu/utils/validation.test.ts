import { describe, it, expect } from 'vitest';
import {
  validateCustomerName,
  validatePhone,
  validateEmail,
  validateDeliveryAddress,
  validatePaymentMethod,
  validateCheckoutForm,
} from './validation';

describe('validation utils', () => {
  describe('validateCustomerName', () => {
    it('deve aceitar nome válido', () => {
      const result = validateCustomerName('João Silva');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve rejeitar nome vazio', () => {
      const result = validateCustomerName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Nome é obrigatório');
    });

    it('deve rejeitar nome muito curto', () => {
      const result = validateCustomerName('Jo');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Nome deve ter no mínimo 3 caracteres');
    });

    it('deve aceitar nome com 3 caracteres', () => {
      const result = validateCustomerName('Ana');
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('deve aceitar telefone válido angolano', () => {
      const result = validatePhone('244900000000');
      expect(result.valid).toBe(true);
    });

    it('deve aceitar telefone formatado', () => {
      const result = validatePhone('+244 900 000 000');
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar telefone vazio', () => {
      const result = validatePhone('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Telefone é obrigatório');
    });

    it('deve rejeitar telefone muito curto', () => {
      const result = validatePhone('12345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Telefone inválido (9-15 dígitos)');
    });

    it('deve rejeitar telefone muito longo', () => {
      const result = validatePhone('1234567890123456');
      expect(result.valid).toBe(false);
    });

    it('deve aceitar telefone com 9 dígitos', () => {
      const result = validatePhone('900000000');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('deve aceitar email válido', () => {
      const result = validateEmail('user@example.com');
      expect(result.valid).toBe(true);
    });

    it('deve aceitar email vazio quando não obrigatório', () => {
      const result = validateEmail('', false);
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar email vazio quando obrigatório', () => {
      const result = validateEmail('', true);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email é obrigatório');
    });

    it('deve rejeitar email inválido', () => {
      const result = validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email inválido');
    });

    it('deve rejeitar email sem @', () => {
      const result = validateEmail('userexample.com');
      expect(result.valid).toBe(false);
    });

    it('deve rejeitar email sem domínio', () => {
      const result = validateEmail('user@');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDeliveryAddress', () => {
    it('deve aceitar endereço válido para delivery', () => {
      const result = validateDeliveryAddress('Rua das Flores, 123, Luanda', 'delivery');
      expect(result.valid).toBe(true);
    });

    it('deve não exigir endereço para pickup', () => {
      const result = validateDeliveryAddress('', 'pickup');
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar endereço vazio para delivery', () => {
      const result = validateDeliveryAddress('', 'delivery');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Endereço de entrega é obrigatório');
    });

    it('deve rejeitar endereço muito curto', () => {
      const result = validateDeliveryAddress('Rua 1', 'delivery');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Endereço deve ser mais detalhado (mín. 10 caracteres)');
    });

    it('deve aceitar endereço com exatamente 10 caracteres', () => {
      const result = validateDeliveryAddress('Rua ABC 12', 'delivery');
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePaymentMethod', () => {
    it('deve aceitar métodos válidos', () => {
      expect(validatePaymentMethod('cash').valid).toBe(true);
      expect(validatePaymentMethod('card').valid).toBe(true);
      expect(validatePaymentMethod('pix').valid).toBe(true);
      expect(validatePaymentMethod('mbway').valid).toBe(true);
      expect(validatePaymentMethod('multicaixa').valid).toBe(true);
    });

    it('deve rejeitar método vazio', () => {
      const result = validatePaymentMethod('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Forma de pagamento é obrigatória');
    });

    it('deve rejeitar método inválido', () => {
      const result = validatePaymentMethod('crypto');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Forma de pagamento inválida');
    });
  });

  describe('validateCheckoutForm', () => {
    it('deve validar formulário completo válido', () => {
      const data = {
        customerName: 'João Silva',
        customerPhone: '244900000000',
        customerEmail: 'joao@example.com',
        deliveryAddress: 'Rua das Flores, 123, Luanda',
        orderType: 'delivery' as const,
        paymentMethod: 'cash',
      };

      const result = validateCheckoutForm(data);

      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('deve validar formulário de pickup', () => {
      const data = {
        customerName: 'João Silva',
        customerPhone: '244900000000',
        orderType: 'pickup' as const,
        paymentMethod: 'card',
      };

      const result = validateCheckoutForm(data);

      expect(result.valid).toBe(true);
    });

    it('deve retornar múltiplos erros', () => {
      const data = {
        customerName: 'Jo', // Muito curto
        customerPhone: '123', // Inválido
        customerEmail: 'invalid', // Inválido
        deliveryAddress: 'Rua', // Muito curto
        orderType: 'delivery' as const,
        paymentMethod: '', // Vazio
      };

      const result = validateCheckoutForm(data);

      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
      expect(result.errors.customerName).toBeDefined();
      expect(result.errors.customerPhone).toBeDefined();
      expect(result.errors.customerEmail).toBeDefined();
      expect(result.errors.deliveryAddress).toBeDefined();
      expect(result.errors.paymentMethod).toBeDefined();
    });

    it('deve validar apenas campos obrigatórios para pickup', () => {
      const data = {
        customerName: 'João Silva',
        customerPhone: '244900000000',
        orderType: 'pickup' as const,
        paymentMethod: 'cash',
      };

      const result = validateCheckoutForm(data);

      expect(result.valid).toBe(true);
      expect(result.errors.deliveryAddress).toBeUndefined();
    });
  });
});
