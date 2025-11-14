import React from 'react'
import { FaSlack } from 'react-icons/fa'
import { LogEntry } from '../../types'

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
)

interface SlackFeedProps {
    logs: LogEntry[]
}

// 로그 메시지를 Slack 메시지로 변환하는 함수
function parseSlackMessage(log: LogEntry) {
    // 예시 메시지:
    // [출금 정지] ID: A_c91db6cabf (wash 확정) - 조치 완료
    // [관리자 알림] ID: A_c91db6cabf (wash 의심) - 담당자 Slack 전송
    // [관리자 알림] ID: A_55021b4ae2 (wash 의심) - 담당자 Slack 전송

    const { message, timestamp } = log
    let user = 'FDS Bot'
    let color = '#64748b' // default gray
    let title = ''
    let ids: string[] = []
    let detail = ''

    if (message.startsWith('[출금 정지]')) {
        color = '#ef4444' // red
        // [출금 정지] ID: A_c91db6cabf (wash 확정) - 조치 완료
        const idMatch = message.match(/ID: ([^ ]+)/)
        if (idMatch) ids.push(idMatch[1])
        title = '[CRITICAL] Wash Trading 제재'
        detail = '조치: 출금 정지 완료'
    } else if (message.startsWith('[관리자 알림]')) {
        color = '#f59e0b' // yellow
        // [관리자 알림] ID: A_c91db6cabf (wash 의심) - 담당자 Slack 전송
        const idMatch = message.match(/ID: ([^ ]+)/)
        if (idMatch) ids.push(idMatch[1])
        title = '[HIGH] Wash Trading 의심'
        detail = '담당자 확인 요청: @channel'
    } else {
        // 기타 메시지
        title = message
    }

    return {
        user,
        color,
        title,
        ids,
        detail,
        time: new Date(timestamp).toLocaleTimeString('ko-KR'),
    }
}

export const SlackFeed: React.FC<SlackFeedProps> = ({ logs }) => {
    const [showLogs, setShowLogs] = React.useState(true)
    // 최신순 정렬, wash 제재/의심만 추출
    const slackMessages = logs
        .filter((log) => log.message.startsWith('[출금 정지]') || log.message.startsWith('[관리자 알림]'))
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(parseSlackMessage)

    return (
        <div className=" h-fit max-h-[300px] bg-gray-900 rounded-lg p-3 flex flex-col">
            <div className="flex flex-row justify-between items-center ">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center flex-shrink-0">
                    <FaSlack />
                    Slack 알림 채널
                </h2>
                <h3
                    onClick={() => {
                        setShowLogs(!showLogs)
                    }}
                    className="ml-2 text-md text-gray-400"
                >
                    {showLogs ? '▲' : '▼'}
                </h3>
            </div>
            {showLogs && (
                <>
                    <div className="flex-1 space-y-3 overflow-y-auto text-xs pr-2">
                        {slackMessages.length === 0 && <div className="text-gray-500 text-center py-4">전달된 Slack 메시지가 없습니다.</div>}
                        {slackMessages.map((msg, idx) => (
                            <SlackMessage key={idx} user={msg.user} time={msg.time} color={msg.color}>
                                <p className="font-bold">{msg.title}</p>
                                {msg.ids.length > 0 && <p className="font-mono text-gray-400">ID: {msg.ids.join(', ')}</p>}
                                {msg.detail && <p>{msg.detail}</p>}
                            </SlackMessage>
                        ))}
                    </div>
                    <div className="mt-2">
                        <input
                            type="text"
                            placeholder="# fds-alerts에 메시지 보내기"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md text-sm px-3 py-1.5 text-white placeholder-gray-500"
                            disabled
                        />
                    </div>
                </>
            )}
        </div>
    )
}
