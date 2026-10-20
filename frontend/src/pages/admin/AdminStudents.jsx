import { useEffect, useState } from "react";
import api from "../../config/axios";
import "./AdminStudents.css";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard/students", {
          params: search.trim() ? { search: search.trim() } : {},
          signal: controller.signal,
        });

        setStudents(response.data.students || []);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;

        setError(
          err.response?.data?.message ||
            "Unable to load students. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchStudents, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search]);

  const handleViewStudent = async (studentId) => {
    setSelectedStudent(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await api.get(
        `/admin/dashboard/students/${studentId}`
      );

      setSelectedStudent(response.data.student);
    } catch (err) {
      setDetailsError(
        err.response?.data?.message ||
          "Unable to load student details. Please try again."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeStudentDetails = () => {
    setSelectedStudent(null);
    setDetailsError("");
    setDetailsLoading(false);
  };

  useEffect(() => {
    if (!selectedStudent && !detailsLoading && !detailsError) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeStudentDetails();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedStudent, detailsLoading, detailsError]);

  return (
    <section className="admin-students-page">
      <div className="admin-students-header">
        <div>
          <p className="admin-students-eyebrow">ADMINISTRATION</p>
          <h1>Student Management</h1>
          <p className="admin-students-description">
            View and manage students registered on SAMVAAD.
          </p>
        </div>

        <div className="admin-students-count">
          <span className="admin-students-count-label">
            {search.trim() ? "Matching students" : "Registered students"}
          </span>
          <strong>{loading ? "—" : students.length}</strong>
        </div>
      </div>

      <div className="admin-students-panel">
        <div className="admin-students-panel-header">
          <div>
            <h2>All Students</h2>
            <p>Student accounts registered on the platform</p>
          </div>
        </div>

        <div className="admin-students-toolbar">
          <label className="admin-students-search">
            <span
              className="material-symbols-rounded admin-students-search-icon"
              aria-hidden="true"
            >
              search
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students by name or email"
              aria-label="Search students by name or email"
            />

            {search && (
              <button
                type="button"
                className="admin-students-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  close
                </span>
              </button>
            )}
          </label>

          <span className="admin-students-search-hint">
            Search by name or email
          </span>
        </div>

        {loading ? (
          <div className="admin-students-state" role="status">
            <span className="admin-students-spinner" />
            <p>Loading students...</p>
          </div>
        ) : error ? (
          <div className="admin-students-state admin-students-error">
            <span className="material-symbols-rounded" aria-hidden="true">
              error
            </span>
            <p>{error}</p>
            <button
              type="button"
              className="admin-students-retry"
              onClick={() => setSearch((current) => `${current}`)}
            >
              Retry search
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="admin-students-state">
            <span className="material-symbols-rounded" aria-hidden="true">
              {search.trim() ? "person_search" : "group"}
            </span>
            <h3>
              {search.trim() ? "No matching students" : "No students yet"}
            </h3>
            <p>
              {search.trim()
                ? "Try another name or email address."
                : "Registered student accounts will appear here."}
            </p>

            {search.trim() && (
              <button
                type="button"
                className="admin-students-retry"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="admin-students-table-wrapper">
            <table className="admin-students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email address</th>
                  <th>Account role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="admin-student-identity">
                        <div className="admin-student-avatar">
                          {(student.name || student.email || "S")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="admin-student-name">
                          <span>{student.name || "Unnamed student"}</span>
                          <small>ID: {student._id.slice(-8)}</small>
                        </div>
                      </div>
                    </td>

                    <td className="admin-student-email">
                      {student.email || "—"}
                    </td>

                    <td>
                      <span className="admin-student-role">Student</span>
                    </td>

                    <td>
                      <span className="admin-student-status">
                        <span className="admin-student-status-dot" />
                        Registered
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-student-view-button"
                        onClick={() => handleViewStudent(student._id)}
                      >
                        View details
                        <span
                          className="material-symbols-rounded"
                          aria-hidden="true"
                        >
                          arrow_forward
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(selectedStudent || detailsLoading || detailsError) && (
        <div
          className="admin-student-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeStudentDetails();
            }
          }}
        >
          <section
            className="admin-student-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-student-modal-title"
          >
            <div className="admin-student-modal-header">
              <div>
                <p className="admin-students-eyebrow">STUDENT ACCOUNT</p>
                <h2 id="admin-student-modal-title">Student details</h2>
              </div>

              <button
                type="button"
                className="admin-student-modal-close"
                onClick={closeStudentDetails}
                aria-label="Close student details"
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  close
                </span>
              </button>
            </div>

            {detailsLoading ? (
              <div className="admin-students-state" role="status">
                <span className="admin-students-spinner" />
                <p>Loading student details...</p>
              </div>
            ) : detailsError ? (
              <div className="admin-students-state admin-students-error">
                <span className="material-symbols-rounded" aria-hidden="true">
                  error
                </span>
                <p>{detailsError}</p>
                <button
                  type="button"
                  className="admin-students-retry"
                  onClick={() => {
                    const studentId = students.find(
                      (student) => student._id
                    )?._id;

                    if (studentId) {
                      handleViewStudent(studentId);
                    }
                  }}
                >
                  Retry
                </button>
              </div>
            ) : selectedStudent ? (
              <div className="admin-student-details-content">
                <div className="admin-student-profile">
                  <div className="admin-student-profile-avatar">
                    {(selectedStudent.name || selectedStudent.email || "S")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3>
                      {selectedStudent.name || "Unnamed student"}
                    </h3>
                    <p>{selectedStudent.email || "No email available"}</p>
                    <span className="admin-student-role">Student</span>
                  </div>
                </div>

                <div className="admin-student-details-section">
                  <h3>Account information</h3>

                  <div className="admin-student-detail-row">
                    <span>Full name</span>
                    <strong>{selectedStudent.name || "Not provided"}</strong>
                  </div>

                  <div className="admin-student-detail-row">
                    <span>Email address</span>
                    <strong>{selectedStudent.email || "Not provided"}</strong>
                  </div>

                  <div className="admin-student-detail-row">
                    <span>Account role</span>
                    <strong>{selectedStudent.role || "student"}</strong>
                  </div>

                  <div className="admin-student-detail-row">
                    <span>Student ID</span>
                    <strong className="admin-student-detail-id">
                      {selectedStudent._id}
                    </strong>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="admin-student-modal-footer">
              <button
                type="button"
                className="admin-student-modal-done"
                onClick={closeStudentDetails}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default AdminStudents;