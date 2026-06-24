import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  Package,
  Plus,
  Search,
  Upload,
  User,
  Workflow,
} from "lucide-react";
import "./page.css";

const STORAGE_KEY = "korede-james-admin-workspace-v1";
const ACCESS_KEY = "korede-james-admin-unlocked";
const PREVIEW_CODE = import.meta.env.VITE_ADMIN_PREVIEW_CODE || "De_core";

const requestStatuses = [
  "New Inquiry",
  "Reviewed",
  "In Progress",
  "Fitting",
  "Completed",
  "Archived",
];

const commissionStages = [
  "Inquiry",
  "Consultation",
  "Sketch",
  "Fabric",
  "Fitting",
  "Delivery",
];

const defaultWorkspace = {
  requests: [
    {
      id: "req-1001",
      client: "Amara Okoye",
      email: "amara@example.com",
      artifact: "Evening Wear",
      budget: "$5,000 - $10,000",
      status: "New Inquiry",
      stage: "Inquiry",
      due: "2026-07-18",
      updated: "Today",
      notes: "Wants a white structured silhouette with red styling references.",
    },
    {
      id: "req-1002",
      client: "Tomi Adeyemi",
      email: "tomi@example.com",
      artifact: "Bridal",
      budget: "$10,000 - $25,000",
      status: "In Progress",
      stage: "Fabric",
      due: "2026-08-04",
      updated: "Yesterday",
      notes: "Fabric sourcing is pending. Client prefers a clean gallery-style mood board.",
    },
    {
      id: "req-1003",
      client: "Kemi Lawal",
      email: "kemi@example.com",
      artifact: "Others",
      budget: "$25,000+",
      status: "Fitting",
      stage: "Fitting",
      due: "2026-07-02",
      updated: "2 days ago",
      notes: "First fitting complete. Adjust shoulder volume and sleeve drop.",
    },
  ],
  pieces: [
    {
      id: "piece-01",
      title: "Independence Jacket",
      category: "Outerwear",
      image: "/assets/freedom/freedom-product-01.jpg",
      visibility: "Visible",
      availability: "Available",
      budget: "$5,000 - $10,000",
      description:
        "Structured white outerwear with exposed stitching and a clean gallery-ready silhouette.",
    },
    {
      id: "piece-02",
      title: "Inheritance Wrap",
      category: "Tailoring",
      image: "/assets/freedom/freedom-product-02.jpg",
      visibility: "Visible",
      availability: "Commissioned",
      budget: "$10,000 - $25,000",
      description:
        "Layered wrap tailoring for private commission requests and atelier reference.",
    },
    {
      id: "piece-03",
      title: "Memory Suit",
      category: "Suits",
      image: "/assets/freedom/freedom-product-04.jpg",
      visibility: "Hidden",
      availability: "Available",
      budget: "$25,000+",
      description:
        "Ceremonial white suit with sculptural volume and quiet formal presence.",
    },
  ],
};

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

function readWorkspace() {
  if (typeof window === "undefined") {
    return defaultWorkspace;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultWorkspace;
  } catch {
    return defaultWorkspace;
  }
}

function persistWorkspace(workspace) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [workspace, setWorkspace] = useState(defaultWorkspace);
  const [activeView, setActiveView] = useState("overview");
  const [selectedRequestId, setSelectedRequestId] = useState(
    defaultWorkspace.requests[0].id
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [saveState, setSaveState] = useState("Saved");
  const [newPiece, setNewPiece] = useState({
    title: "",
    category: "Outerwear",
    image: "",
    availability: "Available",
    budget: "$5,000 - $10,000",
    description: "",
  });

  useEffect(() => {
    setWorkspace(readWorkspace());
    setUnlocked(window.localStorage.getItem(ACCESS_KEY) === "true");
  }, []);

  const selectedRequest =
    workspace.requests.find((request) => request.id === selectedRequestId) ||
    workspace.requests[0];

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return workspace.requests;
    }

    return workspace.requests.filter((request) =>
      [request.client, request.email, request.artifact, request.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [searchTerm, workspace.requests]);

  const stats = useMemo(() => {
    const activeRequests = workspace.requests.filter(
      (request) => !["Completed", "Archived"].includes(request.status)
    ).length;
    const newRequests = workspace.requests.filter(
      (request) => request.status === "New Inquiry"
    ).length;
    const visiblePieces = workspace.pieces.filter(
      (piece) => piece.visibility === "Visible"
    ).length;

    return [
      {
        label: "New Requests",
        value: newRequests,
        detail: "Awaiting review",
        icon: Clock,
      },
      {
        label: "Active Commissions",
        value: activeRequests,
        detail: "Currently moving",
        icon: Workflow,
      },
      {
        label: "Visible Pieces",
        value: visiblePieces,
        detail: "Shown to client",
        icon: Package,
      },
    ];
  }, [workspace]);

  const commitWorkspace = (nextWorkspace) => {
    setWorkspace(nextWorkspace);
    persistWorkspace(nextWorkspace);
    setSaveState("Saved");
  };

  const updateRequest = (requestId, patch) => {
    const nextWorkspace = {
      ...workspace,
      requests: workspace.requests.map((request) =>
        request.id === requestId
          ? { ...request, ...patch, updated: "Just now" }
          : request
      ),
    };
    commitWorkspace(nextWorkspace);
  };

  const updatePiece = (pieceId, patch) => {
    const nextWorkspace = {
      ...workspace,
      pieces: workspace.pieces.map((piece) =>
        piece.id === pieceId ? { ...piece, ...patch } : piece
      ),
    };
    commitWorkspace(nextWorkspace);
  };

  const handleAddPiece = (event) => {
    event.preventDefault();
    if (!newPiece.title.trim()) {
      return;
    }

    const nextPiece = {
      id: createId("piece"),
      title: newPiece.title.trim(),
      category: newPiece.category,
      image:
        newPiece.image.trim() || "/assets/freedom/freedom-product-01.jpg",
      visibility: "Hidden",
      availability: newPiece.availability,
      budget: newPiece.budget,
      description: newPiece.description.trim(),
    };

    commitWorkspace({
      ...workspace,
      pieces: [nextPiece, ...workspace.pieces],
    });
    setNewPiece({
      title: "",
      category: "Outerwear",
      image: "",
      availability: "Available",
      budget: "$5,000 - $10,000",
      description: "",
    });
  };

  const handlePieceImageUpload = async (pieceId, event) => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    const image = await readFileAsDataUrl(file);
    updatePiece(pieceId, { image });
    event.target.value = "";
  };

  const handleNewPieceImageUpload = async (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    const image = await readFileAsDataUrl(file);
    setNewPiece((currentPiece) => ({ ...currentPiece, image }));
    event.target.value = "";
  };

  const handleUnlock = (event) => {
    event.preventDefault();
    if (accessCode.trim().toLowerCase() !== PREVIEW_CODE.toLowerCase()) {
      setAccessError("Invalid access code.");
      return;
    }

    window.localStorage.setItem(ACCESS_KEY, "true");
    setUnlocked(true);
    setAccessError("");
  };

  const handleLogout = () => {
    window.localStorage.removeItem(ACCESS_KEY);
    setUnlocked(false);
    setAccessCode("");
  };

  if (!unlocked) {
    return (
      <main className="admin-access">
        <section className="admin-access__panel">
          <div className="admin-access__mark">
            <LockKeyhole size={18} />
          </div>
          <p className="admin-kicker">Korede James Admin</p>
          <h1>Atelier desk</h1>
          <form onSubmit={handleUnlock} className="admin-access__form">
            <label htmlFor="admin-code">Access code</label>
            <input
              id="admin-code"
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Enter access code"
              autoComplete="current-password"
            />
            {accessError ? (
              <p className="admin-access__error">{accessError}</p>
            ) : null}
            <button type="submit">
              <LockKeyhole size={15} />
              <span>Enter Admin</span>
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <p className="admin-kicker">Korede James</p>
          <h1>Atelier Desk</h1>
          <span>Commission operations</span>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          <button
            className={activeView === "overview" ? "is-active" : ""}
            onClick={() => setActiveView("overview")}
            type="button"
          >
            <BarChart3 size={16} />
            <span>Overview</span>
          </button>
          <button
            className={activeView === "requests" ? "is-active" : ""}
            onClick={() => setActiveView("requests")}
            type="button"
          >
            <User size={16} />
            <span>Requests</span>
          </button>
          <button
            className={activeView === "pieces" ? "is-active" : ""}
            onClick={() => setActiveView("pieces")}
            type="button"
          >
            <Package size={16} />
            <span>Pieces</span>
          </button>
        </nav>

        <button className="admin-logout" onClick={handleLogout} type="button">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">Client Workspace</p>
            <h2>{viewTitle(activeView)}</h2>
          </div>
          <div className="admin-topbar__actions">
            <span className="admin-private-pill">Private</span>
            <div className="admin-save-state">
              <CheckCircle2 size={15} />
              <span>{saveState}</span>
            </div>
          </div>
        </header>

        {activeView === "overview" ? (
          <section className="admin-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article className="admin-stat" key={stat.label}>
                  <div>
                    <p>{stat.label}</p>
                    <strong>{stat.value}</strong>
                    <span>{stat.detail}</span>
                  </div>
                  <Icon size={18} />
                </article>
              );
            })}

            <article className="admin-panel admin-panel--wide">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">Commission Queue</p>
                  <h3>Recent requests</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView("requests")}
                  className="admin-icon-button"
                >
                  <Workflow size={15} />
                  <span>Open</span>
                </button>
              </div>
              <RequestRows
                requests={workspace.requests.slice(0, 4)}
                selectedRequestId={selectedRequest?.id}
                onSelect={(requestId) => {
                  setSelectedRequestId(requestId);
                  setActiveView("requests");
                }}
              />
            </article>

            <article className="admin-panel">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">Pieces</p>
                  <h3>Availability</h3>
                </div>
              </div>
              <div className="admin-mini-list">
                {workspace.pieces.slice(0, 4).map((piece) => (
                  <div key={piece.id} className="admin-mini-piece">
                    <img src={piece.image} alt="" />
                    <div>
                      <strong>{piece.title}</strong>
                      <span className={availabilityClassName(piece.availability)}>
                        {piece.availability}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {activeView === "requests" ? (
          <section className="admin-requests">
            <article className="admin-panel">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">Requests</p>
                  <h3>Client inquiries</h3>
                </div>
              </div>
              <label className="admin-search">
                <Search size={15} />
                <input
                  type="search"
                  placeholder="Search client, email, artifact"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
              <RequestRows
                requests={filteredRequests}
                selectedRequestId={selectedRequest?.id}
                onSelect={setSelectedRequestId}
              />
            </article>

            {selectedRequest ? (
              <article className="admin-panel admin-detail">
                <div className="admin-panel__heading">
                  <div>
                    <p className="admin-kicker">{selectedRequest.id}</p>
                    <h3>{selectedRequest.client}</h3>
                  </div>
                  <div className="admin-heading-badges">
                    <span className={statusClassName(selectedRequest.status)}>
                      {selectedRequest.status}
                    </span>
                    <span className="admin-pill">{selectedRequest.updated}</span>
                  </div>
                </div>

                <div className="admin-detail__meta">
                  <span>{selectedRequest.email}</span>
                  <span>{selectedRequest.artifact}</span>
                  <span>{selectedRequest.budget}</span>
                </div>

                <div className="admin-field-grid">
                  <label>
                    Status
                    <select
                      value={selectedRequest.status}
                      onChange={(event) =>
                        updateRequest(selectedRequest.id, {
                          status: event.target.value,
                        })
                      }
                    >
                      {requestStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Current stage
                    <select
                      value={selectedRequest.stage}
                      onChange={(event) =>
                        updateRequest(selectedRequest.id, {
                          stage: event.target.value,
                        })
                      }
                    >
                      {commissionStages.map((stage) => (
                        <option key={stage}>{stage}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="admin-progress">
                  {commissionStages.map((stage) => (
                    <button
                      key={stage}
                      className={
                        commissionStages.indexOf(stage) <=
                        commissionStages.indexOf(selectedRequest.stage)
                          ? "is-done"
                          : ""
                      }
                      onClick={() =>
                        updateRequest(selectedRequest.id, { stage })
                      }
                      type="button"
                    >
                      <span />
                      {stage}
                    </button>
                  ))}
                </div>

                <label className="admin-notes">
                  Notes
                  <textarea
                    rows={7}
                    value={selectedRequest.notes}
                    onChange={(event) =>
                      updateRequest(selectedRequest.id, {
                        notes: event.target.value,
                      })
                    }
                  />
                </label>
              </article>
            ) : null}
          </section>
        ) : null}

        {activeView === "pieces" ? (
          <section className="admin-pieces">
            <article className="admin-panel admin-panel--wide">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">Commission Pieces</p>
                  <h3>Available products</h3>
                </div>
              </div>

              <div className="admin-piece-table">
                {workspace.pieces.map((piece) => (
                  <div className="admin-piece-row" key={piece.id}>
                    <div className="admin-piece-media">
                      <img src={piece.image} alt="" />
                      <label className="admin-upload admin-upload--small">
                        <Upload size={14} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handlePieceImageUpload(piece.id, event)
                          }
                        />
                      </label>
                    </div>
                    <div className="admin-piece-fields">
                      <div className="admin-piece-row__title">
                        <strong>{piece.title}</strong>
                        <span className={availabilityClassName(piece.availability)}>
                          {piece.availability}
                        </span>
                      </div>
                      <label>
                        Title
                        <input
                          value={piece.title}
                          onChange={(event) =>
                            updatePiece(piece.id, {
                              title: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Category
                        <input
                          value={piece.category}
                          onChange={(event) =>
                            updatePiece(piece.id, {
                              category: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Availability
                        <select
                          value={piece.availability}
                          onChange={(event) =>
                            updatePiece(piece.id, {
                              availability: event.target.value,
                            })
                          }
                        >
                          <option>Available</option>
                          <option>Commissioned</option>
                          <option>Archived</option>
                        </select>
                      </label>
                      <label className="admin-piece-description">
                        Description
                        <textarea
                          rows={3}
                          value={piece.description || ""}
                          onChange={(event) =>
                            updatePiece(piece.id, {
                              description: event.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="admin-visibility"
                      onClick={() =>
                        updatePiece(piece.id, {
                          visibility:
                            piece.visibility === "Visible"
                              ? "Hidden"
                              : "Visible",
                        })
                      }
                    >
                      {piece.visibility === "Visible" ? (
                        <Eye size={15} />
                      ) : (
                        <EyeOff size={15} />
                      )}
                      <span>{piece.visibility}</span>
                    </button>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">New Piece</p>
                  <h3>Add product</h3>
                </div>
              </div>
              <form className="admin-add-form" onSubmit={handleAddPiece}>
                <label>
                  Title
                  <input
                    value={newPiece.title}
                    onChange={(event) =>
                      setNewPiece({ ...newPiece, title: event.target.value })
                    }
                    placeholder="Piece name"
                  />
                </label>
                <label>
                  Category
                  <input
                    value={newPiece.category}
                    onChange={(event) =>
                      setNewPiece({
                        ...newPiece,
                        category: event.target.value,
                      })
                    }
                  />
                </label>
                <div className="admin-new-image">
                  {newPiece.image ? <img src={newPiece.image} alt="" /> : null}
                  <label className="admin-upload">
                    <Upload size={16} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewPieceImageUpload}
                    />
                  </label>
                </div>
                <label>
                  Availability
                  <select
                    value={newPiece.availability}
                    onChange={(event) =>
                      setNewPiece({
                        ...newPiece,
                        availability: event.target.value,
                      })
                    }
                  >
                    <option>Available</option>
                    <option>Commissioned</option>
                    <option>Archived</option>
                  </select>
                </label>
                <label>
                  Description
                  <textarea
                    rows={4}
                    value={newPiece.description}
                    onChange={(event) =>
                      setNewPiece({
                        ...newPiece,
                        description: event.target.value,
                      })
                    }
                    placeholder="Short private description for the piece"
                  />
                </label>
                <button type="submit">
                  <Plus size={15} />
                  <span>Add Piece</span>
                </button>
              </form>
            </article>
          </section>
        ) : null}

      </section>
    </main>
  );
}

function viewTitle(view) {
  const titles = {
    overview: "Workspace overview",
    requests: "Commission requests",
    pieces: "Available pieces",
  };
  return titles[view] || "Workspace overview";
}

function RequestRows({ requests, selectedRequestId, onSelect }) {
  if (!requests.length) {
    return <p className="admin-empty">No matching requests.</p>;
  }

  return (
    <div className="admin-request-list">
      {requests.map((request) => (
        <button
          type="button"
          key={request.id}
          className={request.id === selectedRequestId ? "is-selected" : ""}
          onClick={() => onSelect(request.id)}
        >
          <span>
            <strong>{request.client}</strong>
            <small>{request.artifact}</small>
          </span>
          <em className={statusClassName(request.status)}>{request.status}</em>
        </button>
      ))}
    </div>
  );
}

function statusClassName(status) {
  return `admin-status admin-status--${status
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}

function availabilityClassName(availability) {
  return `admin-availability admin-availability--${availability
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}
