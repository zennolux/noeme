mod cli;

use std::fs;

use anyhow::Result;
use clap::Parser;
use cli::Cli;
use explainer::{Explainer, Jsonify};

fn main() -> Result<()> {
    let cli = Cli::parse();
    let json_str = Explainer::from(cli.word.as_str())?.to_json()?;

    fs::write(format!("./examples/{}.json", cli.word), &json_str)?;

    println!("{:?}", json_str);

    Ok(())
}
