import type { MenuItem } from '@shared/schema';

/**
 * Calcula o preço de um item, incluindo desconto e percentual
 */
export const calculateItemPrice = (item: MenuItem) => {
  const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
  const originalPrice = item.originalPrice 
    ? (typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice) : item.originalPrice) 
    : price;
  
  const discountPercent = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  
  return { 
    price, 
    originalPrice, 
    discountPercent, 
    hasPromo: discountPercent > 0 
  };
};

/**
 * Formata valores para exibição
 */
export const formatItemPrice = (item: MenuItem) => {
  const { price, originalPrice, hasPromo } = calculateItemPrice(item);
  
  return {
    priceFormatted: price.toFixed(2),
    originalPriceFormatted: originalPrice.toFixed(2),
    hasPromo
  };
};

/**
 * Calcula o preço total de um item com opções
 */
export const calculateItemTotal = (
  basePrice: number | string, 
  selectedOptions: Array<{ priceAdjustment: string | number }>
) => {
  const price = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
  const optionsTotal = selectedOptions.reduce((sum, opt) => {
    const adjustment = typeof opt.priceAdjustment === 'string' 
      ? parseFloat(opt.priceAdjustment) 
      : opt.priceAdjustment;
    return sum + adjustment;
  }, 0);
  
  return price + optionsTotal;
};
