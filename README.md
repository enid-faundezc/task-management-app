# Gestor de Tareas:

## Respaldo en GIT: 

1. Inicializar GIT desde task-management-app/, crear el .gitignore y posteriormente:

```bash
# Terminal Shell
task-management-app> 
git init
git status
git add .
git commit -m "Push inicial"
git remote add origin https://github.com/enid-faundezc/task-management-app.git
git branch -M main
git push -u origin main
```
	
2. Subir respaldo de avances:
```bash
# Terminal Shell
git status
git add .
git commit -m "Respaldo avance"
git push origin main
```
## Pasos para levantar la APP y realizar pruebas.

1. Levantar docker.
2. Ir al directorio base "task-management-app".
3. Con Terminal levantar infra:
```bash
# Terminal Shell
cd infra
docker compose up -d
docker ps # Revisar servicios.
```
4. Crear ambiente Keycloak, ir al archivo "creacion-ambiente-keycloak.md"
5. Compilar el modelo de datos, desde "task-management-app\backend>":
```bash
# Terminal Shell
npx prisma migrate reset  #Eliminar toda la BD y reconstruir
Remove-Item -Recurse -Force prisma\migrations  #Eliminar toda la BD y reconstruir
npx prisma migrate dev --name init #Elimina la carpeta migrations
npx prisma generate  #Luego crea una migración nueva
```
6. Revisar la BD: 
```bash
# Terminal Shell
docker exec -it postgres-task-db psql -U taskuser -d taskdb 
\dt # Lista todas las tablas creadas por Prisma.
\dT # Lista todos los enum
\d "Task" # Muestra la estructura, columnas y relaciones de una tabla específica.
SELECT * FROM "Task"; #  Consulta los registros de la tabla Task (usa comillas dobles si Prisma respetó las mayúsculas).
```

7. Levantar backend (en task-management-app\backend\)
```bash
# Terminal Shell
npm run start:dev 
```  

8. Verificar swagger: http://localhost:3000/api/docs
