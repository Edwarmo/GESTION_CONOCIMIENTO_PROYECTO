import VideoBackground from "@/components/VideoBackground";

export const metadata = {
  title: "Login — Gestión de Conocimiento",
  description: "Inicia sesión, regístrate o agrega personas al sistema.",
};

export default function LoginLayout({ children }) {
  return (
    <>
      <VideoBackground />
      {children}
    </>
  );
}
