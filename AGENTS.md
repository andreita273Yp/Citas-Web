# citas-web — instrucciones del agente principal

## Estado observado del repositorio

Al crear este archivo no existen `package.json`, código fuente, rutas, estilos, tokens, pruebas ni documentación de diseño aprobada dentro de este repositorio. No hay evidencia para identificar React o Angular. Las HU y DoD compartidas en `../citas-api/docs/wiki/scrum/` tampoco están disponibles: solo existen directorios con archivos de reserva.

No elegir, inicializar, reemplazar ni reorganizar un framework por preferencia. Esperar la importación real desde Google AI Studio y detectar entonces el stack desde `package.json`, archivos de configuración, estructura de rutas, estilos y scripts existentes.

El worktree tiene una eliminación preexistente de `.env.example`; no restaurarla, abrirla ni inferir su contenido sin instrucción expresa.

## Fuentes y orden de consulta

Antes de un cambio funcional, leer:

1. `../PRD.md` y `../RESTRICCIONES_TECNICAS.md`.
2. La HU, criterios de aceptación y DoD aprobados en `../citas-api/docs/wiki/scrum/historias-de-usuario/`.
3. El diseño aprobado de Stitch/Google AI Studio y los artefactos de handoff disponibles.
4. `package.json`, configuración, rutas, estilos/tokens y componentes del frontend importado.
5. El contrato REST aprobado o, como contexto, `../citas-api/docs/wiki/llm-wiki/wiki/index.md`.

El PRD, los criterios aprobados y el diseño aprobado prevalecen sobre inferencias. Si falta HU/DoD, diseño aprobado, stack importado o contrato necesario, detener la implementación afectada y reportarlo al orquestador.

## Alcance de este agente

Este repositorio implementa exclusivamente el frontend TypeScript que exporte Google AI Studio: pantallas, componentes, formularios, estado de UI, autorización de rutas, accesibilidad, consumo REST, pruebas y build.

- No editar `../citas-api`.
- No añadir Express ni BFF.
- Consumir `citas-api` directamente por REST, mediante una URL configurable por environment.
- No implementar reglas de negocio como autoridad exclusiva en cliente: el backend valida disponibilidad, estados, autorización y transiciones.
- No mantener una LLM Wiki propia. La wiki global corresponde al orquestador; este agente puede consultarla, no modificarla salvo instrucción explícita del orquestador.

## Diseño y componentes

- El diseño aprobado de Stitch/AI Studio es la fuente de verdad visual.
- Antes de editar, identificar componentes, tokens, estilos, breakpoints, rutas y patrones ya importados.
- Reutilizar componentes y estilos correctos; reconciliar divergencias con el diseño aprobado sin rediseñar pantallas por preferencia.
- No crear pantallas o flujos fuera de las obligatorias en el PRD y la HU actual.
- Implementar semántica HTML, etiquetas asociadas, foco visible, navegación por teclado, mensajes de error accesibles y estados no dependientes solo de color.

## REST, sesión y seguridad del cliente

- Centralizar el acceso HTTP conforme a los patrones que traiga el stack importado; no dispersar URLs, headers ni transformación de errores en componentes.
- Usar únicamente la URL de API configurada por environment; no codificar hosts, tokens, secretos ni credenciales.
- Tratar access/refresh tokens conforme al contrato backend aprobado; no inventar almacenamiento, renovación o payloads antes de que existan.
- Proteger rutas por los roles y claims definidos por el contrato; las protecciones de UI mejoran experiencia, pero no sustituyen la autorización backend.
- Cuando el contrato REST sea insuficiente o cambie, no modificar `citas-api`: documentar endpoint, request/response, errores y pantallas afectadas para el orquestador cross-repo.

## Flujo de trabajo por HU

1. Leer HU, CA y DoD; identificar pantallas, rutas, componentes, servicios REST, roles y datos afectados.
2. Elaborar un plan antes de editar, incluyendo archivos, impacto visual y dependencia contractual.
3. Mapear explícitamente para cada flujo los estados `loading`, `empty`, `error`, `success` y `disabled`, incluidos reintentos cuando estén justificados.
4. Implementar el mínimo coherente sin rediseñar el resultado aprobado ni duplicar reglas del backend.
5. Ejecutar los scripts reales disponibles de build, typecheck, lint y pruebas; no inventar comandos si todavía no existe `package.json`.
6. Verificar comportamiento contra CA/DoD, autorización de rutas, accesibilidad y estados de UI.
7. Resumir evidencia, comandos ejecutados, resultados y elementos no verificados; escalar al orquestador cualquier cambio REST.

## Alcance funcional visible

El PRD exige, entre otras, pantallas de registro, login, recuperación/cambio de contraseña, perfil, disponibilidad, solicitud y detalle de citas, cancelación/reprogramación, dashboards de USER/PROFESSIONAL/ADMIN, agenda, gestión de bloques y CRUD administrativo de profesionales, especialidades, EPS y planes.

Representar en UI los estados y resultados definidos por el backend: aprobación automática de citas generales, solicitudes especializadas, rechazo con motivo, reprogramación pendiente, cancelación, agenda y cierre de atención. No inferir el catálogo definitivo de estados, endpoints, payloads, expiración de tokens o reglas de retención de slots.

## Git y verificación

`main` es estable y `develop` es trabajo. El repositorio observado solo tiene `main`; no crear ni alterar ramas sin una tarea que lo autorice. No reescribir historial para ocultar avance.

Cuando el frontend esté importado, respetar el gestor de paquetes y scripts existentes. Declarar expresamente cualquier validación que no pueda ejecutarse por ausencia de proyecto, dependencias, backend o contrato REST.
