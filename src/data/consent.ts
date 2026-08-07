/**
 * Bilingual (English / Arabic) surgical-consent content, keyed to the operative
 * procedures already in the app. Complication lists are summarised in our own
 * words from the cited operative source (never reproduced verbatim) and carried
 * over from src/data/procedures.ts; benefits, alternatives and Arabic wording
 * are authored here.
 *
 * SAFETY: This is a bilingual TEMPLATE to support the consent conversation — it
 * does not replace the surgeon's own disclosure or clinical judgment, and the
 * Arabic wording should be verified by the treating team. The app stores NO
 * patient-identifiable data (CLAUDE.md); any identifiers typed into the
 * generator live only in-session and are never persisted.
 */

export interface BilingualText {
  en: string;
  ar: string;
}

export interface ConsentProcedure {
  /** Matches the id in src/data/procedures.ts where one exists. */
  id: string;
  name: BilingualText;
  description: BilingualText;
  benefits: BilingualText[];
  alternatives: BilingualText[];
  complications: BilingualText[];
  anaesthesia: BilingualText;
  source: { label: string; url?: string };
}

/** Fixed bilingual boilerplate shared by every generated consent. */
export const CONSENT_BOILERPLATE = {
  title: { en: 'Informed Surgical Consent', ar: 'إقرار الموافقة الجراحية المستنيرة' },
  statement: {
    en: 'I confirm that my doctor has explained to me, in a language I understand, the nature and purpose of the procedure named below, its expected benefits, the reasonable alternatives (including no treatment), and the material risks and possible complications. I have had the opportunity to ask questions and they were answered to my satisfaction. I understand that no guarantee has been made about the outcome, that additional or different procedures may become necessary if unexpected findings arise during surgery, and that any tissue removed may be examined and disposed of according to hospital policy. I consent to the administration of anaesthesia and to the procedure described below.',
    ar: 'أُقِرّ بأن الطبيب قد شرح لي، بلغةٍ أفهمها، طبيعة العملية المذكورة أدناه والغرض منها وفوائدها المتوقعة والبدائل المعقولة (بما في ذلك عدم إجراء أي علاج) والمخاطر الجوهرية والمضاعفات المحتملة. وقد أُتيحت لي الفرصة لطرح الأسئلة وأُجيب عنها بما يُرضيني. وأُدرك أنه لم يُقدَّم لي أي ضمان بشأن النتيجة، وأنه قد تستدعي الحاجةُ إجراءَ عملياتٍ إضافية أو مختلفة إذا ظهرت مستجداتٌ غير متوقعة أثناء الجراحة، وأن أي نسيج يُستأصَل قد يُفحَص ويُتخلَّص منه وفق سياسة المستشفى. وأوافق على إعطائي التخدير وعلى إجراء العملية الموضحة أدناه.',
  },
  headings: {
    procedure: { en: 'Proposed procedure', ar: 'العملية المقترحة' },
    benefits: { en: 'Purpose & expected benefits', ar: 'الغرض والفوائد المتوقعة' },
    alternatives: { en: 'Alternatives', ar: 'البدائل المتاحة' },
    risks: { en: 'Material risks & possible complications', ar: 'المخاطر والمضاعفات المحتملة' },
    anaesthesia: { en: 'Anaesthesia', ar: 'التخدير' },
  },
  signatures: {
    patientName: { en: 'Patient name', ar: 'اسم المريض' },
    patientSign: { en: 'Patient signature', ar: 'توقيع المريض' },
    guardian: {
      en: 'Guardian / next of kin (if the patient cannot consent)',
      ar: 'ولي الأمر / أقرب الأقارب (إذا تعذّر على المريض)',
    },
    surgeon: { en: 'Surgeon name & signature', ar: 'اسم الجراح وتوقيعه' },
    witness: { en: 'Witness', ar: 'الشاهد' },
    interpreter: { en: 'Interpreter (if used)', ar: 'المترجم (إن وُجد)' },
    datetime: { en: 'Date & time', ar: 'التاريخ والوقت' },
  },
  disclaimer: {
    en: 'This bilingual form is a template to support the consent conversation. It must be reviewed against local hospital policy and tailored to the individual patient by the treating surgeon; it does not replace the surgeon’s own disclosure or clinical judgment. The Arabic wording should be verified by the treating team. No patient data entered into this generator is stored by the app.',
    ar: 'هذا النموذج ثنائي اللغة قالبٌ لدعم حوار الموافقة، ويجب مراجعته وفق سياسة المستشفى وتكييفه لكل مريض من قِبَل الجراح المعالج، وهو لا يُغني عن إفصاح الجراح نفسه أو حكمه السريري. ويُنصَح بمراجعة الصياغة العربية من الفريق المعالج. ولا يحفظ التطبيق أي بيانات للمريض تُدخَل في هذه الأداة.',
  },
} as const;

const GA_SPINAL: BilingualText = {
  en: 'General or spinal anaesthesia. Anaesthetic and cardiovascular risks are discussed separately by the anaesthetist.',
  ar: 'تخدير عام أو نصفي (شوكي). تُناقَش مخاطر التخدير والقلب والأوعية بشكل منفصل مع طبيب التخدير.',
};

const LOCAL_ANAESTHESIA: BilingualText = {
  en: 'Usually local anaesthesia as a day case.',
  ar: 'عادةً تخدير موضعي كإجراء يومي (دون مبيت).',
};

const GA_ONLY: BilingualText = {
  en: 'General anaesthesia. Anaesthetic and cardiovascular risks are discussed separately by the anaesthetist.',
  ar: 'تخدير عام. تُناقَش مخاطر التخدير والقلب والأوعية بشكل منفصل مع طبيب التخدير.',
};

export const CONSENT_PROCEDURES: ConsentProcedure[] = [
  {
    id: 'turp',
    name: {
      en: 'TURP — Transurethral resection of the prostate',
      ar: 'استئصال البروستاتا عبر الإحليل بالمنظار (TURP)',
    },
    description: {
      en: 'Telescopic removal of the obstructing inner part of the prostate through the urethra to create a wider channel and relieve bladder-outlet obstruction from an enlarged prostate.',
      ar: 'إزالة الجزء الداخلي المُسِدّ من البروستاتا بالمنظار عبر مجرى البول لتوسيع القناة وتخفيف انسداد مخرج المثانة الناتج عن تضخم البروستاتا الحميد.',
    },
    benefits: [
      { en: 'Improved urinary flow and emptying.', ar: 'تحسّن تدفّق البول وإفراغ المثانة.' },
      { en: 'Relief of obstructive urinary symptoms.', ar: 'تخفيف أعراض انسداد المسالك البولية.' },
      {
        en: 'Reduced risk of urinary retention and related complications.',
        ar: 'تقليل خطر احتباس البول والمضاعفات المرتبطة به.',
      },
    ],
    alternatives: [
      { en: 'Continued medical therapy (alpha-blocker ± 5-ARI).', ar: 'الاستمرار على العلاج الدوائي (حاصرات ألفا ± مثبطات اختزال 5-ألفا).' },
      { en: 'Minimally invasive options (e.g. Rezum, UroLift) or laser enucleation.', ar: 'خيارات أقل توغلاً (مثل Rezum أو UroLift) أو استئصال البروستاتا بالليزر.' },
      { en: 'Watchful waiting; long-term catheter in unfit patients.', ar: 'المراقبة والانتظار؛ أو قسطرة دائمة لغير اللائقين للجراحة.' },
    ],
    complications: [
      { en: 'Temporary burning, bleeding and urinary frequency (almost all patients).', ar: 'حُرقة ونزيف وتكرار تبوّل مؤقت (لدى جميع المرضى تقريباً).' },
      { en: 'Retrograde ejaculation — semen passing back into the bladder (common).', ar: 'القذف الراجع — مرور السائل المنوي إلى المثانة (شائع).' },
      { en: 'Incomplete relief of symptoms, or regrowth needing repeat surgery later.', ar: 'عدم زوال الأعراض بالكامل، أو معاودة النمو والحاجة لإعادة العملية لاحقاً.' },
      { en: 'Bleeding needing transfusion or a return to theatre (uncommon).', ar: 'نزيف يستدعي نقل دم أو العودة لغرفة العمليات (غير شائع).' },
      { en: 'Erectile dysfunction in some previously potent men.', ar: 'ضعف الانتصاب لدى بعض الرجال الذين كانت قدرتهم طبيعية.' },
      { en: 'Urethral stricture or bladder-neck scarring.', ar: 'تضيّق الإحليل أو تندّب عنق المثانة.' },
      { en: 'Temporary or, rarely, permanent urinary incontinence.', ar: 'سلس بول مؤقت، ونادراً دائم.' },
      { en: 'TUR syndrome — absorption of irrigation fluid causing confusion/heart strain (rare).', ar: 'متلازمة استئصال البروستاتا — امتصاص سائل الغسيل مسبباً تشوّشاً وإجهاداً للقلب (نادر).' },
      { en: 'Incidental prostate cancer found in the removed tissue.', ar: 'اكتشاف سرطان بروستاتا عرضاً في الأنسجة المُستأصلة.' },
    ],
    anaesthesia: GA_SPINAL,
    source: { label: 'BAUS patient information (TURP)', url: 'https://www.baus.org.uk/patients/information_leaflets/' },
  },

  {
    id: 'flexible-urs',
    name: {
      en: 'Flexible ureteroscopy + JJ stent — Endoscopic stone treatment',
      ar: 'تنظير الحالب المرن + دعامة حالبية (JJ) — علاج الحصوات بالمنظار',
    },
    description: {
      en: 'Passing a fine telescope up through the urethra and bladder into the ureter and kidney to break or remove a stone with a laser or basket, usually leaving a temporary internal (JJ) stent to keep the kidney draining.',
      ar: 'إدخال منظار دقيق عبر مجرى البول والمثانة إلى الحالب والكلية لتفتيت الحصوة أو إزالتها بالليزر أو السلة، مع ترك دعامة داخلية مؤقتة (JJ) غالباً للحفاظ على تصريف الكلية.',
    },
    benefits: [
      { en: 'Breaks up or removes the stone with no external incision.', ar: 'تفتيت الحصوة أو إزالتها دون أي شقّ خارجي.' },
      { en: 'Relieves the obstruction and protects the kidney.', ar: 'تخفيف الانسداد وحماية الكلية.' },
      { en: 'High clearance for ureteric and smaller kidney stones.', ar: 'نسبة عالية لإزالة حصوات الحالب والحصوات الكلوية الأصغر.' },
    ],
    alternatives: [
      { en: 'Shockwave lithotripsy (ESWL).', ar: 'تفتيت الحصوات بالموجات الصادمة (ESWL).' },
      { en: 'Percutaneous surgery (PCNL) for large stones.', ar: 'الجراحة عبر الجلد (PCNL) للحصوات الكبيرة.' },
      { en: 'Observation or medicine to help a small stone pass on its own.', ar: 'المراقبة أو دواء يساعد على نزول الحصوة الصغيرة تلقائياً.' },
    ],
    complications: [
      { en: 'Urinary infection or, less commonly, a blood infection (sepsis).', ar: 'عدوى بولية، وبنسبة أقل تعفّن الدم (الإنتان).' },
      { en: 'Stent symptoms — flank or bladder pain, burning, frequency, blood in the urine.', ar: 'أعراض الدعامة — ألم في الخاصرة أو المثانة، وحُرقة، وتكرار تبوّل، ودم في البول.' },
      { en: 'Injury to the ureter, from a minor graze up to, rarely, a tear.', ar: 'إصابة الحالب، من خدش بسيط وحتى تمزّق نادر.' },
      { en: 'Failure to reach or fully clear the stone, needing a repeat procedure.', ar: 'تعذّر الوصول إلى الحصوة أو إزالتها بالكامل مما يستدعي إعادة العملية.' },
      { en: 'Stone fragments left behind that may need further treatment.', ar: 'بقايا فُتات الحصوة التي قد تحتاج علاجاً إضافياً.' },
      { en: 'Long-term narrowing (stricture) of the ureter.', ar: 'تضيّق الحالب على المدى البعيد.' },
      { en: 'A forgotten stent that hardens if not removed on time — attend for removal.', ar: 'دعامة منسيّة تتكلّس إن لم تُزَل في موعدها — يجب الحضور لإزالتها.' },
    ],
    anaesthesia: GA_SPINAL,
    source: {
      label: 'AUA Surgical Management of Stones Guideline',
      url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
    },
  },

  {
    id: 'orchidopexy',
    name: {
      en: 'Inguinal orchidopexy — Correction of an undescended testis',
      ar: 'تثبيت الخصية عبر الأربية — تصحيح الخصية المعلّقة (غير النازلة)',
    },
    description: {
      en: 'An operation, usually in early childhood, to bring a palpable undescended testis down into the scrotum and fix it there without tension, and to repair any associated hernia sac.',
      ar: 'عملية تُجرى عادةً في الطفولة المبكرة لإنزال الخصية المعلّقة المحسوسة إلى كيس الصفن وتثبيتها دون شدّ، مع إصلاح أي كيس فتق مصاحب.',
    },
    benefits: [
      { en: 'Places the testis in the scrotum to allow future self-examination.', ar: 'وضع الخصية في كيس الصفن لتمكين الفحص الذاتي مستقبلاً.' },
      { en: 'May help preserve fertility potential.', ar: 'قد يساعد في الحفاظ على القدرة الإنجابية.' },
      { en: 'Repairs an associated hernia when present.', ar: 'إصلاح الفتق المصاحب عند وجوده.' },
    ],
    alternatives: [
      { en: 'Observation in the first months of life (spontaneous descent may still occur).', ar: 'المراقبة في الأشهر الأولى من العمر (قد تنزل الخصية تلقائياً).' },
      { en: 'Hormonal therapy (limited effectiveness).', ar: 'العلاج الهرموني (فعاليته محدودة).' },
      { en: 'Removal of the testis if it is atrophic/non-viable.', ar: 'استئصال الخصية إذا كانت ضامرة/غير حيّة.' },
    ],
    complications: [
      { en: 'Testicular atrophy (shrinkage) from reduced blood supply — the most significant risk.', ar: 'ضمور الخصية بسبب نقص التروية الدموية — أهم المخاطر.' },
      { en: 'Failure or re-ascent of the testis needing a repeat operation.', ar: 'فشل التثبيت أو صعود الخصية مجدداً مما يستدعي إعادة العملية.' },
      { en: 'Wound infection.', ar: 'عدوى الجرح.' },
      { en: 'Bleeding or scrotal haematoma.', ar: 'نزيف أو تجمّع دموي في كيس الصفن.' },
      { en: 'Injury to the vas deferens affecting future fertility.', ar: 'إصابة القناة الناقلة (الأسهر) مما يؤثر على الخصوبة مستقبلاً.' },
      { en: 'A small lifelong testicular-cancer risk remains despite repair.', ar: 'يبقى خطر ضئيل للإصابة بسرطان الخصية مدى الحياة رغم الإصلاح.' },
    ],
    anaesthesia: GA_ONLY,
    source: { label: 'Dunn et al., Oper Tech Gen Surg 2004', url: 'https://doi.org/10.1053/j.optechgensurg.2004.10.005' },
  },

  {
    id: 'vasectomy',
    name: {
      en: 'Vasectomy — Male permanent contraception',
      ar: 'قطع القناة المنوية (الأسهر) — تعقيم دائم للذكور',
    },
    description: {
      en: 'Division of the vas deferens on both sides through the scrotum to provide permanent contraception, usually under local anaesthesia as a day case.',
      ar: 'قطع القناة الناقلة (الأسهر) من الجانبين عبر كيس الصفن لتوفير وسيلة تعقيم دائمة، عادةً تحت تخدير موضعي كإجراء يومي.',
    },
    benefits: [
      { en: 'Permanent, highly effective contraception.', ar: 'وسيلة تعقيم دائمة وعالية الفعالية.' },
      { en: 'Simpler and safer than female sterilisation.', ar: 'أبسط وأأمن من تعقيم المرأة.' },
    ],
    alternatives: [
      { en: 'Other contraception (condoms, hormonal methods, IUD for the partner).', ar: 'وسائل منع حمل أخرى (الواقي، الوسائل الهرمونية، اللولب للشريكة).' },
      { en: 'Female sterilisation (tubal ligation).', ar: 'تعقيم المرأة (ربط الأنابيب).' },
    ],
    complications: [
      { en: 'Scrotal bruising or haematoma.', ar: 'كدمات أو تجمّع دموي في كيس الصفن.' },
      { en: 'Wound infection.', ar: 'عدوى الجرح.' },
      { en: 'Sperm granuloma (a tender lump at the cut end).', ar: 'ورم حبيبي منوي (كتلة مؤلمة عند طرف القطع).' },
      { en: 'Chronic scrotal or testicular pain.', ar: 'ألم مزمن في كيس الصفن أو الخصية.' },
      { en: 'Late failure from spontaneous re-joining of the tube (about 1 in 2000).', ar: 'فشل متأخر بسبب التحام القناة تلقائياً (نحو 1 من كل 2000).' },
      { en: 'Early failure if contraception is stopped before azoospermia is confirmed.', ar: 'فشل مبكر إذا أُوقفت وسائل منع الحمل قبل تأكيد انعدام الحيوانات المنوية.' },
    ],
    anaesthesia: LOCAL_ANAESTHESIA,
    source: { label: 'Basso, Oper Tech Gen Surg 2002', url: 'https://doi.org/10.1053/otgn.2002.35343' },
  },

  {
    id: 'lap-nephrectomy',
    name: {
      en: 'Laparoscopic nephrectomy — Keyhole removal of a kidney',
      ar: 'استئصال الكلية بالمنظار — إزالة الكلية عبر فتحات صغيرة',
    },
    description: {
      en: 'Minimally invasive removal of a kidney (for a tumour or a poorly-functioning kidney) through several small incisions, with faster recovery than open surgery.',
      ar: 'إزالة الكلية بأسلوب أقل توغلاً (لورم أو لكلية ضعيفة الوظيفة) عبر عدة شقوق صغيرة، مع تعافٍ أسرع من الجراحة المفتوحة.',
    },
    benefits: [
      { en: 'Removal of the diseased kidney or tumour.', ar: 'إزالة الكلية المريضة أو الورم.' },
      { en: 'Smaller incisions, less pain and faster recovery than open surgery.', ar: 'شقوق أصغر وألم أقل وتعافٍ أسرع مقارنةً بالجراحة المفتوحة.' },
    ],
    alternatives: [
      { en: 'Open surgery.', ar: 'الجراحة المفتوحة.' },
      { en: 'Partial nephrectomy or tumour ablation for suitable tumours.', ar: 'استئصال جزئي للكلية أو كيّ الورم للأورام المناسبة.' },
      { en: 'Active surveillance in selected cases.', ar: 'المراقبة النشطة في حالات مختارة.' },
    ],
    complications: [
      { en: 'Bleeding from the kidney’s blood vessels, occasionally needing transfusion.', ar: 'نزيف من أوعية الكلية، قد يستدعي نقل دم أحياناً.' },
      { en: 'Injury to nearby organs (bowel, spleen, liver, pancreas).', ar: 'إصابة الأعضاء المجاورة (الأمعاء، الطحال، الكبد، البنكرياس).' },
      { en: 'Conversion to open surgery if needed.', ar: 'التحويل إلى جراحة مفتوحة عند الحاجة.' },
      { en: 'Reduced overall kidney function.', ar: 'انخفاض وظيفة الكلى الإجمالية.' },
      { en: 'Prolonged ileus (slow bowel), infection, hernia at a port site.', ar: 'بطء حركة الأمعاء، والعدوى، وفتق في موضع المنفذ.' },
      { en: 'General risks of keyhole surgery (e.g. gas-related, port-site).', ar: 'المخاطر العامة لجراحة المنظار (مثل ما يتعلق بالغاز وموضع المنافذ).' },
    ],
    anaesthesia: GA_ONLY,
    source: { label: 'Gettman & Segura, Oper Tech Gen Surg 2005', url: 'https://doi.org/10.1053/j.optechgensurg.2004.12.003' },
  },

  {
    id: 'rplnd',
    name: {
      en: 'RPLND — Retroperitoneal lymph node dissection',
      ar: 'استئصال العُقد اللمفية خلف الصفاق (RPLND)',
    },
    description: {
      en: 'Removal of the lymph nodes at the back of the abdomen for testicular (germ-cell) cancer, both to stage and to treat the disease, using a nerve-sparing technique where possible.',
      ar: 'إزالة العُقد اللمفية في مؤخرة البطن لسرطان الخصية (الورم الجرثومي)، لتحديد المرحلة وعلاج المرض، باستخدام تقنية حافظة للأعصاب متى أمكن.',
    },
    benefits: [
      { en: 'Removes cancer-bearing or residual lymph nodes.', ar: 'إزالة العُقد اللمفية المصابة أو المتبقية بعد العلاج.' },
      { en: 'Provides accurate staging to guide further treatment.', ar: 'يوفّر تحديداً دقيقاً للمرحلة لتوجيه العلاج اللاحق.' },
    ],
    alternatives: [
      { en: 'Surveillance in selected early-stage disease.', ar: 'المراقبة في حالات مختارة من المرض المبكر.' },
      { en: 'Chemotherapy.', ar: 'العلاج الكيميائي.' },
    ],
    complications: [
      { en: 'Loss of forward ejaculation (reduced fertility) — lower with nerve-sparing.', ar: 'فقدان القذف الأمامي (ضعف الخصوبة) — أقل مع الحفاظ على الأعصاب.' },
      { en: 'Chylous (lymphatic) fluid leak into the abdomen.', ar: 'تسرّب سائل لِمفي (كيلوسي) إلى البطن.' },
      { en: 'Major blood-vessel injury, particularly after chemotherapy.', ar: 'إصابة وعاء دموي كبير، خصوصاً بعد العلاج الكيميائي.' },
      { en: 'Bowel injury or slow bowel function (ileus).', ar: 'إصابة الأمعاء أو بطء حركتها.' },
      { en: 'Bleeding, wound problems, infection.', ar: 'نزيف، ومشاكل في الجرح، وعدوى.' },
    ],
    anaesthesia: GA_ONLY,
    source: { label: 'Wood, Oper Tech Gen Surg 2006', url: 'https://doi.org/10.1053/j.optechgensurg.2006.06.003' },
  },

  {
    id: 'bladder-ureteral-trauma',
    name: {
      en: 'Repair of bladder / ureteral injury',
      ar: 'إصلاح إصابة المثانة / الحالب',
    },
    description: {
      en: 'Surgical repair of an injured bladder or ureter (from trauma or during another operation), restoring a watertight, well-drained urinary tract.',
      ar: 'إصلاح جراحي للمثانة أو الحالب المصاب (نتيجة رضّ أو أثناء عملية أخرى)، لاستعادة مسلك بولي محكم وجيد التصريف.',
    },
    benefits: [
      { en: 'Repairs the leak and restores urinary drainage.', ar: 'إصلاح التسرّب واستعادة تصريف البول.' },
      { en: 'Prevents urine collection, infection and further kidney damage.', ar: 'يمنع تجمّع البول والعدوى وتلف الكلى الإضافي.' },
    ],
    alternatives: [
      { en: 'Catheter or stent drainage alone for some injuries.', ar: 'التصريف بالقسطرة أو الدعامة فقط لبعض الإصابات.' },
      { en: 'Delayed reconstruction in unstable patients.', ar: 'إعادة الإصلاح لاحقاً لدى المرضى غير المستقرين.' },
    ],
    complications: [
      { en: 'Urine leak or a collection of urine (urinoma), or a fistula.', ar: 'تسرّب البول أو تجمّعه (ورم بولي)، أو ناسور.' },
      { en: 'Narrowing (stricture) of the ureter.', ar: 'تضيّق الحالب.' },
      { en: 'Heavy bleeding, particularly with a pelvic fracture.', ar: 'نزيف غزير، خصوصاً مع كسر الحوض.' },
      { en: 'Reduced bladder capacity after extensive injury.', ar: 'انخفاض سعة المثانة بعد الإصابات الواسعة.' },
      { en: 'Recurrent urinary infections.', ar: 'التهابات بولية متكررة.' },
    ],
    anaesthesia: GA_ONLY,
    source: { label: 'Coburn, Oper Tech Gen Surg 2000', url: 'https://doi.org/10.1053/otgn.2000.17745' },
  },

  {
    id: 'ureteral-reconstruction',
    name: {
      en: 'Ureteral reconstruction',
      ar: 'إعادة بناء الحالب (إصلاح الحالب)',
    },
    description: {
      en: 'Reconstruction of a damaged or narrowed ureter — by rejoining, reimplanting into the bladder, or using a bladder flap — to restore drainage of urine from the kidney.',
      ar: 'إعادة بناء الحالب المتضرر أو المتضيّق — بإعادة الوصل أو غرسه في المثانة أو استخدام رفرف من المثانة — لاستعادة تصريف البول من الكلية.',
    },
    benefits: [
      { en: 'Restores urine drainage and protects kidney function.', ar: 'استعادة تصريف البول والحفاظ على وظيفة الكلية.' },
      { en: 'Relieves obstruction and its symptoms.', ar: 'تخفيف الانسداد وأعراضه.' },
    ],
    alternatives: [
      { en: 'Long-term ureteric stent or nephrostomy drainage.', ar: 'دعامة حالبية دائمة أو تصريف عبر فغر الكلية.' },
      { en: 'Removal of the kidney if it no longer functions.', ar: 'استئصال الكلية إذا فقدت وظيفتها.' },
    ],
    complications: [
      { en: 'Leak at the join or a urine collection.', ar: 'تسرّب عند موضع الوصل أو تجمّع بولي.' },
      { en: 'Re-narrowing (stricture) of the ureter.', ar: 'إعادة تضيّق الحالب.' },
      { en: 'Backflow of urine (reflux), usually harmless in adults.', ar: 'ارتجاع البول، وغالباً غير مؤذٍ عند البالغين.' },
      { en: 'Nerve injury or reduced bladder capacity with a bladder-flap repair.', ar: 'إصابة عصبية أو انخفاض سعة المثانة عند استخدام رفرف المثانة.' },
    ],
    anaesthesia: GA_ONLY,
    source: { label: 'LaFontaine, Oper Tech Gen Surg 2008', url: 'https://doi.org/10.1053/j.optechgensurg.2008.01.004' },
  },

  {
    id: 'retroperitoneal-exposure',
    name: {
      en: 'Retroperitoneal surgical exposure',
      ar: 'الوصول الجراحي خلف الصفاق',
    },
    description: {
      en: 'A surgical approach through the flank to reach the great vessels, kidney or spine from behind the abdominal cavity, avoiding entry into the peritoneum.',
      ar: 'أسلوب جراحي عبر الخاصرة للوصول إلى الأوعية الكبرى أو الكلية أو العمود الفقري من خلف تجويف البطن، مع تجنّب دخول الصفاق.',
    },
    benefits: [
      { en: 'Direct access to the target while avoiding the abdominal cavity.', ar: 'وصول مباشر إلى الهدف مع تجنّب تجويف البطن.' },
      { en: 'Fewer fluid shifts and often a smoother recovery.', ar: 'تغيّرات أقل في السوائل وتعافٍ أكثر سلاسة غالباً.' },
    ],
    alternatives: [
      { en: 'Transperitoneal (through-the-abdomen) approach.', ar: 'النهج عبر الصفاق (عبر البطن).' },
      { en: 'Minimally invasive / endovascular approaches where suitable.', ar: 'الأساليب الأقل توغلاً / داخل الأوعية عند ملاءمتها.' },
    ],
    complications: [
      { en: 'Entry into the chest lining (pleura) needing a chest drain.', ar: 'دخول غشاء الصدر (الجنبة) مما يستدعي أنبوب تصريف صدري.' },
      { en: 'Spleen injury from retraction (left side).', ar: 'إصابة الطحال بسبب السحب (الجهة اليسرى).' },
      { en: 'Accidental entry into the abdominal cavity.', ar: 'دخول غير مقصود إلى تجويف البطن.' },
      { en: 'Pressure or stretch nerve injury from positioning.', ar: 'إصابة عصبية بالضغط أو الشدّ بسبب وضعية المريض.' },
      { en: 'Bleeding from the aorta or kidney vessels.', ar: 'نزيف من الأبهر أو أوعية الكلية.' },
    ],
    anaesthesia: GA_ONLY,
    source: { label: 'Radtka & Han, Oper Tech Gen Surg 2008', url: 'https://doi.org/10.1053/j.optechgensurg.2008.05.001' },
  },
];
