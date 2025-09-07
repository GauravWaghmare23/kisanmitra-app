import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => (
  <div className="flex flex-col mb-4">
    <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className={`border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);

export default Input;
