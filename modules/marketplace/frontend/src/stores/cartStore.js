import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,

  addItem: (product) => {
    const { items } = get()
    const existingIndex = items.findIndex(i => i.id === product.id)

    if (existingIndex !== -1) {
      // Already in cart
      return
    }

    const newItems = [...items, { ...product, quantity: 1 }]
    const newTotal = newItems.reduce((sum, item) => sum + item.price, 0)

    set({ items: newItems, total: newTotal })
  },

  removeItem: (productId) => {
    const { items } = get()
    const newItems = items.filter(i => i.id !== productId)
    const newTotal = newItems.reduce((sum, item) => sum + item.price, 0)

    set({ items: newItems, total: newTotal })
  },

  clearCart: () => {
    set({ items: [], total: 0 })
  },

  isInCart: (productId) => {
    const { items } = get()
    return items.some(i => i.id === productId)
  }
}))
