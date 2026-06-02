## Gestor de Tareas

## Infraestructura:
    # Ingeniería de la infra:
    - Persistencia: BD Postgres.
    - Identity Provider: Keycloak
    
## Backend:
    # Ingeniería del SW: 
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

    # Estructura del proyecto:
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


## FrontEnd:
    # Ingeniería de la solución:
    - El front será React + TypeScript.
    - Estado global: Se usará Zustand en lugar de Redux por ser más simple y que es ampliamente usado en aplicaciones productivas entre 2025 y 2026.
    - Se usarán Hooks como useMemo, useCallback y memo para evitar renderizados no necesarios.
    - Se usará TanStack Query en vez de React Query; esto es para gestionar, sincronizar y almacenar en caché el estado de los datos provenientes del servidor (APIs) en aplicaciones React, evitando escribir código complejo de carga, reintentos o almacenamiento manual.

    NOTA: En lugar de depender de herramientas de estado global (como Redux o React Context) para guardar datos de APIs, TanStack Query se enfoca exclusivamente en el estado asíncrono, ofreciendo estas ventajas:Caché inteligente: Almacena los resultados y los reutiliza, reduciendo el número de peticiones innecesarias al servidor.Actualizaciones en segundo plano: Revalida y actualiza los datos de forma silenciosa e invisible para el usuario.Gestión de estados: Proporciona variables automáticas de isPending (cargando) e isError (error) para controlar la interfaz de usuario fácilmente.Sincronización: Actualiza automáticamente los datos si el usuario cambia de pestaña y regresa, o si pierde y recupera la conexión a internet.

    # Estructura del front:
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

## Carga a GIT:
    # Subir todo a git...
	task-management-app> git init
	desde: task-management-app/
	- crear el .gitignore..
	git init
	git status
	git add .
	git commit -m "Push inicial"
	git remote add origin https://github.com/enid-faundezc/task-management-app.git
	git branch -M main
	git push -u origin main
	
    # A medida de subir cambios de avances:
	git status
	git add .
	git commit -m "Respaldo avance"
	git push origin main

## Levantar la aplicación y realizar pruebas.
    ## En directorio base "task-management-app" con términal, levantar docker previamente:
    cd infra
    docker compose up -d
    docker ps # Revisar servicios.

    ## Configurar keyCloack (Ejecutar todo en terminal), previamente revisar si carga bien: http://localhost:9090
 
	# 1. Obtener el token limpiamente en una variable
	$token = (Invoke-RestMethod -Uri "http://localhost:9090/realms/master/protocol/openid-connect/token" -Method Post -Body @{username="admin"; password="admin"; grant_type="password"; client_id="admin-cli"}).access_token

	# 2. Crear el Realm
	Invoke-RestMethod -Uri "http://localhost:9090/admin/realms" -Method Post -Headers @{Authorization="Bearer $token"} -ContentType "application/json" -Body '{"realm": "TaskManagement", "enabled": true}'

	# 3. Crear client
	$bodyCliente = @{ 
		clientId = "task-frontend" 
		enabled = $true 
		publicClient = $true 
		directAccessGrantsEnabled = $true 
	} | ConvertTo-Json -Depth 5

	Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/clients" `
	  -Method Post `
	  -Headers @{ Authorization = "Bearer $token" } `
	  -ContentType "application/json" `
	  -Body $bodyCliente

	# 4. Crear un Rol de Reino
	$bodyRol = @{ name = "ADMIN" } | ConvertTo-Json

	Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/roles" `
	  -Method Post `
	  -Headers @{ Authorization = "Bearer $token" } `
	  -ContentType "application/json" `
	  -Body $bodyRol

	# 5. Crear un usuario
	$bodyUsuario = @{ username = "user1"; enabled = $true } | ConvertTo-Json

	Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users" `
	  -Method Post `
	  -Headers @{ Authorization = "Bearer $token" } `
	  -ContentType "application/json" `
	  -Body $bodyUsuario

	# 6. Obtener ID del usuario (CORREGIDO: Se añade [0] porque Keycloak devuelve una lista)
	$usuarioResponse = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users?username=user1" `
	  -Method Get `
	  -Headers @{ Authorization = "Bearer $token" }

	$userId = $usuarioResponse[0].id

	# 7. Definir la contraseña del usuario
	$bodyPassword = @{ 
		type = "password" 
		value = "Password123!" 
		temporary = $false 
	} | ConvertTo-Json

	Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users/$userId/reset-password" `
	  -Method Put `
	  -Headers @{ Authorization = "Bearer $token" } `
	  -ContentType "application/json" `
	  -Body $bodyPassword

	# 8. Asignar el rol (CORREGIDO: Forzar formato de Array JSON)
	# A. Obtener el rol
	$rolResponse = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/roles/ADMIN" `
	  -Method Get `
	  -Headers @{ Authorization = "Bearer $token" }

	# 9. Forzar un array explícito en el JSON usando la estructura de PowerShell [pscustomobject]
	$bodyMapping = ConvertTo-Json @( @{
		id   = $rolResponse.id
		name = $rolResponse.name
	} )

	# 10. Enviar a Keycloak
	Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users/$userId/role-mappings/realm" `
	  -Method Post `
	  -Headers @{ Authorization = "Bearer $token" } `
	  -ContentType "application/json" `
	  -Body $bodyMapping
	  
	# 11. Actualizar el perfil del usuario con datos obligatorios mínimos
	$bodyProfileUser = @{
		firstName       = "Usuario"
		lastName        = "Prueba"
		email           = "user1@example.com"
		emailVerified   = $true
		requiredActions = @()  # Forzar lista de acciones pendientes vacía
	} | ConvertTo-Json

	Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users/$userId" ` -Method Put ` -Headers @{ Authorization = "Bearer $token" } ` -ContentType "application/json" ` -Body $bodyProfileUser

	# 12. Login y Obtención dinámica del JWT del usuario final (user1)
	$loginResponse = Invoke-RestMethod -Uri "http://localhost:9090/realms/TaskManagement/protocol/openid-connect/token" `
	  -Method Post `
	  -Body @{ 
		  username    = "user1"
		  password    = "Password123!"
		  grant_type  = "password"
		  client_id   = "task-frontend" 
	  }

	# 13. Extraer el token de acceso obtenido
	$userToken = $loginResponse.access_token
	$userToken  
	
	