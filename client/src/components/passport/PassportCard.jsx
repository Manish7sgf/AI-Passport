import React, { useState } from "react";
import BadgeGrid from "./BadgeGrid";
import Button from "../ui/Button";

export default function PassportCard({ passport, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(passport?.bio || "");
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [skills, setSkills] = useState(passport?.skills || []);
  const [interests, setInterests] = useState(passport?.interests || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({ bio, skills, interests });
      setEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      const s = skillInput.trim();
      if (!skills.includes(s)) setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const addInterest = (e) => {
    if (e.key === "Enter" && interestInput.trim()) {
      const i = interestInput.trim();
      if (!interests.includes(i)) setInterests([...interests, i]);
      setInterestInput("");
    }
  };

  const removeInterest = (i) => setInterests(interests.filter((x) => x !== i));

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <span className="section-label">Your Passport</span>
        {!editing ? (
          <Button variant="secondary" size="small" onClick={() => setEditing(true)}>
            Edit
          </Button>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="ghost" size="small" onClick={() => setEditing(false)}>
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
            <label className="section-label" style={{ display: "block", marginBottom: "6px" }}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A brief bio about yourself..."
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
                outline: "none"
              }}
            />
          </div>

          {/* Skills */}
          <div>
            <label className="section-label" style={{ display: "block", marginBottom: "6px" }}>
              Skills (press Enter to add)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {skills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 8px",
                    background: "var(--bg-secondary)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "var(--text-secondary)"
                  }}
                >
                  {s}
                  <button onClick={() => removeSkill(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="Type a skill and press Enter"
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
              Interests (press Enter to add)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {interests.map((i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 8px",
                    background: "var(--bg)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "var(--text-secondary)"
                  }}
                >
                  {i}
                  <button onClick={() => removeInterest(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
            <input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={addInterest}
              placeholder="Type an interest and press Enter"
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
          {passport?.bio && (
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              {passport.bio}
            </p>
          )}
          <BadgeGrid skills={passport?.skills || []} interests={passport?.interests || []} />
        </div>
      )}
    </div>
  );
}
