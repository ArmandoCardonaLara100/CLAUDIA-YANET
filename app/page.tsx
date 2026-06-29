import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  Brain,
  CalendarHeart,
  CheckCircle2,
  Frown,
  GraduationCap,
  Heart,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Train,
  Video,
  Wallet,
  Wind,
} from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";

const WA =
  "https://wa.me/524771576945?text=Hola%20Claudia%2C%20me%20gustar%C3%ADa%20agendar%20una%20consulta.";

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const SPECIALTIES = [
  {
    icon: Brain,
    title: "Ansiedad",
    items: [
      "Preocupación constante de lo que podría pasar",
      "Sensación de estar alerta",
      "Presión en el pecho",
      "Mente que no descansa",
      "Tensión en el cuerpo y dificultades para descansar",
    ],
  },
  {
    icon: Frown,
    title: "Depresión",
    items: [
      "Desánimo y poca energía",
      "Sensación de desesperanza",
      "Sin motivación ni disfrute",
      "Cambios en el sueño, apetito y concentración",
      "Sentirse en modo automático",
    ],
  },
  {
    icon: Lightbulb,
    title: "Educación Emocional",
    items: [
      "Dificultades al identificar, entender y expresar lo que se siente",
      "Deseo de comunicar necesidades asertivamente",
      "Querer mejorar las relaciones",
      "Afrontar los desafíos cotidianos con mayor equilibrio",
    ],
  },
  {
    icon: Activity,
    title: "Estrés",
    items: [
      "Sensación de sobrecarga y fatiga constante",
      "Preocupación constante por responsabilidades",
      "Irritabilidad y cambios de humor",
      "Dificultades digestivas, músculos rígidos, dolores de cabeza",
    ],
  },
  {
    icon: Sparkles,
    title: "Autoestima y Desarrollo Personal",
    items: [
      "Dudas sobre las capacidades, valor personal o merecimiento",
      "Autocrítica excesiva",
      "Dificultad para reconocer fortalezas",
      "Falta de confianza al tomar decisiones o enfrentar nuevos retos",
    ],
  },
  {
    icon: Wind,
    title: "Regulación Emocional",
    items: [
      "Emociones intensas, difíciles de comprender o manejar",
      "Reacciones impulsivas",
      "Dificultad para recuperar la calma tras situaciones estresantes",
      "Impacto emocional disfuncional en decisiones y relaciones",
    ],
  },
];

const TIMELINE = [
  {
    title: "Licenciatura en Psicología Educativa",
    subtitle: "CÉDULA PROFESIONAL: 12677370",
  },
  {
    title: "Certificación en Psicología Clínica",
    subtitle: "Federación Mexicana de Psicología (FMP / CPC / 1599 / 2021)",
  },
  {
    title: "Certificación en Psicoterapia Cognitivo Conductual",
    subtitle: "Federación Mexicana de Psicología (FMP / CPCC / 2657 / 2024)",
  },
];

const CURSOS = [
  "Primeros Auxilios Psicológicos",
  "Terapia Dialéctica Conductual (DBT)",
  "Reestructuración Cognitiva",
  "Derechos Humanos y Perspectiva de Género",
  "Terapia de Aceptación y Compromiso (ACT)",
];

const CHIPS = [
  "Terapia Individual",
  "DBT",
  "TCC",
  "ACT",
  "Sesiones en Línea",
  "Sesiones Presenciales",
];

export default function LandingPage() {
  return (
    <div id="top" className="bg-background scroll-smooth">
      <SiteHeader />

      {/* HERO */}
      <section className="overflow-hidden py-14 sm:py-20">
        <div className="mx-auto grid max-w-280 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="text-secondary mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(74,127,165,0.2)] bg-[#E3EEF7] px-3.5 py-1.5 text-sm font-semibold">
              <span className="size-1.5 animate-pulse rounded-full bg-current" />
              Aceptando nuevos pacientes
            </div>
            <h1 className="font-heading text-foreground text-4xl font-bold leading-tight sm:text-5xl">
              Tu bienestar mental
              <br />
              <span className="bg-[linear-gradient(135deg,#3D8B6E,#4A7FA5)] bg-clip-text text-transparent">
                importa, y es posible
              </span>
            </h1>
            <p className="text-muted-foreground mt-5 max-w-120 text-lg">
              Soy <strong>Claudia Yanet</strong>, psicoterapeuta con más de 8
              años de experiencia. Te acompaño en un proceso de autoconocimiento
              y crecimiento personal, en un espacio seguro y confidencial.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#3D8B6E,#2A6150)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                <CalendarHeart className="size-5" />
                Acceder al portal
              </Link>
              <a
                href={WA}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                <WhatsappIcon className="size-4.5" />
                WhatsApp
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-7 border-t border-[rgba(61,139,110,0.10)] pt-8">
              <Stat number="8+" label="Años de experiencia" />
              <Stat
                number="100%"
                label="Sesiones en espacio seguro y confidencial"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative aspect-5/6 w-full max-w-87.5 overflow-hidden rounded-4xl shadow-2xl">
              <Image
                src="/images/clau.jpeg"
                alt="Claudia Yanet Lara Gómez, psicóloga clínica"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 350px"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ABOUT */}
      <section id="about" className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-280 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              {["consultorio.jpeg", "consultorio2.jpeg"].map((src) => (
                <div
                  key={src}
                  className="relative aspect-3/4 overflow-hidden rounded-3xl shadow-md"
                >
                  <Image
                    src={`/images/${src}`}
                    alt="Consultorio de Claudia"
                    fill
                    sizes="(max-width: 1024px) 45vw, 250px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="bg-card absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-2xl border border-[rgba(61,139,110,0.10)] px-5 py-3 shadow-lg">
              <strong className="font-heading text-primary text-lg">
                ¡Agenda tu Cita!
              </strong>
            </div>
          </div>

          <div>
            <SectionLabel icon={<Heart className="size-3.5" />}>
              Sobre mí
            </SectionLabel>
            <h2 className="font-heading text-foreground mb-3 text-3xl font-bold">
              Un espacio de escucha y transformación
            </h2>
            <div className="text-muted-foreground space-y-3.5">
              <p>
                Soy <strong>Claudia Yanet Lara Gómez</strong>, psicóloga
                educativa certificada como clínica y psicoterapeuta
                cognitivo-conductual por la Federación Mexicana de Psicología. En
                mi consulta privada combino la evidencia científica con la
                calidez de una escucha activa y libre de juicios.
              </p>
              <p>
                A través de enfoques como TCC, DBT y ACT, facilito procesos
                terapéuticos orientados al desarrollo personal y al bienestar
                psicológico.
              </p>
              <p>
                Ofrezco un espacio seguro, libre de juicios y con un trato
                profundamente humano, donde cada intervención se personaliza
                según las necesidades de cada consultante.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {CHIPS.map((c) => (
                <span
                  key={c}
                  className="text-primary bg-muted inline-flex items-center gap-1.5 rounded-full border border-[rgba(61,139,110,0.18)] px-3.5 py-1.5 text-sm font-medium"
                >
                  <CheckCircle2 className="size-4" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* SPECIALTIES */}
      <section id="specialties" className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-280 px-4 sm:px-6">
          <div className="mb-12 text-center">
            <SectionLabel icon={<Brain className="size-3.5" />} center>
              Áreas de especialidad
            </SectionLabel>
            <h2 className="font-heading text-foreground text-3xl font-bold">
              ¿En qué te puedo ayudar?
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-140">
              Trabajo con una amplia variedad de situaciones emocionales y
              psicológicas. Si algo te resuena, estoy aquí para escucharte.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALTIES.map(({ icon: Icon, title, items }) => (
              <article
                key={title}
                className="bg-background rounded-2xl border border-[rgba(61,139,110,0.10)] p-7 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="bg-primary/10 text-primary mb-4 flex size-13 items-center justify-center rounded-2xl">
                  <Icon className="size-6.5" />
                </div>
                <h3 className="text-foreground mb-2 font-bold">{title}</h3>
                <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
                  {items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* EDUCATION */}
      <section id="education" className="py-16 sm:py-20">
        <div className="mx-auto max-w-280 px-4 sm:px-6">
          <div className="mb-12">
            <SectionLabel icon={<GraduationCap className="size-3.5" />}>
              Formación académica
            </SectionLabel>
            <h2 className="font-heading text-foreground text-3xl font-bold">
              Preparación y certificaciones
            </h2>
            <p className="text-muted-foreground mt-3">
              Una trayectoria académica sólida respaldada por formación continua.
            </p>
          </div>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="text-primary mb-5 flex items-center gap-2 font-bold">
                <GraduationCap className="size-5" />
                Estudios universitarios y certificaciones profesionales
              </h3>
              <ol className="relative space-y-6">
                {TIMELINE.map((t, i) => (
                  <li key={t.title} className="relative pl-7">
                    <span className="bg-primary absolute left-0 top-1.5 size-3.5 rounded-full ring-4 ring-[rgba(61,139,110,0.15)]" />
                    {i < TIMELINE.length - 1 && (
                      <span className="absolute left-1.5 top-6 h-full w-0.5 bg-[rgba(61,139,110,0.10)]" />
                    )}
                    <div className="text-foreground font-bold">{t.title}</div>
                    <div className="text-muted-foreground text-sm">
                      {t.subtitle}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="relative mx-auto mt-6 aspect-square max-w-70 overflow-hidden rounded-3xl border border-[rgba(61,139,110,0.10)] shadow-md">
                <Image
                  src="/images/FMP.jpg"
                  alt="Certificaciones de la Federación Mexicana de Psicología"
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="text-primary mb-5 flex items-center gap-2 font-bold">
                <Sparkles className="size-5" />
                Cursos
              </h3>
              <ul className="space-y-3">
                {CURSOS.map((c) => (
                  <li
                    key={c}
                    className="bg-card flex items-center gap-3.5 rounded-2xl border border-[rgba(61,139,110,0.10)] p-4"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#6AB99A,#7AAECF)]">
                      <CheckCircle2 className="size-5 text-white" />
                    </span>
                    <h4 className="text-foreground text-sm font-bold">{c}</h4>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* LOCATION */}
      <section id="location" className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-280 px-4 sm:px-6">
          <div className="mb-12">
            <SectionLabel icon={<MapPin className="size-3.5" />}>
              Dónde encontrarme
            </SectionLabel>
            <h2 className="font-heading text-foreground text-3xl font-bold">
              Ubicación del consultorio
            </h2>
            <p className="text-muted-foreground mt-3">
              Atención presencial en León, Guanajuato y sesiones en línea para
              todo México.
            </p>
          </div>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <iframe
              title="Ubicación del consultorio en León, Guanajuato"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-101.6241%2C21.0831%2C-101.6041%2C21.1031&layer=mapnik&marker=21.093117%2C-101.614136"
              className="aspect-4/3 w-full rounded-4xl border-0 shadow-md"
              loading="lazy"
            />
            <div className="space-y-4">
              <LocationItem icon={<MapPin className="size-5" />} title="Dirección">
                Vía de las Orquídeas Sur #1119. La Vigatta
                <br />
                León, Guanajuato
              </LocationItem>
              <LocationItem
                icon={<CalendarHeart className="size-5" />}
                title="Horario de atención"
              >
                Lunes a Viernes: 9:00 – 19:00 h. CON PREVIA CITA.
              </LocationItem>
              <LocationItem icon={<Train className="size-5" />} title="Cómo llegar">
                Blvd Delta, frente a Centro de Gobierno.
                <br />
                Girar a la derecha por Vía de las Orquídeas.
              </LocationItem>
              <LocationItem
                icon={<Video className="size-5" />}
                title="Sesiones en línea"
              >
                Disponibles vía Google Meet
                <br />
                para todo México.
              </LocationItem>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-16 sm:py-20">
        <div className="mx-auto max-w-280 px-4 sm:px-6">
          <div className="grid items-center gap-12 overflow-hidden rounded-4xl bg-[linear-gradient(135deg,#2A6150_0%,#4A7FA5_100%)] p-10 sm:p-14 lg:grid-cols-2">
            <div>
              <SectionLabel onDark>Contacto</SectionLabel>
              <h2 className="font-heading text-3xl font-bold text-white">
                Da el primer paso hacia tu bienestar
              </h2>
              <p className="mt-3 text-white/75">
                Agenda tu primera sesión. Estoy aquí para escucharte y
                acompañarte en este proceso.
              </p>
              <a
                href={WA}
                target="_blank"
                rel="noopener"
                className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                <WhatsappIcon className="size-5" />
                Escríbeme por WhatsApp
              </a>
            </div>
            <div className="space-y-3.5">
              <ContactCard
                href={WA}
                icon={<Phone className="size-5" />}
                title="Teléfono"
              >
                +52 477 157 6945
              </ContactCard>
              <ContactCard
                href="mailto:claulagopsi@gmail.com"
                icon={<Mail className="size-5" />}
                title="Correo electrónico"
              >
                claulagopsi@gmail.com
              </ContactCard>
              <ContactCard
                icon={<Wallet className="size-5" />}
                title="Métodos de pago"
              >
                Transferencia bancaria (SPEI), tarjeta de crédito o débito
              </ContactCard>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-white/70">
        <div className="mx-auto flex max-w-280 flex-wrap items-center justify-between gap-4 px-4 py-9 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8.5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3D8B6E,#4A7FA5)]">
              <Heart className="size-4 text-white" />
            </span>
            <span className="text-sm font-semibold text-white/90">
              Claudia Yanet Lara Gómez — Psicoterapeuta
            </span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} · Todos los derechos reservados
          </p>
          <nav className="flex gap-5 text-xs">
            <a href="#top" className="hover:text-white">
              Inicio
            </a>
            <a href="#about" className="hover:text-white">
              Sobre mí
            </a>
            <a href="#contact" className="hover:text-white">
              Contacto
            </a>
            <Link href="/login" className="hover:text-white">
              Portal
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="font-heading text-primary text-3xl font-bold leading-none">
        {number}
      </div>
      <div className="text-muted-foreground mt-1 max-w-32 text-xs">{label}</div>
    </div>
  );
}

function SectionLabel({
  children,
  icon,
  center,
  onDark,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  center?: boolean;
  onDark?: boolean;
}) {
  return (
    <span
      className={`mb-3.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${
        onDark
          ? "border-white/20 bg-white/12 text-white/75"
          : "text-primary border-[rgba(61,139,110,0.18)] bg-[#E8F3EE]"
      } ${center ? "mx-auto" : ""}`}
    >
      {icon}
      {children}
    </span>
  );
}

function LocationItem({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex items-start gap-4 rounded-2xl border border-[rgba(61,139,110,0.10)] p-4.5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3D8B6E,#4A7FA5)] text-white">
        {icon}
      </span>
      <div>
        <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
          {title}
        </h4>
        <p className="text-foreground mt-0.5 font-medium">{children}</p>
      </div>
    </div>
  );
}

function ContactCard({
  href,
  icon,
  title,
  children,
}: {
  href?: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
        {icon}
      </span>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/65">
          {title}
        </h4>
        <p className="font-medium text-white">{children}</p>
      </div>
    </>
  );
  const cls =
    "flex items-center gap-3.5 rounded-2xl border border-white/18 bg-white/12 p-4 transition hover:bg-white/18";
  return href ? (
    <a href={href} target="_blank" rel="noopener" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function Divider() {
  return <div className="h-px bg-[rgba(61,139,110,0.10)]" />;
}
