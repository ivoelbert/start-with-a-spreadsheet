import React from "react";
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
  return (
    <div>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <div className="app-container">
          <Window className="window">
            <WindowHeader>Microsoft Excel - Classeur1</WindowHeader>
            <WindowContent className="window-content">
              <Toolbar className="toolbar">
                <Button size="sm">File</Button>
                <Button size="sm">Edit</Button>
                <Button size="sm">View</Button>
                <Button size="sm">Insert</Button>
                <Button size="sm">Format</Button>
              </Toolbar>

              <div className="spreadsheet-container">
                <div className="spreadsheet-grid">
                  {/* Top-left corner cell */}
                  <div className="cell-corner"></div>

                  {/* Column headers (A-Z) */}
                  {Array.from({ length: 26 }, (_, i) => (
                    <div key={`col-${i}`} className="cell-header col-header">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}

                  {/* Rows with row headers + data cells */}
                  {Array.from({ length: 100 }, (_, rowIdx) => (
                    <React.Fragment key={`row-${rowIdx}`}>
                      <div className="cell-header row-header">
                        {rowIdx + 1}
                      </div>
                      {Array.from({ length: 26 }, (_, colIdx) => (
                        <div key={`${rowIdx}-${colIdx}`} className="cell-data"></div>
                      ))}
                    </React.Fragment>
                  ))}
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
