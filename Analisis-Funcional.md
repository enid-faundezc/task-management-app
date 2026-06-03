# Historia de Usuario: Gestión Integral de Tareas:

1. Como usuario autenticado del sistema, quiero crear, asignar, ejecutar y monitorear tareas, para organizar el trabajo y dar seguimiento a las actividades del equipo.

2. Objetivo del Producto: Construir una aplicación web que permita administrar tareas de trabajo similares a Jira, con: Gestión del ciclo de vida de las tareas, asignación de responsables, priorización, historial de cambios, Auditoría, Autenticación y autorización mediante Keycloak y API documentada mediante OpenAPI/Swagger.

## Actores
	(1) Usuario, puede:
	- Crear tareas.
	- Visualizar tareas.
	- Modificar tareas permitidas.
	- Agregar comentarios.
	- Cambiar estado de tareas asignadas.

	(2) Administrador / Líder: Además puede:
	- Asignar tareas.
	- Reasignar tareas.
	- Cambiar prioridades.
	- Visualizar historial completo.

## Modelo Funcional
	Entidad Principal: "Task"
	Campo			Requerido
	id				Sí
	title			Sí
	description		Sí
	priority		Sí
	status			Sí
	observations	No
	dueDate			No
	assignedUserId	No
	createdAt		Sí
	updatedAt		Sí

	Prioridades (NOTA: Valor por defecto: MEDIUM)
	===================================
	LOW
	MEDIUM
	HIGH
	CRITICAL

	Estados
	===================================
	CREATED
	ASSIGNED
	IN_PROGRESS
	STOPPED
	COMPLETED

# Requerimientos Funcionales:

## RF-01 Crear Tarea
	Descripción: Permitir registrar una nueva tarea.

	Campos requeridos:
	-Title
	-Description

	Campos opcionales:
	-Priority
	-DueDate
	-AssignedUserId
	-Observations

	# Reglas
	# RN-01 
	-Title obligatorio.
	-Min: 5
	-Max: 200

	# RN-02
	- Description obligatoria.
	-Min: 10
	-Max: 500

	# RN-03
	-Si no se informa prioridad: MEDIUM

	# RN-04 : 
	- Si existe AssignedUserId: Status = ASSIGNED

	# RN-05: 
	- Si no existe AssignedUserId: Status = CREATED

	# RN-06: 
	- Debe generarse automáticamente un evento: CREATED en el historial.

## RF-02 Listar Tareas
	Descripción: Permitir visualizar tareas registradas.
	Datos mostrados:
	- Título
	- Estado
	- Prioridad
	- Responsable
	- Fecha creación
	- Fecha compromiso

	Ordenamiento Por defecto: CreatedAt DESC Paginación: Obligatoria.

	Parámetros: page, size

## RF-03 Filtrar Tareas
	Descripción : Permitir filtrar tareas.
	Filtros mínimos requeridos
	-(Exigidos por la prueba)
	-Estado
	-Filtros adicionales
	-Texto título
	-Prioridad
	-Responsable
	-Fecha compromiso

## RF-04 Consultar Detalle de Tarea
	Descripción
	-Visualizar información completa de una tarea.
	Incluye:
	-Datos generales
	-Comentarios
	-Historial

## RF-05 Asignar Tarea
	Descripción
	-Permitir asignar responsable.

	Reglas
	# RN-07
	- Solo tareas: CREATED, ASSIGNED pueden asignarse.

	# RN-08
	- Generar evento: ASSIGNED o REASSIGNED

	# RN-09
	- Una tarea COMPLETED no puede asignarse.

## RF-06 Iniciar Tarea
	Descripción
	- Cambiar estado a: IN_PROGRESS

	# Reglas
	RN-10
	- Solo tareas ASSIGNED pueden iniciarse.

## RF-07 Detener Tarea
	Descripción
	- Cambiar estado a: STOPPED

	# Reglas
	RN-11
	- Solo tareas IN_PROGRESS pueden detenerse.

## RF-08 Reanudar Tarea
	Descripción
	Cambiar estado a: IN_PROGRESS

	Reglas
	# RN-12
	- Solo tareas STOPPED pueden reanudarse.

## RF-09 Completar Tarea
	Descripción
	Marcar tarea como finalizada.
	✔ Marcar tarea como completada

	# Reglas
	# RN-13
	- Solo tareas: IN_PROGRESS, pueden completarse.

	# RN-14
	Debe registrarse evento:
	STATUS_CHANGED

	# RN-15
	- COMPLETED es estado terminal.

## RF-10 Cambiar Prioridad
	Descripción
	-Modificar prioridad de la tarea.

	# Reglas
	# RN-16
	-No se permite cambiar prioridad si: COMPLETED

	# RN-17
	-Registrar evento: PRIORITY_CHANGED

## RF-11 Agregar Comentario
	Descripción: Permitir agregar comentarios.

	# Reglas
	# RN-18
	- Registrar evento: COMMENT_ADDED

## RF-12 Consultar Historial
	Descripción
	- Visualizar trazabilidad completa.
	- Eventos:
		CREATED
		ASSIGNED
		REASSIGNED
		STATUS_CHANGED
		PRIORITY_CHANGED
		COMMENT_ADDED

# Requerimientos No Funcionales
## RNF-01 Seguridad
	Autenticación mediante: Keycloak

## RNF-02 Autorización:
	JWT validado en backend.

## RNF-03 Auditoría
	Todos los cambios relevantes deben registrarse.

## RNF-04 API
	Documentación OpenAPI. Swagger disponible en:
	/api/docs

## RNF-05 Persistencia
	Base de datos: PostgreSQL

## RNF-06 Contenedorización
	Uso de: Docker y orquestación local mediante:
	Kubernetes (opcional para la demo).

# Alcance del Frontend:
	- Listar tareas
	- Crear tareas
	- Marcar tareas como completadas
	- Filtrar tareas por estado
	- Dashboard de tareas
	- Paginación.
	- Búsqueda por título.
	- Filtro por prioridad.
	- Ordenamiento.
	- Detalle de tarea
	- Historial.
	- Comentarios.
	- Datos completos.
	- Seguridad
	- Login mediante Keycloak.
	- Logout.
	- Protección de rutas.

# HISTORIA TÉCNICA
Se tienen las siguientes lineamientos técnicos considerados:

## Backend
	---------
	Create Task
	List Tasks
	Filter Tasks
	Complete Task
	Task History
	JWT Validation
	Swagger

## Frontend
---------
	Login Keycloak
	List Tasks
	Create Task
	Complete Task
	Filter by Status
	Pagination
	Search by Title

## Infraestructura
---------
	PostgreSQL
	Keycloak
	Docker
	Docker Compose
	OpenAPI

# Diagrama Principal de Estados
	┌─────────────┐
	│   CREATED   │
	└──────┬──────┘
		   │
		Assign Task
	       │
		   ▼
	┌─────────────┐
	│  ASSIGNED   │◄──────────────┐
	└──────┬──────┘               │
		   │                      │
	   Start Task                 │
		   │                      │
	   	   ▼                      │
	┌─────────────┐               │
	│ IN_PROGRESS │               │
	└──────┬───┬──┘               │
	  	   │   │                  │
	Stop   │   │ Complete         │
		   │   │                  │
		   ▼   ▼                  │
	┌─────────────┐               │
	│   STOPPED   │               │
	└──────┬──────┘               │
	  	   │                      │
	 Resume Task                  │
		   │                      │
		   └──────────────────────┘
		   ▼
	┌─────────────┐
	│ COMPLETED   │
	└─────────────┘
	
## Estados Terminales Una vez completada:
	┌─────────────┐
	│ COMPLETED   │
	└─────────────┘
	No permite:
	❌ Assign
	❌ Reassign
	❌ Start
	❌ Stop
	❌ Resume
	❌ Complete nuevamente	

## Matriz de Transiciones Permitidas
	Estado Actual			Acción		Estado Destino
	CREATED					Assign		ASSIGNED
	ASSIGNED				Reassign	ASSIGNED
	ASSIGNED				Start		IN_PROGRESS
	IN_PROGRESS				Stop		STOPPED
	STOPPED					Resume		IN_PROGRESS
	IN_PROGRESS				Complete	COMPLETED

## Matriz de Transiciones Prohibidas
	Estado Actual	Acción
	CREATED			Start
	CREATED			Complete
	CREATED			Stop
	ASSIGNED		Complete
	ASSIGNED		Stop
	STOPPED			Complete
	COMPLETED		Cualquier acción

## Diagrama de Prioridad: La prioridad es independiente del estado.
	   LOW
		▲
		│
	  MEDIUM
		▲
		│
	   HIGH
		▲
		│
	  CRITICAL

## Reglas:
	LOW       -> HIGH        ✔
	HIGH      -> LOW         ✔
	CRITICAL  -> MEDIUM      ✔
	COMPLETED -> Cambio prioridad ❌

## Diagrama de Asignación: 
	NOTA: Cada cambio genera: TaskHistoryEventType: ASSIGNED, REASSIGNED

	CREATED
		│ Assign(UserA)
		▼
	ASSIGNED(UserA)
		│ Reassign(UserB)
		▼
	ASSIGNED(UserB)
		│ Reassign(UserC)
		▼
	ASSIGNED(UserC)

## Diagrama de Historial
	Create Task
			│
			▼
	[CREATED]

	Assign User
			│
			▼
	[ASSIGNED]

	Start Task
			│
			▼
	[STATUS_CHANGED]

	Add Comment
			│
			▼
	[COMMENT_ADDED]

	Change Priority
			│
			▼
	[PRIORITY_CHANGED]

	Complete Task
			│
			▼
	[STATUS_CHANGED]

## DDD del Aggregate
	┌───────────────────────────────┐
	│         Task Aggregate        │
	├───────────────────────────────┤
	│ Task                          │
	│                               │
	│ - id                          │
	│ - title                       │
	│ - description                 │
	│ - priority                    │
	│ - status                      │
	│ - createdByUserId             │
	│ - assignedUserId              │
	│ - observations                │
	│                               │
	│ Behaviors                     │
	│                               │
	│ + assign()                    │
	│ + start()                     │
	│ + stop()                      │
	│ + resume()                    │
	│ + complete()                  │
	│ + changePriority()            │
	│ + addComment()                │
	│                               │
	├───────────────────────────────┤
	│ TaskHistory[]                 │
	└───────────────────────────────┘

	NOTA: Cada método:
	-valida el estado actual
	-modifica la entidad
	-genera un evento de historial

## Modelo Relacional:
	┌───────────────────────┐
	│ TASK                  │
	├───────────────────────┤
	│ id PK                 │
	│ title                 │
	│ description           │
	│ priority              │
	│ status                │
	│ observations          │
	│ due_date              │
	│ createdByUserId       │
	│ assigned_user_id      │
	│ created_at            │
	│ updated_at            │
	└───────┬───────────────┘
			│ 1
			│
			│
			│ N
	┌──────────▼────────────┐
	│ TASK_HISTORY          │
	├───────────────────────┤
	│ id PK                 │
	│ task_id FK            │
	│ event_type            │
	│ previous_value        │
	│ new_value             │
	│ comment               │
	│ user_id               │
	│ created_at            │
	└───────────────────────┘

# Infraestructura:
## Ingeniería de la infra:
	Persistencia: BD Postgres.
	Identity Provider: Keycloak

## Backend:
Ingeniería del SW: 

	- Se propone un backend en NestJS, porque provee DI nativo, Guards, JWT, módulos, testing y CQRS package opcional; porque es un framework moderno ampliamente usado en desarrollo con NODE y además se parece mucho a Spring Boot (Principalmente soy developer senior java spring boot); para su arquitectura interna propongo DDD, hexágonal y clean architecture, esto porque son patrones de diseño recomendados para microservicios y además, porque permiten separar la lógica del negocio (DDD) y la infraestructura (BD, colas Kafka, etc), permitiendo un desarrollo desacoplado y más adaptable a cambios de infra o de lógica sin significar un impacto mayor.

	- Persistencia: BD PostgreSQL porque se puede dockerizar fácilmente, relacional y que soporta migración.

	- ORM: Se propone Prisma por ser similar a Hibernate y liviano, entre otras carácteristicas es que es Type Safety, soporta migraciones y es cliente tipado.

	- Seguridad: JWT con KeyCloak.
	- Resciliencia: Para que sea similar al usado en Java (Rescilence4J) se usará: Retry y opossum para el patrón Circuit Breaker.
	- Observabilidad: Se propone Pino para el log y OpenTelemetry para centralizar los logs.
	- Se usará Command Pattern por.. 
	- JWT con Keycloak 
	- Validación con class-validator
	- Pino Logger

## Estructura del proyecto:
	backend
	├── src
	│   ├── domain
	│   │   ├── task
	│   │   │   ├── entities
	│   │   │   ├── repositories
	│   │   │   ├── value-objects
	│   │   │   └── events
	│   ├── application
	│   │   ├── commands
	│   │   ├── queries
	│   │   ├── handlers
	│   │   └── dto
	│   ├── infrastructure
	│   │   ├── database
	│   │   ├── repositories
	│   │   ├── security
	│   │   └── config
	│   ├── interfaces
	│   │   ├── controllers
	│   │   ├── middleware
	│   │   └── routes
	│   └── shared
	│       ├── errors
	│       ├── logger
	│       └── utils


# FrontEnd:
## Ingeniería de la solución:
	- El front será React + TypeScript.
	- Estado global: Se usará Zustand en lugar de Redux por ser más simple y que es ampliamente usado en aplicaciones productivas entre 2025 y 2026.
	- Se usarán Hooks como useMemo, useCallback y memo para evitar renderizados no necesarios.
	- Se usará TanStack Query en vez de React Query; esto es para gestionar, sincronizar y almacenar en caché el estado de los datos provenientes del servidor (APIs) en aplicaciones React, evitando escribir código complejo de carga, reintentos o almacenamiento manual.

	NOTA: En lugar de depender de herramientas de estado global (como Redux o React Context) para guardar datos de APIs, TanStack Query se enfoca exclusivamente en el estado asíncrono, ofreciendo estas ventajas:Caché inteligente: Almacena los resultados y los reutiliza, reduciendo el número de peticiones innecesarias al servidor.Actualizaciones en segundo plano: Revalida y actualiza los datos de forma silenciosa e invisible para el usuario.Gestión de estados: Proporciona variables automáticas de isPending (cargando) e isError (error) para controlar la interfaz de usuario fácilmente.Sincronización: Actualiza automáticamente los datos si el usuario cambia de pestaña y regresa, o si pierde y recupera la conexión a internet.

## Estructura del front:
	src
	├── app
	├── features
	│   ├── auth
	│   └── tasks
	├── pages
	├── shared
	├── hooks
	├── services
	├── store
	└── components
