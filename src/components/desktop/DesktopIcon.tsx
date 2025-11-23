import React, { useState } from "react";

interface DesktopIconProps {
  icon: string;
  label: string;
  onDoubleClick: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  icon,
  label,
  onDoubleClick,
}) => {
  const [clicks, setClicks] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    setClicks((prev) => prev + 1);

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    const timer = setTimeout(() => {
      setClicks(0);
    }, 300);

    setClickTimer(timer);

    if (clicks + 1 === 2) {
      onDoubleClick();
      setClicks(0);
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        padding: "8px",
        userSelect: "none",
      }}
    >
      <img
        src={icon}
        alt={label}
        style={{
          width: "48px",
          height: "48px",
          marginBottom: "4px",
          objectFit: "cover",
        }}
      />
      <span
        style={{
          color: "white",
          fontSize: "11px",
          textAlign: "center",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
          fontFamily: "ms_sans_serif",
        }}
      >
        {label}
      </span>
    </div>
  );
};
