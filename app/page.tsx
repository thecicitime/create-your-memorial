"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, IText, Path } from "fabric";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<Canvas | null>(null);

  const [stoneColor, setStoneColor] = useState("#15161a");
  const [shape, setShape] = useState("serpentine");
  // 리스트 관리를 위해 고유 id와 개체 참조를 포함하도록 수정
  const [objectList, setObjectList] = useState<{ id: any; name: string; isLocked: boolean; type: string }[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, { 
      width: 1000, 
      height: 750, 
      backgroundColor: "#F2F0ED" 
    });
    canvasInstance.current = canvas;

    loadInitialDesign(canvas, shape, stoneColor);

    const syncList = () => updateObjectList();
    canvas.on("object:added", syncList);
    canvas.on("object:removed", syncList);
    canvas.on("text:changed", syncList);
    canvas.on("object:modified", syncList);

    return () => { 
      canvas.dispose(); 
      canvasInstance.current = null;
    };
  }, []);

  const loadInitialDesign = (canvas: Canvas, currentShape: string, color: string) => {
    canvas.clear();

    if (currentShape === "flat") {
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
          fill: color,
          stroke: "#3a3c42",
          strokeWidth: 3,
          selectable: false,
          evented: false,
          name: "stoneBackground",
        }
      );
      canvas.add(flatStone);

      const t1 = new IText("Hello", { top: 265, fontSize: 30, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 140 });
      const t2 = new IText("Honor Life", { top: 315, fontSize: 55, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 20 });
      const t3 = new IText("1946 ✦ 2023", { top: 380, fontSize: 35, fill: "#cccccc", fontFamily: "'Cormorant Garamond', serif" });
      const t4 = new IText("Forever in our hearts", { top: 465, fontSize: 25, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" });

      // 디폴트 하트 모티브 추가
      const defaultHeart = new Path("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z", {
        top: 415,
        scaleX: 0.35,
        scaleY: 0.35,
        fill: "#b0b3b8",
        selectable: true,
      });

      canvas.add(t1, t2, t3, defaultHeart, t4);
      [flatStone, t1, t2, t3, defaultHeart, t4].forEach(obj => canvas.centerObjectH(obj));

    } else {
      canvas.set("backgroundColor", "#F2F0ED");

      const combinedStone = new Path("M 50,440 L 50,150 Q 50,20 210,20 Q 370,20 370,150 L 370,440 L 430,440 L 430,515 L -10,515 L -10,440 Z", {
        top: 350, left: 140, fill: color, selectable: false, evented: false,
        name: "stoneBackground",
      });
      
      canvas.add(combinedStone);

      const t1 = new IText("Honor Life", { top: 195, fontSize: 46, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 80 });
      const t2 = new IText("Honoring Life & Legacy", { top: 275, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: 20 });
      const t3 = new IText("1946 ✦ 2026", { top: 335, fontSize: 22, fill: "#cccccc", fontFamily: "'Cormorant Garamond', serif", charSpacing: 10 });
      
      // 디폴트 하트 모티브 추가
      const defaultHeart = new Path("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z", {
        top: 380,
        scaleX: 0.4,
        scaleY: 0.4,
        fill: "#b0b3b8",
        selectable: true,
      });

      const t4 = new IText("Memorials Handcrafted in Vista, CA", { top: 435, fontSize: 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" });

      canvas.add(t1, t2, t3, defaultHeart, t4);
      [combinedStone, t1, t2, t3, defaultHeart, t4].forEach(obj => canvas.centerObjectH(obj));
    }

    canvas.renderAll();
    updateObjectList();
  };

  useEffect(() => {
    if (!canvasInstance.current) return;
    loadInitialDesign(canvasInstance.current, shape, stoneColor);
  }, [shape]);

  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    
    canvas.getObjects().forEach((obj: any) => {
      if (obj.name === "stoneBackground" || obj.selectable === false && !obj.evented) {
        if (obj.name === "stoneBackground") obj.set("fill", stoneColor);
      }
    });
    canvas.renderAll();
  }, [stoneColor]);

  // 캔버스 개체 리스트 동기화
  const updateObjectList = () => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    const list: { id: any; name: string; isLocked: boolean; type: string }[] = [];
    
    canvas.getObjects().forEach((obj: any) => {
      if (obj.name !== "stoneBackground") {
        if (obj instanceof IText) {
          list.push({
            id: obj,
            name: `Text: ${obj.text || "Empty"}`,
            isLocked: !obj.selectable,
            type: "text"
          });
        } else if (obj instanceof Path) {
          list.push({
            id: obj,
            name: "Motif (Icon)",
            isLocked: !obj.selectable,
            type: "motif"
          });
        }
      }
    });
    setObjectList(list);
  };

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
    updateObjectList();
  };

  const handleAddMotif = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value || !canvasInstance.current) return;
    const canvas = canvasInstance.current;

    let pathData = "";
    if (value === "cross") {
      // ✦ 기독교 라틴 십자가(Latin Cross) 정교한 패스 데이터
      pathData = "M 42,10 L 58,10 L 58,35 L 85,35 L 85,50 L 58,50 L 58,95 L 42,95 L 42,50 L 15,50 L 15,35 L 42,35 Z";
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

    e.target.value = "";
  };

  // 개별 객체 잠금/해제 토글
  const toggleLockObject = (obj: any) => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    
    const currentSelectable = obj.selectable;
    obj.set({
      selectable: !currentSelectable,
      evented: !currentSelectable,
    });
    canvas.discardActiveObject();
    canvas.renderAll();
    updateObjectList();
  };

  // 개별 객체 삭제
  const deleteObject = (obj: any) => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;

    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.renderAll();
    updateObjectList();
  };

  const downloadImage = () => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;

    canvas.discardActiveObject();
    canvas.renderAll();

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "memorial-design.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", backgroundColor: "#efece6", overflow: "hidden", fontFamily: "sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 30px", borderBottom: "1px solid #dfdad0", backgroundColor: "#f9f8f6", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: "bold" }}>
          The Stone & Studio <span style={{ fontSize: "11px", fontFamily: "sans-serif", color: "#888", fontWeight: "normal" }}>design a memorial together</span>
        </div>
        <button onClick={downloadImage} style={{ padding: "8px 18px", backgroundColor: "#2b2d42", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          💾 Save & Download
        </button>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "auto", width: "100%", flexWrap: "wrap" }}>
        
        {/* 왼쪽 사이드바 */}
        <aside style={{ width: "260px", minWidth: "260px", backgroundColor: "#f9f8f6", padding: "15px", borderRight: "1px solid #dfdad0", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column", gap: "15px" }}>
          
          {/* ON THE STONE 리스트 (각 항목별 자물쇠 및 휴지통 아이콘 추가) */}
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ fontSize: "11px", color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>ON THE STONE</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
              {objectList.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", padding: "4px 0", borderBottom: "1px solid #f3f0ea", color: "#333" }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                    {item.name}
                  </span>
                  <div style={{ display: "flex", gap: "6px", cursor: "pointer", fontSize: "14px" }}>
                    {/* 자물쇠 아이콘 (클릭 시 잠금/해제 전환) */}
                    <span onClick={() => toggleLockObject(item.id)} title={item.isLocked ? "Unlock" : "Lock"}>
                      {item.isLocked ? "🔒" : "🔓"}
                    </span>
                    {/* 휴지통 아이콘 (클릭 시 삭제) */}
                    <span onClick={() => deleteObject(item.id)} title="Delete">
                      🗑️
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addCustomText} style={{ width: "100%", marginTop: "10px", padding: "8px", backgroundColor: "#5a644e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>+ Add New Text</button>
          </div>

          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ fontSize: "11px", color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>ADD MOTIF</h4>
            <select onChange={handleAddMotif} defaultValue="" style={{ width: "100%", padding: "10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
              <option value="" disabled>Select a motif...</option>
              <option value="cross">Add Cross</option>
              <option value="heart">Add Heart</option>
              <option value="flower">Add Flower</option>
            </select>
          </div>

        </aside>

        {/* 메인 영역 */}
        <main style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", backgroundColor: "#f1ede4", paddingTop: "15px", paddingBottom: "15px", paddingLeft: "10px", paddingRight: "10px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: "700px", aspectRatio: "1000 / 750", display: "flex", justifyContent: "center" }}>
            <canvas ref={canvasRef} style={{ width: "100% !important", height: "100% !important", objectFit: "contain" }} />
          </div>
          <button onClick={downloadImage} style={{ marginTop: "15px", marginBottom: "15px", padding: "12px 24px", backgroundColor: "#2b2d42", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            📥 Download Design (PNG)
          </button>
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