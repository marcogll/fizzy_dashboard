<p align="center">
  <img src="https://raw.githubusercontent.com/marcogll/mg_data_storage/refs/heads/main/soul23/logo/soul23_logo.svg" width="110" alt="Fizzy Dashboard">
</p>

<h1 align="center">Fizzy Dashboard</h1>

<p align="center">
  Dashboard de gestión de proyectos y tracking de desempeño de personal.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-3a3a3a?style=flat-square&logo=nodedotjs&logoColor=green" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-3a3a3a?style=flat-square&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/JavaScript-3a3a3a?style=flat-square&logo=javascript&logoColor=yellow" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-3a3a3a?style=flat-square&logo=html5&logoColor=orange" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-3a3a3a?style=flat-square&logo=css3&logoColor=blue" alt="CSS3">
  <img src="https://img.shields.io/badge/Catppuccin-3a3a3a?style=flat-square&logo=catppuccin&logoColor=pink" alt="Catppuccin">
</p>

---

## Descripción

**Fizzy Dashboard** es una aplicación web interactiva que sirve como panel de control para la visualización de proyectos, tracking de tareas y métricas de desempeño de personal integradas con la API de Fizzy. Cuenta con una interfaz moderna basada en la paleta de colores de *Catppuccin* (soporta modos Mocha y Latte), filtros dinámicos, gráficos de barras personalizados y múltiples vistas (grilla, lista y tablero Kanban).

---

## Características Principales

- **Múltiples Vistas**: Grid, List y un tablero Kanban dinámico.
- **Buscador & Filtros Avanzados**: Filtrado en tiempo real por estado, personas (responsables), etiquetas (tags) y texto libre.
- **Métricas de Productividad**: Análisis en tiempo real de tasa de completitud, tareas activas, detenidas, atrasadas y velocidad de entrega.
- **Gráficos Integrados**: Visualización rápida de tareas por estado, prioridad, etiquetas top y gráfico de velocidad semanal.
- **Modo Oscuro / Claro**: Alternancia fluida entre los temas Latte y Mocha de Catppuccin.

---

## Requisitos Previos

- **Node.js** (v18 o superior recomendado)
- **NPM** (gestor de paquetes de Node)

---

## Despliegue Local

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <url-del-repositorio>
cd fizzy_dashboard
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
```env
FIZZY_TOKEN=tu_token_de_api_aquí
FIZZY_ACCOUNT=1
FIZZY_API_URL=https://fizzy.soul23.cloud/
FIZZY_BOARD=tu_id_de_tablero_aquí
PORT=3000
```

### 3. Iniciar la aplicación
Puedes correr el servidor en producción o modo desarrollo con recarga automática:

- **Modo Desarrollo (Recomendado)**:
  ```bash
  npm run dev
  ```
- **Modo Producción**:
  ```bash
  npm start
  ```

Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## Cómo Funciona la API de Backend

El backend está construido con **Express.js** y se encuentra implementado en `server.js`. Actúa como un middleware seguro que consume la API de Fizzy, procesa y normaliza los datos, y luego expone una serie de endpoints para el consumo del frontend.

### Endpoints Disponibles

#### 1. Estado del Servidor
- **Ruta**: `GET /api/health`
- **Descripción**: Endpoint de verificación de salud del servidor.
- **Respuesta**:
  ```json
  { "status": "ok" }
  ```

#### 2. Obtener Tarjetas
- **Ruta**: `GET /api/cards`
- **Descripción**: Intenta conectarse a varios endpoints válidos de la API de Fizzy utilizando las credenciales configuradas, normaliza las propiedades de cada tarjeta (unificando campos como `id`, `title`, `description`, `tags`, `priority`, `assignee`, etc.) y las devuelve en una lista homogénea.
- **Respuesta**: Array de objetos de tarjetas normalizadas.

#### 3. Resumen de Métricas
- **Ruta**: `GET /api/stats/summary`
- **Descripción**: Retorna un resumen general que incluye total de tarjetas, completadas (`Done`), activas, pausadas o detenidas (`Stopped`), atrasadas (`Overdue`) y el porcentaje de completitud.
- **Respuesta**:
  ```json
  {
    "summary": {
      "total": 20,
      "done": 5,
      "active": 4,
      "stopped": 1,
      "overdue": 2,
      "completionRate": 25.0
    }
  }
  ```

#### 4. Distribución por Estado
- **Ruta**: `GET /api/stats/by-status`
- **Descripción**: Cuenta cuántas tareas pertenecen a cada estado y calcula su porcentaje respecto al total, adjuntando la etiqueta y color representativo según la paleta de Catppuccin.
- **Respuesta**:
  ```json
  {
    "byStatus": [
      { "status": "inprogress", "label": "In progress", "count": 4, "percentage": 20, "color": "#89b4fa" },
      { "status": "done", "label": "Done", "count": 5, "percentage": 25, "color": "#a6e3a1" }
      // ...otros estados
    ]
  }
  ```

#### 5. Top 10 Etiquetas (Tags)
- **Ruta**: `GET /api/stats/by-tag`
- **Descripción**: Extrae todas las etiquetas asociadas a las tarjetas, contabiliza sus frecuencias y retorna el top 10 ordenado de mayor a menor.

#### 6. Tareas por Prioridad
- **Ruta**: `GET /api/stats/by-priority`
- **Descripción**: Retorna la cantidad de tareas clasificadas en prioridades: `high`, `medium`, `low` o `none`.

#### 7. Tareas Atrasadas
- **Ruta**: `GET /api/stats/overdue`
- **Descripción**: Devuelve un listado filtrado únicamente con las tarjetas que tienen fecha límite vencida (`due_date` menor a hoy) y cuyo estado no es `Done`.

#### 8. Rendimiento por Persona (Assignee)
- **Ruta**: `GET /api/stats/by-assignee`
- **Descripción**: Agrupa el total de tareas por responsable, desglosando cuántas están completadas, activas, atrasadas y su respectivo porcentaje de completitud, ordenado por volumen de tareas asignadas.

#### 9. Gráfico de Velocidad
- **Ruta**: `GET /api/stats/velocity`
- **Descripción**: Calcula la cantidad de tareas marcadas como `Done` completadas durante las últimas 4 semanas (con un rango semanal de lunes a domingo), ideal para mostrar la velocidad del equipo.

---

## Funciones del Motor de Estadísticas (`src/stats.js`)

El archivo `src/stats.js` contiene la lógica pura de procesamiento de datos encargada de estructurar las métricas de la API:

- **`computeSummary(cards)`**: Recorre las tarjetas para contar las totales, completadas (estado `done`), activas (`in progress`, `ongoing`), detenidas (`stopped`) y atrasadas, retornando tasas en formato numérico flotante preciso.
- **`computeByStatus(cards)`**: Mapea la lista fija de estados (`STATUS_LABELS`) y agrupa los conteos, asociando cada uno con los códigos hexadecimales del tema de color (`STATUS_COLORS`).
- **`computeByTag(cards)`**: Recorre de forma inteligente las etiquetas de las tarjetas (manejando tanto strings simples como objetos de etiquetas con propiedades como `name`) para armar un histograma de frecuencias.
- **`computeByPriority(cards)`**: Normaliza los valores de prioridad a minúsculas y clasifica las tarjetas incrementando el contador correspondiente.
- **`computeOverdue(cards)`**: Aplica el helper `isCardOverdue(card)` validando fechas límites sin incluir las tareas ya resueltas.
- **`computeByAssignee(cards)`**: Normaliza la información de los responsables asignados (manejando nombres planos o perfiles de usuario estructurados con avatar, email e ID) para agrupar las métricas individuales de cada colaborador.
- **`computeVelocity(cards)`**: Construye intervalos de tiempo semanales retrospectivos a partir del domingo más cercano y filtra las tareas finalizadas dentro de cada rango para medir el progreso semanal histórico.
