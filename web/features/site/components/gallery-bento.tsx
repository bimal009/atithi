import { dummyGallery } from "../lib/dummy-data";

function Shot({
  img,
  className = "",
  aspect = "aspect-square sm:aspect-auto",
}: {
  img: { url: string; label: string };
  className?: string;
  aspect?: string;
}) {
  return (
    <div className={`group overflow-hidden rounded-2xl ${aspect} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- placeholder photography */}
      <img
        src={img.url}
        alt={img.label}
        className="size-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}

export function GalleryBento() {
  const [a, b, c, d, e, f, g, h] = dummyGallery;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2 sm:h-[32rem]">
        <Shot img={a} className="col-span-2 row-span-2 sm:col-span-2 sm:row-span-2" />
        <Shot img={b} />
        <Shot img={c} />
        <Shot img={d} />
        <Shot img={e} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Shot img={f} aspect="aspect-video" />
        <Shot img={g} aspect="aspect-video" />
        <Shot img={h} aspect="aspect-video" />
      </div>
    </div>
  );
}
