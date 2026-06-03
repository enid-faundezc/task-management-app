# Gestor de Tareas:

## Respaldo en GIT: 
1.- Desde task-management-app/, crear el .gitignore y posteriormente:

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
	
2.- A medida de subir cambios de avances:
```bash
# Terminal Shell
git status
git add .
git commit -m "Respaldo avance"
git push origin main
```
## Levantar la aplicación y realizar pruebas.
1.- En directorio base "task-management-app" con términal, levantar docker previamente:
```bash
# Terminal Shell
cd infra
docker compose up -d
docker ps # Revisar servicios.
```
2.- Posteriormente, ejecutar los pasos que están definidos en el archivo creacion-ambiente-keycloak.md
