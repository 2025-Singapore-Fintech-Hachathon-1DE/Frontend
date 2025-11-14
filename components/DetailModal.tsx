import React from 'react'
import { DetailData, SanctionCase } from '../types'
import { SanctionDetailView } from './modal/SanctionDetailView'
import { AccountDetailView } from './modal/AccountDetailView'

interface DetailModalProps {
    detail: DetailData
    onClose: () => void
    allEvents: SanctionCase[]
    washTradingPairs: any[]
    cooperativeGroups: any[]
    fundingFeeCases: any[]
}

export const DetailModal: React.FC<DetailModalProps> = ({ detail, onClose, allEvents, washTradingPairs, cooperativeGroups, fundingFeeCases }) => {
    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{detail.type === 'sanction' ? '제재 상세 정보' : '계정 상세 정보'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {detail.type === 'sanction' && (
                        <SanctionDetailView
                            sanction={detail.data as any}
                            washTradingPairs={washTradingPairs}
                            cooperativeGroups={cooperativeGroups}
                            fundingFeeCases={fundingFeeCases}
                        />
                    )}
                    {detail.type === 'account' && <AccountDetailView account={detail.data as any} allEvents={allEvents} />}
                </div>
            </div>
        </div>
    )
}
