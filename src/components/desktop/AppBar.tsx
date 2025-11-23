import React, { useState, useRef, useEffect } from "react";
import {
  AppBar as React95AppBar,
  Toolbar,
  Button,
  MenuList,
  MenuListItem,
  Separator,
} from "react95";

interface AppBarProps {
  onOpenExcel: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ onOpenExcel }) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const startButtonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedButton = startButtonRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedButton && !clickedMenu) {
        setStartMenuOpen(false);
      }
    };

    if (startMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [startMenuOpen]);

  const handleExcelClick = () => {
    setStartMenuOpen(false);
    onOpenExcel();
  };

  return (
    <React95AppBar style={{ position: "relative" }}>
      <Toolbar style={{ justifyContent: "space-between" }}>
        <div
          style={{ position: "relative", display: "inline-block" }}
          ref={startButtonRef}
        >
          <Button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            active={startMenuOpen}
            style={{ fontWeight: "bold" }}
          >
            Start
          </Button>
          {startMenuOpen && (
            <MenuList
              ref={menuRef}
              style={{
                position: "absolute",
                left: "0",
                bottom: "100%",
                minWidth: "200px",
              }}
            >
              <MenuListItem onClick={handleExcelClick}>
                Microsoft Excel
              </MenuListItem>
              <Separator />
              <MenuListItem disabled>About</MenuListItem>
            </MenuList>
          )}
        </div>
      </Toolbar>
    </React95AppBar>
  );
};
