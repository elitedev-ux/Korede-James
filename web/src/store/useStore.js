import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const browserStorage =
  typeof window !== "undefined"
    ? createJSONStorage(() => window.localStorage)
    : undefined;

const useStore = create(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      addToCart: (product, size, color) =>
        set((state) => {
          const existing = state.cart.find(
            (item) =>
              item.id === product.id &&
              item.size === size &&
              item.color === color &&
              item.tailoringNotes === product.tailoringNotes &&
              item.archivalNotes === product.archivalNotes,
          );

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id &&
                item.size === size &&
                item.color === color
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            cart: [...state.cart, { ...product, size, color, quantity: 1 }],
          };
        }),
      removeFromCart: (productId, size, color) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              !(
                item.id === productId &&
                item.size === size &&
                item.color === color
              ),
          ),
        })),
      updateQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId && item.size === size && item.color === color
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),
      toggleWishlist: (product) =>
        set((state) => {
          const isWishlisted = state.wishlist.find(
            (item) => item.id === product.id,
          );

          if (isWishlisted) {
            return {
              wishlist: state.wishlist.filter((item) => item.id !== product.id),
            };
          }

          return { wishlist: [...state.wishlist, product] };
        }),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "korede-james-store",
      storage: browserStorage,
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    },
  ),
);

export default useStore;
