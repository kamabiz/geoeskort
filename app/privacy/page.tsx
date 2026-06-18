import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'კონფიდენციალურობა',
  description: 'GEOESKORT კონფიდენციალურობის პოლიტიკა.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <main className="container static-page">
      <h1>კონფიდენციალურობა</h1>
      <p>GEOESKORT არ აგროვებს პერსონალურ მონაცემებს პროფილებისთვის — ჩვენ არ ვართ escort კატალოგი.</p>
      <p>
        ეს საიტი შეიძლება იყენებდეს სტანდარტულ ანალიტიკას (მონაცემები ანონიმური). პროფილების მონაცემები
        KAMA.BIZ-ის პოლიტიკის ქვეშაა.
      </p>
      <p>
        კითხვებისთვის: <a href="mailto:kama.escorts@proton.me">kama.escorts@proton.me</a>
      </p>
    </main>
  );
}
