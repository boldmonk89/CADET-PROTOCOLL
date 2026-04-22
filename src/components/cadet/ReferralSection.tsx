import { motion } from "framer-motion";
import { Hospital, ClipboardList, MapPin, ExternalLink, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MANDATORY_CLINICAL_TESTS, MAJOR_REJECTION_CAUSES } from "@/data/military-standards-tables";

export function ReferralSection() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 space-y-8"
    >
      <div className="flex items-center gap-4 border-b border-primary/10 pb-6">
        <div className="w-16 h-16 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20">
          <Hospital className="text-primary" size={32} />
        </div>
        <div>
          <div className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-primary/60 mb-1">Command Directive</div>
          <h2 className="text-3xl font-display tracking-tight">Clinical Referral Protocols</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-sans font-bold text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
            <ClipboardList size={16} className="text-primary" />
            Mandatory Hospital-Side Testing
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The following assessments require radiological, sonographic, or clinical laboratory equipment 
            available only at AFMS designated medical centres.
          </p>
          
          <div className="space-y-3 pt-2">
            {MANDATORY_CLINICAL_TESTS.map((test, i) => (
              <div key={i} className="p-3 bg-background/40 border border-primary/5 rounded-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                <span className="text-sm font-sans font-bold text-foreground/80">{test.test}</span>
                <span className="text-[10px] bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full text-primary/60 group-hover:text-primary transition-colors">
                  {test.purpose}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-sans font-bold text-sm uppercase tracking-widest text-destructive flex items-center gap-2">
            <ShieldAlert size={16} />
            High-Failure Risk Nodes (Critical Scans)
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Statistically, 65% of medical rejections occur in these primary scans. 
            Ensure diagnostic clearance before the final SMB.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {MAJOR_REJECTION_CAUSES.filter(c => ['LS_SPINE', 'DNS', 'MYOPIA', 'THALASSEMIA', 'PCOS'].includes(c.id)).map((cause) => (
              <div key={cause.id} className="p-2 bg-destructive/5 border border-destructive/10 rounded-sm flex flex-col">
                <span className="text-[10px] font-sans font-bold text-destructive/80 uppercase">{cause.name}</span>
                <span className="text-[9px] text-muted-foreground">{cause.system} Diagnostic</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <h3 className="font-sans font-bold text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Designated Appeal Boards
            </h3>
            <div className="p-4 bg-accent/10 border border-primary/10 rounded-sm space-y-4 mt-2">
              <div className="flex gap-3">
                <AlertCircle className="text-primary shrink-0" size={18} />
                <p className="text-xs text-muted-foreground leading-relaxed">
                   If declared UNFIT (TR/PR), candidates may appeal at Command Hospitals within 42 days.
                </p>
              </div>
              
              <ul className="text-xs space-y-1 text-foreground/80 font-sans">
                <li>• RR Hospital, Delhi Cantt</li>
                <li>• AFMC, Pune</li>
              </ul>

              <Button variant="outline" className="w-full h-8 font-sans font-bold uppercase text-[9px] tracking-widest">
                Download Referral Memo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-primary/5 text-center">
        <p className="text-[10px] font-mono-tac uppercase tracking-[0.2em] text-muted-foreground/40">
          SECURE_CORE // MEDICAL_OOB_REFERRAL_V2.0
        </p>
      </div>
    </motion.div>
  );
}
