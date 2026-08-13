from typing import List, Optional
from pydantic import BaseModel, Field


class EvaluationRequest(BaseModel):
    code: str = Field(
        ..., 
        description="The code snippet submitted by the user to evaluate."
    )
    problem_description: str = Field(
        ..., 
        description="The statement or description of the problem the code solves."
    )
    language: Optional[str] = Field(
        default="python", 
        description="Programming language of the submitted code."
    )


class ApproachSchema(BaseModel):
    description: str
    algorithm: str
    correctness: str


class ComplexitySchema(BaseModel):
    time: str
    space: str
    explanation: str


class CodeQualitySchema(BaseModel):
    score: int = Field(..., ge=0, le=100)
    strengths: List[str]
    issues: List[str]


class OptimizationSchema(BaseModel):
    needed: bool
    suggestions: List[str]


class InterviewFeedbackSchema(BaseModel):
    strengths: List[str]
    areas_to_improve: List[str]
    recommendation: str


# Main Output Schema matching your target JSON structure
class EvaluationResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    verdict: str
    summary: str
    approach: ApproachSchema
    complexity: ComplexitySchema
    code_quality: CodeQualitySchema
    optimization: OptimizationSchema
    edge_cases: List[str]
    interview_feedback: InterviewFeedbackSchema