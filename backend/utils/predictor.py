import cv2
import mediapipe as mp
import numpy as np
import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../model/gesture_classifier.pkl")
META_PATH  = os.path.join(os.path.dirname(__file__), "../model/gesture_meta.pkl")

mp_hands = mp.solutions.hands
_hands   = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)

_clf  = None
_meta = None

def _load():
    global _clf, _meta
    if _clf is None:
        with open(MODEL_PATH, "rb") as f: _clf  = pickle.load(f)
        with open(META_PATH,  "rb") as f: _meta = pickle.load(f)

def extract_landmarks(image_path: str):
    img = cv2.imread(image_path)
    if img is None:
        return None
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = _hands.process(img_rgb)
    if not results.multi_hand_landmarks:
        return None
    lms = []
    for lm in results.multi_hand_landmarks[0].landmark:
        lms.extend([lm.x, lm.y, lm.z])
    return np.array(lms)

def predict_gesture(image_path: str):
    """Returns (gesture_label, text_output, confidence 0-1)."""
    _load()
    lms = extract_landmarks(image_path)
    if lms is None:
        return "unknown", "No hand detected", 0.0

    proba  = _clf.predict_proba([lms])[0]
    idx    = int(np.argmax(proba))
    label  = _clf.classes_[idx]
    conf   = float(proba[idx])
    text   = _meta["text_map"].get(label, label.replace("_", " ").title())
    return label, text, conf
