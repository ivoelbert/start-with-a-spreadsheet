import React, { useState, useRef } from "react";
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
  const viewButtonRef = useRef<HTMLButtonElement>(null);
  const [densityConfig, setDensityConfig] = useState<DensityConfig>(() => {
    const defaultConfig = createDefaultDensityConfig();
    return {
      ...defaultConfig,
      increaseMultiplier: 0.9, // Start at 0.9x build speed
      decayMultiplier: 0.9, // Start at 0.9x fade speed
      influenceRadius: 300, // Start at 300px brush size
      velocityInfluence: 0.75, // Start at 75% speed boost
    };
  });

  const handleConfigChange = (changes: Partial<DensityConfig>) => {
    setDensityConfig((prev) => ({ ...prev, ...changes }));
  };

  return (
    <div>
      <GlobalStyles />
      <ThemeProvider theme={original}>
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
                    />
                  </div>
                )}
                <div className="spreadsheet-container" style={{ flex: 1 }}>
                  <DensitySpreadsheet
                    debugMode={debugMode}
                    densityConfig={densityConfig}
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
