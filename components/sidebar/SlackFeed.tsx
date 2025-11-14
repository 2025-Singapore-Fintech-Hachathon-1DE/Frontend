
import React from 'react';

const SlackMessage: React.FC<{ user: string; time: string; color: string; children: React.ReactNode }> = ({ user, time, color, children }) => (
    <div className="flex items-start space-x-2">
        <div className="w-8 h-8 rounded bg-gray-600 flex-shrink-0"></div>
        <div className="flex-1">
            <div className="flex items-baseline space-x-2">
                <span className="font-bold text-sm text-white">{user}</span>
                <span className="text-xs text-gray-500">{time}</span>
            </div>
            <div className={`text-sm text-gray-300 border-l-4 pl-3 py-1`} style={{ borderColor: color }}>
                {children}
            </div>
        </div>
    </div>
);

export const SlackFeed: React.FC = () => {
    return (
        <div className="bg-gray-900 rounded-lg p-3 flex flex-col h-48">
            <h3 className="text-md font-semibold text-white mb-3">Slack 알림 채널</h3>
            <div className="flex-1 space-y-3 overflow-y-auto text-xs pr-2">
                <SlackMessage user="FDS Bot" time="14:32" color="#ef4444">
                    <p className="font-bold">[CRITICAL] Wash Trading 제재</p>
                    <p className="font-mono text-gray-400">ID: A_55021b4ae2, A_c91db6cabf</p>
                    <p>조치: 출금 정지 완료</p>
                </SlackMessage>
                 <SlackMessage user="FDS Bot" time="14:35" color="#f59e0b">
                    <p className="font-bold">[HIGH] Funding Fee Abuse 의심</p>
                    <p className="font-mono text-gray-400">ID: A_f96ede8d34</p>
                    <p>담당자 확인 요청: @channel</p>
                </SlackMessage>
            </div>
            <div className="mt-2">
                <input
                    type="text"
                    placeholder="# fds-alerts에 메시지 보내기"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md text-sm px-3 py-1.5 text-white placeholder-gray-500"
                    disabled
                />
            </div>
        </div>
    );
};
