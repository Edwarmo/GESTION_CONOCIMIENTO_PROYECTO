# SGPMI Feelback

Plataforma de recepcion de pedidos por WhatsApp y gestion analitica para PyMEs.

## Tecnologias

- Next.js (Interface y rutas API)
- Prisma (Base de datos SQLite local)
- NextAuth (Autenticacion segura)
- Google Sheets y Apps Script (Panel de datos e inteligencia de negocios)

## Instalacion y Configuracion

1. Instalar las dependencias recomendadas del proyecto:
   npm install

2. Preparar la base de datos local:
   npx prisma db push
   npx prisma generate

3. Configurar el tablero externo de Google Sheets:
   - Crear un nuevo proyecto en la plataforma Google Apps Script
   - Copiar el codigo del archivo "docs/google-apps-script.gs" al editor online
   - Ejecutar la funcion "setupCompleto()" para crear las tablas automaticamente
   - Seleccionar la opcion Implementar como Aplicacion Web para cualquier persona
   - Copiar la URL final que muestra el sistema

4. Finalizar las credenciales locales:
   - Abrir el archivo ".env.local" en la raiz del proyecto
   - Indicar tu numero de WhatsApp receptor en NEXT_PUBLIC_ADMIN_PHONE
   - Pegar la URL de Apps Script en GOOGLE_SHEETS_ENDPOINT

5. Iniciar la aplicacion:
   npm run dev

El servicio estara listo en su navegador accediendo a localhost en el puerto 3000.

## Estructura Principal

- /app: Vistas principales, panel de inicio de sesion y subrutas
- /components: Formularios de envio y notificaciones emergentes
- /lib: Manejo de base de datos e integracion con Google Workspace
- /prisma: Modelos de informacion local de usuarios
- /docs: Funciones externas listas para desplegar
