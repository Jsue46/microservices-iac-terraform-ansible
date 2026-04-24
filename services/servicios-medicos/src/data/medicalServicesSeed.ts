import type { MedicalServiceRecord } from "../types.ts";

const BASE_TIMESTAMP = "2026-04-23T00:00:00.000Z";

export const medicalServicesSeed: MedicalServiceRecord[] = [
  {
    id: "svc-001",
    code: "CONS-CARD-001",
    name: "Consulta cardiologica integral",
    shortDescription: "Consulta especializada para evaluacion cardiovascular.",
    technicalDescription:
      "Incluye anamnesis, examen fisico y valoracion de riesgo cardiovascular.",
    price: 450,
    currency: "GTQ",
    availabilityStatus: "available",
    isActive: true,
    durationMinutes: 45,
    preparationRequirements: ["Presentar resultados previos si aplica"],
    specialtyIds: ["cardiologia"],
    tags: ["consulta", "corazon"],
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP
  },
  {
    id: "svc-002",
    code: "PED-CREC-001",
    name: "Control pediatrico de crecimiento",
    shortDescription: "Consulta pediatrica para seguimiento de talla, peso y desarrollo.",
    technicalDescription:
      "Evaluacion pediatrica con revision de percentiles, signos vitales y antecedentes.",
    price: 325,
    currency: "GTQ",
    availabilityStatus: "available",
    isActive: true,
    durationMinutes: 30,
    preparationRequirements: ["Llevar carnet de vacunas"],
    specialtyIds: ["pediatria"],
    tags: ["consulta", "ninos"],
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP
  },
  {
    id: "svc-003",
    code: "LAB-HEMO-001",
    name: "Hemograma completo",
    shortDescription: "Analisis de laboratorio para evaluacion hematologica general.",
    technicalDescription:
      "Procesamiento automatizado de biometria hematica con validacion tecnica.",
    price: 185,
    currency: "GTQ",
    availabilityStatus: "available",
    isActive: true,
    durationMinutes: 15,
    preparationRequirements: ["No requiere ayuno"],
    specialtyIds: ["laboratorio-clinico"],
    tags: ["laboratorio", "sangre"],
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP
  },
  {
    id: "svc-004",
    code: "IMG-RXTORAX-001",
    name: "Radiografia de torax",
    shortDescription: "Estudio de imagen para evaluacion pulmonar y toracica.",
    technicalDescription:
      "Captura radiologica posteroanterior con protocolo basico de proteccion.",
    price: 300,
    currency: "GTQ",
    availabilityStatus: "limited",
    isActive: true,
    durationMinutes: 20,
    preparationRequirements: ["Retirar objetos metalicos del area a examinar"],
    specialtyIds: ["radiologia"],
    tags: ["imagen", "torax"],
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP
  },
  {
    id: "svc-005",
    code: "GINE-CONTROL-001",
    name: "Control ginecologico preventivo",
    shortDescription: "Consulta preventiva para control y evaluacion ginecologica.",
    technicalDescription:
      "Consulta especializada con historia clinica, exploracion y orientacion preventiva.",
    price: 400,
    currency: "GTQ",
    availabilityStatus: "available",
    isActive: true,
    durationMinutes: 40,
    preparationRequirements: ["Presentarse con historial clinico reciente si existe"],
    specialtyIds: ["ginecologia"],
    tags: ["consulta", "prevencion"],
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP
  },
  {
    id: "svc-006",
    code: "LAB-GLUC-001",
    name: "Prueba de glucosa en ayunas",
    shortDescription: "Medicion de glucosa basal para control metabolico.",
    technicalDescription:
      "Determinacion cuantitativa de glucosa serica bajo condicion de ayuno.",
    price: 95,
    currency: "GTQ",
    availabilityStatus: "unavailable",
    isActive: false,
    durationMinutes: 10,
    preparationRequirements: ["Ayuno de 8 horas"],
    specialtyIds: ["laboratorio-clinico"],
    tags: ["laboratorio", "metabolico"],
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP
  }
];
