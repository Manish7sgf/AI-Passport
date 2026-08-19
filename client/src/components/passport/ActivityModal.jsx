import React, { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import { TrophyIcon, GitPullRequestIcon, UsersIcon, ImageIcon, CheckIcon } from "../ui/Icons";

const ACTIVITY_TYPES = [
  { id: "hackathon", label: "Hackathon", icon: TrophyIcon, desc: "Competitions, hackathons, and project showcases" },
  { id: "open_source_pr", label: "Open Source PR", icon: GitPullRequestIcon, desc: "Merged or submitted pull requests to open source repos" },
  { id: "mentoring", label: "Mentoring & Leadership", icon: UsersIcon, desc: "Workshops, student mentoring, or community leadership" }
];

const GITHUB_PR_REGEX = /^https:\/\/github\.com\/([\w\-]+)\/([\w.\-]+)\/pull\/(\d+)\/?$/;

export default function ActivityModal({ isOpen, onClose, onAdd, defaultType = "hackathon" }) {
  const [activeType, setActiveType] = useState(defaultType);
  const [title, setTitle] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [roleOrAward, setRoleOrAward] = useState("");
  const [organization, setOrganization] = useState("");
  const [yearOrDate, setYearOrDate] = useState("");
  const [description, setDescription] = useState("");
  const [certificateImage, setCertificateImage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Certificate image must be under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCertificateImage(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a name / title for this activity");
      return;
    }

    if (activeType === "open_source_pr") {
      if (!proofUrl.trim()) {
        setError("Please enter the GitHub Pull Request URL");
        return;
      }
      if (!GITHUB_PR_REGEX.test(proofUrl.trim())) {
        setError("Must be a valid GitHub PR URL (e.g. https://github.com/owner/repo/pull/123)");
        return;
      }
    }

    setError("");
    setIsLoading(true);

    try {
      await onAdd({
        activity_type: activeType,
        title: title.trim(),
        proof_url: proofUrl.trim() || certificateImage || "",
        role_or_award: roleOrAward.trim(),
        organization: organization.trim(),
        year_or_date: yearOrDate.trim(),
        description: description.trim(),
        certificate_image: certificateImage || ""
      });

      // Reset form on success
      setTitle("");
      setProofUrl("");
      setCertificateImage("");
      setRoleOrAward("");
      setOrganization("");
      setYearOrDate("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add activity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          background: "var(--bg)",
          borderRadius: "var(--radius)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
          border: "0.5px solid var(--border)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font)", fontSize: "16px", fontWeight: "600" }}>
              Add Verified Activity
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
              Submit proof-backed credentials to elevate your Employability Score.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-tertiary)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "20px" }}>
          {ACTIVITY_TYPES.map((t) => {
            const isSelected = activeType === t.id;
            const IconComp = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setActiveType(t.id); setError(""); }}
                style={{
                  padding: "10px 8px",
                  borderRadius: "var(--radius)",
                  border: `0.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  background: isSelected ? "var(--bg-secondary)" : "transparent",
                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease"
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <IconComp size={18} color={isSelected ? "var(--accent)" : "var(--text-secondary)"} />
                </span>
                <span style={{ fontFamily: "var(--font)", fontSize: "11px", fontWeight: isSelected ? "600" : "400" }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              {activeType === "hackathon" ? "Hackathon / Competition Name *" : activeType === "open_source_pr" ? "Pull Request Title *" : "Session / Organization Name *"}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeType === "hackathon" ? "e.g. Smart India Hackathon / ETHIndia" : activeType === "open_source_pr" ? "e.g. Fix React 19 Hydration Warning" : "e.g. Google Developer Student Club Web Workshop"}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              {activeType === "open_source_pr" ? "GitHub PR Link *" : "Proof / Certificate / Submission URL"}
            </label>
            <Input
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder={activeType === "open_source_pr" ? "https://github.com/owner/repo/pull/123" : "https://devpost.com/software/... or Certificate Link"}
              required={activeType === "open_source_pr"}
            />
          </div>

          {activeType === "hackathon" && (
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                Attach Certificate Photo / Image (Optional)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label
                  style={{
                    padding: "6px 12px",
                    background: "var(--bg-secondary)",
                    border: "0.5px dashed var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <ImageIcon size={14} color="var(--text-secondary)" />
                  <span>Choose Certificate Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
                {certificateImage && (
                  <span style={{ fontSize: "11px", color: "var(--green)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <CheckIcon size={12} color="var(--green)" /> Image attached
                  </span>
                )}
              </div>
              {certificateImage && (
                <div style={{ marginTop: "8px", position: "relative", width: "fit-content" }}>
                  <img
                    src={certificateImage}
                    alt="Certificate Preview"
                    style={{
                      maxHeight: "90px",
                      borderRadius: "var(--radius)",
                      border: "0.5px solid var(--border)",
                      objectFit: "cover"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setCertificateImage("")}
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "var(--red)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      fontSize: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                {activeType === "hackathon" ? "Role / Award" : activeType === "open_source_pr" ? "Repository" : "Your Role"}
              </label>
              <Input
                value={roleOrAward}
                onChange={(e) => setRoleOrAward(e.target.value)}
                placeholder={activeType === "hackathon" ? "e.g. Winner / 1st Runner Up" : activeType === "open_source_pr" ? "e.g. facebook/react" : "e.g. Lead Mentor"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                Date / Year
              </label>
              <Input
                value={yearOrDate}
                onChange={(e) => setYearOrDate(e.target.value)}
                placeholder="e.g. 2026 or Aug 2026"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              Brief Description / Key Contribution
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe your project or contribution..."
              rows={2}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "var(--surface)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text-primary)",
                resize: "none",
                outline: "none"
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "2px" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={onClose} fullWidth type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading} fullWidth>
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Spinner size={14} color="var(--accent-text)" />
                  Verifying...
                </span>
              ) : (
                "Save & Recalculate Score →"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
