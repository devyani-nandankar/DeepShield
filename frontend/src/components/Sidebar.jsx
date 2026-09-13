import React, { useState } from "react";
import "./Sidebar.css";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "detection", label: "Detection", icon: "🔬" },
  { id: "how-it-works", label: "How It Works", icon: "⚙️" },
  { id: "model", label: "Model", icon: "🧠" },
  { id: "about", label: "About", icon: "ℹ️" },
];

const Sidebar = ({ activeSection, onSelectSection }) => {
  return (
    <aside className="deepshield-sidebar">
      <div className="sidebar-brand-icon" title="DeepShield AI">
        🛡️
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-tooltip">{item.label}</span>
              {isActive && <div className="active-indicator"></div>}
            </a>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
