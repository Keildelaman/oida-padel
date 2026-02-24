import type { LeaderboardEntry } from '../../types'
import { Card } from '../shared'
import { PodiumGraphic } from './PodiumGraphic'
import { LeaderboardTable } from './LeaderboardTable'
import { useT } from '../../i18n'

interface LeaderboardViewProps {
  entries: LeaderboardEntry[]
  playerNames: Map<string, string>
  playerCount: number
  completedRounds: number
  courts: number
  scoringLabel: string
  showPodium: boolean
}

export function LeaderboardView({
  entries,
  playerNames,
  playerCount,
  completedRounds,
  courts,
  scoringLabel,
  showPodium,
}: LeaderboardViewProps) {
  const { t } = useT()
  const top3 = entries.slice(0, 3)

  return (
    <>
      {/* Summary */}
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-surface">{playerCount}</div>
            <div className="text-xs text-text-muted">{t('leaderboard.players')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-surface">{completedRounds}</div>
            <div className="text-xs text-text-muted">{t('leaderboard.roundsPlayed')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-surface">{courts}</div>
            <div className="text-xs text-text-muted">{t('leaderboard.courts')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-surface">{scoringLabel}</div>
            <div className="text-xs text-text-muted">{t('leaderboard.scoring')}</div>
          </div>
        </div>
      </Card>

      {/* Podium */}
      {showPodium && top3.length >= 3 && (
        <Card>
          <PodiumGraphic top3={top3} />
        </Card>
      )}

      {/* Table */}
      <Card padding={false}>
        <LeaderboardTable entries={entries} playerNames={playerNames} />
      </Card>
    </>
  )
}
