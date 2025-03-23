import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const ItemType = "ROW";
const PASSWORD = "meinSicheresPasswort"; // Passwort festlegen
const GITHUB_REPO = "username/repo"; // Dein GitHub-Repo
const FILE_PATH = "data/characterData.json"; // Pfad zur JSON-Datei
const GITHUB_TOKEN = "your_github_token"; // Dein GitHub-Personal-Access-Token

const initialData = JSON.parse(localStorage.getItem("characterData")) || [
  { id: 1, position: 1, character: "Char A", main: "Main A", alt: "Alt A", present: "Ja", item: "Nein" },
  { id: 2, position: 2, character: "Char B", main: "Main B", alt: "Alt B", present: "Nein", item: "Ja" },
  { id: 3, position: 3, character: "Char C", main: "Main C", alt: "Alt C", present: "Ja", item: "Nein" }
];

const TableRow = ({ data, index, moveRow, isEditable }) => {
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
    <tr ref={ref} className={`bg-white ${isDragging ? "opacity-50" : ""}`}>
      <td>{data.position}</td>
      <td>{data.character}</td>
      <td>{data.main}</td>
      <td>{data.alt}</td>
      <td>{data.present}</td>
      <td>{data.item}</td>
    </tr>
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

  const handlePasswordCheck = () => {
    const userInput = prompt("Passwort eingeben:");
    if (userInput === PASSWORD) {
      setIsEditable(true);
    } else {
      alert("Falsches Passwort!");
    }
  };

  const saveToGitHub = async () => {
    const content = JSON.stringify(rows, null, 2);
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update character list",
        content: btoa(content),
        sha: await getCurrentFileSHA(),
      }),
    });
    if (response.ok) {
      alert("Liste gespeichert!");
    } else {
      alert("Fehler beim Speichern!");
    }
  };

  const getCurrentFileSHA = async () => {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`);
    const data = await response.json();
    return data.sha;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Button onClick={handlePasswordCheck} className="mb-4">Bearbeiten</Button>
      {isEditable && <Button onClick={saveToGitHub} className="ml-4">Speichern</Button>}
      <Table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Charakter</th>
            <th>Main & Second</th>
            <th>Alternative Charaktere</th>
            <th>Anwesend</th>
            <th>Item erhalten</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <TableRow key={row.id} data={row} index={index} moveRow={moveRow} isEditable={isEditable} />
          ))}
        </tbody>
      </Table>
    </DndProvider>
  );
};

export default CharacterTable;
