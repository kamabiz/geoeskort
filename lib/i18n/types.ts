export type Locale = 'ka';

export type Dictionary = {
  meta: {
    homeTitle: string;
    homeDescription: string;
    blogTitle: string;
    blogDescription: string;
    contactTitle: string;
    contactDescription: string;
    privacyTitle: string;
    privacyDescription: string;
    postNotFound: string;
  };
  ageNotice: string;
  nav: { home: string; blog: string; contact: string; menu: string; chat: string; messages: string; profile: string; submit: string };
  hero: {
    badge: string;
    titleBefore: string;
    titleEm: string;
    titleAfter: string;
    lead: string;
    ctaPrimary: string;
    ctaPrimaryCaps: string;
    ctaBlog: string;
  };
  links: {
    label: string;
    title: string;
    desc: string;
    featured: { title: string; desc: string };
    tbilisi: { title: string; desc: string };
    batumi: { title: string; desc: string };
    girls: { title: string; desc: string };
    escorts: { title: string; desc: string };
    independent: { title: string; desc: string };
  };
  blog: {
    label: string;
    latestTitle: string;
    latestTitleCaps: string;
    latestDesc: string;
    empty: string;
    emptyList: string;
    allPosts: string;
    readMore: string;
    pageTitle: string;
    pageDesc: string;
    back: string;
    cta: string;
    ctaBtn: string;
    categoriesTitle: string;
    categoryAll: string;
    categories: Record<
      'nightlife' | 'food' | 'travel' | 'culture' | 'dating',
      { label: string; desc: string }
    >;
  };
  promo: { title: string; desc: string; btn: string };
  footer: {
    tagline: string;
    geoeskort: string;
    blog: string;
    contact: string;
    privacy: string;
    legal: string;
    about: string;
    rules: string;
    points: string;
    premium: string;
  };
  contact: {
    title: string;
    lead: string;
    badge: string;
    form: {
      title: string;
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      subject: string;
      subjectPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      sending: string;
      successTitle: string;
      successBody: string;
      errorValidation: string;
      errorService: string;
    };
    aside: {
      emailTitle: string;
      emailDesc: string;
      topicsTitle: string;
      topics: string[];
      responseTitle: string;
      responseDesc: string;
    };
  };
  privacy: {
    title: string;
    p1: string;
    p2: string;
    p3: string;
  };
  notFound: { title: string; desc: string; home: string; blog: string };
};
