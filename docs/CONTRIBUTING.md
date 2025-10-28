# Contributing to Modularisan

Thank you for considering contributing to Modularisan! 🎉

## Development Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/modularisan.git
cd modularisan
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the project**
```bash
npm run build
```

4. **Link for local testing**
```bash
npm link
```

## Development Workflow

1. Create a branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Run tests: `npm test`
4. Run linting: `npm run lint:fix`
5. Format code: `npm run format`
6. Commit: `git commit -m 'feat: add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

## Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Code Style

- Use TypeScript
- Follow ESLint rules
- Use Prettier for formatting
- Write tests for new features
- Update documentation

## Pull Request Process

1. Update README.md with details of changes if needed
2. Update CHANGELOG.md following Keep a Changelog format
3. Ensure all tests pass
4. Request review from maintainers

## Questions?

Feel free to open an issue for discussion!
