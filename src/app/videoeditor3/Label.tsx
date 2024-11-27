// Label.tsx
import React from 'react';

interface LabelProps {
  label: { id: string; x: number; y: number; text: string };
}

const Label: React.FC<LabelProps> = ({ label }) => {
  return <div>{label.text}</div>;
};

export default Label;
