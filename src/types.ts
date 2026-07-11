// Product types
export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: 'simple' | 'grouped' | 'external' | 'variable';
  status: 'draft' | 'pending' | 'private' | 'publish';
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; name: string; alt: string }[];
  attributes: { id: number; name: string; position: number; visible: boolean; variation: boolean; options: string[] }[];
  default_attributes: { id: number; name: string; option: string }[];
  variations: number[];
  grouped_products: number[];
  meta_data: { id: number; key: string; value: unknown }[];
  date_created: string;
  date_modified: string;
  _links: Record<string, { href: string }[]>;
}

// Order types
export interface WooOrder {
  id: number;
  number: string;
  order_key: string;
  status: string;
  currency: string;
  total: string;
  subtotal: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_note: string;
  billing: WooAddress;
  shipping: WooAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_created: string;
  date_modified: string;
  line_items: WooLineItem[];
  shipping_lines: WooShippingLine[];
  tax_lines: WooTaxLine[];
  fee_lines: WooFeeLine[];
  coupon_lines: WooCouponLine[];
  refunds: { id: number; total: string }[];
  meta_data: { id: number; key: string; value: unknown }[];
}

export interface WooAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WooLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  price: string;
  subtotal: string;
  total: string;
  meta_data: { id: number; key: string; value: unknown }[];
}

export interface WooShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  total: string;
  meta_data: { id: number; key: string; value: unknown }[];
}

export interface WooTaxLine {
  id: number;
  rate_code: string;
  rate_id: number;
  label: string;
  compound: boolean;
  tax_total: string;
  shipping_tax_total: string;
  meta_data: { id: number; key: string; value: unknown }[];
}

export interface WooFeeLine {
  id: number;
  name: string;
  total: string;
  meta_data: { id: number; key: string; value: unknown }[];
}

export interface WooCouponLine {
  id: number;
  code: string;
  discount: string;
  discount_tax: string;
  meta_data: { id: number; key: string; value: unknown }[];
}

// Customer
export interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: Partial<WooAddress>;
  shipping: Partial<WooAddress>;
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: { id: number; key: string; value: unknown }[];
  date_created: string;
  date_modified: string;
}

// Coupon
export interface WooCoupon {
  id: number;
  code: string;
  amount: string;
  date_created: string;
  date_modified: string;
  discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
  description: string;
  date_expires: string | null;
  usage_count: number;
  individual_use: boolean;
  product_ids: number[];
  excluded_product_ids: number[];
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  limit_usage_to_x_items: number | null;
  free_shipping: boolean;
  product_categories: number[];
  excluded_product_categories: number[];
  exclude_sale_items: boolean;
  minimum_amount: string;
  maximum_amount: string;
  email_restrictions: string[];
  used_by: string[];
  meta_data: { id: number; key: string; value: unknown }[];
}

// Shipping Zone
export interface WooShippingZone {
  id: number;
  name: string;
  order: number;
  slug: string;
}

export interface WooShippingMethod {
  id: number;
  method_id: string;
  title: string;
  order: number;
  enabled: boolean;
  settings: Record<string, unknown>;
}

// Tax Rate
export interface WooTaxRate {
  id: number;
  country: string;
  state: string;
  postcode: string;
  city: string;
  postcodes: string[];
  cities: string[];
  rate: string;
  name: string;
  priority: number;
  compound: boolean;
  shipping: boolean;
  order: number;
  class: string;
}

// Pagination info in response headers
export interface PaginationInfo {
  total: number;
  totalPages: number;
}

// Helper to extract pagination from WooCommerce API headers
export function extractPagination(headers: Record<string, string | string[] | undefined>): PaginationInfo {
  return {
    total: parseInt(String(headers['x-wp-total'] || '0'), 10),
    totalPages: parseInt(String(headers['x-wp-totalpages'] || '0'), 10),
  };
}
