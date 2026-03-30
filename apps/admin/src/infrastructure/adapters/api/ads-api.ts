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

export interface FacebookAdManagerLink {
  businessId: string;
  adAccountId: string;
  accessToken: string;
}

export interface PromotablePost {
  postId: string;
  userId: string;
  caption: string;
  mediaUrl: string | null;
  createdAt: string;
}

export interface PromotedPost {
  id: string;
  postId: string;
  campaignId: string;
  accountId: string;
  audience: string;
  objective: "IMPRESSIONS" | "CLICKS" | "CONVERSIONS";
  dailyBudgetCents: number;
  totalBudgetCents: number | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  ctr: number;
  cvr: number;
  spendCents: number;
  clicks: number;
  conversions: number;
  impressions: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdPerformanceSummary {
  spendCents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    spendCents: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cvr: number;
  }>;
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
  return api.put<AdAccount>(`ads/accounts/${id}`, body);
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
  return api.put<AdCampaign>(`ads/campaigns/${id}`, body);
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
  return api.put<AdGroup>(`ads/groups/${id}`, body);
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
  return api.put<AdCreative>(`ads/creatives/${id}`, body);
}

export async function linkFacebookAdManager(body: FacebookAdManagerLink) {
  return api.post<{ linked: boolean; linkedAt: string }>("ads/integrations/facebook/link", body);
}

export async function getPromotablePosts(params?: { page?: number; limit?: number; search?: string }) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.search) search.set("search", params.search);
  const qs = search.toString();
  return api.get<Paginated<PromotablePost>>(`ads/promotions/posts${qs ? `?${qs}` : ""}`);
}

export async function getPromotedPosts(params?: { accountId?: string; status?: string; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.accountId) search.set("accountId", params.accountId);
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return api.get<Paginated<PromotedPost>>(`ads/promotions${qs ? `?${qs}` : ""}`);
}

export async function createPromotedPost(body: {
  postId: string;
  accountId: string;
  objective: "IMPRESSIONS" | "CLICKS" | "CONVERSIONS";
  audience: string;
  dailyBudgetCents: number;
  totalBudgetCents?: number | null;
}) {
  return api.post<PromotedPost>("ads/promotions", body);
}

export async function getAdPerformanceSummary(params?: { accountId?: string; from?: string; to?: string }) {
  const search = new URLSearchParams();
  if (params?.accountId) search.set("accountId", params.accountId);
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const qs = search.toString();
  return api.get<AdPerformanceSummary>(`ads/analytics/overview${qs ? `?${qs}` : ""}`);
}

