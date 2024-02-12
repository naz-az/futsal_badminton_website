import React from 'react';
import RoundButton from '../RoundButton'; // Ensure this is the converted RoundButton for React.js
import './Footer.css'; // Import the CSS file for styles

export default function Footer({ handleChoice, onLikePress, removeTopProject, onReturnPress }) {
  return (
    <div className="footer-container">
      <RoundButton
        name="thumbs-down" // Update the name to a FontAwesome icon name
        size="40" // Size as a string
        color="#colorCode" // Replace with actual color code from COLORS.nope
        onPress={() => handleChoice(-1, removeTopProject)}
      />
      <RoundButton
        name="thumbs-up" // Update the name to a FontAwesome icon name
        size="34" // Size as a string
        color="#colorCode" // Replace with actual color code from COLORS.like
        onPress={onLikePress}
      />

      <RoundButton
        name="undo" // FontAwesome icon name
        size="34" // Size as a string
        color="#colorCode" // Replace with actual color code from COLORS.return
        onPress={onReturnPress}
      />
    </div>
  );
}
