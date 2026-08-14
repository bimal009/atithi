import { cn } from "@/lib/utils";

const CRIMSON = "#DC143C";
const BLUE = "#003893";

/** Triangular rays arranged around a centre point, like the flag's sun and moon. */
function rays({
  count,
  cx,
  cy,
  inner,
  outer,
  spread = 360,
  offset = 0,
  width = 5,
}: {
  count: number;
  cx: number;
  cy: number;
  inner: number;
  outer: number;
  spread?: number;
  offset?: number;
  width?: number;
}) {
  const step = spread === 360 ? spread / count : spread / (count - 1);

  return Array.from({ length: count }, (_, i) => (
    <polygon
      key={i}
      points={`${cx},${cy - outer} ${cx - width / 2},${cy - inner} ${cx + width / 2},${cy - inner}`}
      transform={`rotate(${offset + step * i} ${cx} ${cy})`}
    />
  ));
}

/**
 * The national flag of Nepal, drawn as a single concave polygon so it keeps its
 * shape at any size. Set a height class and let the width follow.
 */
export function NepalFlag({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 100 124"
      className={cn("h-4 w-auto", className)}
      role="img"
      aria-label="Nepal"
      {...props}
    >
      <path
        d="M4 4 L82 40 L44 62 L96 88 L4 120 Z"
        fill={CRIMSON}
        stroke={BLUE}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <g fill="#fff">
        {/* Moon: a crescent cut from two overlapping circles, opening downward. */}
        {rays({ count: 8, cx: 29, cy: 36, inner: 12, outer: 14, spread: 210, offset: -105, width: 4 })}
        <path
          fillRule="evenodd"
          d="M18 36a11 11 0 1 0 22 0a11 11 0 1 0 -22 0Z M19 45a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z"
        />
        {/* Sun: twelve rays around a disc. */}
        {rays({ count: 12, cx: 30, cy: 86, inner: 9, outer: 14, width: 5 })}
        <circle cx="30" cy="86" r="8" />
      </g>
    </svg>
  );
}
