import { useMemo } from 'react'
import { useTournament, usePlayerGroup, reconstructLeaderboard } from '../state'
import { Button } from '../components/shared'
import { LeaderboardView } from '../components/leaderboard/LeaderboardView'
import { leaderboardToCsv, leaderboardToText, downloadFile } from '../utils/export'
import { DEFAULT_TARGET_SCORE, DEFAULT_MATCH_DURATION_MINUTES } from '../constants'
import { useT } from '../i18n'
import { formatDate } from '../utils/dates'
import type { ScoringConfig, ScoringMode } from '../types'

function buildScoringConfig(config: {
  scoringMode: string
  pointsPerMatch: number
  targetScore?: number
  matchDurationMinutes?: number
}): ScoringConfig {
  return {
    mode: config.scoringMode as ScoringMode,
    pointsPerMatch: config.pointsPerMatch,
    targetScore: config.targetScore,
    matchDurationMinutes: config.matchDurationMinutes,
  }
}

function scoringLabel(config: ScoringConfig, t: (key: string, params?: Record<string, string | number>) => string): string {
  switch (config.mode) {
    case 'points': return t('leaderboard.pts', { n: config.pointsPerMatch })
    case 'pointsToWin': return t('leaderboard.ptsToWin', { n: config.targetScore ?? DEFAULT_TARGET_SCORE })
    case 'timed': return t('leaderboard.timed', { n: config.matchDurationMinutes ?? DEFAULT_MATCH_DURATION_MINUTES })
    case 'winloss': return t('leaderboard.wl')
  }
}

export function TournamentResultPage() {
  const { state, dispatch } = useTournament()
  const { activeGroup } = usePlayerGroup()
  const { t } = useT()

  const tournamentId = state.viewingTournamentId
  const record = activeGroup?.tournamentHistory.find(r => r.id === tournamentId) ?? null

  const leaderboard = useMemo(() => {
    if (!record || !activeGroup) return []
    return reconstructLeaderboard(record, activeGroup)
  }, [record, activeGroup])

  // Build player names map from the reconstructed leaderboard
  const playerNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const entry of leaderboard) {
      map.set(entry.playerId, entry.playerName)
    }
    return map
  }, [leaderboard])

  // Determine back navigation — go back to player detail if we came from one
  const backToPlayerId = state.viewingPlayerId
  const backToPlayerName = backToPlayerId ? (activeGroup?.players.find(p => p.id === backToPlayerId)?.name ?? null) : null

  const handleBack = () => {
    if (backToPlayerId) {
      dispatch({ type: 'VIEW_PLAYER_DETAIL', payload: { playerId: backToPlayerId } })
    } else {
      dispatch({ type: 'NAVIGATE_PAGE', payload: { page: 'players' } })
    }
  }

  if (!record || !activeGroup) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p>{t('tournamentResult.notFound')}</p>
        <button
          className="mt-3 text-accent hover:underline hover:text-accent-light"
          onClick={() => dispatch({ type: 'NAVIGATE_PAGE', payload: { page: 'players' } })}
        >
          {t('tournamentResult.backToPlayers')}
        </button>
      </div>
    )
  }

  const scoring = buildScoringConfig(record.config)
  const completedRounds = new Set(record.matches.map(m => m.round)).size

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button
        className="text-sm text-accent hover:underline hover:text-accent-light flex items-center gap-1"
        onClick={handleBack}
      >
        <span>&larr;</span> {backToPlayerName
          ? t('tournamentResult.back', { name: backToPlayerName })
          : t('tournamentResult.backToPlayers')
        }
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold border-l-4 border-accent pl-3">
            {record.name}
          </h2>
          <p className="text-sm text-text-muted mt-1 pl-4">{formatDate(record.date)}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="text-xs !px-3 !py-1.5"
            onClick={() => downloadFile(leaderboardToCsv(leaderboard, t), `${record.name}-results.csv`, 'text/csv')}
          >
            {t('leaderboard.exportCsv')}
          </Button>
          <Button
            variant="secondary"
            className="text-xs !px-3 !py-1.5"
            onClick={() => {
              const text = leaderboardToText(leaderboard, t)
              navigator.clipboard.writeText(text)
            }}
          >
            {t('leaderboard.copyText')}
          </Button>
        </div>
      </div>

      <LeaderboardView
        entries={leaderboard}
        playerNames={playerNames}
        playerCount={record.playerIds.length}
        completedRounds={completedRounds}
        courts={record.config.courts}
        scoringLabel={scoringLabel(scoring, t)}
        showPodium={true}
      />
    </div>
  )
}
