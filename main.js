(() => {
  "use strict";

  /* ==========================================================
     CONFIGURACIÓN — editá estos datos
     ========================================================== */
  const CONFIG = {
    // WhatsApp en formato internacional, sin "+", espacios ni guiones.
    // Argentina: 549 + código de área sin el 0 + número sin el 15. Ej: 5491122334455
    whatsapp: "5493854096068",

    // Opcional: link a tu agenda online (Google Calendar, Calendly, Cal.com).
    // Si queda vacío, no se muestra.
    calendarUrl: "",

    // Opcional: email de contacto. Si queda vacío, no se muestra.
    email: "",
  };

  const waLink = (text) =>
    `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

  /* ---------- Links de contacto ---------- */
  document.querySelectorAll("[data-whatsapp]").forEach((a) => {
    a.href = waLink("Hola Alejandro, te escribo desde tu web.");
    a.target = "_blank";
    a.rel = "noopener";
  });

  if (CONFIG.calendarUrl) {
    document.querySelectorAll("[data-calendar]").forEach((el) => (el.hidden = false));
    document.querySelectorAll("[data-calendar-link]").forEach((a) => (a.href = CONFIG.calendarUrl));
  }

  if (CONFIG.email) {
    document.querySelectorAll("[data-email]").forEach((el) => (el.hidden = false));
    document.querySelectorAll("[data-email-link]").forEach((a) => (a.href = `mailto:${CONFIG.email}`));
  }

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Header con borde al scrollear ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Aparición al hacer scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Formulario de reunión ---------- */
  const form = document.getElementById("booking-form");
  const success = document.getElementById("booking-success");
  const successLink = success.querySelector("[data-success-link]");
  const dateInput = form.elements.fecha;

  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = (v) => {
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const daysFromToday = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
  };

  dateInput.min = toISO(daysFromToday(1));
  dateInput.max = toISO(daysFromToday(90));

  dateInput.addEventListener("input", () => {
    const isSunday = dateInput.value && parseISO(dateInput.value).getDay() === 0;
    dateInput.setCustomValidity(isSunday ? "Los domingos no tomo reuniones. Elegí de lunes a sábado." : "");
  });

  const line = (label, value) => {
    const v = (value || "").trim();
    return v ? `• ${label}: ${v}` : null;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.classList.add("was-validated");
    if (!form.reportValidity()) return;

    const f = form.elements;
    const fecha = parseISO(f.fecha.value)
      .toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
      .replace(",", "");

    const message = [
      "Hola Alejandro, quiero agendar una reunión.",
      "",
      line("Nombre", f.nombre.value),
      line("Empresa / estudio", f.empresa.value),
      line("Perfil", f.perfil.value),
      line("Proyecto", f.proyecto.value),
      line("Zona de la obra", f.zona.value),
      line("Modalidad", f.modalidad.value),
      line("Fecha preferida", `${fecha}, ${f.franja.value}`),
      line("Detalle", f.mensaje.value),
    ]
      .filter((l) => l !== null)
      .join("\n");

    const url = waLink(message);
    window.open(url, "_blank", "noopener");

    successLink.href = url;
    form.hidden = true;
    success.hidden = false;
    success.focus({ preventScroll: true });
    success.scrollIntoView({ block: "center" });
  });

  success.querySelector("[data-edit]").addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.nombre.focus();
  });
})();
