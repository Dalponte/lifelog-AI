# Audio Memory Repository

## Project Overview

This is a [NestJS](https://github.com/nestjs/nest) application designed to run inside a Docker container. Its primary goal is to serve as an intelligent transcription and memory repository for voice recordings.

The application automatically processes your audio notes:
1. **Monitor**: Tracks a file directory for incoming `.wav` audio files.
2. **Transcribe**: Converts the audio files into raw text.
3. **Analyze & Restructure**: Uses an AI model (such as Gemini) to process the transcriptions. The AI takes raw spoken thoughts and restructures them to be highly coherent and properly contextualized.
4. **Categorize & Store**: Saves the structured ideas into a database with appropriate categorizations.
5. **Future Reference**: Serves as a persistent memory and ideas repository that can be queried by other projects, or used to generate context and specification files automatically.

For instructions on the audio recording workflow using `sox`, please refer to the [RECORDING_GUIDE.md](RECORDING_GUIDE.md).

---

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
