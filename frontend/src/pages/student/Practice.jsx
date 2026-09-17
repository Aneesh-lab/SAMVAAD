import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignSelector from "../../components/practice/SignSelector";
import api from "../../config/axios";

import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

import "./Practice.css";

/*
 * -----------------------------------------
 * GET SIGN NAME
 * -----------------------------------------
 */

const getSignName = (sign) => {
  if (!sign) {
    return "";
  }

  if (typeof sign === "string") {
    return sign;
  }

  return (
    sign.name ||
    sign.title ||
    sign.label ||
    ""
  );
};

/*
 * -----------------------------------------
 * GET EXPECTED GESTURE
 * -----------------------------------------
 *
 * Existing MVP mapping:
 *
 * One   → One Finger
 * Two   → Two Fingers
 * Three → Three Fingers
 * Four  → Four Fingers
 * Five  → Open Palm
 *
 * Hello, Thank You, Yes and No are handled
 * separately using movement detection.
 */

const getExpectedGesture = (sign) => {
  const signName = getSignName(sign);

  const normalizedName =
    signName.toLowerCase().trim();

  const gestureMap = {
    one: "One Finger",
    two: "Two Fingers",
    three: "Three Fingers",
    four: "Four Fingers",
    five: "Open Palm",
  };

  return gestureMap[normalizedName] || null;
};

/*
 * -----------------------------------------
 * GET MOVEMENT TARGET
 * -----------------------------------------
 *
 * These targets are used for the MVP
 * movement-based practice system.
 *
 * We use the sign ID first because IDs are
 * stable even if the visible name changes.
 */

const getMovementTarget = (sign) => {
  if (!sign) {
    return null;
  }

  /*
   * Get stable sign ID.
   */

  const signId =
    typeof sign === "object"
      ? sign.id?.toLowerCase().trim()
      : "";

  /*
   * Get visible sign name as fallback.
   */

  const signName =
    getSignName(sign)
      .toLowerCase()
      .trim();

  const movementMap = {
    hello: "Wave",
    "thank-you": "Forward Movement",
    yes: "Vertical Movement",
    no: "Side Movement",
  };

  return (
    movementMap[signId] ||
    movementMap[signName] ||
    null
  );
};

/*
 * -----------------------------------------
 * DETECT MOVEMENT
 * -----------------------------------------
 *
 * Uses recent wrist landmark positions.
 *
 * MediaPipe landmark 0 = wrist.
 *
 * Instead of comparing only the current
 * frame with the starting frame, we keep
 * a short history of wrist positions.
 *
 * This allows us to detect directional
 * movement and repeated left/right movement.
 */

const detectMovement = (
  landmarks,
  movementHistoryRef
) => {
  if (
    !landmarks ||
    landmarks.length === 0
  ) {
    return "No movement";
  }

  const wrist = landmarks[0];

  /*
   * Add current wrist position.
   */

  const history =
    movementHistoryRef.current;

  history.push({
    x: wrist.x,
    y: wrist.y,
  });

  /*
   * Keep only the latest 20 frames.
   */

  if (history.length > 20) {
    history.shift();
  }

  /*
   * Need enough frames before
   * analysing movement.
   */

  if (history.length < 8) {
    return "No movement";
  }

  /*
   * -----------------------------------------
   * DETECT WAVE
   * -----------------------------------------
   *
   * A wave is represented by repeated
   * horizontal direction changes.
   *
   * Example:
   *
   * Right → Left → Right
   */

  let directionChanges = 0;

  let previousDirection = null;

  for (
    let i = 1;
    i < history.length;
    i++
  ) {
    const deltaX =
      history[i].x -
      history[i - 1].x;

    /*
     * Ignore extremely small movement.
     */

    if (
      Math.abs(deltaX) < 0.015
    ) {
      continue;
    }

    const currentDirection =
      deltaX > 0
        ? "right"
        : "left";

    if (
      previousDirection &&
      currentDirection !==
        previousDirection
    ) {
      directionChanges += 1;
    }

    previousDirection =
      currentDirection;
  }

  /*
   * Two or more direction changes
   * indicate a wave-like movement.
   */

  if (directionChanges >= 2) {
    return "Wave";
  }

  /*
   * -----------------------------------------
   * DETECT GENERAL MOVEMENT
   * -----------------------------------------
   */

  const first =
    history[0];

  const last =
    history[history.length - 1];

  const deltaX =
    last.x - first.x;

  const deltaY =
    last.y - first.y;

  const absX =
    Math.abs(deltaX);

  const absY =
    Math.abs(deltaY);

  /*
   * Ignore very small movement.
   */

  const movementThreshold =
    0.08;

  if (
    absX < movementThreshold &&
    absY < movementThreshold
  ) {
    return "No movement";
  }

  /*
   * More vertical than horizontal.
   */

  if (absY > absX) {
    return "Vertical Movement";
  }

  /*
   * More horizontal than vertical.
   */

  return "Side Movement";
};

function Practice() {
  const navigate = useNavigate();

  /*
   * -----------------------------------------
   * REFERENCES
   * -----------------------------------------
   */

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const canvasRef = useRef(null);

  const handLandmarkerRef =
    useRef(null);

  const animationFrameRef =
    useRef(null);

  /*
   * Used by the MediaPipe animation loop
   * to always access the latest selected sign.
   */

  const selectedSignRef =
    useRef(null);

  /*
   * Used for stable gesture detection.
   */

  const stableGestureRef =
    useRef("");

  const stableFrameCountRef =
    useRef(0);

  const lastProgressUpdateRef =
    useRef(0);

  /*
   * -----------------------------------------
   * MOVEMENT REFERENCES
   * -----------------------------------------
   */

  const movementHistoryRef =
    useRef([]);

  const movementStableRef =
    useRef("");

  const movementFrameCountRef =
    useRef(0);

  /*
   * -----------------------------------------
   * PRACTICE GAMIFICATION REFERENCES
   * -----------------------------------------
   *
   * These refs make sure one practice
   * session receives only one reward.
   */

  const practiceRewardingRef =
    useRef(false);

  const practiceRewardedRef =
    useRef(false);

  const practiceCompletedRef =
    useRef(false);

  /*
   * -----------------------------------------
   * CAMERA STATE
   * -----------------------------------------
   */

  const [cameraActive, setCameraActive] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  /*
   * -----------------------------------------
   * MEDIAPIPE STATE
   * -----------------------------------------
   */

  const [mediapipeReady, setMediapipeReady] =
    useState(false);

  const [handsDetected, setHandsDetected] =
    useState(false);

  /*
   * -----------------------------------------
   * PRACTICE STATE
   * -----------------------------------------
   */

  const [selectedSign, setSelectedSign] =
    useState(null);

  const [gesture, setGesture] =
    useState("No hand detected");

  const [practiceResult, setPracticeResult] =
    useState("waiting");

  const [matchProgress, setMatchProgress] =
    useState(0);

  /*
   * -----------------------------------------
   * GAMIFICATION STATE
   * -----------------------------------------
   */

  const [practiceXP, setPracticeXP] =
    useState(0);

  const [practiceStreak, setPracticeStreak] =
    useState(0);

  const [practiceAchievements, setPracticeAchievements] =
    useState([]);

  const [practiceRewardError, setPracticeRewardError] =
    useState("");

  /*
   * -----------------------------------------
   * MOVEMENT STATE
   * -----------------------------------------
   */

  const [detectedMovement, setDetectedMovement] =
    useState("No movement");

  /*
   * -----------------------------------------
   * INITIALIZE MEDIAPIPE
   * -----------------------------------------
   */

  const initializeHandLandmarker =
    async () => {
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
   *
   * EXISTING FINGER DETECTION
   *
   * This logic is kept unchanged.
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
     * -----------------------------------------
     * FINGER EXTENSION
     * -----------------------------------------
     */

    const indexExtended =
      landmarks[8].y <
      landmarks[6].y;

    const middleExtended =
      landmarks[12].y <
      landmarks[10].y;

    const ringExtended =
      landmarks[16].y <
      landmarks[14].y;

    const pinkyExtended =
      landmarks[20].y <
      landmarks[18].y;

    /*
     * -----------------------------------------
     * THUMB EXTENSION
     * -----------------------------------------
     */

    const thumbExtended =
      Math.abs(
        landmarks[4].x -
          landmarks[2].x
      ) > 0.08;

    /*
     * -----------------------------------------
     * COUNT EXTENDED FINGERS
     * -----------------------------------------
     */

    const extendedFingers = [
      thumbExtended,
      indexExtended,
      middleExtended,
      ringExtended,
      pinkyExtended,
    ].filter(Boolean).length;

    /*
     * -----------------------------------------
     * OPEN PALM
     * -----------------------------------------
     */

    if (extendedFingers === 5) {
      return "Open Palm";
    }

    /*
     * -----------------------------------------
     * FOUR FINGERS
     * -----------------------------------------
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
     * -----------------------------------------
     * THREE FINGERS
     * -----------------------------------------
     */

    if (
      indexExtended &&
      middleExtended &&
      ringExtended
    ) {
      return "Three Fingers";
    }

    /*
     * -----------------------------------------
     * TWO FINGERS
     * -----------------------------------------
     */

    if (
      indexExtended &&
      middleExtended
    ) {
      return "Two Fingers";
    }

    /*
     * -----------------------------------------
     * ONE FINGER
     * -----------------------------------------
     */

    if (indexExtended) {
      return "One Finger";
    }

    return "Hand detected";
  };

  /*
   * -----------------------------------------
   * RESET MOVEMENT MATCHING
   * -----------------------------------------
   */

  const resetMovementMatching = () => {
    movementHistoryRef.current =
      [];

    movementStableRef.current =
      "";

    movementFrameCountRef.current =
      0;

    setDetectedMovement(
      "No movement"
    );
  };

  /*
   * -----------------------------------------
   * RESET PRACTICE GAMIFICATION
   * -----------------------------------------
   */

  const resetPracticeGamification = () => {
    practiceRewardingRef.current =
      false;

    practiceRewardedRef.current =
      false;

    practiceCompletedRef.current =
      false;

    setPracticeXP(0);

    setPracticeStreak(0);

    setPracticeAchievements([]);

    setPracticeRewardError("");
  };

  /*
   * -----------------------------------------
   * 116D — COMPLETE PRACTICE GAMIFICATION
   * -----------------------------------------
   */

  const completePracticeGamification =
    async () => {
      /*
       * Prevent duplicate reward requests.
       */

      if (
        practiceRewardingRef.current ||
        practiceRewardedRef.current 
      ) {
        return;
      }

      practiceRewardingRef.current =
        true;

      setPracticeRewardError("");

      try {
        const response =
          await api.post(
            "/student/practice/complete"
          );

        if (response.data?.success) {
          /*
           * Mark practice as completed
           * before updating the UI.
           */

          practiceCompletedRef.current =
            true;

          practiceRewardedRef.current =
            true;

          /*
           * Store reward information.
           */

          setPracticeXP(
            response.data.xpAwarded || 0
          );

          setPracticeStreak(
            response.data.streak || 0
          );

          setPracticeAchievements(
            response.data.achievementsUnlocked || []
          );
        }
      } catch (error) {
        console.error(
          "Practice gamification error:",
          error
        );

        setPracticeRewardError(
          error.response?.data?.message ||
            "Unable to update practice rewards."
        );
      } finally {
        practiceRewardingRef.current =
          false;
      }
    };

  /*
   * -----------------------------------------
   * 116G — COMPARE MOVEMENT
   * -----------------------------------------
   */

  const compareMovement = (
    landmarks,
    expectedMovement
  ) => {
    /*
     * IMPORTANT:
     * Once the practice is matched,
     * do not allow the continuous MediaPipe
     * loop to change the result.
     */

    if (
      practiceCompletedRef.current
    ) {
      return;
    }

    /*
     * Detect current movement from
     * recent wrist positions.
     */

    const currentMovement =
      detectMovement(
        landmarks,
        movementHistoryRef
      );

    setDetectedMovement(
      currentMovement
    );

    /*
     * -----------------------------------------
     * NO MOVEMENT YET
     * -----------------------------------------
     */

    if (
      currentMovement ===
      "No movement"
    ) {
      movementStableRef.current =
        "";

      movementFrameCountRef.current =
        0;

      setMatchProgress(0);

      setPracticeResult(
        "waiting"
      );

      return;
    }

    /*
     * -----------------------------------------
     * CORRECT MOVEMENT
     * -----------------------------------------
     */

    if (
      currentMovement ===
      expectedMovement
    ) {
      if (
        movementStableRef.current !==
        currentMovement
      ) {
        movementStableRef.current =
          currentMovement;

        movementFrameCountRef.current =
          0;
      }

      movementFrameCountRef.current +=
        1;

      const requiredMovementFrames =
        15;

      const progress =
        Math.min(
          100,
          Math.round(
            (movementFrameCountRef.current /
              requiredMovementFrames) *
              100
          )
        );

      setMatchProgress(
        progress
      );

      /*
       * Successful movement match.
       */

      if (
  movementFrameCountRef.current >=
  requiredMovementFrames
) {
  practiceCompletedRef.current = true;

  setPracticeResult(
    "matched"
  );

  completePracticeGamification();
      } else {
        setPracticeResult(
          "checking"
        );
      }

      return;
    }

    /*
     * -----------------------------------------
     * WRONG MOVEMENT
     * -----------------------------------------
     */

    movementStableRef.current =
      currentMovement;

    movementFrameCountRef.current =
      0;

    setMatchProgress(0);

    setPracticeResult(
      "not-matched"
    );
  };

  /*
   * -----------------------------------------
   * DETECT HANDS
   * -----------------------------------------
   */

  const detectHands = () => {
    /*
     * Once practice is successfully matched,
     * stop changing the recognition result.
     */

    if (
      practiceCompletedRef.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    const handLandmarker =
      handLandmarkerRef.current;

    /*
     * Wait until camera, canvas and
     * MediaPipe are ready.
     */

    if (
      !video ||
      !canvas ||
      !handLandmarker ||
      video.readyState < 2
    ) {
      animationFrameRef.current =
        requestAnimationFrame(
          detectHands
        );

      return;
    }

    /*
     * Make sure video dimensions exist.
     */

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      animationFrameRef.current =
        requestAnimationFrame(
          detectHands
        );

      return;
    }

    /*
     * -----------------------------------------
     * MATCH CANVAS SIZE WITH VIDEO
     * -----------------------------------------
     */

    if (
      canvas.width !==
        video.videoWidth ||
      canvas.height !==
        video.videoHeight
    ) {
      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;
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
     * -----------------------------------------
     * RUN MEDIAPIPE
     * -----------------------------------------
     */

    const results =
      handLandmarker.detectForVideo(
        video,
        performance.now()
      );

    /*
     * -----------------------------------------
     * HANDS DETECTED
     * -----------------------------------------
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

      /*
       * EXISTING GESTURE DETECTION
       */

      const detectedGesture =
        detectGesture(
          firstHand
        );

      setGesture(
        detectedGesture
      );

      /*
       * -----------------------------------------
       * SELECTED SIGN
       * -----------------------------------------
       */

      const currentSign =
        selectedSignRef.current;

      /*
       * Expected finger gesture.
       */

      const expectedGesture =
        getExpectedGesture(
          currentSign
        );

      /*
       * Expected movement.
       */

      const expectedMovement =
        getMovementTarget(
          currentSign
        );

      /*
       * -----------------------------------------
       * NO SIGN SELECTED
       * -----------------------------------------
       */

      if (!currentSign) {
        stableGestureRef.current =
          "";

        stableFrameCountRef.current =
          0;

        lastProgressUpdateRef.current =
          0;

        resetMovementMatching();

        setMatchProgress(0);

        setPracticeResult(
          "waiting"
        );
      }

      /*
       * -----------------------------------------
       * FINGER GESTURE SIGNS
       * -----------------------------------------
       */

      else if (expectedGesture) {
        /*
         * Movement tracking is not required
         * for these signs.
         */

        resetMovementMatching();

        /*
         * -----------------------------------------
         * CORRECT FINGER GESTURE
         * -----------------------------------------
         */

        if (
          detectedGesture ===
          expectedGesture
        ) {
          if (
            stableGestureRef.current !==
            detectedGesture
          ) {
            stableGestureRef.current =
              detectedGesture;

            stableFrameCountRef.current =
              0;
          }

          stableFrameCountRef.current +=
            1;

          const requiredFrames = 30;

          const progress =
            Math.min(
              100,
              Math.round(
                (stableFrameCountRef.current /
                  requiredFrames) *
                  100
              )
            );

          if (
            progress !==
            lastProgressUpdateRef.current
          ) {
            lastProgressUpdateRef.current =
              progress;

            setMatchProgress(
              progress
            );
          }

          /*
           * Gesture successfully held.
           */

          if (
            stableFrameCountRef.current >=
            requiredFrames
          ) {

             practiceCompletedRef.current = true;
            setPracticeResult(
              "matched"
            );

            completePracticeGamification();
          } else {
            setPracticeResult(
              "checking"
            );
          }
        }

        /*
         * -----------------------------------------
         * WRONG FINGER GESTURE
         * -----------------------------------------
         */

        else {
          stableGestureRef.current =
            detectedGesture;

          stableFrameCountRef.current =
            0;

          lastProgressUpdateRef.current =
            0;

          setMatchProgress(0);

          setPracticeResult(
            "not-matched"
          );
        }
      }

      /*
       * -----------------------------------------
       * MOVEMENT-BASED SIGNS
       * -----------------------------------------
       */

      else if (expectedMovement) {
        compareMovement(
          firstHand,
          expectedMovement
        );
      }

      /*
       * -----------------------------------------
       * UNKNOWN SIGN
       * -----------------------------------------
       */

      else {
        stableGestureRef.current =
          "";

        stableFrameCountRef.current =
          0;

        lastProgressUpdateRef.current =
          0;

        resetMovementMatching();

        setMatchProgress(0);

        setPracticeResult(
          "unsupported"
        );
      }

      /*
       * -----------------------------------------
       * DRAW ALL DETECTED HANDS
       * -----------------------------------------
       */

      for (
        const landmarks of
          results.landmarks
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
    }

    /*
     * -----------------------------------------
     * NO HAND DETECTED
     * -----------------------------------------
     */

    else {
      setHandsDetected(false);

      setGesture(
        "No hand detected"
      );

      stableGestureRef.current =
        "";

      stableFrameCountRef.current =
        0;

      lastProgressUpdateRef.current =
        0;

      resetMovementMatching();

      setMatchProgress(0);

      setPracticeResult(
        "waiting"
      );
    }

    /*
     * -----------------------------------------
     * CONTINUE PROCESSING
     * -----------------------------------------
     */

    animationFrameRef.current =
      requestAnimationFrame(
        detectHands
      );
  };

  /*
   * -----------------------------------------
   * KEEP SELECTED SIGN IN SYNC
   * -----------------------------------------
   */

  useEffect(() => {
    selectedSignRef.current =
      selectedSign;

    /*
     * Reset stable detection when
     * the target changes.
     */

    stableGestureRef.current =
      "";

    stableFrameCountRef.current =
      0;

    lastProgressUpdateRef.current =
      0;

    /*
     * Reset movement history too.
     */

    resetMovementMatching();

    setMatchProgress(0);

    setPracticeResult(
      "waiting"
    );

    /*
     * Reset gamification for the
     * new practice target.
     */

    resetPracticeGamification();
  }, [selectedSign]);

  /*
   * -----------------------------------------
   * START CAMERA
   * -----------------------------------------
   */

  const startCamera = async () => {
    try {
      setCameraError("");

      /*
       * Reset practice attempt.
       */

      stableGestureRef.current =
        "";

      stableFrameCountRef.current =
        0;

      lastProgressUpdateRef.current =
        0;

      resetMovementMatching();

      setMatchProgress(0);

      setPracticeResult(
        "waiting"
      );

      /*
       * Reset gamification for a
       * completely new camera session.
       */

      resetPracticeGamification();

      /*
       * Check browser support.
       */

      if (
        !navigator.mediaDevices
          ?.getUserMedia
      ) {
        setCameraError(
          "Camera access is not supported by this browser."
        );

        return;
      }

      /*
       * Request camera access.
       */

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: false,
          }
        );

      streamRef.current =
        stream;

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
      /*
       * Cancel MediaPipe animation.
       */

      if (
        animationFrameRef.current
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      /*
       * Stop camera tracks.
       */

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) => {
              track.stop();
            }
          );
      }

      /*
       * Close MediaPipe.
       */

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
    /*
     * Stop camera tracks.
     */

    if (
      streamRef.current
    ) {
      streamRef.current
        .getTracks()
        .forEach(
          (track) => {
            track.stop();
          }
        );

      streamRef.current =
        null;
    }

    /*
     * Disconnect video.
     */

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    /*
     * Stop MediaPipe animation.

     */

    if (
      animationFrameRef.current
    ) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current =
        null;
    }

    /*
     * Clear canvas.
     */

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

    /*
     * Reset camera state.
     */

    setHandsDetected(false);

    setGesture(
      "No hand detected"
    );

    setCameraActive(false);

    /*
     * Reset practice state.
     */

    stableGestureRef.current =
      "";

    stableFrameCountRef.current =
      0;

    lastProgressUpdateRef.current =
      0;

    resetMovementMatching();

    setMatchProgress(0);

    setPracticeResult(
      "waiting"
    );

    /*
     * Reset gamification state so
     * the next camera session starts fresh.
     */

    resetPracticeGamification();
  };

  /*
   * -----------------------------------------
   * HANDLE SIGN SELECTION
   * -----------------------------------------
   */

  const handleSignSelection = (
    sign
  ) => {
    setSelectedSign(sign);
  };

  /*
   * -----------------------------------------
   * SELECTED SIGN INFORMATION
   * -----------------------------------------
   */

  const selectedSignName =
    getSignName(
      selectedSign
    );

  const expectedGesture =
    getExpectedGesture(
      selectedSign
    );

  const expectedMovement =
    getMovementTarget(
      selectedSign
    );

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

      {/* Sign Selector */}

      <SignSelector
        selectedSign={selectedSign}
        onSelectSign={
          handleSignSelection
        }
      />

      {/* Main Practice Area */}

      <section className="practice-card">

        {/* Camera Area */}

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
                onClick={
                  startCamera
                }
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
                    marginTop:
                      "12px",
                    fontSize:
                      "13px",
                    color:
                      "#6b7280",
                  }}
                >
                  Preparing hand tracking...
                </p>
              )}

            </div>

          ) : (

            <div className="practice-camera-active">

              {/* Camera */}

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

                {/* Camera Status */}

                <div className="practice-camera-status">

                  <span className="practice-status-dot" />

                  Camera active

                </div>

                {/* Hand Status */}

                <div
                  style={{
                    position:
                      "absolute",
                    left:
                      "16px",
                    bottom:
                      "16px",
                    padding:
                      "7px 12px",
                    borderRadius:
                      "20px",
                    background:
                      "rgba(17, 24, 39, 0.85)",
                    color:
                      "#ffffff",
                    fontSize:
                      "13px",
                    fontWeight:
                      "600",
                    zIndex:
                      5,
                  }}
                >
                  {handsDetected
                    ? "✓ Hand detected"
                    : "Show your hand"}
                </div>

              </div>

              {/* Practice Result */}

              <div className="practice-result">

                {/* Target */}

                <div className="practice-result-item">

                  <span className="practice-result-label">
                    Target sign
                  </span>

                  <strong>
                    {selectedSignName ||
                      "Choose a sign"}
                  </strong>

                </div>

                {/* Divider */}

                <div className="practice-result-divider" />

                {/* Expected Gesture */}

                <div className="practice-result-item">

                  <span className="practice-result-label">
                    Expected gesture
                  </span>

                  <strong>
                    {expectedGesture ||
                      expectedMovement ||
                      "Movement based"}
                  </strong>

                </div>

                {/* Divider */}

                <div className="practice-result-divider" />

                {/* Detected Gesture */}

                <div className="practice-result-item">

                  <span className="practice-result-label">
                    Detected
                  </span>

                  <strong>
                    {gesture}
                  </strong>

                </div>

                {/* Movement */}

                {expectedMovement && (
                  <>
                    <div className="practice-result-divider" />

                    <div className="practice-result-item">

                      <span className="practice-result-label">
                        Movement detected
                      </span>

                      <strong>
                        {detectedMovement}
                      </strong>

                    </div>
                  </>
                )}

                {/* Stable Detection */}

                {practiceResult ===
                  "checking" && (

                  <div className="practice-match-checking">

                    <div className="practice-checking-header">

                      <span>
                        {expectedMovement
                          ? "Checking your movement"
                          : "Hold the sign"}
                      </span>

                      <strong>
                        {matchProgress}%
                      </strong>

                    </div>

                    <div className="practice-match-progress">

                      <div
                        className="practice-match-progress-fill"
                        style={{
                          width:
                            `${matchProgress}%`,
                        }}
                      />

                    </div>

                    <p>
                      {expectedMovement
                        ? "Keep your movement consistent."
                        : "Keep your hand in the correct position."}
                    </p>

                  </div>

                )}

                {/* Matched */}

                {practiceResult ===
                  "matched" && (

                  <div className="practice-match-success">

                    <span className="material-symbols-rounded">
                      check_circle
                    </span>

                    <div>

                      <strong>
                        Practice Complete!
                      </strong>

                      <p>
                        Good! Your detected gesture
                        or movement matches the selected
                        practice target.
                      </p>

                      {practiceXP > 0 && (
                        <p>
                          +{practiceXP} XP earned
                          {" • "}
                          {practiceStreak} day streak
                        </p>
                      )}

                      {practiceAchievements.length > 0 && (
                        <p>
                          Achievement unlocked:{" "}
                          {practiceAchievements
                            .map(
                              (achievement) =>
                                achievement.name
                            )
                            .join(", ")}
                        </p>
                      )}

                      {practiceRewardError && (
                        <p>
                          {practiceRewardError}
                        </p>
                      )}

                    </div>

                  </div>

                )}

                {/* Not Matched */}

                {practiceResult ===
                  "not-matched" && (

                  <div className="practice-match-warning">

                    <span className="material-symbols-rounded">
                      info
                    </span>

                    <div>

                      <strong>
                        Keep trying
                      </strong>

                      <p>
                        Your detected gesture or movement
                        does not match the selected target yet.
                      </p>

                    </div>

                  </div>

                )}

                {/* Unsupported */}

                {practiceResult ===
                  "unsupported" && (

                  <div className="practice-match-info">

                    <span className="material-symbols-rounded">
                      construction
                    </span>

                    <div>

                      <strong>
                        Recognition coming soon
                      </strong>

                      <p>
                        This sign is selected, but the
                        current practice model does not
                        recognize it yet.
                      </p>

                    </div>

                  </div>

                )}

              </div>

              {/* Stop Camera */}

              <button
                type="button"
                className="practice-stop-button"
                onClick={
                  stopCamera
                }
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
                  Remember the sign
                </h3>

                <p>
                  Recall the sign you learned in
                  the lesson before performing it.
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

      {/* Back Button */}

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