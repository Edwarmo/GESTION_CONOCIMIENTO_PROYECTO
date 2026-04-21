# Fase 1: Clean Architecture - SGPMI/Feelback

## ✅ Implementación Completada

### Estructura de Archivos Creados

```
PROYECTO/
├── core/                                    # Capa de Dominio
│   ├── entities/
│   │   └── Order.ts                        # Entidad con lógica de negocio
│   ├── errors/
│   │   ├── DomainError.ts                  # Clase base de errores
│   │   └── ValidationError.ts              # Errores de validación
│   ├── validators/
│   │   ├── PhoneValidator.ts               # Validación teléfonos Colombia
│   │   └── ConsentValidator.ts             # Validación Ley 1581
│   ├── use-cases/
│   │   └── CreateOrder.ts                  # Caso de uso principal
│   └── repositories/
│       └── interfaces/
│           └── IOrderRepository.ts         # Contrato de persistencia
│
├── lib/
│   ├── config.ts                           # Configuración centralizada
│   ├── hooks/
│   │   └── useOrderForm.ts                 # Hook de formulario
│   └── infrastructure/                     # Capa de Infraestructura
│       ├── InfrastructureError.ts          # Errores de infraestructura
│       ├── google-sheets/
│       │   └── GoogleSheetsClient.ts       # Cliente HTTP desacoplado
│       ├── repositories/
│       │   ├── PrismaOrderRepository.ts    # Implementación Prisma
│       │   └── GoogleSheetsRepository.ts   # Implementación Sheets
│       └── di/
│           └── DIContainer.ts              # Inyección de dependencias
│
└── app/
    └── api/
        └── orders/
            └── route.js                    # API Route refactorizada
```

---

## 🎯 Características Implementadas

### 1. Capa de Dominio (Core)

#### Entidad Order
- ✅ Factory methods: `create()` y `fromPersistence()`
- ✅ Propiedades inmutables con `Object.freeze()`
- ✅ Lógica de negocio: `confirm()`, `deliver()`, `cancel()`
- ✅ Serialización: `toJSON()` y `toSheetRow()`
- ✅ Enum `OrderStatus` con 4 estados

#### Validadores
- ✅ **PhoneValidator**: Regex + prefijos móviles colombianos
- ✅ **ConsentValidator**: Cumplimiento Ley 1581/2012
- ✅ Métodos: `validate()`, `sanitize()`, `isValid()`

#### Caso de Uso CreateOrder
- ✅ Validación de entrada (nombre, teléfono, pedido, consentimiento)
- ✅ Sanitización de teléfono
- ✅ Verificación de historial del cliente
- ✅ Persistencia dual: Prisma + Google Sheets (asíncrona)
- ✅ Prevención XSS básica

#### Jerarquía de Errores
- ✅ `DomainError` (base)
- ✅ `ValidationError`, `ConsentRequiredError`, `InvalidPhoneError`
- ✅ `MissingFieldError`, `InvalidLengthError`

---

### 2. Capa de Infraestructura

#### GoogleSheetsClient
- ✅ Cliente HTTP puro con `fetch()`
- ✅ Timeout de 10 segundos con `AbortController`
- ✅ Métodos: `appendRows()`, `getRows()`, `healthCheck()`
- ✅ Manejo de errores con `ExternalServiceError`

#### PrismaOrderRepository
- ✅ Implementa `IOrderRepository`
- ✅ Métodos: `save()`, `findById()`, `findByCustomerPhone()`, `findAll()`
- ✅ Mapper: `toDomain()` para convertir Prisma → Entidad

#### GoogleSheetsRepository
- ✅ Solo maneja `exportToExternal()`
- ✅ Otros métodos lanzan error (no es fuente principal)

#### DIContainer (Singleton)
- ✅ Gestión de `PrismaClient` y `GoogleSheetsClient`
- ✅ Composite Repository Pattern (Prisma + Sheets)
- ✅ Factory methods para casos de uso
- ✅ Cleanup automático en shutdown (`beforeExit`, `SIGINT`, `SIGTERM`)

---

### 3. Capa de Presentación

#### API Route `/api/orders`
- ✅ Refactorizada a TypeScript
- ✅ Usa `DIContainer` para obtener `CreateOrder`
- ✅ Manejo centralizado de errores:
  - `DomainError` → HTTP 400 con código específico
  - `InfrastructureError` → HTTP 500
  - Error desconocido → HTTP 500
- ✅ Endpoint GET para consultar pedidos por teléfono

#### Hook useOrderForm
- ✅ Gestión de estado del formulario
- ✅ Método `updateField()` para actualizar campos
- ✅ Método `submitOrder()` con manejo de errores
- ✅ Método `reset()` para limpiar formulario
- ✅ Tipado estricto con TypeScript

---

## 🔧 Configuración

### Variables de Entorno Requeridas

Crea/actualiza `.env.local`:

```env
# Google Sheets
GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sgpmi

# WhatsApp (opcional)
NEXT_PUBLIC_ADMIN_PHONE=573001234567
```

### Alias de Importación

El archivo `jsconfig.json` ya está configurado con:

```json
{
  "@core/*": ["./core/*"],
  "@infrastructure/*": ["./lib/infrastructure/*"],
  "@components/*": ["./components/*"],
  "@lib/*": ["./lib/*"]
}
```

---

## 📝 Uso

### Ejemplo: Crear un Pedido

```typescript
import { container } from '@/lib/infrastructure/di/DIContainer';

const createOrderUseCase = container.getCreateOrderUseCase();

const result = await createOrderUseCase.execute({
  nombre: 'Juan Pérez',
  telefono: '3001234567',
  pedido: 'Pizza grande + Coca-Cola',
  consentimiento: true,
});

console.log(result.order.id); // UUID generado
console.log(result.isNewCustomer); // true/false
console.log(result.previousOrdersCount); // 0, 1, 2...
```

### Ejemplo: Usar el Hook en un Componente

```tsx
import { useOrderForm } from '@lib/hooks/useOrderForm';

export function OrderForm() {
  const { data, loading, error, updateField, submitOrder } = useOrderForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await submitOrder();
      console.log('Pedido creado:', result.order.id);
    } catch (err) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={data.nombre}
        onChange={(e) => updateField('nombre', e.target.value)}
      />
      {/* ... */}
    </form>
  );
}
```

---

## 🧪 Testing

### Pruebas Unitarias (Core)

```typescript
import { PhoneValidator } from '@core/validators/PhoneValidator';

describe('PhoneValidator', () => {
  it('valida teléfonos colombianos', () => {
    expect(() => PhoneValidator.validate('3001234567')).not.toThrow();
  });

  it('rechaza teléfonos inválidos', () => {
    expect(() => PhoneValidator.validate('123')).toThrow(InvalidPhoneError);
  });
});
```

---

## 🚀 Próximos Pasos (Fase 2)

1. **Migrar FormComponent.jsx** para usar `useOrderForm`
2. **Crear componentes UI** (Input, Textarea, Button) en `components/ui/`
3. **Implementar WhatsApp Business API** en `lib/infrastructure/whatsapp/`
4. **Agregar logging** con timestamps e IP
5. **Crear dashboard** de análisis en Google Sheets
6. **Implementar tests** con Vitest/Jest

---

## 📚 Principios Aplicados

- ✅ **SOLID**: Cada clase tiene una responsabilidad única
- ✅ **DDD**: Entidades con lógica de negocio encapsulada
- ✅ **Clean Architecture**: Dependencias apuntan hacia el dominio
- ✅ **Dependency Injection**: DIContainer gestiona instancias
- ✅ **Repository Pattern**: Abstracción de persistencia
- ✅ **Factory Pattern**: `Order.create()` y `Order.fromPersistence()`
- ✅ **Composite Pattern**: Repositorio que combina Prisma + Sheets

---

## ⚠️ Notas Importantes

1. **Prisma Schema**: Asegúrate de que el modelo `Order` en `prisma/schema.prisma` tenga los campos:
   - `id` (String, @id)
   - `customerName` (String)
   - `customerPhone` (String)
   - `details` (String)
   - `status` (String)
   - `consentGivenAt` (DateTime)
   - `createdAt` (DateTime)
   - `updatedAt` (DateTime)

2. **Google Apps Script**: El Web App debe aceptar POST con estructura:
   ```json
   {
     "action": "append",
     "spreadsheetId": "...",
     "rows": [{ "id": "...", "fecha": "...", ... }]
   }
   ```

3. **TypeScript**: Aunque el proyecto usa `.js`, los archivos nuevos están en `.ts` para aprovechar el tipado estricto.

---

## 🎉 Resultado

La arquitectura ahora está desacoplada, testeable y lista para escalar. El flujo de creación de pedidos sigue estos pasos:

1. **UI** → `useOrderForm.submitOrder()`
2. **API Route** → `container.getCreateOrderUseCase().execute()`
3. **Use Case** → Valida, crea entidad, persiste
4. **Repository** → Guarda en Prisma + exporta a Sheets (async)
5. **Response** → Retorna orden con metadata al cliente
