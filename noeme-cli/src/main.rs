mod cli;

use anyhow::Result;
use clap::Parser;
use cli::Cli;
use noeme::{Jsonify, Noeme};

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let noeme = Noeme::from(cli.word.as_str()).await?;

    println!("Instance: {:#?}", noeme);
    println!("Jsonify: {:#?}", noeme.to_json());

    Ok(())
}
