import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

from app.prompt import EVALUATION_PROMPT, parser
from app.schemas import EvaluationRequest, EvaluationResponse

load_dotenv()

LLM_MODEL = os.getenv("LLM_MODEL")
API_KEY = os.getenv("API_KEY")

if not LLM_MODEL:
    raise ValueError("LLM_MODEL is not configured")

if not API_KEY:
    raise ValueError("API_KEY is not configured")


try:
    llm = init_chat_model(
        LLM_MODEL,
        api_key=API_KEY,
        temperature=0.1
    )
except Exception as e:
    raise RuntimeError(
        f"Failed to initialize LLM: {str(e)}"
    ) from e


# Prompt -> LLM -> Output Parser
evaluator_chain = EVALUATION_PROMPT | llm | parser


async def evaluate_code(
    payload: EvaluationRequest
) -> EvaluationResponse:
    """
    Evaluates the submitted code using the configured LLM.
    """

    try:
        response = await evaluator_chain.ainvoke({
            "code": payload.code,
            "problem_description": payload.problem_description,
            "language": payload.language,
        })

        return response

    except Exception as e:
        raise RuntimeError(
            f"Code evaluation failed: {str(e)}"
        ) from e