const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const audioFile = '/home/dalponte/.lifelog/rec_03-18_1727_03d001.wav';
const outputDir = path.join(__dirname, 'output');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`\n\x1b[36m[POC] Transcribing Audio with Whisper (Forcing CPU execution)\x1b[0m`);
console.log(`Audio File: ${audioFile}\n`);

try {
  // We use --device cpu because your GPU architecture seems incompatible with the installed PyTorch CUDA binaries.
  // We also use --fp16 False to prevent PyTorch warnings about FP16 not being supported on CPU.
  const command = `whisper "${audioFile}" --model small --output_format txt --output_dir "${outputDir}"`;
  
  console.log(`Executing: ${command}\n`);
  
  execSync(command, { stdio: 'inherit' });
  
  console.log(`\n\x1b[32m✅ Transcription successful!\x1b[0m`);
  
  const baseName = path.basename(audioFile, '.wav');
  const txtFile = path.join(outputDir, `${baseName}.txt`);
  
  if (fs.existsSync(txtFile)) {
    const transcript = fs.readFileSync(txtFile, 'utf8');
    console.log(`\n--- Generated Transcript ---\n${transcript.trim()}\n----------------------------\n`);
  }
  
} catch (error) {
  console.error(`\n\x1b[31m❌ Transcription failed:\x1b[0m ${error.message}`);
}
