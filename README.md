# citas-web

Cliente Angular 21 + TypeScript del sistema ficticio de citas. Consume `citas-api` directamente; no utiliza Express ni BFF.

## Ejecución reproducible

Desde la raíz del workspace, usa el contenedor Linux para no mezclar binarios nativos con `node_modules` de Windows:

```powershell
docker compose exec citas-web-dev npm ci
docker compose exec citas-web-dev npm run lint
docker compose exec citas-web-dev npx ng test --watch=false
docker compose exec citas-web-dev npm run build
docker compose exec citas-web-dev npm run start -- --host 0.0.0.0 --port 4200
```

**Hook pre-commit (S3 · V8):** se activa una vez por clon con `git config core.hooksPath .githooks`.

- **En cada commit:** bloquea secretos y archivos `.env`.
- **Si cambia código o configuración:** ejecuta en `citas-web-dev` lint, pruebas y build.
- **`HOOK_FULL=1 git commit …`:** fuerza todas las validaciones.

La API se configura exclusivamente con `src/environments/environment.ts`. No se requiere `GEMINI_API_KEY` para el cliente de citas.
