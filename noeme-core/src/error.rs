#[derive(Debug)]
pub enum ErrorKind {
    ParseSelectors(String),
    SerializeToJson,
    ProcessingRequest,
    NotFound(String),
}

#[derive(Debug)]
pub struct NoemeError {
    pub kind: ErrorKind,
    pub message: String,
}

impl std::fmt::Display for NoemeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match &self.kind {
            ErrorKind::ParseSelectors(selctors) => {
                write!(
                    f,
                    "{}, {}",
                    format!("selectors: {}", selctors),
                    self.message
                )
            }
            ErrorKind::SerializeToJson => write!(f, "{}", self.message),
            ErrorKind::ProcessingRequest => write!(f, "{}", self.message),
            ErrorKind::NotFound(word) => {
                write!(f, "{},{}", format!("word: {}", word), self.message)
            }
        }
    }
}

impl std::error::Error for NoemeError {
    fn cause(&self) -> Option<&dyn std::error::Error> {
        None
    }

    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        None
    }

    fn description(&self) -> &str {
        self.message.as_str()
    }
}

impl From<serde_json::Error> for NoemeError {
    fn from(value: serde_json::Error) -> Self {
        Self {
            kind: ErrorKind::SerializeToJson,
            message: value.to_string(),
        }
    }
}

impl From<reqwest::Error> for NoemeError {
    fn from(value: reqwest::Error) -> Self {
        Self {
            kind: ErrorKind::ProcessingRequest,
            message: value.to_string(),
        }
    }
}
