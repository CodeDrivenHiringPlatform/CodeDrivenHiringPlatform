from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.schemas import EvaluationResponse

# 1. Initialize parser to generate precise JSON instructions
parser = PydanticOutputParser(pydantic_object=EvaluationResponse)

# 2. System Instruction ensuring strict evaluation and format adherence
SYSTEM_PROMPT = """You are an expert technical interviewer and senior software engineer.
Your task is to thoroughly analyze and evaluate the provided code against the given problem description.

Follow these strict evaluation rules:
1. Be objective, accurate, and realistic in scoring (0 to 100 scale).
2. Check for algorithm correctness, edge case handling, and time/space complexity.
3. Keep explanations clear, professional, and actionable.
4. IMPORTANT: You MUST strictly adhere to the formatting guidelines below and return ONLY valid JSON matching the schema.

{format_instructions}
"""

HUMAN_PROMPT = """Evaluate the following solution:

### Programming Language:
{language}

### Problem Description:
{problem_description}

### Submitted Code:
```{language}
{code}
"""


EVALUATION_PROMPT = ChatPromptTemplate.from_messages([
("system", SYSTEM_PROMPT),
("human", HUMAN_PROMPT)
]).partial(format_instructions=parser.get_format_instructions())