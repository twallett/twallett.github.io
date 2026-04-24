import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const ENV_LOCAL_PATH = path.join(ROOT, ".env.local");
const JOBS_DATA_DIR = path.join(ROOT, "public", "jobs-data");
const JOBS_PATH = path.join(JOBS_DATA_DIR, "jobs.csv");
const APPLIED_PATH = path.join(JOBS_DATA_DIR, "applied-jobs.csv");
const CURRENT_CV_PATH = path.join(JOBS_DATA_DIR, "current-cv.json");
const RATINGS_PATH = path.join(JOBS_DATA_DIR, "interview-ratings.json");
const TAILORED_CV_DIR = path.join(JOBS_DATA_DIR, "tailored-cv");
const FAILED_TEX_DIR = path.join(TAILORED_CV_DIR, "failed");
const MAX_JOBS_PER_RUN = Math.max(1, Number.parseInt(process.env.MAX_JOB_ASSETS_PER_RUN || "4", 10) || 4);

const COMPANY_NAME_MAP = {
  RBC: "RBC",
  TD: "TD",
  BMO: "BMO",
  CIBC: "CIBC",
  "CANADIAN TIRE": "Canadian Tire",
  "SUN LIFE": "Sun Life",
  MANULIFE: "Manulife",
};

function log(message) {
  console.log(`[job-assets] ${message}`);
}

function normalizeCompanyName(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const mapped = COMPANY_NAME_MAP[trimmed.toUpperCase()];
  if (mapped) return mapped;

  return trimmed.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
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

function sanitizeSlug(value = "tailored-cv") {
  return String(value || "tailored-cv")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "tailored-cv";
}

function buildTailoredBasename(job) {
  return sanitizeSlug(`${jobKey(job)}-${job.company || "job"}-${job.title || "cv"}`);
}

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

  return rows.slice(1)
    .filter((cols) => cols.some((value) => String(value).trim()))
    .map((cols) => ({
      company: normalizeCompanyName(cols[companyIndex] || ""),
      title: cols[titleIndex] || "",
      location: cols[locationIndex] || "",
      job_id: cols[jobIdIndex] || "",
      url: cols[urlIndex] || "",
      jd: cols[jdIndex] || "",
    }));
}

function dedupeJobs(jobs) {
  const seen = new Set();
  const result = [];

  for (const job of jobs) {
    const key = jobKey(job);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(job);
  }

  return result;
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function loadDotEnvLocal(filePath) {
  if (!existsSync(filePath)) return {};

  const values = {};
  for (const rawLine of readText(filePath).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    let [, key, value] = match;
    value = value.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

const localEnv = loadDotEnvLocal(ENV_LOCAL_PATH);
const ANTHROPIC_API_KEY = (process.env.ANTHROPIC_API_KEY || localEnv.ANTHROPIC_API_KEY || "").trim();
const ANTHROPIC_MODEL = (process.env.ANTHROPIC_MODEL || localEnv.ANTHROPIC_MODEL || "claude-sonnet-4-20250514").trim();

function writeJsonIfChanged(filePath, value) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const current = existsSync(filePath) ? readText(filePath) : "";
  if (current === next) return false;
  writeFileSync(filePath, next, "utf8");
  return true;
}

function extractAnthropicToolInput(payload, toolName) {
  for (const item of payload?.content || []) {
    if (item?.type === "tool_use" && item?.name === toolName && item?.input) {
      return item.input;
    }
  }

  const textPreview = (payload?.content || [])
    .filter((item) => item?.type === "text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("\n")
    .trim()
    .slice(0, 200);

  throw new Error(`Claude did not return expected tool output. Starts with: ${textPreview}`);
}

async function requestRatingAndTailoredCv(job, baseCvTex) {
  const prompt = [
    "You are tailoring a LaTeX resume for a data scientist job application.",
    "Use the provided tool exactly once.",
    "",
    "Constraints:",
    "- Keep all claims grounded in the base CV. Do not invent employers, degrees, dates, or tools not supported by the base CV or job posting.",
    "- Keep the tailored CV credible and concise.",
    "- Prefer updating PROFESSIONAL SUMMARY, selected experience bullets, DEPLOYED APPLICATIONS, and TECHNICAL SKILLS.",
    "- The decoded tailored_cv_tex_base64 content must compile as a full standalone .tex document.",
    "- Preserve escaped LaTeX characters where needed.",
    "- Because LaTeX contains many backslashes, do not return raw LaTeX directly in JSON. Put the full LaTeX document only in tailored_cv_tex_base64.",
    "",
    "Job JSON:",
    JSON.stringify({
      company: job.company,
      title: job.title,
      location: job.location,
      job_id: job.job_id,
      url: job.url,
      jd: String(job.jd || "").slice(0, 12000),
    }, null, 2),
    "",
    "Base CV TeX:",
    baseCvTex,
  ].join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4000,
      tools: [
        {
          name: "record_job_rating",
          description: "Return the interview likelihood score, mismatch reasons, key CV changes, and a base64-encoded tailored LaTeX CV.",
          input_schema: {
            type: "object",
            properties: {
              score: { type: "integer", minimum: 0, maximum: 100 },
              not_good_fit_reasons: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 5,
              },
              key_changes_from_base_cv: {
                type: "array",
                minItems: 2,
                maxItems: 5,
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    tex: { type: "string" },
                  },
                  required: ["title", "tex"],
                },
              },
              tailored_cv_tex_base64: { type: "string" },
            },
            required: [
              "score",
              "not_good_fit_reasons",
              "key_changes_from_base_cv",
              "tailored_cv_tex_base64",
            ],
          },
        },
      ],
      tool_choice: {
        type: "tool",
        name: "record_job_rating",
      },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const parsed = extractAnthropicToolInput(payload, "record_job_rating");
  const encodedTex = String(parsed.tailored_cv_tex_base64 || "").trim();
  if (!encodedTex) {
    throw new Error("Model response did not include tailored_cv_tex_base64.");
  }

  return {
    ...parsed,
    tailored_cv_tex: Buffer.from(encodedTex, "base64").toString("utf8"),
  };
}

function compileLatex(texPath, outputDir) {
  const pdflatexCheck = spawnSync("pdflatex", ["--version"], { encoding: "utf8" });
  if (pdflatexCheck.status !== 0) {
    throw new Error("pdflatex is not available on the runner.");
  }

  const tempDir = mkdtempSync(path.join(tmpdir(), "job-cv-"));
  try {
    writeFileSync(path.join(tempDir, path.basename(texPath)), readText(texPath), "utf8");

    for (let pass = 0; pass < 2; pass += 1) {
      const result = spawnSync(
        "pdflatex",
        [
          "-interaction=nonstopmode",
          "-halt-on-error",
          `-output-directory=${tempDir}`,
          path.basename(texPath),
        ],
        {
          cwd: tempDir,
          encoding: "utf8",
        }
      );

      if (result.status !== 0) {
        const failureLog = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
        throw new Error(failureLog || "pdflatex failed.");
      }
    }

    const pdfPath = path.join(tempDir, `${path.parse(texPath).name}.pdf`);
    if (!existsSync(pdfPath)) {
      throw new Error("pdflatex completed without producing a PDF.");
    }

    ensureDir(outputDir);
    writeFileSync(path.join(outputDir, path.basename(pdfPath)), readFileSync(pdfPath));
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function buildRatingsFile(cvHash, existingRatings = {}, updatedAt = new Date().toISOString()) {
  return {
    cvHash,
    updatedAt,
    ratings: existingRatings,
  };
}

async function main() {
  ensureDir(TAILORED_CV_DIR);
  ensureDir(FAILED_TEX_DIR);

  if (!existsSync(JOBS_PATH) || !existsSync(APPLIED_PATH) || !existsSync(CURRENT_CV_PATH)) {
    log("Missing jobs data, applied jobs, or current CV metadata. Skipping precompute.");
    return;
  }

  const jobs = dedupeJobs(parseCSV(readText(JOBS_PATH)));
  const appliedJobs = dedupeJobs(parseCSV(readText(APPLIED_PATH)));
  const appliedKeys = new Set(appliedJobs.map((job) => jobKey(job)));
  const currentCv = readJson(CURRENT_CV_PATH, {});
  const cvRelativePath = String(currentCv.path || "").replace(/^\/+/, "");

  if (!cvRelativePath) {
    log("current-cv.json does not point to a base CV file. Skipping precompute.");
    return;
  }

  const baseCvPath = path.join(JOBS_DATA_DIR, cvRelativePath);
  if (!existsSync(baseCvPath)) {
    log(`Base CV file not found at ${baseCvPath}. Skipping precompute.`);
    return;
  }

  const baseCvTex = readText(baseCvPath);
  const cvHash = currentCv.cvHash || sha256(baseCvTex);
  const existingRatingsFile = readJson(RATINGS_PATH, buildRatingsFile(cvHash));
  const existingRatings = existingRatingsFile.cvHash === cvHash
    ? existingRatingsFile.ratings || {}
    : {};
  const existingUpdatedAt = existingRatingsFile.cvHash === cvHash
    ? existingRatingsFile.updatedAt || new Date().toISOString()
    : new Date().toISOString();

  const jobsToProcess = jobs
    .filter((job) => !appliedKeys.has(jobKey(job)))
    .filter((job) => !existingRatings[jobKey(job)])
    .slice(0, MAX_JOBS_PER_RUN);

  if (!jobsToProcess.length) {
    const nextRatingsFile = buildRatingsFile(cvHash, existingRatings, existingUpdatedAt);
    writeJsonIfChanged(RATINGS_PATH, nextRatingsFile);
    log("No new unapplied jobs needed fresh ratings.");
    return;
  }

  if (!ANTHROPIC_API_KEY) {
    log("ANTHROPIC_API_KEY is not configured. Leaving cached ratings unchanged.");
    const nextRatingsFile = buildRatingsFile(cvHash, existingRatings, existingUpdatedAt);
    writeJsonIfChanged(RATINGS_PATH, nextRatingsFile);
    return;
  }

  log(`Generating assets for ${jobsToProcess.length} new unapplied job(s).`);
  const nextRatings = { ...existingRatings };

  for (const job of jobsToProcess) {
    const key = jobKey(job);
    const basename = buildTailoredBasename(job);
    const texPath = path.join(TAILORED_CV_DIR, `${basename}.tex`);
    const pdfPath = path.join(TAILORED_CV_DIR, `${basename}.pdf`);
    const failedTexPath = path.join(FAILED_TEX_DIR, `${basename}.tex`);

    try {
      const result = await requestRatingAndTailoredCv(job, baseCvTex);
      const tailoredCvTex = String(result.tailored_cv_tex || "").trim();
      if (!tailoredCvTex) {
        throw new Error("Model response did not include tailored_cv_tex.");
      }

      writeFileSync(texPath, `${tailoredCvTex}\n`, "utf8");
      if (existsSync(failedTexPath)) rmSync(failedTexPath, { force: true });

      try {
        compileLatex(texPath, TAILORED_CV_DIR);
      } catch (compileError) {
        writeFileSync(failedTexPath, `${tailoredCvTex}\n`, "utf8");
        throw compileError;
      }

      if (!existsSync(pdfPath)) {
        throw new Error("Expected tailored CV PDF was not created.");
      }

      nextRatings[key] = {
        score: Number.isFinite(result.score) ? Math.max(0, Math.min(100, Math.round(result.score))) : 0,
        not_good_fit_reasons: Array.isArray(result.not_good_fit_reasons) ? result.not_good_fit_reasons.slice(0, 5) : [],
        key_changes_from_base_cv: Array.isArray(result.key_changes_from_base_cv) ? result.key_changes_from_base_cv.slice(0, 5) : [],
        createdAt: new Date().toISOString(),
      };
      log(`Generated tailored assets for ${job.title} at ${job.company}.`);
    } catch (error) {
      log(`Failed to process ${job.title} at ${job.company}: ${error.message}`);
    }
  }

  const nextRatingsFile = buildRatingsFile(cvHash, nextRatings);
  writeJsonIfChanged(RATINGS_PATH, nextRatingsFile);
  log("Finished updating interview-ratings.json and tailored CV cache.");
}

main().catch((error) => {
  console.error(`[job-assets] ${error.stack || error.message}`);
  process.exitCode = 1;
});
