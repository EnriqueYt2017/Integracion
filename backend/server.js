const express = require("express");
const oracledb = require("oracledb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();


const app = express();
app.use(express.json()); 
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

const dbConfig = {
  user: "BD_Integracion",
  password: "BD_Integracion",
  connectString: "localhost:1521/XE"
};
app.get("/data", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    if (!connection) {
      return res.status(500).json({ error: "No se pudo establecer la conexión a la base de datos" });
    }

    const result = await connection.execute(
      "SELECT id_usuario, nombre, apellido, correo, nombre_usuario FROM Usuario",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error al conectar con la base de datos:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});
// Registro de usuario
app.post("/register", async (req, res) => {
  const { nombre, apellido, correo, pass, nombre_usuario } = req.body; // ✅ Verifica que las variables están correctamente definidas
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Cifrar la contraseña antes de guardarla en la BD
    const passwordHash = await bcrypt.hash(pass, 10);

    // Insertar usuario en la BD con la secuencia `SEQ_USUARIO`
    await connection.execute(
      "INSERT INTO Usuario (id_usuario, nombre, apellido, correo, pass, nombre_usuario) VALUES (SEQ_USUARIO.NEXTVAL, :nombre, :apellido, :correo, :pass, :nombre_usuario, :direccion)",
      { nombre, apellido, correo, pass: passwordHash, nombre_usuario, direccion }, // ✅ Pasar los valores correctamente
      { autoCommit: true }
    );

    res.json({ mensaje: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Iniciar sesión
app.post("/login", async (req, res) => {
  const { correo, pass } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "SELECT id_usuario, nombre_usuario, pass FROM Usuario WHERE correo = :correo",
      [correo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const usuario = result.rows[0];

    console.log("Contraseña ingresada:", pass);
    console.log("Contraseña almacenada en BD (hash):", usuario.PASS);

    const passwordHash = usuario.PASS;
    if (!passwordHash) {
      return res.status(500).json({ error: "Error en la autenticación: contraseña inválida en la BD" });
    }

    const passwordValida = await bcrypt.compare(pass, passwordHash);
    if (!passwordValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: usuario.ID_USUARIO, nombre_usuario: usuario.NOMBRE_USUARIO }, // ✅ Asegurar que `nombre_usuario` esté en el token
      process.env.JWT_SECRET || "claveSecreta",
      { expiresIn: "2h" }
    );

    res.json({ 
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: { id: usuario.ID_USUARIO, nombre_usuario: usuario.NOMBRE_USUARIO } // ✅ Envía solo la info necesaria
    });
  } catch (err) {
    console.error("Error al autenticar usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// ...existing code...
app.get("/perfil", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // ✅ Obtener token
    if (!token) {
        return res.status(401).json({ error: "No autorizado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "claveSecreta");
        const connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            "SELECT id_usuario, nombre_usuario FROM Usuario WHERE id_usuario = :id",
            [decoded.id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        await connection.close();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(result.rows[0]); // ✅ Devuelve el usuario
    } catch (error) {
        console.error("Error obteniendo perfil:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Mover este endpoint fuera del anterior
app.put("/perfil", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No autorizado" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "claveSecreta");
        const connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            "UPDATE Usuario SET nombre_usuario = :nombre_usuario, nombre = :nombre, apellido = :apellido, direccion = :direccion WHERE id_usuario = :id",
            [req.body.nombre_usuario, req.body.nombre, req.body.apellido, req.body.direccion, decoded.id],
            { autoCommit: true }
        );

        await connection.close();

        res.json({ mensaje: "Perfil actualizado correctamente" });
    } catch (error) {
        console.error("Error actualizando perfil:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
app.get("/categorias", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "SELECT id_categoria, nombre, descripcion FROM Categoria",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    if (connection) await connection.close();
  }
});

app.get("/productos", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    let query = "SELECT codigo_producto, cantidad, stock, descripcion, precio, id_categoria FROM Producto";
    let params = [];
    
    if (req.query.categoria) {
      query += " WHERE id_categoria = :id_categoria";
      params.push(req.query.categoria);
    }
    
    const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    if (connection) await connection.close();
  }
});

app.post("/productos", async (req, res) => {
  const { codigo_producto, cantidad, stock, descripcion, precio, id_categoria } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      "INSERT INTO Producto (codigo_producto, cantidad, stock, descripcion, precio, id_categoria) VALUES (:codigo_producto, :cantidad, :stock, :descripcion, :precio, :id_categoria)",
      [codigo_producto, cantidad, stock, descripcion, precio, id_categoria],
      { autoCommit: true }
    );
    res.json({ mensaje: "Producto agregado correctamente" });
  } catch (err) {
    console.error("Error al agregar producto:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    if (connection) await connection.close();
  }
});
app.put("/productos/:codigo_producto", async (req, res) => {
  const { cantidad, stock, descripcion, precio, id_categoria } = req.body;
  const { codigo_producto } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      "UPDATE Producto SET cantidad = :cantidad, stock = :stock, descripcion = :descripcion, precio = :precio, id_categoria = :id_categoria WHERE codigo_producto = :codigo_producto",
      [cantidad, stock, descripcion, precio, id_categoria, codigo_producto],
      { autoCommit: true }
    );
    res.json({ mensaje: "Producto actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    if (connection) await connection.close();
  }
});
app.delete("/productos/:codigo_producto", async (req, res) => {
  const { codigo_producto } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      "DELETE FROM Producto WHERE codigo_producto = :codigo_producto",
      [codigo_producto],
      { autoCommit: true }
    );
    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    if (connection) await connection.close();
  }
});


app.get("/", (req, res) => {
  res.send("¡Servidor funcionando en el puerto 5000!");
});
app.listen(5000, () => {
  console.log("✅ Servidor corriendo en http://localhost:5000");
});

