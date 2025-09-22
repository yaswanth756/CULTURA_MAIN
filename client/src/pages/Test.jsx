import React from "react";

/* Pencil icon (no external lib) */
const PencilIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      d="M16.5 3.964a2.25 2.25 0 013.182 3.182l-9.72 9.72L6 17.25l.384-3.962 9.72-9.324z" />
    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536" />
  </svg>
);

/* Provided data (can be replaced with props/state) */
const profile = {
  email: "vyaswanthraju18@gmail.com",
  phone: "+91-7569978084",
  role: "customer",
  firstName: "yaswanth raju",
  avatar: "", // if empty use initials
  status: "active",
  lastLogin: "2025-09-22T03:48:07.972Z",
  createdAt: "2025-09-17T16:11:27.208Z",
  location: { city: "Not specified", address: "Near Amul shop" }
};

/* Helpers */
const toTitle = (s = "") =>
  s.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const initials = (s = "") => {
  const parts = s.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U";
};
const fmtDate = (iso) =>
  iso ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—";

const Card = ({ title, children, onEdit }) => (
  <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    {title ? (
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          <PencilIcon />
          Edit
        </button>
      </div>
    ) : null}
    {children}
  </section>
);

const Field = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-1 text-slate-900">{value || "—"}</dd>
  </div>
);

const Test = () => {
  const displayName = toTitle(profile.firstName || "Unknown");
  const roleStatus = `${toTitle(profile.role)} • ${toTitle(profile.status)}`;
  const locLine =
    [profile?.location?.city, profile?.location?.address].filter(Boolean).join(" • ") || "Not specified";

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>

        {/* Header */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar or initials */}
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-medium text-slate-600">{initials(profile.firstName)}</span>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-xl font-semibold text-slate-900">{displayName}</p>
                <p className="text-sm text-slate-500">{roleStatus}</p>
                <p className="text-sm text-slate-500">{locLine}</p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <PencilIcon />
              Edit
            </button>
          </div>
        </section>

        {/* Personal information */}
        <Card title="Personal information" onEdit={() => {}}>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <Field label="Name" value={displayName} />
            <Field label="Role" value={toTitle(profile.role)} />
            <Field label="Email" value={profile.email} />
            <Field label="Phone" value={profile.phone} />
            <Field label="Status" value={toTitle(profile.status)} />
            <Field label="Last Login" value={fmtDate(profile.lastLogin)} />
            <Field label="Member Since" value={fmtDate(profile.createdAt)} />
          </dl>
        </Card>

        {/* Address */}
        <Card title="Address" onEdit={() => {}}>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <Field label="City" value={profile?.location?.city} />
            <Field label="Address" value={profile?.location?.address} />
          </dl>
        </Card>
      </div>
    </div>
  );
};

export default Test;
