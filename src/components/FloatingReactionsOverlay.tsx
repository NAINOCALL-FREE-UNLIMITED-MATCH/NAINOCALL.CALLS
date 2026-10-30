import React from 'react';
import { FloatingReaction } from '../types/meeting';

interface FloatingReactionsOverlayProps {
  reactions: FloatingReaction[];
}

export const FloatingReactionsOverlay: React.FC<FloatingReactionsOverlayProps> = ({ reactions }) => {
  if (reactions.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-20 flex flex-col items-center animate-[floatUp_3.2s_ease-out_forwards]"
          style={{
            left: `${r.xPercent}%`,
          }}
        >
          <span className="text-3xl select-none filter drop-shadow-md">{r.emoji}</span>
          <span className="text-[10px] text-white/90 bg-slate-900/80 px-1.5 py-0.5 rounded mt-1 font-medium whitespace-nowrap shadow-sm backdrop-blur-sm">
            {r.senderName}
          </span>
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            transform: translateY(-20px) scale(1.15);
            opacity: 1;
          }
          40% {
            transform: translateY(-60px) scale(1);
            opacity: 0.95;
          }
          100% {
            transform: translateY(-180px) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
