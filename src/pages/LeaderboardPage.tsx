import { useTournament, getLeaderboard } from '../state'
import { Button } from '../components/shared'
import { LeaderboardView } from '../components/leaderboard/LeaderboardView'
import { leaderboardToCsv, leaderboardToText, downloadFile } from '../utils/export'
import { DEFAULT_TARGET_SCORE, DEFAULT_MATCH_DURATION_MINUTES } from '../constants'
import { useT } from '../i18n'
import type { ScoringConfig } from '../types'

function scoringLabel(config: ScoringConfig, t: (key: string, params?: Record<string, string | number>) => string): string {
  switch (config.mode) {
    case 'points': return t('leaderboard.pts', { n: config.pointsPerMatch })
    case 'pointsToWin': return t('leaderboard.ptsToWin', { n: config.targetScore ?? DEFAULT_TARGET_SCORE })
    case 'timed': return t('leaderboard.timed', { n: config.matchDurationMinutes ?? DEFAULT_MATCH_DURATION_MINUTES })
    case 'winloss': return t('leaderboard.wl')
  }
}

export function LeaderboardPage() {
  const { state, dispatch } = useTournament()
  const { t } = useT()
  const tournament = state.tournament

  if (!tournament) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p>{t('leaderboard.noData')}</p>
        <button
          className="mt-3 text-accent hover:underline hover:text-accent-light"
          onClick={() => dispatch({ type: 'NAVIGATE_PAGE', payload: { page: 'setup' } })}
        >
          {t('leaderboard.goToSetup')}
        </button>
      </div>
    )
  }

  const leaderboard = getLeaderboard(tournament)
  const completedRounds = tournament.rounds.filter(r => r.completed).length
  const playerNames = new Map(tournament.players.map(p => [p.id, p.name]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold border-l-4 border-accent pl-3">
          {tournament.phase === 'finished' ? t('leaderboard.finalResults') : t('leaderboard.currentStandings')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="text-xs !px-3 !py-1.5"
            onClick={() => downloadFile(leaderboardToCsv(leaderboard, t), `${tournament.name}-results.csv`, 'text/csv')}
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
        playerCount={tournament.players.length}
        completedRounds={completedRounds}
        courts={tournament.courts}
        scoringLabel={scoringLabel(tournament.scoringConfig, t)}
        showPodium={tournament.phase === 'finished'}
      />

      {/* Actions */}
      {tournament.phase === 'finished' && (
        <div className="flex justify-center">
          <Button variant="destructive" onClick={() => dispatch({ type: 'RESET_TOURNAMENT' })}>
            {t('leaderboard.newTournament')}
          </Button>
        </div>
      )}
    </div>
  )
}
