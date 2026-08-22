"use client";

import * as React from "react";
import { MinusIcon, PlusIcon, ShoppingBagIcon, StarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dummyMenuItems, formatMoney, type DummyMenuItem } from "../../lib/dummy-data";
import { waLink } from "../../components/whatsapp-icon";
import { useWhatsAppOffset2 } from "./site-shell-2";

const FOOD_TYPE_DOT: Record<DummyMenuItem["foodType"], string> = {
  veg: "bg-emerald-600",
  vegan: "bg-[#4B5D46]",
  "non-veg": "bg-red-500",
  egg: "bg-amber-500",
};

export function MenuPageContent2({ hotelName, hotelPhone }: { hotelName: string; hotelPhone: string }) {
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

  useWhatsAppOffset2(cartCount > 0);

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
        <h1 className="font-[family-name:var(--font-site2-display)] text-4xl font-semibold">
          Restaurant &amp; Menu
        </h1>
        <p className="text-[#17181A]/55">A short, seasonal menu, cooked with care.</p>
      </div>

      <div className="flex gap-6 overflow-x-auto border-b border-[#17181A]/10 pb-3">
        {categories.map(([categoryName]) => (
          <a
            key={categoryName}
            href={`#menu-${categoryName}`}
            className="shrink-0 text-sm font-medium whitespace-nowrap text-[#17181A]/55 hover:text-[#17181A]"
          >
            {categoryName}
          </a>
        ))}
      </div>

      {topPicks.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="flex items-center gap-2 font-[family-name:var(--font-site2-display)] text-lg font-semibold">
            <StarIcon className="size-4 fill-[#4B5D46] text-[#4B5D46]" />
            Chef&apos;s picks
          </h3>
          <div className="flex gap-6 overflow-x-auto pb-1">
            {topPicks.map((item) => (
              <div key={item.id} className="flex w-52 shrink-0 flex-col gap-1 border-l-2 border-[#4B5D46] pl-3">
                <span className="font-semibold">{item.name}</span>
                <span className="text-sm text-[#4B5D46]">{formatMoney(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-10">
        {categories.map(([categoryName, items]) => (
          <div key={categoryName} id={`menu-${categoryName}`} className="flex scroll-mt-24 flex-col gap-5">
            <h3 className="font-[family-name:var(--font-site2-display)] text-lg font-semibold">{categoryName}</h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const qty = cart[item.id] ?? 0;
                return (
                  <div key={item.id} className="flex flex-col gap-3">
                    <div className="aspect-video overflow-hidden rounded-sm bg-[#17181A]/5">
                      {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
                      <img src={item.imageUrl} alt={item.name} className="size-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className={`size-1.5 shrink-0 rounded-full ${FOOD_TYPE_DOT[item.foodType]}`} />
                        {item.name}
                        {item.isTopPick && (
                          <Badge className="rounded-sm bg-[#4B5D46] text-white">Top pick</Badge>
                        )}
                      </span>
                      <p className="line-clamp-2 text-sm text-[#17181A]/55">{item.description}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-semibold text-[#4B5D46]">{formatMoney(item.price)}</span>
                        {qty === 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-sm border-[#17181A]/20 hover:bg-[#17181A]/5"
                            onClick={() => setQty(item.id, 1)}
                          >
                            Add to order
                          </Button>
                        ) : (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setQty(item.id, qty - 1)}
                              className="flex size-7 cursor-pointer items-center justify-center rounded-full text-[#17181A]/70 hover:bg-[#17181A]/5"
                              aria-label="Decrease quantity"
                            >
                              <MinusIcon className="size-3.5" />
                            </button>
                            <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(item.id, qty + 1)}
                              className="flex size-7 cursor-pointer items-center justify-center rounded-full text-[#17181A]/70 hover:bg-[#17181A]/5"
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
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#17181A]/10 bg-[#FAFAF8] px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(23,24,26,0.15)] sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm">
              <ShoppingBagIcon className="size-4 text-[#4B5D46]" />
              {cartCount} item{cartCount > 1 ? "s" : ""} · {formatMoney(cartTotal)}
            </span>
            <Button
              size="sm"
              className="rounded-sm bg-[#17181A] text-white hover:bg-[#17181A]/85"
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
