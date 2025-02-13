# Frank API

## Descripción
Este proyecto proporciona una API para la gestión de usuarios, cuentas y tarjetas en un banco simulado. Contiene diversas rutas para la creación y consulta de datos.

## Tecnologías utilizadas
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [JSON Web Token](https://www.npmjs.com/package/jsonwebtoken)
- [CORS](https://www.npmjs.com/package/cors)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [Nodemon](https://www.npmjs.com/package/nodemon)

## Instalación

1. Clonar el repositorio:
   ```sh
   git clone https://github.com/tu-repo/frank-api.git
   cd frank-api
   ```
2. Instalar dependencias:
   ```sh
   npm install
   ```
3. Configurar variables de entorno:
   Crear un archivo `.env` en la raíz del proyecto y agregar lo siguiente:
   ```sh
   PORT=3001
   DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
   ```
4. Iniciar el servidor:
   ```sh
   npm run dev
   ```

## Rutas de la API

### Usuarios
- **GET** `/users` - Muestra los usuarios registrados.
- **POST** `/users` - Crea un nuevo usuario.
- **PUT** `/users/:id` - Actualiza el estado de un usuario (ACTIVO | INACTIVO).
- **DELETE** `/users/:id` - Elimina un usuario.

#### Modelo `Users`
```prisma
model Users {
  id         Int      @id @default(autoincrement())
  name       String
  cedula     String
  email      String
  phone      String
  password   String
  location   String
  rol        Role     @default(CAJA)
  status     Status   @default(ACTIVO)
  created_at DateTime @default(now())
  cuentaId   Cuenta[]
}
```
#### Ejemplo de petición **POST**
```json
{
  "name": "Franklim Valverde",
  "cedula": "1107050440",
  "email": "1107050440f@gmail.com",
  "phone": "3022130374",
  "password": "Millonario2090*",
  "location": "{-12346,579876}"
}
```

### Cuentas
- **GET** `/cuenta` - Muestra las cuentas.
- **POST** `/cuenta` - Crea una cuenta (requiere un usuario asociado).

#### Modelo `Cuenta`
```prisma
model Cuenta {
  id           Int           @id @default(autoincrement())
  numerocuenta String
  usuario      Users         @relation(fields: [usuarioId], references: [id])
  usuarioId    Int
  dineroCuenta String
  status       Status        @default(ACTIVO)
  created_at   DateTime      @default(now())
  transaccion  Transaccion[]
  tarjeta      Tarjeta[]
}
```
#### Ejemplo de petición **POST**
```json
{
  "numerocuenta": "8897456321",
  "usuarioId": 1,
  "dineroCuenta": "8000000"
}
```

### Tarjetas
- **GET** `/tarjetas` - Muestra las tarjetas.
- **POST** `/tarjetas` - Crea una tarjeta (requiere una cuenta asociada).

#### Modelo `Tarjeta`
```prisma
model Tarjeta {
  id            Int      @id @default(autoincrement())
  numeroTarjeta String
  pin           String
  dineroTarjeta String
  cv            String
  cuenta        Cuenta   @relation(fields: [cuentaId], references: [id])
  cuentaId      Int
  status        Status   @default(ACTIVO)
  created_at    DateTime @default(now())
}
```
#### Ejemplo de petición **POST**
```json
{
  "numeroTarjeta": "8796543214",
  "pin": "4535",
  "dineroTarjeta": "30000000",
  "cv": "4535",
  "cuentaId": 1
}
```

### Autenticación
- **POST** `/userLog` - Inicia sesión enviando `email` y `password`. La contraseña se valida con JWT.

#### Ejemplo de petición **POST**
```json
{
  "email": "1107050440f@gmail.com",
  "password": "Millonario2090*"
}
```

## Consideraciones
- La cédula debe tener máximo 10 caracteres.
- No se permiten registros con cédula o email duplicados.
- Las contraseñas se almacenan encriptadas con bcrypt y deben validarse con JWT en el frontend.

## Créditos
Creador: **Franklim de Jesús Muñoz Valverde**  
📞 Contacto: +57 3022130374 - Colombia  

## Licencia
@ Derechos reservados - API Bank

