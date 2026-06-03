## Configurar keyCloack 
1.- Revisar si carga bien: http://localhost:9090, si está OK seguir al paso 2.
2.- Correr todo este script en terminal: Este script creara todo el ambiente requerido en Keycloak (realm, client, roles, ususuarios):

```bash
# Terminal Shell
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
    
```