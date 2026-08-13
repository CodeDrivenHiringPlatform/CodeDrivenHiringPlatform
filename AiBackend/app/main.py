from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import EvaluationRequest, EvaluationResponse
from app.evaluator import evaluate_code

app = FastAPI(
    title="Code Evaluator API",
    description="LLM-powered code evaluation service using LangChain and Groq.",
    version="1.0.0"
)

# Enable CORS for frontend/client integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}


@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(request: EvaluationRequest):
    """Evaluates submitted code against a problem description

    and returns structured feedback.
    """
    try:
        result = await evaluate_code(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )