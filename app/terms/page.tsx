import type { Metadata } from 'next';
import { LegalLayout } from '../legal-layout';
export const metadata: Metadata = { title: 'Terms of Service | ElderNight', description: 'Terms for creating, playing and sharing adventures on ElderNight.' };
export default function TermsPage() {
  return <LegalLayout title="Terms of Service">
    <p>These terms govern your use of <a href="https://www.eldernight.com">ElderNight</a>, a website for creating, playing and sharing interactive adventures. By using the Service, you agree to these terms. If you have questions, email <a href="mailto:elder@eldernight.com">elder@eldernight.com</a>.</p>
    <h2>Using ElderNight</h2>
    <p>You may play publicly available adventures without an account. An account may be required to save, publish, edit or manage your own stories. Keep your account credentials secure and provide accurate details where required.</p>
    <h2>Stories you create</h2>
    <p>You retain ownership of the original content you create, subject to any third-party rights. You grant ElderNight a non-exclusive licence to store, process, display and share your content as necessary to provide the features you choose, including publishing stories via share links. You may stop sharing using available controls.</p>
    <h2>Acceptable use</h2>
    <p>Do not use the Service for unlawful material, harassment, exploitation, impersonation, infringement of others' rights, malicious code or attempts to compromise accounts or infrastructure. Do not upload content you lack permission to use. We may restrict access or remove material where necessary to protect users or the Service.</p>
    <h2>Shared games</h2>
    <p>Published adventures may be played by anyone with their sharing link. If you publish content, you are responsible for making sure it is appropriate to share. Features, link availability and stored drafts may change as the Service develops.</p>
    <h2>Availability</h2>
    <p>The Service is offered on an as-available basis. We work to keep it accessible but cannot promise uninterrupted operation, permanent storage of drafts or error-free gameplay. Keep copies of any work that matters to you.</p>
    <h2>Third-party services</h2>
    <p>Signing in and hosting may depend on external providers, including Clerk and Google. Their own terms may also apply when you use their services.</p>
    <h2>Liability and applicable law</h2>
    <p>Nothing in these terms excludes liability that cannot legally be excluded, or limits your statutory consumer rights. To the extent permitted by applicable law, ElderNight is not responsible for indirect losses arising from interruptions, unavailable content or misuse of the Service. These terms are governed by the laws of England and Wales, subject to mandatory protections that may apply where you live.</p>
    <h2>Changes and contact</h2>
    <p>We may update the Service and these terms from time to time. Continued use after revised terms are posted constitutes acceptance where permitted by law. Contact <a href="mailto:elder@eldernight.com">elder@eldernight.com</a> with questions.</p>
  </LegalLayout>;
}
