import React, { useState, useEffect } from "react";
import { styleReset } from "react95";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import ms_sans_serif from "react95/dist/fonts/ms_sans_serif.woff2";
import ms_sans_serif_bold from "react95/dist/fonts/ms_sans_serif_bold.woff2";
import "./styles.css";
import { Desktop } from "./components/desktop/Desktop";
import dactarImage from "../dactar.jpg";

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
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [insertedImage, setInsertedImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);

  // Load default image on mount
  useEffect(() => {
    const loadDefaultImage = async () => {
      try {
        const response = await fetch(dactarImage);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") {
            setInsertedImage(result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to load default image:", error);
      }
    };

    loadDefaultImage();
  }, []);

  return (
    <div>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <Desktop
          isExcelOpen={isExcelOpen}
          onOpenExcel={() => setIsExcelOpen(true)}
          onCloseExcel={() => setIsExcelOpen(false)}
          insertedImage={insertedImage}
          imageScale={imageScale}
          onImageChange={setInsertedImage}
          onImageScaleChange={setImageScale}
        />
      </ThemeProvider>
    </div>
  );
}

export default App;
