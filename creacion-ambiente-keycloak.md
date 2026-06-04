## Configurar keyCloack

1. Verificar que esté OK Keycloak: http://localhost:9090, si está OK seguir al paso 2.
2. Correr todo este script en terminal: Este script creará todo el ambiente requerido en Keycloak (realm, client, roles, usuarios):

```bash
# Terminal Shell
# 1. Obtener el token limpiamente en una variable
$token = (Invoke-RestMethod -Uri "http://localhost:9090/realms/master/protocol/openid-connect/token" -Method Post -Body @{username="admin"; password="admin"; grant_type="password"; client_id="admin-cli"}).access_token

# 2. Crear el Realm
# ====================================================================
# RN-RESET: ELIMINAR REALM EXISTENTE (Si existe, para forzar un reset)
# ====================================================================
# Usamos -ErrorAction SilentlyContinue para que si es la primera vez que se corre, 
# el script no se detenga si el Realm aún no existe.
try {
    Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement" `
        -Method Delete `
        -Headers @{Authorization="Bearer $token"} `
        -ErrorAction SilentlyContinue
    Write-Host "🔄 Realm anterior 'TaskManagement' eliminado con éxito. Reseteando entorno..." -ForegroundColor Yellow
} catch {
    Write-Host "✨ No se detectó un Realm previo. Procediendo con instalación limpia." -ForegroundColor Green
}

# 2. CREAR EL REALM (Tu código original modificado)
Invoke-RestMethod -Uri "http://localhost:9090/admin/realms" `
    -Method Post `
    -Headers @{Authorization="Bearer $token"} `
    -ContentType "application/json" `
    -Body '{"realm": "TaskManagement", "enabled": true}'


# 3. Crear cliente con políticas de redirección y orígenes seguros (Evita error redirect_uri y CORS)
$bodyCliente = @{ 
    clientId                  = "task-frontend" # 🌟 Asegúrate de usar este mismo en tu main.tsx
    enabled                   = $true 
    publicClient              = $true           # Permite el flujo en apps públicas (React)
    standardFlowEnabled       = $true           # Activa el flujo estándar OIDC de redirección
    directAccessGrantsEnabled = $true 
    redirectUris              = @("http://localhost:5173/*") # 🔐 Soluciona el error 'Invalid parameter: redirect_uri'
    webOrigins                = @("http://localhost:5173")   # 🌐 Soluciona futuros errores de CORS en local
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/clients" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" `
    -Body $bodyCliente

# 4. Crear un Roles de Reino
$bodyRol = @{ name = "ADMIN" } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/roles" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" `
    -Body $bodyRol

 $bodyRol = @{ name = "USER" } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/roles" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" `
    -Body $bodyRol   

# 5. Crear un usuario rol user
$bodyUsuario = @{ username = "user1user"; enabled = $true } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" `
    -Body $bodyUsuario

# 6. Obtener ID del usuario (CORREGIDO: Se añade [0] porque Keycloak devuelve una lista)
$usuarioResponse = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users?username=user1user" `
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
$rolResponse = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/roles/USER" `
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
    email           = "user1user@example.com"
    emailVerified   = $true
    requiredActions = @()  # Forzar lista de acciones pendientes vacía
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users/$userId" ` -Method Put ` -Headers @{ Authorization = "Bearer $token" } ` -ContentType "application/json" ` -Body $bodyProfileUser

# 12. Login y Obtención dinámica del JWT del usuario final (user1user)
$loginResponse = Invoke-RestMethod -Uri "http://localhost:9090/realms/TaskManagement/protocol/openid-connect/token" `
    -Method Post `
    -Body @{ 
        username    = "user1user"
        password    = "Password123!"
        grant_type  = "password"
        client_id   = "task-frontend" 
    }

# 13. Extraer el token de acceso obtenido
$userToken = $loginResponse.access_token
Write-Host "Token de usuario rol user: $userToken"

# 14. Crear un usuario rol userAdmin
$bodyUsuario = @{ username = "user1admin"; enabled = $true } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" `
    -Body $bodyUsuario

# 15. Obtener ID del usuario (CORREGIDO: Se añade [0] porque Keycloak devuelve una lista)
$usuarioResponse = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users?username=user1admin" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $token" }

$userId = $usuarioResponse[0].id

# 16. Definir la contraseña del usuario
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

# 17. Asignar el rol (CORREGIDO: Forzar formato de Array JSON)
# A. Obtener el rol
$rolResponse = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/roles/ADMIN" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $token" }

# 18. Forzar un array explícito en el JSON usando la estructura de PowerShell [pscustomobject]
$bodyMapping = ConvertTo-Json @( @{
    id   = $rolResponse.id
    name = $rolResponse.name
} )

# 19. Enviar a Keycloak
Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users/$userId/role-mappings/realm" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" `
    -Body $bodyMapping
    
# 20. Actualizar el perfil del usuario con datos obligatorios mínimos
$bodyProfileUser = @{
    firstName       = "Usuario"
    lastName        = "Prueba"
    email           = "user1admin@example.com"
    emailVerified   = $true
    requiredActions = @()  # Forzar lista de acciones pendientes vacía
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/TaskManagement/users/$userId" ` -Method Put ` -Headers @{ Authorization = "Bearer $token" } ` -ContentType "application/json" ` -Body $bodyProfileUser

# 21. Login y Obtención dinámica del JWT del usuario final (user1user)
$loginResponse = Invoke-RestMethod -Uri "http://localhost:9090/realms/TaskManagement/protocol/openid-connect/token" `
    -Method Post `
    -Body @{ 
        username    = "user1admin"
        password    = "Password123!"
        grant_type  = "password"
        client_id   = "task-frontend" 
    }

# 22. Extraer el token de acceso obtenido
$userToken = $loginResponse.access_token
Write-Host "Token de usuario rol ADMIN: $userToken"

    
```