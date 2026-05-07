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

const REPORTS_KEY = "ic-weekly-reports";
const SEVEN_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const HOSPITAL_NAME = "SGH - Hia Aljamea";
const HOSPITAL_DEPT = "Infection Control Department";

interface SavedReport {
  id: string;
  savedAt: number;
  roundDate: string;
  auditorName: string;
  overallScore: number | null;
  areaScores: Partial<Record<string, number | null>>;
  reportHTML: string;
}

function loadReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    const all: SavedReport[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - SEVEN_DAYS_MS;
    return all.filter((r) => r.savedAt >= cutoff);
  } catch {
    return [];
  }
}

function persistReports(reports: SavedReport[]) {
  try {
    const cutoff = Date.now() - SEVEN_DAYS_MS;
    const pruned = reports.filter((r) => r.savedAt >= cutoff);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(pruned));
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
  const [showReportsList, setShowReportsList] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>(() => loadReports());
  const [customItems, setCustomItems] = useState<Record<string, string[]>>(
    saved?.customItems ?? {}
  );
  const [addItemInput, setAddItemInput] = useState<Record<string, string>>({});

  useEffect(() => {
    saveSession({ checks, auditorName, roundDate, observations, actionPlan, customItems });
    setSavedToast(true);
    const t = setTimeout(() => setSavedToast(false), 1500);
    return () => clearTimeout(t);
  }, [checks, auditorName, roundDate, observations, actionPlan, customItems]);

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setChecks({});
    setAuditorName("");
    setRoundDate(new Date().toISOString().split("T")[0]);
    setObservations({});
    setActionPlan({});
    setCustomItems({});
    setShowClearConfirm(false);
  };

  const doSaveReport = (html: string) => {
    const os = overallScore();
    const newReport: SavedReport = {
      id: Date.now().toString(),
      savedAt: Date.now(),
      roundDate,
      auditorName,
      overallScore: os,
      areaScores: Object.fromEntries(AREAS.map((a) => [a, calcScore(a)])),
      reportHTML: html,
    };
    const updated = [newReport, ...loadReports()];
    persistReports(updated);
    setSavedReports(loadReports());
  };

  const deleteReport = (id: string) => {
    const updated = savedReports.filter((r) => r.id !== id);
    persistReports(updated);
    setSavedReports(updated);
  };

  const exportReportPDF = (html: string) => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => { w.print(); w.close(); }, 600);
    }
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

  const customKey = (area: string, sec: string, idx: number) =>
    `${area}||${sec}||c${idx}`;
  const getCustomVal = (area: string, sec: string, idx: number): CheckValue | undefined =>
    checks[customKey(area, sec, idx)];
  const toggleCustom = (area: string, sec: string, idx: number, v: CheckValue) =>
    setChecks((p) => ({
      ...p,
      [customKey(area, sec, idx)]: p[customKey(area, sec, idx)] === v ? undefined : v,
    }));

  const addCustomItem = (area: string, sec: string) => {
    const k = `${area}||${sec}`;
    const text = (addItemInput[k] || "").trim();
    if (!text) return;
    setCustomItems((p) => ({ ...p, [k]: [...(p[k] || []), text] }));
    setAddItemInput((p) => ({ ...p, [k]: "" }));
  };

  const deleteCustomItem = (area: string, sec: string, idx: number) => {
    const k = `${area}||${sec}`;
    const oldArr = customItems[k] || [];
    setCustomItems((p) => {
      const arr = [...(p[k] || [])];
      arr.splice(idx, 1);
      return { ...p, [k]: arr };
    });
    setChecks((p) => {
      const next = { ...p };
      delete next[customKey(area, sec, idx)];
      for (let i = idx + 1; i < oldArr.length; i++) {
        const fromK = customKey(area, sec, i);
        const toK = customKey(area, sec, i - 1);
        if (next[fromK] !== undefined) next[toK] = next[fromK];
        else delete next[toK];
        delete next[fromK];
      }
      return next;
    });
  };

  const calcScore = (area: Area): number | null => {
    let total = 0, yes = 0;
    CHECKLISTS[area].sections.forEach((s) => {
      s.items.forEach((_, i) => {
        const v = getVal(area, s.title, i);
        if (v) { total++; if (v === "yes") yes++; }
      });
      (customItems[`${area}||${s.title}`] || []).forEach((_, i) => {
        const v = getCustomVal(area, s.title, i);
        if (v) { total++; if (v === "yes") yes++; }
      });
    });
    return total === 0 ? null : Math.round((yes / total) * 100);
  };

  const getNonCompliant = (area: Area) => {
    const out: { area: Area; section: string; item: string }[] = [];
    CHECKLISTS[area].sections.forEach((s) => {
      s.items.forEach((item, i) => {
        if (getVal(area, s.title, i) === "no")
          out.push({ area, section: s.title, item });
      });
      (customItems[`${area}||${s.title}`] || []).forEach((item, i) => {
        if (getCustomVal(area, s.title, i) === "no")
          out.push({ area, section: s.title, item: `★ ${item}` });
      });
    });
    return out;
  };

  const allGaps = AREAS.flatMap(getNonCompliant);

  const overallScore = (): number | null => {
    let total = 0, yes = 0;
    AREAS.forEach((a) =>
      CHECKLISTS[a].sections.forEach((s) => {
        s.items.forEach((_, i) => {
          const v = getVal(a, s.title, i);
          if (v) { total++; if (v === "yes") yes++; }
        });
        (customItems[`${a}||${s.title}`] || []).forEach((_, i) => {
          const v = getCustomVal(a, s.title, i);
          if (v) { total++; if (v === "yes") yes++; }
        });
      })
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

    const generatedAt = new Date();
    const generatedDateStr = generatedAt.toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    const generatedTimeStr = generatedAt.toLocaleTimeString(undefined, {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    const reportId = `IC-${generatedAt.getFullYear()}${String(generatedAt.getMonth()+1).padStart(2,"0")}${String(generatedAt.getDate()).padStart(2,"0")}-${String(generatedAt.getHours()).padStart(2,"0")}${String(generatedAt.getMinutes()).padStart(2,"0")}`;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;margin:32px;color:#1a1a2e;font-size:13px}
  h2{color:#1a1a2e;border-bottom:2px solid #1a1a2e;padding-bottom:5px;margin-top:24px;font-size:14px}
  table{border-collapse:collapse;width:100%;margin-top:8px}
  th{background:#1a1a2e;color:white;padding:9px 10px;text-align:left;font-size:11px}
  .meta-table td{padding:4px 10px 4px 0;font-size:12px;border:none;vertical-align:top}
  .meta-label{color:#888;font-size:11px;font-weight:bold;white-space:nowrap}
  @media print{body{margin:16px}.no-print{display:none}}
</style></head><body>

<!-- Official Header -->
<div style="border-bottom:3px solid #1a1a2e;padding-bottom:14px;margin-bottom:4px">
  <div style="display:flex;align-items:flex-start;justify-content:space-between">
    <div>
      <div style="font-size:20px;font-weight:bold;color:#1a1a2e;letter-spacing:0.5px">SGH — Hia Aljamea</div>
      <div style="font-size:12px;color:#555;font-weight:600;margin-top:2px">Infection Control Department</div>
      <div style="font-size:9px;color:#888;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px">IC WEEKLY ROUND REPORT</div>
      <div style="font-size:10px;color:#aaa;margin-top:2px">JCI & CBAHI Aligned &nbsp;|&nbsp; Not for Distribution</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px">Report ID</div>
      <div style="font-size:13px;font-weight:bold;color:#1a1a2e;font-family:monospace">${reportId}</div>
      <div style="margin-top:6px">
        <span style="background:#1a1a2e;color:white;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:bold;letter-spacing:1px">OFFICIAL</span>
      </div>
    </div>
  </div>
</div>

<!-- Report Meta Table -->
<div style="display:flex;gap:40px;margin:12px 0 20px;padding:10px 14px;background:#f7f8fa;border-radius:6px;border:1px solid #e5e7eb">
  <table class="meta-table">
    <tr>
      <td class="meta-label">Round Date:</td>
      <td style="font-weight:bold;font-size:13px">${roundDate}</td>
    </tr>
    <tr>
      <td class="meta-label">Auditor Name:</td>
      <td style="font-weight:bold;font-size:13px">${auditorName || "___________________________"}</td>
    </tr>
  </table>
  <table class="meta-table">
    <tr>
      <td class="meta-label">Date Generated:</td>
      <td style="font-size:12px">${generatedDateStr}</td>
    </tr>
    <tr>
      <td class="meta-label">Time Generated:</td>
      <td style="font-size:12px">${generatedTimeStr}</td>
    </tr>
  </table>
  <table class="meta-table" style="margin-left:auto">
    <tr>
      <td class="meta-label">Status:</td>
      <td><span style="background:#1a1a2e;color:white;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold">OFFICIAL</span></td>
    </tr>
  </table>
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
              <div style={{ fontWeight: "bold", fontSize: 16, letterSpacing: 0.3 }}>
                {HOSPITAL_NAME}
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: "600" }}>
                {HOSPITAL_DEPT} — IC Weekly Round Checklist
              </div>
              <div style={{ fontSize: 9, opacity: 0.5, letterSpacing: 1, marginTop: 1 }}>
                JCI & CBAHI ALIGNED
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
              onClick={() => {
                const html = buildReportHTML();
                doSaveReport(html);
                setShowReport(true);
              }}
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
              onClick={() => setShowReportsList(true)}
              style={{
                padding: "6px 14px",
                borderRadius: 5,
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                cursor: "pointer",
                fontSize: 12,
                position: "relative",
              }}
            >
              📂 Reports
              {savedReports.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#f39c12",
                  color: "white",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  fontSize: 10,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {savedReports.length}
                </span>
              )}
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
            {/* Custom items */}
            {(customItems[`${area}||${section.title}`] || []).map((item, idx) => {
              const val = getCustomVal(area, section.title, idx);
              return (
                <div
                  key={`c${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    borderTop: "1px dashed #e0f0e8",
                    background: val === "no" ? "#fff5f5" : "#f6fff9",
                  }}
                >
                  <div style={{ flex: 1, fontSize: 12, color: "#333", lineHeight: 1.4 }}>
                    {val === "no" && (
                      <span style={{ fontSize: 9, fontWeight: "bold", color: "#c0392b", background: "#fde8e8", padding: "1px 4px", borderRadius: 3, marginRight: 5 }}>GAP</span>
                    )}
                    <span style={{ color: areaData.color, fontWeight: "bold", marginRight: 4, fontSize: 10 }}>★</span>
                    {item}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {(["yes", "no", "na"] as CheckValue[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => toggleCustom(area, section.title, idx, v)}
                        style={{
                          padding: "3px 8px",
                          border: `1.5px solid ${v === "yes" ? "#27ae60" : v === "no" ? "#c0392b" : "#95a5a6"}`,
                          borderRadius: 4,
                          cursor: "pointer",
                          background: val === v ? (v === "yes" ? "#27ae60" : v === "no" ? "#c0392b" : "#95a5a6") : "white",
                          color: val === v ? "white" : "#555",
                          fontWeight: val === v ? "bold" : "normal",
                          fontSize: 11,
                          transition: "all 0.15s",
                        }}
                      >
                        {v === "yes" ? "✓ Yes" : v === "no" ? "✗ No" : "N/A"}
                      </button>
                    ))}
                    <button
                      onClick={() => deleteCustomItem(area, section.title, idx)}
                      title="Remove item"
                      style={{ padding: "3px 8px", border: "1.5px solid #ddd", borderRadius: 4, cursor: "pointer", background: "white", color: "#c0392b", fontSize: 13, lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
            {/* Add custom item row */}
            <div style={{ display: "flex", gap: 6, padding: "7px 14px", borderTop: "1px dashed #e0e0e0", background: "#f9f9f9" }}>
              <input
                value={addItemInput[`${area}||${section.title}`] || ""}
                onChange={(e) => setAddItemInput((p) => ({ ...p, [`${area}||${section.title}`]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") addCustomItem(area, section.title); }}
                placeholder="+ Type a custom audit item and press Enter or Add…"
                style={{ flex: 1, padding: "4px 8px", fontSize: 11, border: "1px solid #ddd", borderRadius: 4, outline: "none", color: "#333", background: "white" }}
              />
              <button
                onClick={() => addCustomItem(area, section.title)}
                style={{ padding: "4px 12px", fontSize: 11, background: areaData.color, color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}
              >
                Add
              </button>
            </div>
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

      {/* REPORTS LIST MODAL */}
      {showReportsList && (
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
              maxWidth: 720,
              width: "100%",
              padding: 24,
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowReportsList(false)}
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

            {/* Header */}
            <div
              style={{
                borderBottom: "3px solid #1a1a2e",
                paddingBottom: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1a1a2e",
                  marginBottom: 3,
                }}
              >
                📂 Saved Reports
              </div>
              <div style={{ fontSize: 11, color: "#888" }}>
                Reports are automatically kept for 30 days (1 month), then deleted. Export
                as PDF before they expire.
              </div>
            </div>

            {/* TREND CHART */}
            {(() => {
              const chartReports = [...savedReports]
                .filter((r) => r.overallScore !== null)
                .sort((a, b) => a.savedAt - b.savedAt);
              if (chartReports.length < 1) return null;

              const W = 600, H = 180;
              const pad = { top: 24, right: 28, bottom: 44, left: 44 };
              const cw = W - pad.left - pad.right;
              const ch = H - pad.top - pad.bottom;

              const toX = (i: number) =>
                chartReports.length === 1
                  ? pad.left + cw / 2
                  : pad.left + (i / (chartReports.length - 1)) * cw;
              const toY = (score: number) =>
                pad.top + ch - (score / 100) * ch;

              const linePoints = chartReports
                .map((r, i) => `${toX(i)},${toY(r.overallScore!)}`)
                .join(" ");
              const areaPoints = [
                `${toX(0)},${pad.top + ch}`,
                ...chartReports.map((r, i) => `${toX(i)},${toY(r.overallScore!)}`),
                `${toX(chartReports.length - 1)},${pad.top + ch}`,
              ].join(" ");

              const yTicks = [0, 60, 85, 100];

              return (
                <div
                  style={{
                    background: "#f8f9fb",
                    border: "1px solid #e8eaed",
                    borderRadius: 10,
                    padding: "14px 16px 10px",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "#1a1a2e",
                      marginBottom: 8,
                    }}
                  >
                    📈 Compliance Score Trend
                  </div>
                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    style={{ width: "100%", height: "auto", display: "block" }}
                  >
                    {/* Zone backgrounds */}
                    <rect x={pad.left} y={pad.top} width={cw} height={(ch * 15) / 100} fill="#e8f8f0" opacity="0.6" />
                    <rect x={pad.left} y={pad.top + (ch * 15) / 100} width={cw} height={(ch * 25) / 100} fill="#fef5e7" opacity="0.6" />
                    <rect x={pad.left} y={pad.top + (ch * 40) / 100} width={cw} height={(ch * 60) / 100} fill="#fdedec" opacity="0.6" />

                    {/* Zone threshold lines */}
                    {[85, 60].map((pct) => (
                      <line
                        key={pct}
                        x1={pad.left} y1={toY(pct)}
                        x2={pad.left + cw} y2={toY(pct)}
                        stroke={pct === 85 ? "#27ae60" : "#e67e22"}
                        strokeWidth="1"
                        strokeDasharray="4 3"
                        opacity="0.6"
                      />
                    ))}

                    {/* Y-axis labels */}
                    {yTicks.map((pct) => (
                      <g key={pct}>
                        <text
                          x={pad.left - 6}
                          y={toY(pct) + 4}
                          textAnchor="end"
                          fontSize="9"
                          fill="#999"
                        >
                          {pct}%
                        </text>
                        <line
                          x1={pad.left - 3} y1={toY(pct)}
                          x2={pad.left} y2={toY(pct)}
                          stroke="#ccc" strokeWidth="1"
                        />
                      </g>
                    ))}

                    {/* Area fill */}
                    {chartReports.length > 1 && (
                      <polygon points={areaPoints} fill="#3498db" opacity="0.08" />
                    )}

                    {/* Line */}
                    {chartReports.length > 1 && (
                      <polyline
                        points={linePoints}
                        fill="none"
                        stroke="#2980b9"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Data points */}
                    {chartReports.map((r, i) => {
                      const x = toX(i);
                      const y = toY(r.overallScore!);
                      const color = getRiskColor(r.overallScore!);
                      const label = r.roundDate.slice(5); // MM-DD
                      return (
                        <g key={r.id}>
                          {/* Score label above dot */}
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill={color}
                          >
                            {r.overallScore}%
                          </text>
                          {/* Dot */}
                          <circle
                            cx={x} cy={y} r="6"
                            fill={color}
                            stroke="white"
                            strokeWidth="2"
                          />
                          {/* X-axis date label */}
                          <text
                            x={x}
                            y={pad.top + ch + 16}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#777"
                          >
                            {label}
                          </text>
                          {/* Auditor sub-label */}
                          <text
                            x={x}
                            y={pad.top + ch + 28}
                            textAnchor="middle"
                            fontSize="8"
                            fill="#aaa"
                          >
                            {r.auditorName ? r.auditorName.split(" ")[0] : "—"}
                          </text>
                        </g>
                      );
                    })}

                    {/* Y axis line */}
                    <line
                      x1={pad.left} y1={pad.top}
                      x2={pad.left} y2={pad.top + ch}
                      stroke="#ddd" strokeWidth="1"
                    />
                    {/* X axis line */}
                    <line
                      x1={pad.left} y1={pad.top + ch}
                      x2={pad.left + cw} y2={pad.top + ch}
                      stroke="#ddd" strokeWidth="1"
                    />

                    {/* Legend */}
                    {[
                      { color: "#27ae60", label: "≥85% Low Risk" },
                      { color: "#e67e22", label: "60–84% Medium" },
                      { color: "#c0392b", label: "<60% High Risk" },
                    ].map((item, i) => (
                      <g key={i} transform={`translate(${pad.left + i * 140}, ${H - 8})`}>
                        <circle cx="5" cy="0" r="4" fill={item.color} />
                        <text x="12" y="4" fontSize="8" fill="#888">{item.label}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              );
            })()}

            {savedReports.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#aaa",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 14, fontWeight: "bold" }}>
                  No saved reports yet
                </div>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  Click "Generate Report" to create and save your first report.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {savedReports.map((r, rIdx) => {
                  const daysLeft = Math.ceil(
                    (r.savedAt + SEVEN_DAYS_MS - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const scoreColor =
                    r.overallScore !== null ? getRiskColor(r.overallScore) : "#aaa";
                  const savedDate = new Date(r.savedAt);
                  const savedDateStr = savedDate.toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  const savedTimeStr = savedDate.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  // Previous report is older = higher index (list is newest-first)
                  const prevReport = savedReports[rIdx + 1] ?? null;

                  return (
                    <div
                      key={r.id}
                      style={{
                        border: `2px solid ${scoreColor}30`,
                        borderLeft: `4px solid ${scoreColor}`,
                        borderRadius: 8,
                        background: "#fafafa",
                        overflow: "hidden",
                      }}
                    >
                      {/* Top row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", flexWrap: "wrap" }}>
                        {/* Score badge */}
                        <div
                          style={{
                            background: scoreColor,
                            color: "white",
                            borderRadius: 8,
                            padding: "6px 12px",
                            textAlign: "center",
                            minWidth: 64,
                            flexShrink: 0,
                          }}
                        >
                          <div style={{ fontSize: 20, fontWeight: "bold", lineHeight: 1 }}>
                            {r.overallScore !== null ? `${r.overallScore}%` : "—"}
                          </div>
                          <div style={{ fontSize: 9, opacity: 0.85 }}>
                            {r.overallScore !== null ? getRiskLabel(r.overallScore) : "NO DATA"}
                          </div>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontWeight: "bold", fontSize: 13, color: "#1a1a2e" }}>
                            Round Date: <span style={{ color: "#333" }}>{r.roundDate}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                            Auditor: <strong>{r.auditorName || "—"}</strong>
                          </div>
                          <div style={{ fontSize: 10, color: "#999", marginTop: 3 }}>
                            Saved: {savedDateStr} at {savedTimeStr}
                          </div>
                        </div>

                        {/* Expiry */}
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            color: daysLeft <= 2 ? "#c0392b" : "#888",
                            textAlign: "center",
                            minWidth: 60,
                          }}
                        >
                          <div style={{ fontSize: 18 }}>{daysLeft <= 2 ? "⚠️" : "🕐"}</div>
                          Expires in<br />
                          <span style={{ color: daysLeft <= 2 ? "#c0392b" : "#555", fontSize: 12 }}>
                            {daysLeft}d
                          </span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => exportReportPDF(r.reportHTML)}
                            style={{
                              padding: "7px 14px",
                              background: "#c0392b",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            🖨️ Export PDF
                          </button>
                          <button
                            onClick={() => deleteReport(r.id)}
                            style={{
                              padding: "5px 14px",
                              background: "white",
                              color: "#c0392b",
                              border: "1px solid #c0392b",
                              borderRadius: 6,
                              cursor: "pointer",
                              fontSize: 11,
                              whiteSpace: "nowrap",
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {/* Per-area breakdown strip */}
                      {r.areaScores && (
                        <div
                          style={{
                            borderTop: `1px solid ${scoreColor}20`,
                            background: "white",
                            padding: "10px 16px",
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ fontSize: 10, color: "#aaa", fontWeight: "bold", alignSelf: "center", marginRight: 4 }}>
                            AREAS:
                          </div>
                          {AREAS.map((a) => {
                            const score = r.areaScores?.[a] ?? null;
                            const prevScore = prevReport?.areaScores?.[a] ?? null;
                            const color = score !== null ? getRiskColor(score) : "#ccc";

                            let trendIcon = "";
                            let trendColor = "#aaa";
                            if (score !== null && prevScore !== null) {
                              const diff = score - prevScore;
                              if (diff > 0) { trendIcon = "↑"; trendColor = "#27ae60"; }
                              else if (diff < 0) { trendIcon = "↓"; trendColor = "#c0392b"; }
                              else { trendIcon = "="; trendColor = "#aaa"; }
                            }

                            return (
                              <div
                                key={a}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  background: `${color}12`,
                                  border: `1.5px solid ${color}40`,
                                  borderRadius: 6,
                                  padding: "4px 8px",
                                  minWidth: 52,
                                  position: "relative",
                                }}
                              >
                                <div style={{ fontSize: 10, color: "#555", fontWeight: "bold" }}>
                                  {CHECKLISTS[a].icon} {a}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: "bold", color, lineHeight: 1.2 }}>
                                  {score !== null ? `${score}%` : "—"}
                                </div>
                                {trendIcon && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: -7,
                                      right: -5,
                                      fontSize: 11,
                                      fontWeight: "bold",
                                      color: trendColor,
                                      background: "white",
                                      borderRadius: "50%",
                                      width: 16,
                                      height: 16,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                    }}
                                  >
                                    {trendIcon}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {prevReport && (
                            <div style={{ fontSize: 9, color: "#bbb", alignSelf: "flex-end", marginLeft: "auto" }}>
                              vs {prevReport.roundDate}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer note */}
            <div
              style={{
                marginTop: 18,
                paddingTop: 12,
                borderTop: "1px solid #eee",
                fontSize: 11,
                color: "#aaa",
                textAlign: "center",
              }}
            >
              Reports older than 30 days (1 month) are automatically deleted to save
              space. Export important reports as PDF to keep them permanently.
            </div>
          </div>
        </div>
      )}

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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
