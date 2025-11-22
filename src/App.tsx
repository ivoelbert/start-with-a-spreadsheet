import React, { useState } from "react";
import {
  Window,
  WindowHeader,
  WindowContent,
  Toolbar,
  Button,
  styleReset,
} from "react95";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import ms_sans_serif from "react95/dist/fonts/ms_sans_serif.woff2";
import ms_sans_serif_bold from "react95/dist/fonts/ms_sans_serif_bold.woff2";
import "./styles.css";
import { DensitySpreadsheet } from "./components/DensitySpreadsheet";

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

  return (
    <div>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <div className="app-container">
          <Window className="window">
            <WindowHeader>Microsoft Excel - Density Spreadsheet Demo</WindowHeader>
            <WindowContent className="window-content">
              <Toolbar className="toolbar">
                <Button size="sm">File</Button>
                <Button size="sm">Edit</Button>
                <Button size="sm">View</Button>
                <Button size="sm">Insert</Button>
                <Button size="sm">Format</Button>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                  <Button
                    size="sm"
                    onClick={() => setDebugMode(!debugMode)}
                    active={debugMode}
                  >
                    Debug Mode
                  </Button>
                </div>
              </Toolbar>

              <div className="spreadsheet-container">
                <DensitySpreadsheet debugMode={debugMode} />
              </div>
            </WindowContent>
          </Window>
        </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
