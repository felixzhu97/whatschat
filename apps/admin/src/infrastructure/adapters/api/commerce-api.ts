import { getApiClient } from "./api-client";

const api = getApiClient();

export interface Shop {
  id: string;
  name: string;
  currency: string;
  status: "ACTIVE" | "PAUSED";
  platform: "INSTAGRAM";
  productCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  title: string;
  priceCents: number;
  inventory: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  createdAt: string;
}

export interface ProductTag {
  id: string;
  postId: string;
  productId: string;
  productTitle: string;
  productUrl: string;
  position: string;
  mediaType: "POST" | "STORY";
  createdAt: string;
}

export interface Order {
  id: string;
  platform: "INSTAGRAM";
  externalOrderId: string;
  customerName: string;
  totalCents: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  ecommercePlatform: string;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export async function getShops(params?: { page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return api.get<Paginated<Shop>>(`commerce/shops${qs ? `?${qs}` : ""}`);
}

export async function createShop(body: { name: string; currency: string }) {
  return api.post<Shop>("commerce/shops", body);
}

export async function getProducts(params?: { shopId?: string; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.shopId) search.set("shopId", params.shopId);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return api.get<Paginated<Product>>(`commerce/products${qs ? `?${qs}` : ""}`);
}

export async function createProduct(body: {
  shopId: string;
  title: string;
  priceCents: number;
  inventory: number;
}) {
  return api.post<Product>("commerce/products", body);
}

export async function getProductTags(params?: { page?: number; limit?: number; mediaType?: string }) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.mediaType) search.set("mediaType", params.mediaType);
  const qs = search.toString();
  return api.get<Paginated<ProductTag>>(`commerce/product-tags${qs ? `?${qs}` : ""}`);
}

export async function createProductTag(body: {
  postId: string;
  productId: string;
  position: string;
  mediaType: "POST" | "STORY";
}) {
  return api.post<ProductTag>("commerce/product-tags", body);
}

export async function getOrders(params?: { status?: string; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return api.get<Paginated<Order>>(`commerce/orders${qs ? `?${qs}` : ""}`);
}
