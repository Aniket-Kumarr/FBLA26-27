"use client";

import { HiChevronDown } from 'react-icons/hi';

export default function ScrollIndicator() {
  const scrollToNext = () => {
    const nextSection = document.getElementById('features-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      onClick={scrollToNext}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white hover:text-gray-300 transition-all duration-300 animate-bounce"
      aria-label="Scroll down"
    >
      <span className="text-sm font-medium">Scroll</span>
      <HiChevronDown className="h-8 w-8" />
    </button>
  );
}



