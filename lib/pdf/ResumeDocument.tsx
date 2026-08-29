import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { EducationEntry, WorkExperienceEntry } from "@/lib/profile";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  name: { fontSize: 20, fontWeight: "bold" },
  contactText: { fontSize: 9, color: "#444444", marginTop: 4, lineHeight: 1.4 },
  section: { marginTop: 14 },
  heading: { fontSize: 11, fontWeight: "bold", marginBottom: 6 },
  paragraph: { fontSize: 10, lineHeight: 1.4 },
  roleBlock: { marginBottom: 8 },
  roleHeaderRow: { flexDirection: "row", justifyContent: "space-between" },
  roleTitle: { fontSize: 10.5, fontWeight: "bold" },
  roleCompany: { fontSize: 10, color: "#444444" },
  roleDates: { fontSize: 9, color: "#444444" },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 10, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },
  skillsText: { fontSize: 10, lineHeight: 1.5 },
});

function formatDateRange(role: WorkExperienceEntry) {
  const end = role.currentlyWorking ? "Present" : role.endDate;
  return [role.startDate, end].filter(Boolean).join(" — ");
}

type GeneratedRole = WorkExperienceEntry & { bullets: string[] };

type Props = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  summary: string;
  workExperience: GeneratedRole[];
  education: EducationEntry;
  skills: string[];
};

export function ResumeDocument({
  fullName,
  email,
  phone,
  location,
  linkedinUrl,
  portfolioUrl,
  summary,
  workExperience,
  education,
  skills,
}: Props) {
  const contactParts = [email, phone, location, linkedinUrl, portfolioUrl].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{fullName}</Text>
          {/*
            One Text with explicit separators, not a flex row of Texts: a row
            does not wrap, so two long URLs overflowed the page width and their
            margins collapsed, running the LinkedIn and portfolio links together.
          */}
          <Text style={styles.contactText}>{contactParts.join("  ·  ")}</Text>
        </View>

        {summary ? (
          <View style={styles.section}>
            <Text style={styles.heading}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.paragraph}>{summary}</Text>
          </View>
        ) : null}

        {workExperience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.heading}>WORK EXPERIENCE</Text>
            {workExperience.map((role, index) => (
              <View key={index} style={styles.roleBlock}>
                <View style={styles.roleHeaderRow}>
                  <Text style={styles.roleTitle}>
                    {role.title}
                    {role.company ? ` — ${role.company}` : ""}
                  </Text>
                  <Text style={styles.roleDates}>{formatDateRange(role)}</Text>
                </View>
                {role.bullets.map((bullet, bulletIndex) => (
                  <View key={bulletIndex} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {education.institution || education.fieldOfStudy ? (
          <View style={styles.section}>
            <Text style={styles.heading}>EDUCATION</Text>
            <View style={styles.roleHeaderRow}>
              <Text style={styles.roleCompany}>
                {education.degree ? `${education.degree} — ` : ""}
                {education.fieldOfStudy}
                {education.institution ? `, ${education.institution}` : ""}
              </Text>
              <Text style={styles.roleDates}>{education.graduationYear}</Text>
            </View>
          </View>
        ) : null}

        {skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.heading}>SKILLS</Text>
            <Text style={styles.skillsText}>{skills.join(" · ")}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
