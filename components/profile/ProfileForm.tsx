"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import type { ProfileFormValues, ScalarProfileField, WorkExperienceEntry } from "@/lib/profile";
import { SuggestionBubble } from "@/components/profile/SuggestionBubble";

type Props = {
  email: string;
  values: ProfileFormValues;
  onChange: (patch: Partial<ProfileFormValues>) => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
  suggestions: Partial<Record<ScalarProfileField, string>>;
  onAcceptSuggestion: (field: ScalarProfileField) => void;
  onDismissSuggestion: (field: ScalarProfileField) => void;
};

const MAX_ROLES = 3;

const WORK_AUTHORIZATION_LABELS: Record<string, string> = {
  citizen: "Citizen",
  permanent_resident: "Permanent Resident",
  visa_required: "Visa Required",
};

const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead",
};

const REMOTE_PREFERENCE_LABELS: Record<string, string> = {
  remote: "Remote",
  onsite: "Onsite",
  hybrid: "Hybrid",
  any: "Any",
};

const inputClasses =
  "w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:bg-surface-secondary disabled:text-text-muted disabled:cursor-not-allowed";

function Field({
  label,
  full,
  children,
  suggestion,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
  suggestion?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </label>
      {children}
      {suggestion}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputClasses}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-surface border border-border rounded-md px-3 py-2 pr-9 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
    </div>
  );
}

function TagInput({
  label,
  placeholder,
  tags,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
}) {
  return (
    <Field label={label} full>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          className={`flex-1 ${inputClasses}`}
        />
        <button
          type="button"
          onClick={onAdd}
          className="bg-surface border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer shrink-0"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 bg-surface-secondary border border-border rounded-full pl-3 pr-2 py-1 text-sm font-medium text-text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="text-text-muted hover:text-error cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}

export function ProfileForm({
  email,
  values,
  onChange,
  onSave,
  isSaving,
  error,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
}: Props) {
  const {
    fullName,
    phone,
    location,
    linkedinUrl,
    portfolioUrl,
    workAuthorization,
    currentTitle,
    experienceLevel,
    yearsExperience,
    skills,
    industries,
    workExperience,
    education,
    jobTitlesSeeking,
    remotePreference,
    salaryExpectation,
    preferredLocations,
  } = values;

  const [skillInput, setSkillInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");

  const renderSuggestion = (field: ScalarProfileField, labelMap?: Record<string, string>) => {
    const value = suggestions[field];
    if (!value) return null;
    return (
      <SuggestionBubble
        value={labelMap?.[value] ?? value}
        onApply={() => onAcceptSuggestion(field)}
        onDismiss={() => onDismissSuggestion(field)}
      />
    );
  };

  const addTag = (value: string, tags: string[], key: "skills" | "industries", resetInput: () => void) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange({ [key]: [...tags, trimmed] } as Partial<ProfileFormValues>);
    }
    resetInput();
  };

  const addRole = () => {
    if (workExperience.length >= MAX_ROLES) return;
    onChange({
      workExperience: [
        ...workExperience,
        {
          company: "",
          title: "",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
          responsibilities: "",
        },
      ],
    });
  };

  const removeRole = (index: number) => {
    onChange({ workExperience: workExperience.filter((_, i) => i !== index) });
  };

  const updateRole = (index: number, patch: Partial<WorkExperienceEntry>) => {
    onChange({
      workExperience: workExperience.map((role, i) => (i === index ? { ...role, ...patch } : role)),
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">Profile Information</h2>
      <p className="text-sm text-text-secondary mt-1">
        This context is used to accurately represent you in agent interactions.
      </p>

      {/* Personal Info */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Personal Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Full Name" suggestion={renderSuggestion("fullName")}>
            <TextInput value={fullName} onChange={(v) => onChange({ fullName: v })} />
          </Field>
          <Field label="Email">
            <TextInput value={email} onChange={() => {}} disabled />
          </Field>
          <Field label="Phone Number" suggestion={renderSuggestion("phone")}>
            <TextInput value={phone} onChange={(v) => onChange({ phone: v })} placeholder="+1 (555) 000-0000" />
          </Field>
          <Field label="Location" suggestion={renderSuggestion("location")}>
            <TextInput value={location} onChange={(v) => onChange({ location: v })} placeholder="City, Country" />
          </Field>
          <Field label="LinkedIn URL" suggestion={renderSuggestion("linkedinUrl")}>
            <TextInput value={linkedinUrl} onChange={(v) => onChange({ linkedinUrl: v })} />
          </Field>
          <Field label="Portfolio / GitHub" suggestion={renderSuggestion("portfolioUrl")}>
            <TextInput value={portfolioUrl} onChange={(v) => onChange({ portfolioUrl: v })} />
          </Field>
          <Field
            label="Work Authorization"
            suggestion={renderSuggestion("workAuthorization", WORK_AUTHORIZATION_LABELS)}
          >
            <SelectInput
              value={workAuthorization}
              onChange={(v) => onChange({ workAuthorization: v })}
              options={[
                { value: "citizen", label: "Citizen" },
                { value: "permanent_resident", label: "Permanent Resident" },
                { value: "visa_required", label: "Visa Required" },
              ]}
            />
          </Field>
        </div>
      </div>

      {/* Professional Info */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Professional Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Current/Recent Job Title" full suggestion={renderSuggestion("currentTitle")}>
            <TextInput value={currentTitle} onChange={(v) => onChange({ currentTitle: v })} />
          </Field>
          <Field label="Experience Level" suggestion={renderSuggestion("experienceLevel", EXPERIENCE_LEVEL_LABELS)}>
            <SelectInput
              value={experienceLevel}
              onChange={(v) => onChange({ experienceLevel: v })}
              options={[
                { value: "junior", label: "Junior" },
                { value: "mid", label: "Mid-Level" },
                { value: "senior", label: "Senior" },
                { value: "lead", label: "Lead" },
              ]}
            />
          </Field>
          <Field label="Years of Experience" suggestion={renderSuggestion("yearsExperience")}>
            <input
              type="text"
              inputMode="numeric"
              value={yearsExperience}
              onChange={(e) => onChange({ yearsExperience: e.target.value })}
              className={inputClasses}
            />
          </Field>
          <TagInput
            label="Skills"
            placeholder="Add a skill"
            tags={skills}
            inputValue={skillInput}
            onInputChange={setSkillInput}
            onAdd={() => addTag(skillInput, skills, "skills", () => setSkillInput(""))}
            onRemove={(tag) => onChange({ skills: skills.filter((s) => s !== tag) })}
          />
          <TagInput
            label="Industries Worked In (optional)"
            placeholder="E.g. FinTech, Healthcare"
            tags={industries}
            inputValue={industryInput}
            onInputChange={setIndustryInput}
            onAdd={() => addTag(industryInput, industries, "industries", () => setIndustryInput(""))}
            onRemove={(tag) => onChange({ industries: industries.filter((i) => i !== tag) })}
          />
        </div>
      </div>

      {/* Work Experience */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Work Experience</h3>
          {workExperience.length < MAX_ROLES && (
            <button
              type="button"
              onClick={addRole}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:opacity-80 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add role
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {workExperience.map((role, index) => (
            <div key={index}>
              {index > 0 && (
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() => removeRole(index)}
                    className="flex items-center gap-1 text-xs font-medium text-error hover:opacity-80 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <Field label="Company Name">
                  <TextInput
                    value={role.company}
                    onChange={(v) => updateRole(index, { company: v })}
                    placeholder="E.g. Acme Inc."
                  />
                </Field>
                <Field label="Job Title">
                  <TextInput
                    value={role.title}
                    onChange={(v) => updateRole(index, { title: v })}
                    placeholder="E.g. Software Engineer"
                  />
                </Field>
                <Field label="Start Date">
                  <input
                    type="month"
                    value={role.startDate}
                    onChange={(e) => updateRole(index, { startDate: e.target.value })}
                    className={inputClasses}
                  />
                </Field>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      End Date
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={role.currentlyWorking}
                        onChange={(e) =>
                          updateRole(index, {
                            currentlyWorking: e.target.checked,
                            endDate: e.target.checked ? "" : role.endDate,
                          })
                        }
                        className="h-3.5 w-3.5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                      />
                      Currently working here
                    </label>
                  </div>
                  <input
                    type="month"
                    value={role.endDate}
                    disabled={role.currentlyWorking}
                    onChange={(e) => updateRole(index, { endDate: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <Field label="Key Responsibilities" full>
                  <textarea
                    value={role.responsibilities}
                    onChange={(e) => updateRole(index, { responsibilities: e.target.value })}
                    rows={3}
                    placeholder="Describe your key responsibilities and achievements..."
                    className={`${inputClasses} resize-none`}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Highest Degree">
            <SelectInput
              value={education.degree}
              onChange={(v) => onChange({ education: { ...education, degree: v } })}
              options={[
                { value: "high_school", label: "High School" },
                { value: "associate", label: "Associate's Degree" },
                { value: "bachelor", label: "Bachelor's Degree" },
                { value: "master", label: "Master's Degree" },
                { value: "phd", label: "PhD" },
                { value: "other", label: "Other" },
              ]}
            />
          </Field>
          <Field label="Field of Study">
            <TextInput value={education.fieldOfStudy} onChange={(v) => onChange({ education: { ...education, fieldOfStudy: v } })} />
          </Field>
          <Field label="Institution Name">
            <TextInput
              value={education.institution}
              onChange={(v) => onChange({ education: { ...education, institution: v } })}
              placeholder="E.g. State University"
            />
          </Field>
          <Field label="Graduation Year">
            <input
              type="text"
              inputMode="numeric"
              value={education.graduationYear}
              placeholder="YYYY"
              onChange={(e) => onChange({ education: { ...education, graduationYear: e.target.value } })}
              className={inputClasses}
            />
          </Field>
        </div>
      </div>

      {/* Job Preferences */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Job Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Job Titles Seeking" full suggestion={renderSuggestion("jobTitlesSeeking")}>
            <TextInput value={jobTitlesSeeking} onChange={(v) => onChange({ jobTitlesSeeking: v })} />
          </Field>
          <Field
            label="Remote Preference"
            suggestion={renderSuggestion("remotePreference", REMOTE_PREFERENCE_LABELS)}
          >
            <SelectInput
              value={remotePreference}
              onChange={(v) => onChange({ remotePreference: v })}
              options={[
                { value: "remote", label: "Remote" },
                { value: "onsite", label: "Onsite" },
                { value: "hybrid", label: "Hybrid" },
                { value: "any", label: "Any" },
              ]}
            />
          </Field>
          <Field label="Salary Expectation (optional)" suggestion={renderSuggestion("salaryExpectation")}>
            <TextInput
              value={salaryExpectation}
              onChange={(v) => onChange({ salaryExpectation: v })}
              placeholder="E.g. $120k+"
            />
          </Field>
          <Field
            label="Preferred Locations (optional)"
            full
            suggestion={renderSuggestion("preferredLocations")}
          >
            <TextInput
              value={preferredLocations}
              onChange={(v) => onChange({ preferredLocations: v })}
              placeholder="E.g. New York, London"
            />
          </Field>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        {error && <p className="text-sm text-error mb-4">{error}</p>}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full bg-accent text-accent-foreground py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
