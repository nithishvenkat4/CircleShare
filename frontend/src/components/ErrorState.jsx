export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="error-state">
      <div className="icon-wrap">!</div>
      <h3>We hit a snag</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
