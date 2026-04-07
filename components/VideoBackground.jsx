"use client";

import { useEffect, useRef } from "react";

export default function VideoBackground() {
  const VIDEO_ID = "2OzlksZBTiA";
  const START_SECONDS = 52; // 0:52 exacto
  const END_SECONDS = 112; // Un minuto después (52 + 60)

  const playerRef = useRef(null);

  useEffect(() => {
    // Cargamos el script de YouTube a la fuerza si no existe
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const initPlayer = () => {
      if (!document.getElementById("yt-player")) return;
      
      // YT.Player de The YouTube API
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0, // No vídeos relacionados
          showinfo: 0,
          mute: 1, // Se apaga obligatoriamente para autoPlay
          modestbranding: 1,
          playsinline: 1,
          start: START_SECONDS,
          end: END_SECONDS
        },
        events: {
          onReady: (event) => {
            event.target.mute(); // Asegurar mute de nuevo
            event.target.playVideo();
          },
          onStateChange: (event) => {
            // El estado 0 es YT.PlayerState.ENDED (terminó ese mini bloque por la variable END)
            if (event.data === 0) { 
              event.target.seekTo(START_SECONDS); 
              event.target.playVideo(); 
            }
          }
        }
      });
    };

    // Montar o registrar el callback global dependiente de la API
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      // Limpiar video del caché al quitar la página
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="video-container">
      {/* Wrapper CSS encargado de cubrir perfectamente la pantalla completa en bucle */}
      <div className="video-element">
        <div id="yt-player" style={{ width: "100%", height: "100%", border: "none" }} />
      </div>
      
      {/* Malla oscura estetica glassmorphism */}
      <div className="video-overlay" />
    </div>
  );
}
