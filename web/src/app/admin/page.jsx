import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  EyeOff,
  History,
  LineChart,
  LockKeyhole,
  LogOut,
  Megaphone,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Upload,
  User,
  Users,
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

const adminModules = [
  {
    id: "products",
    label: "Products",
    icon: Package,
    owner: "Add, edit, delete, pricing, inventory, categories, images",
    editor: "Add and edit products. Delete is locked.",
    support: "No access",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    owner: "View, status updates, fulfillment, refunds, cancellations",
    editor: "No access",
    support: "View, status updates, refunds up to $50",
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    owner: "Full profiles, order history, support notes",
    editor: "No access",
    support: "Profiles, order history, support notes",
  },
  {
    id: "content",
    label: "Content",
    icon: FileText,
    owner: "Pages, portfolio entries, blog posts, media library",
    editor: "Full content and media access",
    support: "No access",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    owner: "Discount codes, promotions, featured items",
    editor: "Draft promotions for Owner approval",
    support: "No access",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: LineChart,
    owner: "Sales, traffic, conversion data",
    editor: "No access",
    support: "No access",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    owner: "Shipping, tax, payments, integrations, API keys",
    editor: "No access",
    support: "No access",
  },
  {
    id: "team",
    label: "Team",
    icon: ShieldCheck,
    owner: "Create, edit, remove admin accounts and roles",
    editor: "No access",
    support: "No access",
  },
  {
    id: "audit",
    label: "Audit",
    icon: History,
    owner: "Full activity history",
    editor: "No access",
    support: "No access",
  },
];

const roleProfiles = {
  owner: {
    label: "Owner / Admin",
    summary: "Full access across store, operations, content, settings, and team.",
    tone: "Full Access",
  },
  editor: {
    label: "Editor",
    summary: "Product and content creation without sensitive business data.",
    tone: "Content Access",
  },
  support: {
    label: "Support",
    summary: "Order and customer support with capped refund authority.",
    tone: "Support Access",
  },
};

const moduleSummaries = {
  products: {
    title: "Product Catalogue",
    metric: "14 active items",
    actions: ["Add Product", "Edit Product", "Manage Images", "Pricing"],
    lockedFor: {
      editor: ["Delete Product"],
      support: ["Product Editing", "Pricing", "Inventory"],
    },
  },
  orders: {
    title: "Order Operations",
    metric: "8 open orders",
    actions: ["View Order", "Update Status", "Fulfillment", "Refund"],
    lockedFor: {
      editor: ["Orders", "Refunds", "Customer Data"],
      support: ["Refunds Above $50", "Cancellations"],
    },
  },
  customers: {
    title: "Customer Desk",
    metric: "126 profiles",
    actions: ["View Profile", "Order History", "Support Notes"],
    lockedFor: {
      editor: ["Customer Profiles", "Order History"],
      support: [],
    },
  },
  content: {
    title: "Portfolio & Content",
    metric: "9 entries",
    actions: ["Pages", "Projects", "Blog Posts", "Media Library"],
    lockedFor: {
      editor: [],
      support: ["Content Editing", "Media Library"],
    },
  },
  marketing: {
    title: "Marketing Studio",
    metric: "3 drafts",
    actions: ["Discount Codes", "Promotions", "Featured Items"],
    lockedFor: {
      editor: ["Publish Promotion"],
      support: ["Marketing"],
    },
  },
  analytics: {
    title: "Analytics",
    metric: "Full reporting",
    actions: ["Sales", "Traffic", "Conversion"],
    lockedFor: {
      editor: ["Analytics"],
      support: ["Analytics"],
    },
  },
  settings: {
    title: "Store Settings",
    metric: "Owner only",
    actions: ["Shipping Rules", "Tax Config", "Payment Gateway", "API Keys"],
    lockedFor: {
      editor: ["Settings"],
      support: ["Settings"],
    },
  },
  audit: {
    title: "Audit Log",
    metric: "Full history",
    actions: ["View Activity", "Filter by User", "Export Log"],
    lockedFor: {
      editor: ["Audit Log"],
      support: ["Audit Log"],
    },
  },
};

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
  team: [
    {
      id: "team-01",
      name: "Korede James",
      email: "owner@koredejames.com",
      role: "owner",
      status: "Active",
    },
    {
      id: "team-02",
      name: "Studio Editor",
      email: "editor@koredejames.com",
      role: "editor",
      status: "Invited",
    },
    {
      id: "team-03",
      name: "Client Support",
      email: "support@koredejames.com",
      role: "support",
      status: "Active",
    },
  ],
  orders: [
    {
      id: "KJ-1024",
      customer: "Amara Okoye",
      total: "$2,850",
      status: "Fulfillment",
      refundLimit: "$50",
    },
    {
      id: "KJ-1025",
      customer: "Tomi Adeyemi",
      total: "$5,200",
      status: "Review",
      refundLimit: "$50",
    },
  ],
  customers: [
    {
      name: "Amara Okoye",
      email: "amara@example.com",
      orders: 3,
      note: "Prefers WhatsApp updates.",
    },
    {
      name: "Tomi Adeyemi",
      email: "tomi@example.com",
      orders: 1,
      note: "Waiting for fabric confirmation.",
    },
  ],
  content: [
    { title: "Freedom Collection", type: "Portfolio", status: "Published" },
    { title: "Atelier Notes", type: "Blog", status: "Draft" },
    { title: "Commission Guide", type: "Page", status: "Published" },
  ],
  promotions: [
    { title: "Private Client Preview", status: "Draft", ownerApproval: "Required" },
    { title: "Featured Freedom Pieces", status: "Published", ownerApproval: "Approved" },
  ],
  audit: [
    { actor: "Korede James", action: "Updated product availability", time: "Today" },
    { actor: "Studio Editor", action: "Drafted promotion", time: "Yesterday" },
    { actor: "Client Support", action: "Added support note", time: "2 days ago" },
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
    return stored ? normalizeWorkspace(JSON.parse(stored)) : defaultWorkspace;
  } catch {
    return defaultWorkspace;
  }
}

function normalizeWorkspace(workspace) {
  return {
    ...defaultWorkspace,
    ...workspace,
    requests: workspace.requests || defaultWorkspace.requests,
    pieces: workspace.pieces || defaultWorkspace.pieces,
    team: workspace.team || defaultWorkspace.team,
    orders: workspace.orders || defaultWorkspace.orders,
    customers: workspace.customers || defaultWorkspace.customers,
    content: workspace.content || defaultWorkspace.content,
    promotions: workspace.promotions || defaultWorkspace.promotions,
    audit: workspace.audit || defaultWorkspace.audit,
  };
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
  const [currentRole, setCurrentRole] = useState("owner");
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
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    email: "",
    role: "editor",
  });

  useEffect(() => {
    setWorkspace(readWorkspace());
    setUnlocked(window.localStorage.getItem(ACCESS_KEY) === "true");
  }, []);

  const selectedRequest =
    workspace.requests.find((request) => request.id === selectedRequestId) ||
    workspace.requests[0];
  const activeRoleProfile = roleProfiles[currentRole];

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

  const updateTeamMember = (memberId, patch) => {
    const nextWorkspace = {
      ...workspace,
      team: workspace.team.map((member) =>
        member.id === memberId ? { ...member, ...patch } : member
      ),
    };
    commitWorkspace(nextWorkspace);
  };

  const removeTeamMember = (memberId) => {
    const nextWorkspace = {
      ...workspace,
      team: workspace.team.filter((member) => member.id !== memberId),
    };
    commitWorkspace(nextWorkspace);
  };

  const handleAddTeamMember = (event) => {
    event.preventDefault();
    if (!newTeamMember.name.trim() || !newTeamMember.email.trim()) {
      return;
    }

    const nextMember = {
      id: createId("team"),
      name: newTeamMember.name.trim(),
      email: newTeamMember.email.trim(),
      role: newTeamMember.role,
      status: "Invited",
    };

    commitWorkspace({
      ...workspace,
      team: [nextMember, ...workspace.team],
    });
    setNewTeamMember({
      name: "",
      email: "",
      role: "editor",
    });
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
            <span>Products</span>
          </button>
          {adminModules
            .filter((module) => module.id !== "products")
            .map((module) => {
              const Icon = module.icon;
              return (
                <button
                  className={activeView === module.id ? "is-active" : ""}
                  onClick={() => setActiveView(module.id)}
                  type="button"
                  key={module.id}
                >
                  <Icon size={16} />
                  <span>{module.label}</span>
                </button>
              );
            })}
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
            <label className="admin-role-switcher">
              <span>Viewing as</span>
              <select
                value={currentRole}
                onChange={(event) => setCurrentRole(event.target.value)}
              >
                {Object.entries(roleProfiles).map(([role, profile]) => (
                  <option value={role} key={role}>
                    {profile.label}
                  </option>
                ))}
              </select>
            </label>
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
                  <p className="admin-kicker">Products</p>
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

            <article className="admin-panel admin-panel--wide">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">Access</p>
                  <h3>Role coverage</h3>
                </div>
                <span className="admin-role-badge">{activeRoleProfile.tone}</span>
              </div>
              <div className="admin-module-grid">
                {adminModules.map((module) => (
                  <ModuleAccessCard
                    module={module}
                    role={currentRole}
                    key={module.id}
                  />
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

        {["orders", "customers", "content", "marketing", "analytics", "settings", "audit"].includes(activeView) ? (
          <ModulePanel
            view={activeView}
            role={currentRole}
            workspace={workspace}
          />
        ) : null}

        {activeView === "team" ? (
          <section className="admin-team">
            <article className="admin-panel admin-panel--wide">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">Roles</p>
                  <h3>Access control</h3>
                </div>
                <span className="admin-role-badge">Owner Managed</span>
              </div>
              <div className="admin-role-grid">
                {Object.entries(roleProfiles).map(([role, profile]) => (
                  <button
                    type="button"
                    className={`admin-role-card ${currentRole === role ? "is-active" : ""}`}
                    key={role}
                    onClick={() => setCurrentRole(role)}
                  >
                    <span>{profile.tone}</span>
                    <strong>{profile.label}</strong>
                    <small>{profile.summary}</small>
                  </button>
                ))}
              </div>
              <PermissionMatrix role={currentRole} />
            </article>

            <article className="admin-panel">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">Team</p>
                  <h3>Admin accounts</h3>
                </div>
              </div>
              <div className="admin-team-list">
                {workspace.team.map((member) => (
                  <div className="admin-team-member" key={member.id}>
                    <div>
                      <strong>{member.name}</strong>
                      <span>{member.email}</span>
                    </div>
                    <select
                      value={member.role}
                      onChange={(event) =>
                        updateTeamMember(member.id, { role: event.target.value })
                      }
                    >
                      {Object.entries(roleProfiles).map(([role, profile]) => (
                        <option value={role} key={role}>
                          {profile.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={() => removeTeamMember(member.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <form className="admin-add-form" onSubmit={handleAddTeamMember}>
                <label>
                  Name
                  <input
                    value={newTeamMember.name}
                    onChange={(event) =>
                      setNewTeamMember({
                        ...newTeamMember,
                        name: event.target.value,
                      })
                    }
                    placeholder="Team member name"
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={newTeamMember.email}
                    onChange={(event) =>
                      setNewTeamMember({
                        ...newTeamMember,
                        email: event.target.value,
                      })
                    }
                    placeholder="email@example.com"
                  />
                </label>
                <label>
                  Role
                  <select
                    value={newTeamMember.role}
                    onChange={(event) =>
                      setNewTeamMember({
                        ...newTeamMember,
                        role: event.target.value,
                      })
                    }
                  >
                    {Object.entries(roleProfiles).map(([role, profile]) => (
                      <option value={role} key={role}>
                        {profile.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit">
                  <Plus size={15} />
                  <span>Add User</span>
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
    pieces: "Products",
    orders: "Orders",
    customers: "Customers",
    content: "Portfolio & content",
    marketing: "Marketing",
    analytics: "Analytics",
    settings: "Settings",
    team: "User management",
    audit: "Audit log",
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

function ModulePanel({ view, role, workspace }) {
  const module = adminModules.find((item) => item.id === view);
  const summary = moduleSummaries[view];
  const access = module?.[role] || "No access";
  const isLocked = access === "No access";
  const lockedItems = summary?.lockedFor?.[role] || [];
  const rows = getModuleRows(view, workspace);

  if (!module || !summary) {
    return null;
  }

  return (
    <section className="admin-module-view">
      <article className="admin-panel admin-panel--wide">
        <div className="admin-panel__heading">
          <div>
            <p className="admin-kicker">{module.label}</p>
            <h3>{summary.title}</h3>
          </div>
          <span className={isLocked ? "admin-access-badge is-locked" : "admin-access-badge"}>
            {isLocked ? "No Access" : roleProfiles[role].label}
          </span>
        </div>

        <div className="admin-module-hero">
          <div>
            <span>{summary.metric}</span>
            <strong>{access}</strong>
          </div>
          <div className="admin-action-grid">
            {summary.actions.map((action) => (
              <button type="button" disabled={isLocked} key={action}>
                {action}
              </button>
            ))}
          </div>
        </div>

        {lockedItems.length ? (
          <div className="admin-locked-strip">
            {lockedItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}

        <div className="admin-data-list">
          {rows.map((row) => (
            <div className="admin-data-row" key={row.title}>
              <div>
                <strong>{row.title}</strong>
                <span>{row.subtitle}</span>
              </div>
              <em>{row.meta}</em>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function ModuleAccessCard({ module, role }) {
  const access = module[role];
  const isLocked = access === "No access";
  const Icon = module.icon;

  return (
    <div className={`admin-module-card ${isLocked ? "is-locked" : ""}`}>
      <Icon size={17} />
      <strong>{module.label}</strong>
      <span>{access}</span>
    </div>
  );
}

function PermissionMatrix({ role }) {
  return (
    <div className="admin-permission-table">
      {adminModules.map((module) => {
        const access = module[role];
        return (
          <div className="admin-permission-row" key={module.id}>
            <strong>{module.label}</strong>
            <span>{access}</span>
          </div>
        );
      })}
    </div>
  );
}

function getModuleRows(view, workspace) {
  if (view === "orders") {
    return workspace.orders.map((order) => ({
      title: order.id,
      subtitle: order.customer,
      meta: `${order.status} / Refund cap ${order.refundLimit}`,
    }));
  }

  if (view === "customers") {
    return workspace.customers.map((customer) => ({
      title: customer.name,
      subtitle: customer.email,
      meta: `${customer.orders} orders`,
    }));
  }

  if (view === "content") {
    return workspace.content.map((entry) => ({
      title: entry.title,
      subtitle: entry.type,
      meta: entry.status,
    }));
  }

  if (view === "marketing") {
    return workspace.promotions.map((promotion) => ({
      title: promotion.title,
      subtitle: promotion.ownerApproval,
      meta: promotion.status,
    }));
  }

  if (view === "analytics") {
    return [
      { title: "Sales", subtitle: "Monthly overview", meta: "$18,400" },
      { title: "Traffic", subtitle: "Site visits", meta: "12,904" },
      { title: "Conversion", subtitle: "Portal requests", meta: "4.8%" },
    ];
  }

  if (view === "settings") {
    return [
      { title: "Shipping Rules", subtitle: "Regional fulfillment", meta: "Configured" },
      { title: "Tax Config", subtitle: "Checkout taxation", meta: "Owner only" },
      { title: "Payment Gateway", subtitle: "Cards and bank transfer", meta: "Owner only" },
      { title: "API Keys", subtitle: "Private integrations", meta: "Owner only" },
    ];
  }

  return workspace.audit.map((entry) => ({
    title: entry.actor,
    subtitle: entry.action,
    meta: entry.time,
  }));
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
