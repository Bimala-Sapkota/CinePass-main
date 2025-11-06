import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const MovieSkeleton = ({ viewMode = 'grid' }) => {
  const { darkMode } = useTheme();

  if (viewMode === 'list') {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden animate-pulse shadow-lg`}>
        <div className="flex flex-col sm:flex-row">
          <div className={`w-full sm:w-32 h-48 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          <div className="flex-1 p-4 sm:p-6">
            <div className={`h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4 mb-4`}></div>
            <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/2 mb-4`}></div>
            <div className="flex gap-4 mb-4">
              <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-20`}></div>
              <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-20`}></div>
            </div>
            <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-4`}></div>
            <div className={`h-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-32`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden animate-pulse shadow-lg`}>
      <div className={`aspect-[3/4] ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      <div className="p-3 sm:p-4">
        <div className={`h-5 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-2`}></div>
        <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4 mb-3`}></div>
        <div className="flex justify-between mb-2">
          <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-16`}></div>
          <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-16`}></div>
        </div>
        <div className="flex gap-1">
          <div className={`h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full w-16`}></div>
          <div className={`h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full w-16`}></div>
        </div>
      </div>
    </div>
  );
};

export default MovieSkeleton;