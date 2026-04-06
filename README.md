# dotfile-gen-cli

Generate common dotfiles (`.editorconfig`, `.prettierrc`, `.eslintrc`, `.npmrc`, and more) from sensible templates for modern JavaScript/TypeScript projects.

## Installation

```bash
npm install -g dotfile-gen-cli
```

Or use with npx:

```bash
npx dotfile-gen-cli generate --all
```

## Usage

### List available templates

```bash
dotfile-gen-cli list
```

Available templates:
- `editorconfig` - `.editorconfig` for consistent coding styles
- `prettierrc` - `.prettierrc` for code formatting
- `eslintrc` - `.eslintrc.json` for linting JS/TS
- `npmrc` - `.npmrc` for npm configuration
- `nvmrc` - `.nvmrc` for Node.js version specification
- `dockerignore` - `.dockerignore` for Docker ignore patterns
- `env.example` - `.env.example` with common environment variables

### Generate a specific dotfile

```bash
dotfile-gen-cli generate --template prettierrc
```

### Generate all dotfiles

```bash
dotfile-gen-cli generate --all
```

### Generate into a specific directory

```bash
dotfile-gen-cli generate --all --dir ./my-project
```

### Overwrite existing files

```bash
dotfile-gen-cli generate --template eslintrc --force
```

## Options

| Option | Description |
|---|---|
| `-t, --template <name>` | Which dotfile template to generate |
| `-d, --dir <path>` | Target directory (default: current directory) |
| `--force` | Overwrite existing files |
| `--all` | Generate all available dotfiles |

## License

MIT
