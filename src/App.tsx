import React, { useState, useRef, useEffect } from "react";
import {
  Window,
  WindowHeader,
  WindowContent,
  Toolbar,
  Button,
  MenuList,
  MenuListItem,
  Separator,
  styleReset,
} from "react95";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import ms_sans_serif from "react95/dist/fonts/ms_sans_serif.woff2";
import ms_sans_serif_bold from "react95/dist/fonts/ms_sans_serif_bold.woff2";
import "./styles.css";
import { DensitySpreadsheet } from "./components/DensitySpreadsheet";
import { DensityControls } from "./components/DensityControls";
import { Checkmark } from "./components/Checkmark";
import { createDefaultDensityConfig } from "./utils/density";
import type { DensityConfig } from "./types/spreadsheet";

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal
  }
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
`;

export function App() {
  const [debugMode, setDebugMode] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [insertedImage, setInsertedImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const viewButtonRef = useRef<HTMLButtonElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const insertButtonRef = useRef<HTMLButtonElement>(null);
  const insertMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [densityConfig, setDensityConfig] = useState<DensityConfig>(() => {
    const defaultConfig = createDefaultDensityConfig();
    return {
      ...defaultConfig,
      increaseMultiplier: 0.9, // Start at 0.9x build speed
      decayMultiplier: 0.9, // Start at 0.9x fade speed
      influenceRadius: 300, // Start at 300px brush size
      // velocityInfluence and interpolationDensity use defaults from createDefaultDensityConfig (8.0x and 5.0x)
    };
  });

  const handleConfigChange = (changes: Partial<DensityConfig>) => {
    setDensityConfig((prev) => ({ ...prev, ...changes }));
  };

  const handleImageInsert = () => {
    setShowInsertMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setInsertedImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check View menu
      if (showViewMenu) {
        const clickedButton = viewButtonRef.current?.contains(target);
        const clickedMenu = viewMenuRef.current?.contains(target);
        if (!clickedButton && !clickedMenu) {
          setShowViewMenu(false);
        }
      }

      // Check Insert menu
      if (showInsertMenu) {
        const clickedButton = insertButtonRef.current?.contains(target);
        const clickedMenu = insertMenuRef.current?.contains(target);
        if (!clickedButton && !clickedMenu) {
          setShowInsertMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showViewMenu, showInsertMenu]);

  return (
    <div>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="app-container">
          <Window className="window">
            <WindowHeader>Microsoft Excel - Density Spreadsheet Demo</WindowHeader>
            <WindowContent className="window-content">
              <Toolbar className="toolbar">
                <Button variant="thin" size="sm">File</Button>
                <div style={{ position: 'relative' }}>
                  <Button
                    ref={viewButtonRef}
                    variant="thin"
                    size="sm"
                    onClick={() => setShowViewMenu(!showViewMenu)}
                    active={showViewMenu}
                  >
                    View
                  </Button>
                  {showViewMenu && (
                    <div
                      ref={viewMenuRef}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                      }}
                    >
                      <MenuList style={{ minWidth: '150px' }}>
                        <MenuListItem
                          size="sm"
                          onClick={() => setShowControls(!showControls)}
                          style={{ position: 'relative', paddingLeft: '24px' }}
                        >
                          {showControls && (
                            <span style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)' }}>
                              <Checkmark />
                            </span>
                          )}
                          Controls
                        </MenuListItem>
                        <MenuListItem
                          size="sm"
                          onClick={() => setDebugMode(!debugMode)}
                          style={{ position: 'relative', paddingLeft: '24px' }}
                        >
                          {debugMode && (
                            <span style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)' }}>
                              <Checkmark />
                            </span>
                          )}
                          Debug
                        </MenuListItem>
                      </MenuList>
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Button
                    ref={insertButtonRef}
                    variant="thin"
                    size="sm"
                    onClick={() => setShowInsertMenu(!showInsertMenu)}
                    active={showInsertMenu}
                  >
                    Insert
                  </Button>
                  {showInsertMenu && (
                    <div
                      ref={insertMenuRef}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                      }}
                    >
                      <MenuList style={{ minWidth: '150px' }}>
                        <MenuListItem
                          size="sm"
                          onClick={handleImageInsert}
                          style={{ position: 'relative', paddingLeft: '24px' }}
                        >
                          Image
                        </MenuListItem>
                        <MenuListItem
                          size="sm"
                          onClick={() => setShowInsertMenu(false)}
                          style={{ position: 'relative', paddingLeft: '24px' }}
                        >
                          Video
                        </MenuListItem>
                      </MenuList>
                    </div>
                  )}
                </div>
              </Toolbar>

              <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
                {showControls && (
                  <div
                    style={{
                      width: '250px',
                      padding: '10px',
                      borderRight: '2px solid #808080',
                      overflow: 'auto',
                    }}
                  >
                    <DensityControls
                      config={densityConfig}
                      onChange={handleConfigChange}
                      imageScale={imageScale}
                      onImageScaleChange={setImageScale}
                    />
                  </div>
                )}
                <div className="spreadsheet-container" style={{ flex: 1 }}>
                  <DensitySpreadsheet
                    debugMode={debugMode}
                    densityConfig={densityConfig}
                    insertedImage={insertedImage}
                    imageScale={imageScale}
                  />
                </div>
              </div>
            </WindowContent>
          </Window>
        </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
