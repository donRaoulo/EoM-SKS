import React from "react";
import CharacterTable from "./CharacterTable";

function App() {
  return (
<div className="container" style={{textAlign: "center", maxWidth: "900px", margin: "auto" }}>
  <img
    src={process.env.PUBLIC_URL + "/Logo.jpeg"}
    alt="Logo"
    style={{ maxWidth: "400px", marginBottom: "20px" }}
  />
  <h1>SKS Liste</h1>
  <CharacterTable />
</div>

  );
}

export default App;