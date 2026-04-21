import VideoBackground from "../components/VideoBackground";
import FormComponent from "../components/FormComponent";

export default function HomePage() {
  return (
    <main className="main-layout">
      {/* Immersive background component that does not block interaction */}
      <VideoBackground />

      {/* Main centered interactive area */}
      <div className="content-wrapper animate-fade-slide">
        
        {/* Glassmorphism panel with specific SaaS premium properties and Neon Cyan Glow */}
        <section className="glass-panel glow-cyan">
          
          <header className="card-header">
            <h1 className="text-glow-cyan">Inicia tu Pedido</h1>
            <p>Automatización de ingresos vía WhatsApp</p>
          </header>

          <div className="form-wrapper mt-4">
             <FormComponent />
          </div>
          
        </section>
        
      </div>
    </main>
  );
}
