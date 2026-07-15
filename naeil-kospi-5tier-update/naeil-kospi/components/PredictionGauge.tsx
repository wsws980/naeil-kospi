"use client";

import { useEffect, useRef, useState } from "react";
import { PredictionLevel } from "@/lib/types";
import { GAUGE_ORDER, LEVEL_META } from "@/lib/constants";

interface Props {
  level: PredictionLevel;
  size?: number;
}

const CX = 150;
const CY = 148;
const R_OUTER = 128;
const R_INNER = 96;
const GAP_DEG = 2.2;
const SEGMENT_DEG = 36;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/** 두 반지름 사이의 두꺼운 호(도넛 조각) path */
function ringSegmentPath(startAngle: number, endAngle: number) {
  const p1 = polar(CX, CY, R_OUTER, startAngle);
  const p2 = polar(CX, CY, R_OUTER, endAngle);
  const p3 = polar(CX, CY, R_INNER, endAngle);
  const p4 = polar(CX, CY, R_INNER, startAngle);
  const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

export default function PredictionGauge({ level, size = 300 }: Props) {
  const [mounted, setMounted] = useState(false);
  const needleRef = useRef<SVGGElement>(null);

  const activeIndex = GAUGE_ORDER.indexOf(level);
  // 왼쪽(180°, 강한하락) → 오른쪽(0°, 강한상승)
  const needleAngle = 180 - SEGMENT_DEG * (activeIndex + 0.5);

  useEffect(() => {
    // 마운트 후 애니메이션을 트리거하기 위해 한 프레임 지연
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const needleTip = polar(CX, CY, R_INNER - 8, 90);

  return (
    <svg
      viewBox="0 0 300 175"
      width={size}
      height={(size * 175) / 300}
      role="img"
      aria-label={`다음 거래일 코스피 시가 예측: ${LEVEL_META[level].label}`}
    >
      {GAUGE_ORDER.map((lvl, i) => {
        const start = 180 - SEGMENT_DEG * i + GAP_DEG / 2;
        const end = 180 - SEGMENT_DEG * (i + 1) - GAP_DEG / 2;
        const isActive = lvl === level;
        return (
          <path
            key={lvl}
            d={ringSegmentPath(start, end)}
            fill={LEVEL_META[lvl].color}
            opacity={isActive ? 1 : 0.28}
            style={{ transition: "opacity 0.6s ease" }}
          />
        );
      })}

      {/* 중심 허브 + 바늘 */}
      <g
        ref={needleRef}
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: `rotate(${mounted ? 90 - needleAngle : 45}deg)`,
          transition: "transform 1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <line
          x1={CX}
          y1={CY}
          x2={needleTip.x}
          y2={CY - (R_INNER - 8)}
          stroke={LEVEL_META[level].color}
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
      <circle cx={CX} cy={CY} r="9" fill={LEVEL_META[level].color} />
      <circle
        cx={CX}
        cy={CY}
        r="9"
        fill="none"
        stroke="var(--bg)"
        strokeWidth="2.5"
      />
    </svg>
  );
}
