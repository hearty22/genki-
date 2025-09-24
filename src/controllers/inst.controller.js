import fs from "fs";
import path from "path";
import multer from "multer";
import { instModel } from "../models/inst.model.js";
import { Op } from "sequelize";
// Configuración de multer para subir logos de instituciones
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Crear la carpeta si no existe
    const uploadDir = 'uploads/institutions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Crear un nombre de archivo único para evitar conflictos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: function (req, file, cb) {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Crear una nueva institución
export const createInstitution = async (req, res) => {
  try {
    const { name, siglas, notas, address, nivel } = req.body;

    // Validación de campos requeridos
    if (!name) {
      return res.status(400).json({ message: "Campo requerido: name" });
    }

    // Verificar si ya existe una institución con el mismo nombre
    const existingInstitution = await instModel.findOne({ where: { name } });
    if (existingInstitution) {
      return res.status(400).json({ message: "Ya existe una institución con ese nombre" });
    }

    // Crear la nueva institución
    const newInstitution = new instModel({
      name,
      siglas,
      notas,
      address,
      nivel
    });

    await newInstitution.save();

    res.status(201).json({
      message: "Institución creada exitosamente",
      institution: newInstitution
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno al crear la institución" });
  }
};

// Obtener todas las instituciones
export const getAllInstitutions = async (req, res) => {
  try {
    const institutions = await instModel.findAll({
      attributes: ['id_institucion', 'name', 'siglas', 'logo', 'notas', 'address', 'nivel', 'createdAt', 'updatedAt']
    });

    res.status(200).json({
      message: "Instituciones obtenidas exitosamente",
      institutions: institutions
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno al obtener las instituciones" });
  }
};

// Obtener una institución por ID
export const getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;

    const institution = await instModel.findOne({
      where: { id_institucion: id },
      attributes: ['id_institucion', 'name', 'siglas', 'logo', 'notas', 'address', 'nivel', 'createdAt', 'updatedAt']
    });

    if (!institution) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    res.status(200).json({
      message: "Institución obtenida exitosamente",
      institution: institution
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno al obtener la institución" });
  }
};

// Actualizar una institución
export const updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, siglas, notas, address, nivel } = req.body;

    // Verificar si la institución existe
    const institution = await instModel.findOne({ where: { id_institucion: id } });
    if (!institution) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    // Si se está actualizando el nombre, verificar que no exista otra institución con ese nombre
    if (name && name !== institution.name) {
      const existingInstitution = await instModel.findOne({ where: { name } });
      if (existingInstitution) {
        return res.status(400).json({ message: "Ya existe otra institución con ese nombre" });
      }
    }

    // Actualizar la institución
    await instModel.update(
      { name, siglas, notas, address, nivel },
      { where: { id_institucion: id } }
    );

    // Obtener la institución actualizada
    const updatedInstitution = await instModel.findOne({ where: { id_institucion: id } });

    res.status(200).json({
      message: "Institución actualizada exitosamente",
      institution: updatedInstitution
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno al actualizar la institución" });
  }
};

// Subir logo de institución
export const uploadInstitutionLogo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la institución existe
    const institution = await instModel.findOne({ where: { id_institucion: id } });
    if (!institution) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    // Verificar si se subió un archivo
    if (!req.file) {
      return res.status(400).json({ error: "No se ha seleccionado ningún archivo" });
    }

    // Si la institución ya tenía un logo, eliminar el archivo anterior
    if (institution.logo) {
      const fullPath = path.join(process.cwd(), institution.logo);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Actualizar la institución con la nueva ruta del logo
    await instModel.update(
      { logo: req.file.path },
      { where: { id_institucion: id } }
    );

    res.status(200).json({
      message: "Logo de institución actualizado exitosamente",
      logoPath: req.file.path,
      filename: req.file.filename
    });

  } catch (error) {
    console.log(error);
    if (error.message === 'Solo se permiten archivos de imagen') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error interno al subir el logo" });
  }
};

// Eliminar una institución
export const deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la institución existe
    const institution = await instModel.findOne({ where: { id_institucion: id } });
    if (!institution) {
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    // Si la institución tiene un logo, eliminar el archivo
    if (institution.logo) {
      const fullPath = path.join(process.cwd(), institution.logo);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Eliminar la institución
    await instModel.destroy({ where: { id_institucion: id } });

    res.status(200).json({
      message: "Institución eliminada exitosamente"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno al eliminar la institución" });
  }
};

// Buscar instituciones por nombre o siglas
export const searchInstitutions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Debe proporcionar un término de búsqueda" });
    }

    const institutions = await instModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { siglas: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id_institucion', 'name', 'siglas', 'logo', 'notas', 'address', 'nivel', 'createdAt', 'updatedAt']
    });

    res.status(200).json({
      message: "Búsqueda realizada exitosamente",
      query: query,
      institutions: institutions
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno al buscar instituciones" });
  }
};