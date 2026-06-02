const SCORE_STATE_KEY = "currentScoreState";

export function setCurrentScoreState(state) {
  if (!state || !state.musicxml || !state.config) {
    return;
  }

  const payload = {
    musicxml: state.musicxml,
    config: state.config,
    scoreId: state.scoreId || null
  };

  sessionStorage.setItem(SCORE_STATE_KEY, JSON.stringify(payload));
}

export function getCurrentScoreState() {
  const raw = sessionStorage.getItem(SCORE_STATE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCurrentScoreState() {
  sessionStorage.removeItem(SCORE_STATE_KEY);
}