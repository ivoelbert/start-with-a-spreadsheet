import React, { useState } from "react";
import { DesktopIcon } from "./DesktopIcon";
import { AppBar } from "./AppBar";
import { ExcelWindow } from "../excel/ExcelWindow";
import excelLogo from "../../Excel-Logo-1995-s.webp";

interface DesktopProps {
  isExcelOpen: boolean;
  onOpenExcel: () => void;
  onCloseExcel: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({
  isExcelOpen,
  onOpenExcel,
  onCloseExcel,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const handleDesktopClick = () => {
    setSelectedIcon(null);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Desktop content area - fills remaining space */}
      <div
        onClick={handleDesktopClick}
        style={{
          flex: 1,
          background: "rgb(0, 128, 128)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Desktop Icons */}
        <div
          style={{
            padding: "20px",
          }}
        >
          <DesktopIcon
            icon={excelLogo}
            label="Microsoft Excel"
            isSelected={selectedIcon === "excel"}
            onSelect={() => setSelectedIcon("excel")}
            onDoubleClick={() => {
              setSelectedIcon(null);
              onOpenExcel();
            }}
          />
        </div>

        {/* Excel Window */}
        {isExcelOpen && <ExcelWindow onClose={onCloseExcel} />}
      </div>

      {/* AppBar at bottom - natural flex child */}
      <AppBar onOpenExcel={onOpenExcel} isExcelOpen={isExcelOpen} />
    </div>
  );
};
