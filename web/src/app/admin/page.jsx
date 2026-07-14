import { useEffect, useMemo, useRef, useState } from "react";
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
  Mail,
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
import {
  ADMIN_ACCESS_SECRET_KEY,
  ADMIN_WORKSPACE_STORAGE_KEY,
  createEmptyAdminWorkspace,
  fetchNewsletterSubscribers,
  fetchAdminWorkspace,
  saveAdminWorkspace,
  sendNewsletterCampaign,
  updateNewsletterSubscriber,
} from "../../utils/adminWorkspace";
import { seedWorkspaceProducts } from "../../utils/productCatalog";
import "./page.css";

const STORAGE_KEY = ADMIN_WORKSPACE_STORAGE_KEY;
const ACCESS_KEY = "korede-james-admin-unlocked";
const ACCESS_ROLE_KEY = "korede-james-admin-role";

const requestStatuses = [
  "Inquiry received",
  "Quoted",
  "Accepted / deposit paid",
  "In progress - Consultation",
  "In progress - Toile & Fittings",
  "Revisions requested",
  "Completed / delivered",
  "Archived",
];

const commissionStages = [
  "Inquiry received",
  "Quoted",
  "Accepted / deposit paid",
  "Consultation",
  "Toile & Fittings",
  "Revisions requested",
  "Completed / delivered",
  "Archived",
];

const requestStatusByRole = {
  owner: requestStatuses,
  editor: [],
  studio: [
    "In progress - Consultation",
    "In progress - Toile & Fittings",
    "Revisions requested",
    "Completed / delivered",
  ],
  support: [
    "Inquiry received",
    "In progress - Consultation",
    "In progress - Toile & Fittings",
    "Revisions requested",
    "Completed / delivered",
    "Archived",
  ],
};

const commissionStagesByRole = {
  owner: commissionStages,
  editor: [],
  studio: [
    "Consultation",
    "Toile & Fittings",
    "Revisions requested",
    "Completed / delivered",
  ],
  support: [
    "Inquiry received",
    "Consultation",
    "Toile & Fittings",
    "Revisions requested",
    "Completed / delivered",
  ],
};

const adminModules = [
  {
    id: "requests",
    label: "Pipeline",
    icon: Workflow,
    owner: "View and edit all requests, create and approve quotes, pricing, scope, and timelines",
    editor: "No access",
    studio: "View assigned commissions and update production status",
    support: "View status and update non-financial fields",
  },
  {
    id: "contracts",
    label: "Contracts",
    icon: FileText,
    owner: "Create, attach, manage usage rights and terms",
    editor: "No access",
    studio: "No access",
    support: "No access",
  },
  {
    id: "payments",
    label: "Payments",
    icon: ShoppingBag,
    owner: "Deposits, installments, full payment history, refunds and cancellations with no limit",
    editor: "No access",
    studio: "No access",
    support: "Refunds up to 5% of commission value; above that requires Owner sign-off",
  },
  {
    id: "communication",
    label: "Messages",
    icon: Users,
    owner: "Full access to all message threads and revision history",
    editor: "No access",
    studio: "No access",
    support: "Respond to inquiries, manage revision requests, and log notes",
  },
  {
    id: "measurements",
    label: "Measurements",
    icon: User,
    owner: "Full access across all commissions",
    editor: "No access",
    studio: "Assigned client measurements and fitting feedback only",
    support: "No access",
  },
  {
    id: "materials",
    label: "Materials",
    icon: Package,
    owner: "Fabric inventory, supplier info, and cost-of-materials tracking",
    editor: "No access",
    studio: "Log fabric and materials used; supplier pricing hidden unless granted",
    support: "No access",
  },
  {
    id: "pieces",
    label: "Products",
    icon: Package,
    owner: "Add, edit, remove, price, publish, and manage product images and colourways",
    editor: "Add, edit, remove, price, and manage product images and colourways",
    studio: "No access",
    support: "No access",
  },
  {
    id: "content",
    label: "Atelier Content",
    icon: FileText,
    owner: "Full edit access to pages, media library, and blog if applicable",
    editor: "Full access to pages, media library, process photos, and featured work drafts",
    studio: "No access",
    support: "No access",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    owner: "Discount and promo codes, featured commissions",
    editor: "Draft promotions only; Owner approval required to publish",
    studio: "No access",
    support: "No access",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: Mail,
    owner: "View subscribers, manage status, export audience list, and review sources",
    editor: "View subscribers, export audience list, and prepare audience segments",
    studio: "No access",
    support: "No access",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: LineChart,
    owner: "Inquiries, conversion rate, revenue, and repeat clients",
    editor: "No access",
    studio: "No access",
    support: "No access",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    owner: "Payment gateway, tax config, integrations, and API keys",
    editor: "No access",
    studio: "No access",
    support: "No access",
  },
  {
    id: "team",
    label: "Users",
    icon: ShieldCheck,
    owner: "Create, edit, remove admin accounts and roles",
    editor: "No access",
    studio: "No access",
    support: "No access",
  },
  {
    id: "audit",
    label: "Audit",
    icon: History,
    owner: "Full activity history with user name and timestamp",
    editor: "No access",
    studio: "No access",
    support: "No access",
  },
];

const roleProfiles = {
  owner: {
    label: "Owner / Admin",
    summary: "Full access across commissions, finance, client data, content, settings, users, and audit.",
    tone: "Full Access",
  },
  editor: {
    label: "Editor",
    summary: "Product management, atelier content, media library, process photos, and featured work drafts.",
    tone: "Product Access",
  },
  studio: {
    label: "Studio",
    summary: "Production and tailoring access for assigned commissions, fittings, materials, and measurements.",
    tone: "Production Access",
  },
  support: {
    label: "Support",
    summary: "Commission status, client inquiries, revision requests, notes, and refund requests up to 5%.",
    tone: "Support Access",
  },
};

const moduleSummaries = {
  requests: {
    title: "Commission Pipeline",
    metric: "8 active commissions",
    actions: ["Update Status", "Assign Owner", "Create Quote", "Set Timeline"],
    lockedFor: {
      editor: ["Pipeline", "Quotes", "Client Data"],
      studio: ["Pricing", "Quote Approval", "Client Threads"],
      support: ["Quote Creation", "Pricing", "Financial Terms"],
    },
  },
  contracts: {
    title: "Contracts & Agreements",
    metric: "Owner only",
    actions: ["Create Contract", "Attach Agreement", "Usage Rights", "Terms"],
    lockedFor: {
      editor: ["Contracts", "Usage Rights"],
      studio: ["Contracts", "Terms"],
      support: ["Contracts", "Terms"],
    },
  },
  payments: {
    title: "Payments",
    metric: "Deposits and installments",
    actions: ["View History", "Record Deposit", "Refund", "Cancel"],
    lockedFor: {
      editor: ["Payments", "Refunds"],
      studio: ["Payments", "Refunds"],
      support: ["Refunds Above 5%", "Gateway Settings"],
    },
  },
  communication: {
    title: "Client Communication",
    metric: "Revision history",
    actions: ["Reply", "Log Note", "Revision Request", "Thread History"],
    lockedFor: {
      editor: ["Client Threads", "Revision History"],
      studio: ["Client Threads"],
      support: [],
    },
  },
  measurements: {
    title: "Measurements & Body Data",
    metric: "Restricted client records",
    actions: ["View Record", "Log Fitting", "Edit Measurement", "Revision Note"],
    lockedFor: {
      editor: ["Measurements", "Body Data"],
      studio: ["Unassigned Client Records"],
      support: ["Measurements", "Body Data"],
    },
  },
  materials: {
    title: "Materials & Sourcing",
    metric: "Fabric and supplier tracking",
    actions: ["Log Fabric", "Track Supplier", "Cost Materials", "Inventory"],
    lockedFor: {
      editor: ["Materials", "Supplier Pricing"],
      studio: ["Supplier Pricing"],
      support: ["Materials", "Supplier Info"],
    },
  },
  pieces: {
    title: "Product Management",
    metric: "Catalogue records",
    actions: ["Add Product", "Edit Product", "Remove Product", "Colourway Images"],
    lockedFor: {
      editor: [],
      studio: ["Portfolio Publishing"],
      support: ["Portfolio Publishing"],
    },
  },
  content: {
    title: "Atelier & Content",
    metric: "Pages and media",
    actions: ["Pages", "Media Library", "Process Photos", "Blog"],
    lockedFor: {
      editor: [],
      studio: ["Content Editing"],
      support: ["Content Editing", "Media Library"],
    },
  },
  marketing: {
    title: "Marketing Studio",
    metric: "Promotions and features",
    actions: ["Promo Code", "Featured Commission", "Draft Campaign", "Publish"],
    lockedFor: {
      editor: ["Publish Promotion"],
      studio: ["Marketing"],
      support: ["Marketing"],
    },
  },
  newsletter: {
    title: "Newsletter Audience",
    metric: "Subscriber list",
    actions: ["Send Update", "Refresh List", "Export CSV", "Create Segment"],
    lockedFor: {
      editor: ["Subscriber Status Changes"],
      studio: ["Newsletter Audience"],
      support: ["Newsletter Audience"],
    },
  },
  analytics: {
    title: "Analytics",
    metric: "Owner reporting",
    actions: ["Inquiries", "Conversion", "Revenue", "Repeat Clients"],
    lockedFor: {
      editor: ["Analytics"],
      studio: ["Analytics"],
      support: ["Analytics"],
    },
  },
  settings: {
    title: "Settings",
    metric: "Owner only",
    actions: ["Payment Gateway", "Tax Config", "Integrations", "API Keys"],
    lockedFor: {
      editor: ["Settings"],
      studio: ["Settings"],
      support: ["Settings"],
    },
  },
  audit: {
    title: "Audit Log",
    metric: "Every change recorded",
    actions: ["Status Updates", "Refunds", "Content Edits", "Measurement Edits"],
    lockedFor: {
      editor: ["Audit Log"],
      studio: ["Audit Log"],
      support: ["Audit Log"],
    },
  },
};

const crossRoleRequirements = [
  "2FA required for every admin account",
  "Every change is tagged with user name and timestamp",
  "Payment and API credentials visible to Owner only",
  "No raw card data stored; payment processor tokenization only",
  "Measurements limited to Owner and assigned Studio staff",
  "Refunds above threshold require Owner approval",
  "Editor drafts require Owner approval before publishing",
  "Client data visible only to roles directly handling that project",
];

const defaultWorkspace = createEmptyAdminWorkspace();

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
    contracts: workspace.contracts || defaultWorkspace.contracts,
    measurements: workspace.measurements || defaultWorkspace.measurements,
    materials: workspace.materials || defaultWorkspace.materials,
    content: workspace.content || defaultWorkspace.content,
    promotions: workspace.promotions || defaultWorkspace.promotions,
    newsletter: workspace.newsletter || defaultWorkspace.newsletter,
    newsletterSegments:
      workspace.newsletterSegments || defaultWorkspace.newsletterSegments,
    newsletterUpdates:
      workspace.newsletterUpdates || defaultWorkspace.newsletterUpdates,
    settings: workspace.settings || defaultWorkspace.settings,
    audit: workspace.audit || defaultWorkspace.audit,
  };
}

function ensureProductCatalogue(workspace) {
  const normalized = normalizeWorkspace(workspace || {});
  const seeded = seedWorkspaceProducts(normalized);

  return {
    workspace: normalizeWorkspace(seeded.workspace),
    seeded: seeded.seeded,
  };
}

async function persistWorkspace(workspace) {
  return saveAdminWorkspace(workspace);
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
  const [sessionRole, setSessionRole] = useState("owner");
  const [currentRole, setCurrentRole] = useState("owner");
  const [selectedRequestId, setSelectedRequestId] = useState(
    defaultWorkspace.requests[0]?.id || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [saveState, setSaveState] = useState("Saved");
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [newsletterError, setNewsletterError] = useState("");
  const saveTimerRef = useRef(null);
  const [newPiece, setNewPiece] = useState({
    title: "",
    category: "Outerwear",
    image: "",
    colors: "White",
    colorImages: {},
    availability: "Available",
    budget: "N2,000",
    description: "",
  });
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    email: "",
    role: "editor",
  });

  useEffect(() => {
    const localCatalogue = ensureProductCatalogue(readWorkspace());
    setWorkspace(localCatalogue.workspace);
    const storedRole = window.sessionStorage.getItem(ACCESS_ROLE_KEY);
    const hasSessionCode = Boolean(
      window.sessionStorage.getItem(ADMIN_ACCESS_SECRET_KEY),
    );
    if (hasSessionCode && roleProfiles[storedRole]) {
      setSessionRole(storedRole);
      setCurrentRole(storedRole);
      setActiveView(storedRole === "editor" ? "pieces" : "overview");
      setUnlocked(true);
      fetchAdminWorkspace().then((remoteWorkspace) => {
        const seededCatalogue = ensureProductCatalogue(remoteWorkspace);
        setWorkspace(seededCatalogue.workspace);
        if (seededCatalogue.seeded) {
          saveAdminWorkspace(seededCatalogue.workspace).then(setWorkspace);
        }
      });
      loadNewsletterSubscribers();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const loadNewsletterSubscribers = async () => {
    try {
      const subscribers = await fetchNewsletterSubscribers();
      setNewsletterSubscribers(subscribers);
      setNewsletterError("");
      return subscribers;
    } catch (error) {
      setNewsletterError(
        error instanceof Error
          ? error.message
          : "Newsletter subscribers could not be loaded."
      );
      return [];
    }
  };

  const selectedRequest =
    workspace.requests.find((request) => request.id === selectedRequestId) ||
    workspace.requests[0];
  const activeRoleProfile = roleProfiles[currentRole];
  const workspaceWithNewsletter = useMemo(
    () => ({
      ...workspace,
      newsletter: newsletterSubscribers,
    }),
    [workspace, newsletterSubscribers]
  );
  const canManageRoles = sessionRole === "owner";
  const statusOptions = getRequestStatusOptions(currentRole, selectedRequest?.status);
  const stageOptions = getRequestStageOptions(currentRole, selectedRequest?.stage);
  const visibleModules = useMemo(
    () => adminModules.filter((module) => hasModuleAccess(module, currentRole)),
    [currentRole]
  );

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

  const filteredPieces = useMemo(() => {
    const term = productSearchTerm.trim().toLowerCase();
    if (!term) {
      return workspace.pieces;
    }

    return workspace.pieces.filter((piece) =>
      [
        piece.title,
        piece.sku,
        piece.category,
        piece.collection,
        piece.availability,
        formatColorList(piece.colors),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [productSearchTerm, workspace.pieces]);

  useEffect(() => {
    if (activeView === "overview") {
      return;
    }

    const hasAccess = visibleModules.some((module) => module.id === activeView);
    if (!hasAccess) {
      setActiveView("overview");
    }
  }, [activeView, visibleModules]);

  const stats = useMemo(() => {
    const activeRequests = workspace.requests.filter(
      (request) => !["Completed / delivered", "Archived"].includes(request.status)
    ).length;
    const newRequests = workspace.requests.filter(
      (request) => request.status === "Inquiry received"
    ).length;
    const visiblePieces = workspace.pieces.filter(
      (piece) => piece.visibility === "Visible"
    ).length;

    if (currentRole === "editor") {
      return [
        {
          label: "Content Drafts",
          value: workspace.content.filter((entry) => entry.status === "Draft").length,
          detail: "Awaiting review",
          icon: FileText,
        },
        { label: "Visible Products", value: visiblePieces, detail: "Live catalogue", icon: Package },
        { label: "All Products", value: workspace.pieces.length, detail: "Ready to edit", icon: Upload },
      ];
    }

    if (currentRole === "studio") {
      return [
        { label: "Assigned Jobs", value: activeRequests, detail: "Production queue", icon: Workflow },
        { label: "Fittings", value: workspace.measurements.length, detail: "Scheduled", icon: User },
        { label: "Material Logs", value: workspace.materials.length, detail: "This week", icon: Package },
      ];
    }

    if (currentRole === "support") {
      return [
        { label: "Open Threads", value: workspace.customers.length, detail: "Client replies", icon: Users },
        {
          label: "Revision Requests",
          value: workspace.requests.filter((request) => request.status === "Revisions requested").length,
          detail: "Needs update",
          icon: Workflow,
        },
        { label: "Refund Limit", value: "5%", detail: "Owner above cap", icon: ShoppingBag },
      ];
    }

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
        label: "Featured Work",
        value: visiblePieces,
        detail: "Portfolio ready",
        icon: Package,
      },
    ];
  }, [currentRole, workspace]);

  const commitWorkspace = (nextWorkspace) => {
    setWorkspace(nextWorkspace);
    setSaveState("Saving...");

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    persistWorkspace(nextWorkspace).then((savedWorkspace) => {
      setWorkspace(savedWorkspace);
      saveTimerRef.current = window.setTimeout(() => {
        setSaveState("Saved just now");
      }, 500);
    });
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

  const removePiece = (pieceId) => {
    const nextWorkspace = {
      ...workspace,
      pieces: workspace.pieces.filter((piece) => piece.id !== pieceId),
    };
    commitWorkspace(nextWorkspace);
  };

  const appendAudit = (nextWorkspace, action) => ({
    ...nextWorkspace,
    audit: [
      {
        id: createId("audit"),
        actor: activeRoleProfile.label,
        action,
        time: "Just now",
      },
      ...nextWorkspace.audit,
    ],
  });

  const handleModuleSave = async (view, payload) => {
    if (view === "newsletter") {
      if (payload.mode === "action") {
        if (payload.action === "Refresh List") {
          setSaveState("Saving...");
          await loadNewsletterSubscribers();
          commitWorkspace(
            appendAudit(workspace, "Refreshed Newsletter Audience")
          );
          return;
        }

        if (payload.action === "Send Update") {
          setSaveState("Sending newsletter...");
          try {
            const result = await sendNewsletterCampaign({
              subject: payload.title,
              title: payload.subtitle,
              message: payload.notes,
            });
            setNewsletterError("");
            const nextWorkspace = {
              ...workspace,
              newsletterUpdates: [
                {
                  id: createId("newsletter-update"),
                  kind: "update",
                  title: payload.title,
                  subtitle: payload.subtitle,
                  meta: `Sent to ${result.sent || 0}/${result.total || 0}`,
                  notes: payload.notes,
                  sentAt: new Date().toISOString(),
                },
                ...(workspace.newsletterUpdates || []),
              ],
            };
            commitWorkspace(
              appendAudit(
                nextWorkspace,
                result.message || `Sent Newsletter Update to ${result.sent || 0} subscribers`
              )
            );
          } catch (error) {
            setNewsletterError(
              error instanceof Error
                ? error.message
                : "Newsletter could not be sent."
            );
            setSaveState("Newsletter send failed");
          }
          return;
        }

        const nextWorkspace = applyModulePayload(workspace, view, payload);
        commitWorkspace(
          appendAudit(
            nextWorkspace,
            `${payload.action} in ${viewTitle(view)}: ${payload.notes || payload.title}`
          )
        );
        return;
      }

      if (payload.mode === "delete" && payload.kind === "subscriber") {
        setSaveState("Saving...");
        try {
          const updatedSubscriber = await updateNewsletterSubscriber({
            email: payload.title,
            status: "unsubscribed",
            source: payload.subtitle,
          });
          setNewsletterSubscribers((subscribers) =>
            subscribers.map((subscriber) =>
              subscriber.email === updatedSubscriber.email ? updatedSubscriber : subscriber
            )
          );
          commitWorkspace(
            appendAudit(
              workspace,
              `Unsubscribed newsletter subscriber ${updatedSubscriber.email}`
            )
          );
        } catch (error) {
          setNewsletterError(
            error instanceof Error
              ? error.message
              : "Newsletter subscriber could not be removed."
          );
          setSaveState("Newsletter save failed");
        }
        return;
      }

      if (
        payload.kind === "segment" ||
        payload.kind === "update" ||
        payload.mode === "delete"
      ) {
        const nextWorkspace = applyModulePayload(workspace, view, payload);
        commitWorkspace(
          appendAudit(
            nextWorkspace,
            payload.mode === "delete"
              ? `Removed ${payload.title || "newsletter segment"}`
              : `Updated newsletter segment ${payload.title}`
          )
        );
        return;
      }

      setSaveState("Saving...");
      try {
        const updatedSubscriber = await updateNewsletterSubscriber({
          email: payload.title,
          status: normalizeNewsletterStatus(payload.meta),
          source: payload.subtitle,
        });
        setNewsletterSubscribers((subscribers) =>
          subscribers.map((subscriber) =>
            subscriber.email === updatedSubscriber.email ? updatedSubscriber : subscriber
          )
        );
        commitWorkspace(
          appendAudit(
            workspace,
            `Updated newsletter subscriber ${updatedSubscriber.email}`
          )
        );
      } catch (error) {
        setNewsletterError(
          error instanceof Error
            ? error.message
            : "Newsletter subscriber could not be updated."
        );
        setSaveState("Newsletter save failed");
      }
      return;
    }

    const nextWorkspace = applyModulePayload(workspace, view, payload);
    const auditAction =
      payload.mode === "action"
        ? `${payload.action} in ${viewTitle(view)}`
        : payload.mode === "delete"
          ? `Removed ${payload.title || viewTitle(view)}`
        : `Updated ${payload.title || viewTitle(view)}`;
    commitWorkspace(appendAudit(nextWorkspace, auditAction));
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
      image: newPiece.image.trim(),
      colors: parseColorList(newPiece.colors),
      colorImages: normalizeColorImages(newPiece.colorImages),
      visibility: "Visible",
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
      colors: "White",
      colorImages: {},
      availability: "Available",
      budget: "N2,000",
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

  const handlePieceColorImageUpload = async (pieceId, color, event) => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    const image = await readFileAsDataUrl(file);
    const piece = workspace.pieces.find((item) => item.id === pieceId);
    updatePiece(pieceId, {
      colorImages: {
        ...(piece?.colorImages || {}),
        [color]: image,
      },
    });
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

  const handleNewPieceColorImageUpload = async (color, event) => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    const image = await readFileAsDataUrl(file);
    setNewPiece((currentPiece) => ({
      ...currentPiece,
      colorImages: {
        ...currentPiece.colorImages,
        [color]: image,
      },
    }));
    event.target.value = "";
  };

  const handleUnlock = async (event) => {
    event.preventDefault();
    const code = accessCode.trim();
    if (!code) {
      setAccessError("Invalid access code.");
      return;
    }

    try {
      window.sessionStorage.setItem(ADMIN_ACCESS_SECRET_KEY, code);
      const response = await fetch("/api/admin-workspace", {
        headers: {
          "x-kj-admin-code": code,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !roleProfiles[data.role]) {
        throw new Error(data.error || "Invalid access code.");
      }

      window.sessionStorage.setItem(ACCESS_KEY, "true");
      window.sessionStorage.setItem(ACCESS_ROLE_KEY, data.role);
      setSessionRole(data.role);
      setCurrentRole(data.role);
      setWorkspace(normalizeWorkspace(data.workspace || {}));
      setUnlocked(true);
      setAccessError("");
      loadNewsletterSubscribers();
    } catch (error) {
      window.sessionStorage.removeItem(ACCESS_KEY);
      window.sessionStorage.removeItem(ACCESS_ROLE_KEY);
      window.sessionStorage.removeItem(ADMIN_ACCESS_SECRET_KEY);
      setAccessError(error instanceof Error ? error.message : "Invalid access code.");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(ACCESS_ROLE_KEY);
    window.localStorage.removeItem(ADMIN_ACCESS_SECRET_KEY);
    window.sessionStorage.removeItem(ACCESS_KEY);
    window.sessionStorage.removeItem(ACCESS_ROLE_KEY);
    window.sessionStorage.removeItem(ADMIN_ACCESS_SECRET_KEY);
    setUnlocked(false);
    setSessionRole("owner");
    setCurrentRole("owner");
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
          {visibleModules.map((module) => {
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
            {canManageRoles ? (
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
            ) : (
              <span className="admin-role-badge">{activeRoleProfile.label}</span>
            )}
            <span className="admin-private-pill">Private</span>
            <div
              className={`admin-save-state ${saveState === "Saving..." ? "is-saving" : ""}`}
              aria-live="polite"
            >
              {saveState === "Saving..." ? <Clock size={15} /> : <CheckCircle2 size={15} />}
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

            {visibleModules.some((module) => module.id === "requests") ? (
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
            ) : null}

            {visibleModules.some((module) => module.id === "pieces") ? (
              <article className="admin-panel">
                <div className="admin-panel__heading">
                  <div>
                    <p className="admin-kicker">Products</p>
                    <h3>Catalogue</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView("pieces")}
                    className="admin-icon-button"
                  >
                    <Package size={15} />
                    <span>Manage</span>
                  </button>
                </div>
                <div className="admin-mini-list">
                  {workspace.pieces.length ? (
                    workspace.pieces.slice(0, 4).map((piece) => (
                      <div key={piece.id} className="admin-mini-piece">
                        {piece.image ? <img src={piece.image} alt="" /> : null}
                        <div>
                          <strong>{piece.title}</strong>
                          <span className={availabilityClassName(piece.availability)}>
                            {piece.availability}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="admin-empty">No products loaded yet.</p>
                  )}
                </div>
              </article>
            ) : null}

            <article className="admin-panel admin-panel--wide">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">Access</p>
                  <h3>Role coverage</h3>
                </div>
                <span className="admin-role-badge">{activeRoleProfile.tone}</span>
              </div>
              <div className="admin-module-grid">
                {visibleModules.map((module) => (
                  <ModuleAccessCard
                    module={module}
                    role={currentRole}
                    key={module.id}
                  />
                ))}
              </div>
            </article>

            <article className="admin-panel admin-panel--wide">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">Requirements</p>
                  <h3>Security rules</h3>
                </div>
                <span className="admin-role-badge">Mandatory</span>
              </div>
              <div className="admin-requirement-grid">
                {crossRoleRequirements.map((requirement) => (
                  <div className="admin-requirement" key={requirement}>
                    <ShieldCheck size={15} />
                    <span>{requirement}</span>
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
                  {currentRole === "owner" ? <span>{selectedRequest.budget}</span> : null}
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
                      {statusOptions.map((status) => (
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
                      {stageOptions.map((stage) => (
                        <option key={stage}>{stage}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="admin-progress">
                  {stageOptions.map((stage) => (
                    <button
                      key={stage}
                      className={
                        stageOptions.indexOf(stage) <=
                        stageOptions.indexOf(selectedRequest.stage)
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
                  <p className="admin-kicker">Products</p>
                  <h3>Product catalogue</h3>
                </div>
              </div>

              <label className="admin-search">
                <Search size={15} />
                <input
                  value={productSearchTerm}
                  onChange={(event) => setProductSearchTerm(event.target.value)}
                  placeholder="Search product, SKU, category, colour"
                />
              </label>

              <div className="admin-piece-table">
                {filteredPieces.length ? (
                  filteredPieces.map((piece) => (
                    <div className="admin-piece-row" key={piece.id}>
                    <div className="admin-piece-media">
                      {piece.image ? <img src={piece.image} alt="" /> : null}
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
                        Registered Value
                        <input
                          value={piece.budget || ""}
                          onChange={(event) =>
                            updatePiece(piece.id, {
                              budget: event.target.value,
                            })
                          }
                          placeholder="N2,000.00"
                        />
                      </label>
                      <label>
                        Colour Attributes
                        <input
                          value={formatColorList(piece.colors)}
                          onChange={(event) =>
                            updatePiece(piece.id, {
                              colors: parseColorList(event.target.value),
                            })
                          }
                          placeholder="White, Red, Black"
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
                      <div className="admin-colorway-manager">
                        <p>Colourway Images</p>
                        <div className="admin-colorway-grid">
                          {getPieceColors(piece).map((color) => (
                            <div className="admin-colorway-card" key={color}>
                              <div className="admin-colorway-card__image">
                                {piece.colorImages?.[color] ? (
                                  <img src={piece.colorImages[color]} alt="" />
                                ) : piece.image ? (
                                  <img src={piece.image} alt="" />
                                ) : (
                                  <span>No image</span>
                                )}
                              </div>
                              <strong>{color}</strong>
                              <label className="admin-upload admin-upload--small">
                                <Upload size={14} />
                                <span>Upload {color}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) =>
                                    handlePieceColorImageUpload(
                                      piece.id,
                                      color,
                                      event,
                                    )
                                  }
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="admin-piece-actions">
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
                      <button
                        type="button"
                        className="admin-delete-button admin-delete-button--piece"
                        aria-label={`Remove ${piece.title}`}
                        onClick={() => removePiece(piece.id)}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="admin-empty">
                    {workspace.pieces.length
                      ? "No products match that search."
                      : "No products loaded yet."}
                  </p>
                )}
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel__heading">
                <div>
                  <p className="admin-kicker">New Product</p>
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
                    placeholder="Work title"
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
                <label>
                  Registered Value
                  <input
                    value={newPiece.budget}
                    onChange={(event) =>
                      setNewPiece({
                        ...newPiece,
                        budget: event.target.value,
                      })
                    }
                    placeholder="N2,000.00"
                  />
                </label>
                <label>
                  Colour Attributes
                  <input
                    value={newPiece.colors}
                    onChange={(event) =>
                      setNewPiece({
                        ...newPiece,
                        colors: event.target.value,
                      })
                    }
                    placeholder="White, Red, Black"
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
                <div className="admin-colorway-manager">
                  <p>Colourway Images</p>
                  <div className="admin-colorway-grid">
                    {parseColorList(newPiece.colors).map((color) => (
                      <div className="admin-colorway-card" key={color}>
                        <div className="admin-colorway-card__image">
                          {newPiece.colorImages[color] ? (
                            <img src={newPiece.colorImages[color]} alt="" />
                          ) : newPiece.image ? (
                            <img src={newPiece.image} alt="" />
                          ) : (
                            <span>No image</span>
                          )}
                        </div>
                        <strong>{color}</strong>
                        <label className="admin-upload admin-upload--small">
                          <Upload size={14} />
                          <span>Upload {color}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleNewPieceColorImageUpload(color, event)
                            }
                          />
                        </label>
                      </div>
                    ))}
                  </div>
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
                  <span>Add Product</span>
                </button>
              </form>
            </article>
          </section>
        ) : null}

        {visibleModules.some((module) => module.id === activeView) &&
        !["requests", "pieces", "team"].includes(activeView) ? (
          <ModulePanel
            view={activeView}
            role={currentRole}
            workspace={workspaceWithNewsletter}
            onSave={handleModuleSave}
            notice={activeView === "newsletter" ? newsletterError : ""}
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
    requests: "Commission pipeline",
    contracts: "Contracts",
    payments: "Payments",
    communication: "Client communication",
    measurements: "Measurements",
    materials: "Materials",
    pieces: "Products",
    content: "Atelier content",
    marketing: "Marketing",
    newsletter: "Newsletter",
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

function rowKindLabel(kind) {
  const labels = {
    update: "Recently sent update",
    segment: "Audience segment",
    subscriber: "Subscriber",
  };

  return labels[kind] || kind;
}

function ModulePanel({ view, role, workspace, onSave, notice }) {
  const module = adminModules.find((item) => item.id === view);
  const summary = moduleSummaries[view];
  const access = module?.[role] || "No access";
  const isLocked = access === "No access";
  const lockedItems = summary?.lockedFor?.[role] || [];
  const rows = getModuleRows(view, workspace);
  const hasEditableRows = !["analytics", "audit"].includes(view);
  const [draft, setDraft] = useState(null);

  if (!module || !summary) {
    return null;
  }

  const openAction = (action) => {
    if (view === "newsletter" && action === "Export CSV") {
      downloadRowsAsCsv("korede-james-newsletter.csv", rows);
      return;
    }

    if (view === "newsletter" && action === "Refresh List") {
      onSave(view, {
        mode: "action",
        action,
        title: action,
        subtitle: summary.title,
        meta: roleProfiles[role].label,
        notes: "Refresh subscriber list from Supabase.",
      });
      return;
    }

    setDraft(getModuleActionDraft(view, action, summary, role));
  };

  const openRow = (row) => {
    setDraft({
      mode: "row",
      ...row,
      notes: row.notes || "",
    });
  };

  const closeDraft = () => setDraft(null);

  const submitDraft = (event) => {
    event.preventDefault();
    if (!draft?.title?.trim()) {
      return;
    }

    onSave(view, {
      ...draft,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      meta: draft.meta.trim(),
      notes: draft.notes.trim(),
    });
    closeDraft();
  };

  const deleteDraft = () => {
    if (!draft || draft.mode !== "row") {
      return;
    }

    onSave(view, {
      ...draft,
      mode: "delete",
    });
    closeDraft();
  };

  const canDeleteDraft =
    draft?.mode === "row" &&
    hasEditableRows &&
    !["analytics", "audit"].includes(view);

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
              <button
                type="button"
                disabled={isLocked}
                key={action}
                onClick={() => openAction(action)}
              >
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

        {notice ? <p className="admin-empty">{notice}</p> : null}

        <div className="admin-data-list">
          {rows.map((row) =>
            hasEditableRows ? (
              <button
                className="admin-data-row admin-data-row--button"
                key={row.id || row.title}
                type="button"
                onClick={() => openRow(row)}
              >
                <div>
                  <strong>{row.title}</strong>
                  <span>
                    {row.kind ? `${rowKindLabel(row.kind)} / ` : ""}
                    {row.subtitle}
                  </span>
                </div>
                <em>{row.meta}</em>
              </button>
            ) : (
              <div className="admin-data-row" key={row.id || row.title}>
              <div>
                <strong>{row.title}</strong>
                <span>
                  {row.kind ? `${rowKindLabel(row.kind)} / ` : ""}
                  {row.subtitle}
                </span>
              </div>
              <em>{row.meta}</em>
              </div>
            )
          )}
        </div>

        {draft ? (
          <form className="admin-module-editor" onSubmit={submitDraft}>
            <div className="admin-panel__heading">
              <div>
                <p className="admin-kicker">
                  {draft.mode === "action" ? "Action" : "Record"}
                </p>
                <h3>{draft.mode === "action" ? draft.action : draft.title}</h3>
              </div>
              <button type="button" onClick={closeDraft}>
                Close
              </button>
            </div>
            <div className="admin-field-grid">
              <label>
                Title
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                />
              </label>
              <label>
                Status / Meta
                <input
                  value={draft.meta}
                  onChange={(event) =>
                    setDraft({ ...draft, meta: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="admin-notes">
              {draft.action === "Send Update" ? "Email Title" : "Details"}
              <textarea
                rows={4}
                value={draft.subtitle}
                onChange={(event) =>
                  setDraft({ ...draft, subtitle: event.target.value })
                }
              />
            </label>
            <label className="admin-notes">
              {draft.action === "Send Update" ? "Email Message" : "Internal Notes"}
              <textarea
                rows={5}
                value={draft.notes}
                onChange={(event) =>
                  setDraft({ ...draft, notes: event.target.value })
                }
                placeholder={
                  draft.action === "Send Update"
                    ? "Write the newsletter message subscribers should receive."
                    : "Add next step, approval note, fitting feedback, or client update."
                }
              />
            </label>
            <div className="admin-module-editor__actions">
              {canDeleteDraft ? (
                <button
                  className="admin-delete-button admin-delete-button--module"
                  type="button"
                  onClick={deleteDraft}
                >
                  <Trash2 size={14} />
                  <span>
                    {draft.kind === "subscriber" ? "Unsubscribe" : "Remove"}
                  </span>
                </button>
              ) : null}
              <button className="admin-module-save" type="submit">
                Save Update
              </button>
            </div>
          </form>
        ) : null}
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

function getModuleActionDraft(view, action, summary, role) {
  const actionDefaults = {
    contracts: {
      "Create Contract": ["New client agreement", "Draft contract terms"],
      "Attach Agreement": ["Agreement attachment", "Link signed terms or usage rights"],
      "Usage Rights": ["Usage rights review", "Client permission and display terms"],
      Terms: ["Terms update", "Scope, timeline, and delivery terms"],
    },
    payments: {
      "Record Deposit": ["Client deposit", "Enter client / amount"],
      Refund: ["Refund review", "Log reason and Owner approval if above 5%"],
      Cancel: ["Cancellation review", "Log reason, status, and next step"],
      "View History": ["Payment history note", "Log reviewed payment record"],
    },
    communication: {
      Reply: ["Client reply", "Summarize the response sent"],
      "Log Note": ["Support note", "Private communication note"],
      "Revision Request": ["Revision request", "Requested change and next step"],
      "Thread History": ["Thread review", "Conversation summary"],
    },
    measurements: {
      "View Record": ["Measurement review", "Assigned client fitting record"],
      "Log Fitting": ["Fitting note", "Fitting feedback and next adjustment"],
      "Edit Measurement": ["Measurement update", "Measurement changed and reason"],
      "Revision Note": ["Revision note", "Body data or fitting revision"],
    },
    materials: {
      "Log Fabric": ["Fabric log", "Fabric name, yardage, and commission"],
      "Track Supplier": ["Supplier note", "Supplier, delivery status, and contact"],
      "Cost Materials": ["Material cost note", "Owner-only costing summary"],
      Inventory: ["Inventory update", "Stock movement or usage"],
    },
    content: {
      Pages: ["Page draft", "Page name and requested change"],
      "Media Library": ["Media upload note", "Asset name and placement"],
      "Process Photos": ["Process photo set", "Commission and image notes"],
      Blog: ["Atelier note", "Draft topic and publishing status"],
    },
    marketing: {
      "Promo Code": ["Promotion draft", "Code, date range, and approval note"],
      "Featured Commission": ["Featured commission", "Commission to feature and reason"],
      "Draft Campaign": ["Campaign draft", "Audience, channel, and timing"],
      Publish: ["Publish request", "Owner approval and publish note"],
    },
    newsletter: {
      "Send Update": ["Korede James atelier note", "Atelier Update"],
      "Create Segment": ["Audience segment", "Segment rule and campaign use"],
      "Source Review": ["Source review", "Review subscriber source quality"],
    },
    settings: {
      "Payment Gateway": ["Payment setting", "Gateway setting note"],
      "Tax Config": ["Tax setting", "Tax rule note"],
      Integrations: ["Integration note", "Integration name and status"],
      "API Keys": ["API key review", "Owner-only credential note"],
    },
    audit: {
      "Status Updates": ["Status update review", "Audit trail reviewed"],
      Refunds: ["Refund audit", "Refund action reviewed"],
      "Content Edits": ["Content edit audit", "Content changes reviewed"],
      "Measurement Edits": ["Measurement edit audit", "Measurement changes reviewed"],
    },
  };
  const [title, subtitle] = actionDefaults[view]?.[action] || [
    action,
    summary.title,
  ];

  return {
    mode: "action",
    action,
    title,
    subtitle,
    meta: roleProfiles[role].label,
    notes: "",
  };
}

function getModuleRows(view, workspace) {
  if (view === "contracts") {
    return workspace.contracts;
  }

  if (view === "payments") {
    return workspace.orders.map((order) => ({
      id: order.id,
      title: order.id,
      subtitle: `${order.customer} / ${order.total}`,
      meta: `${order.status} / Support refund cap 5%`,
      notes: order.notes || "",
    }));
  }

  if (view === "communication") {
    return workspace.customers.map((customer) => ({
      id: customer.email,
      title: customer.name,
      subtitle: customer.note,
      meta: `${customer.orders} projects`,
      notes: customer.notes || customer.note,
    }));
  }

  if (view === "measurements") {
    return workspace.measurements;
  }

  if (view === "materials") {
    return workspace.materials;
  }

  if (view === "content") {
    return workspace.content.map((entry) => ({
      id: entry.id || entry.title,
      title: entry.title,
      subtitle: entry.type,
      meta: entry.status,
      notes: entry.notes || "",
    }));
  }

  if (view === "marketing") {
    return workspace.promotions.map((promotion) => ({
      id: promotion.id || promotion.title,
      title: promotion.title,
      subtitle: promotion.ownerApproval,
      meta: promotion.status,
      notes: promotion.notes || "",
    }));
  }

  if (view === "newsletter") {
    const updateRows = (workspace.newsletterUpdates || []).map((update) => ({
      id: update.id,
      kind: "update",
      title: update.title,
      subtitle: update.subtitle || "Sent newsletter update",
      meta: update.meta || "Sent",
      notes: update.notes || "",
      timestamp: update.sentAt,
    }));
    const segmentRows = (workspace.newsletterSegments || []).map((segment) => ({
      id: segment.id,
      kind: "segment",
      title: segment.title,
      subtitle: segment.subtitle || "Audience segment",
      meta: segment.meta || "Draft",
      notes: segment.notes || "",
    }));
    const subscriberRows = workspace.newsletter.map((subscriber) => ({
      id: subscriber.id || subscriber.email,
      kind: "subscriber",
      title: subscriber.email,
      subtitle: subscriber.source || "homepage",
      meta: subscriber.status || "active",
      notes: subscriber.subscribed_at
        ? `Subscribed ${formatAdminDate(subscriber.subscribed_at)}`
        : "",
    }));

    return [...updateRows, ...segmentRows, ...subscriberRows];
  }

  if (view === "analytics") {
    const openRequests = workspace.requests.filter(
      (request) => !["Completed / delivered", "Archived"].includes(request.status)
    ).length;
    const completedRequests = workspace.requests.filter(
      (request) => request.status === "Completed / delivered"
    ).length;
    const conversionRate = workspace.requests.length
      ? `${Math.round((completedRequests / workspace.requests.length) * 100)}%`
      : "0%";
    return [
      { title: "Inquiries", subtitle: "Commission request volume", meta: workspace.requests.length },
      { title: "Open Requests", subtitle: "Awaiting atelier action", meta: openRequests },
      { title: "Conversion", subtitle: "Completed request rate", meta: conversionRate },
      { title: "Repeat Clients", subtitle: "Returning private clients", meta: workspace.customers.filter((customer) => customer.orders > 1).length },
    ];
  }

  if (view === "settings") {
    return workspace.settings;
  }

  return workspace.audit.map((entry) => ({
    id: entry.id || `${entry.actor}-${entry.time}`,
    title: entry.title || entry.actor,
    subtitle: entry.subtitle || entry.action,
    meta: entry.meta || entry.time,
    notes: entry.notes || "",
  }));
}

function downloadRowsAsCsv(filename, rows) {
  if (typeof window === "undefined") {
    return;
  }

  const header = ["Title", "Details", "Status", "Notes"];
  const csv = [header, ...rows.map((row) => [row.title, row.subtitle, row.meta, row.notes])]
    .map((line) => line.map(escapeCsvValue).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function escapeCsvValue(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

function normalizeNewsletterStatus(status) {
  const normalized = String(status || "active").trim().toLowerCase();
  return ["active", "paused", "unsubscribed"].includes(normalized)
    ? normalized
    : "active";
}

function formatAdminDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseColorList(value) {
  if (Array.isArray(value)) {
    return value.map((color) => String(color).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean);
}

function formatColorList(value) {
  return parseColorList(value).join(", ");
}

function getPieceColors(piece) {
  const colors = parseColorList(piece?.colors);
  const colorImageNames = Object.keys(piece?.colorImages || {});
  const merged = [...new Set([...colors, ...colorImageNames])].filter(Boolean);
  return merged.length ? merged : ["White"];
}

function normalizeColorImages(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function applyModulePayload(workspace, view, payload) {
  if (payload.mode === "delete") {
    return deleteModuleRecord(workspace, view, payload);
  }

  if (payload.mode === "action") {
    return appendModuleAction(workspace, view, payload);
  }

  return updateModuleRecord(workspace, view, payload);
}

function appendModuleAction(workspace, view, payload) {
  const baseRecord = {
    id: createId(view),
    title: payload.title,
    subtitle: payload.subtitle || payload.action,
    meta: payload.meta || "Draft",
    notes: payload.notes,
  };

  if (view === "payments") {
    const orderStatusByAction = {
      "View History": "History reviewed",
      "Record Deposit": "Deposit recorded",
      Refund: "Refund review",
      Cancel: "Cancellation review",
    };
    return {
      ...workspace,
      orders: [
        {
          id: `KJ-${Date.now().toString().slice(-4)}`,
          customer: payload.title,
          total: payload.subtitle || "$0",
          status: orderStatusByAction[payload.action] || payload.action,
          refundLimit: "5%",
          notes: payload.notes,
        },
        ...workspace.orders,
      ],
    };
  }

  if (view === "communication") {
    return {
      ...workspace,
      customers: [
        {
          name: payload.title,
          email: createInternalEmail(payload.title),
          orders: 0,
          note: payload.subtitle || payload.action,
          notes: payload.notes,
        },
        ...workspace.customers,
      ],
    };
  }

  if (view === "content") {
    return {
      ...workspace,
      content: [
        {
          id: baseRecord.id,
          title: payload.title,
          type: payload.action,
          status: payload.meta || "Draft",
          notes: payload.notes,
        },
        ...workspace.content,
      ],
    };
  }

  if (view === "marketing") {
    return {
      ...workspace,
      promotions: [
        {
          id: baseRecord.id,
          title: payload.title,
          ownerApproval: payload.subtitle || "Required",
          status: payload.meta || "Draft",
          notes: payload.notes,
        },
        ...workspace.promotions,
      ],
    };
  }

  if (view === "newsletter") {
    return {
      ...workspace,
      newsletterSegments: [
        {
          id: baseRecord.id,
          title: payload.title,
          subtitle: payload.subtitle || "Audience segment",
          meta: payload.meta || "Draft",
          notes: payload.notes,
          kind: "segment",
        },
        ...(workspace.newsletterSegments || []),
      ],
    };
  }

  const collection = moduleCollectionKey(view);
  if (!collection) {
    return {
      ...workspace,
      audit: [
        {
          id: baseRecord.id,
          actor: payload.meta || "Admin",
          action: `${payload.action || payload.title}: ${payload.notes || payload.subtitle}`,
          time: "Just now",
        },
        ...workspace.audit,
      ],
    };
  }

  return {
    ...workspace,
    [collection]: [baseRecord, ...workspace[collection]],
  };
}

function updateModuleRecord(workspace, view, payload) {
  if (view === "payments") {
    return {
      ...workspace,
      orders: workspace.orders.map((order) =>
        order.id === payload.id
          ? {
              ...order,
              customer: payload.subtitle.split("/")[0]?.trim() || order.customer,
              total: payload.subtitle.split("/")[1]?.trim() || order.total,
              status: payload.meta.split("/")[0]?.trim() || order.status,
              notes: payload.notes,
            }
          : order
      ),
    };
  }

  if (view === "communication") {
    return {
      ...workspace,
      customers: workspace.customers.map((customer) =>
        customer.email === payload.id
          ? {
              ...customer,
              name: payload.title,
              note: payload.subtitle,
              notes: payload.notes,
            }
          : customer
      ),
    };
  }

  if (view === "content") {
    return {
      ...workspace,
      content: workspace.content.map((entry) =>
        (entry.id || entry.title) === payload.id
          ? {
              ...entry,
              title: payload.title,
              type: payload.subtitle,
              status: payload.meta,
              notes: payload.notes,
            }
          : entry
      ),
    };
  }

  if (view === "marketing") {
    return {
      ...workspace,
      promotions: workspace.promotions.map((promotion) =>
        (promotion.id || promotion.title) === payload.id
          ? {
              ...promotion,
              title: payload.title,
              ownerApproval: payload.subtitle,
              status: payload.meta,
              notes: payload.notes,
            }
          : promotion
      ),
    };
  }

  if (view === "newsletter") {
    if (payload.kind === "update") {
      return {
        ...workspace,
        newsletterUpdates: (workspace.newsletterUpdates || []).map((update) =>
          update.id === payload.id
            ? {
                ...update,
                title: payload.title,
                subtitle: payload.subtitle,
                meta: payload.meta,
                notes: payload.notes,
                kind: "update",
              }
            : update
        ),
      };
    }

    return {
      ...workspace,
      newsletterSegments: (workspace.newsletterSegments || []).map((segment) =>
        segment.id === payload.id
          ? {
              ...segment,
              title: payload.title,
              subtitle: payload.subtitle,
              meta: payload.meta,
              notes: payload.notes,
              kind: "segment",
            }
          : segment
      ),
    };
  }

  const collection = moduleCollectionKey(view);
  if (!collection) {
    return workspace;
  }

  return {
    ...workspace,
    [collection]: workspace[collection].map((record) =>
      record.id === payload.id
        ? {
            ...record,
            title: payload.title,
            subtitle: payload.subtitle,
            meta: payload.meta,
            notes: payload.notes,
          }
        : record
    ),
  };
}

function deleteModuleRecord(workspace, view, payload) {
  if (view === "payments") {
    return {
      ...workspace,
      orders: workspace.orders.filter((order) => order.id !== payload.id),
    };
  }

  if (view === "communication") {
    return {
      ...workspace,
      customers: workspace.customers.filter((customer) => customer.email !== payload.id),
    };
  }

  if (view === "content") {
    return {
      ...workspace,
      content: workspace.content.filter((entry) => (entry.id || entry.title) !== payload.id),
    };
  }

  if (view === "marketing") {
    return {
      ...workspace,
      promotions: workspace.promotions.filter(
        (promotion) => (promotion.id || promotion.title) !== payload.id
      ),
    };
  }

  if (view === "newsletter") {
    if (payload.kind === "update") {
      return {
        ...workspace,
        newsletterUpdates: (workspace.newsletterUpdates || []).filter(
          (update) => update.id !== payload.id
        ),
      };
    }

    return {
      ...workspace,
      newsletterSegments: (workspace.newsletterSegments || []).filter(
        (segment) => segment.id !== payload.id
      ),
    };
  }

  const collection = moduleCollectionKey(view);
  if (!collection) {
    return workspace;
  }

  return {
    ...workspace,
    [collection]: workspace[collection].filter((record) => record.id !== payload.id),
  };
}

function moduleCollectionKey(view) {
  const keys = {
    contracts: "contracts",
    measurements: "measurements",
    materials: "materials",
    settings: "settings",
    audit: "audit",
  };
  return keys[view];
}

function createInternalEmail(value) {
  const slug = String(value || "client")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return `${slug || "client"}-${Date.now().toString().slice(-4)}@admin.local`;
}

function hasModuleAccess(module, role) {
  return module[role] && module[role] !== "No access";
}

function getRequestStatusOptions(role, selectedStatus) {
  return withCurrentOption(requestStatusByRole[role] || [], selectedStatus);
}

function getRequestStageOptions(role, selectedStage) {
  return withCurrentOption(commissionStagesByRole[role] || [], selectedStage);
}

function withCurrentOption(options, currentValue) {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
}

function statusClassName(status) {
  return `admin-status admin-status--${status
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function availabilityClassName(availability) {
  return `admin-availability admin-availability--${availability
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}
