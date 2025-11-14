
import React from 'react';
import { LogEntry } from '../types';
import { PlayIcon, PauseIcon, RefreshIcon, ClockIcon, CalendarIcon, BellIcon } from './Icons';
import { SlackFeed } from './sidebar/SlackFeed';

interface SidebarProps {
  isOpen: boolean;
  width: number;
  onResizeStart: (e: React.MouseEvent) => void;
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  logs: LogEntry[];
  simulationProgress: number;
  currentTime: Date;
  startDate: Date;
  endDate: Date;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  width,
  onResizeStart,
  isPlaying,
  speed,
  onPlayPause,
  onReset,
  onSpeedChange,
  logs,
  simulationProgress,
  currentTime,
  startDate,
  endDate,
}) => {
  const formatDate = (date: Date) => date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  
  return (
    <aside 
      style={{ width: `${width}px`, transform: isOpen ? 'translateX(0)' : `translateX(-${width}px)` }}
      className={`fixed top-0 left-0 bg-gray-800 p-4 flex flex-col h-full border-r border-gray-700 z-30 transition-transform duration-300 ease-in-out`}
    >
      <div className="flex items-center mb-6 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3"></div>
        <h1 className="text-xl font-bold text-white">FDS 대시보드</h1>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 mb-6 flex-shrink-0">
        <h2 className="text-lg font-semibold mb-3 text-gray-200">시뮬레이터 제어</h2>
        <div className="flex items-center space-x-2 mb-4">
          <button onClick={onPlayPause} className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-grow flex items-center justify-center">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
            <span className="ml-2">{isPlaying ? '일시정지' : '재생'}</span>
          </button>
          <button onClick={onReset} className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors">
            <RefreshIcon />
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="speed" className="block text-sm font-medium text-gray-400 mb-1">재생 속도</label>
          <select
            id="speed"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={3600}>1초당 1시간</option>
            <option value={21600}>1초당 6시간</option>
            <option value={86400}>1초당 1일</option>
          </select>
        </div>
         <div className="space-y-2 text-sm">
           <div className="flex items-center">
             <CalendarIcon className="mr-2 text-gray-400"/>
             <span>분석 기간: {formatDate(startDate)} ~ {formatDate(endDate)}</span>
           </div>
           <div className="flex items-center">
             <ClockIcon className="mr-2 text-gray-400"/>
             <span>현재 시각: {currentTime.toLocaleString('ko-KR')}</span>
           </div>
         </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 mb-4 flex-shrink-0">
        <h3 className="text-md font-semibold mb-2 text-gray-200">진행률</h3>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${simulationProgress}%` }}></div>
        </div>
        <div className="text-right text-xs mt-1 text-gray-400">{simulationProgress.toFixed(1)}%</div>
      </div>

      <div className="flex-1 bg-gray-900 rounded-lg p-4 flex flex-col overflow-hidden mb-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-200 flex items-center flex-shrink-0"><BellIcon className="mr-2"/>제제/알림 로그</h2>
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {[...logs].sort((a, b) => b.timestamp - a.timestamp).map(log => (
            <div key={log.id} className="text-xs p-2 rounded-md border-l-4 bg-gray-800/50
              ${log.type === 'sanction' ? 'border-red-500' : 'border-yellow-400'}">
              <p className="font-mono text-gray-300">{log.message}</p>
              <p className="text-gray-500 text-right mt-1">{new Date(log.timestamp).toLocaleTimeString('ko-KR')}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <SlackFeed />
      </div>

      <div
          onMouseDown={onResizeStart}
          className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500/30 transition-colors z-40"
      />
    </aside>
  );
};

export default Sidebar;
