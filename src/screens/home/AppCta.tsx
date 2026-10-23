import { Wrap } from './section';

/**
 * Home-page footer.
 *
 * The "UroApp for iPhone — in development / TestFlight planned" band that used
 * to sit here was removed for the App Store build: inside the shipped app it is
 * false, and pre-release wording invites rejection under guideline 2.2
 * (betas and demos do not belong on the App Store).
 */
export function AppCta() {
  return (
    <footer className="border-t border-line py-12 text-[13px] text-muted-2">
      <Wrap>
        <div className="text-center">
          © 2026 UroApp · Jeddah, Saudi Arabia · For licensed healthcare professionals
        </div>
      </Wrap>
    </footer>
  );
}
