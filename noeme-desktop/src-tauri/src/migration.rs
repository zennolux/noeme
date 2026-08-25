use tauri_plugin_sql::{Migration as SqlMigration, MigrationKind};

#[derive(Debug)]
pub struct Migration {
    pub connection: String,
}

impl Migration {
    pub fn init() -> Self {
        Self {
            connection: "sqlite:noeme.db".to_string(),
        }
    }

    pub fn build(&self) -> Vec<SqlMigration> {
        vec![SqlMigration {
            version: 1,
            description: "create table of vocabularies",
            sql: "
                CREATE TABLE vocabularies(
                        id INTEGER PRIMARY KEY,
                        name TEXT,
                        meaning TEXT,
                        mark INTEGER,
                        details TEXT,
                        created_at TEXT
                );
                CREATE UNIQUE INDEX idx_name ON vocabularies(name);
                CREATE INDEX idx_mark ON vocabularies(mark);
            ",
            kind: MigrationKind::Up,
        }]
    }
}
