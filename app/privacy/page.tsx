import type { Metadata } from 'next';
import { LegalLayout } from '../legal-layout';
export const metadata: Metadata = { title: 'Privacy Policy | ElderNight', description: 'How ElderNight handles account, game and usage information.' };
export default function PrivacyPolicy() {
  return <LegalLayout title="Privacy Policy">
    <p>This policy explains how ElderNight (the “Service”), available at <a href="https://www.eldernight.com">www.eldernight.com</a>, handles personal information when you create, play, save or share interactive story games. For privacy inquiries or details about the operator responsible for the Service, email <a href="mailto:elder@eldernight.com">elder@eldernight.com</a>.</p>
    <h2>Information we handle</h2>
    <ul>
      <li><strong>Account information:</strong> If you register or sign in, our authentication provider may process your email address, account identifier and information you choose to share using Google sign-in.</li>
      <li><strong>Stories and game data:</strong> We process games, scenes, choices, titles and other content that you create and save, along with publication status and shared-game links.</li>
      <li><strong>Technical information:</strong> Hosting and authentication services may process IP addresses, device or browser details, required cookies and security logs so the Service can work securely.</li>
      <li><strong>Support messages:</strong> We process the information you provide if you contact us.</li>
    </ul>
    <h2>How we use information</h2>
    <p>We use information to enable sign-in, save and restore your games, publish adventures, provide requested functionality, handle support requests and protect the Service against abuse.</p>
    <h2>Playing and sharing</h2>
    <p>You can play publicly shared games without an account. Saving and publishing your own games requires an account. If you publish a story, anyone with its sharing link can access the published content. Avoid adding sensitive personal information to published stories.</p>
    <h2>Service providers</h2>
    <p>ElderNight relies on third parties, including Clerk for authentication, Google when you use Google sign-in, and hosting and database providers to operate and store the Service. Their handling of data is also subject to their applicable terms and privacy notices.</p>
    <h2>Cookies and local storage</h2>
    <p>Account authentication uses cookies. ElderNight may use browser storage to remember local editing progress and preferences. Clearing site data may remove locally stored work or sign you out.</p>
    <h2>Retention and legal bases</h2>
    <p>Where UK data protection law applies, account and game processing is generally necessary to provide the service you request. Some security and support processing may rely on legitimate interests. Information is retained as needed to operate the Service, meet applicable legal requirements and resolve security or support issues. Unpublished or deleted information may remain in backups for a limited time.</p>
    <h2>Your choices and rights</h2>
    <p>Use the site's account and game controls to manage your work. You may also contact <a href="mailto:elder@eldernight.com">elder@eldernight.com</a> to ask about accessing, correcting or deleting personal information, objecting to certain processing, or exercising other rights available under applicable law. You may complain to the UK Information Commissioner's Office if you believe your data protection rights have been infringed.</p>
    <h2>Children</h2>
    <p>The Service is not intended for children to provide personal information without appropriate parental or guardian permission. Please contact us if you believe a child has submitted personal information improperly.</p>
    <h2>Updates</h2>
    <p>We may update this policy as the Service changes. The date at the top indicates the latest version.</p>
  </LegalLayout>;
}
