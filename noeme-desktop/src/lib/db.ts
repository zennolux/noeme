import Database from "@tauri-apps/plugin-sql";

export enum MarkKind {
  Fresh,
  Maybe,
  Mastered,
}

async function loadDatabse() {
  return await Database.load("sqlite:noeme.db");
}

export async function getWordDetailsFromLocal(
  word: Noeme["word"]
): Promise<Noeme | void> {
  const db = await loadDatabse();

  const result = await db.select<[] | [{ details: string }]>(
    "SELECT details FROM vocabularies WHERE name = $1",
    [word]
  );

  if (!result[0]) {
    return;
  }

  return JSON.parse(result[0].details);
}

export async function saveNewWord(noeme: Noeme) {
  const db = await loadDatabse();

  return db.execute(
    "REPLACE INTO vocabularies (name, mark, details, created_at) VALUES ($1, $2, $3, $4)",
    [
      noeme.word,
      MarkKind.Fresh,
      JSON.stringify(noeme),
      new Date().toLocaleString(),
    ]
  );
}
