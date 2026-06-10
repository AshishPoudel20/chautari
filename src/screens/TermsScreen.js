import React from 'react';
import { DocScreen, DocSection, DocParagraph } from '../components/DocScreen';

// Terms & Conditions — clearly-marked sample copy for the prototype.
export default function TermsScreen() {
  return (
    <DocScreen sample>
      <DocSection heading="1. About these terms">
        <DocParagraph>
          These sample Terms & Conditions describe how Chautari would govern use of the app. They are placeholder text for a prototype and are not a binding legal agreement.
        </DocParagraph>
      </DocSection>
      <DocSection heading="2. Community guidelines">
        <DocParagraph>
          Chautari is a community for sharing helpful, good-faith information about life in Australia. You agree to be respectful, avoid harassment or hate speech, and not post spam, scams, or misleading content.
        </DocParagraph>
      </DocSection>
      <DocSection heading="3. Not professional advice">
        <DocParagraph>
          Answers on Chautari — including those from verified experts — are general information, not formal migration, financial, medical or legal advice. Always confirm important decisions with a qualified professional who knows your circumstances.
        </DocParagraph>
      </DocSection>
      <DocSection heading="4. Verified experts">
        <DocParagraph>
          Verified badges indicate that a member submitted credentials for review. Verification is not an endorsement or guarantee. Experts must not use the platform purely for promotion and are subject to posting limits.
        </DocParagraph>
      </DocSection>
      <DocSection heading="5. Your content">
        <DocParagraph>
          You retain ownership of what you post but grant Chautari a licence to display it within the app. You are responsible for what you share, including when posting anonymously.
        </DocParagraph>
      </DocSection>
      <DocSection heading="6. Accounts and deletion">
        <DocParagraph>
          Accounts are tied to a verified phone number. You may delete your account at any time from Settings; deletion is permanent.
        </DocParagraph>
      </DocSection>
    </DocScreen>
  );
}
