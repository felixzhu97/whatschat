"use client";

import { styled } from "@/src/shared/utils/emotion";

const Main = styled.main`
  min-height: 100vh;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(10 10 10);
`;

const Subtitle = styled.p`
  margin-top: 0.5rem;
  color: rgb(115 115 115);
`;

export default function AdminPage() {
  return (
    <Main>
      <Title>WhatsChat Admin</Title>
      <Subtitle>Admin dashboard</Subtitle>
    </Main>
  );
}
