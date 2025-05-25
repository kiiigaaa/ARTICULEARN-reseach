import os
import tempfile

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from phonological_analyzer import analyze_pronunciation

class AnalysisResponse(BaseModel):
    target: str
    ref_phonemes: list[str]
    child_phonemes: list[str]
    error_info: dict

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # lock this down in prod!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(
    transcript: str = Form(...),
    audio: UploadFile = File(...),
):
    # accept WAV, M4A, MP3, etc
    if audio.content_type not in (
        "audio/wav", "audio/x-wav",
        "audio/mpeg", "audio/mp3",
        "audio/x-m4a", "audio/m4a",
        "application/octet-stream",
    ):
        raise HTTPException(400, "Invalid audio format")

    # save upload
    suffix = os.path.splitext(audio.filename)[1] or ".wav"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        tmp.write(await audio.read())
        tmp.close()
        result = analyze_pronunciation(transcript, tmp.name)
    finally:
        if os.path.exists(tmp.name):
            os.remove(tmp.name)

    # ensure child_phonemes is always present
    result.setdefault("child_phonemes", [])
    return result

if __name__ == "__main__":
    # run with: uvicorn server:app --host 0.0.0.0 --port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
