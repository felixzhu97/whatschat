import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getStorageAdapter } from "../storage/storage.adapter";
import { Contact } from "../../../domain/entities/contact.entity";

interface ContactsState {
  contacts: Contact[];
  selectedContactId: string | null;
  searchQuery: string;
  filteredContacts: Contact[];
  favoriteContacts: string[];
  blockedContacts: string[];

  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (contactId: string) => void;
  setSelectedContact: (contactId: string | null) => void;
  getSelectedContact: () => Contact | null;
  setSearchQuery: (query: string) => void;
  filterContacts: () => void;
  addToFavorites: (contactId: string) => void;
  removeFromFavorites: (contactId: string) => void;
  isFavorite: (contactId: string) => boolean;
  blockContact: (contactId: string) => void;
  unblockContact: (contactId: string) => void;
  isBlocked: (contactId: string) => boolean;
  setOnlineStatus: (contactId: string, isOnline: boolean) => void;
  updateLastSeen: (contactId: string, timestamp: string) => void;
  updateLastMessage: (
    contactId: string,
    message: string,
    timestamp: string
  ) => void;
  updateUnreadCount: (contactId: string, count: number) => void;
  incrementUnreadCount: (contactId: string) => void;
  clearUnreadCount: (contactId: string) => void;
  getContactById: (contactId: string) => Contact | undefined;
  getOnlineContacts: () => Contact[];
  getContactsWithUnread: () => Contact[];
  getTotalUnreadCount: () => number;
}

const storageAdapter = getStorageAdapter();

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: [],
      selectedContactId: null,
      searchQuery: "",
      filteredContacts: [],
      favoriteContacts: [],
      blockedContacts: [],

      setContacts: (contacts) =>
        set({ contacts, filteredContacts: contacts }),

      addContact: (contact) =>
        set((state) => {
          const newContacts = [...state.contacts, contact];
          return {
            contacts: newContacts,
            filteredContacts: state.searchQuery
              ? newContacts.filter(
                  (c) =>
                    c.name
                      .toLowerCase()
                      .includes(state.searchQuery.toLowerCase()) ||
                    c.lastMessage
                      .toLowerCase()
                      .includes(state.searchQuery.toLowerCase())
                )
              : newContacts,
          };
        }),

      updateContact: (contactId, updates) =>
        set((state) => {
          const newContacts = state.contacts.map((contact) =>
            contact.id === contactId ? { ...contact, ...updates } : contact
          );
          return {
            contacts: newContacts,
            filteredContacts: state.searchQuery
              ? newContacts.filter(
                  (c) =>
                    c.name
                      .toLowerCase()
                      .includes(state.searchQuery.toLowerCase()) ||
                    c.lastMessage
                      .toLowerCase()
                      .includes(state.searchQuery.toLowerCase())
                )
              : newContacts,
          };
        }),

      deleteContact: (contactId) =>
        set((state) => {
          const newContacts = state.contacts.filter(
            (contact) => contact.id !== contactId
          );
          return {
            contacts: newContacts,
            filteredContacts: newContacts,
            selectedContactId:
              state.selectedContactId === contactId
                ? null
                : state.selectedContactId,
          };
        }),

      setSelectedContact: (contactId) => set({ selectedContactId: contactId }),

      getSelectedContact: () => {
        const { contacts, selectedContactId } = get();
        return selectedContactId
          ? contacts.find((c) => c.id === selectedContactId) || null
          : null;
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().filterContacts();
      },

      filterContacts: () =>
        set((state) => {
          if (!state.searchQuery.trim()) {
            return { filteredContacts: state.contacts };
          }

          const query = state.searchQuery.toLowerCase();
          const filtered = state.contacts.filter(
            (contact) =>
              contact.name.toLowerCase().includes(query) ||
              contact.lastMessage.toLowerCase().includes(query) ||
              (contact.phoneNumber && contact.phoneNumber.includes(query))
          );

          return { filteredContacts: filtered };
        }),

      addToFavorites: (contactId) =>
        set((state) => ({
          favoriteContacts: [
            ...state.favoriteContacts.filter((id) => id !== contactId),
            contactId,
          ],
        })),

      removeFromFavorites: (contactId) =>
        set((state) => ({
          favoriteContacts: state.favoriteContacts.filter(
            (id) => id !== contactId
          ),
        })),

      isFavorite: (contactId) => {
        const { favoriteContacts } = get();
        return favoriteContacts.includes(contactId);
      },

      blockContact: (contactId) =>
        set((state) => ({
          blockedContacts: [
            ...state.blockedContacts.filter((id) => id !== contactId),
            contactId,
          ],
        })),

      unblockContact: (contactId) =>
        set((state) => ({
          blockedContacts: state.blockedContacts.filter(
            (id) => id !== contactId
          ),
        })),

      isBlocked: (contactId) => {
        const { blockedContacts } = get();
        return blockedContacts.includes(contactId);
      },

      setOnlineStatus: (contactId, isOnline) =>
        get().updateContact(contactId, {
          isOnline,
          lastSeen: isOnline ? undefined : new Date().toISOString(),
        }),

      updateLastSeen: (contactId, timestamp) =>
        get().updateContact(contactId, { lastSeen: timestamp }),

      updateLastMessage: (contactId, message, timestamp) =>
        get().updateContact(contactId, { lastMessage: message, timestamp }),

      updateUnreadCount: (contactId, count) =>
        get().updateContact(contactId, { unreadCount: Math.max(0, count) }),

      incrementUnreadCount: (contactId) => {
        const contact = get().getContactById(contactId);
        if (contact) {
          get().updateContact(contactId, {
            unreadCount: contact.unreadCount + 1,
          });
        }
      },

      clearUnreadCount: (contactId) =>
        get().updateContact(contactId, { unreadCount: 0 }),

      getContactById: (contactId) => {
        const { contacts } = get();
        return contacts.find((contact) => contact.id === contactId);
      },

      getOnlineContacts: () => {
        const { contacts } = get();
        return contacts.filter((contact) => contact.isOnline);
      },

      getContactsWithUnread: () => {
        const { contacts } = get();
        return contacts.filter((contact) => contact.unreadCount > 0);
      },

      getTotalUnreadCount: () => {
        const { contacts } = get();
        return contacts.reduce(
          (total, contact) => total + contact.unreadCount,
          0
        );
      },
    }),
    {
      name: "contacts-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => storageAdapter.load(name, null),
        setItem: (name, value) => storageAdapter.save(name, value),
        removeItem: (name) => storageAdapter.remove(name),
      })),
    }
  )
);

