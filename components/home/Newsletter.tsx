/* Block 09 — newsletter. One field, one promise. UI only, no backend. */

import { NewsletterSignup } from "@/components/forms/NewsletterSignup";
import { Reveal } from "@/components/layout/Reveal";
import { SectionBlock } from "@/components/layout/SectionBlock";

export function Newsletter() {
  return (
    <SectionBlock id="mcd-09-newsletter" tone="darkest">
      <Reveal>
        <NewsletterSignup
          heading="New arrivals, first"
          promise="One email a fortnight, no more. New ranges, sale news and the odd colour story."
          cta="Sign me up"
        />
      </Reveal>
    </SectionBlock>
  );
}
