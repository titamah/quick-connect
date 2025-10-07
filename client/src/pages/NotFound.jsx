import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  const [secondsRemaining, setSecondsRemaining] = React.useState(10);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          navigate("/", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-neutral-900 flex items-center justify-center px-6 text-center">
      <div className="max-w-xl">
        <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4">404</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-6">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[var(--btn-bg,#111)] text-white hover:opacity-90 transition"
        >
          Go Home
        </button>
        <p className="mt-4 text-sm text-[var(--text-tertiary,#9CA3AF)]">
          Redirecting to home in {secondsRemaining}s
        </p>
      </div>
    </div>
  );
}

export default NotFound;


