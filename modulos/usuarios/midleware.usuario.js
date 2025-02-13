import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";

// Ruta del archivo JSON

const prisma = new PrismaClient();
const SECRET_KEY = "clave_secretaarchivosclasificadosx";
//GET trae los datos
export const GETusers = async (req, res, next) => {
  try {
    const userst = await prisma.users.findMany({
      where: { status: "ACTIVO" },
      include: {
        cuentaId: true,
      },
    });
    return res.status(200).json({ " users": userst });
  } catch (error) {
    return res.status(200).json({ mensaje: "Error envio de datos" });
  }
};

//POST Crea usuario
export const POSTusers = async (req, res, next) => {
  const { name, cedula, email, phone, password, location } = req.body;

  // Validación de parámetros (más robusta)
  if (!name || !cedula || !email || !password) {
    return res.status(400).json({
      mensaje: "Faltan parámetros obligatorios (name, cedula, email, password)",
    }); // Código 400 para Bad Request
  }

  // Validación de formato de email (opcional, pero recomendable)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ mensaje: "Formato de email inválido" });
  }

  // Validación de longitud de la cédula (puedes adaptarla al formato de tu país)
  if (cedula && cedula.length <= 9) {
    // Verifica si cedula existe antes de acceder a su longitud
    return res.status(400).json({ mensaje: "Longitud de cédula inválida" });
  }
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.default.hash(password, 10);
  const user = await prisma.users.findFirst({
    where: { email: email },
  });
  const userc = await prisma.users.findFirst({
    where: { cedula: cedula },
  });
  if (userc) {
    return res.status(401).json({ mensaje: "Cedula ya registrada" });
  }
  if (user) {
    return res.status(401).json({ mensaje: "ya fue creado usuario" });
  }
  try {
    const datasend = {
      name: name,
      cedula: cedula,
      email: email,
      phone: phone,
      password: hashedPassword, // Guarda la contraseña hasheada
      location: location,
      rol: "CAJA",
      status: "ACTIVO",
    };

    const sendd = await prisma.users.create({
      data: datasend,
    });

    return res
      .status(201)
      .json({ mensaje: "Usuario creado exitosamente", respuesta: sendd }); // Código 201 para Created
  } catch (error) {
    console.error({ mensaje: "Error al crear usuario:", error }); // Log del error para depuración

    if (error.code === "P2002") {
      // Código de error de Prisma para Unique Constraint Violation
      return res
        .status(400)
        .json({ mensaje: "Ya existe un usuario con esa cédula o email" });
    }

    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message }); // Código 500 para Internal Server Error, mensaje del error para el log
  }
};

//POST  usuario Login
export const POSTusersLogin = async (req, res, next) => {
  const bcrypt = await import("bcrypt");
  const { email, password } = req.body;
  // Validación de parámetros (más robusta)
  if (!email || !password) {
    return res.status(400).json({
      mensaje: "Faltan parámetros obligatorios ( email, password)",
    }); // Código 400 para Bad Request
  }
  const user = await prisma.users.findFirst({
    where: { email: email },
  });
  const coincide = await bcrypt.compare(password, user.password);

  try {
    if (user && coincide) {
      // Datos que deseas incluir en el token
      const payload = {
        id: user.id,
        name: user.name,
        cedula: user.cedula,
        email: user.email,
        rol: user.rol,
        status: user.status,
        createup: user.created_at,
      };
      // Generar el token (expira en 1h)
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
      //retornar
      //Token separado por coma
      //& un code uuid
      console.log("completo" + token);
      // Separar el token en sus tres partes
      const [sha1, sha2, sha3] = token.split(".");
      /*guardamos datos en tokens*/
      saveToken(sha1, sha2, sha3);
      // Mostrar en consola
      console.log("🔹 Header:", sha1);
      console.log("🔹 Payload:", sha2);
      console.log("🔹 Signature:", sha3);

      return res
        .status(200)
        .json({ mensaje: "Entro session", Sha1: sha1, Sha2: sha2, Sha3: sha3 });
    }
    if (!user || !coincide) {
      return res.status(200).json({ mensaje: "Error en Email o password" });
    }
  } catch (error) {
    return res.status(404).json({ mensaje: "Error email o password" });
  }
};
//################################## Validacion token usuario ####################################
//verificacion del token
export const verifyToken = (req, res, next) => {
  // 🛑 CORRECCIÓN: Convertimos a minúsculas y obtenemos el token correctamente
  const token = req.headers["authorization"];
  console.log(token);
  if (!token) {
    return res.status(403).json({ error: "Token requerido" });
  }

  // Extraer el token después de "Bearer "
  /* const tokenParts = token.split(" ");*/

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
    req.user = decoded; // Guardamos los datos del usuario en `req.user`
    next();
  });
};
//retorna el token validado
export const protegida = (req, res) => {
  res.json({ message: "✅ Acceso concedido", user: req.user });
};
const filePath = "./TokensU.json"; // Ruta del archivo JSON
//####################################################################
// Función para guardar tokens
const saveToken = async (sha1, sha2, sha3) => {
  try {
    // Intentar leer el archivo JSON
    let jsonData;
    try {
      const data = await fs.readFile(filePath, "utf8");
      jsonData = JSON.parse(data);
    } catch (error) {
      console.log("📁 Archivo no encontrado. Creando uno nuevo...");
      jsonData = { users: [] }; // Si no existe, se inicializa un array vacío
    }

    // Verificar si "users" es un array
    if (!Array.isArray(jsonData.users)) {
      jsonData.users = [];
    }

    // Nuevo token a agregar
    const TokenUser = { id: sha1, SHA2: sha2, SHA3: sha3 };

    // Agregar al array
    jsonData.users.push(TokenUser);

    // Guardar cambios en el archivo
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), "utf8");
    console.log("✅ Token agregado correctamente.");
  } catch (error) {
    console.error("❌ Error en la operación:", error);
  }
};
