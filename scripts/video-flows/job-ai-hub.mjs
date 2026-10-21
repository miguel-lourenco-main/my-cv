// job-ai-hub: the landing (Vercel) for the marketing slides and the three widgets that
// mount the app's own components on demo records (inheritance map, résumé editor,
// rehearsal), plus the SIGNED-IN APP run locally (next dev on the flow port against the
// local Supabase stack of ../personal-job-hunt-hub) on a seeded demo account.
//
// DEMO DATA (one set, everywhere): the account is "A. Candidate" (a.candidate@demo.jobaihub.test),
// the same specimen the landing's widgets use: job profiles "Platform engineering" and
// "Founding backend"; applications Halden Systems (interviewing), Corvid Labs (applied, letter
// attached, match 84), Tenring (saved), plus Larkspur Health, Pellow Analytics, Ostrava Freight;
// agent postings Quillon (82) and Marrow & Finch (73). Attachments match the landing's inheritance
// map: Halden résumé + letter + interview set, Corvid résumé + letter, Tenring résumé + interview set
// (so base camp reads "2 of 5 open applications have nothing attached": Larkspur and Pellow).
// The assistant clip asks for a Tenring letter; /api/chat is mocked with that one reply (the
// real generate_cover_letter tool result shape), and Save goes through the app's real action.
// The Halden interview run uses the landing
// rehearsal's three questions and its rubric (Problem framing / Trade-offs / Specifics, marks
// 4/3/5 -> 80/60/100). Every company and person is fictional. seedDemo() resets the account to
// exactly this state; it runs in setup() and again before every app clip (clips mutate data).
// Nothing of the owner's real account is filmed: the old gallery stills are gone.
//
// The landing scrolls inside <main> (html/body are overflow:hidden); the app scrolls inside a
// flex-1 overflow-y-auto div (tagged #__app_sc off camera).
import { execFileSync } from "node:child_process";
import path from "node:path";

const HUB = path.resolve(new URL("../../..", import.meta.url).pathname, "personal-job-hunt-hub");
const DB_CONTAINER = "supabase_db_v0-job-hunting-platform";
const LANDING = "https://v0-job-hunting-platform-two.vercel.app/";
let APP = "http://localhost:4109";
const NAV = 56; // landing <main> runs under the fixed 56 px nav.

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO = {
  uid: "de000000-0000-4000-8000-000000000001",
  email: "a.candidate@demo.jobaihub.test",
  password: "demo-only-password-2026",
};

const U = DEMO.uid;
const q = (s) => (s === null || s === undefined ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const arr = (a) => `ARRAY[${a.map(q).join(",")}]::text[]`;

const WEIGHTS = { role_match: 0.35, seniority_fit: 0.2, location_fit: 0.2, work_mode_fit: 0.15, recency: 0.1 };
const breakdownJson = (b) =>
  b ? JSON.stringify(b.map(([id, score, evidence, rule]) => ({ id, score, weight: WEIGHTS[id], ...(id === "recency" ? {} : { evidence: evidence || "" }), ...(rule ? { rule } : {}) }))) : null;

const APPS = [
  {
    id: "demo-app-halden", role: "Senior Platform Engineer", company: "Halden Systems", location: "Remote (EU)", status: "interviewing",
    date: "2026-10-02", salary: "€85k – €100k", platform: "Greenhouse", jp: "demo-jp-platform", regime: "Remote", next: "System design · Oct 23",
    stack: ["Go", "PostgreSQL", "Kafka", "Kubernetes", "Terraform"], score: 91,
    reason: "Ingestion-heavy Postgres, remote in the EU, and it asks for the reconciliation work from your last two roles. No on-call named — your hard limit.",
  },
  {
    id: "demo-app-corvid", role: "Backend Engineer", company: "Corvid Labs", location: "Lisbon, Portugal", status: "applied",
    date: "2026-10-09", salary: "€60k – €72k", platform: "Ashby", jp: "demo-jp-platform", regime: "Hybrid", next: "Recruiter screen",
    stack: ["Rust", "PostgreSQL", "Kafka", "gRPC", "AWS"], score: 84,
    reason: "Rust and event pipelines, and it ramps people into the stack. Marked down: hybrid three days in a city you did not list.",
    soft: ["Ownership", "Written communication"],
    breakdown: [["role_match", 92, "Build and run the event pipeline that turns sensor data into billing records"], ["seniority_fit", 90, "early career welcome"],
      ["location_fit", 70, null, "Lisbon, three days a week: not a city this job profile lists"], ["work_mode_fit", 65, "Hybrid, three days a week"], ["recency", 100]],
    seniority: "Mid-level", employment: "Full-time",
    responsibilities: "- Build and run the event pipeline that turns sensor data into billing records\n- Own two Rust services end to end, from design review to on-call handover\n- Work with product on the reconciliation reports customers download every night",
    requirements: "- 3+ years writing backend services in production\n- Rust, or a strong systems language and the will to learn it\n- PostgreSQL schema design and query tuning\n- Event streaming (Kafka or similar)",
    good: "- gRPC service contracts\n- Terraform on AWS",
    benefits: "Hybrid, three days a week in the Lisbon office. Learning budget, 25 days of holiday.",
  },
  {
    id: "demo-app-tenring", role: "Staff Engineer, Infrastructure", company: "Tenring", location: "Lisbon, Portugal", status: "saved",
    date: "2026-10-14", salary: "€95k – €115k", platform: "Lever", jp: "demo-jp-founding", regime: "Hybrid",
    stack: ["Kubernetes", "Terraform", "Go", "PostgreSQL"], score: 78,
    reason: "Seniority and stack fit. Marked down: pre-Series-A, and you said no more sub-20 orgs.",
  },
  {
    id: "demo-app-larkspur", role: "Senior Backend Engineer", company: "Larkspur Health", location: "Porto, Portugal", status: "applied",
    date: "2026-10-06", salary: "€70k – €85k", platform: "Company site", jp: "demo-jp-founding", regime: "Hybrid", next: "Awaiting reply",
    stack: ["TypeScript", "Node.js", "PostgreSQL"], score: 80,
  },
  {
    id: "demo-app-pellow", role: "Platform Engineer", company: "Pellow Analytics", location: "Remote (EU)", status: "offer",
    date: "2026-09-18", salary: "€80k – €92k", platform: "Referral", jp: "demo-jp-platform", regime: "Remote", next: "Reply to offer by Oct 27",
    stack: ["Go", "PostgreSQL", "AWS"], score: 86,
  },
  {
    id: "demo-app-ostrava", role: "Data Platform Engineer", company: "Ostrava Freight", location: "Berlin, Germany", status: "rejected",
    date: "2026-09-10", platform: "LinkedIn", jp: "demo-jp-platform", regime: "On-site",
    stack: ["Python", "Airflow", "Snowflake"], score: 64,
  },
  {
    id: "demo-app-quillon", role: "Site Reliability Engineer", company: "Quillon", location: "Remote (EU)", status: "captured",
    date: "2026-10-19", platform: "Greenhouse", jp: "demo-jp-platform", regime: "Remote",
    stack: ["Go", "Prometheus", "Kubernetes"], score: 82,
    reason: "SRE work on a Postgres-heavy platform, fully remote in the EU. Marked down: a weekly on-call rotation.",
    breakdown: [["role_match", 85, "Keep a Postgres-heavy platform fast and boring"], ["seniority_fit", 80, "5+ years in production operations"],
      ["location_fit", 95, "Remote within the EU"], ["work_mode_fit", 70, null, "weekly on-call rotation, your hard limit"], ["recency", 70]],
  },
  {
    id: "demo-app-marrow", role: "Backend Engineer, Payments", company: "Marrow & Finch", location: "Lisbon, Portugal", status: "captured",
    date: "2026-10-20", platform: "Ashby", jp: "demo-jp-founding", regime: "Hybrid",
    stack: ["Kotlin", "PostgreSQL", "Kafka"], score: 73,
    reason: "Payments ledger and reconciliation, your strongest work. Marked down: Kotlin, which is not on your profile.",
    breakdown: [["role_match", 70, "Kotlin services behind our payments ledger"], ["seniority_fit", 80, "Mid to senior"],
      ["location_fit", 85, "Lisbon or Porto office"], ["work_mode_fit", 60, "Hybrid, three days a week"], ["recency", 65]],
  },
];


const RUBRIC = [
  { label: "Problem framing", description: "Names the constraint before the fix.", weight: 0.34 },
  { label: "Trade-offs", description: "Says what the choice cost.", weight: 0.33 },
  { label: "Specifics", description: "Numbers and named systems, not generalities.", weight: 0.33 },
];
const RUN = [
  { q: "demo-q-recon", marks: [4, 3, 5], t: 134,
    said: "The constraint was the lock, not the query. I moved it to a streaming diff and it went from 40 minutes to 6.",
    notes: ["Named the constraint before the fix", "Chose, but did not say what it cost", "Numbers, twice, unprompted"] },
  { q: "demo-q-migration", marks: [5, 4, 3], t: 112,
    said: "Two days in, the dual-write lag was three times what we had modelled, so I stopped it and wrote up why.",
    notes: ["Opened on what was at stake", "Said what stopping cost the quarter", "One figure, then generalities"] },
  { q: "demo-q-kafka", marks: [3, 4, 4], t: 161,
    said: "At your volume it is vacuum, not throughput. Partition by day and the bloat stops compounding.",
    notes: ["Reached the real problem late", "Weighed partitioning against a re-platform", "Specific to their stack"] },
].map((r) => ({ ...r, score: Math.round((r.marks.reduce((a, b) => a + b, 0) / 15) * 100), fb: r.notes.join(". ") + "." }));
const OVERALL = Math.round(RUN.reduce((a, r) => a + r.score, 0) / RUN.length);
const SUMMARY = "Strong on specifics and framing. Say what each choice cost before the interviewer asks.";
const FEEDBACK = {
  overallScore: OVERALL,
  summary: SUMMARY,
  strengths: ["Numbers, unprompted", "Names the constraint before the fix"],
  areasForImprovement: ["State the trade-off out loud", "Reach the real problem sooner"],
  questionFeedback: RUN.map((r) => ({
    questionId: r.q, score: r.score, feedback: r.fb, correctnessAssessment: "correct",
    parameterScores: RUBRIC.map((p, i) => ({ ...p, score: r.marks[i] * 20, maxScore: 100, feedback: r.notes[i] })),
  })),
};

const CHAT = {
  conv: "de000000-0000-4000-8000-0000000000c1",
  title: "Letter for Tenring",
  prompt: "Draft a letter for Tenring",
  reply: "Your Tenring letter is ready. Read it, then save it.",
  draft: {
    title: "Tenring · Staff Engineer, Infrastructure",
    content: "Dear Tenring team,\n\nI moved three services to Kubernetes on Terraform-managed clusters, and gave a cron nobody owned a named owner.\n\nA. Candidate",
    tone: "professional",
    keySkills: ["Kubernetes", "Terraform", "PostgreSQL"],
    softSkills: ["Ownership"],
    applicationId: "demo-app-tenring",
    company: "Tenring",
    role: "Staff Engineer, Infrastructure",
  },
};

/**
 * Off camera: answer POST /api/chat at once with a pre-written turn, in the AI SDK UI message
 * stream format the real route emits: one generate_cover_letter call whose output is the same
 * shape the real tool returns (a cover-letter draft card), then one sentence. No model is called
 * and nothing streams on camera. The title route is answered too (it would call a model).
 */
async function mockChat(page) {
  const d = CHAT.draft;
  const chunks = [
    { type: "start", messageId: "demo-msg-assistant-1", messageMetadata: { conversationId: CHAT.conv } },
    { type: "start-step" },
    { type: "tool-input-available", toolCallId: "demo-call-1", toolName: "generate_cover_letter",
      input: { title: d.title, company: d.company, jobTitle: d.role, applicationId: d.applicationId, tone: d.tone, keySkills: d.keySkills, softSkills: d.softSkills, language: "English" } },
    { type: "tool-output-available", toolCallId: "demo-call-1", output: { success: true, saved: false, data: d, artifact: { type: "cover-letter-draft", data: d } } },
    { type: "finish-step" },
    { type: "start-step" },
    { type: "text-start", id: "demo-text-1" },
    { type: "text-delta", id: "demo-text-1", delta: CHAT.reply },
    { type: "text-end", id: "demo-text-1" },
    { type: "finish-step" },
    { type: "finish" },
  ];
  const body = chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n";
  await page.route("**/api/chat", (r) =>
    r.request().method() !== "POST"
      ? r.continue()
      : r.fulfill({
          status: 200,
          headers: { "content-type": "text/event-stream", "cache-control": "no-cache", "x-vercel-ai-ui-message-stream": "v1", "X-Conversation-Id": CHAT.conv, "X-Chat-Persistence": "ok" },
          body,
        }));
  await page.route("**/api/chat/conversations/*/generate-title", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ title: CHAT.title }) }));
}

/** A tailored résumé (synthetic): contact, summary, one experience entry. Same shape the editor writes. */
function resumeBody(tag, summary, bullets) {
  let n = 0;
  const id = (k) => `${k}-demo-${tag}-${++n}`;
  const para = (lines) => ({ id: id("p"), style: {}, blocks: lines.map((t) => ({ id: id("blk"), runs: [{ text: t }], type: "p", align: "left", indent: 0 })), titleHidden: false });
  const sec = (role, title, subs) => ({ id: id("sec"), role, style: {}, title, subsections: subs, styleOverrideEnabled: false });
  const sub = (extra, lines) => ({ id: id("sub"), style: {}, title: "", ...extra, paragraphs: [para(lines)], inheritEntryStyle: true });
  return {
    sections: [
      sec("header", "Contact", [sub({ title: "A. Candidate" }, [DEMO.email, "Porto, Portugal"])]),
      sec("summary", "Summary", [sub({}, [summary])]),
      sec("experience", "Experience", [sub({ title: "Data Platform Engineer", subtitle: "Northwind Data", dateStart: "2021", dateEnd: "Present" }, bullets)]),
    ],
  };
}
const RESUMES = [
  { id: "demo-rdoc-halden", app: "demo-app-halden", jp: "demo-jp-platform", title: "Résumé · Halden Systems",
    summary: "Platform engineer, six years on ingestion-heavy Postgres. Remote in the EU.",
    bullets: ["Cut a nightly reconciliation from 40 minutes to 6 with a streaming diff", "Ran Kafka-to-Postgres ingestion at 2 TB a day"] },
  { id: "demo-rdoc-corvid", app: "demo-app-corvid", jp: "demo-jp-platform", title: "Résumé · Corvid Labs",
    summary: "Backend engineer: Rust services and event pipelines, from design review to on-call handover.",
    bullets: ["Wrote two Rust services in production", "Owned the event pipeline behind nightly billing records"] },
  { id: "demo-rdoc-tenring", app: "demo-app-tenring", jp: "demo-jp-founding", title: "Résumé · Tenring",
    summary: "Infrastructure engineer for early teams: Kubernetes, Terraform, Postgres.",
    bullets: ["Moved three services to Kubernetes with Terraform-managed clusters", "Gave a cron nobody owned a named owner and a budget"] },
];

function seedSql() {
  const appRows = APPS.map((a) =>
    `(${[q(a.id), q(U), q(a.role), q(a.company), q(a.location), `${q(a.status)}::application_status`, q(a.date), q(a.salary), q(a.platform),
      q(a.next), q(a.jp), q(a.regime), arr(a.stack), a.score ?? "NULL", q(a.reason), q(a.responsibilities), q(a.requirements), q(a.good),
      q(a.benefits), q(a.seniority), q(a.employment), q(`https://jobs.example.com/${a.id.replace("demo-app-", "")}`),
      a.breakdown ? `${q(breakdownJson(a.breakdown))}::jsonb` : "NULL", a.soft ? arr(a.soft) : "NULL"].join(",")})`
  ).join(",\n");
  return `
BEGIN;
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token)
VALUES ('00000000-0000-0000-0000-000000000000', ${q(U)}, 'authenticated', 'authenticated', ${q(DEMO.email)},
  extensions.crypt(${q(DEMO.password)}, extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"A. Candidate"}'::jsonb, now(), now(), '', '', '', '', '', '', '', '')
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), ${q(U)}, ${q(U)}, jsonb_build_object('sub', ${q(U)}::text, 'email', ${q(DEMO.email)}::text, 'email_verified', true), 'email', now(), now(), now())
ON CONFLICT (provider_id, provider) DO NOTHING;

-- Reset: every public row owned by the demo user (a few passes for FK order).
DO $$
DECLARE t record; pass int;
BEGIN
  FOR pass IN 1..4 LOOP
    FOR t IN SELECT table_name FROM information_schema.columns WHERE table_schema='public' AND column_name='user_id' AND data_type='uuid'
             AND table_name IN (SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE') LOOP
      BEGIN
        EXECUTE format('DELETE FROM public.%I WHERE user_id = %L', t.table_name, '${U}');
      EXCEPTION WHEN foreign_key_violation THEN NULL;
      END;
    END LOOP;
  END LOOP;
END $$;
DELETE FROM activity_events WHERE application_id LIKE 'demo-app-%';
DELETE FROM user_profiles WHERE id = ${q(U)};

INSERT INTO user_profiles (id, name, email, location, default_role, tech_stack, soft_skills, profile_links, experience, future_preferences, onboarding_focus)
VALUES (${q(U)}, 'A. Candidate', ${q(DEMO.email)}, 'Porto, Portugal', 'Platform engineer',
  ${arr(["Rust", "Go", "PostgreSQL", "Kafka", "Kubernetes", "Terraform", "AWS"])},
  ${arr(["Ownership", "Written communication", "Mentoring"])}, '[]'::jsonb,
  'Six years on data platforms. Took a nightly reconciliation job from a cron nobody owned to a scheduled run with a named owner and a budget.',
  'Platform roles: remote in the EU. A founding backend role: hybrid in Lisbon. No on-call rotations. No orgs under 20 people.', NULL);

INSERT INTO job_profiles (id, user_id, role_title, relevant_tech_stack, specific_requirements, description, created_from) VALUES
('demo-jp-platform', ${q(U)}, 'Platform engineering', ${arr(["Go", "Rust", "PostgreSQL", "Kafka", "Kubernetes"])},
  'Remote in the EU. Ingestion and reconciliation work.', 'The same profile, aimed at platform roles.', '2026-09-01'),
('demo-jp-founding', ${q(U)}, 'Founding backend', ${arr(["TypeScript", "Node.js", "PostgreSQL", "Terraform"])},
  'Hybrid in Lisbon. Early teams, but not under 20 people.', 'The same profile, aimed at early backend teams.', '2026-09-05');

INSERT INTO job_applications (id, user_id, role, company, location, status, date_applied, salary, platform, next_step, job_profile_id,
  work_regime, relevant_tech_stack, match_score, match_reason, responsibilities, requirements, good_to_have, benefits, seniority_level,
  employment_type, link, match_breakdown, soft_skills) VALUES
${appRows};

INSERT INTO activity_events (id, application_id, type, title, description, timestamp) VALUES
('demo-evt-1', 'demo-app-corvid', 'custom', 'Job post scraped', 'Fields read from the Ashby posting', '2026-10-08T09:12:00Z'),
('demo-evt-2', 'demo-app-corvid', 'cover_letter_created', 'Cover letter drafted', 'From the Platform engineering job profile', '2026-10-08T10:30:00Z'),
('demo-evt-3', 'demo-app-corvid', 'status_change', 'Moved to Applied', 'Sent with résumé and letter', '2026-10-09T08:45:00Z'),
('demo-evt-4', 'demo-app-halden', 'interview_scheduled', 'System design round', 'Oct 23, 45 min', '2026-10-15T14:00:00Z');

INSERT INTO questions (id, user_id, is_public, type, text, category, difficulty, tags, expected_answer_length, evaluation_parameters, answers) VALUES
('demo-q-recon', ${q(U)}, false, 'text', 'Walk me through how you would cut a 40-minute nightly reconciliation to under 10.', 'technical', 'medium', ${arr(["Systems design", "PostgreSQL"])}, 'medium', ${q(JSON.stringify(RUBRIC))}::jsonb, '[]'::jsonb),
('demo-q-migration', ${q(U)}, false, 'text', 'Tell me about a migration you called off. What did you see that the room didn''t?', 'behavioral', 'medium', ${arr(["Judgement"])}, 'medium', ${q(JSON.stringify(RUBRIC))}::jsonb, '[]'::jsonb),
('demo-q-kafka', ${q(U)}, false, 'text', 'Our ingestion is Kafka into Postgres. Where does that hurt at our volume?', 'company-specific', 'hard', ${arr(["Kafka", "PostgreSQL"])}, 'medium', ${q(JSON.stringify(RUBRIC))}::jsonb, '[]'::jsonb);

INSERT INTO interview_templates (id, user_id, is_public, title, description, category_id, application_id, target_job_profile_id, question_ids, question_count, difficulty, estimated_duration, type, sub_type) VALUES
('demo-tpl-halden', ${q(U)}, false, 'Halden Systems · platform loop', 'Written from the posting and the Platform engineering job profile.', 'technical', 'demo-app-halden', 'demo-jp-platform', ${arr(RUN.map((r) => r.q))}, 3, 'medium', 30, 'technical', 'text');

INSERT INTO interviews (id, user_id, template_id, application_id, status, current_attempt_id, run_mode) VALUES
('demo-int-halden', ${q(U)}, 'demo-tpl-halden', 'demo-app-halden', 'completed', 'demo-res-halden', NULL);

INSERT INTO interview_results (id, user_id, template_id, interview_id, job_application_id, date, question_ids, responses, overall_score, ai_summary, ai_feedback, duration, title, company, role, type, sub_type, difficulty, mode) VALUES
('demo-res-halden', ${q(U)}, 'demo-tpl-halden', 'demo-int-halden', 'demo-app-halden', '2026-10-18', ${arr(RUN.map((r) => r.q))},
 ${q(JSON.stringify(RUN.map((r) => ({ questionId: r.q, textAnswer: r.said, score: r.score, feedback: r.fb, timeSpent: r.t }))))}::jsonb,
 ${OVERALL}, ${q(SUMMARY)}, ${q(JSON.stringify(FEEDBACK))}::jsonb, 9, 'Halden Systems · platform loop', 'Halden Systems', 'Senior Platform Engineer', 'technical', 'text', 'medium', 'mock');

INSERT INTO interview_templates (id, user_id, is_public, title, description, category_id, application_id, target_job_profile_id, question_ids, question_count, difficulty, estimated_duration, type, sub_type) VALUES
('demo-tpl-tenring', ${q(U)}, false, 'Tenring · infrastructure loop', 'Written from the posting and the Founding backend job profile.', 'technical', 'demo-app-tenring', 'demo-jp-founding', ${arr(["demo-q-kafka", "demo-q-recon"])}, 2, 'medium', 20, 'technical', 'text');
INSERT INTO interviews (id, user_id, template_id, application_id, status, current_attempt_id, run_mode) VALUES
('demo-int-tenring', ${q(U)}, 'demo-tpl-tenring', 'demo-app-tenring', 'in-progress', NULL, NULL);

INSERT INTO resume_documents (id, user_id, title, template_pack_id, sections, job_application_id, job_profile_id, locale, page_size) VALUES
${RESUMES.map((r) => `(${q(r.id)}, ${q(U)}, ${q(r.title)}, 'tpl-system-single', ${q(JSON.stringify(resumeBody(r.id, r.summary, r.bullets)))}::jsonb, ${q(r.app)}, ${q(r.jp)}, 'en', 'a4')`).join(",\n")};

INSERT INTO cover_letters (id, user_id, title, application_id, company, role, tone, status, content, key_skills, current_version, version_history, generated_by, revision) VALUES
('demo-cl-halden', ${q(U)}, 'Halden Systems · Senior Platform Engineer', 'demo-app-halden', 'Halden Systems', 'Senior Platform Engineer', 'professional', 'sent',
 ${q("Dear Halden Systems team,\n\nYou are looking for someone to keep ingestion-heavy Postgres fast while the volume grows. I have spent six years on that problem, most recently cutting a nightly reconciliation from 40 minutes to 6.\n\nA. Candidate")},
 ${arr(["Go", "PostgreSQL", "Kafka"])}, 1, '[]'::jsonb, 'ai', 1),
('demo-cl-corvid', ${q(U)}, 'Corvid Labs · Backend Engineer', 'demo-app-corvid', 'Corvid Labs', 'Backend Engineer', 'professional', 'sent',
 ${q("Dear Corvid Labs team,\n\nYour posting asks for someone to run the event pipeline that turns sensor data into billing records. That is the work I know best: at Northwind Data I took a nightly reconciliation from a cron nobody owned to a scheduled run with a named owner and a budget, and cut it from 40 minutes to 6.\n\nI have written Rust in production for two years and would like to do more of it.\n\nA. Candidate")},
 ${arr(["Rust", "PostgreSQL", "Kafka"])}, 1, '[]'::jsonb, 'ai', 1);

-- The assistant clip's thread (empty; the clip fills it). Titled for what it will hold.
INSERT INTO chat_conversations (id, user_id, title) VALUES (${q(CHAT.conv)}, ${q(U)}, ${q(CHAT.title)});
COMMIT;
`;
}


function seedDemo() {
  execFileSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "-v", "ON_ERROR_STOP=1", "-q", "-U", "postgres", "-d", "postgres"],
    { input: seedSql(), stdio: ["pipe", "ignore", "inherit"] });
}

/** Local Supabase keys (dev-only demo keys of the local stack) for the app server. */
function localSupabaseEnv() {
  const out = execFileSync(path.join(HUB, "node_modules/.bin/supabase"), ["status", "-o", "env"], { cwd: HUB, stdio: ["ignore", "pipe", "ignore"] }).toString();
  const get = (k) => (out.match(new RegExp(`^${k}="?([^"\\n]*)"?$`, "m")) || [])[1];
  return { url: get("API_URL"), anon: get("ANON_KEY"), service: get("SERVICE_ROLE_KEY") };
}

// ---------------------------------------------------------------------------
// Landing helpers
// ---------------------------------------------------------------------------

/**
 * The landing snaps <main> to the nearest section when scrolling stops (its own
 * Element.scrollTo calls). Ignore the page's scrollTo on <main> (the helpers set
 * scrollTop directly) and turn off CSS smooth scrolling.
 */
const freezeSnap = (page) =>
  page.evaluate(() => {
    const m = document.querySelector("main");
    if (!m || window.__recSnapFrozen) return;
    window.__recSnapFrozen = true;
    m.style.scrollBehavior = "auto";
    for (const k of ["scrollTo", "scroll", "scrollBy"]) {
      const orig = Element.prototype[k];
      Element.prototype[k] = function (...a) {
        if (this === m) return;
        return orig.apply(this, a);
      };
    }
  });

/** The editor's "Full screen" puts a div in the top layer, above the cursor overlay: follow it. */
const cursorIntoFullscreen = (page) =>
  page.evaluate(() => {
    const host = document.fullscreenElement || document.documentElement;
    for (const id of ["__rec_caption", "__rec_cursor"]) {
      const c = document.getElementById(id);
      if (c && c.parentElement !== host) host.appendChild(c);
    }
  });

/**
 * Film a landing widget as a feature, not as a page section: after the section has
 * scrolled in (so its reveal ran), lift it into a full-frame opaque layer, hide the
 * landing nav, section numeral, headline and illustration footers, and optionally zoom
 * the widget. Runs off camera (in before()).
 */
const spotlight = async (h, { id, self = false, widget, hide = "", hideText = [], zoom = 1, fit = false, isolate = false, caption }) => {
  await h.jump(`#${id}`, { offset: NAV });
  await h.wait(1500);
  await h.page.evaluate(({ id, self, widget, hide, hideText, zoom, isolate }) => {
    const a = document.getElementById(id);
    const sec = self ? a : a.nextElementSibling;
    const bg = getComputedStyle(sec).backgroundColor;
    const st = document.createElement("style");
    st.textContent = ".ft-collar{display:none!important}";
    document.head.append(st);
    if (hide) for (const e of sec.querySelectorAll(hide)) e.style.display = "none";
    for (const re of hideText)
      for (const e of sec.querySelectorAll("p,div,span")) if (new RegExp(re, "i").test(e.textContent) && e.children.length < 3 && e.textContent.length < 160) e.style.display = "none";
    sec.style.cssText +=
      ";position:fixed;inset:0;z-index:2147483000;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0;" +
      `background:${bg === "rgba(0, 0, 0, 0)" ? "#e8e5da" : bg}`;
    const w = sec.querySelector(widget);
    w.style.margin = "0 auto";
    if (zoom !== 1) { w.style.transform = `scale(${zoom})`; w.style.transformOrigin = "center center"; }
    if (isolate) for (let n = w; n && n !== sec; n = n.parentElement) for (const sib of n.parentElement.children) if (sib !== n) sib.style.display = "none";
    window.__recWidget = w;
  }, { id, self, widget, hide, hideText, zoom, isolate });
  if (fit) await fitWidget(h.page);
  await h.wait(250);
  if (caption) await h.caption(caption);
};

/**
 * Scale the spotlighted widget so its bounding box (and every text leaf inside) sits at
 * least 32 px inside the 1280x800 frame, centred, using the band above the caption pill.
 * Throws when something still crosses the margin.
 */
const fitWidget = async (page) => {
  const res = await page.evaluate(() => {
    const w = window.__recWidget;
    const M = 32, W = 1280, H = 800, CAP = 84;
    w.style.transform = "none";
    const r = w.getBoundingClientRect();
    const cs = Math.min(1.7, (W - 2 * M) / r.width, (H - M - CAP) / r.height);
    const cy = M + (H - M - CAP) / 2;
    const dy = cy - (r.top + r.height / 2);
    w.style.transformOrigin = "center center";
    w.style.transform = `translateY(${dy}px) scale(${cs})`;
    const bad = [];
    for (const e of [w, ...w.querySelectorAll("*")]) {
      const q = e.getBoundingClientRect();
      if (!q.width || !q.height || getComputedStyle(e).visibility === "hidden") continue;
      if (e !== w && e.children.length) continue;
      if (q.left < M - 1 || q.right > W - M + 1 || q.top < M - 1 || q.bottom > H - CAP + 8)
        bad.push(`${e.tagName}:${(e.textContent || "").slice(0, 20)} ${Math.round(q.left)},${Math.round(q.top)},${Math.round(q.right)},${Math.round(q.bottom)}`);
    }
    return { cs, bad };
  });
  if (res.bad.length) throw new Error(`zoomed widget crosses the 32 px margin (scale ${res.cs.toFixed(2)}): ${res.bad.slice(0, 4).join(" | ")}`);
};


/** Cursor glide + a plain mouse click. h.click waits on Playwright actionability checks (~1 s on these pages). */
async function tap(h, locator, { pause = 120, move = 200 } = {}) {
  const el = (typeof locator === "string" ? h.page.locator(locator) : locator).first();
  await el.waitFor({ state: "visible" });
  const b = await el.boundingBox();
  await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, move);
  await h.page.mouse.down();
  await h.wait(40);
  await h.page.mouse.up();
  if (pause) await h.wait(pause);
}

const DOCS = {
  id: "documents",
  widget: ".ft-docs-plate",
  hide: ".ft-docs-side,.ft-ch-no",
  zoom: 1.6,
};

/** Open the resume editor's full screen (cursor glides onto the button first). */
async function openFullscreen(h) {
  const btn = h.page.getByRole("button", { name: /full screen/i }).first();
  const b = await btn.boundingBox();
  await h.moveTo(b.x + b.width / 2 - 30, b.y + b.height / 2 + 24, 16);
  await h.cursor(true);
  await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, 120);
  await btn.click({ delay: 40 });
  await h.wait(250);
  await cursorIntoFullscreen(h.page);
}

const visible = (page, sel) => page.locator(sel.split(",").map((x) => `${x.trim()}:visible`).join(", "));

/** Pick a resume template in the (full screen) editor. */
async function pickTemplate(h, from, to, opts = {}) {
  const { page } = h;
  await tap(h, visible(page, "button, [role=combobox]").filter({ hasText: from }), { pause: opts.pause ?? 350, move: opts.move ?? 140 });
  await tap(h, visible(page, "[role=option]").filter({ hasText: to }), { pause: opts.pickPause ?? 900, move: opts.move ?? 120 });
}


// ---------------------------------------------------------------------------
// Captions: a SOLID pill (nothing half-visible behind it), placed per clip where it
// covers the least: "bl" bottom-left, "bc" bottom-centre, "tl" top-left, "tr" top-right.
// ---------------------------------------------------------------------------

async function say(h, text, pos = "bl") {
  await h.caption(text);
  await h.page.evaluate((pos) => {
    const c = document.getElementById("__rec_caption");
    if (!c) return;
    const at = {
      bl: "left:24px;right:auto;bottom:24px;top:auto;transform:none",
      bc: "left:50%;right:auto;bottom:28px;top:auto;transform:translateX(-50%)",
      tl: "left:24px;right:auto;top:20px;bottom:auto;transform:none",
      tr: "left:auto;right:24px;top:12px;bottom:auto;transform:none",
    }[pos];
    c.style.cssText += `;${at};background:#14181f;white-space:nowrap;max-width:none;transition:none;opacity:1`;
  }, pos);
}

// ---------------------------------------------------------------------------
// Signed-in app helpers
// ---------------------------------------------------------------------------

const isApp = (seg) => typeof seg.url === "function" || String(seg.url || "").startsWith("http://localhost");

/** Off camera: tag the app's scroll container, hide the dev-mode badge and the "agent not running" note. */
async function prepApp(page) {
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.evaluate(() => {
    for (const n of document.querySelectorAll("div")) {
      const o = getComputedStyle(n).overflowY;
      if ((o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight + 40 && n.clientHeight > 400) { n.id = "__app_sc"; break; }
    }
    for (const p of document.querySelectorAll("p, div, span"))
      if (p.children.length === 0 && /agent is not running here/i.test(p.textContent)) p.style.display = "none";
  });
}

/** Scroll the app container so `locator`'s top sits at `y` px in the viewport (instant, off camera). */
async function appScrollTo(page, locator, y) {
  const el = locator.first();
  await el.waitFor({ state: "visible", timeout: 15000 });
  await el.evaluate((e, y) => {
    const s = document.getElementById("__app_sc")?.isConnected ? document.getElementById("__app_sc") : ([...document.querySelectorAll("div")].find((n) => { const o = getComputedStyle(n).overflowY; return (o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight + 40 && n.clientHeight > 400; }) || document.scrollingElement);
    s.scrollTop += e.getBoundingClientRect().top - y;
  }, y);
}

/** Fast eased scroll of the app container by `dy` (on camera). */
const appGlide = (page, dy, ms = 450) =>
  page.evaluate(({ dy, ms }) => new Promise((res) => {
    const s = document.getElementById("__app_sc")?.isConnected ? document.getElementById("__app_sc") : ([...document.querySelectorAll("div")].find((n) => { const o = getComputedStyle(n).overflowY; return (o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight + 40 && n.clientHeight > 400; }) || document.scrollingElement);
    const a = s.scrollTop, b = Math.max(0, Math.min(s.scrollHeight - s.clientHeight, a + dy)), t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      s.scrollTop = a + (b - a) * e;
      t < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  }), { dy, ms });

/** Fast eased scroll of the app container until `locator`'s top sits at `y` (re-aimed every
 *  frame, because the app's tall header collapses into a 42 px bar once the page scrolls). */
const appGlideTo = (page, locator, y, ms = 500) =>
  locator.first().evaluate((el, { y, ms }) => new Promise((res) => {
    const s = document.getElementById("__app_sc")?.isConnected ? document.getElementById("__app_sc") : ([...document.querySelectorAll("div")].find((n) => { const o = getComputedStyle(n).overflowY; return (o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight + 40 && n.clientHeight > 400; }) || document.scrollingElement);
    const a = s.scrollTop, t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const goal = s.scrollTop + el.getBoundingClientRect().top - y;
      s.scrollTop = a + (goal - a) * e;
      t < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  }), { y, ms });

/** Glide the cursor in from beside a target, show it. */
async function cursorNear(h, locator, dx = -140, dy = 40) {
  const b = await locator.first().boundingBox();
  await h.moveTo(b.x + b.width / 2 + dx, b.y + b.height / 2 + dy, 16);
  await h.cursor(true);
}

/** Park the cursor just below-right of an element, so it never sits on the words. */
async function park(h, locator, ms = 140) {
  const b = await locator.first().boundingBox();
  if (b) await h.moveTo(b.x + b.width + 18, b.y + b.height + 22, ms);
}

const app = (p) => () => APP + p;

// ---------------------------------------------------------------------------
// Flow
// ---------------------------------------------------------------------------

export default {
  url: LANDING,
  target: 30,
  pacing: { scroller: "main", heroDwell: 900, moveMs: 200, featureLead: 100 },
  // A settled frame of the live résumé editor (the hero builds in, so never poster it).
  posterFrom: { segment: "resume-editor", at: -0.3 },

  server({ port }) {
    APP = `http://localhost:${port}`;
    const sb = localSupabaseEnv();
    // JOB_AI_HUB_BUILD=<dir>: serve a production build (`next build` of a copy of the hub, made
    // with the same NEXT_PUBLIC_* values) with `next start`. No dev compile, prefetched routes:
    // the on-camera navigations then draw without their loading skeletons. Default: next dev.
    const built = process.env.JOB_AI_HUB_BUILD;
    return {
      command: path.join(HUB, "node_modules/.bin/next"),
      args: [built ? "start" : "dev", "--port", String(port)],
      cwd: built || HUB,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: sb.url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: sb.anon,
        SUPABASE_SERVICE_ROLE_KEY: sb.service,
        NEXT_PUBLIC_APP_URL: APP,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
        TURNSTILE_SECRET_KEY: "",
        SENTRY_DSN: "",
        NEXT_PUBLIC_SENTRY_DSN: "",
        UPSTASH_REDIS_REST_URL: "",
        UPSTASH_REDIS_REST_TOKEN: "",
        NEXT_TELEMETRY_DISABLED: "1",
        // A production build without DEPLOYMENT_MODE reads as hosted and fails the chat routes
        // closed (no rate limiter here). A local demo server is self-hosted.
        ...(built ? { DEPLOYMENT_MODE: "self-hosted" } : {}),
      },
      url: `${APP}/sign-in`,
      readyTimeoutMs: 180000,
    };
  },

  /** Off camera: reset the demo account, sign in, and compile every route a clip opens. */
  async setup(page, { port }) {
    APP = `http://localhost:${port}`;
    seedDemo();
    await page.goto(`${APP}/sign-in`, { waitUntil: "networkidle", timeout: 180000 });
    await page.getByLabel(/email/i).first().fill(DEMO.email);
    await page.getByLabel(/password/i).first().fill(DEMO.password);
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await page.waitForURL((u) => !u.pathname.startsWith("/sign-in"), { timeout: 90000 });
    for (const p of ["/dashboard", "/postings", "/application/demo-app-corvid", "/application/demo-app-quillon?started=1", "/interviews/runs/demo-res-halden", "/assistant"])
      await page.goto(APP + p, { waitUntil: "networkidle", timeout: 180000 }).catch(() => {});
    seedDemo();
  },

  async beforeEach(h, seg) {
    await h.cursor(false);
    if (isApp(seg)) {
      seedDemo();
      await h.page.reload({ waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
      await h.waitForStill(2500);
      await prepApp(h.page);
    } else {
      await freezeSnap(h.page);
    }
  },

  marketing: {
    title: "Landing page",
    async run(h) {
      const { page } = h;
      // Wordmark -> headline builds in (scroll-driven) -> the complete hero.
      await h.glide(1000, { ms: 600 });
      await page.getByRole("link", { name: /create an account/i }).first().waitFor({ state: "visible" });
      await h.waitForStill(300);
      await h.dwell(800);
      // Make the sections' scroll reveals instant so a cut never lands on a half-drawn frame.
      await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent =
          "[data-ft-part],.ft-line,[data-ft-room],[data-ft-group]{opacity:1!important;transform:none!important;transition:none!important;animation:none!important;clip-path:none!important;filter:none!important}" +
          ".ft-collar,.ft-collar *{opacity:1!important;transition:none!important}";
        document.head.append(st);
      });
      await h.slides([
        { at: page.getByText(/is what\s*every product says/i).first(), offset: NAV + 90, cut: true, settle: 150, hold: 700 },
        {
          at: "#request",
          offset: NAV,
          cut: true,
          settle: 150,
          hold: 100,
          async interact(h) {
            const cta = page.locator("#request").getByRole("link").first();
            if (await cta.count()) {
              const b = await cta.boundingBox();
              if (b) await h.moveTo(b.x + b.width / 2, b.y + b.height + 70, 16);
              await h.cursor(true);
              await h.hover(cta, 260);
              await h.beat(300);
            }
          },
        },
      ], { hold: 900, settle: 150 });
    },
  },

  get features() {
    return FEATURES;
  },
};

const FEATURES = [
  {
    key: "inheritance",
    title: "Inheritance map: one profile, many job profiles/applications",
    priority: 1,
    before: async (h) => {
      await spotlight(h, {
        id: "inheritance",
        widget: ".ft-flow-wrap",
        hide: ".ft-ch-no,.ft-ch-head,.ft-lede,.ft-synthetic,.ft-reh-note",
        fit: true,
      });
      // Start from the Halden branch (off camera) so the first click visibly redraws the map.
      const halden = h.page.locator("main").getByRole("button", { name: /^Halden Systems/ }).first();
      const hb = await halden.boundingBox();
      await h.page.mouse.click(hb.x + hb.width / 2, hb.y + hb.height / 2);
      await h.page.mouse.move(640, 790);
      await h.wait(500);
      await say(h, "The model: profile → job profile → application → its documents", "bc");
    },
    async run(h) {
      const main = h.page.locator("main");
      const corvid = main.getByRole("button", { name: /^Corvid Labs/ }).first();
      // Hold the Halden branch (the before-state) ~0.65 s before the first redraw.
      await h.dwell(380);
      await cursorNear(h, corvid, -150, 0);
      await tap(h, corvid, { pause: 100, move: 180 });
      await park(h, corvid, 120);
      await h.dwell(450);
      const tenring = main.getByRole("button", { name: /^Tenring/ }).first();
      await tap(h, tenring, { pause: 100, move: 200 });
      await park(h, tenring, 120);
      await h.dwell(600);
    },
  },
  {
    key: "base-camp",
    title: "Base camp: every application by stage, moved in one click",
    priority: 1,
    url: app("/dashboard"),
    async before(h) {
      const { page } = h;
      await appScrollTo(page, page.getByText(/open applications have nothing attached/i).first(), 100);
      await h.wait(300); // the header collapses once scrolled: aim again
      await appScrollTo(page, page.getByText(/open applications have nothing attached/i).first(), 100);
      await say(h, "Base camp: every application, by stage, with what it has attached");
    },
    async run(h) {
      const { page } = h;
      const move = page.getByRole("button", { name: /move to/i }).nth(1); // Larkspur Health (Applied)
      await cursorNear(h, move, -180, 60);
      await h.dwell(600);
      await tap(h, move, { pause: 220, move: 200 });
      const opt = page.getByText("Interviewing", { exact: true }).last();
      await tap(h, opt, { pause: 120, move: 160 });
      await h.page.mouse.move(1000, 640);
      await h.moveTo(1010, 650, 60);
      await say(h, "Larkspur Health → Interviewing");
      await h.dwell(650);
    },
  },
  {
    key: "resume-editor",
    title: "Real resume editor: full screen + template switch",
    priority: 1,
    async before(h) {
      await spotlight(h, DOCS);
      await openFullscreen(h);
      await h.cursor(false);
      // Wait until the live preview's box has held still for 300 ms (fit/zoom settled).
      await h.page.waitForFunction(() => {
        const p = [...document.querySelectorAll("*")].find((e) => /live preview/i.test(e.textContent) && e.children.length === 0);
        const host = document.fullscreenElement || document.body;
        const pg = host.querySelector("[data-page], .resume-page, [class*=page]") || p;
        const r = pg.getBoundingClientRect();
        const sig = `${Math.round(r.left)},${Math.round(r.width)}`;
        const now = performance.now();
        if (window.__pvSig !== sig) { window.__pvSig = sig; window.__pvAt = now; return false; }
        return now - window.__pvAt > 300;
      }, null, { polling: 50, timeout: 8000 }).catch(() => {});
      await h.wait(400);
      await cursorIntoFullscreen(h.page);
      await say(h, "The app's résumé editor: one click restyles the page", "bl");
      await cursorIntoFullscreen(h.page);
    },
    async run(h) {
      const { page } = h;
      const pick = visible(page, "button, [role=combobox]").filter({ hasText: "Classic serif" });
      await cursorNear(h, pick, 60, 70);
      await tap(h, pick, { pause: 300, move: 140 });
      const opt = visible(page, "[role=option]").filter({ hasText: "Teal sidebar" });
      await tap(h, opt, { pause: 150, move: 120 });
      await h.moveTo(395, 330, 120); // park beside the template field, off the preview text
      await h.dwell(800);
    },
  },
  {
    key: "postings",
    title: "Postings: the agent's matches, each score explained from the posting",
    priority: 2,
    url: app("/postings"),
    async before(h) {
      await say(h, "Postings: the agent's matches, each score backed by the posting's words", "tr");
    },
    async run(h) {
      const { page } = h;
      // Read the two matches (score + the posting's own words per dimension), then narrow by typing.
      const chip = page.getByTestId("match-chip").first();
      await cursorNear(h, chip, -60, 50);
      await park(h, chip, 160);
      await h.dwell(1100);
      const search = page.getByPlaceholder(/search by role or company/i);
      await tap(h, search, { pause: 60, move: 200 });
      await page.keyboard.type("payments", { delay: 35 });
      await park(h, search, 100);
      await h.dwell(750);
    },
  },
  {
    key: "application-detail",
    title: "Application detail: attachments, match reason, the posting read into fields",
    priority: 2,
    url: app("/application/demo-app-corvid"),
    async before(h) {
      await say(h, "Corvid Labs: résumé + letter attached, the match explained, the posting as fields");
    },
    async run(h) {
      const { page } = h;
      await h.dwell(900);
      await appGlide(page, 470, 420);
      const full = page.getByText(/^the full posting$/i).first();
      await cursorNear(h, full, 160, 50);
      await tap(h, full, { pause: 150, move: 180 });
      await park(h, full, 100);
      await appGlide(page, 260, 380);
      await h.dwell(950);
    },
  },
  {
    key: "interview-run",
    title: "Interview run: scored per answer against a fixed rubric",
    priority: 3,
    url: app("/interviews/runs/demo-res-halden"),
    async before(h) {
      await say(h, "A practice run for Halden Systems, scored against a rubric");
    },
    async run(h) {
      const { page } = h;
      await h.dwell(900);
      await appGlideTo(page, page.getByText(/per-answer feedback/i), 58, 520);
      await h.dwell(1050);
    },
  },
  {
    // Replaces the landing's rehearsal widget (v3 review): the live interview-run clip already
    // shows the same rubric and marks, and without this clip the video never showed the AI act.
    key: "assistant",
    title: "Assistant: asked for a letter, drafts it with a tool, saved to the application",
    priority: 3,
    url: app("/assistant"),
    async before(h) {
      const { page } = h;
      await mockChat(page);
      // The chat-turn disclosure is acknowledged per session (the demo account already said yes).
      await page.evaluate(() => {
        for (const p of ["openai", "anthropic", "google", "local", "openrouter", "ollama"]) sessionStorage.setItem(`ai-disclosure.ack.${p}.chat`, "1");
      });
      // Open the seeded thread, so the turn lands in it (no conversation switch mid-stream).
      await page.getByText(CHAT.title, { exact: true }).first().click();
      await h.wait(900);
      // Give the thread the page-title band's height: the whole turn then fits on screen.
      await page.evaluate(() => {
        const t = [...document.querySelectorAll("h1,h2")].find((e) => e.textContent.trim() === "Assistant");
        const list = document.querySelector("[data-testid=chat-message-list]");
        let n = t;
        while (n && n.parentElement && !n.parentElement.contains(list)) n = n.parentElement;
        if (n) n.style.display = "none";
      });
      await h.wait(300);
      await say(h, "The assistant acts on your records: a letter for Tenring, saved to it");
    },
    async run(h) {
      const { page } = h;
      const box = page.getByPlaceholder(/ask the assistant/i);
      await cursorNear(h, box, -120, 40);
      await tap(h, box, { pause: 60, move: 160 });
      await page.keyboard.type(CHAT.prompt, { delay: 22 });
      await page.keyboard.press("Enter");
      await page.getByTestId("chat-letter-draft-save").waitFor({ state: "visible" });
      await h.dwell(1000);
      const save = page.getByTestId("chat-letter-draft-save");
      await tap(h, save, { pause: 80, move: 200 });
      await page.getByTestId("chat-letter-draft-saved").waitFor({ state: "visible" });
      await park(h, page.getByTestId("chat-letter-draft-saved"), 120);
      await h.dwell(950);
    },
  },
];

// ---------------------------------------------------------------------------
// Continuous take (v4): ONE shot, no cuts. The local server renders the same Field Table
// landing at "/" and, for a signed-in visitor, its nav ends in "Open the app →". So the take
// starts on the landing (hero, the claim), uses the landing's own nav to reach the inheritance
// map and the résumé editor widget (filmed in place, no spotlight), then "Open the app" walks
// into base camp and the signed-in app is driven through its own links and tabs:
//   landing hero -> claim --nav "How it works"--> inheritance map --nav "Documents"--> editor
//   (Full screen, template switch, exit) --"Open the app"--> base camp (move Larkspur)
//   --"Corvid Labs"--> application detail --tab "Postings"--> postings (search)
//   --tab "Interviews" + the Halden run--> interview run --tab "Assistant" + thread--> assistant.
// Order vs v3: base camp moves after the editor (both landing widgets come first), and the
// application detail before postings (it is reached from base camp's Corvid row).
// ---------------------------------------------------------------------------

/** The landing nav's anchors: an eased scroll of <main> to the section (the page's own
 *  scrollTo is frozen by freezeSnap). `extra` px past the section top, per anchor. */
const ANCHOR_EXTRA = { "#inheritance": 300, "#documents": 0 };

async function prepLanding(page) {
  await page.evaluate((extra) => {
    // Freeze the landing's snap-to-section (its own scrollTo calls on <main>); looked up per
    // call, so a re-rendered <main> stays frozen too.
    for (const k of ["scrollTo", "scroll", "scrollBy"]) {
      const orig = Element.prototype[k];
      Element.prototype[k] = function (...a) {
        if (this.tagName === "MAIN") return;
        return orig.apply(this, a);
      };
    }
    const st = document.createElement("style");
    st.textContent =
      "nextjs-portal{display:none!important}" +
      "[data-ft-part],.ft-line,[data-ft-room],[data-ft-group]{opacity:1!important;transform:none!important;transition:none!important;animation:none!important;clip-path:none!important;filter:none!important}";
    document.head.append(st);
    window.__smoothTo = (sel, add = 0, ms = 650) => new Promise((res) => {
      window.__navAt = performance.now();
      const m = document.querySelector("main");
      m.style.scrollBehavior = "auto";
      const el = document.querySelector(sel);
      const a = m.scrollTop, b = a + el.getBoundingClientRect().top - 56 + add, t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        m.scrollTop = a + (b - a) * e;
        t < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
    document.addEventListener("click", (ev) => {
      const a = ev.target.closest?.("header a[href^='#'], nav a[href^='#']");
      if (!a || !(a.getAttribute("href") in extra)) return;
      ev.preventDefault();
      ev.stopPropagation();
      window.__smoothTo(a.getAttribute("href"), extra[a.getAttribute("href")]);
    }, true);
  }, ANCHOR_EXTRA);
}

/** Every document of the take: hide the dev badge and the "agent is not running here" note. */
const APP_INIT = () => {
  // No "Restore unsaved changes?" dialog: the landing's editor widget keeps a local draft
  // backup once touched, and a reload would offer it back (a modal over the whole page).
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("pjhh:draft-backup:")) localStorage.removeItem(k);
  } catch {}
  const hide = () => {
    if (!document.getElementById("__jah_st") && document.head) {
      const st = document.createElement("style");
      st.id = "__jah_st";
      st.textContent = "nextjs-portal{display:none!important}";
      document.head.append(st);
    }
    for (const p of document.querySelectorAll("p, div, span"))
      if (p.children.length === 0 && /agent is not running here/i.test(p.textContent)) p.style.display = "none";
  };
  new MutationObserver(hide).observe(document, { childList: true, subtree: true });
};

/** Put the cursor + caption back on <html> (after the editor leaves full screen). */
const cursorOutOfFullscreen = (page) =>
  page.evaluate(() => {
    for (const id of ["__rec_caption", "__rec_cursor"]) {
      const c = document.getElementById(id);
      if (c && c.parentElement !== document.documentElement) document.documentElement.appendChild(c);
    }
  });

/** Click the landing nav's anchor on camera. The pinned sections sometimes swallow the
 *  click; then the same eased scroll is started directly (identical on screen). */
async function landingNav(h, href) {
  const { page } = h;
  const link = page.locator(`header nav.ft-contents a[href='${href}']`).first();
  await tap(h, link, { pause: 0, move: 220 });
  await page.evaluate(({ href, add }) => {
    if (!(window.__navAt && performance.now() - window.__navAt < 300)) return window.__smoothTo(href, add);
  }, { href, add: ANCHOR_EXTRA[href] });
  await page.waitForTimeout(700); // the eased scroll
}

/**
 * The app reads its records client-side from Supabase on every mount (no client cache), so each
 * page drew a ~0.5 s skeleton on camera. Off camera, the warm-up visits record each Supabase GET
 * (REST rows + the auth user); on camera the FIRST request for the same URL is answered from that
 * recording at once (the same seeded rows), later ones go to the database (so a refetch after the
 * Larkspur move reads the real, moved row). Writes always go through.
 */
async function supabaseReplay(page) {
  const base = localSupabaseEnv().url.replace(/\/$/, "");
  const cache = new Map();
  const state = { recording: true };
  await page.route((u) => u.href.startsWith(base + "/rest/v1/") || u.href.startsWith(base + "/auth/v1/user"), async (route) => {
    const req = route.request();
    if (req.method() !== "GET") return route.fallback();
    const key = req.url();
    const auth = key.startsWith(base + "/auth/v1/user");
    const hit = cache.get(key);
    if (!state.recording && hit && (auth || !hit.used)) {
      hit.used = true;
      return route.fulfill({ status: hit.status, headers: hit.headers, body: hit.body });
    }
    const res = await route.fetch();
    const body = await res.body();
    if (state.recording && res.ok()) cache.set(key, { status: res.status(), headers: res.headers(), body, used: false });
    return route.fulfill({ response: res, body });
  });
  return state;
}

const tab = (h, rx, arrive) => h.navLink(rx, { within: "header, nav", arrive, hold: 150, move: 220, settleMax: 300 });

export const take = {
  target: 30,
  pacing: { heroDwell: 900 }, // the wordmark frame; the headline then builds in on the glide
  url: ({ port }) => `http://localhost:${port}/`,
  waitUntil: "networkidle",
  posterFrom: { feature: "resume-editor", at: -0.3 },
  async setup(page, ctx) {
    APP = `http://localhost:${ctx.port}`;
    seedDemo();
    await page.goto(`${APP}/sign-in`, { waitUntil: "networkidle", timeout: 180000 });
    await page.getByLabel(/email/i).first().fill(DEMO.email);
    await page.getByLabel(/password/i).first().fill(DEMO.password);
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await page.waitForURL((u) => !u.pathname.startsWith("/sign-in"), { timeout: 90000 });
    // Compile every route the take opens (dev server), then reset the data.
    for (const p of ["/", "/dashboard", "/application/demo-app-corvid", "/postings", "/interviews", "/interviews/runs/demo-res-halden", "/assistant"])
      await page.goto(APP + p, { waitUntil: "networkidle", timeout: 180000 }).catch(() => {});
    seedDemo();
  },
  async before(h) {
    const { page } = h;
    await page.context().addInitScript(APP_INIT);
    await mockChat(page);
    const replay = await supabaseReplay(page);
    // Warm this browser's cache for every page the take opens (route chunks, fonts, data),
    // so the on-camera navigations draw at once instead of through their loading skeletons.
    for (const p of ["/dashboard", "/application/demo-app-corvid", "/postings", "/interviews", "/interviews/runs/demo-res-halden", "/assistant"])
      await page.goto(APP + p, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    replay.recording = false;
    await page.goto(APP + "/", { waitUntil: "networkidle", timeout: 60000 });
    await page.evaluate(() => {
      for (const p of ["openai", "anthropic", "google", "local", "openrouter", "ollama"]) sessionStorage.setItem(`ai-disclosure.ack.${p}.chat`, "1");
    });
    await page.reload({ waitUntil: "networkidle" });
    await h.waitForStill(1500);
    await h.wait(800); // hydration done before the landing is prepped
    await prepLanding(page);
    await h.cursor(false);
    await h.moveTo(900, 560, 16);
    await h.waitForStill(1500);
  },
  route: [
    {
      key: "marketing",
      kind: "marketing",
      title: "Landing page",
      priority: 0,
      async run(h) {
        const { page } = h;
        // Wordmark -> the headline builds in (scroll-driven) -> the complete hero.
        await h.glide(1000, { ms: 600 });
        await page.locator("a[href='/sign-up']:visible").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
        await h.dwell(800);
        await h.glide(page.getByText(/is what\s*every product says/i).first(), { offset: NAV + 90, ms: 500 });
        await h.dwell(800);
      },
    },
    {
      key: "inheritance",
      title: "Inheritance map: one profile, many job profiles/applications",
      priority: 1,
      async transitionIn(h) {
        const { page } = h;
        await h.cursor(true);
        await landingNav(h, "#inheritance");
        await say(h, "The model: profile → job profile → application → its documents", "bc");
      },
      async run(h) {
        const main = h.page.locator("main");
        const corvid = main.getByRole("button", { name: /^Corvid Labs/ }).first();
        await tap(h, corvid, { pause: 100, move: 220 });
        await park(h, corvid, 120);
        await h.dwell(700);
      },
    },
    {
      key: "resume-editor",
      title: "Real resume editor: full screen + template switch",
      priority: 1,
      async transitionIn(h) {
        const { page } = h;
        await h.caption("");
        await landingNav(h, "#documents");
        const btn = page.getByRole("button", { name: /full screen/i }).first();
        const b = await btn.boundingBox();
        await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, 200);
        await btn.click({ delay: 40 });
        await cursorIntoFullscreen(page);
        await page.waitForFunction(() => !!document.fullscreenElement, null, { timeout: 5000 });
        await cursorIntoFullscreen(page);
        await h.wait(200);
        await say(h, "The app's résumé editor: one click restyles the page", "bl");
        await cursorIntoFullscreen(page);
      },
      async run(h) {
        const { page } = h;
        const pick = visible(page, "button, [role=combobox]").filter({ hasText: "Classic serif" });
        await tap(h, pick, { pause: 250, move: 180 });
        const opt = visible(page, "[role=option]").filter({ hasText: "Teal sidebar" });
        await tap(h, opt, { pause: 100, move: 120 });
        await h.moveTo(395, 330, 100);
        await h.dwell(750);
      },
    },
    {
      key: "base-camp",
      title: "Base camp: every application by stage, moved in one click",
      priority: 1,
      async transitionIn(h) {
        const { page } = h;
        await h.caption("");
        // Leave full screen (the editor's own toggle when it has one), then into the app.
        const exit = page.getByRole("button", { name: /exit full ?screen/i }).first();
        if (await exit.isVisible().catch(() => false)) await tap(h, exit, { pause: 0, move: 160 });
        else await page.evaluate(() => document.fullscreenElement && document.exitFullscreen());
        await page.waitForFunction(() => !document.fullscreenElement, null, { timeout: 5000 });
        await cursorOutOfFullscreen(page);
        // Straight on to "Open the app" (no landing re-read); the hover lets Link prefetch.
        const open = page.getByRole("link", { name: /open the app/i }).first();
        await tap(h, open, { pause: 0, move: 240 });
        await page.getByText(/open applications have nothing attached/i).first().waitFor({ state: "visible", timeout: 15000 });
        await page.getByRole("button", { name: /move to another stage: Larkspur/i }).waitFor({ state: "visible", timeout: 15000 });
        await h.waitForStill(250);
        await say(h, "Base camp: every application, by stage, with what it has attached");
      },
      async run(h) {
        const { page } = h;
        const move = page.getByRole("button", { name: /move to another stage: Larkspur/i });
        await h.dwell(250);
        await tap(h, move, { pause: 220, move: 240 });
        const opt = page.getByText("Interviewing", { exact: true }).last();
        await tap(h, opt, { pause: 120, move: 160 });
        await h.moveTo(1010, 650, 120);
        await say(h, "Larkspur Health → Interviewing");
        await h.dwell(650);
      },
    },
    {
      key: "application-detail",
      title: "Application detail: attachments, match reason, the posting read into fields",
      priority: 2,
      async transitionIn(h) {
        const { page } = h;
        await h.caption("");
        // The "Moved to Interviewing" toast has done its job: fade it out as the cursor leaves.
        await page.evaluate(() => {
          for (const t of document.querySelectorAll("[data-sonner-toast]")) {
            t.style.transition = "opacity 180ms"; t.style.opacity = "0";
            setTimeout(() => t.remove(), 200);
          }
        });
        await tap(h, page.getByRole("link", { name: /^Corvid Labs/ }).first(), { pause: 0, move: 240 });
        await page.getByRole("link", { name: /open the resume/i }).first().waitFor({ state: "visible", timeout: 15000 });
        await h.waitForStill(250);
        await say(h, "Corvid Labs: résumé + letter attached, the match explained, the posting as fields");
      },
      async run(h) {
        const { page } = h;
        await h.dwell(700);
        await appGlide(page, 470, 420);
        await h.dwell(900);
      },
    },
    {
      key: "postings",
      title: "Postings: the agent's matches, each score explained from the posting",
      priority: 2,
      async transitionIn(h) {
        const { page } = h;
        await h.caption("");
        await tab(h, /^Postings(\s*Saved.*)?$/i, page.getByTestId("match-chip").first());
        await say(h, "Postings: the agent's matches, each score backed by the posting's words", "tr");
      },
      async run(h) {
        const { page } = h;
        const chip = page.getByTestId("match-chip").first();
        await park(h, chip, 200);
        await h.dwell(750);
        const search = page.getByPlaceholder(/search by role or company/i);
        await tap(h, search, { pause: 60, move: 200 });
        await page.keyboard.type("payments", { delay: 30 });
        await park(h, search, 100);
        await h.dwell(650);
      },
    },
    {
      key: "interview-run",
      title: "Interview run: scored per answer against a fixed rubric",
      priority: 3,
      async transitionIn(h) {
        const { page } = h;
        await h.caption("");
        await tab(h, /^Interviews(\s*Practice.*)?$/i, page.getByText("Halden Systems · platform loop").first());
        // The run link sits under the card's Start button: click its visible top edge.
        const run = page.getByRole("link", { name: /Halden Systems · platform loop · 78/ }).first();
        const b = await run.boundingBox();
        await h.moveTo(b.x + 60, b.y + 4, 220);
        await page.mouse.down(); await h.wait(40); await page.mouse.up();
        await page.getByText(/per-answer feedback/i).first().waitFor({ state: "visible", timeout: 15000 });
        await h.waitForStill(250);
        await say(h, "A practice run for Halden Systems, scored against a rubric");
      },
      async run(h) {
        const { page } = h;
        await h.dwell(550);
        await appGlideTo(page, page.getByText(/per-answer feedback/i), 58, 480);
        await h.dwell(700);
      },
    },
    {
      key: "assistant",
      title: "Assistant: asked for a letter, drafts it with a tool, saved to the application",
      priority: 3,
      async transitionIn(h) {
        const { page } = h;
        await h.caption("");
        await tab(h, /^Assistant(\s*Ask.*)?$/i, page.getByPlaceholder(/ask the assistant/i));
        // One click: the app's chat provider opens the latest thread (the seeded "Letter for
        // Tenring") by itself, so the turn lands in it without a second click on the thread.
        await page.getByText(CHAT.title, { exact: true }).first().waitFor({ state: "visible", timeout: 10000 });
        await say(h, "The assistant acts on your records: a letter for Tenring, saved to it");
      },
      async run(h) {
        const { page } = h;
        const box = page.getByPlaceholder(/ask the assistant/i);
        await tap(h, box, { pause: 60, move: 200 });
        await page.keyboard.type(CHAT.prompt, { delay: 16 });
        await page.keyboard.press("Enter");
        await page.getByTestId("chat-letter-draft-save").waitFor({ state: "visible" });
        await h.dwell(700);
        const save = page.getByTestId("chat-letter-draft-save");
        await tap(h, save, { pause: 80, move: 180 });
        await page.getByTestId("chat-letter-draft-saved").waitFor({ state: "visible" });
        await park(h, page.getByTestId("chat-letter-draft-saved"), 120);
        await h.dwell(650);
      },
    },
  ],
};
