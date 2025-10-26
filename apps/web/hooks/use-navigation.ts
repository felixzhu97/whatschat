import { useState, useCallback } from "react";

export function useNavigation() {
  const [currentPage, setCurrentPage] = useState<string>("chat");

  const navigateToPage = useCallback((page: string) => {
    setCurrentPage(page);
  }, []);

  const handleProfileClick = useCallback(() => {
    setCurrentPage("profile");
  }, []);

  const handleStatusClick = useCallback(() => {
    setCurrentPage("status");
  }, []);

  const handleCallsClick = useCallback(() => {
    setCurrentPage("calls");
  }, []);

  const handleStarredClick = useCallback(() => {
    setCurrentPage("starred");
  }, []);

  const handleSettingsClick = useCallback(() => {
    setCurrentPage("settings");
  }, []);

  const handleSearchPageClick = useCallback(() => {
    setCurrentPage("search");
  }, []);

  const handleBackToChat = useCallback(() => {
    setCurrentPage("chat");
  }, []);

  return {
    currentPage,
    navigateToPage,
    handleProfileClick,
    handleStatusClick,
    handleCallsClick,
    handleStarredClick,
    handleSettingsClick,
    handleSearchPageClick,
    handleBackToChat,
  };
}
