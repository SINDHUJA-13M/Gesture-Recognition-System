import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "../database/gestures.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def _conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c

def init_db():
    with _conn() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS predictions (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            image_path TEXT NOT NULL,
            gesture    TEXT NOT NULL,
            text       TEXT NOT NULL,
            confidence REAL NOT NULL DEFAULT 0,
            audio_file TEXT NOT NULL DEFAULT '',
            timestamp  TEXT NOT NULL
        )""")
        c.commit()

def save_prediction(image_path, gesture, text, confidence, audio_file, timestamp) -> int:
    with _conn() as c:
        cur = c.execute(
            "INSERT INTO predictions(image_path,gesture,text,confidence,audio_file,timestamp) VALUES(?,?,?,?,?,?)",
            (image_path, gesture, text, confidence, audio_file, timestamp)
        )
        c.commit()
        return cur.lastrowid

def get_history(limit=200):
    with _conn() as c:
        rows = c.execute("SELECT * FROM predictions ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    return [dict(r) for r in rows]

def delete_prediction(record_id: int):
    with _conn() as c:
        c.execute("DELETE FROM predictions WHERE id=?", (record_id,))
        c.commit()
