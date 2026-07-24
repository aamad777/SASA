import { useState } from 'react';

type ParentalGateProps = {
  onSuccess: () => void;
  onCancel: () => void;
  parentPin: string;
  requireParentPin: boolean;
};

const answers = [12, 13, 14];

export default function ParentalGate({
  onSuccess,
  onCancel,
  parentPin,
  requireParentPin,
}: ParentalGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submitPin = () => {
    if (pin === parentPin) {
      onSuccess();
      return;
    }

    setError('Incorrect PIN. Please try again.');
    setPin('');
  };

  const handleAnswer = (answer: number) => {
    if (answer === 13) {
      onSuccess();
      return;
    }

    setError(
      'That answer is not correct. Please try again.',
    );
  };

  return (
    <main className="parental-gate-page">
      <div className="gate-floating gate-star-one">
        <StarIcon />
      </div>

      <div className="gate-floating gate-star-two">
        <StarIcon />
      </div>

      <div className="gate-floating gate-bubble-one" />
      <div className="gate-floating gate-bubble-two" />

      <header className="relative z-10 pb-4 pt-16 text-center">
        <h1 className="parental-gate-title text-5xl font-bold tracking-tight md:text-6xl">
          Parental Gate
        </h1>

        <p className="mt-2 text-2xl font-semibold text-white drop-shadow-md">
          Unlock for grown-ups!
        </p>
      </header>

      <section className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6">
        <div className="relative z-0 -mb-20 h-64 w-64">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuhFLjA7C4vSHSoHk0x0esbFoQC4GUjdM5vkXEQAPaDpZYUzJf2rTF8Spt3aYfPstUdeATEzeO-2HabF_C2pgNPtGBK-kIonhnM4_ex53CLOG0PZC1uytQA7XhiAzGwUO5esrZf6ra5_Gp5b1rU4Z_n7QmExrHiIr2WQ8nE3n0_bnF68JHX9RiCF6CSo4DIbengWCxuvTNx8MsqWgvIAM4WHbu7jvnSghNLUSDcNxNrw9XHiBDKGCj-SKBCWhpQFnqw2hbrkvEuHQ"
            alt="Cute waving monster"
            className="h-full w-full object-contain"
          />
        </div>

        {requireParentPin ? (
          <div className="parental-question-box relative z-10 w-full max-w-sm bg-white p-8 text-center">
            <h2 className="text-3xl font-bold text-[#5d8aa8]">
              Enter Parent PIN
            </h2>

            <input
              className="parent-gate-pin-input"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              autoFocus
              placeholder="••••"
              onChange={(event) => {
                setPin(
                  event.target.value.replace(/\D/g, ''),
                );
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitPin();
                }
              }}
            />

            <button
              type="button"
              className="parent-gate-pin-submit"
              onClick={submitPin}
            >
              Unlock Parent Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="parental-question-box relative z-10 w-full max-w-sm bg-white p-10 text-center">
              <p className="mb-2 text-3xl font-bold text-[#5d8aa8]">
                What is
              </p>

              <div className="flex items-center justify-center gap-3 text-6xl font-bold">
                <span className="gate-math-number">8</span>
                <span className="text-[#80c1df]">+</span>
                <span className="gate-math-number">
                  5?
                </span>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-sm justify-between gap-4">
              {answers.map((answer) => (
                <button
                  key={answer}
                  type="button"
                  className="parental-answer-button flex flex-1 items-center justify-center rounded-3xl bg-[#aee4ff] py-10 transition-transform active:translate-y-1"
                  onClick={() =>
                    handleAnswer(answer)
                  }
                >
                  <span className="gate-answer-number text-6xl font-bold">
                    {answer}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {error && (
          <p className="parent-gate-error">
            {error}
          </p>
        )}
      </section>

      <footer className="relative z-10 pb-12 pt-6">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border-4 border-[#bde9ff] bg-white/80 px-8 py-3 text-xl font-bold text-[#5d8aa8] shadow-sm backdrop-blur-sm transition-all active:scale-95"
          onClick={onCancel}
        >
          <GearIcon />
          Cancel
        </button>
      </footer>
    </main>
  );
}

function StarIcon() {
  return (
    <svg
      fill="currentColor"
      height="24"
      width="24"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.66.07 1l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z" />
    </svg>
  );
}
