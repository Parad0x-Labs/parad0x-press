# Parad0x Press

<p align="center">
  <img src="android/app/src/main/res/drawable/logo.png" width="200" alt="Parad0x Press Logo">
</p>

<p align="center">
  <b>Premium Media Compression for Solana Seeker</b><br>
  <i>NFT-Gated | 99% Quality | Up to 100x Compression</i>
</p>

---

## Features

- **Parad0x Labs Compression Engine**: Proprietary algorithms achieving up to 100x file size reduction.
- **Quality Preservation**: SSIM-gated encoding ensures 99%+ visual and audio fidelity.
- **Solana Seeker Exclusive**: Free for Seeker owners. NFT license required for other devices.
- **Atomic Safety**: Zero data loss guarantee. Originals are only replaced after verification.
- **Local-Only Privacy**: All compression happens on-device.

## Installation

### For Solana Seeker Owners
1. Download the latest APK from [Releases](https://github.com/Parad0x-Labs/parad0x-press/releases).
2. Enable "Install from Unknown Sources" if prompted.
3. Install and launch. The app will auto-detect your Seeker.

### For Other Android Devices
1. Download the APK.
2. Install and connect your Solana wallet.
3. Purchase a **Parad0x Golden Ticket** ($19.99) or receive an airdrop.

## Access Control

| Device | Access |
|--------|--------|
| Solana Seeker | Free |
| Other Android | Requires Golden Ticket NFT |

## Build from Source

```bash
git clone https://github.com/Parad0x-Labs/parad0x-press.git
cd parad0x-press
npm install
npx react-native run-android --mode=release
```

## Compression Modes

| Mode | Quality | Use Case |
|------|---------|----------|
| **Safe** | 99%+ (SSIM > 0.995) | Archival, Professional |
| **Balanced** | ~88% (SSIM > 0.990) | Social Media, Sharing |

## Supported Media

| Type | Formats | Engine |
|------|---------|--------|
| Images | JPEG, PNG, HEIC, WebP | Parad0x Labs Image Engine |
| Video | MP4, MOV, MKV, WebM | Parad0x Labs Video Engine |
| Audio | MP3, M4A, AAC, WAV, FLAC | Parad0x Labs Audio Engine |

## Architecture

```
┌─────────────────────────────────────┐
│         React Native UI             │
├─────────────────────────────────────┤
│     Native Modules (Kotlin)         │
│  ┌─────────────┐ ┌────────────────┐ │
│  │ ParadoxEngine│ │DreamscapeEngine│ │
│  │ (Compression)│ │ (Safety/Utils) │ │
│  └─────────────┘ └────────────────┘ │
├─────────────────────────────────────┤
│           FFmpeg Kit                │
└─────────────────────────────────────┘
```

## License

Proprietary. © 2026 Parad0x Labs. All rights reserved.

## Links

- **Website**: [parad0xlabs.com](https://parad0xlabs.com)
- **Twitter**: [@Parad0x_Labs](https://twitter.com/Parad0x_Labs)

---

<p align="center">
  Made with 💜 by <b>Parad0x Labs</b>
</p>

