import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

const TEMPLATES: Record<string, { filename: string; description: string; content: string }> = {
  editorconfig: {
    filename: '.editorconfig',
    description: 'EditorConfig for consistent coding styles',
    content: `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
`,
  },

  prettierrc: {
    filename: '.prettierrc',
    description: 'Prettier configuration for code formatting',
    content: JSON.stringify(
      {
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        bracketSpacing: true,
        arrowParens: 'always',
        endOfLine: 'lf',
      },
      null,
      2,
    ) + '\n',
  },

  eslintrc: {
    filename: '.eslintrc.json',
    description: 'ESLint configuration for linting JS/TS',
    content: JSON.stringify(
      {
        env: {
          node: true,
          es2022: true,
        },
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
        rules: {
          'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
          'no-console': 'warn',
          eqeqeq: 'error',
          curly: 'error',
          'prefer-const': 'error',
        },
      },
      null,
      2,
    ) + '\n',
  },

  npmrc: {
    filename: '.npmrc',
    description: 'npm configuration',
    content: `engine-strict=true
save-exact=true
fund=false
audit-level=moderate
`,
  },

  nvmrc: {
    filename: '.nvmrc',
    description: 'Node.js version specification',
    content: `20
`,
  },

  dockerignore: {
    filename: '.dockerignore',
    description: 'Docker ignore patterns',
    content: `node_modules/
dist/
.git/
.gitignore
*.md
.env
.env.*
.DS_Store
coverage/
.nyc_output/
*.tgz
.npm/
`,
  },

  'env.example': {
    filename: '.env.example',
    description: 'Example environment variables',
    content: `# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Auth
JWT_SECRET=change-me-in-production

# Logging
LOG_LEVEL=info
`,
  },
};

const ALL_TEMPLATE_KEYS = Object.keys(TEMPLATES);

function writeTemplate(
  key: string,
  targetDir: string,
  force: boolean,
): { created: boolean; skipped: boolean; path: string } {
  const template = TEMPLATES[key];
  if (!template) {
    return { created: false, skipped: false, path: '' };
  }

  const fullPath = resolve(join(targetDir, template.filename));
  const dir = dirname(fullPath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  if (existsSync(fullPath) && !force) {
    return { created: false, skipped: true, path: fullPath };
  }

  writeFileSync(fullPath, template.content, 'utf-8');
  return { created: true, skipped: false, path: fullPath };
}

const program = new Command();

program
  .name('dotfile-gen-cli')
  .description('Generate common dotfiles from templates for modern JS/TS projects')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate dotfiles from built-in templates')
  .option('-t, --template <name>', 'template to generate (use "list" command to see options)')
  .option('-d, --dir <path>', 'target directory', '.')
  .option('--force', 'overwrite existing files', false)
  .option('--all', 'generate all common dotfiles', false)
  .action((options: { template?: string; dir: string; force: boolean; all: boolean }) => {
    const targetDir = resolve(options.dir);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const keys: string[] = options.all
      ? ALL_TEMPLATE_KEYS
      : options.template
        ? [options.template]
        : [];

    if (keys.length === 0) {
      console.log(
        chalk.yellow('No template specified. Use --template <name> or --all.'),
      );
      console.log(chalk.dim('Run "dotfile-gen-cli list" to see available templates.'));
      return;
    }

    console.log(chalk.bold('\nGenerating dotfiles...\n'));

    let created = 0;
    let skipped = 0;
    let invalid = 0;

    for (const key of keys) {
      if (!TEMPLATES[key]) {
        console.log(chalk.red(`  ✗ Unknown template: ${key}`));
        invalid++;
        continue;
      }

      const result = writeTemplate(key, targetDir, options.force);

      if (result.created) {
        console.log(
          chalk.green(`  ✓ Created ${TEMPLATES[key].filename}`) +
            chalk.dim(` → ${result.path}`),
        );
        created++;
      } else if (result.skipped) {
        console.log(
          chalk.yellow(`  ⊘ Skipped ${TEMPLATES[key].filename}`) +
            chalk.dim(' (already exists, use --force to overwrite)'),
        );
        skipped++;
      }
    }

    console.log(chalk.bold('\nDone! ') + chalk.dim(`${created} created, ${skipped} skipped, ${invalid} invalid\n`));
  });

program
  .command('list')
  .description('List available dotfile templates')
  .action(() => {
    console.log(chalk.bold('\nAvailable templates:\n'));

    for (const [key, template] of Object.entries(TEMPLATES)) {
      console.log(
        `  ${chalk.cyan(key.padEnd(16))} ${chalk.dim(template.filename.padEnd(20))} ${template.description}`,
      );
    }

    console.log(
      chalk.dim('\nUsage: dotfile-gen-cli generate --template <name>'),
    );
    console.log(
      chalk.dim('       dotfile-gen-cli generate --all\n'),
    );
  });

program.parse();
