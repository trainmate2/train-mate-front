import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

interface LoadingButtonProps {
  isLoading: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  tooltipMessage?: string; // New prop for tooltip message
  borderColor: string;
  borderWidth: string;
  bgColor: string;
  color: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  onClick,
  label,
  icon,
  disabled,
  tooltipMessage,
  borderColor,
  borderWidth,
  bgColor,
  color,
}) => {
  const buttonContent = (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`flex items-center justify-center px-4 py-2 rounded-md ${color} ${bgColor} border ${borderColor} ${borderWidth} ${
        isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? <CircularProgress size={20} color="inherit" /> : icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <Tooltip title={disabled && tooltipMessage ? tooltipMessage : ''} arrow>
      <span>{buttonContent}</span>
    </Tooltip>
  );
};

export default LoadingButton;
