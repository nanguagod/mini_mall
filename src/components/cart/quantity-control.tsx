"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  quantity: number;
  stock: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

/**
 * 数量调节组件（+ / - 按钮 + 数字显示）
 * 用于购物车和后续可能需要调节数量的场景
 */
export default function QuantityControl({
  quantity,
  stock,
  disabled = false,
  onDecrease,
  onIncrease,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-tertiary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="减少数量"
      >
        <Minus className="w-3.5 h-3.5 text-text-secondary" />
      </button>
      <span className="w-10 text-center text-sm font-medium text-text-primary">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={disabled || quantity >= stock}
        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-tertiary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="增加数量"
      >
        <Plus className="w-3.5 h-3.5 text-text-secondary" />
      </button>
    </div>
  );
}
