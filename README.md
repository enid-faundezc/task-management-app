# Gestor de Tareas:

## Respaldo en GIT: 

1. Inicializar GIT desde task-management-app/, crear el .gitignore y posteriormente:

```bash
# Terminal Shell
task-management-app> git init
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
