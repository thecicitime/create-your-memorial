"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, IText, Path } from "fabric";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<Canvas | null>(null);

  const [stoneColor, setStoneColor] = useState("#15161a");
  const [shape, setShape] = useState("serpentine");
  const [objectList, setObjectList] = useState<{ id: any; name: string; isLocked: boolean; type: string }[]>([]);

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isExecutingHistoryRef = useRef<boolean>(false);

  const shapeRef = useRef(shape);
  const colorRef = useRef(stoneColor);

  useEffect(() => {
    shapeRef.current = shape;
    colorRef.current = stoneColor;
  }, [shape, stoneColor]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, { 
      width: 1000, 
      height: 750, 
      backgroundColor: "#F2F0ED" 
    });
    canvasInstance.current = canvas;

    loadInitialDesign(canvas, shape, stoneColor);

    const syncList = () => {
      if (isExecutingHistoryRef.current) return;
      updateObjectList();
      saveHistory();
    };

    canvas.on("object:added", syncList);
    canvas.on("object:removed", syncList);
    canvas.on("text:changed", syncList);
    canvas.on("object:modified", syncList);

    return () => { 
      canvas.dispose(); 
      canvasInstance.current = null;
    };
  }, []);

  // ✦ 임시 캔버스 없이 객체 속성 배열로 안전하게 히스토리 백업 (경고 원천 차단)
  const saveHistory = () => {
    if (!canvasInstance.current || isExecutingHistoryRef.current) return;
    const canvas = canvasInstance.current;
    
    const contentObjects = canvas.getObjects().filter((obj: any) => obj.name !== "stoneBackground");
    const serializedObjects = contentObjects.map(obj => obj.toObject(["name", "selectable", "evented"]));
    const json = JSON.stringify(serializedObjects);

    const currentIndex = historyIndexRef.current;
    const currentHistory = historyRef.current.slice(0, currentIndex + 1);

    if (currentHistory[currentHistory.length - 1] === json) return;

    historyRef.current = [...currentHistory, json];
    historyIndexRef.current = historyRef.current.length - 1;
  };

  const applyState = (targetStateJson: string) => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;

    isExecutingHistoryRef.current = true;

    canvas.getObjects().forEach((obj: any) => {
      if (obj.name !== "stoneBackground") {
        canvas.remove(obj);
      }
    });

    const parsedObjects = JSON.parse(targetStateJson);

    // v6 호환 방식으로 객체 재생성 및 추가
    parsedObjects.forEach((objData: any) => {
      let createdObj: any = null;
      const { type, text, path, ...options } = objData;

      if (type === "i-text" || type === "IText") {
        createdObj = new IText(text || "", options);
      } else if (type === "path") {
        createdObj = new Path(path, options);
      }

      if (createdObj) {
        canvas.add(createdObj);
      }
    });

    updateStoneBackground(canvas, shapeRef.current, colorRef.current);
    canvas.renderAll();
    updateObjectList();
    isExecutingHistoryRef.current = false;
  };

  const handleUndo = () => {
    if (!canvasInstance.current) return;
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      applyState(historyRef.current[historyIndexRef.current]);
    }
  };

  const handleRedo = () => {
    if (!canvasInstance.current) return;
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      applyState(historyRef.current[historyIndexRef.current]);
    }
  };

  const updateStoneBackground = (canvas: Canvas, currentShape: string, color: string) => {
    const existingBgs = canvas.getObjects().filter((obj: any) => obj.name === "stoneBackground");
    existingBgs.forEach((bg) => canvas.remove(bg));

    const isFlat = currentShape === "flat";
    const pathData = isFlat
      ? "M 40,460 L 40,40 Q 40,20 60,20 L 420,20 Q 440,20 440,40 L 440,460 Q 440,480 420,480 L 60,480 Q 40,480 40,460 Z"
      : "M 50,440 L 50,150 Q 50,20 210,20 Q 370,20 370,150 L 370,440 L 430,440 L 430,515 L -10,515 L -10,440 Z";

    canvas.set("backgroundColor", isFlat ? "#4B612C" : "#F2F0ED");

    const stoneBackground = new Path(pathData, {
      originX: "center",
      originY: "center",
      left: 500,
      top: 360,
      scaleX: isFlat ? 1.5 : 1,
      scaleY: isFlat ? 0.7 : 1,
      fill: color,
      stroke: isFlat ? "#3a3c42" : undefined,
      strokeWidth: isFlat ? 3 : 0,
      selectable: false,
      evented: false,
      name: "stoneBackground",
    });

    canvas.add(stoneBackground);
    canvas.sendObjectToBack(stoneBackground);
  };

  const loadInitialDesign = (canvas: Canvas, currentShape: string, color: string) => {
    canvas.clear();

    updateStoneBackground(canvas, currentShape, color);

    const isFlat = currentShape === "flat";
    const t1 = new IText(isFlat ? "Hello" : "Honor Life", { top: isFlat ? 265 : 195, fontSize: isFlat ? 30 : 46, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: isFlat ? 140 : 80 });
    const t2 = new IText(isFlat ? "Honor Life" : "Honoring Life & Legacy", { top: isFlat ? 315 : 275, fontSize: isFlat ? 55 : 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", charSpacing: isFlat ? 20 : 20 });
    const t3 = new IText(isFlat ? "1946 ✦ 2023" : "1946 ✦ 2026", { top: isFlat ? 380 : 335, fontSize: isFlat ? 35 : 22, fill: "#cccccc", fontFamily: "'Cormorant Garamond', serif" });
    
    const defaultHeart = new Path("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z", {
      top: isFlat ? 415 : 380,
      scaleX: isFlat ? 0.35 : 0.4,
      scaleY: isFlat ? 0.35 : 0.4,
      fill: "#b0b3b8",
      selectable: true,
    });

    const t4 = new IText(isFlat ? "Forever in our hearts" : "Memorials Handcrafted in Vista, CA", { top: isFlat ? 465 : 435, fontSize: isFlat ? 25 : 22, fill: "#ffffff", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" });

    canvas.add(t1, t2, t3, defaultHeart, t4);
    [t1, t2, t3, defaultHeart, t4].forEach(obj => canvas.centerObjectH(obj));

    canvas.renderAll();
    updateObjectList();
    
    const contentObjects = canvas.getObjects().filter((obj: any) => obj.name !== "stoneBackground");
    historyRef.current = [JSON.stringify(contentObjects.map(obj => obj.toObject(["name", "selectable", "evented"])))];
    historyIndexRef.current = 0;
  };

  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;

    updateStoneBackground(canvas, shape, stoneColor);
    canvas.renderAll();
    saveHistory();
  }, [shape]);

  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    
    canvas.getObjects().forEach((obj: any) => {
      if (obj.name === "stoneBackground") {
        obj.set("fill", stoneColor);
      }
    });
    canvas.renderAll();
    saveHistory();
  }, [stoneColor]);

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
    saveHistory();
  };

  const handleAddMotif = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value || !canvasInstance.current) return;
    const canvas = canvasInstance.current;

    let pathData = "";
    if (value === "cross") {
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
    updateObjectList();
    saveHistory();
  };

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
    saveHistory();
  };

  const deleteObject = (obj: any) => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;

    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.renderAll();
    updateObjectList();
    saveHistory();
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
          
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "10px", display: "flex", gap: "8px" }}>
            <button onClick={handleUndo} style={{ flex: 1, padding: "6px", backgroundColor: "#4B612C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
              ↶ Undo
            </button>
            <button onClick={handleRedo} style={{ flex: 1, padding: "6px", backgroundColor: "#4B612C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
              Redo ↷
            </button>
          </div>

          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ fontSize: "11px", color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>ON THE STONE</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
              {objectList.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", padding: "4px 0", borderBottom: "1px solid #f3f0ea", color: "#333" }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                    {item.name}
                  </span>
                  <div style={{ display: "flex", gap: "6px", cursor: "pointer", fontSize: "14px" }}>
                    <span onClick={() => toggleLockObject(item.id)} title={item.isLocked ? "Unlock" : "Lock"}>
                      {item.isLocked ? "🔒" : "🔓"}
                    </span>
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