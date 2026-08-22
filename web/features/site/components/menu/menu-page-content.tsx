"use client";

import * as React from "react";
import { MinusIcon, PlusIcon, ShoppingBagIcon, StarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWhatsAppOffset } from "../site-shell";
import { waLink } from "../whatsapp-icon";
import { dummyMenuItems, formatMoney, type DummyMenuItem } from "../../lib/dummy-data";

const FOOD_TYPE_DOT: Record<DummyMenuItem["foodType"], string> = {
  veg: "bg-emerald-500",
  vegan: "bg-emerald-600",
  "non-veg": "bg-red-500",
  egg: "bg-amber-500",
};

export function MenuPageContent({ hotelName, hotelPhone }: { hotelName: string; hotelPhone: string }) {
  const [cart, setCart] = React.useState<Record<string, number>>({});

  const categories = React.useMemo(() => {
    const map = new Map<string, DummyMenuItem[]>();
    for (const item of dummyMenuItems) {
      const list = map.get(item.categoryName) ?? [];
      list.push(item);
      map.set(item.categoryName, list);
    }
    return [...map.entries()];
  }, []);
  const topPicks = dummyMenuItems.filter((m) => m.isTopPick);

  function setQty(itemId: string, qty: number) {
    setCart((c) => {
      if (qty <= 0) {
        const next = { ...c };
        delete next[itemId];
        return next;
      }
      return { ...c, [itemId]: qty };
    });
  }

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => ({ item: dummyMenuItems.find((m) => m.id === id), qty }))
    .filter((e): e is { item: DummyMenuItem; qty: number } => !!e.item);
  const cartCount = cartEntries.reduce((sum, e) => sum + e.qty, 0);
  const cartTotal = cartEntries.reduce((sum, e) => sum + e.item.price * e.qty, 0);

  useWhatsAppOffset(cartCount > 0);

  function sendOrderOnWhatsApp() {
    const lines = cartEntries.map(
      (e) => `- ${e.item.name} x${e.qty} (${formatMoney(e.item.price * e.qty)})`,
    );
    const message = [`Order request for ${hotelName}:`, ...lines, `Total: ${formatMoney(cartTotal)}`].join(
      "\n",
    );
    window.open(waLink(hotelPhone, message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 pb-28 sm:px-6 sm:py-16 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-site-display)] text-4xl font-semibold text-stone-900">
          Restaurant &amp; Menu
        </h1>
        <p className="text-stone-500">A short, seasonal menu, cooked with care.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(([categoryName]) => (
          <a
            key={categoryName}
            href={`#menu-${categoryName}`}
            className="shrink-0 rounded-full border border-stone-300 px-3.5 py-2 text-sm whitespace-nowrap text-stone-700 hover:bg-stone-100"
          >
            {categoryName}
          </a>
        ))}
      </div>

      {topPicks.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="flex items-center gap-2 font-[family-name:var(--font-site-display)] text-xl font-semibold text-stone-900">
            <StarIcon className="size-4 fill-amber-700 text-amber-700" />
            Chef&apos;s picks
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {topPicks.map((item) => (
              <div
                key={item.id}
                className="flex w-56 shrink-0 flex-col gap-2 rounded-xl border border-stone-200 bg-white p-4"
              >
                <span className="font-medium text-stone-900">{item.name}</span>
                <span className="text-amber-800">{formatMoney(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-10">
        {categories.map(([categoryName, items]) => (
          <div key={categoryName} id={`menu-${categoryName}`} className="flex scroll-mt-24 flex-col gap-4">
            <h3 className="font-[family-name:var(--font-site-display)] text-xl font-semibold text-stone-900">
              {categoryName}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const qty = cart[item.id] ?? 0;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white"
                  >
                    <div className="aspect-video overflow-hidden bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
                      <img src={item.imageUrl} alt={item.name} className="size-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <span className="flex items-center gap-2 font-medium text-stone-900">
                        <span className={`size-2 shrink-0 rounded-full ${FOOD_TYPE_DOT[item.foodType]}`} />
                        {item.name}
                        {item.isTopPick && (
                          <Badge className="bg-amber-700 text-white">Top pick</Badge>
                        )}
                      </span>
                      <p className="line-clamp-2 text-sm text-stone-500">{item.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="font-medium text-amber-800">{formatMoney(item.price)}</span>
                        {qty === 0 ? (
                          <Button
                            size="sm"
                            className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
                            onClick={() => setQty(item.id, 1)}
                          >
                            Add to order
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 rounded-full border border-stone-300 px-1 py-1">
                            <button
                              type="button"
                              onClick={() => setQty(item.id, qty - 1)}
                              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
                              aria-label="Decrease quantity"
                            >
                              <MinusIcon className="size-3.5" />
                            </button>
                            <span className="w-4 text-center text-sm font-medium">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(item.id, qty + 1)}
                              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
                              aria-label="Increase quantity"
                            >
                              <PlusIcon className="size-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm text-stone-700">
              <ShoppingBagIcon className="size-4 text-amber-700" />
              {cartCount} item{cartCount > 1 ? "s" : ""} · {formatMoney(cartTotal)}
            </span>
            <Button
              size="sm"
              className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
              onClick={sendOrderOnWhatsApp}
            >
              Send order on WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
