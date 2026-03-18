# Lifelog — Audio Memory Repository

## Project Overview

This is a [NestJS](https://github.com/nestjs/nest) Command Line Interface (CLI) application. It is designed to be installed globally on your machine to interact seamlessly with your terminals. Its primary goal is to serve as an intelligent transcription and memory repository for voice recordings.

Using the `lifelog` CLI command, the application automatically coordinates your audio notes:

1. **Trigger & Monitor**: Run CLI commands to track incoming `.wav` audio files.
2. **Transcribe**: Converts the audio files into raw text.
3. **Analyze & Restructure**: Uses an AI model (such as Gemini) to process the transcriptions. The AI takes raw spoken thoughts and restructures them to be highly coherent and properly contextualized.
4. **Categorize & Store**: Saves the structured ideas into a database with appropriate categorizations.
5. **Future Reference**: Serves as a persistent memory and ideas repository that can be queried by other projects, or used to generate context and specification files automatically.

For instructions on the audio recording workflow using `sox`, please refer to the [SOX_POC.md](poc/sox/SOX_POC.md).

---

## Getting Started

### Installation

```bash
yarn install
yarn build
```

### First-time Setup

Run the setup command to install system dependencies and create the required directories:

```bash
npx lifelog setup
```

This will:
- Check and optionally install **SoX** (audio recording tool)
- Create the `~/.lifelog` directory for storing recordings

---

## CLI Usage

### `lifelog setup`

Install dependencies and prepare the environment.

```bash
npx lifelog setup
```

**What it does:**
- Checks if SoX is installed; prompts to install if missing (`sudo apt install sox libsox-fmt-all`)
- Creates `~/.lifelog` directory if it doesn't exist

---

### `lifelog start`

Start an audio recording session.

```bash
npx lifelog start [options]
```

**Options:**

| Flag | Description | Default |
|---|---|---|
| `-s, --session <name>` | Session name (e.g., `meeting`, `notes`) | `default` |
| `-g, --gain <dB>` | Volume gain in dB (range: -12 to +12) | `0` |
| `-r, --rate <hz>` | Sample rate in Hz | `16000` |
| `-c, --channels <n>` | Number of channels: 1=mono, 2=stereo | `1` |
| `-t, --threshold <pct>` | Silence threshold percentage | `1%` |
| `--recorder <type>` | Recorder backend: `sox` \| `node-record-lpcm16` | `sox` |

**Examples:**

```bash
# Start with default settings
npx lifelog start

# Named session with custom gain
npx lifelog start -s meeting -g 5

# High-quality stereo recording
npx lifelog start -s podcast -r 44100 -c 2
```

Recordings are saved as `.wav` files in `~/.lifelog/`. Press `Ctrl+C` to stop recording.

---

### `lifelog clean`

Delete all files in the `~/.lifelog` directory.

```bash
npx lifelog clean [options]
```

**Options:**

| Flag | Description |
|---|---|
| `-f, --force` | Skip confirmation prompt and delete immediately |

**Examples:**

```bash
# List files and ask for confirmation before deleting
npx lifelog clean

# Delete all files without confirmation
npx lifelog clean --force
```

**What it does:**
- Lists all files in `~/.lifelog` with individual sizes and total
- Asks for confirmation before deleting (defaults to **No**)
- Reports how many files were deleted and space freed

---

## Development

### Build

```bash
yarn build
```

### Run tests

```bash
# unit tests
yarn test

# test coverage
yarn test:cov
```
