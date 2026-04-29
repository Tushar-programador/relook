import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Rocket } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Textarea } from "../ui/textarea.jsx";
import { cn } from "../../lib/utils";

const PURPOSE_OPTIONS = [
  { value: "customer_feedback", label: "Customer feedback", icon: "💬" },
  { value: "product_review", label: "Product review", icon: "⭐" },
  { value: "employee_survey", label: "Employee survey", icon: "🏢" },
  { value: "event_feedback", label: "Event feedback", icon: "🎤" },
  { value: "other", label: "Other", icon: "📋" }
];

const PRODUCT_TYPE_OPTIONS = [
  { value: "saas", label: "SaaS / Web app", icon: "🖥️" },
  { value: "mobile_app", label: "Mobile app", icon: "📱" },
  { value: "ecommerce", label: "E-commerce", icon: "🛒" },
  { value: "agency", label: "Agency / Services", icon: "🏗️" },
  { value: "education", label: "Education", icon: "🎓" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
  { value: "other", label: "Other", icon: "📦" }
];

const STEPS = ["Purpose", "Organization", "Details", "Review"];

const EMPTY_FORM = {
  name: "",
  slug: "",
  organization: "",
  purpose: "",
  productType: "",
  website: "",
  description: ""
};

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function StepIndicator({ current }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                i < current
                  ? "bg-primary text-white"
                  : i === current
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium",
                i === current ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "mx-2 mb-5 h-px w-10 transition-all",
                i < current ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function OptionGrid({ options, selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-sm font-medium transition-all hover:border-primary/50 hover:bg-primary/5",
            selected === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-foreground"
          )}
        >
          <span className="text-2xl">{opt.icon}</span>
          <span className="text-center leading-tight">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

export function CreateProjectModal({ onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(value) {
    set("name", value);
    if (!slugEdited) {
      set("slug", toSlug(value));
    }
  }

  function canAdvance() {
    if (step === 0) return !!form.purpose;
    if (step === 1) return form.name.trim().length >= 2;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await onCreated(form);
      onClose();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative my-3 flex w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-background shadow-2xl sm:my-0 sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Create feedback portal</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <StepIndicator current={step} />

          {/* Step 0 – Purpose */}
          {step === 0 && (
            <div className="space-y-3">
              <p className="mb-4 text-sm text-muted-foreground">
                What is the primary goal for collecting feedback?
              </p>
              <OptionGrid
                options={PURPOSE_OPTIONS}
                selected={form.purpose}
                onSelect={(v) => set("purpose", v)}
              />
            </div>
          )}

          {/* Step 1 – Organization */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <FieldLabel required>Project / Brand name</FieldLabel>
                <Input
                  placeholder="e.g. Acme Feedback"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <FieldLabel>Organization or company</FieldLabel>
                <Input
                  placeholder="e.g. Acme Inc."
                  value={form.organization}
                  onChange={(e) => set("organization", e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Custom URL slug</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">feedspace.app/f/</span>
                  <Input
                    className="flex-1"
                    placeholder="my-brand"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      set("slug", e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – Product details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <FieldLabel>Type of product or service</FieldLabel>
                <OptionGrid
                  options={PRODUCT_TYPE_OPTIONS}
                  selected={form.productType}
                  onSelect={(v) => set("productType", v)}
                />
              </div>
              <div>
                <FieldLabel>Website URL</FieldLabel>
                <Input
                  type="url"
                  placeholder="https://yourproduct.com"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Short description</FieldLabel>
                <Textarea
                  placeholder="Tell reviewers what your product does in a sentence or two…"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  maxLength={500}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {form.description.length}/500
                </p>
              </div>
            </div>
          )}

          {/* Step 3 – Review */}
          {step === 3 && (
            <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-5 text-sm">
              <ReviewRow label="Brand name" value={form.name} />
              <ReviewRow label="Organization" value={form.organization || "—"} />
              <ReviewRow label="Slug" value={`feedspace.app/f/${form.slug || form.name}`} />
              <ReviewRow
                label="Purpose"
                value={PURPOSE_OPTIONS.find((o) => o.value === form.purpose)?.label || "—"}
              />
              <ReviewRow
                label="Product type"
                value={PRODUCT_TYPE_OPTIONS.find((o) => o.value === form.productType)?.label || "—"}
              />
              <ReviewRow label="Website" value={form.website || "—"} />
              {form.description && (
                <div className="border-t border-border pt-3">
                  <p className="mb-1 font-medium text-muted-foreground">Description</p>
                  <p className="text-foreground">{form.description}</p>
                </div>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background px-4 py-4 sm:px-6">
          <Button
            className="px-4 sm:px-5"
            variant="secondary"
            onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
            disabled={submitting}
          >
            {step === 0 ? (
              "Cancel"
            ) : (
              <span className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Back
              </span>
            )}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button className="px-4 sm:px-5" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
              <span className="flex items-center gap-1">
                Next <ChevronRight className="h-4 w-4" />
              </span>
            </Button>
          ) : (
            <Button className="px-4 sm:px-5" onClick={handleSubmit} disabled={submitting}>
              <span className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                {submitting ? "Launching…" : "Launch portal"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}
