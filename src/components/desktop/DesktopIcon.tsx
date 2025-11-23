import React, { useState } from "react";

interface DesktopIconProps {
  icon: string;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  icon,
  label,
  isSelected,
  onSelect,
  onDoubleClick,
}) => {
  const [clicks, setClicks] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent desktop click handler from firing

    const newClicks = clicks + 1;
    setClicks(newClicks);
    onSelect(); // Select on first click

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    const timer = setTimeout(() => {
      setClicks(0);
    }, 300);

    setClickTimer(timer);

    if (newClicks === 2) {
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
          backgroundColor: isSelected ? "navy" : "transparent",
          padding: "2px 4px",
          border: isSelected ? "1px dotted white" : "1px dotted transparent",
        }}
      >
        {label}
      </span>
    </div>
  );
};
