import { useState, useEffect } from "react";

const STORAGE_KEY = "ic-checklist-session";

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(data: object) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const AREAS = ["ICU", "NICU", "ER", "OR", "CSSD", "DR", "WARD"] as const;
type Area = typeof AREAS[number];

interface Section {
  title: string;
  items: string[];
}

interface AreaConfig {
  color: string;
  icon: string;
  sections: Section[];
}

const CHECKLISTS: Record<Area, AreaConfig> = {
  ICU: {
    color: "#c0392b",
    icon: "🏥",
    sections: [
      {
        title: "Hand Hygiene",
        items: [
          "ABHR available at each bedside",
          "Staff performing hand hygiene at 5 moments",
          "Hand hygiene compliance observed ≥85%",
          "Sinks equipped with soap and paper towels",
        ],
      },
      {
        title: "CLABSI Bundle",
        items: [
          "Central line necessity reassessed daily",
          "CVC dressing clean, dry, and intact",
          "Insertion date and site documented",
          "Chlorhexidine patch/disc in place (if applicable)",
          "No signs of phlebitis or infection at insertion site",
          "Tubing change date labeled per policy",
        ],
      },
      {
        title: "CAUTI Bundle",
        items: [
          "Urinary catheter necessity reviewed daily",
          "Catheter secured to prevent traction",
          "Drainage bag below bladder level at all times",
          "Closed drainage system maintained",
          "Perineal care performed and documented",
          "Urine output documented hourly",
        ],
      },
      {
        title: "VAP Bundle",
        items: [
          "Head of bed elevation 30–45° documented",
          "Oral care with chlorhexidine performed every 4–6 h",
          "Sedation vacation performed daily",
          "Readiness-to-extubate assessed daily",
          "Subglottic suctioning performed (if applicable)",
          "In-line suction catheter changed per policy",
        ],
      },
      {
        title: "PPE & Isolation",
        items: [
          "Isolation precaution signs posted correctly",
          "PPE donned and doffed correctly outside room",
          "Dedicated equipment for isolated patients",
          "Correct glove type available and used",
          "N95 available for airborne precaution patients",
        ],
      },
      {
        title: "Environment & Waste",
        items: [
          "Bedsides clean and free of clutter",
          "High-touch surfaces disinfected between patients",
          "Sharps containers ≤3/4 full and labeled",
          "Waste segregated correctly (clinical/non-clinical)",
          "No expired supplies at bedside",
          "Clean and dirty areas clearly separated",
        ],
      },
    ],
  },
  NICU: {
    color: "#8e44ad",
    icon: "👶",
    sections: [
      {
        title: "Hand Hygiene",
        items: [
          "Surgical scrub performed before entering NICU",
          "ABHR available at incubator entry points",
          "Jewellery and artificial nails policy enforced",
          "Hand hygiene performed before and after infant contact",
        ],
      },
      {
        title: "CLABSI Bundle (NICU)",
        items: [
          "UVC/UAC/PICC insertion date documented",
          "Line dressing intact and labeled with date",
          "Line necessity reassessed daily",
          "Chlorhexidine skin prep used per gestational age policy",
          "Hub disinfection performed before each access",
        ],
      },
      {
        title: "Incubator & Equipment",
        items: [
          "Incubator cleaned daily and documented",
          "Incubator terminal clean performed between patients",
          "Humidifier water changed every 24 h",
          "Phototherapy equipment cleaned between uses",
          "Weighing scales cleaned before and after each use",
        ],
      },
      {
        title: "Breast Milk & Feeding",
        items: [
          "Breast milk labeled (name, MRN, date, time)",
          "Expressed milk stored at correct temperature",
          "Feeding tubes changed per policy",
          "No unlabeled feeds at bedside",
        ],
      },
      {
        title: "Environment",
        items: [
          "Surfaces cleaned with approved disinfectant",
          "Waste segregated correctly",
          "No clutter around incubators",
          "Visitor hand hygiene compliance observed",
        ],
      },
    ],
  },
  ER: {
    color: "#e67e22",
    icon: "🚨",
    sections: [
      {
        title: "Hand Hygiene",
        items: [
          "ABHR dispensers functional at all bays",
          "Staff compliance with hand hygiene observed",
          "Sinks available and operational",
        ],
      },
      {
        title: "Triage & Isolation",
        items: [
          "Febrile/respiratory patients masked at triage",
          "Airborne isolation room available and operational",
          "Isolation signage posted for suspected infections",
          "Rapid triage protocol for infectious diseases in place",
        ],
      },
      {
        title: "PPE & Sharps",
        items: [
          "Gloves, masks, gowns, eye protection available",
          "N95 respirators available and fit-tested",
          "Sharps containers present at all procedure areas",
          "No recapping of needles observed",
          "Sharps injury protocol visible and current",
        ],
      },
      {
        title: "Equipment & Environment",
        items: [
          "Stethoscopes cleaned between patients",
          "BP cuffs and pulse oximeters cleaned between patients",
          "Stretchers/beds cleaned between patients",
          "High-touch surfaces disinfected hourly during peak",
          "Spill kit available and accessible",
        ],
      },
    ],
  },
  OR: {
    color: "#27ae60",
    icon: "🔬",
    sections: [
      {
        title: "Surgical Hand Antisepsis",
        items: [
          "Surgical scrub performed 3–5 minutes",
          "No jewellery or artificial nails worn",
          "Surgical attire (cap, mask) worn correctly",
          "ABHR surgical rub used per protocol",
        ],
      },
      {
        title: "SSI Bundle",
        items: [
          "Prophylactic antibiotic given within 60 min of incision",
          "Hair removal performed with clippers (not razors)",
          "Normothermia maintained intraoperatively",
          "Glucose controlled intraoperatively for diabetic patients",
          "Antibiotic redosing performed for long procedures",
        ],
      },
      {
        title: "Sterile Field",
        items: [
          "Sterile field not left unattended",
          "Sterile items opened using aseptic technique",
          "Sterile drapes cover entire patient properly",
          "Sterility indicators checked on all packs",
          "No expired sterile items used",
        ],
      },
      {
        title: "PPE & Environment",
        items: [
          "Masks covering nose and mouth completely",
          "Head/hair fully covered in OR",
          "Traffic restricted during sterile procedures",
          "OR doors kept closed during procedures",
          "Positive pressure ventilation confirmed in OR",
        ],
      },
      {
        title: "Instruments",
        items: [
          "All instruments within sterility date",
          "Biological indicators checked and recorded",
          "Instrument count completed and documented",
          "Loaner/consignment instruments processed per policy",
        ],
      },
    ],
  },
  CSSD: {
    color: "#2980b9",
    icon: "♻️",
    sections: [
      {
        title: "Decontamination Area",
        items: [
          "Full PPE worn in decontamination zone",
          "Enzymatic soak performed on all instruments before washing",
          "Washer-disinfector cycle completed and recorded",
          "Instruments inspected in decontamination before packaging",
          "Decontamination area negative pressure confirmed",
        ],
      },
      {
        title: "Inspection & Packaging",
        items: [
          "Instruments inspected for cleanliness and function",
          "Packaging integrity checked before sealing",
          "Chemical indicators placed inside each pack",
          "Expiry date and lot number labeled on each pack",
          "Items wrapped per manufacturer's instructions",
        ],
      },
      {
        title: "Sterilization",
        items: [
          "Load records completed for every cycle",
          "Bowie-Dick test performed daily for steam sterilizers",
          "Biological indicators tested weekly (or per policy)",
          "Sterilizer printout/log reviewed for each cycle",
          "Failed loads quarantined and reported immediately",
        ],
      },
      {
        title: "Sterile Storage",
        items: [
          "Items stored ≥25 cm from floor",
          "Items ≥45 cm from ceiling sprinkler heads",
          "Storage area clean, dry, and temperature controlled",
          "FIFO (first in, first out) practice observed",
          "No open packages stored with sterile items",
        ],
      },
    ],
  },
  DR: {
    color: "#16a085",
    icon: "🍼",
    sections: [
      {
        title: "Delivery Preparation",
        items: [
          "Delivery bed cleaned/disinfected between deliveries",
          "Sterile delivery pack within sterility date",
          "Resuscitation equipment clean and functional",
          "Environment cleaned before each delivery",
        ],
      },
      {
        title: "PPE & Body Fluid",
        items: [
          "PPE used during delivery (gown, gloves, eye, mask)",
          "Appropriate gloves used for delivery",
          "Sharps management policy followed",
          "Blood/body fluid spills managed immediately per policy",
        ],
      },
      {
        title: "Neonatal & Environment",
        items: [
          "Sterile technique for cord clamping and cutting",
          "Neonatal resuscitation area cleaned between deliveries",
          "Placenta disposal per policy",
          "Linen changed and soiled linen bagged correctly",
          "Waste segregated immediately after delivery",
        ],
      },
    ],
  },
  WARD: {
    color: "#7f8c8d",
    icon: "🛏️",
    sections: [
      {
        title: "Hand Hygiene",
        items: [
          "ABHR dispensers functional at room entries",
          "Hand hygiene compliance observed ≥85%",
          "Sinks available and operational in patient rooms",
          "Staff observed performing 5 moments of hand hygiene",
        ],
      },
      {
        title: "Isolation Precautions",
        items: [
          "Isolation signs posted for all patients on precautions",
          "Dedicated PPE trolley outside isolation room",
          "PPE donning/doffing technique correct",
          "Single-use equipment used for isolated patients",
          "Visitors educated on isolation requirements",
        ],
      },
      {
        title: "IV Lines & Wound Care",
        items: [
          "Peripheral IV dressing clean, intact, labeled with date",
          "IV line necessity assessed daily",
          "Wound dressings clean and intact",
          "Wound care performed using aseptic technique",
          "No expired dressings or wound care products used",
        ],
      },
      {
        title: "Medication Safety",
        items: [
          "IV fluids labeled with date/time of preparation",
          "Multidose vials labeled with date opened",
          "No unlabeled syringes or medications at bedside",
          "Medication expiry dates checked before administration",
        ],
      },
      {
        title: "Environment & Waste",
        items: [
          "Patient rooms cleaned daily and documented",
          "High-touch surfaces disinfected twice daily",
          "Sharps containers ≤3/4 full and labeled",
          "Waste segregated correctly per color-coded policy",
          "Clean utility room separated from dirty utility room",
        ],
      },
    ],
  },
};

type CheckValue = "yes" | "no" | "na";

const getRiskColor = (s: number) =>
  s >= 85 ? "#27ae60" : s >= 60 ? "#e67e22" : "#c0392b";
const getRiskLabel = (s: number) =>
  s >= 85 ? "LOW RISK" : s >= 60 ? "MEDIUM RISK" : "HIGH RISK";

export default function App() {
  const saved = loadSession();

  const [activeArea, setActiveArea] = useState<Area>("ICU");
  const [checks, setChecks] = useState<Record<string, CheckValue | undefined>>(
    saved?.checks ?? {}
  );
  const [auditorName, setAuditorName] = useState<string>(
    saved?.auditorName ?? ""
  );
  const [roundDate, setRoundDate] = useState<string>(
    saved?.roundDate ?? new Date().toISOString().split("T")[0]
  );
  const [observations, setObservations] = useState<Record<string, string>>(
    saved?.observations ?? {}
  );
  const [showReport, setShowReport] = useState(false);
  const [actionPlan, setActionPlan] = useState<
    Record<number, { action?: string; responsible?: string; timeline?: string }>
  >(saved?.actionPlan ?? {});
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    saveSession({ checks, auditorName, roundDate, observations, actionPlan });
    setSavedToast(true);
    const t = setTimeout(() => setSavedToast(false), 1500);
    return () => clearTimeout(t);
  }, [checks, auditorName, roundDate, observations, actionPlan]);

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setChecks({});
    setAuditorName("");
    setRoundDate(new Date().toISOString().split("T")[0]);
    setObservations({});
    setActionPlan({});
    setShowClearConfirm(false);
  };

  const key = (area: string, sec: string, idx: number) =>
    `${area}||${sec}||${idx}`;
  const getVal = (area: string, sec: string, idx: number): CheckValue | undefined =>
    checks[key(area, sec, idx)];
  const toggle = (area: string, sec: string, idx: number, v: CheckValue) =>
    setChecks((p) => ({
      ...p,
      [key(area, sec, idx)]: p[key(area, sec, idx)] === v ? undefined : v,
    }));

  const calcScore = (area: Area): number | null => {
    let total = 0,
      yes = 0;
    CHECKLISTS[area].sections.forEach((s) =>
      s.items.forEach((_, i) => {
        const v = getVal(area, s.title, i);
        if (v) {
          total++;
          if (v === "yes") yes++;
        }
      })
    );
    return total === 0 ? null : Math.round((yes / total) * 100);
  };

  const getNonCompliant = (area: Area) => {
    const out: { area: Area; section: string; item: string }[] = [];
    CHECKLISTS[area].sections.forEach((s) =>
      s.items.forEach((item, i) => {
        if (getVal(area, s.title, i) === "no")
          out.push({ area, section: s.title, item });
      })
    );
    return out;
  };

  const allGaps = AREAS.flatMap(getNonCompliant);

  const overallScore = (): number | null => {
    let total = 0,
      yes = 0;
    AREAS.forEach((a) =>
      CHECKLISTS[a].sections.forEach((s) =>
        s.items.forEach((_, i) => {
          const v = getVal(a, s.title, i);
          if (v) {
            total++;
            if (v === "yes") yes++;
          }
        })
      )
    );
    return total === 0 ? null : Math.round((yes / total) * 100);
  };

  const updateAction = (
    idx: number,
    field: "action" | "responsible" | "timeline",
    value: string
  ) =>
    setActionPlan((p) => ({
      ...p,
      [idx]: { ...(p[idx] || {}), [field]: value },
    }));

  const buildReportHTML = () => {
    const score = overallScore();
    const scoreColor = score !== null ? getRiskColor(score) : "#666";

    const areaCards = AREAS.map((a) => {
      const s = calcScore(a);
      const c = s !== null ? getRiskColor(s) : "#ccc";
      return `<div style="display:inline-block;border:2px solid ${c};border-radius:8px;padding:8px 12px;text-align:center;min-width:80px;margin:3px">
        <div style="font-size:16px">${CHECKLISTS[a].icon}</div>
        <div style="font-weight:bold;font-size:12px">${a}</div>
        <div style="font-size:17px;font-weight:bold;color:${c}">${s !== null ? s + "%" : "—"}</div>
        <div style="font-size:9px;color:${c};font-weight:bold">${s !== null ? getRiskLabel(s) : "NOT STARTED"}</div>
      </div>`;
    }).join("");

    const gapRows =
      allGaps.length > 0
        ? allGaps
            .map((g, i) => {
              const ap = actionPlan[i] || {};
              return `<tr style="background:${i % 2 === 0 ? "#fff8f8" : "white"}">
              <td style="padding:8px;border:1px solid #ddd;vertical-align:top">
                <strong style="color:${CHECKLISTS[g.area].color};font-size:11px">${g.area}</strong><br/>
                <span style="color:#888;font-size:10px">${g.section}</span>
              </td>
              <td style="padding:8px;border:1px solid #ddd;font-size:11px;vertical-align:top">${g.item}</td>
              <td style="padding:8px;border:1px solid #ddd;font-size:11px;vertical-align:top">${ap.action || "—"}</td>
              <td style="padding:8px;border:1px solid #ddd;font-size:11px;vertical-align:top">${ap.responsible || "—"}</td>
              <td style="padding:8px;border:1px solid #ddd;font-size:11px;vertical-align:top">${ap.timeline || "—"}</td>
            </tr>`;
            })
            .join("")
        : `<tr><td colspan="5" style="padding:12px;text-align:center;color:#27ae60;font-weight:bold">✓ No non-compliant findings recorded</td></tr>`;

    const obsList = AREAS.filter((a) => observations[a])
      .map(
        (a) =>
          `<p style="margin:6px 0"><strong style="color:${CHECKLISTS[a].color}">${CHECKLISTS[a].icon} ${a}:</strong> ${observations[a]}</p>`
      )
      .join("");

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;margin:32px;color:#1a1a2e;font-size:13px}
  h2{color:#1a1a2e;border-bottom:2px solid #1a1a2e;padding-bottom:5px;margin-top:24px;font-size:14px}
  table{border-collapse:collapse;width:100%;margin-top:8px}
  th{background:#1a1a2e;color:white;padding:9px 10px;text-align:left;font-size:11px}
  @media print{body{margin:16px}.no-print{display:none}}
</style></head><body>
<div style="text-align:center;border-bottom:3px solid #1a1a2e;padding-bottom:14px;margin-bottom:20px">
  <div style="font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase">Hospital Infection Control Department</div>
  <div style="font-size:22px;font-weight:bold;margin:5px 0">WEEKLY ROUND REPORT</div>
  <div style="font-size:10px;color:#888">JCI & CBAHI Aligned | CONFIDENTIAL</div>
  <div style="font-size:12px;color:#555;margin-top:6px">
    <strong>Date:</strong> ${roundDate} &nbsp;|&nbsp; <strong>Auditor:</strong> ${auditorName || "_______________"}
  </div>
</div>
${
  score !== null
    ? `<div style="background:${scoreColor};color:white;border-radius:10px;padding:16px;text-align:center;margin-bottom:20px">
  <div style="font-size:11px;opacity:.85">OVERALL COMPLIANCE SCORE</div>
  <div style="font-size:34px;font-weight:bold">${score}%</div>
  <div style="font-size:13px;font-weight:bold">${getRiskLabel(score)}</div>
</div>`
    : ""
}
<h2>Area-by-Area Compliance</h2>
<div style="margin:12px 0">${areaCards}</div>
<h2 style="color:#c0392b">Non-Compliant Findings & Action Plan</h2>
<table>
  <thead><tr>
    <th style="width:14%">Area / Section</th>
    <th style="width:26%">Finding</th>
    <th style="width:26%">Corrective Action</th>
    <th style="width:18%">Responsible Party</th>
    <th style="width:16%">Timeline</th>
  </tr></thead>
  <tbody>${gapRows}</tbody>
</table>
<h2>Observations & Recommendations</h2>
${obsList || "<p style='color:#888'>No additional observations recorded.</p>"}
<h2>Signatures</h2>
<div style="display:flex;gap:40px;margin-top:10px">
  ${["IC Auditor", "Department Head", "IC Manager"]
    .map(
      (r) =>
        `<div style="border-top:1px solid #333;padding-top:6px;min-width:180px;font-size:11px">
          <strong>${r}:</strong><br/>___________________<br/>Date: ___________________
        </div>`
    )
    .join("")}
</div>
</body></html>`;
  };

  const exportReport = async (format: "pdf" | "doc") => {
    setExporting(true);
    setExportMsg(`Preparing ${format.toUpperCase()}...`);
    try {
      const html = buildReportHTML();
      if (format === "pdf") {
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(html);
          w.document.close();
          w.focus();
          setTimeout(() => {
            w.print();
            w.close();
          }, 600);
        }
        setExportMsg("✅ Print dialog opened — Save as PDF");
      } else {
        const blob = new Blob(["\ufeff" + html], {
          type: "application/msword",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `IC_Round_Report_${roundDate}.doc`;
        a.click();
        URL.revokeObjectURL(url);
        setExportMsg("✅ Downloaded — open in Microsoft Word");
      }
    } catch {
      setExportMsg("❌ Export failed. Please try again.");
    }
    setExporting(false);
    setTimeout(() => setExportMsg(""), 5000);
  };

  const area = activeArea;
  const areaData = CHECKLISTS[area];
  const score = calcScore(area);
  const os = overallScore();

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a1a2e,#0f3460)",
          color: "white",
          padding: "14px 16px",
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 15 }}>
                IC WEEKLY ROUND CHECKLIST
              </div>
              <div
                style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1 }}
              >
                JCI & CBAHI ALIGNED | HOSPITAL INFECTION CONTROL
              </div>
            </div>
            {os !== null && (
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: getRiskColor(os),
                  }}
                >
                  {os}%
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: "bold",
                    color: getRiskColor(os),
                    background: "rgba(255,255,255,0.1)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  OVERALL
                </div>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="Auditor Name"
              style={{
                padding: "5px 10px",
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 12,
              }}
            />
            <input
              type="date"
              value={roundDate}
              onChange={(e) => setRoundDate(e.target.value)}
              style={{
                padding: "5px 10px",
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 12,
              }}
            />
            <button
              onClick={() => setShowReport(true)}
              style={{
                padding: "6px 14px",
                borderRadius: 5,
                background: "#e74c3c",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              📋 Generate Report
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                padding: "6px 14px",
                borderRadius: 5,
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              🔄 New Round
            </button>
            {savedToast && (
              <span
                style={{
                  fontSize: 11,
                  color: "#2ecc71",
                  fontWeight: "bold",
                  opacity: 0.9,
                }}
              >
                ✓ Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "#16213e",
          display: "flex",
          overflowX: "auto",
          padding: "0 14px",
        }}
      >
        {AREAS.map((a) => {
          const s = calcScore(a);
          return (
            <button
              key={a}
              onClick={() => setActiveArea(a)}
              style={{
                padding: "9px 13px",
                border: "none",
                cursor: "pointer",
                background:
                  activeArea === a
                    ? CHECKLISTS[a].color
                    : "transparent",
                color: "white",
                fontWeight: activeArea === a ? "bold" : "normal",
                fontSize: 12,
                whiteSpace: "nowrap",
                borderBottom:
                  activeArea === a
                    ? `3px solid ${CHECKLISTS[a].color}`
                    : "3px solid transparent",
                transition: "background 0.2s",
              }}
            >
              {CHECKLISTS[a].icon} {a}
              {s !== null && (
                <span
                  style={{
                    marginLeft: 4,
                    fontSize: 10,
                    padding: "1px 4px",
                    borderRadius: 3,
                    background: getRiskColor(s),
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {s}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "14px" }}>
        {/* Area header */}
        <div
          style={{
            background: "white",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>{areaData.icon}</span>
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 17,
                  color: areaData.color,
                }}
              >
                {area}
              </div>
              <div style={{ fontSize: 11, color: "#888" }}>
                Mark each item: Yes / No / N/A
              </div>
            </div>
          </div>
          {score !== null && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: getRiskColor(score),
                }}
              >
                {score}%
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  padding: "2px 7px",
                  borderRadius: 4,
                  background: getRiskColor(score),
                  color: "white",
                }}
              >
                {getRiskLabel(score)}
              </div>
            </div>
          )}
        </div>

        {/* Checklist sections */}
        {areaData.sections.map((section) => (
          <div
            key={section.title}
            style={{
              background: "white",
              borderRadius: 8,
              marginBottom: 10,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                background: `${areaData.color}18`,
                padding: "7px 14px",
                borderBottom: `2px solid ${areaData.color}30`,
                fontWeight: "bold",
                fontSize: 12,
                color: areaData.color,
              }}
            >
              ▸ {section.title}
            </div>
            {section.items.map((item, idx) => {
              const val = getVal(area, section.title, idx);
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    borderBottom:
                      idx < section.items.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                    background: val === "no" ? "#fff5f5" : "white",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: "#333",
                      lineHeight: 1.4,
                    }}
                  >
                    {val === "no" && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: "bold",
                          color: "#c0392b",
                          background: "#fde8e8",
                          padding: "1px 4px",
                          borderRadius: 3,
                          marginRight: 5,
                        }}
                      >
                        GAP
                      </span>
                    )}
                    {item}
                  </div>
                  <div
                    style={{ display: "flex", gap: 4, flexShrink: 0 }}
                  >
                    {(["yes", "no", "na"] as CheckValue[]).map((v) => (
                      <button
                        key={v}
                        onClick={() =>
                          toggle(area, section.title, idx, v)
                        }
                        style={{
                          padding: "3px 8px",
                          border: `1.5px solid ${
                            v === "yes"
                              ? "#27ae60"
                              : v === "no"
                              ? "#c0392b"
                              : "#95a5a6"
                          }`,
                          borderRadius: 4,
                          cursor: "pointer",
                          background:
                            val === v
                              ? v === "yes"
                                ? "#27ae60"
                                : v === "no"
                                ? "#c0392b"
                                : "#95a5a6"
                              : "white",
                          color: val === v ? "white" : "#555",
                          fontWeight: val === v ? "bold" : "normal",
                          fontSize: 11,
                          transition: "all 0.15s",
                        }}
                      >
                        {v === "yes" ? "✓ Yes" : v === "no" ? "✗ No" : "N/A"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Observation */}
        <div
          style={{
            background: "white",
            borderRadius: 8,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: 12,
              marginBottom: 5,
              color: areaData.color,
            }}
          >
            📝 Observations & Recommendations — {area}
          </div>
          <textarea
            value={observations[area] || ""}
            onChange={(e) =>
              setObservations((p) => ({ ...p, [area]: e.target.value }))
            }
            placeholder="Additional observations or recommendations..."
            style={{
              width: "100%",
              minHeight: 65,
              padding: 8,
              borderRadius: 5,
              border: `1.5px solid ${areaData.color}50`,
              fontSize: 12,
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* NEW ROUND CONFIRM */}
      {showClearConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 28,
              maxWidth: 380,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔄</div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: 16,
                color: "#1a1a2e",
                marginBottom: 8,
              }}
            >
              Start a New Round?
            </div>
            <div
              style={{ fontSize: 13, color: "#666", marginBottom: 22 }}
            >
              This will clear all current checklist entries, scores, and
              action plan data. This action cannot be undone.
            </div>
            <div
              style={{ display: "flex", gap: 10, justifyContent: "center" }}
            >
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: "8px 22px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: "bold",
                  color: "#555",
                }}
              >
                Cancel
              </button>
              <button
                onClick={clearSession}
                style={{
                  padding: "8px 22px",
                  borderRadius: 6,
                  border: "none",
                  background: "#e74c3c",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: "bold",
                }}
              >
                Yes, Clear & Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
            padding: "20px 10px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              maxWidth: 840,
              width: "100%",
              padding: 24,
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowReport(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "#eee",
                border: "none",
                borderRadius: 20,
                width: 30,
                height: 30,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              ×
            </button>

            {/* Report Header */}
            <div
              style={{
                textAlign: "center",
                borderBottom: "3px solid #1a1a2e",
                paddingBottom: 14,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#888",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Hospital Infection Control Department
              </div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: "bold",
                  color: "#1a1a2e",
                  margin: "5px 0",
                }}
              >
                WEEKLY ROUND REPORT
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>
                Date: <strong>{roundDate}</strong> &nbsp;|&nbsp; Auditor:{" "}
                <strong>{auditorName || "_______________"}</strong>
              </div>
            </div>

            {/* Overall score */}
            {os !== null && (
              <div
                style={{
                  background: getRiskColor(os),
                  color: "white",
                  borderRadius: 8,
                  padding: "12px 0",
                  textAlign: "center",
                  marginBottom: 18,
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.85 }}>
                  OVERALL COMPLIANCE
                </div>
                <div style={{ fontSize: 32, fontWeight: "bold" }}>{os}%</div>
                <div style={{ fontSize: 12, fontWeight: "bold" }}>
                  {getRiskLabel(os)}
                </div>
              </div>
            )}

            {/* Area scores */}
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 13,
                  marginBottom: 8,
                  color: "#1a1a2e",
                  borderBottom: "2px solid #1a1a2e",
                  paddingBottom: 4,
                }}
              >
                Area-by-Area Compliance
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {AREAS.map((a) => {
                  const s = calcScore(a);
                  return (
                    <div
                      key={a}
                      style={{
                        border: `2px solid ${
                          s !== null ? getRiskColor(s) : "#ddd"
                        }`,
                        borderRadius: 8,
                        padding: "8px 12px",
                        textAlign: "center",
                        minWidth: 75,
                      }}
                    >
                      <div>{CHECKLISTS[a].icon}</div>
                      <div style={{ fontWeight: "bold", fontSize: 11 }}>
                        {a}
                      </div>
                      {s !== null ? (
                        <>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: getRiskColor(s),
                            }}
                          >
                            {s}%
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: "bold",
                              color: getRiskColor(s),
                            }}
                          >
                            {getRiskLabel(s)}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 10, color: "#aaa" }}>—</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Plan */}
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 13,
                  marginBottom: 8,
                  color: "#c0392b",
                  borderBottom: "2px solid #c0392b",
                  paddingBottom: 4,
                }}
              >
                Non-Compliant Findings & Action Plan
              </div>
              {allGaps.length === 0 ? (
                <div
                  style={{
                    color: "#27ae60",
                    fontSize: 13,
                    fontWeight: "bold",
                    padding: "10px 0",
                  }}
                >
                  ✅ No non-compliant findings recorded
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      borderCollapse: "collapse",
                      width: "100%",
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "Area / Section",
                          "Finding",
                          "Corrective Action",
                          "Responsible Party",
                          "Timeline",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              background: "#1a1a2e",
                              color: "white",
                              padding: "7px 8px",
                              textAlign: "left",
                              fontSize: 11,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allGaps.map((g, i) => (
                        <tr
                          key={i}
                          style={{
                            background: i % 2 === 0 ? "#fff8f8" : "white",
                          }}
                        >
                          <td
                            style={{
                              padding: "6px 8px",
                              border: "1px solid #eee",
                              verticalAlign: "top",
                              minWidth: 100,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                color: CHECKLISTS[g.area].color,
                                fontSize: 11,
                              }}
                            >
                              {CHECKLISTS[g.area].icon} {g.area}
                            </div>
                            <div style={{ color: "#888", fontSize: 10 }}>
                              {g.section}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "6px 8px",
                              border: "1px solid #eee",
                              verticalAlign: "top",
                              fontSize: 11,
                            }}
                          >
                            {g.item}
                          </td>
                          <td
                            style={{
                              padding: "4px 5px",
                              border: "1px solid #eee",
                            }}
                          >
                            <textarea
                              value={(actionPlan[i] || {}).action || ""}
                              onChange={(e) =>
                                updateAction(i, "action", e.target.value)
                              }
                              placeholder="Corrective action..."
                              style={{
                                width: "100%",
                                minHeight: 48,
                                fontSize: 11,
                                border: "1px solid #ddd",
                                borderRadius: 4,
                                padding: 4,
                                resize: "vertical",
                                boxSizing: "border-box",
                              }}
                            />
                          </td>
                          <td
                            style={{
                              padding: "4px 5px",
                              border: "1px solid #eee",
                            }}
                          >
                            <input
                              value={(actionPlan[i] || {}).responsible || ""}
                              onChange={(e) =>
                                updateAction(
                                  i,
                                  "responsible",
                                  e.target.value
                                )
                              }
                              placeholder="Name / Role"
                              style={{
                                width: "100%",
                                fontSize: 11,
                                border: "1px solid #ddd",
                                borderRadius: 4,
                                padding: 4,
                                boxSizing: "border-box",
                              }}
                            />
                          </td>
                          <td
                            style={{
                              padding: "4px 5px",
                              border: "1px solid #eee",
                            }}
                          >
                            <input
                              value={(actionPlan[i] || {}).timeline || ""}
                              onChange={(e) =>
                                updateAction(i, "timeline", e.target.value)
                              }
                              placeholder="e.g. 24h / 1wk"
                              style={{
                                width: "100%",
                                fontSize: 11,
                                border: "1px solid #ddd",
                                borderRadius: 4,
                                padding: 4,
                                boxSizing: "border-box",
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Observations */}
            {AREAS.some((a) => observations[a]) && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 13,
                    marginBottom: 6,
                    color: "#1a1a2e",
                    borderBottom: "2px solid #1a1a2e",
                    paddingBottom: 4,
                  }}
                >
                  Observations & Recommendations
                </div>
                {AREAS.filter((a) => observations[a]).map((a) => (
                  <div key={a} style={{ marginBottom: 6, fontSize: 12 }}>
                    <strong style={{ color: CHECKLISTS[a].color }}>
                      {CHECKLISTS[a].icon} {a}:
                    </strong>{" "}
                    <span style={{ color: "#444" }}>{observations[a]}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Export */}
            <div
              style={{
                borderTop: "2px solid #eee",
                paddingTop: 14,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => exportReport("doc")}
                disabled={exporting}
                style={{
                  padding: "8px 18px",
                  background: "#2980b9",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                📄 Export as DOCX
              </button>
              <button
                onClick={() => exportReport("pdf")}
                disabled={exporting}
                style={{
                  padding: "8px 18px",
                  background: "#c0392b",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                🖨️ Export as PDF
              </button>
              {exportMsg && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    color:
                      exportMsg.startsWith("✅")
                        ? "#27ae60"
                        : exportMsg.startsWith("❌")
                        ? "#c0392b"
                        : "#555",
                  }}
                >
                  {exportMsg}
                </span>
              )}
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#888",
                  textAlign: "right",
                }}
              >
                <div>
                  <strong>Auditor:</strong> {auditorName || "_______________"}
                </div>
                <div
                  style={{
                    color: "#c0392b",
                    fontWeight: "bold",
                    fontSize: 10,
                  }}
                >
                  CONFIDENTIAL
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
