"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, IText, Path } from "fabric";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<Canvas | null>(null);

  const [stoneColor, setStoneColor] = useState("#15161a");
  const [shape, setShape] = useState("serpentine");
  // 캔버스에 있는 텍스트 목록을 관리하는 상태
  const [textList, setTextList] = useState<{ id: string; text: string }[]>([]);

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

  // 캔버스 내 텍스트 리스트를 최신화하는 함수
  const updateTextList = () => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    const texts: { id: string; text: string }[] = [];
    
    canvas.getObjects().forEach((obj) => {
      if (obj instanceof IText) {
        texts.push({ id: obj.cacheKey || Math.random().toString(), text: obj.text || "" });
      }
    });
    setTextList(texts);
  };

  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;

    canvas.clear();

    if (shape === "flat") {
      canvas.set("backgroundColor", "#4B612C");

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
          evented: false,
        }
      );
      canvas.add(flatStone);

      const t1 = new IText("Hello", { top: 265, fontSize: 30, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 140 });
      const t2 = new IText("Honor Life", { top: 315, fontSize: 55, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 20 });
      const t3 = new IText("1946 ✦ 2023", { top: 380, fontSize: 35, fill: "#cccccc", fontFamily: "'Cormorant Garamond', serif" });
      const t4 = new IText("Forever in our hearts", { top: 465, fontSize: 25, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" });

      canvas.add(t1, t2, t3, t4);
      [flatStone, t1, t2, t3, t4].forEach(obj => canvas.centerObjectH(obj));

    } else {
      canvas.set("backgroundColor", "#F2F0ED");

      const combinedStone = new Path("M 50,440 L 50,150 Q 50,20 210,20 Q 370,20 370,150 L 370,440 L 430,440 L 430,515 L -10,515 L -10,440 Z", {
        top: 350, left: 140, fill: stoneColor, selectable: false, evented: false
      });
      
      canvas.add(combinedStone);

      const t1 = new IText("Honor Life", { top: 195, fontSize: 46, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 80 });
      const t2 = new IText("Honoring Life & Legacy", { top: 275, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 20 });
      const t3 = new IText("1946 ✦ 2026", { top: 335, fontSize: 22, fill: "#cccccc", fontFamily: "'Cormorant Garamond', serif", charSpacing: 10 });
      const t4 = new IText("Memorials Handcrafted in Vista, CA", { top: 435, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" });

      canvas.add(t1, t2, t3, t4);
      [combinedStone, t1, t2, t3, t4].forEach(obj => canvas.centerObjectH(obj));
    }

    canvas.renderAll();
    updateTextList();

    // 캔버스 객체 변경 시 리스트 실시간 동기화
    canvas.on("object:added", updateTextList);
    canvas.on("object:removed", updateTextList);
    canvas.on("text:changed", updateTextList);

    return () => {
      canvas.off("object:added", updateTextList);
      canvas.off("object:removed", updateTextList);
      canvas.off("text:changed", updateTextList);
    };
  }, [stoneColor, shape]);

  // ✦ 새 텍스트 추가 함수
  const addCustomText = () => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;

    const newText = new IText("Click to edit", {
      top: 500,
      fontSize: 24,
      fill: "#ffffff",
      fontFamily: "'Cormorant Garamond', serif",
    });

    canvas.add(newText);
    canvas.centerObjectH(newText);
    canvas.setActiveObject(newText);
    canvas.renderAll();
    updateTextList();
  };

  // ✦ 모양(Motif) 추가 드롭다운 핸들러
  const handleAddMotif = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value || !canvasInstance.current) return;
    const canvas = canvasInstance.current;

    let pathData = "";
    if (value === "cross") {
      pathData = "M 35,10 L 65,10 L 65,35 L 90,35 L 90,65 L 65,65 L 65,90 L 35,90 L 35,65 L 10,65 L 10,35 L 35,35 Z";
    } else if (value === "heart") {
      pathData = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z";
    } else if (value === "flower") {
      pathData = "M 50,30 Q 70,10 70,30 Q 90,50 70,50 Q 70,70 50,50 Q 30,70 30,50 Q 10,50 30,30 Q 30,10 50,30 Z";
    }

    const motifObj = new Path(pathData, {
      top: 450,
      scaleX: 0.35,
      scaleY: 0.35,
      fill: "#b0b3b8",
      selectable: true,
    });

    canvas.add(motifObj);
    canvas.centerObjectH(motifObj);
    canvas.setActiveObject(motifObj);
    canvas.renderAll();

    e.target.value = ""; // 드롭다운 초기화
  };

  // ✦ 선택된 요소 삭제 함수
  const deleteSelected = () => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        if (obj.selectable !== false) {
          canvas.remove(obj);
        }
      });
      canvas.discardActiveObject();
      canvas.renderAll();
      updateTextList();
    } else {
      alert("Please select text or a motif to delete!");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", backgroundColor: "#efece6", overflow: "hidden", fontFamily: "sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 30px", borderBottom: "1px solid #dfdad0", backgroundColor: "#f9f8f6", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: "bold" }}>
          The Stone & Studio <span style={{ fontSize: "11px", fontFamily: "sans-serif", color: "#888", fontWeight: "normal" }}>design a memorial together</span>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "auto", width: "100%", flexWrap: "wrap" }}>
        
        {/* 왼쪽 사이드바: 텍스트 리스트 및 요소 추가·삭제 패널 */}
        <aside style={{ width: "260px", minWidth: "260px", backgroundColor: "#f9f8f6", padding: "15px", borderRight: "1px solid #dfdad0", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column", gap: "15px" }}>
          
          {/* 1. ON THE STONE 텍스트 리스트 */}
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ fontSize: "11px", color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>ON THE STONE</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "150px", overflowY: "auto" }}>
              {textList.map((item, i) => (
                <div key={i} style={{ fontSize: "12px", padding: "6px 0", borderBottom: "1px solid #f3f0ea", color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  TEXT: {item.text}
                </div>
              ))}
            </div>
            <button onClick={addCustomText} style={{ width: "100%", marginTop: "10px", padding: "8px", backgroundColor: "#5a644e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>+ Add New Text</button>
          </div>

          {/* 2. 별도의 모양 추가 드롭박스 메뉴 */}
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ fontSize: "11px", color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>ADD MOTIF</h4>
            <select onChange={handleAddMotif} defaultValue="" style={{ width: "100%", padding: "10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
              <option value="" disabled>Select a motif...</option>
              <option value="cross">Add Cross</option>
              <option value="heart">Add Heart</option>
              <option value="flower">Add Flower</option>
            </select>
          </div>

          {/* 3. 삭제 버튼 */}
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ fontSize: "11px", color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>EDIT / DELETE</h4>
            <p style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>Double-click text to edit. Select any item and click below to delete.</p>
            <button onClick={deleteSelected} style={{ width: "100%", padding: "8px", backgroundColor: "#b91c1c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Delete Selected</button>
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