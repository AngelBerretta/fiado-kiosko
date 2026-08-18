# 🏪 Fiado

**Cuenta corriente de kiosco, gestionada por voz.**

Fiado es una aplicación web que reemplaza el cuaderno de fiado tradicional por una app simple: el kiosquero graba un audio corto contando qué se llevó el cliente y cuánto debe, y una inteligencia artificial transcribe, interpreta y registra el movimiento automáticamente.

Construido para resolver un problema real: en los kioscos de barrio, el fiado sigue anotándose en cuadernos que se rompen, se pierden hojas, o donde nadie recuerda bien quién pagó y quién no. Fiado digitaliza ese proceso sin agregar fricción — no hay formularios largos, no hay que tipear: solo hablar.

---

## 🎯 El problema

En un kiosco, el momento de anotar un fiado ocurre en medio de atender, cobrar y despachar a otros clientes. No hay tiempo ni manos libres para escribir bien en un cuaderno. Esto genera:

- Deudas mal anotadas o directamente no anotadas
- Imposibilidad de saber el total adeudado en un momento dado
- Ningún registro de cuánto tiempo hace que alguien no paga
- Pérdida de información si el cuaderno se rompe, moja o extravía

## 💡 La solución

Una app instalable (PWA) donde:

1. El kiosquero **graba un audio** diciendo lo que pasó: *"Roberto se llevó pan y fiambre, mil doscientos pesos"*
2. La IA **transcribe** el audio (Whisper) y **entiende la intención** (agregar deuda, registrar pago, o consultar saldo)
3. Se muestra una **pantalla de confirmación editable** antes de guardar nada
4. El movimiento queda registrado, con historial completo por cliente
5. Desde la pantalla principal se ve de un vistazo quién debe, cuánto, y hace cuánto — con un botón para mandar un recordatorio directo por WhatsApp

---

## ✨ Funcionalidades

- 🎙️ **Registro por voz** con transcripción e interpretación automática vía IA
- ✏️ **Confirmación editable** antes de guardar cualquier movimiento (nunca se guarda algo sin revisión)
- 🛡️ **Prevención de sobrepago**: si el pago supera la deuda, la app avisa antes de ajustar el saldo a $0
- 📱 **Botón de WhatsApp** para recordar deudas pendientes con un solo toque
- 📊 **Reportes** con ranking de mayores deudores y tendencia de deuda total en el tiempo (Recharts)
- 🏪 **Multi-kiosco**: cada kiosco tiene su propio código de acceso y sus propios datos, sin mezclarse con otros
- 📲 **PWA instalable**: se agrega a la pantalla de inicio del celular como una app nativa, con soporte offline básico

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Lenguaje | TypeScript |
| Base de datos | [Supabase](https://supabase.com) (PostgreSQL) |
| Transcripción de voz | Whisper Large v3 (vía [Groq](https://groq.com)) |
| Interpretación de lenguaje | `openai/gpt-oss-20b` (vía Groq) |
| Gráficos | [Recharts](https://recharts.org) |
| Estilos | CSS puro (variables custom, sin framework de UI) |
| Iconos | [Lucide React](https://lucide.dev) |
| PWA | Service Worker manual + Web App Manifest |

---

## 🚀 Cómo correrlo localmente

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/AngelBerretta/fiado-kiosko
cd fiado-kiosko
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz con:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
GROQ_API_KEY=tu-api-key-de-groq
```

- Conseguí las credenciales de Supabase en tu proyecto → **Settings → API**
- Conseguí tu API key de Groq en [console.groq.com](https://console.groq.com)

### 3. Configurar la base de datos

En el **SQL Editor** de tu proyecto de Supabase, correr en orden:

```bash
supabase/migration.sql     # crea las tablas kioscos, deudores, movimientos
supabase/seed_demo.sql     # (opcional) carga un kiosco de ejemplo con datos de prueba
```

### 4. Generar los íconos de la PWA (solo la primera vez)

```bash
npx pwa-asset-generator public/icon-source.svg public/icons --icon-only --favicon --padding "8%" --background "#1F3A93"
```

### 5. Correr en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Vas a ser redirigido a `/acceso` para crear un kiosco nuevo o ingresar con el kiosco demo.

> ⚠️ El Service Worker (PWA) no se comporta igual en modo desarrollo. Para probar la instalación real, correr:
> ```bash
> npm run build && npm run start
> ```

---

## 📂 Estructura del proyecto

```
src/
  app/
    acceso/          → pantalla de ingreso/creación de kiosco
    grabar/          → pantalla de registro por voz
    reportes/        → gráficos y estadísticas
    api/
      transcribir/   → envía el audio a Whisper (Groq)
      interpretar/   → interpreta el texto con IA (intención, nombre, monto)
      movimientos/   → crea deudas/pagos, valida sobrepagos
      saldo/         → calcula el saldo de un deudor puntual
      deudores/      → lista deudores con saldo por kiosco
      reportes/      → agrega datos para gráficos
      kioscos/       → crea y valida kioscos por slug
  components/        → UI reutilizable (grabador, confirmación, gráficos, etc.)
  lib/               → lógica de negocio (saldos, prompts, cliente Supabase, PWA)
```

---

## 🔐 Cómo funciona el multi-kiosco

No hay sistema de login tradicional. Cada kiosco tiene un **código de acceso único** (`slug_acceso`) que se guarda en `localStorage` del dispositivo. Todas las consultas a la base de datos filtran por ese código, así que los datos de un kiosco nunca se mezclan con los de otro. Es un enfoque simple, pensado para que un kiosquero pueda empezar a usar la app en segundos, sin crear usuarios ni contraseñas.

---

## 🧪 Probar la demo

Si corriste `seed_demo.sql`, podés entrar directamente con el código de acceso:

```
demo-jurado
```

Esto carga un kiosco con 8 clientes y ~2 meses de historial de movimientos, ideal para ver los reportes con datos reales sin tener que cargar nada a mano.

---

## 📄 Licencia

Proyecto desarrollado con fines educativos / de concurso. Libre para usar y modificar.

---

*Construido pensando en los kioscos de barrio que todavía confían en un cuaderno.*
```