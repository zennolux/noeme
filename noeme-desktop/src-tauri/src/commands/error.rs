use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CommandError(pub String);

impl<E> From<E> for CommandError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        CommandError(err.into().to_string())
    }
}
