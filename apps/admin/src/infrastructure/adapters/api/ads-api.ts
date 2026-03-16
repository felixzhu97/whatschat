import { getApiClient } from "./api-client";

const api = getApiClient();

export interface AdAccount {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  status: "ACTIVE" | "PAUSED" | "DISABLED";
  dailyBudgetCents: number | null;
  totalBudgetCents: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdCampaign {
  id: string;
  accountId: string;
  name: string;
  objective: "IMPRESSIONS" | "CLICKS" | "CONVERSIONS";
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  dailyBudgetCents: number | null;
  totalBudgetCents: number | null;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdGroup {
  id: string;
  campaignId: string;
  name: string;
  bidCents: number;
  billingEvent: "IMPRESSION" | "CLICK" | "CONVERSION";
  placement: "FEED" | "STORY" | "REELS" | "BANNER";
  status: "ACTIVE" | "PAUSED";
  targeting: unknown | null;
  maxImpressionsPerUser: number | null;
  maxImpressionsPerUserPerDay: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdCreative {
  id: string;
  campaignId: string;
  groupId: string | null;
  type: string;
  title: string | null;
  body: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  landingUrl: string | null;
  language: string | null;
  createdAt: string;
  updatedAt: string;
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

export async function getAdAccounts(params?: { status?: string; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const res = await api.get<Paginated<AdAccount>>(`ads/accounts${qs ? `?${qs}` : ""}`);
  return res;
}

export async function createAdAccount(body: {
  name: string;
  timezone?: string;
  currency?: string;
  status?: string;
  dailyBudgetCents?: number | null;
  totalBudgetCents?: number | null;
}) {
  return api.post<AdAccount>("ads/accounts", body);
}

export async function updateAdAccount(id: string, body: Partial<{
  name: string;
  timezone: string;
  currency: string;
  status: string;
  dailyBudgetCents: number | null;
  totalBudgetCents: number | null;
}>) {
  return api.patch<AdAccount>(`ads/accounts/${id}`, body);
}

export async function getAdCampaigns(params?: { accountId?: string; status?: string; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.accountId) search.set("accountId", params.accountId);
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const res = await api.get<Paginated<AdCampaign>>(`ads/campaigns${qs ? `?${qs}` : ""}`);
  return res;
}

export async function createAdCampaign(body: {
  accountId: string;
  name: string;
  objective?: string;
  status?: string;
  dailyBudgetCents?: number | null;
  totalBudgetCents?: number | null;
  startAt?: string | null;
  endAt?: string | null;
}) {
  return api.post<AdCampaign>("ads/campaigns", body);
}

export async function updateAdCampaign(id: string, body: Partial<{
  name: string;
  objective: string;
  status: string;
  dailyBudgetCents: number | null;
  totalBudgetCents: number | null;
  startAt: string | null;
  endAt: string | null;
}>) {
  return api.patch<AdCampaign>(`ads/campaigns/${id}`, body);
}

export async function getAdGroups(params?: { campaignId?: string; placement?: string; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.campaignId) search.set("campaignId", params.campaignId);
  if (params?.placement) search.set("placement", params.placement);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const res = await api.get<Paginated<AdGroup>>(`ads/groups${qs ? `?${qs}` : ""}`);
  return res;
}

export async function createAdGroup(body: {
  campaignId: string;
  name: string;
  bidCents: number;
  billingEvent: string;
  placement: string;
  status?: string;
  targeting?: unknown;
  maxImpressionsPerUser?: number | null;
  maxImpressionsPerUserPerDay?: number | null;
}) {
  return api.post<AdGroup>("ads/groups", body);
}

export async function updateAdGroup(id: string, body: Partial<{
  name: string;
  bidCents: number;
  billingEvent: string;
  placement: string;
  status: string;
  targeting: unknown;
  maxImpressionsPerUser: number | null;
  maxImpressionsPerUserPerDay: number | null;
}>) {
  return api.patch<AdGroup>(`ads/groups/${id}`, body);
}

export async function getAdCreatives(params?: { campaignId?: string; groupId?: string; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.campaignId) search.set("campaignId", params.campaignId);
  if (params?.groupId) search.set("groupId", params.groupId);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const res = await api.get<Paginated<AdCreative>>(`ads/creatives${qs ? `?${qs}` : ""}`);
  return res;
}

export async function createAdCreative(body: {
  campaignId: string;
  groupId?: string | null;
  type: string;
  title?: string | null;
  body?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  landingUrl?: string | null;
  language?: string | null;
}) {
  return api.post<AdCreative>("ads/creatives", body);
}

export async function updateAdCreative(id: string, body: Partial<{
  groupId: string | null;
  type: string;
  title: string | null;
  body: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  landingUrl: string | null;
  language: string | null;
}>) {
  return api.patch<AdCreative>(`ads/creatives/${id}`, body);
}

