import React, { useState } from "react";
import ThreeMergedScene from "./ThreeMergedScene";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="app-container">
      <header className="nav-bar">
        <div className="nav-logo">SYMPOSIUM</div>
        <nav className="nav-links">
          <a 
            href="#home" 
            className={activeTab === "home" ? "active" : ""}
            onClick={() => handleNavClick("home")}
          >
            HOME
          </a>
          <a 
            href="#contact" 
            className={activeTab === "contact" ? "active" : ""}
            onClick={() => handleNavClick("contact")}
          >
            CONTACT
          </a>
          <a 
            href="#about" 
            className={activeTab === "about" ? "active" : ""}
            onClick={() => handleNavClick("about")}
          >
            ABOUT
          </a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <h1>EMBRACE THE FUTURE, UNVEIL THE PAST</h1>
        <p className="hero-subtext">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.  
          Curabitur bibendum, urna eget faucibus ullamcorper...
        </p>
        <button className="hero-cta">SIGN UP</button>
      </section>

      {/* 3D SCENE */}
      <ThreeMergedScene />
    </div>
  );
}

export default App;
