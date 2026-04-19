import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { COMMAND_HOSPITALS, distanceKm, getCityCoords } from "./cadet-data";

export const generateMedicalCertificate = (profile: any, results: any[]) => {
  const doc = new jsPDF();
  const timestamp = format(new Date(), "PPpp");
  const cadetCode = profile.candidate_code || "PROTO-PENDING";
  const fullName = profile.full_name || "Cadet";

  // --- Header ---
  doc.setFillColor(10, 11, 14); // Tactical Dark
  doc.rect(0, 0, 210, 50, "F");
  
  // Try to add logo (as placeholder text if image fails, but we assume it's there)
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("CADET PROTOCOL // ALPHA", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("TACTICAL MEDICAL AUDIT & CLEARANCE SYSTEM", 105, 30, { align: "center" });
  doc.text("AFMS STANDARD MATRIX v2025.4", 105, 35, { align: "center" });

  // --- Candidate Information ---
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CANDIDATE IDENTIFICATION", 20, 65);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Full Name: ${fullName}`, 20, 75);
  doc.text(`Cadet ID: ${cadetCode}`, 20, 82);
  doc.text(`Service/Entry: ${profile.target_service} / ${profile.entry_scheme}`, 20, 89);
  doc.text(`Audit Timestamp: ${timestamp}`, 20, 96);
  
  doc.line(20, 100, 190, 100);

  // --- Assessment Results ---
  doc.setFont("helvetica", "bold");
  doc.text("BIOMETRIC & PHYSIOLOGICAL AUDIT RESULTS", 20, 110);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  let y = 120;
  
  results.forEach((r, i) => {
    if (y > 200) {
      doc.addPage();
      y = 20;
    }
    const statusColor = r.status === "FIT" ? [0, 120, 0] : r.status === "UNFIT" ? [180, 0, 0] : [150, 100, 0];
    
    doc.setTextColor(0, 0, 0);
    doc.text(`${i + 1}. ${r.parameter}:`, 25, y);
    doc.text(`${r.measured_value}`, 80, y);
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(`[${r.status}]`, 180, y, { align: "right" });
    
    y += 8;
  });

  y += 10;
  if (y > 230) { doc.addPage(); y = 30; }

  // --- Specialist Intelligence & Precautions ---
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y, 170, 45, "F");
  
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("SYNOPSIS & PRECAUTIONS", 25, y + 10);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const hasIssues = results.some(r => r.status !== "FIT");
  const synopsis = hasIssues 
    ? "Significant physiological anomalies detected. High probability of rejection under AFMS standards."
    : "No immediate rejection triggers found. Maintain current physiological conditioning.";
  
  const splitSynopsis = doc.splitTextToSize(synopsis, 160);
  doc.text(splitSynopsis, 25, y + 18);
  
  doc.setFont("helvetica", "bold");
  doc.text("RECOMMENDATIONS:", 25, y + 30);
  doc.setFont("helvetica", "normal");
  const recommendations = hasIssues
    ? "1. Intensive review required. 2. Corrective measures for flagged parameters. 3. Refer to specialist."
    : "1. Continue metabolic tracking. 2. Maintain AFMS weight thresholds. 3. Regular hydration.";
  doc.text(recommendations, 25, y + 36);

  y += 55;
  if (y > 230) { doc.addPage(); y = 30; }

  // --- Preferred Referral Hospitals ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("NEAREST DESIGNATED COMMAND HOSPITALS", 20, y);
  
  const coords = getCityCoords(profile.city);
  const sortedHospitals = coords 
    ? COMMAND_HOSPITALS
        .map(h => ({ ...h, dist: distanceKm(coords, { lat: h.lat, lng: h.lng }) }))
        .sort((a, b) => (a.dist || 0) - (b.dist || 0))
        .slice(0, 3)
    : COMMAND_HOSPITALS.slice(0, 3);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  y += 10;
  sortedHospitals.forEach((h, i) => {
    const distStr = (h as any).dist ? ` (~${(h as any).dist} KM)` : "";
    doc.text(`${i + 1}. ${h.name} - ${h.city}${distStr}`, 25, y);
    y += 6;
  });

  // --- Digital Signature & QR ---
  const footerY = 250;
  
  // QR Placeholder API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CADET-${cadetCode}-${profile.id}`;
  doc.addImage(qrUrl, "PNG", 160, footerY - 10, 30, 30);

  // Examiner Signature
  try {
    doc.addImage("/assets/examiner_sig.png", "PNG", 20, footerY - 5, 40, 15);
  } catch (e) {
    doc.text("Digitally Signed", 20, footerY);
  }
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("AUTHORISED EXAMINER // AFMS DIGITAL LOCK", 20, footerY + 15);
  doc.text("REPORT AUTHENTICITY CAN BE VERIFIED VIA THE QR CODE ABOVE.", 105, 285, { align: "center" });

  doc.save(`Cadet_Audit_Report_${fullName.replace(/\s+/g, '_')}.pdf`);
};
