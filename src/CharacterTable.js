import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Checkbox  } from "@mui/material";
import "./CharacterTable.css"; // Für Animation


const ItemType = "ROW";
const CONFIG = "pw123";
const GITHUB_REPO = "donRaoulo/EoM-SKS"; // Dein GitHub-Repo
//const WORKFLOW_FILENAME = "update-json.yml"; // oder .yml
const BRANCH = "main";

const TableRowComponent = ({
  data,
  index,
  moveRow,
  isEditable,
  present,
  setPresent,
  item,
  setItem
}) => {
  const ref = React.useRef(null);
  const { character } = data;

  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index && data.present !== "Nein" && isEditable) {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
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

  return (
    <TableRow ref={ref} className={className}>
      <TableCell>{data.position}</TableCell>
<TableCell>
<a
  href={`https://db.rising-gods.de/?profile=eu.rising-gods.${encodeURIComponent(character)}`}
  target="_blank"
  rel="noopener noreferrer"
  style={{ color: "#90caf9", textDecoration: "underline", cursor: "pointer" }}
>
  {character}
</a>
</TableCell>
      <TableCell>{data.main}</TableCell>
      <TableCell>{data.alt}</TableCell>
      <TableCell>
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
    </TableRow>
  );
};

const CharacterTable = () => {
  const [rows, setRows] = useState([]);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/characterData.json")
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

    // Rebuild full list
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

    // Reassign position
    newRows.forEach((r, i) => (r.position = i + 1));

    setRows(newRows);
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
    console.log(encoded);
        try {
      const shaRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${BRANCH}`, {
        headers: {
          Authorization: `token ${encoded}`,
          Accept: "application/vnd.github.v3+json"
        }
      });

      if (!shaRes.ok) throw new Error("Erfolgreich fehlgeschlagen :)");

      const { sha } = await shaRes.json();
      const cleanRows = rows.map(({ id, position, character, main, alt, present, item }) => ({
        id, position, character, main, alt, present, item
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
            <TableCell>Pos.</TableCell>
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