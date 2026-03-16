"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import {
  getAdAccounts,
  getAdCampaigns,
  createAdAccount,
  createAdCampaign,
  type AdAccount,
  type AdCampaign,
} from "@/src/infrastructure/adapters/api/ads-api";

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${theme.surface};
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid ${theme.border};
  box-shadow: ${theme.shadow};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.text};
  margin: 0;
`;

const CardSubtitle = styled.p`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
  margin: 0.25rem 0 0;
`;

const Button = styled.button`
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: none;
  background: ${theme.primary};
  color: white;
  font-size: 0.8125rem;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.textSecondary};
  font-weight: 500;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid ${theme.border};
  color: ${theme.text};
  white-space: nowrap;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${(p) =>
    p.status === "ACTIVE"
      ? "#166534"
      : p.status === "PAUSED"
      ? "#92400e"
      : "#991b1b"};
  background: ${(p) =>
    p.status === "ACTIVE"
      ? "rgba(22, 101, 52, 0.08)"
      : p.status === "PAUSED"
      ? "rgba(146, 64, 14, 0.08)"
      : "rgba(153, 27, 27, 0.08)"};
`;

const EmptyState = styled.div`
  padding: 1.25rem 0.5rem;
  color: ${theme.textSecondary};
  font-size: 0.875rem;
`;

const ErrorText = styled.div`
  color: ${theme.danger};
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const Select = styled.select`
  padding: 0.35rem 0.5rem;
  border-radius: 999px;
  border: 1px solid ${theme.border};
  background: ${theme.surface};
  color: ${theme.text};
  font-size: 0.8125rem;
`;

const InlineForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const Input = styled.input`
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid ${theme.border};
  background: ${theme.surface};
  color: ${theme.text};
  font-size: 0.8125rem;
  min-width: 0;
`;

const SmallSelect = styled.select`
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid ${theme.border};
  background: ${theme.surface};
  color: ${theme.text};
  font-size: 0.8125rem;
`;

const InlineError = styled.div`
  width: 100%;
  font-size: 0.75rem;
  color: ${theme.danger};
  margin-top: -0.25rem;
  margin-bottom: 0.25rem;
`;

function formatBudget(cents: number | null) {
  if (cents == null) return "—";
  return `￥${(cents / 100).toFixed(2)}`;
}

export default function AdsOverviewPage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    currency: "CNY",
    dailyBudget: "",
    totalBudget: "",
  });
  const [campaignForm, setCampaignForm] = useState({
    accountId: "",
    name: "",
    objective: "IMPRESSIONS",
    dailyBudget: "",
    totalBudget: "",
  });
  const [accountError, setAccountError] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [accRes, campRes] = await Promise.all([
          getAdAccounts({ page: 1, limit: 50 }),
          getAdCampaigns({ page: 1, limit: 100 }),
        ]);
        if (accRes.success && Array.isArray(accRes.data)) {
          setAccounts(accRes.data);
        }
        if (campRes.success && Array.isArray(campRes.data)) {
          setCampaigns(campRes.data);
        }
      } catch {
        setError(t("error.loadFailed"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [t]);

  const filteredCampaigns =
    selectedAccountId === "all"
      ? campaigns
      : campaigns.filter((c) => c.accountId === selectedAccountId);

  return (
    <div>
      <PageTitle>{t("ads.title")}</PageTitle>
      {error && <ErrorText>{error}</ErrorText>}
      {loading && !accounts.length && !campaigns.length ? (
        <EmptyState>{t("common.loading")}</EmptyState>
      ) : (
        <Grid>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t("ads.accountsTitle")}</CardTitle>
                <CardSubtitle>{t("ads.accountsSubtitle")}</CardSubtitle>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setAccountError(null);
                  setAccountForm({
                    name: "",
                    currency: "CNY",
                    dailyBudget: "",
                    totalBudget: "",
                  });
                  setShowAccountForm((prev) => !prev);
                }}
              >
                {t("ads.newAccount")}
              </Button>
            </CardHeader>
            {showAccountForm && (
              <>
                <InlineForm
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAccountError(null);
                    if (!accountForm.name.trim()) {
                      setAccountError(t("error.nameRequired"));
                      return;
                    }
                    const daily = accountForm.dailyBudget.trim();
                    const total = accountForm.totalBudget.trim();
                    const dailyCents = daily ? Math.round(parseFloat(daily) * 100) : null;
                    const totalCents = total ? Math.round(parseFloat(total) * 100) : null;
                    if ((daily && isNaN(dailyCents as number)) || (total && isNaN(totalCents as number))) {
                      setAccountError(t("error.budgetNumber"));
                      return;
                    }
                    try {
                      const res = await createAdAccount({
                        name: accountForm.name.trim(),
                        currency: accountForm.currency || "CNY",
                        dailyBudgetCents: dailyCents,
                        totalBudgetCents: totalCents,
                      });
                      if (res.success && res.data) {
                        setAccounts((prev) => [res.data as AdAccount, ...prev]);
                        setShowAccountForm(false);
                      }
                    } catch {
                      setAccountError(t("error.saveFailed"));
                    }
                  }}
                >
                  <Input
                    placeholder={t("ads.accountNamePlaceholder")}
                    value={accountForm.name}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <Input
                    placeholder={t("ads.dailyBudgetPlaceholder")}
                    value={accountForm.dailyBudget}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, dailyBudget: e.target.value }))
                    }
                  />
                  <Input
                    placeholder={t("ads.totalBudgetPlaceholder")}
                    value={accountForm.totalBudget}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, totalBudget: e.target.value }))
                    }
                  />
                  <SmallSelect
                    value={accountForm.currency}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, currency: e.target.value }))
                    }
                  >
                    <option value="CNY">CNY</option>
                    <option value="USD">USD</option>
                  </SmallSelect>
                  <Button type="submit">{t("common.save")}</Button>
                </InlineForm>
                {accountError && <InlineError>{accountError}</InlineError>}
              </>
            )}
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Daily Budget</Th>
                    <Th>Total Budget</Th>
                    <Th>Currency</Th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 ? (
                    <tr>
                      <Td colSpan={5}>
                        <EmptyState>{t("ads.emptyAccounts")}</EmptyState>
                      </Td>
                    </tr>
                  ) : (
                    accounts.map((a) => (
                      <tr key={a.id}>
                        <Td>{a.name}</Td>
                        <Td>
                          <StatusBadge status={a.status}>{a.status}</StatusBadge>
                        </Td>
                        <Td>{formatBudget(a.dailyBudgetCents)}</Td>
                        <Td>{formatBudget(a.totalBudgetCents)}</Td>
                        <Td>{a.currency}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableWrap>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t("ads.campaignsTitle")}</CardTitle>
                <CardSubtitle>{t("ads.campaignsSubtitle")}</CardSubtitle>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <Select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value as string | "all")}
                >
                  <option value="all">{t("ads.allAccounts")}</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
                <Button
                  type="button"
                  onClick={() => {
                    const firstAccount = accounts[0];
                    setCampaignError(null);
                    setCampaignForm({
                      accountId:
                        selectedAccountId !== "all"
                          ? selectedAccountId
                          : firstAccount?.id ?? "",
                      name: "",
                      objective: "IMPRESSIONS",
                      dailyBudget: "",
                      totalBudget: "",
                    });
                    setShowCampaignForm((prev) => !prev);
                  }}
                >
                  {t("ads.newCampaign")}
                </Button>
              </div>
            </CardHeader>
            {showCampaignForm && (
              <>
                <InlineForm
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setCampaignError(null);
                    if (!campaignForm.name.trim()) {
                      setCampaignError(t("error.nameRequired"));
                      return;
                    }
                    if (!campaignForm.accountId) {
                      setCampaignError(t("error.accountRequired"));
                      return;
                    }
                    const daily = campaignForm.dailyBudget.trim();
                    const total = campaignForm.totalBudget.trim();
                    const dailyCents = daily ? Math.round(parseFloat(daily) * 100) : null;
                    const totalCents = total ? Math.round(parseFloat(total) * 100) : null;
                    if ((daily && isNaN(dailyCents as number)) || (total && isNaN(totalCents as number))) {
                      setCampaignError(t("error.budgetNumber"));
                      return;
                    }
                    try {
                      const res = await createAdCampaign({
                        accountId: campaignForm.accountId,
                        name: campaignForm.name.trim(),
                        objective: campaignForm.objective,
                        dailyBudgetCents: dailyCents,
                        totalBudgetCents: totalCents,
                      });
                      if (res.success && res.data) {
                        setCampaigns((prev) => [res.data as AdCampaign, ...prev]);
                        setShowCampaignForm(false);
                      }
                    } catch {
                      setCampaignError(t("error.saveFailed"));
                    }
                  }}
                >
                  <SmallSelect
                    value={campaignForm.accountId}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({ ...prev, accountId: e.target.value }))
                    }
                  >
                    <option value="">{t("ads.selectAccountPlaceholder")}</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </SmallSelect>
                  <Input
                    placeholder={t("ads.campaignNamePlaceholder")}
                    value={campaignForm.name}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <SmallSelect
                    value={campaignForm.objective}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        objective: e.target.value,
                      }))
                    }
                  >
                    <option value="IMPRESSIONS">{t("ads.objectiveImpressions")}</option>
                    <option value="CLICKS">{t("ads.objectiveClicks")}</option>
                    <option value="CONVERSIONS">{t("ads.objectiveConversions")}</option>
                  </SmallSelect>
                  <Input
                    placeholder={t("ads.dailyBudgetPlaceholder")}
                    value={campaignForm.dailyBudget}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        dailyBudget: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder={t("ads.totalBudgetPlaceholder")}
                    value={campaignForm.totalBudget}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        totalBudget: e.target.value,
                      }))
                    }
                  />
                  <Button type="submit">{t("common.save")}</Button>
                </InlineForm>
                {campaignError && <InlineError>{campaignError}</InlineError>}
              </>
            )}
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Account</Th>
                    <Th>Objective</Th>
                    <Th>Status</Th>
                    <Th>Daily Budget</Th>
                    <Th>Total Budget</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <Td colSpan={6}>
                        <EmptyState>{t("ads.emptyCampaigns")}</EmptyState>
                      </Td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((c) => {
                      const acc = accounts.find((a) => a.id === c.accountId);
                      return (
                        <tr key={c.id}>
                          <Td>{c.name}</Td>
                          <Td>{acc?.name ?? c.accountId}</Td>
                          <Td>{c.objective}</Td>
                          <Td>
                            <StatusBadge status={c.status}>{c.status}</StatusBadge>
                          </Td>
                          <Td>{formatBudget(c.dailyBudgetCents)}</Td>
                          <Td>{formatBudget(c.totalBudgetCents)}</Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </TableWrap>
          </Card>
        </Grid>
      )}
    </div>
  );
}

