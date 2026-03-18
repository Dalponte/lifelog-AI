# Audio Recorder Makefile using SoX
# Captures audio narration with automatic silence detection and file splitting

# Default recording parameters
AUDIO_PREFIX ?= rec
AUDIO_FORMAT ?= wav
SILENCE_DURATION ?= 1
SILENCE_THRESHOLD ?= 1%
SILENCE_END_DURATION ?= 3.0
SILENCE_END_THRESHOLD ?= 1%
GAIN ?= +2
RATE ?= 16000
CHANNELS ?= 1
ENCODING ?= signed-integer

# Audio device configuration
# List devices with: arecord -l
# Leave empty to use system default, or specify CARD:DEVICE
AUDIO_DEVICE ?= 
DEVICE_FLAG = $(if $(AUDIO_DEVICE),-d hw:$(AUDIO_DEVICE),)

# Timestamp for session prefix (MM-DD_HHMM format)
TIMESTAMP = $(shell date +%m-%d_%H%M)

# Session name parameter (optional, passed as positional argument after target)
SESSION_NAME = $(if $(word 2,$(MAKECMDGOALS)),$(word 2,$(MAKECMDGOALS)),)

# Build the output filename pattern with timestamp and optional session name
OUTPUT_FILE = $(AUDIO_PREFIX)_$(TIMESTAMP)$(if $(SESSION_NAME),_$(SESSION_NAME),)_%03d.$(AUDIO_FORMAT)

# Phonetic targets
.PHONY: help record record-mono record-stereo record-hq record-custom list clean list-devices

# Catch-all target for session names (prevents "nothing to be done" errors)
%:
	@:

help:
	@echo "Audio Recorder Makefile - SoX Recording Commands"
	@echo ""
	@echo "Available targets:"
	@echo "  make record              - Record with default settings (16kHz, mono)"
	@echo "  make record-mono         - Record in mono (1 channel, 16kHz)"
	@echo "  make record-stereo       - Record in stereo (2 channels, 16kHz)"
	@echo "  make record-hq           - Record in high quality (44.1kHz, stereo)"
	@echo "  make record-custom       - Record with custom parameters (set via vars)"
	@echo "  make list-devices        - List all available audio devices"
	@echo "  make list                - List all recorded audio files"
	@echo "  make clean               - Delete all recorded audio files"
	@echo ""
	@echo "Device selection:"
	@echo "  make list-devices        - Show card and device numbers"
	@echo "  AUDIO_DEVICE=CARD:DEV    - Use specific device (e.g., 1:0 for USB mic)"
	@echo ""
	@echo "Parameter customization:"
	@echo "  AUDIO_PREFIX=name        - Output filename prefix (default: audio)"
	@echo "  AUDIO_DEVICE=CARD:DEV    - Recording device (default: system default)"
	@echo "  GAIN=dB                  - Volume gain in dB (default: 0, -6 to +6 typical)"
	@echo "  RATE=hz                  - Sample rate in Hz (default: 16000)"
	@echo "  CHANNELS=n               - Number of channels 1=mono, 2=stereo (default: 1)"
	@echo "  SILENCE_DURATION=sec     - Time before silence triggers (default: 1)"
	@echo "  SILENCE_THRESHOLD=pct    - Silence level threshold (default: 1%)"
	@echo "  SILENCE_END_DURATION=sec - Duration of silence to end recording (default: 2.0)"
	@echo "  SILENCE_END_THRESHOLD=pct- Silence end level (default: 1%)"
	@echo ""
	@echo "Examples:"
	@echo "  make record                          - Record with default settings"
	@echo "  make record project                  - Record with session name 'project'"
	@echo "  make record-hq interview             - High quality with session name"
	@echo "  make record myrecording GAIN=+3 AUDIO_DEVICE=1:0"
	@echo "  make clean                           - Delete all audio files"
	@echo ""
	@echo "Note: Filenames include date and time stamp (MM-DD_HHMM)"
	@echo "  Example: rec_03-18_1027_project_001.wav"
	@echo "  Without session name: rec_03-18_1027_001.wav"

record: RATE = 16000
record: CHANNELS = 1
record: GAIN = 0
record: _do_record

record-mono: RATE = 16000
record-mono: CHANNELS = 1
record-mono: GAIN = 0
record-mono: _do_record

record-stereo: RATE = 16000
record-stereo: CHANNELS = 2
record-stereo: GAIN = 0
record-stereo: _do_record

record-hq: RATE = 44100
record-hq: CHANNELS = 2
record-hq: GAIN = 0
record-hq: _do_record

record-custom: _do_record

_do_record:
	@echo "Starting audio recording..."
	@echo "  Device: $(if $(AUDIO_DEVICE),card $(word 1,$(subst :, ,$(AUDIO_DEVICE))) device $(word 2,$(subst :, ,$(AUDIO_DEVICE))),system default)"
	@echo "  File prefix: $(AUDIO_PREFIX)"
	@echo "  Sample rate: $(RATE) Hz"
	@echo "  Channels: $(CHANNELS)"
	@echo "  Gain: $(GAIN) dB"
	@echo "  Silence detection: $(SILENCE_DURATION)s @ $(SILENCE_THRESHOLD)"
	@echo "  Silence end: $(SILENCE_END_DURATION)s @ $(SILENCE_END_THRESHOLD)"
	@echo ""
	@echo "Recording... Press Ctrl+C to stop"
	@echo ""
	rec $(DEVICE_FLAG) -r $(RATE) -c $(CHANNELS) -b 16 $(OUTPUT_FILE) gain $(GAIN) silence $(SILENCE_DURATION) 0.1 $(SILENCE_THRESHOLD) $(SILENCE_END_DURATION) 2.0 $(SILENCE_END_THRESHOLD) : newfile : restart

list-devices:
	@echo "Available audio input devices:"
	@arecord -l

list:
	@echo "Recorded audio files:"
	@ls -lh *.$(AUDIO_FORMAT) 2>/dev/null || echo "No audio files found"

clean:
	@echo "Warning: This will delete all .$(AUDIO_FORMAT) files in the current directory"
	@printf "Are you sure? (Y/n) " && read REPLY && \
	if [ -z "$$REPLY" ] || [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		rm -f *.$(AUDIO_FORMAT); \
		echo "Deleted all .$(AUDIO_FORMAT) files"; \
	else \
		echo "Cancelled"; \
	fi

.DEFAULT_GOAL := help
