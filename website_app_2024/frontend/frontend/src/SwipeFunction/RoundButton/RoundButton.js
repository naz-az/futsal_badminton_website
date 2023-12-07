import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './RoundButton.css'; // Import the CSS file for styles

export default function RoundButton({ name, size, color, onPress }) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    onPress();
  };

  const iconSize = size || "1x"; // Default size if not provided

  return (
    <div 
      className={`container ${isPressed ? 'pressed' : ''}`} 
      onMouseDown={handlePressIn} 
      onMouseUp={handlePressOut} 
      onMouseLeave={handlePressOut} // To reset if the mouse leaves the button
    >
      <FontAwesomeIcon icon={fa[IconName]} size={iconSize} color={color} />
    </div>
  );
}
