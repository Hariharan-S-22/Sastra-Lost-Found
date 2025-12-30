
import { Item, ItemStatus, ChatMessage } from '../types';
import { MOCK_ITEMS } from '../constants';

const STORAGE_KEY = 'sastra_items_db';

const getLocalItems = (): Item[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ITEMS));
    return MOCK_ITEMS as Item[];
  }
  return JSON.parse(data);
};

const setLocalItems = (items: Item[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const itemService = {
  async getItems(): Promise<Item[]> {
    return getLocalItems();
  },

  async addItem(item: Item): Promise<Item> {
    const items = getLocalItems();
    const updatedItems = [item, ...items];
    setLocalItems(updatedItems);
    return item;
  },

  async updateStatus(itemId: string, status: ItemStatus): Promise<void> {
    const items = getLocalItems();
    const index = items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      items[index].status = status;
      setLocalItems(items);
    }
  },

  async addMessage(itemId: string, message: ChatMessage): Promise<void> {
    const items = getLocalItems();
    const index = items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      if (!items[index].messages) items[index].messages = [];
      items[index].messages?.push(message);
      setLocalItems(items);
    }
  },

  async deleteItem(itemId: string): Promise<void> {
    const items = getLocalItems();
    const filtered = items.filter(i => i.id !== itemId);
    setLocalItems(filtered);
  }
};
