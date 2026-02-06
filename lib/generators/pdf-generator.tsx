import ReactPDF, {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { ResumeStructure } from '@/lib/utils/structure-analyzer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#000000',
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 4,
    textTransform: 'uppercase',
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#000000',
  },
  bulletPoint: {
    marginLeft: 15,
    marginBottom: 4,
  },
});

interface ResumeDocumentProps {
  resumeText: string;
  structure: ResumeStructure;
}

// Create the PDF document component
const ResumeDocument = ({ resumeText, structure }: ResumeDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with contact info */}
      {structure.contact && (
        <View style={styles.header}>
          {structure.contact.name && <Text style={styles.name}>{structure.contact.name}</Text>}
          {structure.contact.email && (
            <Text style={styles.contactInfo}>{structure.contact.email}</Text>
          )}
          {structure.contact.phone && (
            <Text style={styles.contactInfo}>{structure.contact.phone}</Text>
          )}
          {structure.contact.location && (
            <Text style={styles.contactInfo}>{structure.contact.location}</Text>
          )}
        </View>
      )}

      {/* Sections */}
      {structure.sections
        .filter((section) => section.type !== 'contact')
        .map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.content.split('\n').map((line, lineIndex) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;

                // Check if it's a bullet point
                const isBullet = /^[•\-\*]/.test(trimmedLine);

                return (
                  <Text key={lineIndex} style={isBullet ? styles.bulletPoint : {}}>
                    {trimmedLine}
                  </Text>
                );
              })}
            </View>
          </View>
        ))}
    </Page>
  </Document>
);

export async function generateResumePDF(
  resumeText: string,
  structure: ResumeStructure
): Promise<Buffer> {
  try {
    const pdfStream = await ReactPDF.renderToStream(
      <ResumeDocument resumeText={resumeText} structure={structure} />
    );

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];

    return new Promise((resolve, reject) => {
      pdfStream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
      pdfStream.on('error', reject);
    });
  } catch (error) {
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
