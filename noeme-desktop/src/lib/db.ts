import Database from "@tauri-apps/plugin-sql";

export enum MarkKind {
  Fresh,
  Maybe,
  Mastered,
}

export interface LocalWord {
  name: string;
  meaning: string;
  mark: MarkKind;
  details: Noeme | string;
  created_at: string;
}

async function loadDatabse() {
  return await Database.load("sqlite:noeme.db");
}

export async function getLocalWords(
  mark: MarkKind
): Promise<{ total: number; data: Array<LocalWord> }> {
  const db = await loadDatabse();

  const sql = "SELECT {} FROM vocabularies WHERE mark = $1";

  const total = (
    await db.select<[{ total: number }]>(
      sql.replace("{}", "count(id) as total"),
      [mark]
    )
  )[0].total;

  const data = await db.select<Array<LocalWord>>(
    sql.replace("{}", "id, name, meaning, mark, created_at"),
    [mark]
  );

  return { total, data };
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
    "REPLACE INTO vocabularies (name, meaning, mark, details, created_at) VALUES ($1, $2, $3, $4, $5)",
    [
      noeme.word.toLowerCase(),
      noeme.basic_meanings[0]?.value,
      MarkKind.Fresh,
      JSON.stringify(noeme),
      new Date().toLocaleString(),
    ]
  );
}
