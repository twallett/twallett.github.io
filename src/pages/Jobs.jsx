import { useEffect, useState } from "react";

const COLORS = {
  RBC: "#E2001A",
  TD: "#54B848",
  BMO: "#0075BE",
  "Canadian Tire": "#CC0000",
  MANULIFE: "#00A758",
  "Sun Life": "#F5A623",
  CIBC: "#A50034",
};

const JOBS_FILE_URL = "/jobs-data/workday-ats-jobs.csv";
const APPLIED_STORAGE_KEY = "jobs-page-applied-jobs";

const initials = (name = "") =>
  name
    .split(" ")
    .map((word) => word[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const isCanadaLocation = (location = "") => {
  const text = String(location).toLowerCase();
  if (/(^|[\s,])(on|qc|bc|ab|mb|sk|ns|nb|nl|pei|yt|nt)([\s,]|$)/i.test(text)) return true;
  return [
    "canada",
    "ontario",
    "quebec",
    "british columbia",
    "alberta",
    "manitoba",
    "saskatchewan",
    "nova scotia",
    "new brunswick",
    "newfoundland",
    "labrador",
    "prince edward island",
    "yukon",
    "nunavut",
    "northwest territories",
    "toronto",
    "montreal",
    "vancouver",
    "calgary",
    "ottawa",
    "edmonton",
    "oakville",
    "waterloo",
    "kitchener",
  ].some((hint) => text.includes(hint));
};

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  if (!rows.length) return [];

  const header = rows[0].map((value) => value.trim().toLowerCase());
  const columnIndex = (names) => header.findIndex((name) => names.includes(name));

  const companyIndex = columnIndex(["company", "company_name"]);
  const titleIndex = columnIndex(["title", "job_title"]);
  const locationIndex = columnIndex(["location", "locations"]);
  const jobIdIndex = columnIndex(["job_id", "job id", "req_id", "req id", "id"]);
  const urlIndex = columnIndex(["url", "job_url", "link"]);
  const jdIndex = columnIndex(["jd", "description", "job_description"]);

  return rows
    .slice(1)
    .filter((cols) => cols.some((value) => String(value).trim()))
    .map((cols) => {
      const companyName = cols[companyIndex] || "";
      const company = companyName.charAt(0) + companyName.slice(1).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        company,
        title: cols[titleIndex] || "",
        location: cols[locationIndex] || "",
        job_id: cols[jobIdIndex] || "",
        url: cols[urlIndex] || "",
        jd: cols[jdIndex] || "",
      };
    });
}

function cleanLocation(location = "") {
  const lines = String(location)
    .replace(/^locations?\s*:?\s*/i, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[0] || "";
}

function jobKey(job) {
  return job.job_id || job.url || `${job.company}-${job.title}-${job.location}`;
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [activeCompany, setActiveCompany] = useState("All");
  const [activeTab, setActiveTab] = useState("Jobs");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadJobs = async () => {
      try {
        const response = await fetch(JOBS_FILE_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load ${JOBS_FILE_URL}`);
        const text = await response.text();
        if (!ignore) setJobs(parseCSV(text));
      } catch (loadError) {
        if (!ignore) setError(loadError.message || "Failed to load jobs data.");
      }
    };

    loadJobs();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(APPLIED_STORAGE_KEY);
      setAppliedJobs(saved ? JSON.parse(saved) : []);
    } catch {
      setAppliedJobs([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  const appliedKeys = new Set(appliedJobs.map((job) => jobKey(job)));
  const canadaJobs = jobs.filter((job) => isCanadaLocation(job.location));
  const availableJobs = canadaJobs.filter((job) => !appliedKeys.has(jobKey(job)));
  const visibleJobs = activeTab === "Applied" ? appliedJobs : availableJobs;
  const companies = ["All", ...new Set(visibleJobs.map((job) => job.company))];
  const filtered = activeCompany === "All"
    ? visibleJobs
    : visibleJobs.filter((job) => job.company === activeCompany);

  const toggleJD = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const markApplied = (job) => {
    setAppliedJobs((prev) => {
      const key = jobKey(job);
      if (prev.some((item) => jobKey(item) === key)) return prev;
      return [job, ...prev];
    });
  };

  const putBackJob = (job) => {
    const key = jobKey(job);
    setAppliedJobs((prev) => prev.filter((item) => jobKey(item) !== key));
  };

  useEffect(() => {
    if (!companies.includes(activeCompany)) {
      setActiveCompany("All");
    }
  }, [companies, activeCompany]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: "0.5rem" }}>
        Data Science Jobs
      </h1>
      <p style={{ fontSize: 13, color: "#667085", marginBottom: "1.5rem" }}>
        Synced daily from the jobs pipeline into `/public/jobs-data`.
      </p>

      {error && (
        <p style={{ margin: "0 0 1rem", fontSize: 13, color: "#b42318" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", borderBottom: "1px solid #e5e5e3" }}>
        {["Jobs", "Applied"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 14px",
              fontSize: 14,
              cursor: "pointer",
              border: "none",
              background: "none",
              color: activeTab === tab ? "#1a1a1a" : "#888",
              borderBottom: activeTab === tab ? "2px solid #1a1a1a" : "2px solid transparent",
              marginBottom: -1,
              fontWeight: activeTab === tab ? 500 : 400,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {companies.map((company) => (
          <button
            key={company}
            type="button"
            onClick={() => setActiveCompany(company)}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              fontSize: 13,
              cursor: "pointer",
              border: "1px solid",
              borderColor: activeCompany === company ? "#1D9E75" : "#ddd",
              background: activeCompany === company ? "#1D9E75" : "#fff",
              color: activeCompany === company ? "#fff" : "#555",
            }}
          >
            {company === "All" ? "All companies" : company}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: "#888", marginBottom: "1rem" }}>
        {filtered.length} position{filtered.length !== 1 ? "s" : ""}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {filtered.map((job, index) => {
          const bg = COLORS[job.company] || "#888";
          const loc = cleanLocation(job.location);
          return (
            <div
              key={jobKey(job)}
              style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                  {initials(job.company)}
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: ".04em" }}>
                  {job.company}
                </span>
              </div>

              <p style={{ fontSize: 15, fontWeight: 500, margin: 0, lineHeight: 1.4, color: "#111" }}>
                {job.title}
              </p>
              <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                {loc ? `Location: ${loc}` : "Location unavailable"}
              </p>
              {job.job_id && (
                <p style={{ fontSize: 11, color: "#bbb", margin: 0 }}>
                  ID: {job.job_id}
                </p>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                {job.url && (
                  <button
                    type="button"
                    onClick={() => window.open(job.url, "_blank", "noopener,noreferrer")}
                    style={{ border: "1px solid #ddd", background: "#f9f9f9", color: "#444", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    View posting
                  </button>
                )}
                {job.jd && (
                  <button
                    type="button"
                    onClick={() => toggleJD(index)}
                    style={{ border: "1px solid #ddd", background: "#f9f9f9", color: "#444", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    {expanded[index] ? "Hide JD" : "Show JD"}
                  </button>
                )}
                {activeTab === "Jobs" && (
                  <button
                    type="button"
                    onClick={() => markApplied(job)}
                    style={{ border: "1px solid #b6dcff", background: "#e9f5ff", color: "#2d6ea3", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    Applied
                  </button>
                )}
                {activeTab === "Applied" && (
                  <button
                    type="button"
                    onClick={() => putBackJob(job)}
                    style={{ border: "1px solid #d8dee7", background: "#f3f6fa", color: "#526174", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    Put Back
                  </button>
                )}
              </div>

              {expanded[index] && job.jd && (
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginTop: 4, maxHeight: 220, overflowY: "auto", borderTop: "1px solid #eee", paddingTop: 8, whiteSpace: "pre-wrap" }}>
                  {job.jd}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!filtered.length && (
        <p style={{ fontSize: 13, color: "#888", marginTop: "1rem" }}>
          {activeTab === "Applied" ? "No applied jobs yet." : "No jobs match this filter."}
        </p>
      )}
    </div>
  );
}
