![](https://img.shields.io/badge/Foundry-v12-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/jconabree/foundry-wled/module.zip)


# FoundryVTT Module - WLED Integration

This module integrates Foundry VTT with WLED to control real-world LEDs.

## Installation
In Foundry VTT's Insall Module interface, paste the following URL into the "Manifest URL" field at the bottom and click "Install"

```
https://github.com/jconabree/foundry-wled/releases/latest/download/module.zip
```

If you would like a specific version of this package, be sure to change `latest` to `tag/[VERSION]` instead.

## Development
```
npm install
npm run build:all
```
## Roadmap
- Future Release
  - Control general (segment 0) effects
  - Option to disable using WLED freeze/unfreeze
  - Typescript