# ركيزة — Rakiza MVP

مدرّب ذكي تفاعلي للموظفين غير التقنيين، مدعوم بنموذج نهى من علم.

---

## البنية التقنية

```
rakiza/
├── backend/
│   ├── main.py          ← FastAPI + Noha + RAG (FAISS)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── pages/
    │   │   ├── RoleSelect.tsx
    │   │   ├── TaskInput.tsx
    │   │   └── ResultPage.tsx
    │   └── types/
    │       ├── index.ts
    │       └── api.ts
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

---

## تشغيل المشروع

### 1. Backend

```bash
cd backend

# إنشاء بيئة افتراضية
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# تثبيت المتطلبات
pip install -r requirements.txt

# إعداد المتغيرات
cp .env.example .env
# عدّلي .env وضعي مفتاحك

# تشغيل الخادم
ELM_API_KEY=sk-your-key ELM_BASE_URL=https://elmodels.ngrok.app/v1 uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# افتحي: http://localhost:3000
```

---

## API Examples

### رفع وثيقة
```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@company_policy.pdf"
```

### طلب تدريب
```bash
curl -X POST http://localhost:8000/coach \
  -H "Content-Type: application/json" \
  -d '{
    "role": "HR",
    "task": "اكتب إيميل ترحيب لموظفة جديدة",
    "use_uploaded_context": false
  }'
```

### فحص الصحة
```bash
curl http://localhost:8000/health
```

---

## التقنيات المستخدمة

| المكوّن | التقنية |
|---------|---------|
| LLM | نهى 2.0 من علم |
| RAG | FAISS + sentence-transformers |
| Embeddings | multilingual-e5-base |
| Backend | FastAPI |
| Frontend | React + Vite + TypeScript + Tailwind |

---

## الوظائف المدعومة

- موارد بشرية (HR)
- مبيعات (Sales)
- مالية (Finance)
- عمليات (Operations)

## مخرجات ركيزة لكل مهمة

1. شرح مبسط — كيف يساعد AI
2. خطوات التنفيذ — خطوة بخطوة
3. مثال عملي — مبني على الوظيفة
4. برومبت جاهز — قابل للنسخ مباشرة
5. مخرج جاهز — إيميل / تقرير / ملخص
