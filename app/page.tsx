"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, IText, Path } from "fabric";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<Canvas | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [stoneColor, setStoneColor] = useState("#15161a");
  const [shape, setShape] = useState("serpentine");
  const [objectList, setObjectList] = useState<{ id: any; name: string; isLocked: boolean; type: string }[]>([]);
  
  const [selectedObjId, setSelectedObjId] = useState<any>(null);

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isExecutingHistoryRef = useRef<boolean>(false);

  const shapeRef = useRef(shape);
  const colorRef = useRef(stoneColor);

  useEffect(() => {
    shapeRef.current = shape;
    colorRef.current = stoneColor;
  }, [shape, stoneColor]);

  const getBaseDimensions = (currentShape: string) => {
    const isFlat = currentShape === "flat";
    return {
      width: isFlat ? 580 : 380,
      height: isFlat ? 460 : 495
    };
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const dims = getBaseDimensions(shape);
    const canvas = new Canvas(canvasRef.current, { 
      width: dims.width,
      height: dims.height,
      backgroundColor: "#f9f8f6",
      enableRetinaScaling: true
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

    canvas.on("selection:created", (e) => {
      setSelectedObjId(e.selected?.[0] || null);
    });
    canvas.on("selection:updated", (e) => {
      setSelectedObjId(e.selected?.[0] || null);
    });
    canvas.on("selection:cleared", () => {
      setSelectedObjId(null);
    });

    return () => { 
      canvas.dispose(); 
      canvasInstance.current = null;
    };
  }, []);

  const saveHistory = () => {
    if (!canvasInstance.current || isExecutingHistoryRef.current) return;
    const canvas = canvasInstance.current;
    
    const contentObjects = canvas.getObjects().filter((obj: any) => obj.name !== "stoneBackground");
    const stateObj = {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      objects: contentObjects.map(obj => obj.toObject(["name", "selectable", "evented", "graphicType"]))
    };
    
    const json = JSON.stringify(stateObj);
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

    const parsedState = JSON.parse(targetStateJson);
    const savedObjects = parsedState.objects || [];
    const savedWidth = parsedState.canvasWidth || canvas.width;
    const savedHeight = parsedState.canvasHeight || canvas.height;

    const dx = (canvas.width / 2) - (savedWidth / 2);
    const dy = (canvas.height / 2) - (savedHeight / 2);

    savedObjects.forEach((objData: any) => {
      let createdObj: any = null;
      const { type, text, path, ...options } = objData;

      options.left = (options.left || 0) + dx;
      options.top = (options.top || 0) + dy;

      if (type === "i-text" || type === "IText") {
        createdObj = new IText(text || "", options);
      } else if (type === "path" || type === "Path") {
        createdObj = new Path(path, options);
        if (objData.graphicType) {
          (createdObj as any).graphicType = objData.graphicType;
        }
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

    const dims = getBaseDimensions(currentShape);
    canvas.setDimensions({ width: dims.width, height: dims.height });

    canvas.set("backgroundColor", "#f9f8f6");

    const stoneBackground = new Path(pathData, {
      originX: "center",
      originY: "center",
      left: dims.width / 2,
      top: dims.height / 2,
      scaleX: isFlat ? 1.5 : 1,
      scaleY: isFlat ? 0.7 : 1,
      fill: color,
      stroke: undefined,
      strokeWidth: 0,
      selectable: false,
      evented: false,
      name: "stoneBackground",
    });

    canvas.add(stoneBackground);
    canvas.sendObjectToBack(stoneBackground);
  };

  const loadInitialDesign = (canvas: Canvas, currentShape: string, color: string) => {
    canvas.clear();

    const dims = getBaseDimensions(currentShape);
    canvas.setDimensions({ width: dims.width, height: dims.height });

    updateStoneBackground(canvas, currentShape, color);

    const isFlat = currentShape === "flat";
    
    // ✦ flat 스톤일 때 각 아이템들이 직사각형 안에서 수직으로 조화롭게 정렬되도록 top 위치 재조정
    const t1 = new IText(isFlat ? "Honor Life" : "Honor Life", { 
      top: isFlat ? 85 : 70, 
      fontSize: isFlat ? 38 : 46, 
      fill: "#ffffff", 
      fontFamily: "'Cormorant Garamond', serif", 
      charSpacing: isFlat ? 40 : 80,
      textAlign: "center"
    });
    
    const t2 = new IText(isFlat ? "Honoring Life & Legacy" : "Honoring Life & Legacy", { 
      top: isFlat ? 140 : 150, 
      fontSize: isFlat ? 22 : 22, 
      fill: "#ffffff", 
      fontFamily: "'Cormorant Garamond', serif", 
      charSpacing: 20,
      textAlign: "center"
    });
    
    const t3 = new IText(isFlat ? "1946 ✦ 2026" : "1946 ✦ 2026", { 
      top: isFlat ? 185 : 210, 
      fontSize: isFlat ? 22 : 22, 
      fill: "#ffffff", 
      fontFamily: "'Cormorant Garamond', serif",
      textAlign: "center"
    });
    
    const defaultHeart = new Path("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z", {
      top: isFlat ? 230 : 255,
      scaleX: isFlat ? 0.35 : 0.4,
      scaleY: isFlat ? 0.35 : 0.4,
      fill: "#ffffff",
      selectable: true,
      graphicType: "Heart",
    } as any);

    const t4 = new IText(isFlat ? "Memorials Handcrafted in Vista, CA" : "Memorials Handcrafted in Vista, CA", { 
      top: isFlat ? 310 : 310, 
      fontSize: isFlat ? 20 : 22, 
      fill: "#ffffff", 
      fontFamily: "'Cormorant Garamond', serif", 
      fontStyle: "italic",
      textAlign: "center"
    });

    canvas.add(t1, t2, t3, defaultHeart, t4);
    [t1, t2, t3, defaultHeart, t4].forEach(obj => canvas.centerObjectH(obj));

    canvas.renderAll();
    updateObjectList();
    
    const contentObjects = canvas.getObjects().filter((obj: any) => obj.name !== "stoneBackground");
    const stateObj = {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      objects: contentObjects.map(obj => obj.toObject(["name", "selectable", "evented", "graphicType"]))
    };
    historyRef.current = [JSON.stringify(stateObj)];
    historyIndexRef.current = 0;
  };

  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    updateStoneBackground(canvas, shape, stoneColor);
    canvas.renderAll();
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
          const gType = (obj as any).graphicType || "Graphic";
          list.push({
            id: obj,
            name: `Graphic: ${gType}`,
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
    
    const centerY = canvas.height ? canvas.height / 2 : 250;
    const newText = new IText("Click to edit", {
      top: centerY + 50,
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
    let graphicName = "";

    if (value === "cross") {
      pathData = "M 42,10 L 58,10 L 58,35 L 85,35 L 85,50 L 58,50 L 58,95 L 42,95 L 42,50 L 15,50 L 15,35 L 42,35 Z";
      graphicName = "Cross";
    } else if (value === "heart") {
      pathData = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z";
      graphicName = "Heart";
    } else if (value === "flower") {
      pathData = "M 50,30 Q 70,10 70,30 Q 90,50 70,50 Q 70,70 50,50 Q 30,70 30,50 Q 10,50 30,30 Q 30,10 50,30 Z";
      graphicName = "Flower";
    }

    const centerY = canvas.height ? canvas.height / 2 : 250;
    const motifObj = new Path(pathData, {
      top: centerY + 20,
      scaleX: 0.35,
      scaleY: 0.35,
      fill: "#ffffff",
      selectable: true,
      graphicType: graphicName,
    } as any);

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
      multiplier: 1,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "memorial-design.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniformSelectFontStyle = {
    fontSize: "12px",
    fontFamily: "sans-serif",
    fontWeight: "normal" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", backgroundColor: "#f9f8f6", overflow: "hidden", fontFamily: "sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 30px", borderBottom: "1px solid #dfdad0", backgroundColor: "#f9f8f6", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: "bold" }}>
          Create Your Memorial <span style={{ fontSize: "11px", fontFamily: "sans-serif", color: "#888", fontWeight: "normal" }}>design a memorial together</span>
        </div>
        
        <button 
          onClick={downloadImage} 
          style={{ padding: "6px 16px", backgroundColor: "#4B612C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", ...uniformSelectFontStyle, fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save & Download
        </button>
      </header>

      <div style={{ display: "flex", flex: 1, overflowY: "auto", width: "100%", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
        
        {/* 왼쪽 사이드바 */}
        <aside style={{ width: "260px", minWidth: "260px", backgroundColor: "#f9f8f6", padding: "15px", borderRight: "1px solid #dfdad0", borderBottom: "1px solid #dfdad0", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "15px", flexShrink: 0, order: 1 }}>
          
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "10px", display: "flex", gap: "8px" }}>
            <button onClick={handleUndo} style={{ flex: 1, padding: "6px", backgroundColor: "#4B612C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", ...uniformSelectFontStyle, fontWeight: "bold" }}>
              ↶ Undo
            </button>
            <button onClick={handleRedo} style={{ flex: 1, padding: "6px", backgroundColor: "#4B612C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", ...uniformSelectFontStyle, fontWeight: "bold" }}>
              Redo ↷
            </button>
          </div>

          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ ...uniformSelectFontStyle, color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>On The Stone</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
              {objectList.map((item, i) => {
                const isSelected = selectedObjId === item.id;

                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (canvasInstance.current) {
                        canvasInstance.current.setActiveObject(item.id);
                        canvasInstance.current.renderAll();
                        setSelectedObjId(item.id);
                      }
                    }}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      fontSize: "12px", 
                      padding: "6px 8px", 
                      borderRadius: "4px",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#f9f8f6" : "transparent",
                      borderBottom: "1px solid #f3f0ea", 
                      color: "#333" 
                    }}
                  >
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px", ...uniformSelectFontStyle }}>
                      {item.name}
                    </span>
                    <div style={{ display: "flex", gap: "8px", cursor: "pointer", alignItems: "center" }}>
                      
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLockObject(item.id);
                        }} 
                        title={item.isLocked ? "Unlock" : "Lock"}
                        style={{ display: "flex", alignItems: "center", color: "#666" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#4B612C"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                      >
                        {item.isLocked ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                          </svg>
                        )}
                      </span>

                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteObject(item.id);
                        }} 
                        title="Delete"
                        style={{ display: "flex", alignItems: "center", color: "#666" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#4B612C"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </span>

                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={addCustomText} style={{ width: "100%", marginTop: "10px", padding: "8px", backgroundColor: "#5a644e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", ...uniformSelectFontStyle }}>+ Add New Text</button>
          </div>

          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "12px" }}>
            <h4 style={{ ...uniformSelectFontStyle, color: "#777", margin: "0 0 10px 0", fontWeight: "bold" }}>Graphics</h4>
            <select onChange={handleAddMotif} defaultValue="" style={{ width: "100%", padding: "10px", borderRadius: "4px", ...uniformSelectFontStyle, cursor: "pointer" }}>
              <option value="" disabled>Select a graphic...</option>
              <option value="cross">Add Cross</option>
              <option value="heart">Add Heart</option>
              <option value="flower">Add Flower</option>
            </select>
          </div>

        </aside>

        {/* 캔버스 메인 영역 */}
        <main 
          ref={wrapperRef} 
          onClick={() => {
            if (canvasInstance.current) {
              canvasInstance.current.discardActiveObject();
              canvasInstance.current.renderAll();
              setSelectedObjId("stoneBg");
            }
          }}
          style={{ 
            flex: 1, 
            minWidth: "300px", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "flex-start", 
            alignItems: "center", 
            backgroundColor: "#f9f8f6", 
            paddingTop: "30px", 
            paddingBottom: "20px", 
            paddingLeft: "20px", 
            paddingRight: "20px", 
            overflow: "hidden", 
            order: 2,
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ width: "100%", maxWidth: shape === "flat" ? "580px" : "380px", aspectRatio: shape === "flat" ? "580 / 460" : "380 / 495", display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <canvas ref={canvasRef} style={{ width: "100% !important", height: "100% !important", objectFit: "contain" }} />
          </div>
        </main>

        {/* 오른쪽 사이드바 */}
        <aside style={{ width: "360px", minWidth: "360px", backgroundColor: "#f9f8f6", padding: "20px", borderLeft: "1px solid #dfdad0", borderBottom: "1px solid #dfdad0", display: "flex", flexDirection: "column", gap: "15px", flexShrink: 0, order: 3 }}>
          <div style={{ backgroundColor: "white", border: "1px solid #e5e0d8", borderRadius: "6px", padding: "15px" }}>
            <h4 style={{ ...uniformSelectFontStyle, fontWeight: "bold", margin: "0 0 4px 0" }}>The Stone</h4>
            <span style={{ color: "#888", ...uniformSelectFontStyle }}>Granite</span>
            <div style={{ display: "flex", gap: "8px", margin: "10px 0" }}>
              {["#15161a", "#292b33", "#747885", "#56382d", "#aa8986", "#3d4757"].map((c) => (
                <div key={c} onClick={() => setStoneColor(c)} style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: c, cursor: "pointer", border: stoneColor === c ? "3px solid #5a644e" : "1px solid #ddd" }}></div>
              ))}
            </div>
            <select value={shape} onChange={(e) => setShape(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", ...uniformSelectFontStyle }}>
              <option value="serpentine">Serpentine Top</option>
              <option value="flat">Flat</option>
            </select>
          </div>
        </aside>

      </div>
    </div>
  );
}