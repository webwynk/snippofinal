import { STEPS } from "../../utils/helpers";

export default function Progress({ step }) {
  return (
    <>
      <div className="prog">
        {STEPS.map((l, i) => (
          <div className="prog-step" key={i}>
            <div className="prog-lw">
              <div className={`pdot ${i < step ? "pd" : i === step ? "pa" : "pf"}`}>{i < step ? "✓" : i + 1}</div>
              {i < STEPS.length - 1 && <div className={`pline ${i < step ? "done" : ""}`} />}
            </div>
            <div className={`plbl ${i === step ? "act" : i < step ? "done" : ""}`}>{l}</div>
          </div>
        ))}
      </div>
      <div className="prog-mini">
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 1 }}>{STEPS[step]}</div>

        </div>
        <div className="pm-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`pm ${i < step ? "done" : i === step ? "act" : ""}`} />
          ))}
        </div>
      </div>
    </>
  );
}
