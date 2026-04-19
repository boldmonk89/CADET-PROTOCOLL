import { jsPDF } from "jspdf";
import { format } from "date-fns";

export const generateMedicalCertificate = (profile: any, results: any[]) => {
  const doc = new jsPDF();
  const timestamp = format(new Date(), "PPpp");
  const cadetCode = profile.candidate_code || "PROTO-PENDING";

  // --- Styles ---
  doc.setFillColor(10, 11, 14); // Tactical Dark
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("CADET PROTOCOL", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("OFFICIAL MEDICAL CLEARANCE STATUS", 105, 30, { align: "center" });

  // --- Content ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Candidate Name: ${profile.full_name}`, 20, 60);
  doc.text(`Candidate Code: ${cadetCode}`, 20, 70);
  doc.text(`Service/Scheme: ${profile.target_service} / ${profile.entry_scheme}`, 20, 80);
  doc.text(`Date of Issue: ${timestamp}`, 20, 90);

  doc.line(20, 95, 190, 95);

  // --- Assessment Results ---
  doc.setFontSize(14);
  doc.text("Assessment Parameters:", 20, 110);
  
  doc.setFontSize(10);
  let y = 120;
  results.forEach((r, i) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    const color = r.status === "FIT" ? [0, 150, 0] : [150, 0, 0];
    doc.setTextColor(0, 0, 0);
    doc.text(`${i + 1}. ${r.parameter}: ${r.measured_value}`, 30, y);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`[${r.status}]`, 160, y, { align: "right" });
    y += 10;
  });

  // --- Footer & Signature ---
  const footerY = 270;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text("THIS IS A PROFESSIONALLY GENERATED MEDICAL AUDIT REPORT BASED ON AFMS STANDARDS.", 105, footerY, { align: "center" });
  doc.text("VERIFIED BY CADET PROTOCOL AI ENGINE // ENCRYPTED RECORDID: " + profile.id, 105, footerY + 5, { align: "center" });

  // Placeholder for QR and Signature
  doc.setLineWidth(0.5);
  doc.rect(150, 230, 40, 40); // QR Box
  doc.text("DIGITAL QR", 170, 250, { align: "center" });

  doc.line(20, 250, 80, 250); // Signature line
  doc.text("AUTHORISED EXAMINER", 50, 255, { align: "center" });

  doc.save(`Medical_Clearance_${profile.full_name.replace(/\s+/g, '_')}.pdf`);
};
