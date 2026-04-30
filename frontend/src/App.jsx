import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeDollarSign,
  BriefcaseMedical,
  CheckCircle2,
  CircleAlert,
  Filter,
  HeartPulse,
  Microscope,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X
} from "lucide-react";

const API = "/api/v1";

function serviceImageSrc(serviceId) {
  return `/images/services/${serviceId}.jpg`;
}

function specialtyImageSrc(specialtyId) {
  return `/images/specialties/${specialtyId}.jpg`;
}

function formatCurrency(value, currency = "GTQ") {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "No disponible";
  return new Date(value).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function statusMeta(status) {
  switch (status) {
    case "available":
      return "bg-[#e3f3ea] text-[#256d59]";
    case "limited":
      return "bg-[#f8eadf] text-[#a06b31]";
    default:
      return "bg-[#f4e0dc] text-[#9a5047]";
  }
}

function activeMeta(active) {
  return active
    ? "bg-[#e2f0f1] text-[#1f6f78]"
    : "bg-[#eceff1] text-[#6c7e86]";
}

function serviceIcon(service) {
  const tags = (service.tags || []).join(" ").toLowerCase();
  const specialties = (service.specialtyIds || []).join(" ").toLowerCase();
  const haystack = `${tags} ${specialties} ${service.name || ""}`.toLowerCase();

  if (haystack.includes("cardio")) return HeartPulse;
  if (haystack.includes("laboratorio") || haystack.includes("glucosa")) return Microscope;
  if (haystack.includes("gine")) return ShieldCheck;
  if (haystack.includes("radio")) return Activity;
  return Stethoscope;
}

function specialtyIcon(specialtyId) {
  switch (specialtyId) {
    case "cardiologia":
      return HeartPulse;
    case "laboratorio-clinico":
      return Microscope;
    case "radiologia":
      return Activity;
    case "ginecologia":
      return ShieldCheck;
    default:
      return BriefcaseMedical;
  }
}

function ImageFrame({
  src,
  alt,
  icon: Icon,
  accent = "teal",
  className = "",
  iconSize = 42,
  fallbackLabel = "Imagen referencial"
}) {
  const [hasError, setHasError] = useState(false);
  const tint =
    accent === "sand"
      ? "from-[#f7efe6] via-[#f6f1ea] to-[#efe3d6] text-sand"
      : "from-[#e9f4f4] via-[#f6faf9] to-[#dfecee] text-teal";

  if (!src || hasError) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${tint} ${className}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.75),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(19,32,40,0.08),transparent_28%)]" />
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/82 shadow-[0_12px_24px_rgba(17,35,44,0.08)]">
            <Icon size={iconSize} strokeWidth={1.7} />
          </div>
          <span className="font-dm-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
            {fallbackLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#f5f6f4] ${className}`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#132028]/34 via-transparent to-transparent" />
    </div>
  );
}

async function apiFetch(path) {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function App() {
  const [activeTab, setActiveTab] = useState("services");
  const [services, setServices] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [specialtiesError, setSpecialtiesError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const payload = await apiFetch("/medical-services?pageSize=100");
      startTransition(() => {
        setServices(payload.data?.items ?? payload.data ?? []);
        setServicesError("");
      });
    } catch {
      setServicesError("No fue posible cargar los servicios médicos en este momento.");
    } finally {
      setLoadingServices(false);
    }
  };

  const loadSpecialties = async () => {
    setLoadingSpecialties(true);
    try {
      const payload = await apiFetch("/especialidades");
      startTransition(() => {
        setSpecialties(payload.data ?? []);
        setSpecialtiesError("");
      });
    } catch {
      setSpecialtiesError("No fue posible cargar las especialidades en este momento.");
    } finally {
      setLoadingSpecialties(false);
    }
  };

  useEffect(() => {
    loadServices();
    loadSpecialties();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        const haystack = [
          service.name,
          service.code,
          service.shortDescription,
          service.technicalDescription
        ]
          .join(" ")
          .toLowerCase();

        const searchOk = haystack.includes(deferredSearch.trim().toLowerCase());
        const statusOk = !statusFilter || service.availabilityStatus === statusFilter;
        return searchOk && statusOk;
      }),
    [services, deferredSearch, statusFilter]
  );

  const selectedService = services.find((item) => item.id === selectedServiceId) ?? null;
  const selectedSpecialty =
    specialties.find((item) => item.id === selectedSpecialtyId) ?? null;

  const selectedSpecialtyServices = selectedSpecialty
    ? services.filter((service) => (selectedSpecialty.serviceIds || []).includes(service.id))
    : [];

  const navBackground = scrolled
    ? "bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(17,35,44,0.08)] border-b border-black/5"
    : "bg-transparent";

  return (
    <div className="min-h-screen font-dm-sans text-text-dark">
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${navBackground}`}>
        <div className="mx-auto flex h-[84px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[18px] border border-[#d7ebee] bg-[linear-gradient(180deg,#eef7f8,#dcecee)]">
              <div className="absolute inset-[6px] rounded-[14px] bg-white/45"></div>
              <HeartPulse size={19} className="relative z-10 text-teal" />
              <ShieldCheck size={11} className="absolute bottom-[7px] right-[7px] text-[#64848a]" />
            </div>
            <div className="leading-tight">
              <div className="font-syne text-[18px] font-bold tracking-tight">Sistema Médico G6</div>
              <div className="font-dm-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                Servicios y especialidades
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => {
                setActiveTab("services");
                setSelectedSpecialtyId(null);
              }}
              className={`inline-flex items-center border-b-[2.5px] px-1 pt-1 text-sm font-bold transition-all ${
                activeTab === "services"
                  ? "border-current text-text-dark opacity-100"
                  : "border-transparent text-text-mid opacity-70 hover:opacity-100"
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => {
                setActiveTab("specialties");
                setSelectedServiceId(null);
              }}
              className={`inline-flex items-center border-b-[2.5px] px-1 pt-1 text-sm font-bold transition-all ${
                activeTab === "specialties"
                  ? "border-current text-text-dark opacity-100"
                  : "border-transparent text-text-mid opacity-70 hover:opacity-100"
              }`}
            >
              Especialidades
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-[#edf7ef] px-4 py-3 text-sm font-medium text-[#2b6e59] md:inline-flex md:items-center md:gap-2">
              <ShieldCheck size={14} />
              {services.filter((item) => item.isActive).length} activos
            </div>
            <div className="hidden rounded-full bg-white px-4 py-3 text-sm font-medium text-text-mid md:inline-flex md:items-center md:gap-2">
              <BriefcaseMedical size={14} />
              {specialties.length} especialidades
            </div>
          </div>
        </div>
      </nav>

      <main className="page-transition bg-light pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {activeTab === "services" && !selectedService && (
            <>
              <section className="relative overflow-hidden rounded-[32px] border border-black/6 bg-[linear-gradient(180deg,#0d1620,#142531)] px-6 py-16 text-white sm:px-8 lg:px-12">
                <div className="clinical-orb -left-16 top-12 h-52 w-52 bg-[#1f6f78]/30" />
                <div className="clinical-orb bottom-0 right-0 h-64 w-64 bg-[#b48254]/16" />
                <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                  <div>
                    <p className="font-dm-mono text-[12px] uppercase tracking-[0.18em] text-[#92b8be] mb-4">
                      Servicios médicos
                    </p>
                    <h1 className="max-w-4xl text-5xl font-syne font-bold tracking-tight md:text-7xl">
                      Consulta servicios médicos con una vista clara y bien organizada.
                    </h1>
                    <p className="mt-6 max-w-3xl text-lg leading-[1.8] text-white/72">
                      Revisa disponibilidad, costos, requisitos previos y detalles de cada
                      procedimiento desde una interfaz enfocada en lectura rápida y navegación simple.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-white/8 p-6 backdrop-blur-md">
                      <p className="text-sm uppercase tracking-[0.16em] text-white/50">Total cargados</p>
                      <strong className="mt-4 block text-5xl font-syne">{services.length}</strong>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/8 p-6 backdrop-blur-md">
                      <p className="text-sm uppercase tracking-[0.16em] text-white/50">Disponibles hoy</p>
                      <strong className="mt-4 block text-5xl font-syne">
                        {services.filter((item) => item.availabilityStatus === "available").length}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-10 space-y-5">
                <div className="glass-panel rounded-[28px] border border-black/6 p-4 shadow-[0_12px_40px_rgba(17,35,44,0.05)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                    <div className="relative flex-1">
                      <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                      />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Busca por nombre, código o descripción"
                        className="w-full rounded-[18px] border border-black/8 bg-white/90 py-4 pl-12 pr-12 text-[15px] focus:border-teal focus:outline-none focus:ring-[4px] focus:ring-[#1f6f78]/10"
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
                          aria-label="Limpiar búsqueda"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-3 rounded-[16px] border border-black/8 bg-white px-4 py-3 text-sm text-text-dark">
                        <Filter size={16} className="text-text-muted" />
                        <select
                          value={statusFilter}
                          onChange={(event) => setStatusFilter(event.target.value)}
                          className="bg-transparent font-medium outline-none"
                        >
                          <option value="">Todos los estados</option>
                          <option value="available">Disponible</option>
                          <option value="limited">Limitado</option>
                          <option value="unavailable">No disponible</option>
                        </select>
                      </label>

                      <button
                        onClick={loadServices}
                        className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-black/8 bg-white px-4 py-3 text-sm font-bold text-text-dark transition-colors hover:bg-[#eef4f3]"
                      >
                        <RefreshCw size={15} />
                        Actualizar
                      </button>

                      <div className="inline-flex items-center gap-2 rounded-full bg-[#edf7ef] px-4 py-3 text-sm font-medium text-[#2b6e59]">
                        <Sparkles size={14} />
                        {filteredServices.length} resultados visibles
                      </div>
                    </div>
                  </div>
                </div>

                <ContentState
                  loading={loadingServices}
                  error={servicesError}
                  empty={!filteredServices.length}
                  emptyLabel="No se encontraron servicios con ese criterio."
                >
                  <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        specialties={specialties}
                        onOpen={() => setSelectedServiceId(service.id)}
                      />
                    ))}
                  </section>
                </ContentState>
              </section>
            </>
          )}

          {activeTab === "services" && selectedService && (
            <ServiceDetail
              service={selectedService}
              specialties={specialties}
              onBack={() => setSelectedServiceId(null)}
              onOpenSpecialty={(specialtyId) => {
                setSelectedServiceId(null);
                setSelectedSpecialtyId(specialtyId);
                setActiveTab("specialties");
              }}
            />
          )}

          {activeTab === "specialties" && !selectedSpecialty && (
            <>
              <section className="rounded-[32px] border border-black/6 bg-[linear-gradient(135deg,#ffffff,rgba(242,246,242,0.95))] px-6 py-14 shadow-[0_12px_40px_rgba(17,35,44,0.05)] sm:px-8 lg:px-12">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                  <div>
                    <p className="font-dm-mono text-[12px] uppercase tracking-[0.18em] text-text-muted mb-4">
                      Especialidades
                    </p>
                    <h1 className="max-w-4xl text-5xl font-syne font-bold tracking-tight text-text-dark md:text-7xl">
                      Explora las especialidades médicas y los servicios asociados.
                    </h1>
                    <p className="mt-6 max-w-3xl text-lg leading-[1.8] text-text-mid">
                      Revisa las áreas disponibles y consulta rápidamente qué servicios
                      forman parte de cada una.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-black/6 bg-white p-6">
                      <p className="text-sm uppercase tracking-[0.16em] text-text-muted">Especialidades</p>
                      <strong className="mt-4 block text-5xl font-syne text-text-dark">
                        {specialties.length}
                      </strong>
                    </div>
                    <div className="rounded-[24px] border border-black/6 bg-white p-6">
                      <p className="text-sm uppercase tracking-[0.16em] text-text-muted">
                        Servicios relacionados
                      </p>
                      <strong className="mt-4 block text-5xl font-syne text-text-dark">
                        {specialties.reduce(
                          (total, specialty) => total + (specialty.serviceIds || []).length,
                          0
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-10">
                <ContentState
                  loading={loadingSpecialties}
                  error={specialtiesError}
                  empty={!specialties.length}
                  emptyLabel="No hay especialidades disponibles en este momento."
                >
                  <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {specialties.map((specialty) => (
                      <SpecialtyCard
                        key={specialty.id}
                        specialty={specialty}
                        onOpen={() => setSelectedSpecialtyId(specialty.id)}
                      />
                    ))}
                  </section>
                </ContentState>
              </section>
            </>
          )}

          {activeTab === "specialties" && selectedSpecialty && (
            <SpecialtyDetail
              specialty={selectedSpecialty}
              relatedServices={selectedSpecialtyServices}
              onBack={() => setSelectedSpecialtyId(null)}
              onOpenService={(serviceId) => {
                setSelectedSpecialtyId(null);
                setSelectedServiceId(serviceId);
                setActiveTab("services");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function ContentState({ loading, error, empty, emptyLabel, children }) {
  if (loading) {
    return (
      <section className="rounded-[28px] border border-black/6 bg-white p-16 text-center shadow-[0_12px_32px_rgba(17,35,44,0.05)]">
        <div className="mx-auto h-10 w-10 rounded-full border-[3px] border-teal/20 border-t-teal animate-spin" />
        <p className="mt-5 text-text-mid">Cargando información...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-[#ebc6c0] bg-[#fff5f3] p-16 text-center shadow-[0_12px_32px_rgba(17,35,44,0.05)]">
        <CircleAlert size={20} className="mx-auto text-[#9a5047]" />
        <p className="mt-5 text-[#8e5750]">{error}</p>
      </section>
    );
  }

  if (empty) {
    return (
      <section className="rounded-[28px] border border-black/6 bg-white p-16 text-center shadow-[0_12px_32px_rgba(17,35,44,0.05)]">
        <Search size={18} className="mx-auto text-text-muted" />
        <p className="mt-5 text-text-mid">{emptyLabel}</p>
      </section>
    );
  }

  return children;
}

function ServiceCard({ service, specialties, onOpen }) {
  const Icon = serviceIcon(service);
  const specialtyLabels = specialties.filter((item) =>
    (service.specialtyIds || []).includes(item.id)
  );

  return (
    <article
      onClick={onOpen}
      className="group overflow-hidden rounded-[30px] border border-black/6 bg-white shadow-[0_14px_34px_rgba(17,35,44,0.06)] transition-all hover:-translate-y-[4px] hover:shadow-[0_24px_46px_rgba(17,35,44,0.10)]"
    >
      <div className="relative isolate">
        <ImageFrame
          src={serviceImageSrc(service.id)}
          alt={service.name}
          icon={Icon}
          className="h-64 w-full"
          fallbackLabel="Imagen clínica"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,28,0.10),transparent_28%,rgba(10,20,28,0.34)_100%)]" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/88 text-teal shadow-[0_10px_24px_rgba(17,35,44,0.10)] backdrop-blur-md">
            <Icon size={18} />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-[0_8px_20px_rgba(17,35,44,0.08)] backdrop-blur-sm ${statusMeta(service.availabilityStatus)}`}>
              {service.availabilityStatus === "available"
                ? "Disponible"
                : service.availabilityStatus === "limited"
                  ? "Limitado"
                  : "No disponible"}
            </span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-[0_8px_20px_rgba(17,35,44,0.08)] backdrop-blur-sm ${activeMeta(service.isActive)}`}>
              {service.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-5">
          <div className="max-w-[82%] rounded-[22px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] p-4 text-white shadow-[0_18px_32px_rgba(5,12,18,0.22)] backdrop-blur-md">
            <p className="font-dm-mono text-[11px] uppercase tracking-[0.18em] text-white/76">
              {service.code}
            </p>
            <h3 className="mt-2 text-[28px] leading-[0.96] font-bold">
              {service.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="relative -mt-6 rounded-t-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),#ffffff)] px-5 pb-5 pt-7">
        <div className="space-y-5">
          <div>
            <p className="text-[15px] leading-[1.8] text-text-mid">
            {service.shortDescription}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-sand-light px-4 py-2.5 text-sand">
              <BadgeDollarSign size={15} />
              <span className="font-dm-mono font-bold">
                {formatCurrency(service.price, service.currency)}
              </span>
            </div>

            <div className="text-sm font-medium text-text-muted">
              {service.durationMinutes} min
            </div>
          </div>

          <div className="flex min-h-[34px] flex-wrap gap-2">
            {specialtyLabels.map((specialty) => (
              <span
                key={specialty.id}
                className="rounded-full border border-black/8 bg-[#f7fafb] px-3 py-1.5 text-[12px] font-medium text-text-mid"
              >
                {specialty.name}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-black/6 pt-4 text-sm font-bold text-teal">
            <span>Ver detalle</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function SpecialtyCard({ specialty, onOpen }) {
  const Icon = specialtyIcon(specialty.id);

  return (
    <article
      onClick={onOpen}
      className="group overflow-hidden rounded-[30px] border border-black/6 bg-white shadow-[0_14px_34px_rgba(17,35,44,0.06)] transition-all hover:-translate-y-[4px] hover:shadow-[0_24px_46px_rgba(17,35,44,0.10)]"
    >
      <div className="relative isolate">
        <ImageFrame
          src={specialtyImageSrc(specialty.id)}
          alt={specialty.name}
          icon={Icon}
          accent="sand"
          className="h-60 w-full"
          fallbackLabel="Imagen médica"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,12,0.08),transparent_28%,rgba(18,16,12,0.28)_100%)]" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/88 text-sand shadow-[0_10px_24px_rgba(17,35,44,0.10)] backdrop-blur-md">
            <Icon size={18} />
          </div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-[0_8px_20px_rgba(17,35,44,0.08)] backdrop-blur-sm ${activeMeta(specialty.isActive)}`}>
            {specialty.isActive ? "Activa" : "Inactiva"}
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-5">
          <div className="max-w-[84%] rounded-[22px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.10))] p-4 text-white shadow-[0_18px_32px_rgba(5,12,18,0.20)] backdrop-blur-md">
            <p className="font-dm-mono text-[11px] uppercase tracking-[0.18em] text-white/76">
              {specialty.code}
            </p>
            <h3 className="mt-2 text-[28px] leading-[0.98] font-bold">
              {specialty.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="relative -mt-6 rounded-t-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),#ffffff)] px-5 pb-5 pt-7">
        <div className="space-y-5">
          <div>
            <p className="text-[15px] leading-[1.8] text-text-mid">
              {specialty.description}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-teal-light px-4 py-2.5 text-teal">
            <BriefcaseMedical size={15} />
            <span className="font-medium">
              {(specialty.serviceIds || []).length} servicios relacionados
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-black/6 pt-4 text-sm font-bold text-teal">
            <span>Abrir especialidad</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ServiceDetail({ service, specialties, onBack, onOpenSpecialty }) {
  const Icon = serviceIcon(service);
  const labels = specialties.filter((item) => (service.specialtyIds || []).includes(item.id));

  return (
    <section className="pt-2">
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-teal hover:text-teal-hover"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Volver a servicios
      </button>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
        <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_48px_rgba(17,35,44,0.08)]">
          <ImageFrame
            src={serviceImageSrc(service.id)}
            alt={service.name}
            icon={Icon}
            className="aspect-square w-full"
            iconSize={84}
            fallbackLabel="Imagen del servicio"
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-dm-mono text-[12px] uppercase tracking-[0.18em] text-text-muted mb-3">
              {service.code}
            </p>
            <h1 className="font-syne text-[42px] leading-[1.02] font-bold text-text-dark">
              {service.name}
            </h1>
            <p className="mt-4 text-[17px] leading-[1.8] text-text-mid">
              {service.technicalDescription}
            </p>
          </div>

          <div className="rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_12px_32px_rgba(17,35,44,0.05)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="text-[34px] font-dm-mono font-bold text-text-dark">
                <span className="mr-1 text-teal">Q</span>
                {Number(service.price).toLocaleString("es-GT", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${statusMeta(service.availabilityStatus)}`}>
                  {service.availabilityStatus === "available"
                    ? "Disponible"
                    : service.availabilityStatus === "limited"
                      ? "Limitado"
                      : "No disponible"}
                </span>
                <span className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${activeMeta(service.isActive)}`}>
                  {service.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 text-text-mid">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="mt-1 text-teal" />
                <span>Duración estimada: {service.durationMinutes} minutos</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="mt-1 text-teal" />
                <span>Creado: {formatDate(service.createdAt)}</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="mt-1 text-teal" />
                <span>Actualizado: {formatDate(service.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-black/5 bg-[linear-gradient(135deg,#ffffff,#f2f7f7)] p-6">
            <div className="mb-4 flex items-center gap-2 text-teal">
              <ShieldCheck size={18} />
              <p className="font-bold">Requisitos y especialidades</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-3 text-text-mid">
                {(service.preparationRequirements || []).map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-1 text-teal" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {labels.map((specialty) => (
                  <button
                    key={specialty.id}
                    onClick={() => onOpenSpecialty(specialty.id)}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-bold text-teal hover:border-teal/35 hover:bg-teal-light"
                  >
                    {specialty.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecialtyDetail({ specialty, relatedServices, onBack, onOpenService }) {
  const Icon = specialtyIcon(specialty.id);

  return (
    <section className="pt-2">
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-teal hover:text-teal-hover"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Volver a especialidades
      </button>

      <div className="rounded-[30px] border border-black/6 bg-white p-8 shadow-[0_18px_48px_rgba(17,35,44,0.06)]">
        <div className="mb-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
            <ImageFrame
              src={specialtyImageSrc(specialty.id)}
              alt={specialty.name}
              icon={Icon}
              accent="sand"
              className="aspect-[4/5] w-full rounded-[24px] border border-black/6"
              iconSize={72}
              fallbackLabel="Imagen de la especialidad"
            />
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#f1e3d8] text-sand">
                <Icon size={22} />
              </div>
            <p className="font-dm-mono text-[12px] uppercase tracking-[0.18em] text-text-muted mb-3">
              {specialty.code}
            </p>
            <h1 className="font-syne text-[42px] leading-[1.02] font-bold text-text-dark">
              {specialty.name}
            </h1>
            <p className="mt-4 max-w-3xl text-[17px] leading-[1.8] text-text-mid">
              {specialty.description}
            </p>
          </div>
          </div>

          <div className="rounded-[22px] border border-black/5 bg-[linear-gradient(135deg,#ffffff,#f7f1ec)] p-6 text-right">
            <p className="text-sm uppercase tracking-[0.16em] text-text-muted">Servicios asociados</p>
            <strong className="mt-3 block font-syne text-5xl text-text-dark">
              {(specialty.serviceIds || []).length}
            </strong>
          </div>
        </div>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-dm-mono text-[12px] uppercase tracking-[0.18em] text-text-muted mb-2">
                Servicios relacionados
              </p>
              <h2 className="font-syne text-[32px] font-bold text-text-dark">
                Servicios disponibles en esta especialidad
              </h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedServices.map((service) => {
              const RelatedIcon = serviceIcon(service);
              return (
                <button
                  key={service.id}
                  onClick={() => onOpenService(service.id)}
                  className="overflow-hidden rounded-[22px] border border-black/5 bg-white text-left shadow-[0_12px_30px_rgba(17,35,44,0.06)] transition-all hover:-translate-y-[4px]"
                >
                  <ImageFrame
                    src={serviceImageSrc(service.id)}
                    alt={service.name}
                    icon={RelatedIcon}
                    className="aspect-[4/3] w-full"
                    iconSize={58}
                    fallbackLabel="Imagen clínica"
                  />
                  <div className="p-5">
                    <p className="mb-2 font-dm-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
                      {service.code}
                    </p>
                    <h3 className="font-syne text-[24px] font-bold leading-tight text-text-dark">
                      {service.name}
                    </h3>
                    <p className="mt-3 text-text-mid">{service.shortDescription}</p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-sand-light px-4 py-2 text-sand">
                      <BadgeDollarSign size={15} />
                      <span className="font-dm-mono font-bold">
                        {formatCurrency(service.price, service.currency)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}

export default App;
