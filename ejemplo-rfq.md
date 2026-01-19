# Proceso de Automatización: Login y Extracción de Datos

## Objetivo
Automatizar el proceso de login en el portal empresarial y extraer información de clientes.

## Requisitos
- Navegador web (Chrome/Edge)
- Credenciales de acceso al portal
- Conexión a internet

## Pasos del Proceso

### Fase 1: Autenticación

1. Abrir navegador web
2. Navegar a https://portal.empresa.com/login
3. Esperar que cargue la página
4. Escribir el usuario en el campo de username
5. Escribir la contraseña en el campo de password
6. Hacer clic en el botón "Iniciar Sesión"
7. Esperar 3 segundos para que se complete el login

### Fase 2: Navegación al Dashboard

8. Si aparece mensaje de bienvenida entonces continuar
9. Hacer clic en el menú "Clientes"
10. Esperar que cargue la tabla de datos

### Fase 3: Extracción de Datos

11. Asignar contador = 1
12. Para cada fila en la tabla hacer:
    - Extraer el nombre del cliente
    - Extraer el email del cliente
    - Extraer el teléfono
    - Escribir los datos en Excel
    - Incrementar contador
13. Si contador mayor a 100 entonces salir del bucle

### Fase 4: Finalización

14. Guardar el archivo Excel
15. Hacer clic en "Cerrar Sesión"
16. Cerrar navegador

## Variables Utilizadas
- {usuario}
- {contraseña}
- {contador}
- {nombreCliente}
- {emailCliente}
- {telefonoCliente}
- $rutaArchivoExcel

## Condiciones Especiales
- Si el login falla, reintentar hasta 3 veces
- Si no hay datos en la tabla, enviar notificación
- Si el proceso tarda más de 10 minutos, cancelar

## Resultado Esperado
Archivo Excel con la información de todos los clientes del portal, guardado en la ruta especificada.
