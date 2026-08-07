// 52 weeks of curated urology topics, covering oncology, endourology, pediatric, and reconstructive specialties
export const urologyTopics = [
  // Week 1-4: Oncology
  "Prostate cancer screening and early detection strategies",
  "Bladder cancer diagnosis and staging protocols",
  "Renal cell carcinoma epidemiology and risk factors",
  "Testicular cancer management and surveillance",

  // Week 5-8: Upper urinary tract oncology
  "Upper tract urothelial cancer diagnosis and treatment",
  "Renal mass biopsy indications and techniques",
  "Partial nephrectomy versus radical nephrectomy outcomes",
  "Immunotherapy in advanced urologic cancers",

  // Week 9-12: Endourology and stones
  "Nephrolithiasis epidemiology and medical management",
  "Ureteroscopy for stone disease: techniques and outcomes",
  "Percutaneous nephrolithotomy: indications and complications",
  "Extracorporeal shock wave lithotripsy: current role and efficacy",

  // Week 13-16: BPH and obstructive uropathy
  "Benign prostatic hyperplasia pathophysiology and medical therapy",
  "Minimally invasive treatments for BPH",
  "Urinary retention: etiology and management strategies",
  "Ureteral stenting complications and prevention",

  // Week 17-20: Functional urology
  "Overactive bladder and urge incontinence treatment",
  "Stress urinary incontinence: conservative and surgical management",
  "Interstitial cystitis/bladder pain syndrome diagnosis and therapy",
  "Neurogenic bladder management protocols",

  // Week 21-24: Infection and inflammation
  "Urinary tract infection prevention and antibiotic stewardship",
  "Pyelonephritis management and imaging",
  "Prostatitis: classification and treatment evidence",
  "Sexually transmitted infections in urology",

  // Week 25-28: Pediatric urology
  "Pediatric hydronephrosis evaluation and management",
  "Vesicoureteral reflux diagnosis and treatment",
  "Cryptorchidism: screening and optimal timing of surgery",
  "Pediatric urinary incontinence management",

  // Week 29-32: Reconstructive urology
  "Ureteral stricture etiology and endoscopic management",
  "Urethral stricture disease: diagnosis and treatment options",
  "Renal transplant ureteral complications",
  "Surgical reconstruction of the urinary tract",

  // Week 33-36: Men's health
  "Erectile dysfunction: medical and surgical management",
  "Premature ejaculation treatment strategies",
  "Infertility evaluation and assisted reproductive techniques",
  "Testosterone replacement therapy safety and efficacy",

  // Week 37-40: Miscellaneous
  "Urinary incontinence in the elderly population",
  "Catheter-associated urinary tract infections prevention",
  "Renal insufficiency and contrast-induced nephropathy",
  "Hematuria evaluation and workup algorithm",

  // Week 41-44: Trauma and emergency
  "Renal trauma management and follow-up protocols",
  "Ureteral injury recognition and repair",
  "Urethral injuries in pelvic trauma",
  "Testicular trauma and torsion emergency management",

  // Week 45-48: Surgery and outcomes
  "Radical cystectomy outcomes and quality of life",
  "Ileal conduit versus continent pouch reconstruction",
  "Robotic-assisted surgery in urology: learning curve and outcomes",
  "Complication prevention in major urologic surgery",

  // Week 49-52: Annual review and emerging topics
  "Artificial intelligence applications in urology diagnostics",
  "Urologic cancer immunotherapy and clinical trials",
  "Advances in laser technology for urologic procedures",
  "Personalized medicine and genomics in urology"
];

export function getWeeklyTopic() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneDay = 24 * 60 * 60 * 1000;
  const dayOfYear = Math.floor(diff / oneDay);
  const weekNumber = Math.ceil((dayOfYear + start.getDay() + 1) / 7);
  const index = (weekNumber - 1) % urologyTopics.length;
  return { topic: urologyTopics[index], week: weekNumber };
}
