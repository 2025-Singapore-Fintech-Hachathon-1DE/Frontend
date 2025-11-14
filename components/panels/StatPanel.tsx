import React from 'react'

interface StatPanelProps {
    title: string
    value: string
    onClick?: () => void
}

export const StatPanel: React.FC<StatPanelProps> = ({ title, value, onClick }) => {
    return (
        <div
            className={`bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col justify-between border border-gray-700 ${
                onClick ? 'cursor-pointer hover:bg-gray-750 hover:border-blue-500 transition-all' : ''
            }`}
            onClick={onClick}
        >
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
    )
}
