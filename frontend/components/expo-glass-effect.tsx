"use client";

import React, { useCallback, useState } from "react";

export type GlassStyle = "clear" | "regular" | "tinted";
export type GlassTint = "neutral" | "indigo" | "cyan" | "emerald" | "danger";

export interface GlassViewProps extends React.HTMLAttributes<HTMLDivElement> {
  glassEffectStyle?: GlassStyle;
  tintColor?: GlassTint;
  isInteractive?: boolean;
  children?: React.ReactNode;
}

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "indigo" | "emerald" | "danger" | "ghost";
  size?: "sm" | "md" | "icon";
  isActive?: boolean;
}

export interface GlassSliderProps {
  id?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  ariaLabel?: string;
  className?: string;
}

export interface GlassSwitchProps {
  id?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  className?: string;
}

const STYLE_MAP: Record<GlassStyle, string> = {
  clear: "liquid-glass-clear",
  regular: "liquid-glass",
  tinted: "liquid-glass-tinted",
};

const TINT_MAP: Record<GlassTint, string> = {
  neutral: "",
  indigo: "liquid-tint-indigo",
  cyan: "liquid-tint-cyan",
  emerald: "liquid-tint-emerald",
  danger: "liquid-tint-danger",
};

const BUTTON_VARIANT_MAP: Record<
  NonNullable<GlassButtonProps["variant"]>,
  string
> = {
  primary: "liquid-glass-btn-primary text-white",
  secondary: "liquid-glass-btn text-slate-700 hover:text-slate-900",
  indigo: "liquid-glass-btn liquid-tint-indigo text-[#4F46E5]",
  emerald: "liquid-glass-btn liquid-tint-emerald text-emerald-700",
  danger: "liquid-glass-btn liquid-tint-danger text-red-700",
  ghost: "liquid-glass-btn-ghost text-[#64748B] hover:text-slate-900",
};

const BUTTON_SIZE_MAP: Record<NonNullable<GlassButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs rounded-xl",
  md: "px-4 py-2 text-sm rounded-xl",
  icon: "w-9 h-9 p-1.5 rounded-xl",
};

function updatePointerVars(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty("--glass-x", `${x.toFixed(1)}%`);
  e.currentTarget.style.setProperty("--glass-y", `${y.toFixed(1)}%`);
}

/**
 * Filtros SVG globais para refração óptica sutil do efeito Liquid Glass.
 */
export function LiquidGlassSvgFilters() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed h-0 w-0 opacity-0"
      focusable="false"
    >
      <defs>
        <filter
          id="expo-liquid-glass-refraction"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.018"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.2" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Superfície Liquid Glass (inspirada no Apple Liquid Glass / expo-glass-effect).
 */
export function GlassView({
  glassEffectStyle = "regular",
  tintColor = "neutral",
  isInteractive = false,
  className = "",
  onMouseMove,
  children,
  ...rest
}: GlassViewProps) {
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isInteractive) {
        updatePointerVars(e);
      }
      onMouseMove?.(e);
    },
    [isInteractive, onMouseMove]
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`${STYLE_MAP[glassEffectStyle]} ${TINT_MAP[tintColor]} ${
        isInteractive ? "liquid-glass-interactive" : ""
      } ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Botão com acabamento Liquid Glass e resposta tátil fluida.
 */
export function GlassButton({
  variant = "secondary",
  size = "md",
  isActive = false,
  className = "",
  onMouseMove,
  children,
  ...rest
}: GlassButtonProps) {
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      updatePointerVars(e);
      onMouseMove?.(e);
    },
    [onMouseMove]
  );

  return (
    <button
      onMouseMove={handleMouseMove}
      className={`liquid-glass-interactive inline-flex items-center justify-center gap-2 font-medium cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
        BUTTON_VARIANT_MAP[variant]
      } ${BUTTON_SIZE_MAP[size]} ${
        isActive ? "liquid-glass-btn-active" : ""
      } ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Barra deslizante (Slider) com lente transparente Liquid Glass refratando a trilha.
 */
export function GlassSlider({
  id,
  min = 0,
  max = 100,
  step = 1,
  value,
  disabled = false,
  onChange,
  ariaLabel,
  className = "",
}: GlassSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const safeRange = max - min || 1;
  const clamped = Math.min(max, Math.max(min, value));
  const percent = ((clamped - min) / safeRange) * 100;

  return (
    <div
      className={`relative flex h-9 w-full items-center select-none ${
        disabled ? "opacity-45 cursor-not-allowed" : "cursor-pointer"
      } ${className}`.trim()}
    >
      {/* Trilha de fundo em vidro fosco */}
      <div className="liquid-glass-slider-track relative h-2.5 w-full overflow-hidden rounded-full">
        {/* Preenchimento nas cores do MonitoraSom */}
        <div
          className="liquid-glass-slider-fill h-full rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Cápsula / lente Liquid Glass que desliza sobre a barra */}
      <div className="pointer-events-none absolute inset-x-[22px] top-1/2 -translate-y-1/2">
        <div
          className={`liquid-glass-slider-thumb ${
            isDragging ? "liquid-glass-slider-thumb-active" : ""
          }`}
          style={{ left: `${percent}%` }}
        />
      </div>

      {/* Input range nativo invisível por cima para manter clique, drag e teclado */}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        disabled={disabled}
        aria-label={ariaLabel}
        onPointerDown={() => !disabled && setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onPointerCancel={() => setIsDragging(false)}
        onBlur={() => setIsDragging(false)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 z-20 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
    </div>
  );
}

/**
 * Switch (botão de check) com cápsula translúcida Liquid Glass e resposta elástica.
 */
export function GlassSwitch({
  id,
  checked,
  disabled = false,
  onChange,
  ariaLabel,
  className = "",
}: GlassSwitchProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onPointerDown={() => !disabled && setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onClick={() => onChange(!checked)}
      className={`liquid-glass-switch ${
        checked ? "liquid-glass-switch-on" : "liquid-glass-switch-off"
      } ${disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"} ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className={`liquid-glass-switch-thumb ${
          checked ? "liquid-glass-switch-thumb-on" : ""
        } ${isPressed ? "liquid-glass-switch-thumb-pressed" : ""}`}
      />
    </button>
  );
}

export default GlassView;