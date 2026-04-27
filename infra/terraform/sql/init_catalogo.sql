BEGIN;

CREATE TABLE IF NOT EXISTS public.medical_services (
  id VARCHAR(32) PRIMARY KEY,
  code VARCHAR(128) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  short_description TEXT NOT NULL,
  technical_description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency VARCHAR(8) NOT NULL,
  availability_status VARCHAR(32) NOT NULL,
  is_active BOOLEAN NOT NULL,
  duration_minutes INTEGER NOT NULL,
  preparation_requirements TEXT[] NOT NULL DEFAULT '{}',
  specialty_ids TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public.specialties (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(128) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL,
  service_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

INSERT INTO public.medical_services (
  id, code, name, short_description, technical_description, price, currency,
  availability_status, is_active, duration_minutes, preparation_requirements,
  specialty_ids, tags, created_at, updated_at
) VALUES
  (
    'svc-001', 'CONS-CARD-001', 'Consulta cardiologica integral',
    'Consulta especializada para evaluacion cardiovascular.',
    'Incluye anamnesis, examen fisico y valoracion de riesgo cardiovascular.',
    450.00, 'GTQ', 'available', TRUE, 45,
    ARRAY['Presentar resultados previos si aplica'],
    ARRAY['cardiologia'], ARRAY['consulta', 'corazon'],
    '2026-04-23T00:00:00.000Z', '2026-04-23T00:00:00.000Z'
  ),
  (
    'svc-002', 'PED-CREC-001', 'Control pediatrico de crecimiento',
    'Consulta pediatrica para seguimiento de talla, peso y desarrollo.',
    'Evaluacion pediatrica con revision de percentiles, signos vitales y antecedentes.',
    325.00, 'GTQ', 'available', TRUE, 30,
    ARRAY['Llevar carnet de vacunas'],
    ARRAY['pediatria'], ARRAY['consulta', 'ninos'],
    '2026-04-23T00:00:00.000Z', '2026-04-23T00:00:00.000Z'
  ),
  (
    'svc-003', 'LAB-HEMO-001', 'Hemograma completo',
    'Analisis de laboratorio para evaluacion hematologica general.',
    'Procesamiento automatizado de biometria hematica con validacion tecnica.',
    185.00, 'GTQ', 'available', TRUE, 15,
    ARRAY['No requiere ayuno'],
    ARRAY['laboratorio-clinico'], ARRAY['laboratorio', 'sangre'],
    '2026-04-23T00:00:00.000Z', '2026-04-23T00:00:00.000Z'
  ),
  (
    'svc-004', 'IMG-RXTORAX-001', 'Radiografia de torax',
    'Estudio de imagen para evaluacion pulmonar y toracica.',
    'Captura radiologica posteroanterior con protocolo basico de proteccion.',
    300.00, 'GTQ', 'limited', TRUE, 20,
    ARRAY['Retirar objetos metalicos del area a examinar'],
    ARRAY['radiologia'], ARRAY['imagen', 'torax'],
    '2026-04-23T00:00:00.000Z', '2026-04-23T00:00:00.000Z'
  ),
  (
    'svc-005', 'GINE-CONTROL-001', 'Control ginecologico preventivo',
    'Consulta preventiva para control y evaluacion ginecologica.',
    'Consulta especializada con historia clinica, exploracion y orientacion preventiva.',
    400.00, 'GTQ', 'available', TRUE, 40,
    ARRAY['Presentarse con historial clinico reciente si existe'],
    ARRAY['ginecologia'], ARRAY['consulta', 'prevencion'],
    '2026-04-23T00:00:00.000Z', '2026-04-23T00:00:00.000Z'
  ),
  (
    'svc-006', 'LAB-GLUC-001', 'Prueba de glucosa en ayunas',
    'Medicion de glucosa basal para control metabolico.',
    'Determinacion cuantitativa de glucosa serica bajo condicion de ayuno.',
    95.00, 'GTQ', 'unavailable', FALSE, 10,
    ARRAY['Ayuno de 8 horas'],
    ARRAY['laboratorio-clinico'], ARRAY['laboratorio', 'metabolico'],
    '2026-04-23T00:00:00.000Z', '2026-04-23T00:00:00.000Z'
  )
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  technical_description = EXCLUDED.technical_description,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  availability_status = EXCLUDED.availability_status,
  is_active = EXCLUDED.is_active,
  duration_minutes = EXCLUDED.duration_minutes,
  preparation_requirements = EXCLUDED.preparation_requirements,
  specialty_ids = EXCLUDED.specialty_ids,
  tags = EXCLUDED.tags,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.specialties (
  id, code, name, description, is_active, service_ids, created_at, updated_at
) VALUES
  (
    'cardiologia', 'CARD-001', 'Cardiologia',
    'Especialidad medica enfocada en el diagnostico y tratamiento de enfermedades del corazon.',
    TRUE, ARRAY['svc-001', 'svc-002'], NOW(), NOW()
  ),
  (
    'pediatria', 'PED-001', 'Pediatria',
    'Especialidad dedicada a la salud y enfermedades de ninos y adolescentes.',
    TRUE, ARRAY['svc-003'], NOW(), NOW()
  ),
  (
    'laboratorio-clinico', 'LAB-001', 'Laboratorio Clinico',
    'Servicios de analisis clinicos y estudios de laboratorio.',
    TRUE, ARRAY['svc-004', 'svc-005'], NOW(), NOW()
  ),
  (
    'radiologia', 'RAD-001', 'Radiologia',
    'Especialidad de diagnostico por imagen.',
    TRUE, ARRAY['svc-006'], NOW(), NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  service_ids = EXCLUDED.service_ids,
  updated_at = NOW();

COMMIT;