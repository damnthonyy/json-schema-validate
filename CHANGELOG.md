# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

## [1.0.0] - 2026-06-05

### Added

- Initial release of `json-schema-validate`
- `validateSchema()` function for validating OpenAPI and JSON Schema specifications
- Integration with `swagger-parser` for structural validation:
  - Detection of broken `$ref` references
  - Detection of circular references
  - OpenAPI format validation
- Integration with Spectral for quality and best-practice validation:
  - OAS (OpenAPI Specification) compliance rules
  - Custom rules: `no-empty-description`, `no-missing-type`
  - Extensible ruleset via `rules/spectral.ruleset.yaml`
- Comprehensive error reporting with path, message, severity, and source
- Support for both CommonJS and ESM imports
- Full TypeScript support with generated type definitions

### Documentation

- `README.md` with installation and usage examples
