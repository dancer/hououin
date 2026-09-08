const QUIET = 3;
const EYE = 7;

const isEye = (x: number, y: number, size: number) =>
  (x < EYE && y < EYE) ||
  (x >= size - EYE && y < EYE) ||
  (x < EYE && y >= size - EYE);

export const Code = ({ cells, size }: { cells: number[]; size: number }) => {
  const span = size + QUIET * 2;
  const heart = Math.floor(size / 2);
  const hole = 3;

  const dots: string[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const near = Math.abs(x - heart) <= hole && Math.abs(y - heart) <= hole;
      if (cells[y * size + x] === 1 && !(isEye(x, y, size) || near)) {
        dots.push(`${x + QUIET},${y + QUIET}`);
      }
    }
  }

  const eyes = [
    [0, 0],
    [size - EYE, 0],
    [0, size - EYE],
  ];

  return (
    <svg
      aria-label="Riot login code"
      className="size-full"
      role="img"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${span} ${span}`}
    >
      <rect fill="#eae7e2" height={span} width={span} />
      {dots.map((spot) => {
        const [x, y] = spot.split(",").map(Number);
        return (
          <rect
            fill="#0d0d0c"
            height="0.96"
            key={spot}
            rx="0.22"
            width="0.96"
            x={x + 0.02}
            y={y + 0.02}
          />
        );
      })}
      {eyes.map(([ex, ey]) => (
        <g key={`${ex}-${ey}`}>
          <rect
            fill="none"
            height="6.2"
            rx="1.9"
            stroke="#0d0d0c"
            strokeWidth="1"
            width="6.2"
            x={ex + QUIET + 0.4}
            y={ey + QUIET + 0.4}
          />
          <rect
            fill="#d9744a"
            height="3"
            rx="1"
            width="3"
            x={ex + QUIET + 2}
            y={ey + QUIET + 2}
          />
        </g>
      ))}
      <circle
        cx={heart + QUIET + 0.5}
        cy={heart + QUIET + 0.5}
        fill="none"
        r="2.4"
        stroke="#0d0d0c"
        strokeWidth="1.1"
      />
      <circle
        cx={heart + QUIET + 0.5}
        cy={heart + QUIET + 0.5}
        fill="none"
        pathLength="100"
        r="2.4"
        stroke="#d9744a"
        strokeDasharray="25 75"
        strokeWidth="1.1"
        transform={`rotate(-90 ${heart + QUIET + 0.5} ${heart + QUIET + 0.5})`}
      />
    </svg>
  );
};
