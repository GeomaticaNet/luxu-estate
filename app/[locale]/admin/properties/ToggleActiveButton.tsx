"use client";

import { useTransition } from "react";
import { togglePropertyActive } from "./actions";

interface ToggleActiveButtonProps {
  propertyId: string;
  active: boolean;
}

export function ToggleActiveButton({ propertyId, active }: ToggleActiveButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const formData = new FormData();
    formData.append("propertyId", propertyId);
    formData.append("currentActive", String(active));
    
    startTransition(() => {
      togglePropertyActive(formData);
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-lg transition-all ${
        active 
          ? 'text-mosque hover:bg-hint-of-green/30' 
          : 'text-gray-400 hover:text-nordic-dark hover:bg-gray-100'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={active ? 'Deactivate Property' : 'Activate Property'}
    >
      <span className="material-icons text-xl">
        {active ? 'visibility' : 'visibility_off'}
      </span>
    </button>
  );
}
