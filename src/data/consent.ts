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

const LOCAL_OR_GA: BilingualText = {
  en: 'Flexible cystoscopy under local anaesthetic gel, or rigid cystoscopy under general or spinal anaesthesia. Anaesthetic risks, if any, are discussed separately.',
  ar: 'تنظير مرن تحت هلام مخدر موضعي، أو تنظير صلب تحت تخدير عام أو نصفي. تُناقَش مخاطر التخدير، إن وُجدت، بشكل منفصل.',
};

const ANALGESIA_SEDATION: BilingualText = {
  en: 'Pain relief, with or without sedation; the type is agreed with the treating team.',
  ar: 'مسكنات للألم مع التهدئة أو بدونها، ويُتفَق على نوعها مع الفريق المعالج.',
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

  // ── Added 2026-10: complications carried over from the sourced write-ups in
  //    procedures.ts (BAUS patient information + AUA guideline), reworded for
  //    patients. Frequency words appear only where that source uses them.
  {
    id: 'cystoscopy',
    name: {
      en: 'Cystoscopy ± ureteric stent — Telescopic examination of the bladder',
      ar: 'تنظير المثانة ± دعامة حالبية — فحص المثانة بالمنظار',
    },
    description: {
      en: 'A thin telescope is passed through the urethra to look inside the bladder and urethra — a flexible scope under local anaesthetic gel, or a rigid scope under general or spinal anaesthesia. If needed, a temporary tube (stent) can be placed up the ureter at the same time to relieve a blockage.',
      ar: 'يُدخَل منظار رفيع عبر مجرى البول لفحص المثانة والإحليل من الداخل — بمنظار مرن مع هلام مخدر موضعي، أو بمنظار صلب تحت تخدير عام أو نصفي. وعند الحاجة يمكن تركيب أنبوب مؤقت (دعامة) في الحالب في الوقت نفسه لتخفيف الانسداد.',
    },
    benefits: [
      { en: 'Finds the cause of blood in the urine, repeated infections or urinary symptoms.', ar: 'معرفة سبب وجود الدم في البول أو الالتهابات المتكررة أو أعراض التبول.' },
      { en: 'Checks for, or follows up, bladder tumours.', ar: 'الكشف عن أورام المثانة أو متابعتها.' },
      { en: 'If a stent is placed: relieves the blockage and protects the kidney.', ar: 'عند تركيب الدعامة: تخفيف الانسداد وحماية الكلية.' },
    ],
    alternatives: [
      { en: 'Imaging alone (ultrasound or CT), which cannot see the bladder lining as well.', ar: 'الاكتفاء بالتصوير (الأشعة الصوتية أو المقطعية)، وهو أقل قدرة على رؤية بطانة المثانة.' },
      { en: 'For a blockage: a drain placed through the skin into the kidney (nephrostomy).', ar: 'في حال الانسداد: أنبوب تصريف يُركَّب عبر الجلد إلى الكلية (فغر الكلية).' },
      { en: 'No investigation, accepting that a cause may be missed.', ar: 'عدم إجراء الفحص، مع احتمال عدم اكتشاف السبب.' },
    ],
    complications: [
      { en: 'Burning, frequency and some blood in the urine for a few days (common, settles on its own).', ar: 'حرقة وتكرار في التبول وبعض الدم في البول لبضعة أيام (شائع ويزول من تلقاء نفسه).' },
      { en: 'Urinary infection.', ar: 'التهاب المسالك البولية.' },
      { en: 'Injury to the urethra; rarely a later narrowing (stricture).', ar: 'إصابة في مجرى البول؛ ونادراً تضيّق لاحق في الإحليل.' },
      { en: 'Difficulty passing urine afterwards, especially in men with an enlarged prostate.', ar: 'صعوبة التبول بعد الإجراء، خاصة لدى الرجال المصابين بتضخم البروستاتا.' },
      { en: 'The scope may not pass, needing a different approach.', ar: 'قد يتعذّر إدخال المنظار، مما يستدعي طريقة أخرى.' },
      { en: 'If a stent is placed: discomfort and frequency while it is in, movement of the stent, and the need to remove it on time — a forgotten stent can become crusted and hard to remove.', ar: 'عند تركيب الدعامة: انزعاج وتكرار في التبول أثناء وجودها، واحتمال تحرّكها، وضرورة إزالتها في موعدها — فالدعامة المنسية قد تتكلّس ويصعب إزالتها.' },
    ],
    anaesthesia: LOCAL_OR_GA,
    source: { label: 'BAUS patient information (cystoscopy)', url: 'https://www.baus.org.uk/patients/information_leaflets/' },
  },

  {
    id: 'turbt',
    name: {
      en: 'TURBT — Telescopic removal of a bladder tumour',
      ar: 'استئصال ورم المثانة عبر الإحليل بالمنظار (TURBT)',
    },
    description: {
      en: 'The bladder tumour is removed with a telescope passed through the urethra, under general or spinal anaesthesia, and the tissue is examined to confirm the type and depth of the tumour. A single dose of medicine may be placed in the bladder afterwards to lower the chance of it coming back.',
      ar: 'يُستأصَل ورم المثانة بمنظار يُدخَل عبر مجرى البول تحت تخدير عام أو نصفي، وتُفحَص الأنسجة لتحديد نوع الورم وعمقه. وقد تُوضَع جرعة واحدة من دواء داخل المثانة بعد العملية لتقليل احتمال عودته.',
    },
    benefits: [
      { en: 'Removes the visible tumour.', ar: 'إزالة الورم الظاهر.' },
      { en: 'Gives the diagnosis and stage, which guide any further treatment.', ar: 'تحديد التشخيص ومرحلة الورم، مما يوجّه أي علاج لاحق.' },
    ],
    alternatives: [
      { en: 'No treatment — the tumour cannot be diagnosed or staged, and may grow and bleed.', ar: 'عدم العلاج — لا يمكن تشخيص الورم أو تحديد مرحلته، وقد يكبر وينزف.' },
      { en: 'Further treatment (such as bladder medicines, surgery or radiotherapy) depends on what this operation finds.', ar: 'يعتمد العلاج اللاحق (مثل أدوية المثانة أو الجراحة أو العلاج الإشعاعي) على نتيجة هذه العملية.' },
    ],
    complications: [
      { en: 'Blood in the urine; occasionally clots blocking the catheter, a transfusion, or a return to theatre.', ar: 'دم في البول؛ وأحياناً جلطات تسدّ القسطرة، أو الحاجة لنقل دم أو العودة لغرفة العمليات.' },
      { en: 'A hole in the bladder wall — usually heals with a catheter; occasionally needs an operation to repair.', ar: 'ثقب في جدار المثانة — يلتئم غالباً بالقسطرة، وقد يحتاج أحياناً إلى جراحة لإصلاحه.' },
      { en: 'A sudden leg movement from nerve stimulation during surgery, which can cause a perforation or bleeding.', ar: 'حركة مفاجئة في الساق نتيجة تحفيز عصب أثناء العملية، قد تسبب ثقباً أو نزيفاً.' },
      { en: 'Absorption of irrigation fluid, causing confusion or strain on the heart.', ar: 'امتصاص سائل الغسيل، مما قد يسبب تشوّشاً أو إجهاداً للقلب.' },
      { en: 'Urinary infection or sepsis.', ar: 'التهاب المسالك البولية أو الإنتان (تسمم الدم).' },
      { en: 'The tumour may come back, and more treatment may be needed if the first resection is incomplete.', ar: 'قد يعود الورم، وقد تلزم معالجة إضافية إذا لم يكتمل الاستئصال الأول.' },
      { en: 'Scarring that narrows the urethra or bladder neck.', ar: 'تندّب يسبب تضيّق الإحليل أو عنق المثانة.' },
      { en: 'Bladder irritation from the medicine placed in the bladder.', ar: 'تهيّج المثانة بسبب الدواء الموضوع داخلها.' },
    ],
    anaesthesia: GA_SPINAL,
    source: { label: 'BAUS patient information (TURBT)', url: 'https://www.baus.org.uk/patients/information_leaflets/' },
  },

  {
    id: 'semi-rigid-urs',
    name: {
      en: 'Semi-rigid ureteroscopy — Telescopic treatment of a ureteric stone',
      ar: 'تنظير الحالب شبه الصلب — علاج حصوة الحالب بالمنظار',
    },
    description: {
      en: 'A telescope is passed through the urethra and bladder into the ureter to break the stone with a laser or remove it with a basket. A temporary internal tube (stent) may be left to help the kidney drain.',
      ar: 'يُدخَل منظار عبر مجرى البول والمثانة إلى الحالب لتفتيت الحصوة بالليزر أو إزالتها بالسلة، وقد تُترَك أنبوبة داخلية مؤقتة (دعامة) لمساعدة الكلية على التصريف.',
    },
    benefits: [
      { en: 'Removes or breaks up the stone.', ar: 'إزالة الحصوة أو تفتيتها.' },
      { en: 'Relieves pain and blockage of the kidney.', ar: 'تخفيف الألم وانسداد الكلية.' },
    ],
    alternatives: [
      { en: 'Waiting for the stone to pass, with pain relief and medicines.', ar: 'انتظار نزول الحصوة مع المسكنات والأدوية.' },
      { en: 'Shockwave lithotripsy from outside the body.', ar: 'تفتيت الحصوة بالموجات التصادمية من خارج الجسم.' },
      { en: 'A drain or stent first, with stone treatment later.', ar: 'تركيب أنبوب تصريف أو دعامة أولاً، ثم علاج الحصوة لاحقاً.' },
    ],
    complications: [
      { en: 'The stone may move up into the kidney, needing a flexible telescope to finish.', ar: 'قد تنتقل الحصوة إلى الكلية، مما يستدعي استخدام منظار مرن لإكمال العلاج.' },
      { en: 'Urinary infection or sepsis — the risk is higher with an infected or blocking stone.', ar: 'التهاب المسالك البولية أو الإنتان — ويزداد الخطر مع الحصوة الملتهبة أو المسبّبة للانسداد.' },
      { en: 'Injury to the ureter; rarely a serious tear that needs reconstructive surgery.', ar: 'إصابة في الحالب؛ ونادراً تمزّق خطير يحتاج إلى جراحة ترميمية.' },
      { en: 'Stent discomfort — loin or bladder pain, burning, frequency and blood in the urine.', ar: 'انزعاج من الدعامة — ألم في الخاصرة أو المثانة، وحرقة، وتكرار في التبول، ودم في البول.' },
      { en: 'Stone fragments may remain and need further treatment; later narrowing of the ureter.', ar: 'قد تبقى أجزاء من الحصوة وتحتاج علاجاً إضافياً؛ وقد يحدث تضيّق في الحالب لاحقاً.' },
    ],
    anaesthesia: GA_SPINAL,
    source: { label: 'BAUS patient information (ureteroscopy)', url: 'https://www.baus.org.uk/patients/information_leaflets/' },
  },

  {
    id: 'pcnl',
    name: {
      en: 'PCNL — Keyhole removal of kidney stones through the back',
      ar: 'استخراج حصوات الكلية عبر الجلد بالمنظار (PCNL)',
    },
    description: {
      en: 'A tunnel is made through the skin of the back into the kidney, guided by X-ray or ultrasound, and the stone is broken and removed through a telescope. A drain tube may be left in the kidney afterwards.',
      ar: 'يُفتَح ممرّ عبر جلد الظهر إلى الكلية بتوجيه الأشعة السينية أو الصوتية، وتُفتَّت الحصوة وتُستخرَج بالمنظار. وقد يُترَك أنبوب تصريف في الكلية بعد العملية.',
    },
    benefits: [
      { en: 'Clears large or complex kidney stones.', ar: 'إزالة حصوات الكلية الكبيرة أو المعقّدة.' },
      { en: 'A higher chance of becoming stone-free than other methods for large stones.', ar: 'فرصة أعلى للتخلّص من الحصوة مقارنةً بالطرق الأخرى في حالة الحصوات الكبيرة.' },
    ],
    alternatives: [
      { en: 'Ureteroscopy, which may need several sessions for a large stone.', ar: 'تنظير الحالب والكلية، وقد يتطلب عدة جلسات للحصوة الكبيرة.' },
      { en: 'Shockwave lithotripsy, which is less effective for large stones.', ar: 'التفتيت بالموجات التصادمية، وهو أقل فعالية للحصوات الكبيرة.' },
      { en: 'Leaving the stone, with the risk of pain, infection and kidney damage.', ar: 'ترك الحصوة، مع خطر الألم والالتهاب وتضرّر الكلية.' },
    ],
    complications: [
      { en: 'Bleeding — the main risk; may need a transfusion or a procedure to block the bleeding vessel.', ar: 'النزيف — وهو الخطر الرئيسي؛ وقد يستدعي نقل دم أو إجراءً لسدّ الوعاء النازف.' },
      { en: 'Infection or severe infection (sepsis) after the operation.', ar: 'التهاب أو التهاب شديد (إنتان) بعد العملية.' },
      { en: 'Leakage of urine from the kidney.', ar: 'تسرّب البول من الكلية.' },
      { en: 'Injury to the lining of the lung, with fluid or air around the lung — mainly when the kidney is entered high up.', ar: 'إصابة غشاء الرئة مع تجمّع سوائل أو هواء حولها — خاصةً عند الدخول من الجزء العلوي للكلية.' },
      { en: 'Injury to nearby organs — bowel, spleen or liver.', ar: 'إصابة الأعضاء المجاورة — الأمعاء أو الطحال أو الكبد.' },
      { en: 'Stone fragments may remain, needing another procedure.', ar: 'قد تبقى أجزاء من الحصوة، مما يستدعي إجراءً آخر.' },
      { en: 'Loss of kidney function, or a collection of urine around the kidney.', ar: 'فقدان جزء من وظيفة الكلية، أو تجمّع البول حول الكلية.' },
    ],
    anaesthesia: GA_SPINAL,
    source: { label: 'BAUS patient information (PCNL)', url: 'https://www.baus.org.uk/patients/information_leaflets/' },
  },

  {
    id: 'eswl',
    name: {
      en: 'Shockwave lithotripsy (ESWL) — Breaking stones from outside the body',
      ar: 'تفتيت الحصوات بالموجات التصادمية من خارج الجسم (ESWL)',
    },
    description: {
      en: 'Focused shockwaves are passed through the skin to break a kidney or ureteric stone into small pieces, which then pass in the urine. The stone is located with X-ray or ultrasound, and no cut is made.',
      ar: 'تُوجَّه موجات تصادمية مركّزة عبر الجلد لتفتيت حصوة الكلية أو الحالب إلى قطع صغيرة تخرج مع البول، ويُحدَّد مكان الحصوة بالأشعة السينية أو الصوتية دون أي جرح.',
    },
    benefits: [
      { en: 'Treats the stone without surgery or a cut.', ar: 'علاج الحصوة دون جراحة أو جرح.' },
    ],
    alternatives: [
      { en: 'Ureteroscopy with laser.', ar: 'تنظير الحالب مع التفتيت بالليزر.' },
      { en: 'PCNL for large stones.', ar: 'استخراج الحصوة عبر الجلد للحصوات الكبيرة.' },
      { en: 'Waiting for a small stone to pass.', ar: 'انتظار نزول الحصوة إذا كانت صغيرة.' },
    ],
    complications: [
      { en: 'Blood in the urine — almost everyone, usually settling quickly.', ar: 'دم في البول — لدى الجميع تقريباً، ويزول غالباً بسرعة.' },
      { en: 'Pain (colic) as the fragments pass.', ar: 'ألم (مغص) أثناء نزول أجزاء الحصوة.' },
      { en: 'Fragments can block the ureter and may need a stent or ureteroscopy.', ar: 'قد تسدّ الأجزاء المتفتتة الحالب، وقد يلزم تركيب دعامة أو إجراء تنظير.' },
      { en: 'Bruising or a blood collection around the kidney.', ar: 'كدمة أو تجمّع دموي حول الكلية.' },
      { en: 'Urinary infection or sepsis, especially with an infected stone.', ar: 'التهاب المسالك البولية أو الإنتان، خاصةً مع الحصوة الملتهبة.' },
      { en: 'The stone may not break, or pieces may remain, needing more sessions or another treatment.', ar: 'قد لا تتفتّت الحصوة أو تبقى منها أجزاء، مما يستدعي جلسات إضافية أو علاجاً آخر.' },
    ],
    anaesthesia: ANALGESIA_SEDATION,
    source: { label: 'BAUS patient information (shockwave lithotripsy)', url: 'https://www.baus.org.uk/patients/information_leaflets/' },
  },

  {
    id: 'optical-urethrotomy',
    name: {
      en: 'Optical urethrotomy — Telescopic cut of a urethral narrowing',
      ar: 'شقّ تضيّق الإحليل بالمنظار (Optical urethrotomy)',
    },
    description: {
      en: 'A telescope is passed into the urethra and the narrowed segment (stricture) is cut open under direct vision. A catheter may be left in afterwards.',
      ar: 'يُدخَل منظار في مجرى البول ويُشَقّ الجزء المتضيّق تحت الرؤية المباشرة، وقد تُترَك قسطرة بعد العملية.',
    },
    benefits: [
      { en: 'Improves the urine flow.', ar: 'تحسين تدفّق البول.' },
      { en: 'A shorter, simpler procedure than reconstructive surgery.', ar: 'إجراء أقصر وأبسط من الجراحة الترميمية.' },
    ],
    alternatives: [
      { en: 'Urethroplasty — surgical reconstruction of the urethra, with a much higher long-term success.', ar: 'رأب الإحليل — ترميم الإحليل جراحياً، ونسبة نجاحه على المدى الطويل أعلى بكثير.' },
      { en: 'Regular stretching (dilation) of the urethra.', ar: 'التوسيع المنتظم للإحليل.' },
      { en: 'No treatment, accepting a poor flow and the risk of being unable to pass urine.', ar: 'عدم العلاج، مع قبول ضعف التدفّق وخطر احتباس البول.' },
    ],
    complications: [
      { en: 'The narrowing comes back — the main problem; success is only about 35–70% even for short strictures, and lower for longer ones.', ar: 'عودة التضيّق — وهي المشكلة الرئيسية؛ إذ تتراوح نسبة النجاح بين 35 و70% تقريباً حتى في التضيّقات القصيرة، وتقلّ في الأطول.' },
      { en: 'Bleeding from the urethra.', ar: 'نزيف من الإحليل.' },
      { en: 'Leakage of irrigation fluid into the tissues.', ar: 'تسرّب سائل الغسيل إلى الأنسجة.' },
      { en: 'Urinary infection.', ar: 'التهاب المسالك البولية.' },
      { en: 'Incontinence if the cut reaches the sphincter muscle (uncommon).', ar: 'سلس البول إذا امتدّ الشقّ إلى العضلة العاصرة (غير شائع).' },
      { en: 'Erection problems (uncommon).', ar: 'مشكلات في الانتصاب (غير شائعة).' },
      { en: 'Needing reconstructive surgery (urethroplasty) later.', ar: 'الحاجة لاحقاً إلى جراحة ترميمية (رأب الإحليل).' },
    ],
    anaesthesia: GA_SPINAL,
    source: { label: 'BAUS patient information (optical urethrotomy)', url: 'https://www.baus.org.uk/patients/information_leaflets/' },
  },

  // ── Pediatric, added 2026-10. Complications and frequencies summarised from
  //    Campbell-Walsh-Wein 12th ed (ch 44, 45, 42); written for parents.
  {
    id: 'circumcision',
    name: {
      en: 'Circumcision — Removal of the foreskin',
      ar: 'الختان — إزالة القلفة (جلدة رأس القضيب)',
    },
    description: {
      en: 'The foreskin covering the head of the penis is removed and the skin edges are closed. It is postponed if the child has hypospadias, a curved, buried or webbed penis, or a bleeding disorder, because the foreskin may be needed for a later repair.',
      ar: 'تُزال الجلدة التي تغطي رأس القضيب وتُخاط حواف الجلد. ويُؤجَّل الختان إذا كان لدى الطفل إحليل تحتي أو انحناء في القضيب أو قضيب مدفون أو ملتصق بالصفن أو اضطراب في تخثّر الدم، لأن القلفة قد تلزم لعملية إصلاح لاحقة.',
    },
    benefits: [
      { en: 'Treats a tight foreskin (phimosis), repeated foreskin infections or lichen sclerosus (BXO).', ar: 'علاج ضيق القلفة، أو التهاباتها المتكررة، أو التصلّب الحزازي (BXO).' },
      { en: 'Lowers the risk of urinary infection in infancy and of balanitis.', ar: 'تقليل خطر التهاب المسالك البولية في سن الرضاعة والتهاب الحشفة.' },
      { en: 'Lowers the lifetime risk of penile cancer and of some sexually transmitted infections.', ar: 'تقليل خطر الإصابة بسرطان القضيب وببعض الأمراض المنقولة جنسياً على مدى الحياة.' },
    ],
    alternatives: [
      { en: 'Leaving the foreskin and keeping it clean — most tight foreskins loosen on their own with age.', ar: 'ترك القلفة مع العناية بنظافتها — فمعظم حالات ضيق القلفة تتحسّن تلقائياً مع العمر.' },
      { en: 'Steroid cream for a tight foreskin (works in about 70–80%).', ar: 'كريم الكورتيزون لضيق القلفة (ينجح في نحو 70–80% من الحالات).' },
      { en: 'Foreskin-preserving surgery (preputioplasty) in selected cases.', ar: 'جراحة توسيع القلفة مع الحفاظ عليها في حالات مختارة.' },
    ],
    complications: [
      { en: 'Overall, complications follow 0.2–5% of circumcisions.', ar: 'تحدث المضاعفات إجمالاً في 0.2–5% من عمليات الختان.' },
      { en: 'Bleeding — the most common (about 1 in 1000); usually stops with pressure, occasionally needs a stitch or cautery.', ar: 'النزيف — الأكثر شيوعاً (نحو حالة من كل 1000)؛ يتوقف عادةً بالضغط، وقد يحتاج أحياناً إلى غرزة أو كيّ.' },
      { en: 'Wound infection (rare).', ar: 'التهاب الجرح (نادر).' },
      { en: 'Too much or too little skin removed, or an uneven result, which may need a revision under general anaesthesia.', ar: 'إزالة جلد أكثر أو أقل من اللازم أو نتيجة غير متناسقة، وقد يستدعي ذلك عملية تصحيح تحت التخدير العام.' },
      { en: 'Adhesions or skin bridges between the head and the shaft of the penis.', ar: 'التصاقات أو جسور جلدية بين رأس القضيب وجسمه.' },
      { en: 'Narrowing of the urinary opening (meatal stenosis): a thin or upward stream or pain on passing urine; may need a small procedure.', ar: 'تضيّق فتحة البول: تيّار بول رفيع أو متّجه للأعلى أو ألم عند التبول، وقد يحتاج إلى إجراء بسيط.' },
      { en: 'A penis "trapped" in scar tissue, mostly after excess skin removal.', ar: 'انحباس القضيب داخل نسيج ندبي، غالباً بعد إزالة جلد زائد.' },
      { en: 'Injury to the head of the penis or the urethra (very rare but serious).', ar: 'إصابة رأس القضيب أو مجرى البول (نادرة جداً لكنها خطيرة).' },
    ],
    anaesthesia: {
      en: 'Newborns: local anaesthetic (injection or cream). Older children: general anaesthesia, whose risks the anaesthetist discusses with the parents separately.',
      ar: 'حديثو الولادة: تخدير موضعي (حقنة أو كريم). الأطفال الأكبر: تخدير عام، ويناقش طبيب التخدير مخاطره مع الوالدين بشكل منفصل.',
    },
    source: { label: 'Campbell-Walsh-Wein Urology 12th ed, ch 44 (Palmer & Palmer)', url: 'https://search.worldcat.org/search?q=ti%3ACampbell-Walsh-Wein+urology+twelfth+edition' },
  },

  {
    id: 'hypospadias-repair',
    name: {
      en: 'Hypospadias repair — Reconstruction of the urinary channel',
      ar: 'إصلاح الإحليل التحتي (المبال التحتاني) — إعادة بناء مجرى البول',
    },
    description: {
      en: 'An operation to bring the urinary opening to the tip of the penis, straighten any bend, and reshape the head of the penis and the skin. Severe forms may be repaired in two stages. A catheter or stent is usually left in for some days afterwards.',
      ar: 'عملية لنقل فتحة البول إلى رأس القضيب، وتصحيح أي انحناء، وإعادة تشكيل رأس القضيب والجلد. وقد تُجرى الحالات الشديدة على مرحلتين. وتُترك عادةً قسطرة أو دعامة لبضعة أيام بعد العملية.',
    },
    benefits: [
      { en: 'A straight, forward urinary stream, allowing him to pass urine standing.', ar: 'تيّار بول مستقيم إلى الأمام، يُمكّنه من التبول واقفاً.' },
      { en: 'A straight penis for future sexual function.', ar: 'قضيب مستقيم من أجل الوظيفة الجنسية مستقبلاً.' },
      { en: 'A more typical appearance of the penis.', ar: 'مظهر أقرب للطبيعي للقضيب.' },
    ],
    alternatives: [
      { en: 'One-stage or two-stage repair, chosen according to the severity.', ar: 'إصلاح على مرحلة واحدة أو على مرحلتين بحسب شدة الحالة.' },
      { en: 'No surgery, accepting a stream that may spray or point downward and any remaining bend.', ar: 'عدم إجراء الجراحة، مع قبول تيّار بول قد يتناثر أو يتّجه للأسفل وبقاء أي انحناء.' },
    ],
    complications: [
      { en: 'A fistula — a second hole where urine leaks — the most common (just under 1 in 10); usually repaired at least 6–12 months later, and can recur (about 1 in 5).', ar: 'الناسور — فتحة ثانية يتسرّب منها البول — وهو الأكثر شيوعاً (أقل بقليل من حالة من كل 10)؛ ويُصلَح عادةً بعد 6–12 شهراً على الأقل، وقد يتكرر (نحو حالة من كل 5).' },
      { en: 'Breakdown of the head-of-penis repair, so the opening falls back.', ar: 'انفتاح ترميم رأس القضيب فتعود الفتحة إلى الخلف.' },
      { en: 'Narrowing of the new opening or the new channel (meatal stenosis or stricture), causing straining or a weak stream.', ar: 'تضيّق الفتحة الجديدة أو القناة الجديدة، مما يسبب الحزق أو ضعف التيّار.' },
      { en: 'A pouch in the new channel (diverticulum) causing ballooning, dribbling or infection.', ar: 'جيب في القناة الجديدة (رتج) يسبب انتفاخاً أو تقطيراً أو التهاباً.' },
      { en: 'Some bend remaining or returning, or skin excess or twisting.', ar: 'بقاء جزء من الانحناء أو عودته، أو زيادة في الجلد أو التواء.' },
      { en: 'Bleeding, swelling or infection of the wound.', ar: 'نزيف أو تورّم أو التهاب في الجرح.' },
      { en: 'Further operations may be needed; the more severe the hypospadias, the higher the risk of complications.', ar: 'قد تلزم عمليات إضافية؛ وكلما كانت الحالة أشد زادت احتمالية المضاعفات.' },
    ],
    anaesthesia: {
      en: 'General anaesthesia. The anaesthetist discusses its risks with the parents separately.',
      ar: 'تخدير عام. يناقش طبيب التخدير مخاطره مع الوالدين بشكل منفصل.',
    },
    source: { label: 'Campbell-Walsh-Wein Urology 12th ed, ch 45 (Long, Zaontz & Canning)', url: 'https://search.worldcat.org/search?q=ti%3ACampbell-Walsh-Wein+urology+twelfth+edition' },
  },

  {
    id: 'pyeloplasty',
    name: {
      en: 'Pyeloplasty — Repair of a blocked kidney outlet (PUJ obstruction)',
      ar: 'رأب الحويضة — إصلاح انسداد مخرج الكلية (تضيّق الوصل الحويضي الحالبي)',
    },
    description: {
      en: 'The narrowed junction between the kidney’s collecting area (pelvis) and the ureter is removed and the two ends are rejoined so urine drains freely. It can be done through a small incision or by keyhole (laparoscopic or robotic) surgery. A stent or drain is usually left temporarily to protect the join.',
      ar: 'يُستأصل الجزء المتضيّق عند اتصال حوض الكلية بالحالب ويُعاد وصل الطرفين ليتصرّف البول بحرّية. ويمكن إجراؤها عبر شقّ صغير أو بالمنظار (جراحة منظارية أو روبوتية). وتُترك عادةً دعامة أو أنبوب تصريف مؤقت لحماية مكان الوصل.',
    },
    benefits: [
      { en: 'Relieves the blockage and protects the kidney’s function.', ar: 'تخفيف الانسداد وحماية وظيفة الكلية.' },
      { en: 'Relieves pain and reduces infections caused by the blockage.', ar: 'تخفيف الألم وتقليل الالتهابات الناتجة عن الانسداد.' },
      { en: 'High success — between 90% and 100% in published series.', ar: 'نسبة نجاح عالية — بين 90% و100% في الدراسات المنشورة.' },
    ],
    alternatives: [
      { en: 'Continued monitoring with ultrasound and kidney scans — many dilated kidneys improve without surgery.', ar: 'الاستمرار في المتابعة بالأشعة الصوتية والمسح الذري للكلى — فكثير من حالات توسّع الكلية تتحسّن دون جراحة.' },
      { en: 'Temporary drainage through the skin (nephrostomy) when urgent drainage is needed.', ar: 'تصريف مؤقت عبر الجلد (فغر الكلية) عند الحاجة إلى تصريف عاجل.' },
      { en: 'Endoscopic widening (balloon or incision) — less successful, mainly used if a repair narrows again.', ar: 'التوسيع بالمنظار (بالبالون أو الشقّ) — نجاحه أقل، ويُستخدم غالباً إذا عاد التضيّق بعد الإصلاح.' },
    ],
    complications: [
      { en: 'Bleeding during or after surgery.', ar: 'نزيف أثناء العملية أو بعدها.' },
      { en: 'Urine leaking from the join (the stent is used to reduce this).', ar: 'تسرّب البول من مكان الوصل (تُستخدم الدعامة لتقليل ذلك).' },
      { en: 'Infection, pain, or temporary blockage from swelling or clots, sometimes needing a temporary drain into the kidney.', ar: 'التهاب أو ألم أو انسداد مؤقت بسبب التورّم أو الجلطات، وقد يستدعي أحياناً أنبوب تصريف مؤقت في الكلية.' },
      { en: 'An internal (double-J) stent needs a second anaesthetic to remove; an external stent is usually pulled out on the ward after 7–14 days.', ar: 'الدعامة الداخلية (Double-J) تحتاج إلى تخدير آخر لإزالتها؛ أما الدعامة الخارجية فتُسحب عادةً في الجناح بعد 7–14 يوماً.' },
      { en: 'Conversion from keyhole to open surgery, most often because of bleeding.', ar: 'التحوّل من الجراحة بالمنظار إلى الجراحة المفتوحة، وغالباً بسبب النزيف.' },
      { en: 'The narrowing coming back or kidney function not improving, which may need a further procedure or a repeat operation.', ar: 'عودة التضيّق أو عدم تحسّن وظيفة الكلية، مما قد يستدعي إجراءً إضافياً أو إعادة العملية.' },
    ],
    anaesthesia: {
      en: 'General anaesthesia. The anaesthetist discusses its risks with the parents separately.',
      ar: 'تخدير عام. يناقش طبيب التخدير مخاطره مع الوالدين بشكل منفصل.',
    },
    source: { label: 'Campbell-Walsh-Wein Urology 12th ed, ch 42 (Olsen & Rawashdeh)', url: 'https://search.worldcat.org/search?q=ti%3ACampbell-Walsh-Wein+urology+twelfth+edition' },
  },
];
