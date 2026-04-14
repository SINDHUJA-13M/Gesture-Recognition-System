import os, uuid

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "../audio_output")
os.makedirs(AUDIO_DIR, exist_ok=True)

def generate_speech(text: str, lang: str = "en") -> str:
    if not text or not text.strip():
        return ""
    filename = uuid.uuid4().hex
    # Try gTTS (online)
    try:
        from gtts import gTTS
        path = os.path.join(AUDIO_DIR, filename + ".mp3")
        gTTS(text=text, lang=lang, slow=False).save(path)
        return filename + ".mp3"
    except Exception as e:
        print(f"[TTS] gTTS failed: {e}")
    # Fallback: pyttsx3 (offline)
    try:
        import pyttsx3
        path = os.path.join(AUDIO_DIR, filename + ".wav")
        engine = pyttsx3.init()
        engine.setProperty("rate", 150)
        engine.save_to_file(text, path)
        engine.runAndWait()
        return filename + ".wav"
    except Exception as e:
        print(f"[TTS] pyttsx3 failed: {e}")
    return ""

def cleanup_old_audio(max_files=100):
    files = sorted(
        [os.path.join(AUDIO_DIR, f) for f in os.listdir(AUDIO_DIR)
         if f.endswith((".mp3", ".wav"))],
        key=os.path.getmtime
    )
    for f in files[:-max_files]:
        try: os.remove(f)
        except: pass
