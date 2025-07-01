import React, { useRef, useEffect, useState } from "react";

const myVideoComponent: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    getMedia();

    // Clean up on unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  return (
    <div>
      <video ref={localVideoRef} autoPlay playsInline muted />{" "}
      {/* Muted for local preview */}
    </div>
  );
};

export default myVideoComponent;
