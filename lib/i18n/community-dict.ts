import type { Locale } from './types';

export type CommunityDict = {
  ageGate: {
    title: string;
    body: string;
    confirm: string;
    deny: string;
  };
  nav: {
    history: string;
    questions: string;
    medical: string;
    crush: string;
    positions: string;
    conversation: string;
    chat: string;
    messages: string;
    profile: string;
    submit: string;
    zodiac: string;
    points: string;
    premium: string;
  };
  bottomNav: {
    home: string;
    chat: string;
    messages: string;
    profile: string;
  };
  home: {
    badge: string;
    title: string;
    lead: string;
    ctaStory: string;
    ctaChat: string;
    ctaStoryHint: string;
    pill: string;
    sectionTitle: string;
    sectionLead: string;
    topStory: string;
    latestStories: string;
    writeYours: string;
    noStories: string;
    beFirst: string;
    randomPicks: string;
    categories: string;
    statsStories: string;
    statsOnline: string;
    statsMembers: string;
    statsComments: string;
    statsLastReg: string;
    premiumBannerTitle: string;
    premiumBannerDesc: string;
    premiumBannerBtn: string;
    sidebarQuickTitle: string;
    actionSubmit: string;
    actionChat: string;
    actionConversation: string;
    actionMessages: string;
    actionQuestions: string;
    actionMedical: string;
    actionCrush: string;
    actionPositions: string;
    actionZodiac: string;
    modules: { href: string; icon: string; label: string }[];
  };
  history: {
    title: string;
    lead: string;
    disclaimer: string;
    search: string;
    searchPlaceholder: string;
    popular: string;
    addStory: string;
    noStories: string;
    tagsAuthOnly: string;
    filterTags: string;
  };
  questions: {
    title: string;
    lead: string;
    sortNew: string;
    sortActive: string;
    sortPoints: string;
    addPost: string;
    loginToPost: string;
    noPosts: string;
  };
  medical: {
    title: string;
    lead: string;
    noArticles: string;
  };
  crush: {
    title: string;
    lead: string;
    regionFilter: string;
    allRegions: string;
    addEntry: string;
    loginToAdd: string;
    connectVia: string;
    noEntries: string;
  };
  positions: {
    title: string;
    lead: string;
    loginRequired: string;
    search: string;
    noItems: string;
  };
  zodiac: {
    title: string;
    lead: string;
    sign1: string;
    sign2: string;
    check: string;
    result: string;
  };
  conversation: {
    title: string;
    lead: string;
    loginRequired: string;
  };
  chat: {
    title: string;
    lead: string;
    premiumRequired: string;
    premiumBtn: string;
    loginRequired: string;
    sendPlaceholder: string;
    send: string;
  };
  messages: {
    title: string;
    lead: string;
    premiumRequired: string;
    startDm: string;
    selectMember: string;
    loginRequired: string;
    dmWith: string;
  };
  user: {
    subscription: string;
    points: string;
    stories: string;
    comments: string;
    giftPoints: string;
    verified: string;
    premium: string;
  };
  points: {
    title: string;
    lead: string;
    storyAdd: string;
    storyReport: string;
    redeemPremium: string;
    giftPoints: string;
    leaderboard: string;
    freeTier: string;
    premiumTier: string;
  };
  premium: {
    title: string;
    lead: string;
    price: string;
    alreadyMember: string;
    loginToSubscribe: string;
    success: string;
    canceled: string;
    redeemWithPoints: string;
    perks: string[];
    freePerks: string[];
    lockedPerks: string[];
  };
  about: {
    title: string;
    p1: string;
    p2: string;
  };
  rules: {
    title: string;
    items: string[];
  };
  auth: {
    login: string;
    register: string;
    username: string;
    password: string;
    email: string;
    noAccount: string;
    hasAccount: string;
    submitLogin: string;
    submitRegister: string;
  };
  submit: {
    title: string;
    lead: string;
    storyTitle: string;
    category: string;
    tags: string;
    tagsPlaceholder: string;
    body: string;
    bodyPlaceholder: string;
    anonymous: string;
    premiumOnly: string;
    publish: string;
    cancel: string;
    loginRequired: string;
  };
  post: {
    views: string;
    minRead: string;
    by: string;
    anonymous: string;
    premium: string;
    premiumPreview: string;
    notFound: string;
    back: string;
    becomePremium: string;
  };
  comments: {
    title: string;
    add: string;
    placeholder: string;
    anonymous: string;
    post: string;
    reply: string;
    empty: string;
    latest: string;
  };
  online: {
    title: string;
    active: string;
    members: string;
    premiumOnline: string;
    empty: string;
  };
  common: {
    previous: string;
    next: string;
    search: string;
    page: string;
    premiumLock: string;
  };
  footer: {
    modules: string;
    chat: string;
    account: string;
    info: string;
  };
};

const ka: CommunityDict = {
  ageGate: {
    title: 'ასაკის დადასტურება',
    body: 'GEOESKORT სრულწლოვანთათვის განკუთვნილი პლატფორმაა. გასაგრძელებლად დაადასტურეთ, რომ 18 წელზე მეტის ხართ.',
    confirm: 'დიახ, სრულწლოვანი ვარ',
    deny: 'არა, გამოვდივარ',
  },
  nav: {
    history: 'ისტორიები',
    questions: 'კითხვები',
    medical: 'სექსოლოგია',
    crush: 'ქრაში',
    positions: 'პოზები',
    conversation: 'საუბარი',
    chat: 'LIVE ჩათი',
    messages: 'წერილები',
    profile: 'პროფილი',
    submit: 'დამატება',
    zodiac: 'ზოდიაქო',
    points: 'ქულები',
    premium: 'Premium',
  },
  bottomNav: {
    home: 'მთავარი',
    chat: 'ჩათი',
    messages: 'წერილები',
    profile: 'პროფილი',
  },
  home: {
    badge: '+18 • ღია სივრცე სრულწლოვანთათვის',
    title: 'გამოცდილება, რჩევა და საუბარი ერთ პლატფორმაზე',
    lead: 'აქ შეგიძლიათ გაუზიაროთ თქვენი ისტორია, იპოვოთ პასუხები, წაიკითხოთ სასარგებლო სტატიები და გაეცნოთ ახალ ადამიანებს — ყველაფერი ერთ სივრცეში.',
    ctaStory: 'ისტორიის დამატება',
    ctaChat: 'სასაუბრო ოთახი',
    ctaStoryHint: 'გაუზიარე შენი ამბავი საზოგადოებას',
    pill: 'საზოგადოება',
    sectionTitle: 'მთავარი დაფა',
    sectionLead: 'აქ ჩანს უახლესი ისტორიები, აქტიური მომხმარებლები და საუბრის ბოლო ნაკადი.',
    topStory: 'დღის ტოპ ისტორია',
    latestStories: 'ბოლო ისტორიები',
    writeYours: 'შენიც დაწერე →',
    noStories: 'ჯერ არავინ გამოუქვეყნებია ისტორია.',
    beFirst: 'იყავი პირველი →',
    randomPicks: 'შემთხვევითი არჩევანი',
    categories: 'კატეგორიები',
    statsStories: 'ისტორია',
    statsOnline: 'ონლაინ',
    statsMembers: 'წევრი',
    statsComments: 'კომენტარი',
    statsLastReg: 'ბოლო რეგისტრაცია',
    premiumBannerTitle: 'გახსენი Premium-ით',
    premiumBannerDesc: '500 ქულით 30 დღით — შეზღუდული ისტორიები, LIVE ჩათი, პირადი წერილები და რეკლამის გარეშე.',
    premiumBannerBtn: 'გამოწერის ნახვა',
    sidebarQuickTitle: 'სწრაფი ბმულები',
    actionSubmit: '✍️ ისტორიის დამატება',
    actionChat: '💬 LIVE ჩათი',
    actionConversation: '🗣️ სასაუბრო ოთახი',
    actionMessages: '✉️ პირადი წერილები',
    actionQuestions: '❓ კითხვები & რჩევები',
    actionMedical: '🩺 სამედიცინო სექსოლოგია',
    actionCrush: '💕 იპოვე შენი ქრაში',
    actionPositions: '📖 ინტიმური პოზები',
    actionZodiac: '♈ ზოდიაქოს თავსებადობა',
    modules: [
      { href: '/history/', icon: '📚', label: 'ისტორიები' },
      { href: '/questions/', icon: '❓', label: 'კითხვები' },
      { href: '/medical/', icon: '🩺', label: 'სექსოლოგია' },
      { href: '/crush/', icon: '💕', label: 'ქრაში' },
      { href: '/conversationRoom/', icon: '🗣️', label: 'საუბარი' },
      { href: '/chat/', icon: '💬', label: 'LIVE ჩათი' },
      { href: '/messages/', icon: '✉️', label: 'წერილები' },
      { href: '/positionVariants/', icon: '📖', label: 'პოზები' },
      { href: '/zodiac/', icon: '♈', label: 'ზოდიაქო' },
    ],
  },
  history: {
    title: 'ისტორიების კატალოგი',
    lead: 'გაეცანით სხვადასხვა კატეგორიის ისტორიებს, მოძებნეთ საინტერესო თემები და გაუზიარეთ საკუთარი ამბავი.',
    disclaimer:
      'აქ გამოქვეყნებული ამბავები შეიძლება ნამდვილი გამოცდილება იყოს, ფანტაზია ან უბრალოდ ფიქრმავალის პროდუქტი — არაფერს არ აიღებთ სერიოზულად და მორგებით წაიკითხავთ.',
    search: 'ძიება',
    searchPlaceholder: 'სათაური ან ტეგი...',
    popular: 'პოპულარული',
    addStory: 'ახალი ისტორია',
    noStories: 'ამ კატეგორიაში ჯერ არაფერია.',
    tagsAuthOnly: 'ტეგებით გაფილტვრა შესვლის შემდეგ ხელმისაწვდომია.',
    filterTags: 'ტეგები',
  },
  questions: {
    title: 'კითხვები & რჩევები',
    lead: 'დასვი კითხვა, გაუზიარე გამოცდილება ან მოძებნე უკვე განხილული თემები — ფორუმის ფორმატში.',
    sortNew: 'ახალი',
    sortActive: 'აქტიური',
    sortPoints: 'ქულებით',
    addPost: 'პოსტის დაწერა',
    loginToPost: 'პოსტის დასაწერად შესვლა საჭიროა.',
    noPosts: 'ჯერ არავის დაუსვამს კითხვა.',
  },
  medical: {
    title: 'სამედიცინო სექსოლოგია',
    lead: 'სარედაქციო სტატიების ბიბლიოთეკა სექსუალურ ჯანმრთელობაზე, ურთიერთობებსა და სექსოლოგიაზე.',
    noArticles: 'სტატიები მალე დაემატება.',
  },
  crush: {
    title: 'იპოვე შენი ქრაში',
    lead: 'აღწერე ვინ, სად და როდის შეამჩნიე — შესაძლოა იმ ადამიანმაც ამოგიცნოს.',
    regionFilter: 'რეგიონი',
    allRegions: 'ყველა რეგიონი',
    addEntry: 'ჩანაწერის დამატება',
    loginToAdd: 'ჩანაწერის დასამატებლად შესვლა საჭიროა.',
    connectVia: 'დაკავშირება პირადი შეტყობინებით',
    noEntries: 'ამ რეგიონში ჯერ ჩანაწერი არ არის.',
  },
  positions: {
    title: 'ინტიმური პოზები',
    lead: 'პოზების არქივი ილუსტრაციებითა და მოკლე აღწერებით — სრული წვდომა ავტორიზებულ მომხმარებლებს.',
    loginRequired: 'სრული არქივის სანახავად შედით ანგარიშში.',
    search: 'ძიება',
    noItems: 'ჯერ არაფერია დამატებული.',
  },
  zodiac: {
    title: 'ზოდიაქოს თავსებადობა',
    lead: 'აირჩიეთ ორი ზოდიაქოს ნიშანი და ნახეთ, რამდენად ემთხვევა თქვენი წყვილი.',
    sign1: 'პირველი ნიშანი',
    sign2: 'მეორე ნიშანი',
    check: 'შემოწმება',
    result: 'თავსებადობის შეფასება',
  },
  conversation: {
    title: 'სასაუბრო ოთახი',
    lead: 'საჯარო სივრცე თავისუფალი საუბრისთვის — ყველას შეუძლია ჩართვა.',
    loginRequired: 'სასაუბრო ოთახში ჩასართავად შედით ანგარიშში.',
  },
  chat: {
    title: 'LIVE ჩათი',
    lead: 'პირდაპირი ჩათი Premium წევრებისთვის — რეალურ დროში საუბარი.',
    premiumRequired: 'LIVE ჩათი მხოლოდ Premium წევრებს ხელმისაწვდომია.',
    premiumBtn: 'Premium-ის გახსნა',
    loginRequired: 'ჩათში ჩასართავად შედით ანგარიშში.',
    sendPlaceholder: 'დაწერეთ შეტყობინება...',
    send: 'გაგზავნა',
  },
  messages: {
    title: 'პირადი წერილები',
    lead: 'ერთი-ერთთან მიმოწერა — Premium ფუნქცია.',
    premiumRequired: 'პირადი წერილები მხოლოდ Premium წევრებს ხელმისაწვდომია.',
    startDm: 'მიმოწერის დაწყება',
    selectMember: 'აირჩიეთ წევრი საუბრის დასაწყებად.',
    loginRequired: 'წერილების სანახავად შედით ანგარიშში.',
    dmWith: 'მიმოწერა @',
  },
  user: {
    subscription: 'გამოწერა',
    points: 'ქულები',
    stories: 'ისტორია',
    comments: 'კომენტარი',
    giftPoints: 'ქულების ჩუქება',
    verified: 'ვერიფიცირებული',
    premium: 'Premium',
  },
  points: {
    title: 'ქულების წესები',
    lead: 'ქულები იღებთ აქტიური მონაწილეობით — შემდეგ Premium-ს ყიდულობთ ან სხვას უჩუქებთ.',
    storyAdd: 'ისტორიის დამატება',
    storyReport: 'ისტორიის დარეპორტება',
    redeemPremium: 'Premium-ის ყიდვა ქულებით (500 ქულა / 30 დღე)',
    giftPoints: 'ქულების გადაჩუქება (Premium)',
    leaderboard: 'რეიტინგი',
    freeTier: 'უფასო პაკეტი (რეგისტრაციის შემდეგ, 0 ქულა)',
    premiumTier: 'Premium პაკეტი (500 ქულა / 30 დღე)',
  },
  premium: {
    title: 'Premium გამოწერა',
    lead: 'გახსენით ყველა ფუნქცია — შეზღუდული ისტორიები, LIVE ჩათი, პირადი წერილები და მეტი.',
    price: '500 ქულა / 30 დღე',
    alreadyMember: 'თქვენ უკვე Premium წევრი ხართ.',
    loginToSubscribe: 'გამოსაწერად შედით ანგარიშში',
    success: 'კენია! Premium გააქტიურდა 🎉',
    canceled: 'გადახდა გაუქმდა.',
    redeemWithPoints: 'ქულებით გააქტიურება (500 ქულა)',
    perks: [
      'ყველა სტატიისა და შეზღუდული ისტორიის ნახვა',
      'LIVE ჩათი და პირადი მიმოწერა',
      'ვერიფიკაცია და პროფილის ფოტო',
      'ქულების ჩუქება სხვა წევრებს',
      'დამატებითი ფოტოების ატვირთვა',
      'რეკლამის გარეშე და Premium სტატუსი',
    ],
    freePerks: [
      'ისტორიებისა და პოსტების დამატება',
      'ძველი სტატიების ნახვა',
      'საჯარო კომენტარები',
    ],
    lockedPerks: [
      'ახალი და შეზღუდული სტატიები',
      'LIVE ჩათი',
      'პირადი წერილები',
      'პროფილის ფოტოები',
      'რეკლამა ჩანს',
    ],
  },
  about: {
    title: 'ჩვენს შესახებ',
    p1: 'GEOESKORT — ქართულენოვანი 18+ პლატფორმა, სადაც ერთ სივრცეში იკრიბება პირადი ისტორიები, რჩევები, სასარგებლო სტატიები და საუბრის ფუნქციები.',
    p2: 'პლატფორმა მხოლოდ სრულწლოვანთათვისაა განკუთვნილი. გთხოვთ, დაიცვათ პირადი სივრცე და საზოგადოების წესები.',
  },
  rules: {
    title: 'წესები და პირობები',
    items: [
      'მხოლოდ 18+ — არასრულწლოვანთა შესახებ კონტენტი აკრძალულია.',
      'პატივი ეცით თანხმობასა და კონფიდენციალურობას — დევნა და პირადი მონაცემების გამჟღავნება დაუშვებელია.',
      'აკრძალულია უკანონო კონტენტი და სპამი.',
      'ანონიმური გამოქვეყნება დაშვებულია, მაგრამ ბოროტად გამოყენება ბლოკს გამოიწვევს.',
      'Premium მასალაც იგივე წესებს ექვემდებარება.',
    ],
  },
  auth: {
    login: 'შესვლა',
    register: 'რეგისტრაცია',
    username: 'მომხმარებლის სახელი',
    password: 'პაროლი',
    email: 'ელ-ფოსტა (არასავალდებულო)',
    noAccount: 'არ გაქვთ ანგარიში?',
    hasAccount: 'უკვე გაქვთ ანგარიში?',
    submitLogin: 'შესვლა',
    submitRegister: 'რეგისტრაცია',
  },
  submit: {
    title: 'ახალი ისტორია',
    lead: 'გაუზიარეთ თქვენი ამბავი ანონიმურად ან სახელით — კატეგორია და ტეგები დაგეხმარებათ მკითხველებს მოძებნაში.',
    storyTitle: 'სათაური',
    category: 'კატეგორია',
    tags: 'ტეგები (მძიმით გამოყოფილი)',
    tagsPlaceholder: 'რომანტიკა, პირველად',
    body: 'ტექსტი (Markdown)',
    bodyPlaceholder: 'დაწერეთ თქვენი ისტორია...',
    anonymous: 'ანონიმურად გამოქვეყნება',
    premiumOnly: 'მხოლოდ Premium-ისთვის',
    publish: 'გამოქვეყნება',
    cancel: 'გაუქმება',
    loginRequired: 'ისტორიის დასამატებლად შედით ანგარიშში.',
  },
  post: {
    views: 'ნახვა',
    minRead: 'წუთი',
    by: 'ავტორი',
    anonymous: 'ანონიმი',
    premium: 'Premium',
    premiumPreview: '🔒 Premium ისტორია — მხოლოდ წევრებს ჩანს შეკვეთილი',
    notFound: 'ისტორია ვერ მოიძებნა',
    back: '← უკან',
    becomePremium: 'Premium-ის გახსნა',
  },
  comments: {
    title: 'კომენტარები',
    add: 'კომენტარის დამატება',
    placeholder: 'გაგვიზიარეთ აზრი...',
    anonymous: 'ანონიმურად',
    post: 'გამოქვეყნება',
    reply: 'პასუხი',
    empty: 'ჯერ კომენტარი არ არის.',
    latest: 'ბოლო კომენტარები',
  },
  online: {
    title: 'ონლაინ ახლა',
    active: 'აქტიური',
    members: 'წევრი',
    premiumOnline: 'Premium ონლაინ',
    empty: 'ამ წუთას ვინაც არ არის ონლაინ.',
  },
  common: {
    previous: '← წინა',
    next: 'შემდეგი →',
    search: 'ძიება',
    page: 'გვერდი',
    premiumLock: 'ეს მასალა მხოლოდ Premium წევრებს ხელმისაწვდომია.',
  },
  footer: {
    modules: 'კატეგორიები',
    chat: 'საუბარი',
    account: 'ანგარიში',
    info: 'ინფორმაცია',
  },
};

export function getCommunityDict(_locale: Locale): CommunityDict {
  return ka;
}
