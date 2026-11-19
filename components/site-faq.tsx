const faqItems = [
  {
    question: "Can I register just to leave feedback?",
    answer:
      "Yes. A free community profile lets you react to and comment on projects. It gives you no access to admin tools.",
  },
  {
    question: "How do I unsubscribe from the newsletter?",
    answer:
      "Every email has an unsubscribe link. It opens a page that shows your address. Unsubscribe with one click or change individual topics, no login needed.",
  },
  {
    question: "Who reads my message?",
    answer:
      "Messages from the contact form go straight to my inbox, and I answer them myself by email.",
  },
  {
    question: "Do you send marketing emails after I unsubscribe?",
    answer: "No. After you unsubscribe, you get no more newsletters unless you sign up again.",
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display">Questions and answers</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
              Short answers about community profiles, the newsletter and contact.
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
