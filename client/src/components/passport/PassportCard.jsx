import React, { useState, useEffect } from "react";
import BadgeGrid from "./BadgeGrid";
import Button from "../ui/Button";

export default function PassportCard({ passport, onUpdate, forceEdit = false, onEditDone }) {
  const [editing, setEditing] = useState(forceEdit);
  const [bio, setBio] = useState(passport?.bio || "");
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [skills, setSkills] = useState(passport?.skills || []);
  const [interests, setInterests] = useState(passport?.interests || []);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when parent forces edit or when async passport data loads
  useEffect(() => {
    if (forceEdit) setEditing(true);
  }, [forceEdit]);

  useEffect(() => {
    if (!editing) {
      setBio(passport?.bio || "");
      setSkills(Array.isArray(passport?.skills) ? passport.skills : []);
      setInterests(Array.isArray(passport?.interests) ? passport.interests : []);
    }
  }, [passport, editing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({ bio: bio.trim(), skills, interests });
      setEditing(false);
      if (onEditDone) onEditDone();
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const s = skillInput.trim();
      if (!skills.includes(s)) setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const addInterest = (e) => {
    if (e.key === "Enter" && interestInput.trim()) {
      e.preventDefault();
      const i = interestInput.trim();
      if (!interests.includes(i)) setInterests([...interests, i]);
      setInterestInput("");
    }
  };

  const removeInterest = (i) => setInterests(interests.filter((x) => x !== i));

  const hasData = !!passport?.bio || (passport?.skills?.length || 0) > 0 || (passport?.interests?.length || 0) > 0;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <span className="section-label">Your Passport Profile</span>
        {!editing ? (
          <Button variant="secondary" size="small" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="ghost" size="small" onClick={() => setEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="small" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Bio */}
          <div>
            <label className="section-label" style={{ display: "block", marginBottom: "6px" }}>
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell employers and collaborators what you're working on and passionate about..."
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--surface)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--text-primary)",
                resize: "vertical",
                outline: "none",
                lineHeight: "1.5"
              }}
            />
          </div>

          {/* Skills */}
          <div>
            <label className="section-label" style={{ display: "block", marginBottom: "6px" }}>
              Skills (type and press Enter)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {skills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    background: "var(--bg-secondary)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "var(--text-primary)"
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    aria-label={`Remove ${s}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-tertiary)",
                      lineHeight: 1,
                      padding: 0,
                      fontSize: "14px"
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="e.g. React, Python, PostgreSQL, Docker"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "var(--surface)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none"
              }}
            />
          </div>

          {/* Interests */}
          <div>
            <label className="section-label" style={{ display: "block", marginBottom: "6px" }}>
              Interests & Domains (type and press Enter)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {interests.map((i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    background: "var(--bg)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "var(--text-secondary)"
                  }}
                >
                  {i}
                  <button
                    type="button"
                    onClick={() => removeInterest(i)}
                    aria-label={`Remove ${i}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-tertiary)",
                      lineHeight: 1,
                      padding: 0,
                      fontSize: "14px"
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={addInterest}
              placeholder="e.g. AI Agents, Full-Stack, Open Source, Distributed Systems"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "var(--surface)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none"
              }}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {passport?.bio ? (
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              {passport.bio}
            </p>
          ) : !hasData ? (
            <div style={{ padding: "16px 0", color: "var(--text-tertiary)", fontSize: "13px" }}>
              No bio or skills added yet. Click &ldquo;Edit Profile&rdquo; to complete your passport.
            </div>
          ) : null}
          <BadgeGrid skills={passport?.skills || []} interests={passport?.interests || []} />
        </div>
      )}
    </div>
  );
}
