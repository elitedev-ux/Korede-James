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
      cartPreviewVersion: 0,
      addToCart: (product, size, color) =>
        set((state) => {
          const lineKey = createCartLineKey(product, size, color);
          const existing = state.cart.find((item) =>
            item.lineKey
              ? item.lineKey === lineKey
              : cartLineMatches(item, product, size, color),
          );

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                (item.lineKey && item.lineKey === lineKey) ||
                (!item.lineKey && cartLineMatches(item, product, size, color))
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            cart: [...state.cart, { ...product, lineKey, size, color, quantity: 1 }],
          };
        }),
      openCartPreview: () =>
        set((state) => ({
          cartPreviewVersion: state.cartPreviewVersion + 1,
        })),
      removeFromCart: (productId, size, color, lineKey) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              lineKey
                ? item.lineKey !== lineKey
                : !(
                    item.id === productId &&
                    item.size === size &&
                    item.color === color
                  ),
          ),
        })),
      updateQuantity: (productId, size, color, quantity, lineKey) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            (lineKey && item.lineKey === lineKey) ||
            (!lineKey &&
              item.id === productId &&
              item.size === size &&
              item.color === color)
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "korede-james-store",
      storage: browserStorage,
      partialize: (state) => ({
        cart: state.cart,
      }),
    },
  ),
);

export default useStore;

function createCartLineKey(product, size, color) {
  return [
    product.id,
    size,
    color,
    product.tailoringNotes || "",
    product.archivalNotes || "",
  ]
    .map((value) => encodeURIComponent(String(value || "")))
    .join("|");
}

function cartLineMatches(item, product, size, color) {
  return (
    item.id === product.id &&
    item.size === size &&
    item.color === color &&
    (item.tailoringNotes || "") === (product.tailoringNotes || "") &&
    (item.archivalNotes || "") === (product.archivalNotes || "")
  );
}
