mod cli;

use anyhow::Result;
use clap::Parser;
use cli::Cli;
use explainer::{Explainer, Jsonify};

fn main() -> Result<()> {
    let cli = Cli::parse();
    let explainer = Explainer::new(cli.word.as_str())?.to_json()?;

    println!("{:?}", explainer);

    Ok(())
}
