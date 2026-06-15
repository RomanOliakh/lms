import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

export type CertificateProps = {
  name: string;
  courseTitle: string;
  companyName: string;
  completedOn: string; // already formatted (e.g. 15 June 2026)
};

const styles = StyleSheet.create({
  page: {
    paddingVertical: 64,
    paddingHorizontal: 72,
    fontFamily: "Helvetica",
    color: "#1f2430",
  },
  border: {
    flexGrow: 1,
    borderWidth: 2,
    borderColor: "#4f46e5",
    borderRadius: 10,
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 3,
    color: "#4f46e5",
    fontFamily: "Helvetica-Bold",
    marginBottom: 24,
  },
  heading: { fontSize: 30, fontFamily: "Helvetica-Bold", marginBottom: 28 },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 8 },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    marginBottom: 28,
    textAlign: "center",
  },
  body: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 6,
  },
  course: { fontSize: 16, fontFamily: "Helvetica-Bold", marginVertical: 10, textAlign: "center" },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  footerLabel: { fontSize: 10, color: "#9ca3af" },
  footerValue: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 4 },
});

function CertificateDocument({ name, courseTitle, companyName, completedOn }: CertificateProps) {
  return (
    <Document title={`Certificate — ${courseTitle}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.kicker}>CERTIFICATE OF COMPLETION</Text>
          <Text style={styles.heading}>This certifies that</Text>
          <Text style={styles.label}>Awarded to</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.body}>has successfully completed the course</Text>
          <Text style={styles.course}>{courseTitle}</Text>
          <Text style={styles.body}>provided by {companyName}.</Text>
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>DATE COMPLETED</Text>
              <Text style={styles.footerValue}>{completedOn}</Text>
            </View>
            <View>
              <Text style={styles.footerLabel}>ISSUED BY</Text>
              <Text style={styles.footerValue}>{companyName}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function renderCertificate(props: CertificateProps): Promise<Buffer> {
  return renderToBuffer(<CertificateDocument {...props} />);
}
