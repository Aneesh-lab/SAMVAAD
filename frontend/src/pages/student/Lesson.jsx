import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../config/axios";
import "./Lesson.css";

const Lesson = () => {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);

  const [completedLessonIds, setCompletedLessonIds] =
    useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [completionData, setCompletionData] = useState(null);
  const [completionMessage, setCompletionMessage] = useState("");

  const [videoProgress, setVideoProgress] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          lessonResponse,
          courseResponse,
          progressResponse,
        ] = await Promise.all([
          api.get(`/student/lessons/${lessonId}`),
          api.get(`/student/courses/${id}`),
          api.get("/student/progress"),
        ]);

        const fetchedLesson =
          lessonResponse.data.lesson;

        const fetchedCourse =
          courseResponse.data;

        const progressRecords =
          progressResponse.data.progress || [];

        setLesson(fetchedLesson);

        const lessons =
          fetchedCourse.lessons || [];

        setCourseLessons(lessons);

        /*
          Find all completed lessons
          belonging to this course.
        */
        const completedIds = new Set();

        progressRecords.forEach((item) => {
          if (item.status !== "completed") {
            return;
          }

          const progressLesson =
            item.lessonId;

          if (!progressLesson) {
            return;
          }

          const progressLessonId =
            progressLesson._id ||
            progressLesson;

          const belongsToCourse =
            lessons.some(
              (courseLesson) =>
                courseLesson._id ===
                progressLessonId
            );

          if (belongsToCourse) {
            completedIds.add(
              progressLessonId
            );
          }
        });

        setCompletedLessonIds(
          completedIds
        );

        /*
          Check whether the current lesson
          is already completed.
        */
        const currentProgress =
          progressRecords.find((item) => {
            const progressLessonId =
              item.lessonId?._id ||
              item.lessonId;

            return (
              progressLessonId ===
              lessonId
            );
          });

        if (
          currentProgress?.status ===
          "completed"
        ) {
          setCompleted(true);
          setVideoCompleted(true);
          setVideoProgress(100);
        }

      } catch (err) {
        console.error(
          "Fetch lesson error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load lesson"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [id, lessonId]);

  /*
    Find the current lesson position.
  */
  const currentIndex =
    courseLessons.findIndex(
      (item) =>
        item._id === lessonId
    );

  const totalLessons =
    courseLessons.length;

  const lessonNumber =
    currentIndex >= 0
      ? currentIndex + 1
      : 0;

  /*
    STEP 111 + STEP 112

    Real course progress is based on
    completed lessons, not the current
    lesson position.
  */
  const completedLessons =
    completedLessonIds.size;

  const courseProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons /
            totalLessons) *
            100
        )
      : 0;

  /*
    Previous lesson
  */
  const previousLesson =
    currentIndex > 0
      ? courseLessons[currentIndex - 1]
      : null;

  /*
    Next lesson
  */
  const nextLesson =
    currentIndex >= 0 &&
    currentIndex <
      courseLessons.length - 1
      ? courseLessons[currentIndex + 1]
      : null;

  /*
    Video progress
  */
  const handleVideoProgress = (
    event
  ) => {
    const video = event.target;

    if (!video.duration) {
      return;
    }

    const progress =
      (video.currentTime /
        video.duration) *
      100;

    setVideoProgress(
      Math.round(progress)
    );

    if (progress >= 95) {
      setVideoCompleted(true);
    }
  };

  /*
    Complete lesson
  */
  const handleCompleteLesson =
    async () => {
      if (completed) {
        return;
      }

      /*
        If the lesson has a video,
        require 95% watch progress.
      */
      if (
        lesson.videoUrl &&
        !videoCompleted
      ) {
        setCompletionMessage(
          "Please watch at least 95% of the video before completing the lesson."
        );

        return;
      }

      try {
        setCompleting(true);
        setCompletionMessage("");

        const response =
          await api.post(
            `/student/lessons/${lessonId}/complete`
          );

        const data =
          response.data;

        /*
          Mark current lesson
          as completed.
        */
        setCompleted(true);

        setCompletionData(data);

        /*
          STEP 112

          Immediately add the current
          lesson to the local completed
          lesson set.

          This updates the progress bar
          without requiring a refresh.
        */
        setCompletedLessonIds(
          (previousIds) => {
            const updatedIds =
              new Set(previousIds);

            updatedIds.add(
              lessonId
            );

            return updatedIds;
          }
        );

        setCompletionMessage(
          data.message ||
            "Lesson completed successfully"
        );

      } catch (err) {
        console.error(
          "Complete lesson error:",
          err
        );

        setCompletionMessage(
          err.response?.data
            ?.message ||
            "Unable to complete lesson"
        );
      } finally {
        setCompleting(false);
      }
    };

  /*
    Open another lesson.
  */
  const openLesson = (
    targetLessonId
  ) => {
    navigate(
      `/student/learn/${id}/lesson/${targetLessonId}`
    );
  };

  if (loading) {
    return (
      <div className="lesson-page">
        <div className="lesson-loading">
          Loading lesson...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-page">
        <div className="lesson-error">
          {error}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-page">
        <div className="lesson-error">
          Lesson not found.
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-page">

      {/* Course Progress */}

      <div className="lesson-progress">

        <div className="lesson-progress-header">

          <span>
            {completedLessons} of{" "}
            {totalLessons} lessons completed
          </span>

          <span>
            {courseProgress}%
          </span>

        </div>

        <div className="lesson-progress-bar">

          <div
            className="lesson-progress-fill"
            style={{
              width: `${courseProgress}%`,
            }}
          ></div>

        </div>

      </div>

      {/* Lesson Header */}

      <div className="lesson-header">

        <div>

          <span className="lesson-number">
            Lesson {lessonNumber}
          </span>

          <h1>
            {lesson.title}
          </h1>

          {lesson.description && (
            <p>
              {lesson.description}
            </p>
          )}

        </div>

      </div>

      {/* Video */}

      {lesson.videoUrl && (
        <div className="lesson-video-container">

          <video
            className="lesson-video"
            controls
            preload="metadata"
            onTimeUpdate={
              handleVideoProgress
            }
          >
            <source
              src={lesson.videoUrl}
              type="video/mp4"
            />

            Your browser does not support
            the video element.
          </video>

          {/* Video Progress */}

          <div className="video-progress-section">

            <div className="video-progress-header">

              <span>
                Video progress
              </span>

              <strong>
                {videoProgress}%
              </strong>

            </div>

            <div className="video-progress-bar">

              <div
                className="video-progress-fill"
                style={{
                  width: `${videoProgress}%`,
                }}
              ></div>

            </div>

            {videoCompleted && (
              <p className="video-watched-message">
                ✓ You've watched most of this
                lesson
              </p>
            )}

          </div>

        </div>
      )}

      {/* Lesson Information */}

      <div className="lesson-info">

        {lesson.duration > 0 && (
          <div className="lesson-duration">
            Duration: {lesson.duration} minutes
          </div>
        )}

        <div className="lesson-status">

          {completed ? (
            <span className="completed-status">
              ✓ Completed
            </span>
          ) : (
            <span className="incomplete-status">
              Not completed
            </span>
          )}

        </div>

      </div>

      {/* Completion Section */}

      <div className="lesson-completion">

        <div className="completion-content">

          <h2>
            {completed
              ? "Lesson completed!"
              : "Finish this lesson"}
          </h2>

          <p>
            {completed
              ? "Great job! Your progress has been updated."
              : lesson.videoUrl &&
                !videoCompleted
                ? "Watch at least 95% of the video to unlock completion."
                : "Finish the lesson and mark it as completed to earn XP."}
          </p>

        </div>

        {!completed && (
          <button
            type="button"
            className="complete-lesson-button"
            onClick={
              handleCompleteLesson
            }
            disabled={
              completing ||
              (lesson.videoUrl &&
                !videoCompleted)
            }
          >
            {completing
              ? "Completing..."
              : lesson.videoUrl &&
                !videoCompleted
                ? "Watch video to continue"
                : "Mark as complete"}
          </button>
        )}

        {completionMessage && (
          <p className="completion-message">
            {completionMessage}
          </p>
        )}

      </div>

      {/* Completion Result */}

      {completionData && (
        <div className="completion-result">

          <div className="completion-result-header">

            <h3>
              Great work!
            </h3>

          </div>

          <div className="completion-result-content">

            <div className="completion-stat">

              <span>
                XP earned
              </span>

              <strong>
                +{completionData.xpAwarded || 0}
              </strong>

            </div>

            <div className="completion-stat">

              <span>
                Total XP
              </span>

              <strong>
                {completionData.totalXP || 0}
              </strong>

            </div>

            <div className="completion-stat">

              <span>
                Current streak
              </span>

              <strong>
                {completionData.streak || 0} days
              </strong>

            </div>

          </div>

          {completionData
            .achievementsUnlocked
            ?.length > 0 && (

            <div className="achievement-unlocked">

              <h4>
                Achievement unlocked!
              </h4>

              {completionData
                .achievementsUnlocked
                .map(
                  (achievement) => (
                    <div
                      key={
                        achievement._id ||
                        achievement
                          .achievement?._id
                      }
                      className="achievement-item"
                    >

                      <span>
                        {achievement.icon ||
                          "🏆"}
                      </span>

                      <div>

                        <strong>
                          {achievement.name ||
                            achievement
                              .achievement
                              ?.name}
                        </strong>

                        <p>
                          {achievement
                            .description ||
                            achievement
                              .achievement
                              ?.description}
                        </p>

                      </div>

                    </div>
                  )
                )}

            </div>
          )}

        </div>
      )}

      {/* Previous / Next Navigation */}

      <div className="lesson-navigation">

        {/* Previous Lesson */}

        <button
          type="button"
          className="lesson-nav-button previous"
          onClick={() =>
            previousLesson &&
            openLesson(
              previousLesson._id
            )
          }
          disabled={!previousLesson}
        >

          <span className="lesson-nav-label">
            Previous lesson
          </span>

          <strong>
            {previousLesson
              ? previousLesson.title
              : "First lesson"}
          </strong>

        </button>

        {/* Next Lesson */}

        <button
          type="button"
          className="lesson-nav-button next"
          onClick={() =>
            nextLesson &&
            openLesson(nextLesson._id)
          }
          disabled={!nextLesson}
        >

          <span className="lesson-nav-label">
            {nextLesson
              ? "Next lesson"
              : "Course completed"}
          </span>

          <strong>
            {nextLesson
              ? nextLesson.title
              : "You've reached the end"}
          </strong>

        </button>

      </div>

    </div>
  );
};

export default Lesson;