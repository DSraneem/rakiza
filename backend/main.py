import os, re, math, time, threading, uuid as _uuid
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import PyPDF2, docx, io

app = FastAPI(title="Rakiza API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

client = OpenAI(
    api_key=os.getenv("ELM_API_KEY", "sk-XLi9nHXWEnpSo4ZVU388tw"),
    base_url=os.getenv("ELM_BASE_URL", "https://elmodels.ngrok.app/v1"),
)

# ── Doc sessions ──────────────────────────────────────────────
SESSION_TTL = 1800
class DocSession:
    def __init__(self):
        self.chunks: list[str] = []
        self.filename: str = ""
        self.uploaded_at: float = time.time()
        self.expires_at: float = time.time() + SESSION_TTL

doc_sessions: dict[str, DocSession] = {}

def _cleanup():
    while True:
        time.sleep(60)
        now = time.time()
        for sid in [s for s, v in doc_sessions.items() if v.expires_at < now]:
            del doc_sessions[sid]
threading.Thread(target=_cleanup, daemon=True).start()

stored_chunks: list[str] = []

ROLE_LABELS = {"HR": "موارد بشرية", "Sales": "مبيعات", "Finance": "مالية", "Operations": "عمليات"}

# ══════════════════════════════════════════════════════════════
# TWO-PHASE SYSTEM PROMPTS
# ══════════════════════════════════════════════════════════════

TEACH_PROMPT = """أنت ركيزة — مدرب ذكاء اصطناعي مهني مدعوم بنموذج نهى من شركة علم.
مرحلتك الآن: التعليم فقط.

مهمتك تعلّم الموظف كيف يستخدم الذكاء الاصطناعي في هذه المهمة — بشكل بسيط وعملي.
لا تنجز المهمة بعد، فقط علّم.

الرد لازم يكون بهذا التنسيق EXACTLY:

[ليش AI يساعدك هنا؟]
جملتان واضحتان عن قيمة AI في هذه المهمة تحديداً

[كيف تستخدمه خطوة بخطوة]
1. الخطوة الأولى
2. الخطوة الثانية
3. الخطوة الثالثة

[مثال من واقع وظيفتك]
مثال محدد مبني على دور الموظف

[سر البرومبت الناجح]
اشرح بجملتين ما الذي يجعل البرومبت فعّالاً في هذه المهمة
وأعطِ مثال برومبت قصير

[أنا جاهز أنجزها معك ✨]
اطرح سؤالاً واحداً تحتاجه لتنجز المهمة (مثل: اسم الموظف، تاريخ الاجتماع، اسم العميل...)"""


EXECUTE_PROMPT = """أنت ركيزة — مدرب ذكاء اصطناعي مهني مدعوم بنموذج نهى من شركة علم.
مرحلتك الآن: التنفيذ الكامل.

الموظف تعلّم، والآن أعطاك المعلومات المطلوبة.
مهمتك: أنجز المهمة كاملاً بشكل احترافي.

القواعد:
- استخدم المعلومات التي أعطاها الموظف
- استخدم سياق الشركة من الوثائق إن وُجد
- المخرج يكون جاهزاً للاستخدام الفوري (إيميل، تقرير، رد، خطة...)
- لا تشرح كثيراً — المخرج هو الأهم

الرد لازم يكون بهذا التنسيق EXACTLY:

[ما فهمته عنك]
جملة واحدة تلخص المهمة والمعطيات

[المخرج الجاهز]
النتيجة الكاملة جاهزة للنسخ والاستخدام مباشرة

[برومبت للتعديل لاحقاً]
برومبت جاهز لو أردت تعديل المخرج أو تكراره مستقبلاً"""


# ── Helpers ───────────────────────────────────────────────────
def extract_text(b: bytes, fn: str) -> str:
    ext = fn.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        return "\n".join(p.extract_text() or "" for p in PyPDF2.PdfReader(io.BytesIO(b)).pages)
    elif ext == "docx":
        return "\n".join(p.text for p in docx.Document(io.BytesIO(b)).paragraphs)
    return b.decode("utf-8", errors="ignore")

def chunk_text(text: str, size=700, overlap=100) -> list[str]:
    chunks, start = [], 0
    while start < len(text):
        c = text[start:min(start+size, len(text))].strip()
        if len(c) > 40: chunks.append(c)
        start += size - overlap
    return chunks

def keyword_search(query: str, chunks: list[str], top_k=3) -> list[str]:
    if not chunks: return []
    qw = set(w for w in query.lower().split() if len(w) > 2)
    if not qw: return []
    results = []
    for chunk in chunks:
        cl = chunk.lower()
        matched = sum(1 for w in qw if w in cl)
        if matched == 0: continue
        score = (matched / len(qw)) * 2 + sum(cl.count(w) for w in qw if w in cl) * 0.5
        if score >= 0.5: results.append((score, chunk))
    results.sort(reverse=True)
    return [c for _, c in results[:top_k]]

def parse_teach(raw: str) -> dict:
    s = {"why": "", "steps": [], "example": "", "prompt_tip": "", "question": ""}
    pats = {
        "why":        r"\[ليش AI يساعدك هنا؟\](.*?)(?=\[كيف تستخدمه|\Z)",
        "steps_raw":  r"\[كيف تستخدمه خطوة بخطوة\](.*?)(?=\[مثال|\Z)",
        "example":    r"\[مثال من واقع وظيفتك\](.*?)(?=\[سر البرومبت|\Z)",
        "prompt_tip": r"\[سر البرومبت الناجح\](.*?)(?=\[أنا جاهز|\Z)",
        "question":   r"\[أنا جاهز أنجزها معك ✨\](.*?)$",
    }
    for key, pat in pats.items():
        m = re.search(pat, raw, re.DOTALL)
        if m:
            val = m.group(1).strip()
            if key == "steps_raw":
                s["steps"] = [re.sub(r"^\d+[\.\-\)]\s*", "", l.strip()) for l in val.splitlines() if l.strip()]
            else:
                s[key] = val
    return s

def parse_execute(raw: str) -> dict:
    s = {"summary": "", "output": "", "prompt": ""}
    pats = {
        "summary": r"\[ما فهمته عنك\](.*?)(?=\[المخرج الجاهز\]|\Z)",
        "output":  r"\[المخرج الجاهز\](.*?)(?=\[برومبت للتعديل|\Z)",
        "prompt":  r"\[برومبت للتعديل لاحقاً\](.*?)$",
    }
    for key, pat in pats.items():
        m = re.search(pat, raw, re.DOTALL)
        if m: s[key] = m.group(1).strip()
    return s

# ── Gamification ──────────────────────────────────────────────
user_profiles: dict[str, dict] = {}
BADGES = {
    1:  {"id": "first_step",  "name": "الخطوة الأولى", "icon": "🌱", "desc": "أول مهمة"},
    5:  {"id": "rising_star", "name": "نجم صاعد",      "icon": "⭐", "desc": "5 مهام"},
    10: {"id": "ai_pro",      "name": "محترف AI",       "icon": "🚀", "desc": "10 مهام"},
    20: {"id": "champion",    "name": "بطل الذكاء",     "icon": "🏆", "desc": "20 مهمة"},
}

def get_profile(uid: str) -> dict:
    if uid not in user_profiles:
        user_profiles[uid] = {"user_id": uid, "points": 0, "tasks_done": 0, "badges": [],
                               "history": [], "role_stats": {"HR":0,"Sales":0,"Finance":0,"Operations":0}}
    return user_profiles[uid]

def get_level(pts: int) -> dict:
    if pts < 50:   return {"name": "مبتدئ",  "icon": "🌱", "next": 50,  "current": pts}
    elif pts < 150: return {"name": "متعلم",  "icon": "📚", "next": 150, "current": pts}
    elif pts < 300: return {"name": "محترف",  "icon": "💼", "next": 300, "current": pts}
    elif pts < 500: return {"name": "خبير",   "icon": "⭐", "next": 500, "current": pts}
    else:           return {"name": "بطل AI", "icon": "🏆", "next": None,"current": pts}

def award_points(uid: str, role: str, task: str, output: str) -> dict:
    p = get_profile(uid)
    p["points"] += 10
    p["tasks_done"] += 1
    p["role_stats"][role] = p["role_stats"].get(role, 0) + 1
    new_badges = []
    for th, badge in BADGES.items():
        if p["tasks_done"] >= th and badge["id"] not in [b["id"] for b in p["badges"]]:
            p["badges"].append(badge); new_badges.append(badge)
    p["history"].insert(0, {"id": str(_uuid.uuid4())[:8], "timestamp": datetime.now().isoformat(),
                             "role": role, "task": task, "output": output[:300], "points_earned": 10})
    if len(p["history"]) > 50: p["history"] = p["history"][:50]
    return {"points_earned": 10, "total_points": p["points"], "tasks_done": p["tasks_done"],
            "new_badges": new_badges, "level": get_level(p["points"])}


# ══════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.get("/")
def root(): return {"status": " Rakiza v2.0", "sessions": len(doc_sessions)}

@app.get("/health")
def health(): return {"status": "ok", "sessions": len(doc_sessions), "users": len(user_profiles)}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in {"pdf", "docx", "txt"}: raise HTTPException(400, "نوع الملف غير مدعوم")
    raw = await file.read()
    text = extract_text(raw, file.filename)
    if not text.strip(): raise HTTPException(400, "تعذّر استخراج النص")
    chunks = chunk_text(text)
    sid = str(_uuid.uuid4())
    s = DocSession(); s.chunks = chunks; s.filename = file.filename
    doc_sessions[sid] = s
    stored_chunks.extend(chunks)
    return {"message": f"✅ {len(chunks)} قطعة", "filename": file.filename,
            "chunks": len(chunks), "session_id": sid,
            "privacy": {"stored_permanently": False, "auto_delete_minutes": 30,
                        "message": "🔒 وثيقتك تُحذف تلقائياً بعد 30 دقيقة"}}

@app.delete("/session/{session_id}")
def delete_session(sid: str):
    if sid in doc_sessions:
        fn = doc_sessions[sid].filename; del doc_sessions[sid]
        return {"message": f"✅ تم حذف '{fn}'", "deleted": True}
    return {"message": "الجلسة غير موجودة", "deleted": False}


# ── PHASE 1: TEACH ────────────────────────────────────────────
class TeachRequest(BaseModel):
    role: str
    task: str
    session_id: str | None = None

@app.post("/teach")
async def teach(req: TeachRequest):
    """Phase 1: Teach the user how AI can help with their task."""
    role_ar = ROLE_LABELS.get(req.role, req.role)

    # Get doc context
    chunks = []
    if req.session_id and req.session_id in doc_sessions:
        s = doc_sessions[req.session_id]
        if s.expires_at > time.time():
            chunks = keyword_search(req.task, s.chunks)

    ctx = f"\n\nسياق من وثائق الشركة:\n" + "\n---\n".join(chunks) if chunks else ""
    user_msg = f"الدور: {role_ar}\nالمهمة: {req.task}{ctx}"

    try:
        resp = client.chat.completions.create(
            model="nuha-2.0",
            messages=[{"role": "system", "content": TEACH_PROMPT},
                      {"role": "user",   "content": user_msg}],
            temperature=0.7, max_tokens=1200,
        )
        raw = resp.choices[0].message.content
    except Exception as e:
        raise HTTPException(500, f"خطأ في نهى: {str(e)}")

    return {"phase": "teach", "role": req.role, "role_ar": role_ar,
            "task": req.task, "content": parse_teach(raw), "raw": raw}


# ── PHASE 2: EXECUTE ──────────────────────────────────────────
class ExecuteRequest(BaseModel):
    role: str
    task: str
    user_answer: str          # what user provided (name, date, details...)
    session_id: str | None = None
    user_id: str | None = None

@app.post("/execute")
async def execute(req: ExecuteRequest):
    """Phase 2: Execute the task using user's details + company docs."""
    role_ar = ROLE_LABELS.get(req.role, req.role)

    # Get doc context
    chunks = []
    if req.session_id and req.session_id in doc_sessions:
        s = doc_sessions[req.session_id]
        if s.expires_at > time.time():
            chunks = keyword_search(f"{req.task} {req.user_answer}", s.chunks, top_k=4)

    ctx = f"\n\nمعلومات من وثائق الشركة:\n" + "\n---\n".join(chunks) if chunks else ""
    user_msg = (f"الدور: {role_ar}\n"
                f"المهمة: {req.task}\n"
                f"المعلومات التي أعطاها الموظف: {req.user_answer}"
                f"{ctx}")

    try:
        resp = client.chat.completions.create(
            model="nuha-2.0",
            messages=[{"role": "system", "content": EXECUTE_PROMPT},
                      {"role": "user",   "content": user_msg}],
            temperature=0.7, max_tokens=1800,
        )
        raw = resp.choices[0].message.content
    except Exception as e:
        raise HTTPException(500, f"خطأ في نهى: {str(e)}")

    result = parse_execute(raw)

    # Award points
    gamification = None
    if req.user_id:
        gamification = award_points(req.user_id, req.role, req.task, result.get("output", ""))

    return {"phase": "execute", "role": req.role, "role_ar": role_ar,
            "task": req.task, "content": result, "raw": raw,
            "sources": chunks, "gamification": gamification}


# ── Nuha direct chat ──────────────────────────────────────────
class NuhaRequest(BaseModel):
    prompt: str
    session_id: str | None = None

@app.post("/nuha")
async def nuha_direct(req: NuhaRequest):
    sys = "أنت نهى، مساعدة ذكية من شركة علم. أجيبي دائماً بالعربية بشكل مفيد وعملي."
    if req.session_id and req.session_id in doc_sessions:
        s = doc_sessions[req.session_id]
        if s.expires_at > time.time():
            rel = keyword_search(req.prompt, s.chunks, top_k=2)
            if rel:
                sys += f"\n\nلديك معلومات من وثيقة الشركة ({s.filename}):\n" + "\n---\n".join(rel)
    try:
        resp = client.chat.completions.create(
            model="nuha-2.0",
            messages=[{"role": "system", "content": sys}, {"role": "user", "content": req.prompt}],
            temperature=0.7, max_tokens=1500,
        )
        return {"response": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(500, f"خطأ: {str(e)}")


# ── Profile / History / Dashboard ────────────────────────────
@app.get("/profile/{uid}")
def profile(uid: str):
    p = get_profile(uid)
    return {**p, "level": get_level(p["points"]), "history": p["history"][:10]}

@app.get("/history/{uid}")
def history(uid: str, limit: int = 20):
    p = get_profile(uid)
    return {"total": len(p["history"]), "history": p["history"][:limit]}

@app.get("/dashboard")
def dashboard():
    total = len(user_profiles)
    tasks = sum(p["tasks_done"] for p in user_profiles.values())
    rc: dict = {"HR":0,"Sales":0,"Finance":0,"Operations":0}
    for p in user_profiles.values():
        for r, c in p.get("role_stats", {}).items():
            rc[r] = rc.get(r, 0) + c
    all_tasks = []
    for uid, p in user_profiles.items():
        for h in p["history"]:
            all_tasks.append({**h, "user_id": uid[:8]+"***"})
    all_tasks.sort(key=lambda x: x["timestamp"], reverse=True)
    return {
        "summary": {"total_users": total, "active_users": sum(1 for p in user_profiles.values() if p["tasks_done"]>0),
                    "total_tasks": tasks, "avg_tasks_user": round(tasks/max(total,1),1)},
        "role_distribution": rc,
        "top_needed_role": max(rc, key=rc.get) if any(rc.values()) else "—",
        "recent_activity": all_tasks[:10],
        "leaderboard": sorted(
            [{"user_id": uid[:8]+"***","points":p["points"],"tasks":p["tasks_done"],"level":get_level(p["points"])["name"]}
             for uid,p in user_profiles.items()],
            key=lambda x: x["points"], reverse=True)[:10],
    }

@app.delete("/reset")
def reset():
    stored_chunks.clear(); doc_sessions.clear(); user_profiles.clear()
    return {"message": " تم مسح كل شيء"}