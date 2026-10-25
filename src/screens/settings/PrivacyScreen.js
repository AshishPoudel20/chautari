import React from 'react';
import { DocScreen, DocSection, DocParagraph } from '../../components/DocScreen';

// Privacy Policy — clearly-marked sample copy for the prototype.
export default function PrivacyScreen() {
  return (
    <DocScreen sample>
      <DocSection heading="Your privacy">
        <DocParagraph>
          This is sample Privacy Policy text for a prototype. Importantly: this build stores everything locally on your device and sends nothing to a server. There is no backend, no analytics, and no third-party data sharing.
        </DocParagraph>
      </DocSection>
      <DocSection heading="What a production app would collect">
        <DocParagraph>
          A live version would collect your phone number (for verification), the profile details you provide, and the content you post. It would not show your phone number to other members.
        </DocParagraph>
      </DocSection>
      <DocSection heading="Anonymous posts">
        <DocParagraph>
          When you post anonymously, your name, photo and suburb are hidden from other members. In a production system, anonymous posts could still be associated with your account internally for safety and moderation.
        </DocParagraph>
      </DocSection>
      <DocSection heading="Your controls">
        <DocParagraph>
          You can edit your profile, control what you share, and delete your account and its data at any time from Settings.
        </DocParagraph>
      </DocSection>
      <DocSection heading="This prototype">
        <DocParagraph>
          All data here is seeded mock content plus whatever you create during your session, persisted only in this app’s local storage. Deleting the account or clearing app storage removes it entirely.
        </DocParagraph>
      </DocSection>
    </DocScreen>
  );
}
