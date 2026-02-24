import { styled } from "@/src/shared/utils/emotion";

export const Skeleton = styled.div`
  border-radius: 0.375rem;
  background-color: hsl(var(--muted));
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
`;
