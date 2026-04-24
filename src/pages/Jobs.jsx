import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const COLORS = {
  RBC: "#E2001A",
  TD: "#54B848",
  BMO: "#0075BE",
  "Canadian Tire": "#CC0000",
  Manulife: "#00A758",
  "Sun Life": "#F5A623",
  CIBC: "#A50034",
};

const APPLIED_STORAGE_KEY = "applied-jobs";
const API_ROOT = String(import.meta.env?.VITE_JOBS_API_BASE || "").replace(/\/+$/, "");
const API_BASE = `${API_ROOT}/api/jobs`;
const HEALTH_ENDPOINT = `${API_ROOT}/health`;
const APPLIED_ENDPOINT = `${API_BASE}/applied-jobs`;
const CV_UPLOAD_ENDPOINT = `${API_BASE}/cv-upload`;
const INTERVIEW_RATINGS_ENDPOINT = `${API_BASE}/interview-ratings`;
const TAILORED_CV_ENDPOINT = `${API_BASE}/tailored-cv`;

const COMPANY_NAME_MAP = {
  RBC: "RBC",
  TD: "TD",
  BMO: "BMO",
  CIBC: "CIBC",
  "CANADIAN TIRE": "Canadian Tire",
  "SUN LIFE": "Sun Life",
  MANULIFE: "Manulife",
};

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function normalizeCompanyName(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const mapped = COMPANY_NAME_MAP[trimmed.toUpperCase()];
  if (mapped) return mapped;

  return trimmed
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const isCanadaLocation = (location = "") => {
  const text = String(location).toLowerCase();
  if (/(^|[\s,])(on|qc|bc|ab|mb|sk|ns|nb|nl|pei|yt|nt)([\s,]|$)/i.test(text)) return true;
  return [
    "canada", "ontario", "quebec", "british columbia", "alberta",
    "manitoba", "saskatchewan", "nova scotia", "new brunswick",
    "newfoundland", "labrador", "prince edward island", "yukon",
    "nunavut", "northwest territories", "toronto", "montreal",
    "vancouver", "calgary", "ottawa", "edmonton", "oakville",
    "waterloo", "kitchener",
  ].some((hint) => text.includes(hint));
};

function cleanLocation(location = "") {
  const lines = String(location)
    .replace(/^locations?\s*:?\s*/i, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[0] || "";
}

function normalizeKeyPart(value = "") {
  return String(value || "").trim().toLowerCase();
}

function jobKey(job) {
  const company = normalizeKeyPart(job.company);
  const jobId = normalizeKeyPart(job.job_id);
  const url = normalizeKeyPart(job.url);
  const title = normalizeKeyPart(job.title);
  const location = normalizeKeyPart(job.location);

  if (company && jobId) return `${company}::${jobId}`;
  if (url) return `url::${url}`;
  return `fallback::${company}::${title}::${location}`;
}

function normalizeRating(raw = {}) {
  return {
    score: raw.score,
    loading: false,
    error: "",
    cached: true,
    createdAt: raw.createdAt || "",
    notGoodFitReasons: Array.isArray(raw.notGoodFitReasons)
      ? raw.notGoodFitReasons
      : Array.isArray(raw.not_good_fit_reasons)
        ? raw.not_good_fit_reasons
        : [],
    keyChangesFromBaseCv: Array.isArray(raw.keyChangesFromBaseCv)
      ? raw.keyChangesFromBaseCv
      : Array.isArray(raw.key_changes_from_base_cv)
        ? raw.key_changes_from_base_cv
        : [],
  };
}

function mergeJobs(primaryJobs, secondaryJobs) {
  const seen = new Set();
  const merged = [];

  for (const job of [...primaryJobs, ...secondaryJobs]) {
    const key = jobKey(job);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(job);
  }

  return merged;
}

function resolveBackendUrl(path = "") {
  const normalized = String(path || "").trim();
  if (!normalized) return normalized;
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (!API_ROOT) return normalized;
  return `${API_ROOT}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [activeCompany, setActiveCompany] = useState("All");
  const [activeTab, setActiveTab] = useState("Jobs");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [appliedJobsLoaded, setAppliedJobsLoaded] = useState(false);
  const [savingKeys, setSavingKeys] = useState({});
  const [ratingStates, setRatingStates] = useState({});
  const [expandedRatings, setExpandedRatings] = useState({});
  const [expanded, setExpanded] = useState({});
  const [banner, setBanner] = useState(null);
  const [selectedCvFile, setSelectedCvFile] = useState(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [uploadedCvName, setUploadedCvName] = useState("");
  const [cvHash, setCvHash] = useState("");
  const [copiedTexKey, setCopiedTexKey] = useState("");
  const [downloadingCvKeys, setDownloadingCvKeys] = useState({});

  useEffect(() => {
    let ignore = false;
    let timeoutId;

    const checkApiHealth = async () => {
      try {
        const response = await fetch(HEALTH_ENDPOINT, { cache: "no-store" });
        if (!response.ok) throw new Error("Health check failed.");
        const data = await response.json();
        const nextStatus = data.status === "ok" ? "online" : "offline";

        if (!ignore) {
          setApiStatus(nextStatus);
          setInitializing(false);
        }

        if (!ignore && nextStatus !== "online") {
          timeoutId = window.setTimeout(checkApiHealth, 5000);
        }
      } catch {
        if (!ignore) {
          setApiStatus("offline");
          setInitializing(false);
          timeoutId = window.setTimeout(checkApiHealth, 5000);
        }
      }
    };

    checkApiHealth();

    return () => {
      ignore = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (apiStatus !== "online") return undefined;

    let ignore = false;

    const loadJobs = async () => {
      const response = await fetch(API_BASE, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load jobs data.");

      const data = await response.json();
      const remoteJobs = Array.isArray(data.jobs) ? data.jobs : [];
      const normalizedRatings = Object.fromEntries(
        remoteJobs
          .filter((job) => job.cached_rating)
          .map((job) => [jobKey(job), normalizeRating(job.cached_rating)])
      );

      if (!ignore) {
        setJobs(mergeJobs(remoteJobs, []));
        setRatingStates((prev) => ({ ...normalizedRatings, ...prev }));
        setJobsLoaded(true);
      }
    };

    loadJobs()
      .catch(() => {
        if (!ignore) {
          setBanner("Could not load jobs data.");
          setJobsLoaded(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [apiStatus]);

  useEffect(() => {
    if (apiStatus !== "online") return undefined;

    let ignore = false;

    const loadAppliedJobs = async () => {
      let remoteJobs = [];
      let localJobs = [];

      try {
        const response = await fetch(APPLIED_ENDPOINT, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load applied jobs.");
        const data = await response.json();
        remoteJobs = Array.isArray(data.jobs) ? data.jobs : [];
      } catch {}

      try {
        const saved = localStorage.getItem(APPLIED_STORAGE_KEY);
        localJobs = saved ? JSON.parse(saved) : [];
      } catch {}

      if (!ignore) {
        setAppliedJobs(mergeJobs(remoteJobs, localJobs));
        setAppliedJobsLoaded(true);
      }
    };

    loadAppliedJobs();
    return () => {
      ignore = true;
    };
  }, [apiStatus]);

  useEffect(() => {
    if (apiStatus !== "online") return undefined;

    let ignore = false;

    const loadCvMeta = async () => {
      try {
        const response = await fetch(`${API_BASE}/current-cv`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load current CV metadata.");
        const data = await response.json();
        if (!ignore) {
          setUploadedCvName(data.filename || "");
          setCvHash(data.cvHash || "");
        }
      } catch {
        if (!ignore) {
          setUploadedCvName("");
          setCvHash("");
        }
      }
    };

    loadCvMeta();
    return () => {
      ignore = true;
    };
  }, [apiStatus]);

  useEffect(() => {
    if (!appliedJobsLoaded) return;
    localStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(appliedJobs));
  }, [appliedJobs, appliedJobsLoaded]);

  useEffect(() => {
    if (!banner) return undefined;

    const timeoutId = window.setTimeout(() => {
      setBanner(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [banner]);

  const appliedKeys = new Set(appliedJobs.map((job) => jobKey(job)));
  const canadaJobs = jobs.filter((job) => isCanadaLocation(job.location));
  const availableJobs = canadaJobs.filter((job) => !appliedKeys.has(jobKey(job)));
  const visibleJobs = activeTab === "Applied" ? appliedJobs : availableJobs;
  const companies = ["All", ...new Set(visibleJobs.map((j) => j.company))];
  const filteredJobs = activeCompany === "All"
    ? visibleJobs
    : visibleJobs.filter((j) => j.company === activeCompany);
  const filtered = [...filteredJobs].sort((leftJob, rightJob) => {
    if (activeTab !== "Jobs") return 0;

    const leftScore = ratingStates[jobKey(leftJob)]?.score;
    const rightScore = ratingStates[jobKey(rightJob)]?.score;
    const leftHasScore = typeof leftScore === "number";
    const rightHasScore = typeof rightScore === "number";

    if (leftHasScore && rightHasScore) return rightScore - leftScore;
    if (leftHasScore) return -1;
    if (rightHasScore) return 1;
    return 0;
  });

  const toggleJD = (i) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));
  const toggleRating = (key) => setExpandedRatings((prev) => ({ ...prev, [key]: !prev[key] }));
  const updateRatingState = (key, updates) => {
    setRatingStates((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        ...updates,
      },
    }));
  };

  const setSaving = (key, isSaving) => {
    setSavingKeys((prev) => {
      if (isSaving) return { ...prev, [key]: true };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const syncAppliedJob = async (method, job, fallbackUpdater, successMessage) => {
    const key = jobKey(job);
    setSaving(key, true);

    try {
      const response = await fetch(APPLIED_ENDPOINT, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync applied jobs (${response.status})`);
      }

      const data = await response.json();
      setAppliedJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setBanner(successMessage);
    } catch {
      setAppliedJobs(fallbackUpdater);
      setBanner(successMessage);
    } finally {
      setSaving(key, false);
    }
  };

  const markApplied = (job) => {
    syncAppliedJob("POST", job, (prev) => {
      const key = jobKey(job);
      if (prev.some((item) => jobKey(item) === key)) return prev;
      return [job, ...prev];
    }, "Saved application.");
  };

  const putBackJob = (job) => {
    syncAppliedJob("DELETE", job, (prev) => {
      const key = jobKey(job);
      return prev.filter((item) => jobKey(item) !== key);
    }, "Removed application.");
  };

  const uploadCv = async () => {
    if (!selectedCvFile || !selectedCvFile.name.toLowerCase().endsWith(".tex")) {
      setBanner("Please choose a .tex CV file.");
      return;
    }

    setIsUploadingCv(true);

    try {
      const content = await selectedCvFile.text();
      const response = await fetch(CV_UPLOAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedCvFile.name,
          content,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || `Failed to upload CV (${response.status})`);
      }
      setUploadedCvName(data.filename || selectedCvFile.name);
      setCvHash(data.cvHash || "");
      setRatingStates({});
      setSelectedCvFile(null);
      setBanner("CV submitted.");
    } catch (error) {
      setBanner(error.message || "CV upload failed.");
    } finally {
      setIsUploadingCv(false);
    }
  };

  const requestInterviewRating = async (job) => {
    const key = jobKey(job);

    if (!uploadedCvName) {
      setBanner("No synced CV found yet.");
      return;
    }

    updateRatingState(key, { loading: true, error: "" });

    try {
      const response = await fetch(INTERVIEW_RATINGS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || data?.error || `Failed to generate interview rating (${response.status})`);
      }

      updateRatingState(key, {
        ...normalizeRating(data.rating || {}),
        loading: false,
        cached: Boolean(data.cached),
      });
      if (data.cvHash) setCvHash(data.cvHash);
      setBanner(data.cached ? "Loaded saved interview rating." : "Interview rating created.");
    } catch (error) {
      const cached = ratingStates[key];
      if (cached?.score != null) {
        updateRatingState(key, {
          ...cached,
          loading: false,
          error: "",
        });
        setBanner("Loaded cached interview rating.");
      } else {
        updateRatingState(key, {
          loading: false,
          error: error.message || "Interview rating failed.",
        });
        setBanner(error.message || "Interview rating failed.");
      }
    }
  };

  const copyTexBlock = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedTexKey(key);
      setBanner("Copied tex block.");
      window.setTimeout(() => {
        setCopiedTexKey((current) => (current === key ? "" : current));
      }, 1500);
    } catch {
      setBanner("Copy failed.");
    }
  };

  const setDownloadingCv = (key, isDownloading) => {
    setDownloadingCvKeys((prev) => {
      if (isDownloading) return { ...prev, [key]: true };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const downloadTailoredCv = async (job, rating) => {
    const key = jobKey(job);

    if (!Array.isArray(rating?.keyChangesFromBaseCv) || !rating.keyChangesFromBaseCv.length) {
      setBanner("Generate or sync tailoring before downloading the tailored CV.");
      return;
    }

    setDownloadingCv(key, true);

    try {
      const response = await fetch(TAILORED_CV_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_key: key,
          company: job.company,
          title: job.title,
          key_changes_from_base_cv: rating.keyChangesFromBaseCv,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || data?.error || `Failed to create tailored CV (${response.status})`);
      }

      const link = document.createElement("a");
      link.href = resolveBackendUrl(data.pdfUrl);
      link.download = data.pdfFilename || "tailored-cv.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setBanner("Tailored CV downloaded.");
    } catch (error) {
      setBanner(error.message || "Tailored CV download failed.");
    } finally {
      setDownloadingCv(key, false);
    }
  };

  useEffect(() => {
    if (!companies.includes(activeCompany)) {
      setActiveCompany("All");
    }
  }, [companies, activeCompany]);

  if (initializing || apiStatus !== "online" || !jobsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {apiStatus === "offline" ? "Waking Jobs API..." : "Loading Jobs..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "6.5rem 1rem 2rem", fontFamily: "system-ui, sans-serif", scrollMarginTop: 96 }}>
      {banner && (
        <div
          style={{
            position: "sticky",
            top: 80,
            zIndex: 20,
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#ecfdf3",
              color: "#166534",
              border: "1px solid #bbf7d0",
              borderRadius: 999,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(22, 101, 52, 0.12)",
            }}
          >
            {banner}
          </div>
        </div>
      )}

      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: "1.5rem" }}>
        Data Science Jobs
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ background: "#ecfdf3", padding: "6px 10px", borderRadius: 999, border: "1px solid #bbf7d0", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>API Live</span>
        </div>
      </div>

      {activeTab === "Jobs" && (
        <div
          style={{
            background: "#f6fbff",
            border: "1px solid #d6ebff",
            borderRadius: 14,
            padding: "1rem 1.1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#13406b" }}>Upload CV (.tex)</p>
              <p style={{ margin: "0.3rem 0 0", fontSize: 12, color: "#5d7690" }}>
                The jobs backend stores your current CV, application state, interview ratings, and tailored CV downloads.
              </p>
              {uploadedCvName && (
                <p style={{ margin: "0.45rem 0 0", fontSize: 12, color: "#1f5f96" }}>
                  Current file: {uploadedCvName}
                </p>
              )}
              {uploadedCvName && cvHash && (
                <p style={{ margin: "0.35rem 0 0", fontSize: 11, color: "#6f88a1" }}>
                  Saved interview scores for this CV load from the jobs backend when available.
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <label
                style={{
                  border: "1px solid #c8dff5",
                  background: "#fff",
                  color: "#35506b",
                  borderRadius: 10,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: isUploadingCv ? "wait" : "pointer",
                }}
              >
                Choose .tex
                <input
                  type="file"
                  accept=".tex"
                  onChange={(event) => setSelectedCvFile(event.target.files?.[0] || null)}
                  disabled={isUploadingCv}
                  style={{ display: "none" }}
                />
              </label>

              <span style={{ fontSize: 12, color: "#6c7f92", minWidth: 120 }}>
                {selectedCvFile ? selectedCvFile.name : "No file chosen"}
              </span>

              <button
                type="button"
                onClick={uploadCv}
                disabled={isUploadingCv || !selectedCvFile}
                style={{
                  border: "1px solid #8dc5ff",
                  background: "#dff0ff",
                  color: "#185a91",
                  borderRadius: 10,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isUploadingCv || !selectedCvFile ? "not-allowed" : "pointer",
                  opacity: isUploadingCv || !selectedCvFile ? 0.7 : 1,
                }}
              >
                {isUploadingCv ? "Uploading..." : "Submit CV"}
              </button>
            </div>
          </div>
        </div>
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
        {companies.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCompany(c)}
            style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
              border: "1px solid",
              borderColor: activeCompany === c ? "#1D9E75" : "#ddd",
              background: activeCompany === c ? "#1D9E75" : "#fff",
              color: activeCompany === c ? "#fff" : "#555",
            }}
          >
            {c === "All" ? "All companies" : c}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: "#888", marginBottom: "1rem" }}>
        {filtered.length} position{filtered.length !== 1 ? "s" : ""}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {filtered.map((job, i) => {
          const key = jobKey(job);
          const bg = COLORS[job.company] || "#888";
          const loc = cleanLocation(job.location);
          const isSaving = Boolean(savingKeys[key]);
          const rating = ratingStates[key];
          const ratingExpanded = Boolean(expandedRatings[key]);
          const isDownloadingCv = Boolean(downloadingCvKeys[key]);
          return (
            <div key={key} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                  {initials(job.company)}
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: ".04em" }}>
                  {job.company}
                </span>
              </div>

              <p style={{ fontSize: 15, fontWeight: 500, margin: 0, lineHeight: 1.4, color: "#111" }}>{job.title}</p>
              <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Location: {loc || "Unavailable"}</p>
              {job.job_id && (
                <p style={{ fontSize: 11, color: "#bbb", margin: 0 }}>ID: {job.job_id}</p>
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
                    onClick={() => toggleJD(i)}
                    disabled={isSaving}
                    style={{ border: "1px solid #ddd", background: "#f9f9f9", color: "#444", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    {expanded[i] ? "Hide JD" : "Show JD"}
                  </button>
                )}
                {activeTab === "Jobs" && (
                  <button
                    type="button"
                    onClick={() => markApplied(job)}
                    disabled={isSaving}
                    style={{ border: "1px solid #b6dcff", background: "#e9f5ff", color: "#2d6ea3", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: isSaving ? "wait" : "pointer", opacity: isSaving ? 0.7 : 1 }}
                  >
                    {isSaving ? "Saving..." : "Applied"}
                  </button>
                )}
                {activeTab === "Jobs" && (
                  <button
                    type="button"
                    onClick={() => requestInterviewRating(job)}
                    disabled={Boolean(rating?.loading)}
                    style={{ border: "1px solid #ead9a9", background: "#fff7df", color: "#876c17", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: rating?.loading ? "wait" : "pointer", opacity: rating?.loading ? 0.7 : 1 }}
                  >
                    {rating?.loading ? "Rating..." : rating?.score != null ? "Refresh Rating" : "Interview Rating"}
                  </button>
                )}
                {activeTab === "Applied" && (
                  <button
                    type="button"
                    onClick={() => putBackJob(job)}
                    disabled={isSaving}
                    style={{ border: "1px solid #d8dee7", background: "#f3f6fa", color: "#526174", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: isSaving ? "wait" : "pointer", opacity: isSaving ? 0.7 : 1 }}
                  >
                    {isSaving ? "Saving..." : "Put Back"}
                  </button>
                )}
              </div>

              {rating?.score != null && (
                <div style={{ marginTop: 4, borderTop: "1px solid #f1ead4", paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#755d14" }}>
                      Interview likelihood
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#755d14", background: "#fff7df", border: "1px solid #efdfb1", borderRadius: 999, padding: "3px 9px" }}>
                      {rating.score}%
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => toggleRating(key)}
                      style={{ border: "1px solid #efdfb1", background: "#fffaf0", color: "#876c17", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                    >
                      {ratingExpanded ? "Hide Tailor CV" : "Tailor CV"}
                    </button>
                    {rating.cached && (
                      <span style={{ fontSize: 11, color: "#8a7440" }}>
                        Cached on the jobs backend
                      </span>
                    )}
                  </div>
                  {ratingExpanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <button
                          type="button"
                          onClick={() => downloadTailoredCv(job, rating)}
                          disabled={isDownloadingCv}
                          style={{ border: "1px solid #cde2d0", background: "#eef8f0", color: "#245c2f", borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: isDownloadingCv ? "wait" : "pointer", opacity: isDownloadingCv ? 0.7 : 1 }}
                        >
                          {isDownloadingCv ? "Preparing CV..." : "Download Tailored CV"}
                        </button>
                      </div>

                      {Array.isArray(rating.notGoodFitReasons) && rating.notGoodFitReasons.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#7a2319" }}>
                            Why it may not be a strong fit
                          </p>
                          {rating.notGoodFitReasons.map((reason, index) => (
                            <p key={`${key}-reason-${index}`} style={{ margin: 0, fontSize: 12, color: "#7b4b44", lineHeight: 1.55 }}>
                              {reason}
                            </p>
                          ))}
                        </div>
                      )}

                      {Array.isArray(rating.keyChangesFromBaseCv) && rating.keyChangesFromBaseCv.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#755d14" }}>
                            Key Changes from Base CV
                          </p>
                          {rating.keyChangesFromBaseCv.map((item, index) => (
                            <div key={`${key}-tailor-${index}`} style={{ background: "#fffaf0", border: "1px solid #f3e3b8", borderRadius: 10, padding: "8px 10px" }}>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#6d5718" }}>
                                {index + 1}. {item.title}
                              </p>
                              <div style={{ marginTop: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                  <button
                                    type="button"
                                    onClick={() => copyTexBlock(item.tex, `${key}-tailor-${index}`)}
                                    style={{ border: "1px solid #e7d79d", background: "#fff7df", color: "#7d6518", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                                  >
                                    {copiedTexKey === `${key}-tailor-${index}` ? "Copied!" : "Copy tex"}
                                  </button>
                                </div>
                                <pre style={{ margin: "0.35rem 0 0", background: "#fffdf6", border: "1px solid #f2e6bf", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#5f543a", lineHeight: 1.6, whiteSpace: "pre-wrap", overflowX: "auto" }}>
{item.tex}
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {rating?.error && (
                <p style={{ margin: 0, fontSize: 12, color: "#b42318" }}>
                  {rating.error}
                </p>
              )}

              {expanded[i] && job.jd && (
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginTop: 4, maxHeight: 200, overflowY: "auto", borderTop: "1px solid #eee", paddingTop: 8, whiteSpace: "pre-wrap" }}>
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
