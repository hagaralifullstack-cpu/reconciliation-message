export type FeelingChoice = 'bothered' | 'hurt' | 'angry';

export type UpsetLevel = 1 | 2 | 3;

export interface JourneyConfig {
  senderName: string;
  recipientName: string;
  mistake: string;
  specialMemory: string;
}

export const DEFAULT_APOLOGY_TEXT = `أنا حابة أعتذر لحضرتك عن الكلام اللي صدر مني، وعارفة إني غلطت جدًا في حق حضرتك، ومهما كان سبب زعلي أو ضيقي من التغيير اللي حصل في التعامل، ده ميدينيش الحق إني أقول كلام جارح أو أوصف حضرتك بصفات مش من حقي أحكم بيها.

أنا وقتها اتكلمت بانفعال ومن غير ما أفكر في أثر كلامي، وخصوصًا لما قلت إن حضرتك شخص مؤذي وإن أنا بكرهك، ودي كانت كلمات قاسية ومش في محلها، وأنا فعلًا ندمانة إني قولتها.

يمكن كان عندي عتاب أو استغراب من اللي حصل، وكان المفروض أعبّر عن ده بطريقة أرقى وأهدى من كده.

أنا مش ببعت لحضرتك علشان أفرض عليك الرد أو أطلب منك تتجاوز اللي حصل، لكن علشان من حق حضرتك تسمع مني اعتذار واضح وصريح، خصوصًا إن كان بينا احترام وتقدير، وأنا مكنتش أحب إن الكلام اللي صدر مني يكون آخر حاجة تفضل في ذاكرتك عني.

أتمنى تتقبل اعتذاري، وأتمنى لحضرتك كل خير واحترام وتقدير.`;

export const DEFAULT_CONFIG: JourneyConfig = {
  senderName: 'حبيبه',
  recipientName: 'خالد',
  mistake: DEFAULT_APOLOGY_TEXT,
  specialMemory:
    'كل احترام وتقدير بينا، ومواقفك المحترمة اللي عمري ما كنت أتمنى أنسى قيمتها في لحظة انفعال.',
};

export const MISTAKE_PRESETS: { id: string; title: string; text: string }[] = [
  {
    id: 'sincere',
    title: 'الاعتذار الصريح الكامل',
    text: DEFAULT_APOLOGY_TEXT,
  },
  {
    id: 'words',
    title: 'كلام انفعالي في وقت غضب',
    text: 'أنا حابة أعتذر لحضرتك عن الكلام القاسي اللي قلته وقت انفعالي. مكانش يصح أبداً أتكلم بالطريقة دي مهما كنت متضايقة، وحق حضرتك عليا بكل احترام.',
  },
  {
    id: 'misunderstanding',
    title: 'عتاب بأسلوب غير مناسب',
    text: 'يمكن كان جوايا عتاب أو ضيق من التغيير في التعامل، بس مكانش من حقي أعبّر عنه بكلام جارح. الاعتذار واجب، وتقدير حضرتك عندي كبير.',
  },
  {
    id: 'respect',
    title: 'حفظ الاحترام والتقدير',
    text: 'ببعت لحضرتك الاعتذار ده عشان مكنتش أحب إن الكلام اللي فات يكون آخر صورة في ذاكرتك عني، ولأن بينا احترام وتقدير يستاهلوا الكلمة الطيبة.',
  },
];

export const UPSET_LEVELS: { level: UpsetLevel; label: string; replyExtra: string }[] = [
  {
    level: 1,
    label: 'متضايق شوية',
    replyExtra: 'ومع ذلك وجود أي ضيقة في خاطر حضرتك يهمني جداً وميعديش من غير اعتذار صريح.',
  },
  {
    level: 2,
    label: 'زعلان بجد',
    replyExtra: 'ومقدّرة تماماً إن الكلمات القاسية بتسيب أثر، وعشان كده بعتذر لحضرتك بوضوح ومن غير تبرير.',
  },
  {
    level: 3,
    label: 'متجرح وزعلان جداً',
    replyExtra: 'ولحضرتك كل الحق في ده، وأنا فعلاً ندمانة على الانفعال ومتمسكة إن الاعتذار يوصلك بكل احترام.',
  },
];

export const FEELING_RESPONSES: Record<
  FeelingChoice,
  {
    label: string;
    description: string;
    replyTitle: string;
    replyBody: (recipient: string, sender: string) => string;
  }
> = {
  bothered: {
    label: 'اتضايقت',
    description: 'الأسلوب والكلام كانوا تقال ومزعجين',
    replyTitle: 'حق حضرتك عليا في أي ضيقة اتسببت فيها',
    replyBody: (recipient, sender) =>
      `يا ${recipient}، أنا عارفة إن الكلام اللي صدر مني كان تقيل ومش في محله، وحق حضرتك تزعل وتتضايق. ${sender} بتعتذر بوضوح ومن غير ما تفرض على حضرتك رد، بس احترامك يهمها جداً.`,
  },
  hurt: {
    label: 'اتجرحت',
    description: 'الكلمات كانت قاسية ومكنش يصح تتقال',
    replyTitle: 'آسفة بجد على كل كلمة جرحت خاطر حضرتك',
    replyBody: (recipient, sender) =>
      `سلامة خاطر حضرتك يا ${recipient}. الكلمات اللي اتقالت وقت الانفعال كانت قاسية جداً ومش لايقة بيك ولا بالتقدير اللي كان بينا. ${sender} ندمانة عليها فعلاً وحبت تعتذرلك بصدق.`,
  },
  angry: {
    label: 'اتعصبت',
    description: 'الحكم والوصف مكانش من حقي أبداً',
    replyTitle: 'لحضرتك كل الحق، وأنا بستقبل ده بكل احترام',
    replyBody: (recipient, sender) =>
      `عند حضرتك كل الحق يا ${recipient}. مهما كان سبب ضيقي، مكنش من حقي أوصف حضرتك بصفات مش فيك ولا أتكلم بانفعال. ${sender} معترفة بغلطتها كاملة ومقدّرة حجم زعلك.`,
  },
};

export const EXCUSES_BUBBLES: { id: string; text: string; tone: string }[] = [
  { id: 'angry-moment', text: 'كنت متعصبة ومنفعلة', tone: 'bg-rose-50 border-rose-200 text-rose-950' },
  { id: 'changed', text: 'كنت متضايقة من تغيير التعامل', tone: 'bg-amber-50 border-amber-200 text-amber-950' },
  { id: 'unintended', text: 'كلام طلع من غير تفكير', tone: 'bg-sky-50 border-sky-200 text-sky-950' },
  { id: 'reproach', text: 'كان جوايا عتاب واستغراب', tone: 'bg-violet-50 border-violet-200 text-violet-950' },
  { id: 'timing', text: 'لحظة انفعال وعدت', tone: 'bg-teal-50 border-teal-200 text-teal-950' },
];

export const PROMISE_CARDS: { id: string; title: string; detail: string }[] = [
  {
    id: 'calm',
    title: 'التعبير بهدوء ورُقي',
    detail: 'لو في عتاب أو استغراب، أعبّر عنه بأرقى وأهدى طريقة من غير انفعال.',
  },
  {
    id: 'respect',
    title: 'حفظ الاحترام والتقدير',
    detail: 'مهما حصل خلاف، يفضل الاحترام والتقدير خط أحمر لا يُمس.',
  },
  {
    id: 'words',
    title: 'كلام بحساب وتفكير',
    detail: 'أفكر في أثر كل كلمة قبل ما أقولها ومجرحش خاطر حضرتك أبداً.',
  },
  {
    id: 'listen',
    title: 'الهدوء وقت الضيق',
    detail: 'آخد نفسي وأهدى قبل الكلام بدل التسرع في لحظة غضب.',
  },
  {
    id: 'memory',
    title: 'تغليب العِشرة الطيبة',
    detail: 'تفضل الذكرى الكويسة والاحترام هما الأساس في تعاملنا.',
  },
  {
    id: 'space',
    title: 'احترام مساحتك وقرارك',
    detail: 'من غير ضغط أو فرض أي رد، التقدير دايماً موجود في كل الأحوال.',
  },
];

export const REMOTE_GIFT_OPTIONS: { id: string; label: string }[] = [
  { id: 'delivery', label: 'أوردر قهوة أو حاجة تحبها يوصلك دليفري' },
  { id: 'online-gift', label: 'كتاب أو هدية رمزية توصل لحضرتك أونلاين' },
  { id: 'voucher', label: 'كارت شحن أو اشتراك تطبيق بتحبه' },
  { id: 'call', label: 'مكالمة رايقة أو قعدة كلام صافي عن بُعد' },
];

export const MUTUAL_APOLOGY_PRESETS: string[] = [
  'الاعتذار مقبول، والمواقف بتعدي والاحترام بيفضل.',
  'مفيش حاجة في نفسي، وأنا كمان بقدّر صراحتك واعتذارك.',
  'نفتح صفحة صافية أساسها الهدوء والتقدير المتبادل.',
  'حصل خير، وربنا يكتبلك كل خير واحترام دايماً.',
];

export const SCENE_LABELS = [
  'تجهيز الرسالة',
  'الاعتراف',
  'أنا فاهم زعلك',
  'مفيش أعذار',
  'برطمان الوعود',
  'كارت التعويض',
  'الصلح',
  'شهادة الصلح',
];

export function buildShareUrl(origin: string, config: JourneyConfig): string {
  const params = new URLSearchParams();
  params.set('from', config.senderName.trim() || DEFAULT_CONFIG.senderName);
  params.set('to', config.recipientName.trim() || DEFAULT_CONFIG.recipientName);
  if (config.mistake.trim() && config.mistake.trim() !== DEFAULT_APOLOGY_TEXT.trim()) {
    params.set('mistake', config.mistake.trim());
  }
  if (
    config.specialMemory.trim() &&
    config.specialMemory.trim() !== DEFAULT_CONFIG.specialMemory.trim()
  ) {
    params.set('memory', config.specialMemory.trim());
  }
  params.set('gift', '1');
  return `${origin}/?${params.toString()}`;
}
