# Premium სისტემა (არქივი)

> **სტატუსი:** გათიშულია (2026-06). აპლიკაცია სრულიად უფასოა — ქულების დაგროვება და ჩუქება მუშაობს.
> **გააქტიურება:** `.env` → `PREMIUM_ENABLED=true` + redeploy. დეტალები ქვემოთ.

---

## ბიზნეს ლოგიკა

| პარამეტრი | მნიშვნელობა |
|-----------|-------------|
| ფასი (ქულებით) | **500 ქულა / 30 დღე** |
| Stripe | გამოწერა `STRIPE_PRICE_ID`-ით |
| უფასო პაკეტი | რეგისტრაციის შემდეგ, 0 ქულა |

### Premium უპირატესობები (perks)

1. ყველა სტატიისა და შეზღუდული ისტორიის ნახვა
2. LIVE ჩათი და პირადი მიმოწერა
3. ვერიფიკაცია და პროფილის ფოტო
4. ქულების ჩუქება სხვა წევრებს
5. დამატებითი ფოტოების ატვირთვა
6. რეკლამის გარეშე და Premium სტატუსი

### უფასო პაკეტი (freePerks)

- ისტორიებისა და პოსტების დამატება
- ძველი სტატიების ნახვა
- საჯარო კომენტარები

### უფასო პაკეტში დაბლოკილი (lockedPerks)

- ახალი და შეზღუდული სტატიები
- LIVE ჩათი
- პირადი წერილები
- პროფილის ფოტოები
- რეკლამა ჩანს

---

## ქულების სისტემა

| მოქმედება | ქულები | PointAction enum |
|-----------|--------|------------------|
| ისტორიის დამატება | +50 | `POST_PUBLISHED` |
| ისტორიის დარეპორტება | +10 | `POST_REPORTED` |
| კომენტარი მიღებული | +2 | `COMMENT_RECEIVED` |
| პოსტის upvote | +1 | `POST_UPVOTED` |
| კომენტარის upvote | +1 | `COMMENT_UPVOTED` |
| Premium-ის ყიდვა | −500 | `PREMIUM_REDEEM` |

**რჩება უფასო რეჟიმში:** ქულების დაგროვება, რეიტინგი (`/leaderboard/`), ქულების ჩუქება.

---

## Premium-ით დაცული ფუნქციები (როცა ჩართულია)

| ფუნქცია | ფაილი | ლოგიკა |
|---------|-------|--------|
| შეზღუდული ისტორიები | `lib/community/premium.ts` → `canViewPremiumContent()` | `post.isPremium === true` |
| კატეგორია `restricted-stories` | `lib/community/categories.ts` | `isPremiumOnly: true` |
| LIVE ჩათი | `app/[locale]/chat/page.tsx` | `user.isPremium` |
| პირადი წერილები | `app/[locale]/messages/page.tsx` | `user.isPremium` |
| ჩათის API | `lib/community/actions.ts` → `sendChatMessage` | `roomId === 'live'` ან `recipientId` |
| Messages API | `app/api/community/messages/route.ts` | premium check |
| Premium პოსტის checkbox | `components/community/SubmitPostForm.tsx` | `isPremium` field |
| Stripe გადახდა | `app/api/community/stripe/checkout/route.ts` | subscription checkout |
| Stripe webhook | `app/api/community/stripe/webhook/route.ts` | `checkout.session.completed`, `customer.subscription.deleted` |
| ქულებით გააქტიურება | `lib/community/actions.ts` → `redeemPremiumWithPoints()` | 500 ქულა → `isPremium: true` |

---

## მონაცემთა ბაზა (Prisma)

```prisma
model User {
  isPremium            Boolean   @default(false)
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  points               Int       @default(0)
}

model Post {
  isPremium  Boolean  @default(false)
}

enum PointAction {
  PREMIUM_REDEEM
  // ...
}
```

**შენიშვნა:** ველები DB-ში დარჩა — გააქტიურებისას migration არ სჭირდება.

---

## გარემოს ცვლადები (Stripe)

```env
PREMIUM_ENABLED=false          # true → Premium ჩართული
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## UI / მარშრუტები

| URL | დანიშნულება |
|-----|-------------|
| `/user/subscription/` | Premium გამოწერის გვერდი (უფასო რეჟიმში — „სრულიად უფასო“) |
| `/premium/` | redirect → `/user/subscription/` |
| `/points/` | ქულების წესები |

### კომპონენტები

- `components/community/PremiumCheckoutButton.tsx` — Stripe checkout
- `components/community/RedeemPremiumButton.tsx` — ქულებით გააქტიურება
- `components/community/PremiumLockedBody.tsx` — დაბლოკილი კონტენტის UI
- `components/community/ForumSidebarExtras.tsx` — sidebar ბანერი

### i18n (ქართული ტექსტები)

ყველა Premium UI ტექსტი: `lib/i18n/community-dict.ts` → `premium`, `points.premiumTier`, `home.premiumBanner*`, `chat.premiumRequired`, `messages.premiumRequired`, `post.premiumPreview`, `submit.premiumOnly`.

---

## გააქტიურების ჩეკლისტი

1. [ ] Vercel/local `.env` → `PREMIUM_ENABLED=true`
2. [ ] Stripe env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
3. [ ] Stripe webhook URL: `https://your-domain/api/community/stripe/webhook/`
4. [ ] Redeploy
5. [ ] ტესტი: `/user/subscription/` — checkout + ქულებით redeem
6. [ ] ტესტი: non-premium user ვერ ხედავს `isPremium` პოსტს
7. [ ] ტესტი: LIVE ჩათი და DM premium-ის გარეშე დაბლოკილია

---

## Admin რეფერენსი

ბრაუზერში: `/admin/premium/` (login საჭიროა)

---

## ისტორია

- **2026-06:** Premium გათიშულია; აპლიკაცია სრულიად უფასო. ქულების სისტემა და ჩუქება რჩება.
