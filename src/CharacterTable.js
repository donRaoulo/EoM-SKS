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
  Fab,
  Menu, MenuItem
} from "@mui/material";
import {
  Select,
  FormControl
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
  bemerkung,
  setBemerkung,
  moveToBottom,
  moveOneDown,
  moveOneUp,
  moveFiveDown,
  moveFiveUp,
  onDelete 
}) => {
  const ref = React.useRef(null);
  const { character} = data;

  const [anchorEl, setAnchorEl] = useState(null);


const handleClose = () => {
  setAnchorEl(null);
};

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
  
  const extractClass = (character) => {
    const match = character.match(/\(([^)]+)\)/);
    return match ? match[1].toLowerCase() : "";
  };

  return (
    <TableRow ref={ref} className={className}>
      <TableCell align="center">{data.position}</TableCell>
      <TableCell
  onContextMenu={(e) => {
    if (!isEditable) return; // Nur im Bearbeitungsmodus aktiv
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  }}
>
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

  {/* Kontextmenü – nur im Bearbeitungsmodus nutzbar */}
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    onClick={handleClose}
  >
    <MenuItem
      onClick={() => {
        handleClose();
        if (isEditable && window.confirm("Charakter wirklich löschen?")) {
          onDelete(index); // ← Funktion muss über Props kommen
        }
      }}
      disabled={!isEditable}
    >
      🗑️ Löschen
    </MenuItem>
  </Menu>
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
</TableCell>  



   <TableCell style={{ width: "50px" }}>
        {isEditable ? (
          <Checkbox
            checked={present === "Ja"}
            onChange={(e) => setPresent(e.target.checked ? "Ja" : "Nein")}
          />
        ) : (
          present
        )}
      </TableCell>
      <TableCell style={{ width: "150px" }}>
  {isEditable ? (
    <textarea
value={bemerkung || ""}
      onChange={(e) => setBemerkung(e.target.value)}
      style={{
        width: "100%",       // doppelte Breite
        minHeight: "2em",    // macht es mehrzeilig
        resize: "both",  // optional: Benutzer darf Größe ändern
      }}
    />
  ) : (
    bemerkung
  )}
</TableCell>
<TableCell style={{ width: "150px" }}> {/* optional: zwei Spalten zusammenfassen */}
  {isEditable ? (
    <textarea
      value={item}
      onChange={(e) => setItem(e.target.value)}
      style={{
        width: "100%",       // doppelte Breite
        minHeight: "2em",    // macht es mehrzeilig
        resize: "vertical",  // optional: Benutzer darf Größe ändern
      }}
    />
  ) : (
    item
  )}
</TableCell>


      {isEditable && (
  <TableCell>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <div style={{ display: "flex", gap: "2px" }}>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => moveOneUp(index)}
          style={{
            minWidth: "30px",
            padding: "2px 4px",
            lineHeight: "1",
            fontSize: "0.9rem"
          }}
        >
          ↑ 1
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => moveFiveUp(index)}
          style={{
            minWidth: "30px",
            padding: "2px 4px",
            lineHeight: "1",
            fontSize: "0.9rem"
          }}
        >
          ↑ 5
        </Button>
      </div>
      <div style={{ display: "flex", gap: "2px" }}>
        <Button
          variant="contained"
          color="warning"
          size="small"
          onClick={() => moveOneDown(index)}
          style={{
            minWidth: "30px",
            padding: "2px 2px",
            lineHeight: "1.1",
            fontSize: "0.9rem"
          }}
        >
          ↓ 1
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="small"
          onClick={() => moveFiveDown(index)}
          style={{
            minWidth: "30px",
            padding: "2px 4px",
            lineHeight: "1",
            fontSize: "0.9rem"
          }}
        >
          ↓ 5
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => moveToBottom(index)}
          style={{
            minWidth: "30px",
            padding: "2px 4px",
            lineHeight: "1",
            fontSize: "0.9rem"
          }}
        >
          ↓↓↓↓↓
        </Button>
      </div>
    </div>
  </TableCell>
)}

    </TableRow>
  );
};

const CharacterTable = () => {
  const [rows, setRows] = useState([]);
  const [isEditable, setIsEditable] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [newRow, setNewRow] = useState({
    character: "",
    main: "",
    alt: "",
    present: "Nein",
    item: "Nein"
  });

const [availableBackups, setAvailableBackups] = useState([]);
const [selectedBackup, setSelectedBackup] = useState("");

useEffect(() => {
  // Lade aktuelle Daten
  fetch(`${process.env.PUBLIC_URL}/characterData.json?nocache=${Date.now()}`)
    .then((res) => res.json())
    .then((data) => setRows(data))
    .catch((err) => console.error("Fehler beim Laden der JSON-Datei", err));

  // Lade Backup-Dateien
  fetch("https://api.github.com/repos/donRaoulo/EoM-SKS/contents/public/history?ref=main")
    .then((res) => res.json())
    .then((files) => {
    const backups = files
      .filter((file) => file.name.endsWith(".json"))
      .map((file) => file.name.replace(".json", ""))
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.split(".").map(Number);
        const [dayB, monthB, yearB] = b.split(".").map(Number);

        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);

        return dateB - dateA; // neuestes oben
      });
      setAvailableBackups(backups);
      setSelectedBackup("Aktuell");
    })
    .catch((err) => console.error("Fehler beim Laden der Backups", err));
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

    const moveOneUp = (index) => {
      if (index <= 0) return;
    
      const updated = [...rows];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    
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

    const moveFiveUp = (index) => {
      if (index <= 0) return;
    
      const updated = [...rows];
      const newIndex = Math.max(index - 5, 0);
    
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
      const cleanRows = rows.map(({ id, position, character, main, alt, present, item, klasse, bemerkung }) => ({
        id, position, character, main, alt, present, item, klasse, bemerkung
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

  const saveToHistory = async () => {
    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
    const path = `public/history/${timestamp}.json`;
  
    const tokenResponse = await fetch("https://echoes-of-madness.x10.mx/data/test.txt");
    const encoded = (await tokenResponse.text()).trim();
  
    try {
      const content = JSON.stringify(rows, null, 2);
      const base64Content = btoa(unescape(encodeURIComponent(content)));
  
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${encoded}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `📦 Backup vom ${timestamp}`,
          content: base64Content,
          branch: BRANCH
        })
      });
  
      if (res.ok) {
        alert("✅ Raid erfolgreich gespeichert!");


  const resetRows = rows.map(row => ({
    ...row,
    bemerkung: "",      // oder default-Wert
    present: false,     // oder true, je nachdem
    item: ""            // oder "Nein", "Ja", etc.
  }));

  setRows(resetRows);
updateCharacterData(rows)

      } else {
        alert("❌ Fehler beim Speichern:\n" + await res.text());
      }
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
        onClick={saveToHistory}
        variant="outlined"
        color="secondary"
      >
        Raid abschließen
      </Button>
    )}

  {isEditable && (
    <Button
      onClick={() => updateCharacterData(rows)}
      variant="contained"
      color="success"
    >
      Speichern
    </Button>
  )}
</div>

{availableBackups.length > 0 && (
<FormControl fullWidth size="small" sx={{ 
  backgroundColor: "#1e1e2f", 
  borderRadius: 2, 
  '& .MuiInputLabel-root': { color: 'white' },
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: '#666'
    },
    '&:hover fieldset': {
      borderColor: '#888'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#bbb'
    }
  },
  '& .MuiSelect-icon': {
    color: 'white'
  }
}}>
  <Select
    labelId="backup-label"
    value={selectedBackup}
    onChange={async (e) => {
      const backupName = e.target.value;
      setSelectedBackup(backupName);
      let url;

      if (backupName === "Aktuell") {
        url = `${process.env.PUBLIC_URL}/characterData.json?nocache=${Date.now()}`;
      } else {
        url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/public/history/${backupName}.json`;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();
        setRows(data);
      } catch (err) {
        alert("❌ Fehler beim Laden des Raids");
      }
    }}
  >
    <MenuItem value="Aktuell">📌 Aktuell</MenuItem>
    {availableBackups.map((name) => {
  const datePart = name.split("_")[0]; // z. B. "03.04.2025"
  const [day, month, yearFull] = datePart.split(".");
  const shortDate = `${day}.${month}.${yearFull.slice(2)}`; // z. B. "03.04.25"
  return (
    <MenuItem key={name} value={name}>
      {shortDate}
    </MenuItem>
  );
})}
  </Select>
</FormControl>

)}
<div style={{ width: "100%", overflowX: "auto" }}>
      <Table style={{ minWidth: "1000px" }}>
        <TableHead>
          <TableRow>
            <TableCell align="center">Pos.</TableCell>
            <TableCell>Charakter</TableCell>
            <TableCell>Main & Second</TableCell>
            <TableCell>Alternative Charaktere</TableCell>
            <TableCell>Anwesend</TableCell>
            <TableCell>Bemerkung</TableCell>
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
              moveOneUp={moveOneUp}
              moveFiveDown={moveFiveDown}
              moveFiveUp={moveFiveUp}
              onDelete={(index) => {
                const updated = [...rows];
                updated.splice(index, 1);
                updated.forEach((r, i) => (r.position = i + 1));
                setRows(updated);
              }}
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
              bemerkung={row.bemerkung}
              setBemerkung={(value) => {
                const updated = [...rows];
                updated[index] = { ...updated[index], bemerkung: value };
                setRows(updated);
              }}
            />
          ))}
        </TableBody>
      </Table>
</div>


      {isEditable && (
  <div style={{ marginTop: "20px" }}>
  {!showForm ? (
    <Button
      variant="contained"
      color="secondary"
      onClick={() => setShowForm(true)}
    >
      + Neuen Charakter hinzufügen
    </Button>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
      <input
        type="text"
        placeholder="Charakter + Klasse (z.B. Batna (Prister))"
        value={newRow.character}
        onChange={(e) => setNewRow({ ...newRow, character: e.target.value })}
      />
      <input
        type="text"
        placeholder="Main Specc"
        value={newRow.main}
        onChange={(e) => setNewRow({ ...newRow, main: e.target.value })}
      />
      <input
        type="text"
        placeholder="Alternative Char (z.B. Amizo (Todesritter), ...)"
        value={newRow.alt}
        onChange={(e) => setNewRow({ ...newRow, alt: e.target.value })}
      />
      <Button
        variant="contained"
        color="success"
        onClick={() => {
          const newId = Math.max(...rows.map(r => r.id)) + 1;
          const newPosition = rows.length + 1;

          const updated = [
            ...rows,
            {
              id: newId,
              position: newPosition,
              ...newRow
            }
          ];
          setRows(updated);
          setShowForm(false);
          setNewRow({ character: "", main: "", alt: "", present: "Nein", item: "Nein" });
        }}
      >
        Speichern
        </Button>
      </div>
    )}
  </div>
)}
    </DndProvider>
  );
};

export default CharacterTable;
