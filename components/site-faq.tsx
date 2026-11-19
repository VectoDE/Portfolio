const faqItems = [
  {
    question: "Can I register just to leave feedback?",
    answer:
      "Absolutely. Creating a free community profile unlocks reactions and comments on every project without exposing administrative tools.",
  },
  {
    question: "Where can I manage or cancel the newsletter?",
    answer:
      "Every email contains your personal unsubscribe link pointing to the /unsubscribe hub. Whenever you need a reminder, come back to this FAQ: open the link in the message to see your subscribed address, then either confirm the one-click unsubscribe or toggle individual topics and save—no login required.",
  },
  {
    question: "Who reads my message?",
    answer:
      "Messages from the contact form go straight to my inbox, and I answer them myself by email.",
  },
  {
    question: "Do you send marketing emails after I unsubscribe?",
    answer:
      "No. Once you confirm the unsubscribe action, all promotional communication stops immediately unless you resubscribe manually.",
  },
]

export function SiteFAQ() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display">
              Frequently asked questions
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
              Quick answers about community registration, newsletter controls, and getting in touch.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6">
          {faqItems.map((item) => (
            <div
              key={item.question}
              className="rounded-lg border border-border bg-background/80 p-6 text-left shadow-sm"
            >
              <h3 className="text-lg font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </section>
  )
}
