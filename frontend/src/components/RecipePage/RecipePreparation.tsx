interface Props {
  steps: string[];
  isFavorite: boolean;
  isAuthenticated: boolean;
  isSaving: boolean;
  onToggleFavorite: () => void;
}
export default function RecipePreparation({ steps, isFavorite, isAuthenticated, isSaving, onToggleFavorite }: Props) {
  return (
    <section aria-labelledby="preparation-heading" className="recipe-preparation-section">
      <h2 id="preparation-heading" className="recipe-section-title">Recipe Preparation</h2>
      {steps.length ? <div className="recipe-steps">{steps.map((step, index) => (
        <p key={index}>{step.replace(/^\s*(?:step\s*)?\d+[.)-]\s*/i, '')}</p>
      ))}</div> : <p className="recipe-muted">No preparation instructions have been provided.</p>}
      <button className="recipe-favorite-button" type="button" onClick={onToggleFavorite}
        disabled={isSaving} aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Remove recipe from favorites' : 'Add recipe to favorites'}>
        {isSaving ? 'Saving…' : isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </button>
      {!isAuthenticated && <p className="recipe-muted recipe-favorite-hint">Sign in to save this recipe.</p>}
    </section>
  );
}
