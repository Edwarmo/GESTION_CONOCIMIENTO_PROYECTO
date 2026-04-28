import VideoBackground from "../components/VideoBackground";
import MenuLanding from "../components/MenuLanding";

export default function HomePage() {
  return (
    <main className="main-layout" style={{ display: 'block', padding: 0 }}>
      {/* Immersive background component that does not block interaction */}
      <VideoBackground />

      {/* Renderizamos la nueva Landing del Menú, que internamente carga el Formulario */}
      <MenuLanding />
      
    </main>
  );
}
