import type { SpecialtyRecord } from "../types.ts";

const now = new Date().toISOString();

export const specialtiesSeed: SpecialtyRecord[] = [
  {
    id: "cardiologia",
    code: "CARD-001",
    name: "Cardiologia",
    description: "Especialidad medica enfocada en el diagnostico y tratamiento de enfermedades del corazon.",
    isActive: true,
    serviceIds: ["svc-001", "svc-002"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "pediatria",
    code: "PED-001",
    name: "Pediatria",
    description: "Especialidad dedicada a la salud y enfermedades de ninos y adolescentes.",
    isActive: true,
    serviceIds: ["svc-003"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "laboratorio-clinico",
    code: "LAB-001",
    name: "Laboratorio Clinico",
    description: "Servicios de analisis clinicos y estudios de laboratorio.",
    isActive: true,
    serviceIds: ["svc-004", "svc-005"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "radiologia",
    code: "RAD-001",
    name: "Radiologia",
    description: "Especialidad de diagnostico por imagen.",
    isActive: true,
    serviceIds: ["svc-006"],
    createdAt: now,
    updatedAt: now,
  },
];