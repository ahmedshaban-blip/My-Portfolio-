import { cn } from "@/lib/utils";

/**
 * The reference's signature material: a fan of hairline ellipses that sweeps
 * across the whole page.
 *
 * Recovered from the reference file, where 100 pill divs (`754.31 × 1814.50`,
 * `border-radius: 9999px`, `1px #2E2E2E`) each carry `transform-origin: top
 * left` and a rotation from -74deg to +25deg. Fitting those pivots shows the
 * export is one authored gesture: every top-left corner lies on a single circle
 * — centre (1051.44, 1014.44), radius 982.5 — advanced 1deg per ring, and the
 * ring's own rotation is that orbit angle offset by a constant 247.28deg.
 *
 * So the 100 placements reduce to a closed form, computed once at module load
 * and emitted as one SVG rather than 100 positioned DOM nodes: it scales to any
 * viewport through the viewBox, and `non-scaling-stroke` keeps the hairline at
 * exactly 1px however far it is stretched — which is what makes the fan read as
 * line art rather than as a blur.
 */

const RING_COUNT = 100;
/** Rotation of the first ring, degrees. Runs -74 → +25 over `RING_COUNT`. */
const START_ANGLE = -74;
/** Constant offset between a ring's own rotation and its orbit angle. */
const ORBIT_OFFSET = 247.28;
const ORBIT_CX = 1051.44;
const ORBIT_CY = 1014.44;
const ORBIT_R = 982.5;
/** Semi-axes of the pill: 754.31 / 2 and 1814.50 / 2. */
const RX = 377.155;
const RY = 907.25;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Each ring's SVG centre, plus a conservative stroke bbox for the viewBox. */
function buildFan() {
  const rings: { cx: number; cy: number; rotate: number }[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < RING_COUNT; i++) {
    const angle = START_ANGLE + i;
    const orbit = angle + ORBIT_OFFSET;
    const pivotX = ORBIT_CX + ORBIT_R * Math.cos(toRad(orbit));
    const pivotY = ORBIT_CY + ORBIT_R * Math.sin(toRad(orbit));
    const cos = Math.cos(toRad(angle));
    const sin = Math.sin(toRad(angle));
    // The pill is laid out from its top-left pivot, then rotated about it.
    const cx = pivotX + RX * cos - RY * sin;
    const cy = pivotY + RX * sin + RY * cos;
    rings.push({ cx, cy, rotate: angle });

    // Axis-aligned half-extents of the rotated ellipse.
    const ex = Math.hypot(RX * cos, RY * sin);
    const ey = Math.hypot(RX * sin, RY * cos);
    minX = Math.min(minX, cx - ex);
    maxX = Math.max(maxX, cx + ex);
    minY = Math.min(minY, cy - ey);
    maxY = Math.max(maxY, cy + ey);
  }

  const pad = 12;
  return {
    rings,
    viewBox: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
  };
}

const FAN = buildFan();

export function ConcentricRings({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={FAN.viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none select-none", className)}
    >
      <g fill="none" stroke="oklch(var(--ring-line))" strokeWidth={1}>
        {FAN.rings.map((ring) => (
          <ellipse
            key={ring.rotate}
            cx={ring.cx}
            cy={ring.cy}
            rx={RX}
            ry={RY}
            transform={`rotate(${ring.rotate} ${ring.cx} ${ring.cy})`}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
