import { useState, useCallback } from "react";

export function useDialogs() {
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);
  const [showAdvancedSearchDialog, setShowAdvancedSearchDialog] =
    useState(false);

  const handleCreateGroupClick = useCallback(() => {
    console.log("Opening create group dialog");
    setShowCreateGroupDialog(true);
  }, []);

  const handleAddFriendClick = useCallback(() => {
    console.log("Opening add friend dialog");
    setShowAddFriendDialog(true);
  }, []);

  const handleAdvancedSearchClick = useCallback(() => {
    console.log("Opening advanced search dialog");
    setShowAdvancedSearchDialog(true);
  }, []);

  const closeCreateGroupDialog = useCallback(() => {
    setShowCreateGroupDialog(false);
  }, []);

  const closeAddFriendDialog = useCallback(() => {
    setShowAddFriendDialog(false);
  }, []);

  const closeAdvancedSearchDialog = useCallback(() => {
    setShowAdvancedSearchDialog(false);
  }, []);

  return {
    showCreateGroupDialog,
    showAddFriendDialog,
    showAdvancedSearchDialog,
    handleCreateGroupClick,
    handleAddFriendClick,
    handleAdvancedSearchClick,
    closeCreateGroupDialog,
    closeAddFriendDialog,
    closeAdvancedSearchDialog,
  };
}
