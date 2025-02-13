import path from "path";
import { fileURLToPath } from "url";
export const GETHome = async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "views", "index.html"));
    return res.status(200).json({ " users": userst });
  } catch (error) {
    return res.status(200).json({ mensaje: "Error envio de datos" });
  }
};
