import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignSelector from "../../components/practice/SignSelector";

import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

import "./Practice.css";

function Practice() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [mediapipeReady, setMediapipeReady] =
    useState(false);

  const [handsDetected, setHandsDetected] =
    useState(false);

    const [selectedSign, setSelectedSign] = useState(null);

  const [gesture, setGesture] =
    useState("No hand detected");

  /*
   * -----------------------------------------
   * INITIALIZE MEDIAPIPE
   * -----------------------------------------
   */

  const initializeHandLandmarker = async () => {
    try {
      console.log(
        "Initializing MediaPipe Hand Landmarker..."
      );

      const vision =
        await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

      const handLandmarker =
        await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            },

            runningMode: "VIDEO",

            numHands: 2,
          }
        );

      handLandmarkerRef.current =
        handLandmarker;

      setMediapipeReady(true);

      console.log(
        "MediaPipe Hand Landmarker initialized successfully."
      );
    } catch (error) {
      console.error(
        "MediaPipe initialization error:",
        error
      );

      setCameraError(
        "Unable to initialize hand tracking. Please refresh the page and try again."
      );
    }
  };

  /*
   * -----------------------------------------
   * DETECT GESTURE
   * -----------------------------------------
   */

  const detectGesture = (landmarks) => {
    /*
     * MediaPipe landmark indexes:
     *
     * Thumb:
     * 1, 2, 3, 4
     *
     * Index:
     * 5, 6, 7, 8
     *
     * Middle:
     * 9, 10, 11, 12
     *
     * Ring:
     * 13, 14, 15, 16
     *
     * Pinky:
     * 17, 18, 19, 20
     */

    /*
     * Finger is considered extended when
     * the fingertip is above its PIP joint.
     *
     * MediaPipe coordinates have:
     *
     * Y smaller = higher on image
     */

    const indexExtended =
      landmarks[8].y < landmarks[6].y;

    const middleExtended =
      landmarks[12].y < landmarks[10].y;

    const ringExtended =
      landmarks[16].y < landmarks[14].y;

    const pinkyExtended =
      landmarks[20].y < landmarks[18].y;

    /*
     * For the thumb we use the X coordinate.
     *
     * This is a simple first MVP heuristic.
     */

    const thumbExtended =
      Math.abs(
        landmarks[4].x - landmarks[2].x
      ) > 0.08;

    /*
     * Count extended fingers.
     */

    const extendedFingers = [
      thumbExtended,
      indexExtended,
      middleExtended,
      ringExtended,
      pinkyExtended,
    ].filter(Boolean).length;

    /*
     * Open palm:
     *
     * All five fingers should be extended.
     */

    if (extendedFingers === 5) {
      return "Open Palm";
    }

    /*
     * Four fingers extended.
     */

    if (
      indexExtended &&
      middleExtended &&
      ringExtended &&
      pinkyExtended
    ) {
      return "Four Fingers";
    }

    /*
     * Three fingers extended.
     */

    if (
      indexExtended &&
      middleExtended &&
      ringExtended
    ) {
      return "Three Fingers";
    }

    /*
     * Two fingers extended.
     */

    if (
      indexExtended &&
      middleExtended
    ) {
      return "Two Fingers";
    }

    /*
     * One finger extended.
     */

    if (indexExtended) {
      return "One Finger";
    }

    return "Hand detected";
  };

  /*
   * -----------------------------------------
   * DETECT HANDS
   * -----------------------------------------
   */

  const detectHands = () => {
    const video = videoRef.current;

    const canvas = canvasRef.current;

    const handLandmarker =
      handLandmarkerRef.current;

    if (
      !video ||
      !canvas ||
      !handLandmarker ||
      video.readyState < 2
    ) {
      animationFrameRef.current =
        requestAnimationFrame(detectHands);

      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      animationFrameRef.current =
        requestAnimationFrame(detectHands);

      return;
    }

    /*
     * Match canvas size with video.
     */

    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;

      canvas.height = video.videoHeight;
    }

    const ctx =
      canvas.getContext("2d");

    /*
     * Clear previous frame.
     */

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    /*
     * Run MediaPipe.
     */

    const results =
      handLandmarker.detectForVideo(
        video,
        performance.now()
      );

    /*
     * Draw and analyze hands.
     */

    if (
      results.landmarks &&
      results.landmarks.length > 0
    ) {
      setHandsDetected(true);

      const drawingUtils =
        new DrawingUtils(ctx);

      /*
       * Analyze first detected hand.
       */

      const firstHand =
        results.landmarks[0];

      const detectedGesture =
        detectGesture(firstHand);

      setGesture(detectedGesture);

      /*
       * Draw every detected hand.
       */

      for (
        const landmarks of results.landmarks
      ) {
        drawingUtils.drawConnectors(
          landmarks,
          HandLandmarker.HAND_CONNECTIONS,
          {
            color: "#4f46e5",
            lineWidth: 3,
          }
        );

        drawingUtils.drawLandmarks(
          landmarks,
          {
            color: "#ffffff",
            fillColor: "#4f46e5",
            lineWidth: 1,
            radius: 4,
          }
        );
      }
    } else {
      setHandsDetected(false);

      setGesture(
        "No hand detected"
      );
    }

    /*
     * Continue processing frames.
     */

    animationFrameRef.current =
      requestAnimationFrame(
        detectHands
      );
  };

  /*
   * -----------------------------------------
   * START CAMERA
   * -----------------------------------------
   */

  const startCamera = async () => {
    try {
      setCameraError("");

      if (
        !navigator.mediaDevices?.getUserMedia
      ) {
        setCameraError(
          "Camera access is not supported by this browser."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: false,
          }
        );

      streamRef.current = stream;

      setCameraActive(true);
    } catch (error) {
      console.error(
        "Camera error:",
        error
      );

      if (
        error.name ===
        "NotAllowedError"
      ) {
        setCameraError(
          "Camera permission was denied. Please allow camera access and try again."
        );
      } else if (
        error.name ===
        "NotFoundError"
      ) {
        setCameraError(
          "No camera was found on this device."
        );
      } else {
        setCameraError(
          "Unable to access the camera. Please try again."
        );
      }
    }
  };

  /*
   * -----------------------------------------
   * CONNECT CAMERA TO VIDEO
   * -----------------------------------------
   */

  useEffect(() => {
    if (
      cameraActive &&
      videoRef.current &&
      streamRef.current
    ) {
      const video =
        videoRef.current;

      video.srcObject =
        streamRef.current;

      video
        .play()
        .then(() => {
          console.log(
            "Camera video started."
          );

          detectHands();
        })
        .catch((error) => {
          console.error(
            "Video playback error:",
            error
          );
        });
    }
  }, [cameraActive]);

  /*
   * -----------------------------------------
   * INITIALIZE MEDIAPIPE ON PAGE LOAD
   * -----------------------------------------
   */

  useEffect(() => {
    initializeHandLandmarker();

    return () => {
      if (
        animationFrameRef.current
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }

      if (
        handLandmarkerRef.current
      ) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  /*
   * -----------------------------------------
   * STOP CAMERA
   * -----------------------------------------
   */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    if (
      animationFrameRef.current
    ) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current =
        null;
    }

    if (canvasRef.current) {
      const canvas =
        canvasRef.current;

      const ctx =
        canvas.getContext("2d");

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    setHandsDetected(false);

    setGesture(
      "No hand detected"
    );

    setCameraActive(false);
  };

  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */

  return (
    <div className="practice-page">

      {/* Header */}

      <div className="practice-header">

        <div>

          <span className="practice-eyebrow">
            SIGN PRACTICE
          </span>

          <h1>
            Practice ISL
          </h1>

          <p>
            Practice your Indian Sign Language skills
            using your camera and improve your confidence.
          </p>

        </div>

      </div>
     
      <SignSelector
        selectedSign={selectedSign}
        onSelectSign={setSelectedSign}
      />


      {/* Main Practice Area */}

      <section className="practice-card">

        {/* Camera */}

        <div className="practice-visual">

          {!cameraActive ? (

            <div className="practice-camera-placeholder">

              <span className="material-symbols-rounded">
                videocam
              </span>

              <h2>
                Camera Practice
              </h2>

              <p>
                Start a practice session to use your
                camera.
              </p>

              <button
                type="button"
                className="practice-start-button"
                onClick={startCamera}
              >

                <span className="material-symbols-rounded">
                  videocam
                </span>

                Start Practice

              </button>

              {cameraError && (

                <p className="practice-camera-error">
                  {cameraError}
                </p>

              )}

              {!mediapipeReady && (

                <p
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Preparing hand tracking...
                </p>

              )}

            </div>

          ) : (

            <div className="practice-camera-active">

              <div className="practice-video-wrapper">

                <video
                  ref={videoRef}
                  className="practice-video"
                  autoPlay
                  playsInline
                  muted
                />

                <canvas
                  ref={canvasRef}
                  className="practice-hand-canvas"
                />

                {/* Camera status */}

                <div className="practice-camera-status">

                  <span className="practice-status-dot" />

                  Camera active

                </div>

                {/* Hand status */}

                <div
                  style={{
                    position: "absolute",
                    left: "16px",
                    bottom: "16px",
                    padding: "7px 12px",
                    borderRadius: "20px",
                    background:
                      "rgba(17, 24, 39, 0.85)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "600",
                    zIndex: 5,
                  }}
                >
                  {handsDetected
                    ? "✓ Hand detected"
                    : "Show your hand"}
                </div>

              </div>

              {/* Gesture result */}

              <div
                style={{
                  padding: "18px",
                  textAlign: "center",
                  borderTop:
                    "1px solid #e5e7eb",
                  background:
                    "#ffffff",
                }}
              >

                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Detected gesture
                </p>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    color: "#111827",
                  }}
                >
                  {gesture}
                </h2>

              </div>

              {/* Stop Camera */}

              <button
                type="button"
                className="practice-stop-button"
                onClick={stopCamera}
              >

                <span className="material-symbols-rounded">
                  videocam_off
                </span>

                Stop Camera

              </button>

            </div>

          )}

        </div>

        {/* Instructions */}

        <div className="practice-instructions">

          <div className="practice-instructions-header">

            <span className="material-symbols-rounded">
              sign_language
            </span>

            <div>

              <h2>
                How Practice Works
              </h2>

              <p>
                Follow these steps to practice a sign.
              </p>

            </div>

          </div>

          <div className="practice-steps">

            <div className="practice-step">

              <div className="practice-step-number">
                1
              </div>

              <div>

                <h3>
                  Choose a sign
                </h3>

                <p>
                  Select the ISL sign you want to
                  practice.
                </p>

              </div>

            </div>

            <div className="practice-step">

              <div className="practice-step-number">
                2
              </div>

              <div>

                <h3>
                  Follow the example
                </h3>

                <p>
                  Watch the reference sign carefully
                  and observe the hand movement.
                </p>

              </div>

            </div>

            <div className="practice-step">

              <div className="practice-step-number">
                3
              </div>

              <div>

                <h3>
                  Perform the sign
                </h3>

                <p>
                  Use your camera and perform the sign
                  yourself.
                </p>

              </div>

            </div>

            <div className="practice-step">

              <div className="practice-step-number">
                4
              </div>

              <div>

                <h3>
                  Get feedback
                </h3>

                <p>
                  SAMVAAD will analyze your practice
                  and provide feedback.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Information */}

      <section className="practice-info">

        <div className="practice-info-item">

          <span className="material-symbols-rounded">
            psychology
          </span>

          <div>

            <h3>
              Learn by doing
            </h3>

            <p>
              Practice signs instead of only watching
              lessons.
            </p>

          </div>

        </div>

        <div className="practice-info-item">

          <span className="material-symbols-rounded">
            photo_camera
          </span>

          <div>

            <h3>
              Camera based
            </h3>

            <p>
              Your device camera is used during
              practice.
            </p>

          </div>

        </div>

        <div className="practice-info-item">

          <span className="material-symbols-rounded">
            trending_up
          </span>

          <div>

            <h3>
              Track improvement
            </h3>

            <p>
              Practice regularly to improve your
              performance.
            </p>

          </div>

        </div>

      </section>

      {/* Back */}

      <button
        type="button"
        className="practice-back-button"
        onClick={() =>
          navigate(
            "/student/dashboard"
          )
        }
      >

        <span className="material-symbols-rounded">
          arrow_back
        </span>

        Back to Dashboard

      </button>

    </div>
  );
}

export default Practice;