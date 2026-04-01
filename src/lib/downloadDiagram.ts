const TITLE_HEIGHT = 56; // 제목 영역 높이 (px)
const FOOTER_HEIGHT = 28; // 하단 여백
const FOOTER_BRAND_TEXT = "SSSEREGI";
const FOOTER_LOGO_SRC = "/ssseregi_logo.png";

export async function downloadDiagramAsPng(filename = "흐름도"): Promise<void> {
  const svg = document.getElementById("sankey-svg") as SVGSVGElement | null;
  if (!svg) return;

  const svgWidth = svg.width.baseVal.value || svg.viewBox.baseVal.width || svg.clientWidth || 900;
  const svgHeight = svg.height.baseVal.value || svg.viewBox.baseVal.height || svg.clientHeight || 540;
  const totalHeight = svgHeight + TITLE_HEIGHT + FOOTER_HEIGHT;
  const scale = 2;

  const cloned = svg.cloneNode(true) as SVGSVGElement;
  cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  cloned.setAttribute("width", String(svgWidth));
  cloned.setAttribute("height", String(svgHeight));
  cloned.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  // text 엘리먼트에 font-family 인라인 적용
  cloned.querySelectorAll("text").forEach((el) => {
    el.setAttribute("font-family", "system-ui, -apple-system, 'Apple SD Gothic Neo', sans-serif");
  });

  const svgString = new XMLSerializer().serializeToString(cloned);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svgWidth * scale;
      canvas.height = totalHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(); return; }

      ctx.scale(scale, scale);

      // 배경
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, svgWidth, totalHeight);

      // 제목 영역 흰 배경
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, svgWidth, TITLE_HEIGHT);

      // 제목 텍스트
      ctx.fillStyle = "#0f172a";
      ctx.font = `bold 22px system-ui, -apple-system, 'Apple SD Gothic Neo', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(filename, svgWidth / 2, TITLE_HEIGHT / 2);

      // 제목 아래 구분선
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, TITLE_HEIGHT);
      ctx.lineTo(svgWidth, TITLE_HEIGHT);
      ctx.stroke();

      // 차트 본문 (흰 배경)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, TITLE_HEIGHT, svgWidth, svgHeight);
      ctx.drawImage(img, 0, TITLE_HEIGHT, svgWidth, svgHeight);

      const finalize = () => {
        URL.revokeObjectURL(url);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) { reject(); return; }
          const a = document.createElement("a");
          a.href = URL.createObjectURL(pngBlob);
          a.download = `${filename}.png`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          resolve();
        }, "image/png");
      };

      const footerY = TITLE_HEIGHT + svgHeight + FOOTER_HEIGHT / 2;
      const drawFooterTextOnly = () => {
        ctx.fillStyle = "#94a3b8";
        ctx.font = `12px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(FOOTER_BRAND_TEXT, svgWidth / 2, footerY);
      };

      const logo = new Image();
      logo.onload = () => {
        ctx.font = `12px system-ui, -apple-system, sans-serif`;
        const textWidth = ctx.measureText(FOOTER_BRAND_TEXT).width;
        const logoSize = 12;
        const gap = 6;
        const groupWidth = logoSize + gap + textWidth;
        const startX = svgWidth / 2 - groupWidth / 2;

        ctx.drawImage(logo, startX, footerY - logoSize / 2, logoSize, logoSize);

        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(FOOTER_BRAND_TEXT, startX + logoSize + gap, footerY);
        finalize();
      };

      logo.onerror = () => {
        drawFooterTextOnly();
        finalize();
      };

      logo.src = FOOTER_LOGO_SRC;
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}
