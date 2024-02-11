import React from 'react';
import './Choice.css'; // Import the CSS file for styles

export default function Choice({ type }) {
  const color = COLORS[type]; // Ensure COLORS is defined or imported

  return (
    <div className="container" style={{ borderColor: color }}>
      <span className="text" style={{ color }}>{type}</span>
    </div>
  );
}
