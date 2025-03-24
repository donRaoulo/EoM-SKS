import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";

const ItemType = "ROW";
const CONFIG = "pw123";
const TOKEN = "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"
const GITHUB_REPO = "donRaoulo/EoM-SKS"; // Dein GitHub-Repo
const WORKFLOW_FILENAME = "update-json.yaml"; // oder .yml
const BRANCH = "main";

const initialData = JSON.parse(localStorage.getItem("characterData")) || [
  { id: 1, position: 1, character: "Char A", main: "Main A", alt: "Alt A", present: "Ja", item: "Nein" },
  { id: 2, position: 2, character: "Char B", main: "Main B", alt: "Alt B", present: "Nein", item: "Ja" },
  { id: 3, position: 3, character: "Char C", main: "Main C", alt: "Alt C", present: "Ja", item: "Nein" }
];

const TableRowComponent = ({ data, index, moveRow, isEditable }) => {
  const ref = React.useRef(null);
  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index && data.present !== "Nein" && isEditable) {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }
    }
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

  return (
    <TableRow ref={ref} hover className={`bg-white ${isDragging ? "opacity-50" : ""}`}>
      <TableCell>{data.position}</TableCell>
      <TableCell>{data.character}</TableCell>
      <TableCell>{data.main}</TableCell>
      <TableCell>{data.alt}</TableCell>
      <TableCell>{data.present}</TableCell>
      <TableCell>{data.item}</TableCell>
    </TableRow>
  );
};

const CharacterTable = () => {
  const [rows, setRows] = useState(initialData);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    localStorage.setItem("characterData", JSON.stringify(rows));
  }, [rows]);

  const moveRow = (fromIndex, toIndex) => {
    const updatedRows = [...rows];
    const [movedRow] = updatedRows.splice(fromIndex, 1);
    updatedRows.splice(toIndex, 0, movedRow);
    setRows(updatedRows);
  };

  const handleConfigCheck = () => {
    const userInput = prompt("Passwort eingeben:");
    if (userInput === CONFIG) {
      setIsEditable(true);
    } else {
      alert("Falsches Passwort!");
    }
  };

  const triggerUpdate = async () => {
    const json = JSON.stringify(rows).replace(/"/g, '\\"');

    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILENAME}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: BRANCH,
        inputs: {
          json: json
        }
      }),
    });

    if (res.ok) {
      alert("Update erfolgreich gestartet!");
    } else {
      const err = await res.text();
      alert("Fehler beim Starten des Updates:\n" + err);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Button onClick={handleConfigCheck} variant="contained" className="mb-4">
        Bearbeiten
      </Button>
      {isEditable && (
        <Button onClick={triggerUpdate} variant="contained" className="ml-4">
          Speichern
        </Button>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Position</TableCell>
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
            />
          ))}
        </TableBody>
      </Table>
    </DndProvider>
  );
};

export default CharacterTable;