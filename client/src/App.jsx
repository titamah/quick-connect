import "./App.css";
import "preline/preline";
import { useState } from "react";
import Header from "./components/header";
import Panel from "./components/panel";
import Canvas from "./components/canvas";

function App() {
  const [isOpen, setIsOpen] = useState(true);

  // const togglePanel = () => {
  //   setIsOpen(!isOpen);
  //   console.log("toggled")
  // };
  return (
    <>
      <Header />
      <Panel setIsOpen={setIsOpen} isOpen={isOpen}/>
      <Canvas  isOpen={isOpen}/>
    </>
  );
}

export default App;
