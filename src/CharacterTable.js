import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  Fab
} from "@mui/material";
import "./CharacterTable.css";

const ItemType = "ROW";
const CONFIG = "pw123";
const GITHUB_REPO = "donRaoulo/EoM-SKS";
const BRANCH = "main";

const TableRowComponent = ({
  data,
  index,
  moveRow,
  isEditable,
  present,
  setPresent,
  item,
  setItem,
  moveToBottom,
  moveOneDown,
  moveFiveDown
}) => {
  const ref = React.useRef(null);
  const { character} = data;

  const getColorByClass = (klasse) => {
    switch ((klasse || "").toLowerCase()) {
      case "druide": return "rgb(255, 125, 10)";
      case "hexenmeister": return "rgb(133, 116, 182)";
      case "jäger": return "rgb(158, 195, 108)";
      case "krieger": return "rgb(179, 140, 102)";
      case "magier": return "rgb(98, 189, 224)";
      case "paladin": return "rgb(217, 124, 167)";
      case "priester": return "rgb(255, 255, 255)";
      case "schamane": return "rgb(0, 119, 235)";
      case "schurke": return "rgb(255, 253, 107)";
      case "todesritter": return "rgb(198, 31, 59)";
      default: return "rgb(15, 15, 15)";
    }
  };

  const getTextColor = (bgColor) => {
    if (!bgColor) return "#000";
    const rgb = bgColor.match(/\d+/g).map(Number);
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 128 ? "#000" : "#fff";
  };

  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index && data.present !== "Nein" && isEditable) {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    canDrag: isEditable && data.present !== "Nein",
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  if (isEditable && data.present !== "Nein") drag(drop(ref));

  const className = `animated-row ${isDragging ? "dragging" : ""} ${
    isOver && isEditable && data.present !== "Nein" ? "drop-target" : ""
  }`;

  const getDisplayName = (character) => {
    return character.replace(/\s*\(.*?\)/, "").trim();
  };

  const getDisplayAlts = (alt) => {
    return alt
      .split(",")                         // Trenne an jedem Komma
      .map(entry => entry.replace(/\s*\(.*?\)/, "").trim()) // Entferne Klassen
      .join(", ");                        // Füge alles wieder zusammen
  };
  
  const extractClass = (character) => {
    const match = character.match(/\(([^)]+)\)/);
    return match ? match[1].toLowerCase() : "";
  };

  return (
    <TableRow ref={ref} className={className}>
      <TableCell align="center">{data.position}</TableCell>
      <TableCell>
      <Fab
  variant="extended"
  size="small"
  onClick={() =>
    window.open(
      `https://db.rising-gods.de/?profile=eu.rising-gods.${encodeURIComponent(getDisplayName(character))}`,
      "_blank"
    )
  }
  style={{
    backgroundColor: getColorByClass(extractClass(character)),
    color: getTextColor(getColorByClass(extractClass(character))),
    textTransform: "none",
    fontSize: "0.75rem",
    padding: "2px 10px"
  }}
>
  {getDisplayName(character)}
</Fab>
      </TableCell>
      <TableCell>{data.main}</TableCell>
      <TableCell>
  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
    {data.alt.split(",").map((entry, i) => {
      const nameMatch = entry.match(/^([^()]+)\s*\(/);
      const classMatch = entry.match(/\(([^)]+)\)/);
      const name = nameMatch ? nameMatch[1].trim() : entry.trim();
      const klasse = classMatch ? classMatch[1].trim() : "";

      const bgColor = getColorByClass(klasse);
      const textColor = getTextColor(bgColor);

      return (
        <Fab
          key={i}
          variant="extended"
          size="small"
          onClick={() =>
            window.open(
              `https://db.rising-gods.de/?profile=eu.rising-gods.${encodeURIComponent(name)}`,
              "_blank"
            )
          }
          style={{
            backgroundColor: bgColor,
            color: textColor,
            fontSize: "0.7rem",
            height: "26px",
            textTransform: "none",
            padding: "2px 10px"
          }}
        >
          {name}
        </Fab>
      );
    })}
  </div>
</TableCell>     <TableCell>
        {isEditable ? (
          <Checkbox
            checked={present === "Ja"}
            onChange={(e) => setPresent(e.target.checked ? "Ja" : "Nein")}
          />
        ) : (
          present
        )}
      </TableCell>
      <TableCell>
        {isEditable ? (
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            style={{ width: "100%" }}
          />
        ) : (
          item
        )}
      </TableCell>
      {isEditable && (
  <TableCell>
    <div style={{ display: "flex", gap: "6px" }}>
      <Button
        variant="contained"
        color="error"
        onClick={() => moveOneDown(index)}
      >
        ↓1
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={() => moveFiveDown(index)}
      >
        ↓5
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={() => moveToBottom(index)}
      >
        ↓↓↓↓↓
      </Button>
    </div>
  </TableCell>
)}

    </TableRow>
  );
};

const CharacterTable = () => {
  const [rows, setRows] = useState([]);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/characterData.json?nocache=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error("Fehler beim Laden der JSON-Datei", err));
  }, []);

  const moveRow = (fromIndex, toIndex) => {
    const movable = rows.filter(r => r.present !== "Nein");
    const fromMovableIndex = movable.findIndex(r => r === rows[fromIndex]);
    const toMovableIndex = movable.findIndex(r => r === rows[toIndex]);

    if (fromMovableIndex === -1 || toMovableIndex === -1) return;

    const newMovable = [...movable];
    const [movedRow] = newMovable.splice(fromMovableIndex, 1);
    newMovable.splice(toMovableIndex, 0, movedRow);

    const newRows = [];
    let mIndex = 0;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].present === "Nein") {
        newRows.push(rows[i]);
      } else {
        newRows.push(newMovable[mIndex]);
        mIndex++;
      }
    }

    newRows.forEach((r, i) => (r.position = i + 1));
    setRows(newRows);
  };

  const moveToBottom = (fromIndex) => {
      const movable = rows.filter(r => r.present !== "Nein");
      const fromMovableIndex = movable.findIndex(r => r === rows[fromIndex]);
      if (fromMovableIndex === -1) return;
  
      const newMovable = [...movable];
      const [movedRow] = newMovable.splice(fromMovableIndex, 1);
      newMovable.push(movedRow);
  
      const newRows = [];
      let mIndex = 0;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].present === "Nein") newRows.push(rows[i]);
        else newRows.push(newMovable[mIndex++]);
      }
  
      newRows.forEach((r, i) => (r.position = i + 1));
      setRows(newRows);
    };

    const moveOneDown = (index) => {
      if (index >= rows.length - 1) return;
    
      const updated = [...rows];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    
      // Positionen neu setzen
      updated.forEach((r, i) => (r.position = i + 1));
      setRows(updated);
    };

    const moveFiveDown = (index) => {
      const updated = [...rows];
      const newIndex = Math.min(index + 5, updated.length - 1);
    
      const [movedRow] = updated.splice(index, 1);
      updated.splice(newIndex, 0, movedRow);
    
      // Positionen neu setzen
      updated.forEach((r, i) => (r.position = i + 1));
      setRows(updated);
    };

  const handleConfigCheck = () => {
    const input = prompt("Passwort eingeben:");
    if (input === CONFIG) setIsEditable(true);
    else alert("Falsches Passwort!");
  };

  const updateCharacterData = async (rows) => {
    const path = "public/characterData.json";
    const tokenResponse = await fetch("https://echoes-of-madness.x10.mx/data/test.txt");
    const encoded = (await tokenResponse.text()).trim();

    try {
      const shaRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${BRANCH}`, {
        headers: {
          Authorization: `token ${encoded}`,
          Accept: "application/vnd.github.v3+json"
        }
      });

      if (!shaRes.ok) throw new Error("Fehler beim SHA-Request");

      const { sha } = await shaRes.json();
      const cleanRows = rows.map(({ id, position, character, main, alt, present, item, klasse }) => ({
        id, position, character, main, alt, present, item, klasse
      }));

      const content = JSON.stringify(cleanRows, null, 2);
      const base64Content = btoa(unescape(encodeURIComponent(content)));

      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${encoded}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Update characterData.json via Web UI",
          content: base64Content,
          sha,
          branch: BRANCH
        })
      });

      if (res.ok) alert("✅ SKS Liste erfolgreich gespeichert!");
      else alert("❌ Fehler beim Speichern:\n" + await res.text());
    } catch (err) {
      alert("❌ Fehler:\n" + err.message);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="floating-button-group">
        <Button
          onClick={handleConfigCheck}
          variant="contained"
          color="primary"
        >
          Bearbeiten
        </Button>
        {isEditable && (
          <Button
            onClick={() => updateCharacterData(rows)}
            variant="contained"
            color="success"
            style={{ marginLeft: "10px" }}
          >
            Speichern
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Pos.</TableCell>
            <TableCell>Charakter</TableCell>
            <TableCell>Main & Second</TableCell>
            <TableCell>Alternative Charaktere</TableCell>
            <TableCell>Anwesend</TableCell>
            <TableCell>Item erhalten</TableCell>
            
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRowComponent
              key={row.id}
              data={row}
              index={index}
              moveRow={moveRow}
              isEditable={isEditable}
              moveToBottom={moveToBottom}
              moveOneDown={moveOneDown}
              moveFiveDown={moveFiveDown}
              present={row.present}
              item={row.item}
              setPresent={(value) => {
                const updated = [...rows];
                updated[index] = { ...updated[index], present: value };
                setRows(updated);
              }}
              setItem={(value) => {
                const updated = [...rows];
                updated[index] = { ...updated[index], item: value };
                setRows(updated);
              }}
            />
          ))}
        </TableBody>
      </Table>
    </DndProvider>
  );
};

export default CharacterTable;
