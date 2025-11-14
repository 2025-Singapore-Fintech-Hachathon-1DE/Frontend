
import React from 'react';

interface ModelInfoPanelProps {
  onOpen: () => void;
}

export const ModelInfoPanel: React.FC<ModelInfoPanelProps> = ({ onOpen }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col justify-between border border-gray-700">
      <div>
        <h3 className="text-md font-semibold text-white">탐지 모델 정보</h3>
        <p className="text-sm text-gray-400 mt-2">
          각 이상거래 탐지 모델의 작동 방식, 탐지 기준, 주요 파라미터에 대한 상세 정보를 확인합니다.
        </p>
      </div>
      <button 
        onClick={onOpen}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4"
      >
        모델 설명 보기
      </button>
    </div>
  );
};
