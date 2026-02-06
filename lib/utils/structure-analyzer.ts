export interface ResumeSection {
  type: 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'other';
  title: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface ResumeStructure {
  sections: ResumeSection[];
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
}

const SECTION_PATTERNS = {
  contact: /^(contact|personal information)/i,
  summary: /^(summary|profile|objective|about|professional summary)/i,
  experience: /^(experience|work experience|employment|work history|professional experience)/i,
  education: /^(education|academic|qualifications|academic background)/i,
  skills: /^(skills|technical skills|competencies|expertise|technologies|proficiencies)/i,
};

const EMAIL_PATTERN = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

export function analyzeResumeStructure(text: string): ResumeStructure {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const sections: ResumeSection[] = [];

  let currentSection: ResumeSection | null = null;
  let currentContent: string[] = [];
  let lineIndex = 0;

  // Extract contact information
  const contact = extractContactInfo(text);

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this line is a section header
    const sectionType = identifySectionType(trimmedLine);

    if (sectionType) {
      // Save previous section if exists
      if (currentSection && currentContent.length > 0) {
        currentSection.content = currentContent.join('\n');
        currentSection.endIndex = lineIndex - 1;
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        type: sectionType,
        title: trimmedLine,
        content: '',
        startIndex: lineIndex,
        endIndex: lineIndex,
      };
      currentContent = [];
    } else if (currentSection) {
      // Add content to current section
      currentContent.push(trimmedLine);
    } else {
      // Before any section identified, might be contact info
      if (!currentSection) {
        currentSection = {
          type: 'contact',
          title: 'Contact Information',
          content: trimmedLine,
          startIndex: 0,
          endIndex: lineIndex,
        };
        currentContent = [trimmedLine];
      }
    }

    lineIndex++;
  }

  // Add final section
  if (currentSection && currentContent.length > 0) {
    currentSection.content = currentContent.join('\n');
    currentSection.endIndex = lineIndex - 1;
    sections.push(currentSection);
  }

  return {
    sections,
    contact,
  };
}

function identifySectionType(line: string): ResumeSection['type'] | null {
  const trimmedLine = line.trim();

  // Check if line looks like a section header (short, possibly bold/caps)
  if (trimmedLine.length > 50) return null;

  for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(trimmedLine)) {
      return type as ResumeSection['type'];
    }
  }

  return null;
}

function extractContactInfo(text: string): ResumeStructure['contact'] {
  const emailMatch = text.match(EMAIL_PATTERN);
  const phoneMatch = text.match(PHONE_PATTERN);

  // Try to extract name (usually first non-empty line)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const potentialName = lines[0]?.trim();

  return {
    name: potentialName && potentialName.length < 100 ? potentialName : undefined,
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
  };
}

export function reconstructResume(structure: ResumeStructure, updatedSections: Map<string, string>): string {
  let result = '';

  for (const section of structure.sections) {
    const updatedContent = updatedSections.get(section.type);

    if (updatedContent) {
      result += `${section.title}\n${updatedContent}\n\n`;
    } else {
      result += `${section.title}\n${section.content}\n\n`;
    }
  }

  return result.trim();
}
