/**
 * Shared Calculation Utilities
 * 
 * Centralized calculation logic for orders, totals, and financial operations.
 * This ensures consistency across frontend and backend calculations.
 * 
 * Benefits:
 * - Single source of truth for calculations
 * - Consistent totals everywhere
 * - Easy to test and maintain
 * - Prevents calculation bugs
 */

import type { Order, OrderItem } from './schema';

/**
 * Calculate the total price of a single order
 * 
 * Priority:
 * 1. Use order.totalAmount if it exists and is > 0
 * 2. Calculate from orderItems as fallback
 * 
 * @param order - Order object with orderItems
 * @returns Total amount as number
 */
export const calculateOrderTotal = (order: Order & { orderItems?: any[] }): number => {
  // Priority 1: Use totalAmount if available
  if (order.totalAmount && parseFloat(order.totalAmount) > 0) {
    return parseFloat(order.totalAmount);
  }
  
  // Priority 2: Calculate from items
  if (!order.orderItems || order.orderItems.length === 0) {
    return 0;
  }
  
  const itemsTotal = order.orderItems.reduce((sum, item) => {
    // Handle different price field locations
    const price = parseFloat(
      item.price || 
      item.menuItem?.price || 
      '0'
    );
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);
  
  return itemsTotal;
};

/**
 * Calculate subtotal for a session (sum of all non-cancelled orders)
 * 
 * @param orders - Array of orders
 * @returns Subtotal as number
 */
export const calculateSessionSubtotal = (orders: Array<Order & { orderItems?: any[] }>): number => {
  return orders
    .filter(order => order.status !== 'cancelado')
    .reduce((sum, order) => sum + calculateOrderTotal(order), 0);
};

/**
 * Calculate total after applying discount
 * 
 * @param subtotal - Subtotal before discount
 * @param discount - Discount amount
 * @param discountType - 'valor' (fixed) or 'percentual' (percentage)
 * @returns Total after discount
 */
export const applyDiscount = (
  subtotal: number,
  discount: string | number,
  discountType: 'valor' | 'percentual'
): number => {
  const discountValue = typeof discount === 'string' ? parseFloat(discount) : discount;
  
  if (discountType === 'percentual') {
    return subtotal * (1 - discountValue / 100);
  }
  
  return Math.max(0, subtotal - discountValue);
};

/**
 * Calculate service charge
 * 
 * @param subtotal - Subtotal to apply service charge on
 * @param serviceCharge - Service charge amount
 * @param serviceChargeType - 'valor' (fixed) or 'percentual' (percentage)
 * @returns Service charge amount
 */
export const calculateServiceCharge = (
  subtotal: number,
  serviceCharge: string | number,
  serviceChargeType: 'valor' | 'percentual'
): number => {
  const chargeValue = typeof serviceCharge === 'string' ? parseFloat(serviceCharge) : serviceCharge;
  
  if (serviceChargeType === 'percentual') {
    return subtotal * (chargeValue / 100);
  }
  
  return chargeValue;
};

/**
 * Calculate final total with all adjustments
 * 
 * @param subtotal - Subtotal of all items
 * @param discount - Discount amount (optional)
 * @param discountType - Discount type (optional)
 * @param serviceCharge - Service charge amount (optional)
 * @param serviceChargeType - Service charge type (optional)
 * @param deliveryFee - Delivery fee (optional)
 * @param packagingFee - Packaging fee (optional)
 * @returns Final total amount
 */
export const calculateFinalTotal = (params: {
  subtotal: number;
  discount?: string | number;
  discountType?: 'valor' | 'percentual';
  serviceCharge?: string | number;
  serviceChargeType?: 'valor' | 'percentual';
  deliveryFee?: string | number;
  packagingFee?: string | number;
}): number => {
  let total = params.subtotal;
  
  // Apply discount
  if (params.discount && params.discountType) {
    total = applyDiscount(total, params.discount, params.discountType);
  }
  
  // Add service charge
  if (params.serviceCharge && params.serviceChargeType) {
    total += calculateServiceCharge(params.subtotal, params.serviceCharge, params.serviceChargeType);
  }
  
  // Add delivery fee
  if (params.deliveryFee) {
    total += typeof params.deliveryFee === 'string' 
      ? parseFloat(params.deliveryFee) 
      : params.deliveryFee;
  }
  
  // Add packaging fee
  if (params.packagingFee) {
    total += typeof params.packagingFee === 'string' 
      ? parseFloat(params.packagingFee) 
      : params.packagingFee;
  }
  
  return Math.max(0, total);
};

/**
 * Calculate guest subtotal (sum of their orders)
 * 
 * @param orders - Array of orders for this guest
 * @returns Subtotal as string (formatted to 2 decimals)
 */
export const calculateGuestSubtotal = (orders: Array<Order & { orderItems?: any[] }>): string => {
  const total = calculateSessionSubtotal(orders);
  return total.toFixed(2);
};

/**
 * Calculate remaining balance
 * 
 * @param totalAmount - Total amount to pay
 * @param paidAmount - Amount already paid
 * @returns Remaining balance
 */
export const calculateRemainingBalance = (
  totalAmount: string | number,
  paidAmount: string | number
): number => {
  const total = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
  const paid = typeof paidAmount === 'string' ? parseFloat(paidAmount) : paidAmount;
  return Math.max(0, total - paid);
};

/**
 * Calculate change to return to customer
 * 
 * @param totalAmount - Total amount to pay
 * @param receivedAmount - Amount received from customer
 * @returns Change to return (0 if received less than total)
 */
export const calculateChange = (
  totalAmount: string | number,
  receivedAmount: string | number
): number => {
  const total = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
  const received = typeof receivedAmount === 'string' ? parseFloat(receivedAmount) : receivedAmount;
  return Math.max(0, received - total);
};

/**
 * Format number to currency string (2 decimal places)
 * 
 * @param value - Number to format
 * @returns Formatted string
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toFixed(2);
};

/**
 * Calculate percentage
 * 
 * @param value - Value to calculate percentage of
 * @param percentage - Percentage (e.g., 10 for 10%)
 * @returns Calculated amount
 */
export const calculatePercentage = (value: number, percentage: number): number => {
  return value * (percentage / 100);
};

/**
 * Split amount equally among n people
 * 
 * @param totalAmount - Total amount to split
 * @param numberOfPeople - Number of people to split among
 * @returns Amount per person
 */
export const splitEqually = (totalAmount: number, numberOfPeople: number): number => {
  if (numberOfPeople <= 0) return 0;
  return totalAmount / numberOfPeople;
};

/**
 * Calculate tip amount
 * 
 * @param subtotal - Subtotal before tip
 * @param tipPercentage - Tip percentage (e.g., 10 for 10%)
 * @returns Tip amount
 */
export const calculateTip = (subtotal: number, tipPercentage: number): number => {
  return calculatePercentage(subtotal, tipPercentage);
};
