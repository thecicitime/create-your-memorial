"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, IText, Path } from "fabric";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<Canvas | null>(null);

  const [stoneColor, setStoneColor] = useState("#15161a");
  const [shape, setShape] = useState("serpentine");

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, { 
      width: 1000, 
      height: 750, 
      backgroundColor: "#F2F0ED" 
    });
    canvasInstance.current = canvas;
    return () => { 
      canvas.dispose(); 
      canvasInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;

    canvas.clear();

    if (shape === "flat") {
      canvas.set("backgroundColor", "#4B612C");

      // Flat 비석 위치 조정 (잘리지 않도록 top값 조정)
      const flatStone = new Path(
        "M 40,460 L 40,40 Q 40,20 60,20 L 420,20 Q 440,20 440,40 L 440,460 Q 440,480 420,480 L 60,480 Q 40,480 40,460 Z",
        {
          originX: "center",
          originY: "center",
          left: 500,
          top: 360,
          scaleX: 1.5,
          scaleY: 0.7,
          fill: stoneColor,
          stroke: "#3a3c42",
          strokeWidth: 3,
          selectable: false,
        }
      );
      canvas.add(flatStone);

      const t1 = new IText("Hello", { 
        top: 265, 
        fontSize: 30, 
        fill: "#ffffff", 
        fontFamily: "'Cormorant Garamond', serif", 
        charSpacing: 140 
      });
      const t2 = new IText("Honor Life", { 
        top: 315, 
        fontSize: 55, 
        fill: "#ffffff", 
        fontFamily: "'Cormorant Garamond', serif", 
        charSpacing: 20 
      });
      const t3 = new IText("1946 ✦ 2023", { 
        top: 380, 
        fontSize: 35, 
        fill: "#cccccc", 
        fontFamily: "'Cormorant Garamond', serif" 
      });
      const heart = new Path("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z", { 
        top: 420, 
        scaleX: 0.35, 
        scaleY: 0.35, 
        fill: "#b0b3b8" 
      });
      const t4 = new IText("Forever in our hearts", { 
        top: 465, 
        fontSize: 25, 
        fill: "#ffffff", 
        fontFamily: "'Cormorant Garamond', serif", 
        fontStyle: "italic" 
      });

      canvas.add(t1, t2, t3, heart, t4);
      [flatStone, t1, t2, t3, heart, t4].forEach(obj => canvas.centerObjectH(obj));

    } else {
      canvas.set("backgroundColor", "#F2F0ED");

      // Serpentine 비석 상단이 잘리지 않도록 top 값을 적절히 조정 (320px)
      const combinedStone = new Path("M 50,440 L 50,150 Q 50,20 210,20 Q 370,20 370,150 L 370,440 L 430,440 L 430,515 L -10,515 L -10,440 Z", {
        top: 320, left: 140, fill: stoneColor, selectable: false
      });
      
      canvas.add(combinedStone);

      // 내부 텍스트들도 상단에 여백을 두고 배치되도록 위치 수정
      const t1 = new IText("Honor Life", { top: 200, fontSize: 46, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 80 });
      const t2 = new IText("Honoring Life & Legacy", { top: 245, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 20 });
      const t3 = new IText("1946 ✦ 2026", { top: 305, fontSize: 22, fill: "#cccccc", fontFamily: "'Cormorant Garamond', serif", charSpacing: 10 });
      const heart = new Path("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z", { top: 365, scaleX: 0.4, scaleY: 0.4, fill: "#b0b3b8" });
      const t4 = new IText("Memorials Handcrafted in Vista, CA", { top: 405, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" });

      canvas.add(t1, t2, t3, heart, t4);
      [combinedStone, t1, t2, t3, heart, t4].forEach(obj => canvas.centerObjectH(obj));
    }

    canvas.renderAll();
  }, [stoneColor, shape]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", backgroundColor: "#efece6", overflow: "hidden", fontFamily: "sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 30px", borderBottom: "1px solid #dfdad0", backgroundColor: "#f9f8f6", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: "bold" }}>
          The Stone & Studio <span style={{ fontSize: "11px", fontFamily: "sans-serif", color: "#888", fontWeight: "normal" }}>design a memorial together</span>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "auto", width: "100%", flexWrap: "wrap" }}>
        
        {/* 왼쪽 사이드바 */}
        <aside style={{ width: "260px", minWidth: "260px", backgroundColor: "#f9f8f6", padding: "15px", borderRight: "1px solid #dfdad0", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ fontSize: "11px", color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>ON THE STONE</h4>
            {["TEXT: COLE", "MOTIF: Scroll divider", "TEXT: Margaret Anne...", "TEXT: 1946 ✦ 2023"].map((l, i) => (
              <div key={i} style={{ fontSize: "12px", padding: "6px 0", borderBottom: "1px solid #f3f0ea" }}>{l}</div>
            ))}
          </div>
        </aside>

        {/* 메인 영역 */}
        <main style={{ flex: 1, minWidth: "300px", display: "flex", justifyContent: "center", alignItems: "flex-start", backgroundColor: "#f1ede4", paddingTop: "15px", paddingBottom: "15px", paddingLeft: "10px", paddingRight: "10px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: "700px", aspectRatio: "1000 / 750", display: "flex", justifyContent: "center" }}>
            <canvas ref={canvasRef} style={{ width: "100% !important", height: "100% !important", objectFit: "contain" }} />
          </div>
        </main>

        {/* 오른쪽 사이드바 */}
        <aside style={{ width: "360px", minWidth: "360px", backgroundColor: "#f9f8f6", padding: "20px", borderLeft: "1px solid #dfdad0", display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "15px" }}>
            <h4>THE STONE</h4>
            <span style={{ fontSize: "12px", color: "#888" }}>Granite</span>
            <div style={{ display: "flex", gap: "8px", margin: "10px 0" }}>
              {["#15161a", "#292b33", "#747885", "#56382d", "#aa8986", "#3d4757"].map((c) => (
                <div key={c} onClick={() => setStoneColor(c)} style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: c, cursor: "pointer", border: stoneColor === c ? "3px solid #5a644e" : "1px solid #ddd" }}></div>
              ))}
            </div>
            <select value={shape} onChange={(e) => setShape(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px" }}>
              <option value="serpentine">Serpentine top</option>
              <option value="flat">Flat</option>
            </select>
          </div>
        </aside>

      </div>
    </div>
  );
}