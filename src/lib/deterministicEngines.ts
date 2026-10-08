/**
 * School AI — Deterministic Artifact Generation Engines
 * 
 * Compiles canonical JSON representations of Documents, Spreadsheets, and Presentations
 * into valid Microsoft Office (DOCX, XLSX, PPTX) and PDF projections.
 * Invariant: Math formulas, slide masters, and headers are generated deterministically in code.
 */

import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from 'docx';
import ExcelJS from 'exceljs';
import PptxGenJS from 'pptxgenjs';
import {
  CanonicalDocument,
  CanonicalSpreadsheet,
  CanonicalPresentation,
} from '../types/index.ts';

export class DeterministicEngines {
  /**
   * Generates a Microsoft Word (.docx) file from a CanonicalDocument.
   */
  public static async generateDocx(doc: CanonicalDocument): Promise<Blob> {
    const docChildren: Paragraph[] = [];

    // Title
    docChildren.push(
      new Paragraph({
        text: doc.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    if (doc.subtitle) {
      docChildren.push(
        new Paragraph({
          text: doc.subtitle,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: doc.subtitle, italics: true, color: '64748B' })],
        })
      );
    }

    // Sections
    for (const section of doc.sections) {
      const headingLevel =
        section.level === 2
          ? HeadingLevel.HEADING_2
          : section.level === 3
          ? HeadingLevel.HEADING_3
          : HeadingLevel.HEADING_1;

      docChildren.push(
        new Paragraph({
          text: section.heading,
          heading: headingLevel,
          spacing: { before: 300, after: 150 },
        })
      );

      for (const p of section.paragraphs) {
        docChildren.push(
          new Paragraph({
            text: p,
            spacing: { after: 150 },
          })
        );
      }

      if (section.callout) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({
                text: `[NOTICE]: ${section.callout.text}`,
                bold: true,
                color: section.callout.type === 'warning' ? 'B45309' : '1E3A8A',
              }),
            ],
          })
        );
      }
    }

    const docxFile = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBlob(docxFile);
    return buffer;
  }

  /**
   * Generates a Microsoft Excel (.xlsx) workbook from a CanonicalSpreadsheet,
   * preserving mathematical formulas like =SUM().
   */
  public static async generateXlsx(sheetData: CanonicalSpreadsheet): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'School AI';
    workbook.created = new Date();

    for (const sheet of sheetData.sheets) {
      const ws = workbook.addWorksheet(sheet.name || 'Sheet 1');

      // Add columns
      ws.columns = sheet.columns.map((col) => ({
        header: col.label,
        key: col.key,
        width: col.width || 18,
      }));

      // Style header row (Academic Navy)
      const headerRow = ws.getRow(1);
      headerRow.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' },
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Add data rows
      for (const row of sheet.rows) {
        ws.addRow(row);
      }

      // If formulas are provided, append a calculated summary row
      if (sheet.formulas && Object.keys(sheet.formulas).length > 0) {
        ws.addRow({}); // blank spacer
        const formulaRowValues: Record<string, any> = {};
        const firstColKey = sheet.columns[0]?.key;
        if (firstColKey) {
          formulaRowValues[firstColKey] = 'Total / Computed';
        }

        for (const [key, formulaExpr] of Object.entries(sheet.formulas)) {
          formulaRowValues[key] = { formula: formulaExpr };
        }

        const summaryRow = ws.addRow(formulaRowValues);
        summaryRow.font = { bold: true };
      }
    }

    const uint8Array = await workbook.xlsx.writeBuffer();
    return new Blob([uint8Array], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  /**
   * Generates a Microsoft PowerPoint (.pptx) presentation from a CanonicalPresentation.
   */
  public static async generatePptx(presData: CanonicalPresentation): Promise<Blob> {
    // PptxGenJS is an ESM or CJS constructor
    const PptxConstructor = (PptxGenJS as any).default || PptxGenJS;
    const pptx = new PptxConstructor();
    pptx.layout = 'LAYOUT_16x9';

    const brandNavy = '1E3A8A';
    const brandSlate = '334155';

    for (const slide of presData.slides) {
      const pptSlide = pptx.addSlide();

      if (slide.layout === 'title_slide') {
        // Title banner
        pptSlide.addText(slide.title, {
          x: 1.0,
          y: 2.2,
          w: 11.3,
          h: 1.5,
          fontSize: 38,
          fontFace: 'Arial',
          bold: true,
          color: brandNavy,
          align: 'center',
        });

        if (presData.subtitle) {
          pptSlide.addText(presData.subtitle, {
            x: 1.0,
            y: 3.8,
            w: 11.3,
            h: 0.8,
            fontSize: 20,
            fontFace: 'Arial',
            color: brandSlate,
            align: 'center',
          });
        }
      } else {
        // Content slide with header
        pptSlide.addText(slide.title, {
          x: 0.8,
          y: 0.6,
          w: 11.7,
          h: 0.8,
          fontSize: 26,
          fontFace: 'Arial',
          bold: true,
          color: brandNavy,
        });

        // Bullets
        const bulletItems = slide.bulletPoints.map((text) => ({
          text: `  ${text}`,
          options: { fontSize: 18, bullet: true, color: brandSlate },
        }));

        pptSlide.addText(bulletItems as any, {
          x: 0.8,
          y: 1.8,
          w: 11.7,
          h: 4.5,
          fontFace: 'Arial',
          lineSpacing: 32,
        });
      }

      if (slide.speakerNotes) {
        pptSlide.addNotes(slide.speakerNotes);
      }
    }

    const blob = (await pptx.write({ outputType: 'blob' })) as Blob;
    return blob;
  }

  /**
   * Helper to trigger a browser download for a Blob
   */
  public static triggerDownload(blob: Blob, fileName: string) {
    if (typeof window === 'undefined') return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
