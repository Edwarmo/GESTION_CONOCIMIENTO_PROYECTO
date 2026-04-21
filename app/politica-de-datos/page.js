import Link from "next/link";

export const metadata = {
  title: "Política de Tratamiento de Datos — Feelback",
  description: "Política de tratamiento de datos personales conforme a la Ley 1581 de 2012.",
};

const h2Style = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--color-primary-cyan)",
  margin: "0 0 0.4rem 0",
};

const ulStyle = { margin: "0.25rem 0 0 1.25rem", padding: 0 };

export default function PoliticaDeDatos() {
  return (
    <main className="main-layout" style={{ alignItems: "flex-start", padding: "2rem 1.5rem" }}>
      <div className="content-wrapper" style={{ maxWidth: 680 }}>
        <div className="glass-panel glow-cyan animate-fade-slide">

          <div className="card-header">
            <h1 className="text-glow-cyan" style={{ fontSize: "1.5rem" }}>
              Política de Tratamiento de Datos Personales
            </h1>
            <p>Conforme a la Ley 1581 de 2012 — Colombia</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.92rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>

            <section>
              <h2 style={h2Style}>1. Responsable del Tratamiento</h2>
              <p>
                <strong>Feelback / SGPMI</strong> es el responsable del tratamiento de los datos
                personales recolectados a través de este formulario. Para consultas o solicitudes
                puede contactarnos a través del canal de WhatsApp habilitado en la plataforma.
              </p>
            </section>

            <section>
              <h2 style={h2Style}>2. Datos Recolectados</h2>
              <p>Recolectamos únicamente los datos necesarios para procesar su pedido:</p>
              <ul style={ulStyle}>
                <li>Nombre completo</li>
                <li>Número de teléfono (10 dígitos)</li>
                <li>Detalle del pedido</li>
                <li>Fecha y hora de la solicitud</li>
              </ul>
            </section>

            <section>
              <h2 style={h2Style}>3. Finalidad del Tratamiento</h2>
              <ul style={ulStyle}>
                <li>Procesar y confirmar su pedido vía WhatsApp</li>
                <li>Registrar la transacción en el sistema de gestión interno</li>
                <li>Mejorar la calidad del servicio mediante análisis agregado y anónimo</li>
                <li>Cumplir con obligaciones legales y comerciales</li>
              </ul>
            </section>

            <section>
              <h2 style={h2Style}>4. Derechos del Titular (Habeas Data)</h2>
              <p>Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013, usted tiene derecho a:</p>
              <ul style={ulStyle}>
                <li><strong>Conocer</strong> los datos personales que tenemos sobre usted</li>
                <li><strong>Actualizar</strong> sus datos cuando sean inexactos o incompletos</li>
                <li><strong>Rectificar</strong> información incorrecta</li>
                <li><strong>Suprimir</strong> sus datos cuando no sean necesarios para la finalidad declarada</li>
                <li><strong>Revocar</strong> la autorización otorgada en cualquier momento</li>
              </ul>
            </section>

            <section>
              <h2 style={h2Style}>5. Seguridad y Confidencialidad</h2>
              <p>
                Sus datos se almacenan en un repositorio de acceso restringido con control de
                permisos por roles. Solo el personal autorizado tiene acceso. Toda transmisión
                se realiza bajo protocolo TLS (HTTPS). No compartimos ni cedemos sus datos a
                terceros sin consentimiento expreso, salvo obligación legal.
              </p>
            </section>

            <section>
              <h2 style={h2Style}>6. Vigencia</h2>
              <p>
                Sus datos serán conservados durante el tiempo necesario para cumplir la
                finalidad del tratamiento y las obligaciones legales, o hasta que usted
                solicite su supresión.
              </p>
            </section>

            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>
              Última actualización: 2025
            </p>
          </div>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link
              href="/"
              className="glow-button"
              style={{ display: "inline-block", padding: "0.75rem 2rem", textDecoration: "none", fontSize: "0.9rem" }}
            >
              ← Volver al formulario
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
