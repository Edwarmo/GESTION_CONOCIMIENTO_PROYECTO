"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ToastAlert from "@/components/ToastAlert";

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TAB_LOGIN = "login";
const TAB_REGISTER = "register";
const TAB_PERSON = "person";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(TAB_LOGIN);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "success", message: "" });

  const showToast = (message, type = "success") =>
    setToast({ visible: true, type, message });
  const closeToast = () => setToast((p) => ({ ...p, visible: false }));

  // ── Form states ─────────────────────────────────────────────────────────
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [personData, setPersonData] = useState({ name: "", email: "", phone: "", role: "VIEWER", notes: "" });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLoginChange = (e) => setLoginData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleRegisterChange = (e) => setRegisterData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePersonChange = (e) => setPersonData((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      return showToast("Completa todos los campos.", "warning");
    }
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: loginData.email,
        password: loginData.password,
      });
      if (res?.error) {
        showToast("Credenciales incorrectas. Intenta de nuevo.", "error");
      } else {
        showToast("¡Bienvenido de vuelta! Redirigiendo...", "success");
        setTimeout(() => router.push("/"), 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER USER ────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, confirm } = registerData;
    if (!name || !email || !password || !confirm) return showToast("Completa todos los campos.", "warning");
    if (password !== confirm) return showToast("Las contraseñas no coinciden.", "warning");
    if (password.length < 6) return showToast("La contraseña debe tener al menos 6 caracteres.", "warning");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error ?? "Error al registrar.", "error");
      showToast("¡Cuenta creada! Ahora inicia sesión.", "success");
      setRegisterData({ name: "", email: "", password: "", confirm: "" });
      setTimeout(() => setActiveTab(TAB_LOGIN), 1500);
    } catch {
      showToast("Error de conexión.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER EXTRA PERSON ────────────────────────────────────────────────
  const handlePersonRegister = async (e) => {
    e.preventDefault();
    const { name, email, phone, role, notes } = personData;
    if (!name || !email) return showToast("Nombre y email son obligatorios.", "warning");

    setLoading(true);
    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role, notes }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error ?? "Error al registrar persona.", "error");
      showToast("¡Persona registrada y guardada en Sheets! ✅", "success");
      setPersonData({ name: "", email: "", phone: "", role: "VIEWER", notes: "" });
    } catch {
      showToast("Error de conexión.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="main-layout">
      <div className="content-wrapper animate-fade-slide" style={{ maxWidth: "520px" }}>
        <section className="glass-panel glow-cyan">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <header className="card-header">
            <div className="auth-logo">
              <span className="auth-logo-icon">⚡</span>
            </div>
            <h1 className="text-glow-cyan">
              {activeTab === TAB_LOGIN && "Bienvenido"}
              {activeTab === TAB_REGISTER && "Crear Cuenta"}
              {activeTab === TAB_PERSON && "Registrar Persona"}
            </h1>
            <p>
              {activeTab === TAB_LOGIN && "Inicia sesión en tu cuenta"}
              {activeTab === TAB_REGISTER && "Únete a la plataforma"}
              {activeTab === TAB_PERSON && "Agrega una persona adicional al sistema"}
            </p>
          </header>

          {/* ── Tab Switcher ─────────────────────────────────────────────── */}
          <div className="tab-switcher">
            <button
              id="tab-login"
              className={`tab-btn ${activeTab === TAB_LOGIN ? "tab-active" : ""}`}
              onClick={() => setActiveTab(TAB_LOGIN)}
            >
              Iniciar Sesión
            </button>
            <button
              id="tab-register"
              className={`tab-btn ${activeTab === TAB_REGISTER ? "tab-active" : ""}`}
              onClick={() => setActiveTab(TAB_REGISTER)}
            >
              Registrarse
            </button>
            <button
              id="tab-person"
              className={`tab-btn ${activeTab === TAB_PERSON ? "tab-active" : ""}`}
              onClick={() => setActiveTab(TAB_PERSON)}
            >
              + Persona
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TAB: LOGIN
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === TAB_LOGIN && (
            <form onSubmit={handleLogin} className="form-container mt-4" id="form-login">
              <div className="input-group">
                <label htmlFor="login-email" className="input-label">Email</label>
                <input
                  type="email" id="login-email" name="email"
                  className="glass-input" placeholder="tu@email.com"
                  value={loginData.email} onChange={handleLoginChange}
                  autoComplete="email"
                />
              </div>
              <div className="input-group">
                <label htmlFor="login-password" className="input-label">Contraseña</label>
                <input
                  type="password" id="login-password" name="password"
                  className="glass-input" placeholder="••••••••"
                  value={loginData.password} onChange={handleLoginChange}
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" disabled={loading} className="glow-button mt-4" id="btn-login">
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </button>
              <p className="auth-switch-text">
                ¿Sin cuenta?{" "}
                <button type="button" className="auth-link" onClick={() => setActiveTab(TAB_REGISTER)}>
                  Regístrate aquí
                </button>
              </p>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: REGISTER (USER)
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === TAB_REGISTER && (
            <form onSubmit={handleRegister} className="form-container mt-4" id="form-register">
              <div className="input-group">
                <label htmlFor="reg-name" className="input-label">Nombre Completo</label>
                <input
                  type="text" id="reg-name" name="name"
                  className="glass-input" placeholder="Ej. María García"
                  value={registerData.name} onChange={handleRegisterChange}
                  autoComplete="name"
                />
              </div>
              <div className="input-group">
                <label htmlFor="reg-email" className="input-label">Email</label>
                <input
                  type="email" id="reg-email" name="email"
                  className="glass-input" placeholder="tu@email.com"
                  value={registerData.email} onChange={handleRegisterChange}
                  autoComplete="email"
                />
              </div>
              <div className="input-group">
                <label htmlFor="reg-password" className="input-label">Contraseña</label>
                <input
                  type="password" id="reg-password" name="password"
                  className="glass-input" placeholder="Mínimo 6 caracteres"
                  value={registerData.password} onChange={handleRegisterChange}
                  autoComplete="new-password"
                />
              </div>
              <div className="input-group">
                <label htmlFor="reg-confirm" className="input-label">Confirmar Contraseña</label>
                <input
                  type="password" id="reg-confirm" name="confirm"
                  className="glass-input" placeholder="Repite tu contraseña"
                  value={registerData.confirm} onChange={handleRegisterChange}
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" disabled={loading} className="glow-button mt-4 glow-button-green" id="btn-register">
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
              <p className="auth-switch-text">
                ¿Ya tienes cuenta?{" "}
                <button type="button" className="auth-link" onClick={() => setActiveTab(TAB_LOGIN)}>
                  Inicia sesión
                </button>
              </p>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: REGISTER EXTRA PERSON
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === TAB_PERSON && (
            <form onSubmit={handlePersonRegister} className="form-container mt-4" id="form-person">
              <div className="form-badge">
                <span>📋</span> Los datos se guardan en BD y Google Sheets
              </div>
              <div className="input-group">
                <label htmlFor="per-name" className="input-label">Nombre Completo <span className="required-star">*</span></label>
                <input
                  type="text" id="per-name" name="name"
                  className="glass-input" placeholder="Ej. Carlos López"
                  value={personData.name} onChange={handlePersonChange}
                />
              </div>
              <div className="input-group">
                <label htmlFor="per-email" className="input-label">Email <span className="required-star">*</span></label>
                <input
                  type="email" id="per-email" name="email"
                  className="glass-input" placeholder="persona@email.com"
                  value={personData.email} onChange={handlePersonChange}
                />
              </div>
              <div className="input-group">
                <label htmlFor="per-phone" className="input-label">Teléfono</label>
                <input
                  type="tel" id="per-phone" name="phone"
                  className="glass-input" placeholder="Ej. 3001234567"
                  value={personData.phone} onChange={handlePersonChange}
                />
              </div>
              <div className="input-group">
                <label htmlFor="per-role" className="input-label">Rol</label>
                <select
                  id="per-role" name="role"
                  className="glass-input glass-select"
                  value={personData.role} onChange={handlePersonChange}
                >
                  <option value="VIEWER">Visualizador</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="OPERATOR">Operador</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="per-notes" className="input-label">Notas (opcional)</label>
                <textarea
                  id="per-notes" name="notes"
                  className="glass-input input-textarea"
                  placeholder="Información adicional sobre esta persona..."
                  value={personData.notes} onChange={handlePersonChange}
                  rows={3}
                />
              </div>
              <button type="submit" disabled={loading} className="glow-button mt-4 glow-button-purple" id="btn-person">
                {loading ? "Registrando..." : "Registrar Persona"}
              </button>
            </form>
          )}

        </section>
      </div>

      <ToastAlert
        type={toast.type}
        message={toast.message}
        visible={toast.visible}
        onClose={closeToast}
      />
    </main>
  );
}
