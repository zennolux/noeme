mod cli;

use anyhow::Result;
use clap::Parser;
use cli::Cli;
use explainer::{Explainer, Jsonify};

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let json_str = Explainer::from(cli.word.as_str()).await?.to_json()?;

    println!("{:?}", json_str);

    Ok(())
}
