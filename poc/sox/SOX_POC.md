# Audio Narration Recording Guide - SoX Parameter Documentation

## Quick Start

```bash
# View all available recording commands
make help

# Start recording with default settings (16kHz mono)
make record

# Record with a session name (optional)
make record project

# Record in stereo with high quality and session name
make record-hq interview

# Record with custom gain and your USB microphone
make record myrecording AUDIO_DEVICE=1:0 GAIN=+3
```

Press **Ctrl+C** to stop recording. Files will be automatically numbered and saved with a timestamp.

**File naming example:** If you run `make record project` on March 18 at 10:27, files will be named:
- `rec_03-18_1027_project_001.wav`
- `rec_03-18_1027_project_002.wav`
- `rec_03-18_1027_project_003.wav` (auto-split by silence)

The timestamp (MM-DD_HHMM) is automatically added from when you start the recording session. The session name is optional — if omitted, files will be: `rec_03-18_1027_001.wav`

---

## Understanding the Recording Command

### Base Command Structure
```
rec [options] output.wav gain [GAIN] silence [SILENCE_PARAMS] : newfile : restart
```

### Parameter Breakdown

#### **RATE** (Sample Rate) - Frequency in Hz
The number of audio samples captured per second. Higher rates capture more detail but use more storage.

| Rate | Use Case | Quality | File Size (per minute) |
|------|----------|---------|----------------------|
| 8000 | Telephone, voice messages | Very low | ~1 MB |
| 16000 | **DEFAULT** - Voice narration | Good | ~2 MB |
| 44100 | Music, professional audio | Excellent | ~5.3 MB |
| 48000 | Video production | Excellent | ~5.8 MB |

**Recommendation for narration:** 16kHz is ideal - balances quality and file size.

---

#### **CHANNELS** - Audio Channels
Number of recording channels.

| Value | Description | Use Case |
|-------|-------------|----------|
| 1 | **Mono** (default) | Single microphone, narration, voice |
| 2 | Stereo | Multiple microphones, music, interviews |

**Recommendation for narration:** 1 (mono) - all audio goes to one channel.

---

#### **GAIN** - Volume Amplification (in dB)
Adjusts input volume before recording. Positive values amplify weak audio; negative values reduce loud audio.

| Value | Effect | Use Case |
|-------|--------|----------|
| -6 to -3 dB | Reduce volume | Very loud microphone, clipping issues |
| 0 dB | **DEFAULT** - No change | Normal microphone input |
| +3 to +6 dB | Amplify volume | Quiet microphone, low input level |
| +12 dB | Significant boost | Very quiet source |

**How to choose:**
- Listen to recorded test files
- If audio is too quiet → increase gain: `make record GAIN=+3`
- If audio is distorted/clipping → decrease gain: `make record GAIN=-3`
- Adjust in **±3 dB increments** for noticeable changes

**Example:**
```bash
make record GAIN=+2 AUDIO_PREFIX=narrator
```

---

#### **SILENCE** Parameters - Automatic Pause Detection
Controls when silence is detected and files are split automatically.

```
silence [SILENCE_DURATION] 0.1 [SILENCE_THRESHOLD] [SILENCE_END_DURATION] 2.0 [SILENCE_END_THRESHOLD]
```

**SILENCE_DURATION** (Initial silence, seconds)
- Time of silence at start before recording begins
- Default: 1 second
- **1 second** is usually fine - waits briefly after pressing enter

**SILENCE_THRESHOLD** (Silence level, percentage)
- Audio level below this percentage triggers silence detection
- Default: 1% (very sensitive)
- Range: 0.1% to 10%

| Threshold | Sensitivity | Use Case |
|-----------|------------|----------|
| 0.1% | Extremely sensitive | Very quiet room, music |
| **1%** | **DEFAULT** - Balanced | Normal office, narration |
| 2-3% | Less sensitive | Noisy environment |
| 5% | Very insensitive | Loud background noise |

**SILENCE_END_DURATION** (Final silence, seconds)
- How long audio must be silent before ending current file and starting a new one
- Default: 2.0 seconds
- Useful for naturally splitting recordings by pauses

| Duration | Behavior | Use Case |
|----------|----------|----------|
| 1.0 | Quick splits on short pauses | Fast speakers |
| **2.0** | **DEFAULT** - Normal splits | Natural narration |
| 3.0 | Only splits on long pauses | Deliberate pauses for effect |
| 0.5 | Very aggressive splitting | Sentence-by-sentence recording |

**SILENCE_END_THRESHOLD** (Final silence level, percentage)
- Same as SILENCE_THRESHOLD but for end-of-file detection
- Default: 1%
- Usually keep same as SILENCE_THRESHOLD

---

## Common Recording Scenarios

### Scenario 1: Quiet Voice, Normal Room
**Problem:** Audio is too quiet even with normal microphone
```bash
make record GAIN=+3 AUDIO_PREFIX=quiet_speaker
```
- Amplifies input by 3 dB
- Slightly increases sensitivity: `SILENCE_THRESHOLD=2%`

### Scenario 2: Loud Voice, Small Room
**Problem:** Audio distorts/clips, need quieter recording
```bash
make record GAIN=-2 AUDIO_PREFIX=loud_speaker
```
- Reduces input by 2 dB
- Less sensitive: `SILENCE_THRESHOLD=2%` to avoid false splits

### Scenario 3: Professional Narration
**Best quality with natural pauses:**
```bash
make record-hq GAIN=0 AUDIO_PREFIX=professional
```
- High quality (44.1 kHz stereo)
- Natural file splitting on pauses

### Scenario 4: Fast Interview with Minimal Pauses
**Aggressive silence detection for speaker changes:**
```bash
make record SILENCE_END_DURATION=1.5 SILENCE_END_THRESHOLD=2% AUDIO_PREFIX=interview
```
- Shorter silence window (1.5s) catches quick pauses
- Less sensitive (2%) avoids false splits from mouth clicks

### Scenario 5: Noisy Environment
**More tolerant of background noise:**
```bash
make record GAIN=+2 SILENCE_THRESHOLD=3% SILENCE_END_THRESHOLD=3% AUDIO_PREFIX=noisy
```
- Requires 3% silence level (ignores background noise below this)
- Gain boost to compensate for noise immunity

---

## Troubleshooting

### Issue: Files are splitting too frequently
**Solution:** Increase silence duration
```bash
make record SILENCE_END_DURATION=3.0 SILENCE_END_THRESHOLD=2%
```
- Requires 3 seconds of silence instead of 2
- Less sensitive threshold (2% instead of 1%)

### Issue: Files are never splitting (long pauses not detected)
**Solution:** Decrease silence duration, increase sensitivity
```bash
make record SILENCE_END_DURATION=1.0 SILENCE_END_THRESHOLD=0.5%
```
- Only requires 1 second of silence
- More sensitive (0.5%)

### Issue: Audio is distorted (clipping)
**Solution:** Reduce gain and increase sensitivity
```bash
make record GAIN=-3 SILENCE_THRESHOLD=2%
```
- Reduces input level
- Less sensitive to noise

### Issue: Audio is barely audible
**Solution:** Increase gain and decrease sensitivity
```bash
make record GAIN=+6 SILENCE_THRESHOLD=0.5%
```
- Maximum amplification
- Very sensitive (catches quiet speech)

### Issue: Background noise is recorded
**Solution:** Increase silence threshold (less sensitive)
```bash
make record SILENCE_THRESHOLD=2% SILENCE_END_THRESHOLD=2%
```
- Ignores ambient noise below 2% level

---

## File Management

```bash
# List all recorded files
make list

# Delete all audio files (with confirmation)
make clean

# Delete specific files manually
rm rec_03-18_1027_project_001.wav rec_03-18_1027_project_002.wav
```

---

## Advanced Usage

### Custom Output Prefix
All recordings use a 3-digit numbered suffix and include the session timestamp with optional session name.

```bash
# With session name
make record-hq narration_chapter_1
# Creates: rec_03-18_1027_narration_chapter_1_001.wav, rec_03-18_1027_narration_chapter_1_002.wav, etc.

# Without session name (just prefix and timestamp)
make record-hq
# Creates: rec_03-18_1027_001.wav, rec_03-18_1027_002.wav, etc.
```

### Change Audio Format
```bash
make record AUDIO_FORMAT=mp3
```
(Requires libsox-fmt-mp3 package)

### Combine Multiple Parameters
```bash
make record GAIN=+2 RATE=44100 CHANNELS=2 SILENCE_DURATION=0.5 SILENCE_END_DURATION=2.5 AUDIO_PREFIX=final_narration
```

---

## File Naming & Organization

**Filename pattern:** `prefix_MM-DD_HHMM[_sessionname]_###.wav`
- **prefix**: Your custom `AUDIO_PREFIX` (default: `rec`)
- **MM-DD**: Month and day (e.g., 03-18)
- **HHMM**: Hour and minute in 24-hour format (e.g., 1027 for 10:27 AM)
- **sessionname**: Optional session name (if provided as argument, otherwise omitted)
- **###**: 3-digit file number (001, 002, 003, etc. - auto-incremented when silence splits)

**Examples:**

With session name:
```bash
make record project
# Output: rec_03-18_1027_project_001.wav, rec_03-18_1027_project_002.wav
```

Without session name:
```bash
make record
# Output: rec_03-18_1027_001.wav, rec_03-18_1027_002.wav
```

Different prefixes:
```bash
make record-hq interview
# Output: rec_03-18_1027_interview_001.wav
```

**Recommended workflow:**
```bash
# Session 1: Record narration
make record narration
# Creates: rec_03-18_1027_narration_001.wav, etc.

# Session 2: Record interview at different time
make record interview
# Creates: rec_03-18_1145_interview_001.wav, etc.

# Quick test recording without session name
make record
# Creates: rec_03-18_1150_001.wav, etc.

# View all files organized by session
make list
```

This makes it easy to:
- Identify when each recording started (date and time)
- Know what each session contains (session name)
- Keep recordings from different sessions organized
- Sort files chronologically by timestamp

---

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| RATE | 16000 | 8000-48000 | Higher = better quality, larger files |
| CHANNELS | 1 | 1-2 | 1=mono, 2=stereo |
| GAIN | 0 | -12 to +12 dB | Adjust by ±3 dB increments |
| SILENCE_DURATION | 1 | 0.1-3 | Initial delay before recording |
| SILENCE_THRESHOLD | 1% | 0.1%-10% | Lower = more sensitive |
| SILENCE_END_DURATION | 2.0 | 0.5-5 | How long to wait before splitting |
| SILENCE_END_THRESHOLD | 1% | 0.1%-10% | Lower = more sensitive |

---
