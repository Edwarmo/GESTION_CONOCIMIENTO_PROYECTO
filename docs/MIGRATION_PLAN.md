# Plan de Migración: Clean Architecture para SGPMI/Feelback

## 1. Diagnóstico y Justificación Arquitectónica

### Desafíos Actuales

| Problema | Impacto | Solución CA |
|----------|---------|-------------|
| Capa `lib/` mezclada (dominio+infra) | Acoplamiento | Separación en `core/` e `infrastructure/` |
| API routes con lógica de negocio | Difícil testing | Use-cases en `core/use-cases/` |
| Repositorios sin interfaces | Violación DIP | Interfaces en `core/repositories/` |
| Validación en componentes | Duplicación | Validadores en `core/validators/` |
| Sin sistema DI | Hard-coded deps | DIContainer en `infrastructure/di/` |
| Sin tipos de errores centralizados | Manejo inconsistente | Errores en `core/errors/` |

### Beneficios a Largo Plazo

- **Testabilidad**: mockear repositorios sin implementar concreto
- **Mantenibilidad**: cambiar BBDD sin tocar dominio
- **Escalabilidad**: nuevos features en `use-cases/` sin tocar UI
- **Reusabilidad**: use-cases reutilizables en CLI/API/Workers

---

## 2. Estructura Objetivo

```
src/
├── core/
│   ├── errors/                # Errores de dominio tipados
│   ├── entities/             # Entidades agnósticas (User, Order, Product, Person)
│   ├── repositories/        # Interfaces (IUserRepository, IOrderRepository, etc.)
│   ├── validators/         # Reglas de negocio
│   └── use-cases/         # Casos de uso (RegisterUser, CreateOrder, etc.)
│
├── infrastructure/
│   ├── adapters/
│   │   ├── repositories/  # Implementaciones concretas
│   │   │   ├── PrismaUserRepository.js
│   │   │   ├── PrismaOrderRepository.js
│   │   │   ├── GoogleSheetsOrderAdapter.js
│   │   │   └── GoogleSheetsUserAdapter.js
│   │   └── auth/         # Adaptadores de auth
│   │       └── NextAuthAdapter.js
│   ├── external-services/
│   │   ├── google-sheets/
│   │   │   ├── SheetsHttpClient.js
│   │   │   └── SheetsMapper.js
│   │   └── whatsapp/
│   │       └── WhatsAppClient.js
│   ├── di/                # Contenedor de dependencias
│   └── utils/            # Logger, helpers
│
├── components/
│   ├── ui/               # Componentes genéricos (Toast, VideoBackground)
│   └── application/       # Componentes de negocio (FormComponent → OrderForm)
│
└── app/                     # Next.js App Router (adaptadores de entrada)
    ├── api/
    │   ├── orders/route.js     # → CreateOrderUseCase
    │   ├── auth/register/      # → RegisterUserUseCase
    │   └── persons/          # → RegisterPersonUseCase
    ├── login/page.js
    └── page.js
```

---

## 3. Plan de Migración por Fases

### Fase 1: Preparación (30 min)
- [ ] Crear carpeta `src/`
- [ ] Configurar alias `@core`, `@infrastructure`, `@components` en `jsconfig.json`
- [ ] Crear DIContainer base
- [ ] Crear sistema de errores centralizado

### Fase 2: Capa Core (2-3 hrs)
- [ ] Definir entidades en `src/core/entities/`
- [ ] Crear interfaces en `src/core/repositories/`
- [ ] Implementar use-cases en `src/core/use-cases/`
- [ ] Mover validadores a `src/core/validators/`

### Fase 3: Infraestructura (2-3 hrs)
- [ ] Implementar adaptadores de repositorio
- [ ] Refactorizar Google Sheets client
- [ ] Crear WhatsApp client
- [ ] Wire DIContainer con implementaciones

### Fase 4: Presentación (1-2 hrs)
- [ ] Refactorizar API routes como adaptadores
- [ ] Reorganizar components/
- [ ] Agregar consentimiento Ley 1581

### Fase 5: Testing (1 hr)
- [ ] Tests unitarios core/
- [ ] Tests integración infrastructure/

---

## 4. Consideraciones Técnicas

### Manejo de Errores
```js
// src/core/errors/DomainError.js
class DomainError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
```

### Inyección de Dependencias
```js
// DIContainer registra factories
container.register('IUserRepository', PrismaUserRepository);
container.register('IOrderRepository', GoogleSheetsOrderAdapter);
```

### Validación en Capas
- **Adaptadores** (`app/api/`): validan formato de entrada
- **Core validators**: reglas de negocio
- **Repositories**: constraints de BD

---

## 5. Recomendaciones a Largo Plazo

1. **Documentación**: `docs/architecture.md` actualizado con cada commit
2. **CI/CD**: lint → test → build pipeline
3. **Code Reviews**: checklist de adherencia a capas
4. **Monitoreo**: logging estruturado con correlation IDs