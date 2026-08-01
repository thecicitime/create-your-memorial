"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, Rect, IText, Path } from "fabric";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<Canvas | null>(null);

  const [stoneColor, setStoneColor] = useState("#15161a");
  const [shape, setShape] = useState("serpentine");

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, { 
      width: 700, 
      height: 980, 
      backgroundColor: "#eae6dd" 
    });
    canvasInstance.current = canvas;
    return () => { canvas.dispose(); };
  }, []);

  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;

    canvas.clear();

    if (shape === "flat") {
      canvas.set("backgroundColor", "#5b7543");

      // Flat 모양
      const flatStone = new Path("M 40,460 L 40,40 Q 40,20 60,20 L 420,20 Q 440,20 440,40 L 440,460 Q 440,480 420,480 L 60,480 Q 40,480 40,460 Z", {
        top: 400, left: 130, fill: stoneColor, stroke: "#3a3c42", strokeWidth: 3, selectable: false
      });
      canvas.add(flatStone);

      // Flat 비석 내부 중앙 정렬된 텍스트 및 모티프
      const t1 = new IText("COLE", { top: 435, fontSize: 46, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 140 });
      const t2 = new IText("Margaret Anne Cole", { top: 505, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 20 });
      const t3 = new IText("1946 ✦ 2023", { top: 560, fontSize: 13, fill: "#cccccc", fontFamily: "'Cormorant Garamond', serif" });
      const heart = new Path("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z", { top: 600, scaleX: 0.38, scaleY: 0.38, fill: "#b0b3b8" });
      const t4 = new IText("Forever in our hearts", { top: 655, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" });

      canvas.add(t1, t2, t3, heart, t4);
      [flatStone, t1, t2, t3, heart, t4].forEach(obj => canvas.centerObjectH(obj));

    } else {
      canvas.set("backgroundColor", "#eae6dd");

      // Serpentine top 모양 (받침대 높이 50% 향상된 상태 유지)
      const combinedStone = new Path("M 50,440 L 50,150 Q 50,20 210,20 Q 370,20 370,150 L 370,440 L 430,440 L 430,515 L -10,515 L -10,440 Z", {
        top: 380, left: 140, fill: stoneColor, selectable: false
      });
      
      canvas.add(combinedStone);

      // Serpentine 비석 내부 중앙에 완벽히 들어맞도록 수직 위치 조정
      const t1 = new IText("COLE", { top: 425, fontSize: 46, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 140 });
      const t2 = new IText("Margaret Anne Cole", { top: 505, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 20 });
      const t3 = new IText("1946 ✦ 2023", { top: 565, fontSize: 13, fill: "#cccccc", fontFamily: "'Cormorant Garamond', serif", charSpacing: 10 });
      const heart = new Path("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z", { top: 605, scaleX: 0.4, scaleY: 0.4, fill: "#b0b3b8" });
      const t4 = new IText("Forever in our hearts", { top: 665, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" });

      canvas.add(t1, t2, t3, heart, t4);
      [combinedStone, t1, t2, t3, heart, t4].forEach(obj => canvas.centerObjectH(obj));
    }

    canvas.renderAll();
  }, [stoneColor, shape]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", backgroundColor: "#efece6", overflow: "hidden", fontFamily: "sans-serif" }}>
      <link href="https://googleapis.com" rel="stylesheet" />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 30px", borderBottom: "1px solid #dfdad0", backgroundColor: "#f9f8f6" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: "bold" }}>The Stone & Studio <span style={{ fontSize: "11px", fontFamily: "sans-serif", color: "#888" }}>design a memorial together</span></div>
      </header>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside style={{ width: "260px", backgroundColor: "#f9f8f6", padding: "15px", borderRight: "1px solid #dfdad0" }}>
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ fontSize: "11px", color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>ON THE STONE</h4>
            {["TEXT: COLE", "MOTIF: Scroll divider", "TEXT: Margaret Anne...", "TEXT: 1946 ✦ 2023"].map((l, i) => <div key={i} style={{ fontSize: "12px", padding: "6px 0", borderBottom: "1px solid #f3f0ea" }}>{l}</div>)}
          </div>
        </aside>
        <main style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f1ede4" }}><canvas ref={canvasRef} /></main>
        <aside style={{ width: "360px", backgroundColor: "#f9f8f6", padding: "20px", borderLeft: "1px solid #dfdad0", display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "15px" }}>
            <h4>THE STONE</h4>
            <span style={{ fontSize: "12px", color: "#888" }}>Granite</span>
            <div style={{ display: "flex", gap: "8px", margin: "10px 0" }}>
              {["#15161a", "#292b33", "#747885", "#56382d", "#aa8986", "#3d4757"].map((c) => (
                <div key={c} onClick={() => setStoneColor(c)} style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: c, cursor: "pointer", border: stoneColor === c ? "3px solid #5a644e" : "1px solid #ddd" }}></div>
              ))}
            </div>
            <select value={shape} onChange={(e) => setShape(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px" }}><option value="serpentine">Serpentine top</option><option value="flat">Flat</option></select>
          </div>
        </aside>
      </div>
    </div>
  );
}