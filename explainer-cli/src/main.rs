mod cli;

use anyhow::Result;
use clap::Parser;
use cli::Cli;
use explainer::{Explainer, Jsonify};

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let explainer = Explainer::from(cli.word.as_str()).await?;

    println!("{:#?}", explainer.basic_meanings);
    println!("{:#?}", explainer.basic_meanings.to_json());

    Ok(())
}
