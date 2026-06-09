import { useState } from "react";

const faqCategories = [
  {
    category: "General Platform Information",
    questions: [
      {
        question: "What is Barterly?",
        answer:
          "Barterly is a skill exchange platform where users can trade knowledge and expertise without monetary transactions.",
      },
      {
        question: "Is Barterly free to use?",
        answer:
          "Yes. Barterly is completely free and focuses on exchanging skills instead of money.",
      },
    ],
  },
  {
    category: "Skill Exchange Process",
    questions: [
      {
        question: "How do I exchange skills?",
        answer:
          "Browse available skills, connect with users, and send barter requests to begin learning from each other.",
      },
      {
        question: "Can I offer more than one skill?",
        answer:
          "Yes. You can create and manage multiple skill listings from your account.",
      },
    ],
  },
  {
    category: "User Accounts & Profiles",
    questions: [
      {
        question: "Can I edit my profile later?",
        answer:
          "Yes. You can update your profile information, skills, and preferences anytime.",
      },
      {
        question: "How do I manage my skill listings?",
        answer:
          "All your posted skills can be viewed and managed from the My Skills section.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        question: "Is my information secure?",
        answer:
          "Barterly follows secure authentication practices and only stores necessary user information.",
      },
      {
        question: "Who can view my profile?",
        answer:
          "Your profile is visible to other users to facilitate skill exchanges and collaboration.",
      },
    ],
  },
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-2 border-black bg-white shadow-hard-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 font-bold uppercase text-left hover:bg-primary transition-colors"
      >
        <span>{question}</span>

        <span className="material-symbols-outlined">
          {isOpen ? "remove" : "add"}
        </span>
      </button>

      {isOpen && (
        <div className="border-t-2 border-black p-4 bg-background-light">
          <p className="text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background-light px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="bg-primary border-4 border-black shadow-hard p-8 mb-10">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-3">
            Frequently Asked Questions
          </h1>

          <p className="font-medium text-lg">
            Everything you need to know about Barterly and skill exchanges.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-10">
          {faqCategories.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
                {section.category}
              </h2>

              <div className="space-y-4">
                {section.questions.map((faq) => (
                  <FAQItem
                    key={faq.question}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
