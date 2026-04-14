from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os, base64, uuid
from datetime import datetime
from utils.predictor import predict_gesture
from utils.tts import generate_speech
from utils.db import init_db, save_prediction, get_history, delete_prediction

app = Flask(__name__)
CORS(app)

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "saved_images")
AUDIO_DIR  = os.path.join(os.path.dirname(__file__), "audio_output")
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR,  exist_ok=True)

init_db()

# ── POST /predict ─────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    if not data or "image" not in data:
        return jsonify({"error": "No image provided"}), 400

    raw = data["image"]
    if "," in raw:
        raw = raw.split(",")[1]
    img_bytes = base64.b64decode(raw)

    filename  = uuid.uuid4().hex + ".jpg"
    filepath  = os.path.join(IMAGES_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(img_bytes)

    gesture, text, confidence = predict_gesture(filepath)
    audio_file = generate_speech(text)

    record_id = save_prediction(
        image_path  = filename,
        gesture     = gesture,
        text        = text,
        confidence  = round(confidence, 4),
        audio_file  = audio_file,
        timestamp   = datetime.now().isoformat(timespec="seconds"),
    )

    return jsonify({
        "id":         record_id,
        "gesture":    gesture,
        "text":       text,
        "confidence": round(confidence * 100, 1),
        "audio_url":  f"/audio/{audio_file}" if audio_file else "",
        "image_url":  f"/images/{filename}",
    })

# ── GET /history ──────────────────────────────────────────────────────────────
@app.route("/history", methods=["GET"])
def history():
    return jsonify(get_history())

# ── DELETE /history/<id> ──────────────────────────────────────────────────────
@app.route("/history/<int:rid>", methods=["DELETE"])
def delete_record(rid):
    delete_prediction(rid)
    return jsonify({"ok": True})

# ── Static files ──────────────────────────────────────────────────────────────
@app.route("/images/<path:filename>")
def serve_image(filename):
    return send_from_directory(IMAGES_DIR, filename)

@app.route("/audio/<path:filename>")
def serve_audio(filename):
    mime = "audio/wav" if filename.endswith(".wav") else "audio/mpeg"
    return send_from_directory(AUDIO_DIR, filename, mimetype=mime)

@app.route("/health")
def health():
    return jsonify({"status": "ok", "model": "loaded"})

if __name__ == "__main__":
    print("\n✅  GestureAI backend starting on http://localhost:5000\n")
    app.run(debug=True, port=5000)
