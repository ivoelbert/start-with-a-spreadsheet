/**
 * Windows 95-style checkmark component
 * Clean vector checkmark with bold strokes
 */

import React from 'react';

export const Checkmark: React.FC = () => {
  return (
    <svg
      width="11"
      height="10"
      viewBox="0 0 11 10"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      fill="none"
    >
      {/* Bold Windows 95-style checkmark using thick strokes */}
      <path
        d="M 1 5 L 4 8.5 L 10 1.5"
        stroke="black"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
};

export default Checkmark;
