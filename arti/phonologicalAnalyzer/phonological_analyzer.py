import os
import json
import subprocess
from typing import List, Dict, Any

import librosa
import numpy as np
import soundfile as sf
import editdistance
from pocketsphinx import Pocketsphinx, get_model_path

# 1. Audio Preprocessing
def preprocess_audio(audio_path: str, sr: int = 16000, top_db: int = 30) -> (np.ndarray, int):
    y, _ = librosa.load(audio_path, sr=sr)
    if np.max(np.abs(y)) > 0:
        y = y / np.max(np.abs(y))
    y_trim, _ = librosa.effects.trim(y, top_db=top_db)
    return y_trim, sr

# 2. Forced Alignment (Gentle)
def forced_align(transcript: str, audio_path: str, gentle_server: str = "http://localhost:8765") -> List[str]:
    resp = subprocess.run(
        [
            "curl", "-s",
            "-F", f"transcript={transcript}",
            "-F", f"audio=@{audio_path}",
            f"{gentle_server}/transcriptions?async=false"
        ],
        capture_output=True,
        text=True,
    )
    result = json.loads(resp.stdout or "{}")
    phonemes: List[str] = []
    for w in result.get("words", []):
        for p in w.get("phones", []):
            phonemes.append(p.get("phone", ""))
    return phonemes

# 3. Child Speech Recognition (PocketSphinx)
def recognize_phonemes(audio_path: str) -> List[str]:
    # wherever you unpacked the model
    model_dir = r"C:\models\en-us"
    dict_path = os.path.join(model_dir, "cmudict-en-us.dict")

    # sanity checks
    if not os.path.isdir(model_dir) or not os.path.isfile(dict_path):
        raise RuntimeError(f"Missing model or dict in {model_dir}")

    config = {
        "hmm": model_dir,    # acoustic model directory
        "dict": dict_path,   # CMU dict
        "logfn": os.devnull, # silence logs
    }

    ps = Pocketsphinx(**config)
    ps.decode(audio_file=audio_path)
    return [seg[0] for seg in ps.segments(detailed=True)]

# 4. Error Alignment & Detection
def align_and_detect(ref: List[str], hyp: List[str]) -> Dict[str, Any]:
    dist = editdistance.eval(ref, hyp)
    ins = max(len(hyp) - len(ref), 0)
    dels = max(len(ref) - len(hyp), 0)
    subs = max(dist - ins - dels, 0)
    err_rate = dist / max(len(ref), 1)
    return {
        "substitutions": subs,
        "deletions": dels,
        "insertions": ins,
        "error_rate": err_rate,
        "is_correct": err_rate <= 0.10,
    }

# 5. Combined Analysis
def analyze_pronunciation(target_sentence: str, audio_path: str) -> Dict[str, Any]:
    """
    Returns a dict with:
      - target
      - ref_phonemes
      - child_phonemes
      - error_info
    """
    # preprocess + write a clean WAV
    clean_audio, sr = preprocess_audio(audio_path)
    wav_path = "temp.wav"
    sf.write(wav_path, clean_audio, sr)

    # forced align → reference phonemes
    ref_phonemes = forced_align(target_sentence, wav_path)

    # recognize child phonemes
    child_phonemes = recognize_phonemes(wav_path)

    # compute error metrics
    error_info = align_and_detect(ref_phonemes, child_phonemes)

    # cleanup
    os.remove(wav_path)

    return {
        "target": target_sentence,
        "ref_phonemes": ref_phonemes,
        "child_phonemes": child_phonemes,
        "error_info": error_info,
    }

# standalone test
if __name__ == "__main__":
    import json
    out = analyze_pronunciation(
        "The monkey swings from the tall tree.",
        "child_example.wav"
    )
    print(json.dumps(out, indent=2))
